/**
 * Fashion Point - Universal Firebase Control SDK & Realtime Auto-Tracker
 * Database ID: ai-studio-fashionpoint-c79c3666-e185-4cd3-b96a-3545b7c91b7d
 * Project ID: vigilant-medium-cct7q
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs,
  query,
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- 1. FIREBASE CONFIGURATION ---
export const firebaseConfig = {
  projectId: "vigilant-medium-cct7q",
  appId: "1:399290492442:web:3e0c2bd5255a6b176c13a3",
  apiKey: "AIzaSyAhOoVvZNq0ALiYSRR-OmTOjMDr1dZq3Mg",
  authDomain: "vigilant-medium-cct7q.firebaseapp.com",
  storageBucket: "vigilant-medium-cct7q.firebasestorage.app",
  messagingSenderId: "399290492442"
};

// --- 2. INITIALIZE FIREBASE & FIRESTORE ---
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-fashionpoint-c79c3666-e185-4cd3-b96a-3545b7c91b7d");

// --- 3. AUTO-TRACKER & REALTIME LISTENERS ---

/**
 * Realtime Listener for All Customer Orders
 * @param {Function} callback - Triggered instantly whenever an order is created or updated
 */
export function trackOrders(callback) {
  const ordersRef = collection(db, "orders");
  return onSnapshot(ordersRef, (snapshot) => {
    const orders = [];
    snapshot.forEach(docSnap => {
      orders.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort latest orders first
    orders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    callback(orders);
  });
}

/**
 * Realtime Listener for All Store Products
 * @param {Function} callback - Triggered instantly when products are added, updated, or removed
 */
export function trackProducts(callback) {
  const prodsRef = collection(db, "products");
  return onSnapshot(prodsRef, (snapshot) => {
    const products = [];
    snapshot.forEach(docSnap => {
      products.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(products);
  });
}

// --- 4. FULL CONTROL METHODS ---

/**
 * Update Order Status (e.g. 'paid', 'completed', 'cancelled')
 */
export async function setOrderStatus(orderId, status) {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, {
    status: status,
    updated_at: new Date().toISOString()
  });
  return { success: true, orderId, status };
}

/**
 * Add New Product to Store Catalog
 */
export async function addProduct(productData) {
  const prodId = productData.id || 'prod-' + Date.now();
  const prodRef = doc(db, "products", prodId);
  const payload = {
    title: productData.title,
    price: Number(productData.price),
    old_price: Number(productData.old_price || 0),
    image: productData.image,
    category: productData.category || 'General',
    in_stock: productData.in_stock !== false,
    created_at: new Date().toISOString()
  };
  await setDoc(prodRef, payload);
  return { success: true, id: prodId, payload };
}

/**
 * Update Existing Product
 */
export async function updateProduct(prodId, updates) {
  const prodRef = doc(db, "products", prodId);
  await updateDoc(prodRef, {
    ...updates,
    updated_at: new Date().toISOString()
  });
  return { success: true, id: prodId };
}

/**
 * Delete Product from Store Catalog
 */
export async function deleteProduct(prodId) {
  const prodRef = doc(db, "products", prodId);
  await deleteDoc(prodRef);
  return { success: true, id: prodId };
}

/**
 * Verify and Record bKash/Nagad Payment TrxID
 */
export async function recordPaymentTrx(orderId, trxId, provider = 'bkash', status = 'paid') {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, {
    trx_id: trxId,
    payment_method: provider,
    status: status,
    paid: true,
    paid_at: new Date().toISOString()
  });
  return { success: true, orderId, trxId, status };
}
