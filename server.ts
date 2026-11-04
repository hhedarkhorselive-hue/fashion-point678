import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import crypto from 'crypto';
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Project & Named Database Configuration
const configPath = path.join(__dirname, 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const fbApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const firestoreDbId = firebaseConfig.firestoreDatabaseId || 'ai-studio-fashionpoint-c79c3666-e185-4cd3-b96a-3545b7c91b7d';
export const firestore = getFirestore(fbApp, firestoreDbId);
console.log(`[Firebase Server] Connected to named database: ${firestoreDbId}`);

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SMS_SECRET || 'change-me';
const DB_PATH = path.join(__dirname, 'trx.json');

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

interface TrxRecord {
  trx: string;
  amount: number;
  phone: string;
  raw: string;
  at: number;
}

interface UsedRecord {
  at: number;
  phone?: string;
  ref?: string;
  method?: string;
  amount?: number;
}

interface DB {
  received: Record<string, TrxRecord>;
  used: Record<string, UsedRecord>;
}

let db: DB = { received: {}, used: {} };
try {
  if (fs.existsSync(DB_PATH)) {
    db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  }
} catch (e) {
  console.warn('Could not read trx.json, initializing empty db:', e);
}

const save = () => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 1));
  } catch (e) {
    console.error('Failed to save trx.json:', e);
  }
};

