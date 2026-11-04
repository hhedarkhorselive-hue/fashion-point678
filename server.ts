import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SMS_SECRET || 'change-me';
const DB_PATH = path.join(__dirname, 'trx.json');

app.use(express.json({ limit: '1mb' }));
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

  return res.json({ ok: true, amount: r.amount, phone: r.phone });
};

app.post('/verify', handleVerify);
app.post('/api/verify', handleVerify);

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
    const { id, status, amount, order_id, provider, trx_id, verified_by } = payload.data;
    
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
    return res.json({ ok: true, status: 'approved', order_id, trx_id });
  }

  return res.json({ ok: true, msg: 'Webhook event processed' });
};

import crypto from 'crypto';

app.post('/paybd-webhook', handlePaybdWebhook);
app.post('/api/paybd-webhook', handlePaybdWebhook);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, receivedCount: Object.keys(db.received).length, usedCount: Object.keys(db.used).length });
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

