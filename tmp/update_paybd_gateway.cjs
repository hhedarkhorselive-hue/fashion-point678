const fs = require('fs');

let appHtml = fs.readFileSync('public/assets/aistudio/fashion-point_6a561526.html', 'utf8');

const updatedPaybdGatewayFunc = `
function viewPaybdGateway() {
  const orderId = lastOrder ? lastOrder.id : ('FP' + Math.floor(100000 + Math.random() * 900000));
  const amount = lastOrder ? (lastOrder.payAmount || lastOrder.total) : 60;
  const payUrl = '/pay.html?order_id=' + orderId + '&amount=' + amount;
  setTimeout(() => {
    if (window.top) {
      window.top.location.href = payUrl;
    } else {
      window.location.href = payUrl;
    }
  }, 100);
  return '<div style="text-align:center;padding:50px;font-size:18px;font-weight:700;color:var(--navy);">' + (currentLang==='en'?'Redirecting to Standalone Payment Page...':'পেমেন্ট পেজে নিয়ে যাওয়া হচ্ছে...') + '</div>';
}
`;

appHtml = appHtml.replace(/function viewPaybdGateway\(\) \{[\s\S]*?\n\}/, updatedPaybdGatewayFunc.trim());

fs.writeFileSync('public/assets/aistudio/fashion-point_6a561526.html', appHtml, 'utf8');
console.log("Updated viewPaybdGateway to redirect out to /pay.html");