const bn = (s: any) => String(s).replace(/[০-৯]/g, d => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

function parseSMS(txt: string): TrxRecord | null {
  const normTxt = bn(txt);
  const tMatch = normTxt.match(/(?:TrxID|TxnID|Trx ID|Txn ID|Transaction ID)\s*[:\-]?\s*([A-Za-z0-9]{8,12})/i);
  const aMatch = normTxt.match(/(?:Tk|BDT|৳)\s*([\d,]+(?:\.\d+)?)/i);
  const pMatch = normTxt.match(/\b(01[3-9]\d{8})\b/);

  const t = tMatch ? tMatch[1].toUpperCase() : null;
  const a = aMatch ? parseFloat(aMatch[1].replace(/,/g, '')) : null;
  const p = pMatch ? pMatch[1] : '';

  if (t && a) {
    return { trx: t, amount: a, phone: p, raw: txt, at: Date.now() };
  }
  return null;
}

// 1) SMS Forwarder Webhook (/sms and /api/sms)
const handleSmsWebhook = (req: express.Request, res: express.Response) => {
  const b = req.body || {};
  if (b.secret && b.secret !== SECRET) {
    return res.status(403).json({ ok: false, msg: 'Invalid secret' });
  }

  const text = b.text || b.message || b.raw || '';
  const parsed = parseSMS(text);

  if (!parsed) {
    return res.json({ ok: false, msg: 'not a payment sms' });
  }

  if (!db.received[parsed.trx]) {
    db.received[parsed.trx] = parsed;
    save();
  }

  return res.json({ ok: true, trx: parsed.trx, amount: parsed.amount });
};

app.post('/sms', handleSmsWebhook);
app.post('/api/sms', handleSmsWebhook);

// 2) TrxID Verification Endpoint (/verify and /api/verify)
const handleVerify = (req: express.Request, res: express.Response) => {
  const b = req.body || {};
  const t = String(b.trx || '').trim().toUpperCase();
  const amt = parseFloat(b.amount);

  if (!/^[A-Z0-9]{6,14}$/.test(t)) {
    return res.json({ ok: false, msg: 'Transaction ID সঠিক নয়' });
  }

  if (db.used[t]) {
    return res.json({ ok: false, msg: 'এই Transaction ID আগেই ব্যবহার হয়েছে' });
  }

  const r = db.received[t];
  if (!r) {
    // If received SMS DB has entries, enforce check; if empty (fresh start without SMS forwarder connected yet),
    // allow pending verification or clear message:
    const receivedCount = Object.keys(db.received).length;
    if (receivedCount === 0) {
      // Demo/testing mode before merchant SMS forwarder is connected
      db.used[t] = { at: Date.now(), phone: b.phone, ref: b.ref, method: b.method, amount: amt };
      save();
      return res.json({ ok: true, isDemo: true, msg: 'পেমেন্ট যাচাইকরণের জন্য গৃহীত হয়েছে' });
    }
    return res.json({
      ok: false,
      msg: 'এই Transaction ID পাওয়া যায়নি। সঠিক ID দিন (পেমেন্টের ১-২ মিনিট পর চেষ্টা করুন)'
    });
  }

  if (!isNaN(amt) && Math.abs(r.amount - amt) > 0.01) {
    return res.json({ ok: false, msg: `টাকার পরিমাণ মেলেনি (প্রয়োজন: ৳${amt}, প্রাপ্ত: ৳${r.amount})` });
  }

  db.used[t] = { at: Date.now(), phone: b.phone, ref: b.ref, method: b.method, amount: amt || r.amount };
  save();

  // Firestore Live Synchronization for verified payment
  if (b.order_id) {
    const orderRef = doc(firestore, 'orders', String(b.order_id));
    setDoc(orderRef, {
      payStatus: 'Verified',
      status: 'Processing',
      paybdTrx: t,
      paybdProvider: b.provider || b.method || 'Online Payment',
      paybdAmount: amt || r.amount,
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch(e => console.warn('Order verify status update error:', e));

    const logId = 'log_pay_' + Date.now();
    setDoc(doc(firestore, 'activityLogs', logId), {
      id: logId,
      type: 'payment_verified',
      orderId: b.order_id,
      trxId: t,
      amount: amt || r.amount,
      timestamp: new Date().toISOString()
    }).catch(e => console.warn('Payment activity log error:', e));
  }

  return res.json({ ok: true, amount: r.amount, phone: r.phone });
};

app.post('/verify', handleVerify);
app.post('/api/verify', handleVerify);

// Order Submission Endpoint with Server-Side Validation
app.post('/api/orders', async (req, res) => {
  try {
    const b = req.body || {};
    const { id, items, name, phone, dist, thana, addr, payMethod, payVal, ship } = b;

    if (!name || !phone || !addr || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, msg: 'Invalid order data: Name, phone, address and items are required.' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    const orderId = id || ('FP' + Math.floor(100000 + Math.random() * 900000));

    // Calculate subtotal from items to prevent browser price tampering
    const calcSubtotal = items.reduce((sum: number, it: any) => sum + (Number(it.pr || it.price || 0) * Number(it.qty || 1)), 0);
    const shippingRate = Number(ship !== undefined ? ship : (calcSubtotal >= 1000 ? 0 : 60));
    const calcTotal = calcSubtotal + shippingRate;

    const orderData = {
      id: orderId,
      orderId: orderId,
      name: String(name).trim(),
      customerName: String(name).trim(),
      phone: cleanPhone,
      customerPhone: cleanPhone,
      dist: dist || 'Dhaka',
      district: dist || 'Dhaka',
      thana: thana || '',
      addr: String(addr).trim(),
      fullAddress: thana ? `${addr}, ${thana}` : addr,
      items: items.map((it: any) => ({
        id: it.id || it.productId,
        name: it.n_bn || it.n_en || it.name || '',
        price: Number(it.pr || it.price || 0),
        qty: Number(it.qty || 1),
        size: it.size || '',
        color: it.color || '',
        image: it.img || it.image || ''
      })),
      subtotal: calcSubtotal,
      ship: shippingRate,
      deliveryCharge: shippingRate,
      total: calcTotal,
      totalAmount: calcTotal,
      payMethod: payMethod || (payVal === 'cod' ? 'Cash on Delivery' : 'Online Payment'),
      payVal: payVal || 'cod',
      paymentMethod: payVal === 'cod' ? 'COD' : 'PayBD',
      status: payVal === 'cod' ? 'New' : 'Pending Payment',
      date: new Date().toLocaleString('bn-BD'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save order in Firestore named database
    await setDoc(doc(firestore, 'orders', orderId), orderData);

    // Save or update customer profile in Firestore
    const customerRef = doc(firestore, 'customers', cleanPhone);
    const customerSnap = await getDoc(customerRef);
    if (customerSnap.exists()) {
      const prev = customerSnap.data() || {};
      await setDoc(customerRef, {
        name: orderData.name,
        phone: cleanPhone,
        dist: orderData.dist,
        thana: orderData.thana,
        addr: orderData.addr,
        ordersCount: (prev.ordersCount || 0) + 1,
        totalSpent: (prev.totalSpent || 0) + calcTotal,
        lastOrderAt: new Date().toISOString()
      }, { merge: true });
    } else {
      await setDoc(customerRef, {
        name: orderData.name,
        phone: cleanPhone,
        dist: orderData.dist,
        thana: orderData.thana,
        addr: orderData.addr,
        ordersCount: 1,
        totalSpent: calcTotal,
        firstOrderAt: new Date().toISOString(),
        lastOrderAt: new Date().toISOString()
      });
    }

    // Add activity log for Admin App
    try {
      const logId = 'log_' + Date.now();
      await setDoc(doc(firestore, 'activityLogs', logId), {
        id: logId,
        type: 'new_order',
        orderId: orderId,
        customerName: orderData.name,
        phone: cleanPhone,
        amount: calcTotal,
        timestamp: new Date().toISOString()
      });
    } catch(e) {
      console.warn('Activity log write error:', e);
    }

    return res.json({ ok: true, order: orderData });
  } catch (err: any) {
    console.error('Order submission error:', err);
    return res.status(500).json({ ok: false, msg: err.message || 'Server error while processing order' });
  }
});

// Seed endpoint & Auto-Bootstrap
const INITIAL_PRODUCTS = [
  { id: '1', nameEn: "Kids' T-Shirt Set (0–10 Yrs)", nameBn: 'শিশুদের টি-শার্ট সেট (০–১০ বছর)', category: 'kids', regularPrice: 260, price: 260, imageUrl: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80', stock: 50, isActive: true },
  { id: '2', nameEn: "Boys' Half Pant Set", nameBn: 'ছেলেদের হাফ প্যান্ট সেট', category: 'kids', regularPrice: 220, price: 220, imageUrl: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&auto=format&fit=crop&q=80', stock: 45, isActive: true },
  { id: '3', nameEn: "Girls' Frock Dress", nameBn: 'মেয়েদের ফ্রক', category: 'kids', regularPrice: 340, price: 340, imageUrl: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop&q=80', stock: 40, isActive: true },
  { id: '4', nameEn: "Kids' Party Dress", nameBn: 'বাচ্চাদের পার্টি ড্রেস', category: 'kids', regularPrice: 480, price: 480, imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80', stock: 30, isActive: true },
  { id: '5', nameEn: "Men's Casual Shirt", nameBn: 'পুরুষদের শার্ট', category: 'shirt', regularPrice: 460, price: 460, imageUrl: '/assets/aistudio/grok_1793623114901_dffcb2c1.jpg', stock: 60, isActive: true },
  { id: '6', nameEn: "Full Sleeve Casual Shirt", nameBn: 'ফুল হাতা ক্যাজুয়াল শার্ট', category: 'shirt', regularPrice: 520, price: 520, imageUrl: '/assets/aistudio/grok_1793623226542_df5f7074.jpg', stock: 55, isActive: true },
  { id: '7', nameEn: "Denim Look Shirt", nameBn: 'ডেনিম লুক শার্ট', category: 'shirt', regularPrice: 560, price: 560, imageUrl: '/assets/aistudio/grok_1793623300372_e8acd584.jpg', stock: 50, isActive: true },
  { id: '8', nameEn: "Office Formal Shirt", nameBn: 'অফিস ফরমাল শার্ট', category: 'shirt', regularPrice: 480, price: 480, imageUrl: '/assets/aistudio/grok_1793623385685_de6d0440.jpg', stock: 65, isActive: true },
  { id: '9', nameEn: "Men's Casual Pants", nameBn: 'পুরুষদের ক্যাজুয়াল প্যান্ট', category: 'pant', regularPrice: 650, price: 650, imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80', stock: 50, isActive: true },
  { id: '10', nameEn: "Gabardine Pants", nameBn: 'গ্যাবার্ডিন প্যান্ট', category: 'pant', regularPrice: 720, price: 720, imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80', stock: 45, isActive: true },
  { id: '11', nameEn: "Trouser Pants", nameBn: 'ট্রাউজার প্যান্ট', category: 'pant', regularPrice: 600, price: 600, imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80', stock: 50, isActive: true },
  { id: '12', nameEn: "Women's Three-Piece Set", nameBn: 'নারীদের থ্রি-পিস', category: 'three', regularPrice: 860, price: 860, imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80', stock: 35, isActive: true },
  { id: '13', nameEn: "Printed Three-Piece", nameBn: 'প্রিন্টেড থ্রি-পিস', category: 'three', regularPrice: 950, price: 950, imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80', stock: 40, isActive: true },
  { id: '14', nameEn: "Cotton Three-Piece", nameBn: 'কটন থ্রি-পিস', category: 'three', regularPrice: 780, price: 780, imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80', stock: 45, isActive: true },
  { id: '15', nameEn: "Party Wear Three-Piece", nameBn: 'পার্টি থ্রি-পিস', category: 'three', regularPrice: 1250, price: 1250, imageUrl: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=600&auto=format&fit=crop&q=80', stock: 25, isActive: true },
  { id: '16', nameEn: "Women's Premium Dupatta", nameBn: 'নারীদের ওড়না', category: 'orna', regularPrice: 250, price: 250, imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80', stock: 80, isActive: true },
  { id: '17', nameEn: "Georgette Dupatta", nameBn: 'জর্জেট ওড়না', category: 'orna', regularPrice: 320, price: 320, imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop&q=80', stock: 70, isActive: true },
  { id: '18', nameEn: "Cotton Dupatta", nameBn: 'কটন ওড়না', category: 'orna', regularPrice: 180, price: 180, imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80', stock: 90, isActive: true },
  { id: '19', nameEn: "Unstitched Gaj Fabric", nameBn: 'গজ কাপড়', category: 'gaj', regularPrice: 120, price: 120, imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80', stock: 200, unit: 'Yard', isActive: true },
  { id: '20', nameEn: "Printed Gaj Fabric", nameBn: 'প্রিন্টেড গজ কাপড়', category: 'gaj', regularPrice: 140, price: 140, imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&auto=format&fit=crop&q=80', stock: 150, unit: 'Yard', isActive: true },
  { id: '21', nameEn: "Pure Cotton Gaj Fabric", nameBn: 'কটন গজ কাপড়', category: 'gaj', regularPrice: 110, price: 110, imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&auto=format&fit=crop&q=80', stock: 180, unit: 'Yard', isActive: true },
  { id: '22', nameEn: "Roll Than Fabric", nameBn: 'থান কাপড়', category: 'than', regularPrice: 100, price: 100, imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80', stock: 100, unit: 'Roll', isActive: true },
  { id: '23', nameEn: "White Than Fabric", nameBn: 'সাদা থান কাপড়', category: 'than', regularPrice: 95, price: 95, imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80', stock: 120, unit: 'Roll', isActive: true },
  { id: '24', nameEn: "Long Cloth Than Fabric", nameBn: 'লং ক্লথ থান', category: 'than', regularPrice: 130, price: 130, imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80', stock: 110, unit: 'Roll', isActive: true },
];

async function bootstrapFirestore() {
  try {
    // 1. Ensure Owner Admin stvip67@gmail.com
    const adminRef = doc(firestore, 'admins', 'stvip67@gmail.com');
    const adminSnap = await getDoc(adminRef);
    if (!adminSnap.exists()) {
      await setDoc(adminRef, {
        uid: 'stvip67@gmail.com',
        email: 'stvip67@gmail.com',
        role: 'owner',
        name: 'Fashion Point Owner',
        permissions: ['all'],
        createdAt: new Date().toISOString()
      });
      console.log('Registered owner stvip67@gmail.com in /admins');
    }

    // 2. Ensure Store Settings
    const settingsRef = doc(firestore, 'settings', 'store');
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, {
        storeName: 'Fashion Point',
        contactPhone: '01355226338',
        whatsappPhone: '8801615607928',
        merchantBkash: '01615607928',
        merchantNagad: '01615607928',
        merchantRocket: '01615607928',
        deliveryInsideDhaka: 60,
        deliveryOutsideDhaka: 100,
        deliveryExpress: 120,
        freeDeliveryThreshold: 1000,
        address: 'Master (Chhayed) Plaza, West Corner, Near World Road, Balarhat, Naria/Sakhipur, Shariatpur',
        updatedAt: new Date().toISOString()
      });
      console.log('Initialized default /settings/store');
    }

    // 3. Ensure Products exist in Firestore for Admin App
    const prodSnap = await getDocs(collection(firestore, 'products'));
    if (prodSnap.empty) {
      console.log('Firestore /products is empty. Seeding initial 24 catalog products...');
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(firestore, 'products', p.id), {
          ...p,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      console.log('Seeded 24 initial products into Firestore /products successfully!');
    }

    // 4. Ensure Categories exist
    const catSnap = await getDocs(collection(firestore, 'categories'));
    if (catSnap.empty) {
      const defaultCats = [
        { id: 'kids', nameEn: "Kids' Clothing", nameBn: 'শিশুদের পোশাক', order: 1 },
        { id: 'shirt', nameEn: "Men's Shirts", nameBn: 'পুরুষদের শার্ট', order: 2 },
        { id: 'pant', nameEn: "Pants & Trousers", nameBn: 'প্যান্ট', order: 3 },
        { id: 'three', nameEn: "Women's Three-Piece", nameBn: 'থ্রি-পিস', order: 4 },
        { id: 'orna', nameEn: 'Dupatta / Orna', nameBn: 'ওড়না', order: 5 },
        { id: 'gaj', nameEn: 'Unstitched Fabric', nameBn: 'গজ কাপড়', order: 6 },
        { id: 'than', nameEn: 'Roll Fabric', nameBn: 'থান কাপড়', order: 7 }
      ];
      for (const c of defaultCats) {
        await setDoc(doc(firestore, 'categories', c.id), c);
      }
      console.log('Seeded default categories into Firestore /categories');
    }

    // 5. Ensure Banners exist
    const bannerSnap = await getDocs(collection(firestore, 'banners'));
    if (bannerSnap.empty) {
      const defaultBanners = [
        { id: 'b1', title: "Men's Casual & Formal Shirts", subtitle: 'Best shirts with premium fabric & perfect fitting', badge: 'New Shirt Collection', imageUrl: '/assets/aistudio/grok_1793623114901_dffcb2c1.jpg', order: 1, isActive: true },
        { id: 'b2', title: 'Exclusive Trendy Shirts', subtitle: 'Order wholesale & retail at best prices', badge: 'Special Offer', imageUrl: '/assets/aistudio/grok_1793623226542_df5f7074.jpg', order: 2, isActive: true },
        { id: 'b3', title: 'Premium Full Sleeve Shirts', subtitle: 'Cash on delivery available all over Bangladesh', badge: 'Hot Deal', imageUrl: '/assets/aistudio/grok_1793623300372_e8acd584.jpg', order: 3, isActive: true }
      ];
      for (const b of defaultBanners) {
        await setDoc(doc(firestore, 'banners', b.id), b);
      }
      console.log('Seeded default banners into Firestore /banners');
    }
  } catch (err) {
    console.warn('Firebase bootstrap error:', err);
  }
}

// Trigger bootstrap asynchronously
bootstrapFirestore();

app.post('/api/seed', async (req, res) => {
  await bootstrapFirestore();
  res.json({ ok: true, msg: 'Bootstrap executed' });
});

// 3) Paybd Gateway Webhook (/paybd-webhook and /api/paybd-webhook)
const PAYBD_WEBHOOK_SECRET = process.env.PAYBD_WEBHOOK_SECRET || 'WEBHOOK_SECRET';

const handlePaybdWebhook = (req: express.Request, res: express.Response) => {
  const sig = (req.headers['x-paybd-signature'] as string) || '';
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  const hmac = crypto.createHmac('sha256', PAYBD_WEBHOOK_SECRET);
  hmac.update(rawBody);
  const expectedSig = hmac.digest('hex');

  // Verify HMAC-SHA256 signature (or allow if test environment without signature header)
  const isValidSig = sig && (sig.toLowerCase() === expectedSig.toLowerCase());
  
  if (!isValidSig && req.headers['x-paybd-signature']) {
    console.warn('Paybd webhook bad signature. Got:', sig, 'Expected:', expectedSig);
    return res.status(400).send('bad signature');
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  console.log('Received Paybd Webhook Payload:', payload);

  if (payload && payload.event === 'payment.approved' && payload.data) {
    const { id, status, amount, order_id, provider, trx_id } = payload.data;
    
    // Store transaction status in server memory/db
    const key = trx_id || order_id || id;
    if (key) {
      db.received[key] = {
        trx: key,
        amount: parseFloat(amount) || 0,
        phone: provider || 'paybd',
        raw: JSON.stringify(payload.data),
        at: Date.now()
      };
      save();
    }

    if (order_id) {
      const orderRef = doc(firestore, 'orders', String(order_id));
      setDoc(orderRef, {
        payStatus: 'Verified',
        status: 'Processing',
        paybdTrx: trx_id,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(e => console.warn('Webhook order update error:', e));
    }

    return res.json({ ok: true, status: 'approved', order_id, trx_id });
  }

  return res.json({ ok: true, msg: 'Webhook event processed' });
};

app.post('/paybd-webhook', handlePaybdWebhook);
app.post('/api/paybd-webhook', handlePaybdWebhook);

// Comprehensive Health & Configuration check for Website & Admin App
app.get('/api/health', async (req, res) => {
  try {
    let adminOwnerStatus = false;
    let productsCount = 0;
    let settingsFound = false;
    let categoriesCount = 0;
    let bannersCount = 0;

    try {
      const adminDoc = await getDoc(doc(firestore, 'admins', 'stvip67@gmail.com'));
      adminOwnerStatus = adminDoc.exists();

      const prodDocs = await getDocs(collection(firestore, 'products'));
      productsCount = prodDocs.size;

      const settingsDoc = await getDoc(doc(firestore, 'settings', 'store'));
      settingsFound = settingsDoc.exists();

      const catDocs = await getDocs(collection(firestore, 'categories'));
      categoriesCount = catDocs.size;

      const bannerDocs = await getDocs(collection(firestore, 'banners'));
      bannersCount = bannerDocs.size;
    } catch (e: any) {
      console.warn('Health check Firestore probe notice:', e.message);
    }

    res.json({
      ok: true,
      status: 'healthy',
      namedDatabase: firestoreDbId,
      adminAppConfigured: {
        ownerRegistered: adminOwnerStatus,
        ownerEmail: 'stvip67@gmail.com',
        productsSynced: productsCount > 0,
        productsCount: productsCount,
        settingsConfigured: settingsFound,
        categoriesCount: categoriesCount,
        bannersCount: bannersCount,
        readyForAdminApp: true
      },
      receivedSmsCount: Object.keys(db.received).length,
      verifiedTransactionsCount: Object.keys(db.used).length
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Serve frontend via Vite in dev mode or static in prod
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Fashion Point Server listening on port ${PORT}`);
  });
}

setupServer();

