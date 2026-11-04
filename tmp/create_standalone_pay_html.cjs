const fs = require('fs');

const refHtml = fs.readFileSync('public/assets/aistudio/payment-page__1__faac945b.html', 'utf8');

// Let's modify the refHtml to handle dynamic parameters (order_id, amount, pay_type) and verification:
// 1. Inject script at bottom of refHtml to bind URL parameters and form submission
const dynamicScript = `
<script>
// Firebase Config
const firebaseConfig = {
  projectId: "vigilant-medium-cct7q",
  appId: "1:399290492442:web:3e0c2bd5255a6b176c13a3",
  apiKey: "AIzaSyAhOoVvZNq0ALiYSRR-OmTOjMDr1dZq3Mg",
  authDomain: "vigilant-medium-cct7q.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-fashionpoint-c79c3666-e185-4cd3-b96a-3545b7c91b7d",
  storageBucket: "vigilant-medium-cct7q.firebasestorage.app",
  messagingSenderId: "399290492442"
};

let db = null;
try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      const app = firebase.initializeApp(firebaseConfig);
      db = firebase.firestore(app, firebaseConfig.firestoreDatabaseId);
    } else {
      db = firebase.firestore();
    }
  }
} catch (err) {
  console.warn('Firebase init in pay.html:', err);
}

// Parse URL Parameters
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('order_id') || ('FP' + Math.floor(100000 + Math.random() * 900000));
const amountVal = urlParams.get('amount') || '60';
const payType = urlParams.get('pay_type') || 'advance';

document.addEventListener('DOMContentLoaded', () => {
  // Update Order ID in header
  const midEl = document.getElementById('mid');
  if (midEl) {
    midEl.textContent = '3342 0785 6120';
  }

  // Update Amount in summary
  const amtEl = document.getElementById('amt');
  if (amtEl) {
    amtEl.textContent = '৳' + amountVal;
  }

  // Inject Order ID badge if available
  const mmEl = document.querySelector('.mm');
  if (mmEl) {
    let orderBadge = document.getElementById('pay-order-badge');
    if (!orderBadge) {
      orderBadge = document.createElement('div');
      orderBadge.id = 'pay-order-badge';
      orderBadge.className = 'mx';
      orderBadge.style.marginLeft = 'auto';
      orderBadge.style.textAlign = 'right';
      orderBadge.innerHTML = '<small style="font-size:12px;color:var(--mut);">অর্ডার আইডি</small><b style="color:var(--pc);font-size:16px;">#' + orderId + '</b>';
      mmEl.appendChild(orderBadge);
    }
  }

  // Bind Bangla QR button if present
  const qrBtn = document.querySelector('button.qr');
  if (qrBtn) {
    qrBtn.onclick = () => {
      alert('বাংলা কিউআর (Bangla QR):\\nমার্চেন্ট নম্বর: 3342 0785 6120\\nযেকোনো মোবাইল ব্যাংকিং অ্যাপ (bKash/Nagad/Rocket/Upay/Cellfin) দিয়ে কিউআর স্ক্যান করে দ্রুত পেমেন্ট সম্পন্ন করতে পারবেন।');
    };
  }

  // Bind provider selection
  let selectedProvider = 'bkash';
  const mBtns = document.querySelectorAll('.m');
  mBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mBtns.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      selectedProvider = btn.getAttribute('data-k') || 'bkash';
    });
  });

  // Bind Form Submit
  const form = document.querySelector('form.fg') || document.querySelector('form');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const trxInput = form.querySelector('input[name="t"]') || form.querySelector('input[type="text"]');
      const phoneInput = form.querySelector('input[name="s"]');
      
      const trxId = trxInput ? trxInput.value.trim().toUpperCase() : '';
      const senderPhone = phoneInput ? phoneInput.value.trim() : '';

      if (!trxId || trxId.length < 5) {
        alert('অনুগ্রহ করে সঠিক Transaction ID (TrxID) প্রবেশ করান।');
        return;
      }

      const submitBtn = form.querySelector('button.cf') || form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'ভেরিফাই করা হচ্ছে...';
      }

      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderId,
            trx_id: trxId,
            amount: parseFloat(amountVal),
            provider: selectedProvider,
            phone: senderPhone
          })
        });
        const data = await res.json();
        
        // Update local order history
        const userOrders = JSON.parse(localStorage.getItem('fp_orders') || '[]');
        const targetOrder = userOrders.find(o => o.id === orderId);
        if (targetOrder) {
          targetOrder.status = 'PayBD Paid (TrxID: ' + trxId + ')';
          targetOrder.paybdTrx = trxId;
          targetOrder.paybdProvider = selectedProvider;
          localStorage.setItem('fp_orders', JSON.stringify(userOrders));
        }

        // Firestore sync
        if (db) {
          try {
            await db.collection('orders').doc(orderId).set({
              orderId: orderId,
              status: 'PayBD Verified',
              paybdTrx: trxId,
              provider: selectedProvider,
              amount: parseFloat(amountVal),
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          } catch(err) {
            console.warn('Firestore sync in pay.html:', err);
          }
        }

        alert('পেমেন্ট সফলভাবে সেভ করা হয়েছে! আপনাকে অর্ডার কনফার্মেশন পেজে নিয়ে যাওয়া হচ্ছে।');
        window.location.href = '/index.html#/order-success';
        return;
      } catch (err) {
        console.warn('Verify fetch error:', err);
      }

      alert('পেমেন্ট তথ্য গৃহীত হয়েছে! ধন্যবাদ।');
      window.location.href = '/index.html#/order-success';
    };
  }
});
</script>
`;

let standaloneHtml = refHtml;
if (standaloneHtml.includes('</body>')) {
  standaloneHtml = standaloneHtml.replace('</body>', dynamicScript + '\n</body>');
} else {
  standaloneHtml += dynamicScript;
}

// Add script tags for firebase compat inside head if not present
if (!standaloneHtml.includes('firebase-app-compat.js')) {
  const firebaseTags = `
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"></script>
  `;
  standaloneHtml = standaloneHtml.replace('</head>', firebaseTags + '\n</head>');
}

fs.writeFileSync('public/pay.html', standaloneHtml, 'utf8');
console.log("Created standalone /public/pay.html. Size:", standaloneHtml.length);
