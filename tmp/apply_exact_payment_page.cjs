const fs = require('fs');

let appHtml = fs.readFileSync('public/assets/aistudio/fashion-point_6a561526.html', 'utf8');

// Helper provider names function
const helperFunctions = `
function getProvName(k) {
  const names = {
    bkash: 'bKash (বিকাশ)',
    nagad: 'Nagad (নগদ)',
    rocket: 'Rocket (রকেট)',
    upay: 'Upay (উপায়)',
    cellfin: 'Cellfin (সেলফিন)',
    mcash: 'mCash (এমক্যাশ)',
    pathao: 'Pathao Pay',
    qr: 'Bangla QR (বাংলা কিউআর)'
  };
  return names[k] || String(k).toUpperCase();
}

function selectPayProvider(provider) {
  selectedPaybdProvider = provider;
  document.querySelectorAll('.pay-m').forEach(el => {
    el.style.borderColor = '#d9e4f4';
    el.style.boxShadow = 'none';
    el.classList.remove('on');
  });
  const target = document.getElementById('pay-m-' + provider);
  if (target) {
    target.style.borderColor = '#2a80f5';
    target.style.boxShadow = '0 0 0 3px #2a80f526';
    target.classList.add('on');
  }

  const title = document.getElementById('pay-prov-title');
  if (title) title.textContent = getProvName(provider);

  const imgEl = document.getElementById('pay-prov-img');
  if (imgEl && typeof IMG_PAY !== 'undefined') {
    if (IMG_PAY[provider]) {
      imgEl.src = IMG_PAY[provider];
      imgEl.style.display = 'block';
    } else {
      imgEl.style.display = 'none';
    }
  }
}
`;

// Replace viewPaybdGateway function
const newViewPaybdGateway = `
function viewPaybdGateway() {
  const orderId = lastOrder ? lastOrder.id : ('FP' + Math.floor(100000 + Math.random() * 900000));
  const amount = lastOrder ? lastOrder.total : cart.reduce((s, i) => s + (getProd(i.id).pr * i.qty), 0) + (cart.reduce((s, i) => s + (getProd(i.id).pr * i.qty), 0) >= 1000 ? 0 : 60);

  return \`
  <div class="pay-wrap" style="max-width:520px;margin:0 auto;padding:16px;">
    <div style="margin-bottom:12px;">
      <a href="#/checkout" style="display:inline-flex;align-items:center;gap:6px;color:var(--mut);font-weight:600;font-size:14px;">
        \${getT('backBtn')}
      </a>
    </div>

    <header class="pay-mh" style="background:#fff;border:1px solid #d9e4f4;border-radius:16px;padding:14px 16px;margin-bottom:16px;">
      <div class="pay-mt" style="display:flex;align-items:center;gap:12px;">
        <img src="\${IMG_PAY.fp_logo}" alt="Fashion Point" style="height:52px;width:auto;max-width:46%;mix-blend-mode:multiply;flex-shrink:0;">
        <h1 style="font-family:'Hind Siliguri',Inter,sans-serif;font-size:22px;line-height:1.2;font-weight:700;margin-left:auto;text-align:right;color:#0b1d45;">
          \${currentLang === 'en' ? 'Fashion Point' : 'ফ্যাশন পয়েন্ট'}
        </h1>
      </div>
      <div class="pay-mm" style="display:flex;justify-content:flex-start;align-items:center;gap:12px;margin-top:12px;padding-top:12px;border-top:1px dashed #cfdcf0;">
        <div class="pay-pb" style="width:62px;height:62px;flex-shrink:0;border:2px solid #0b1d4a;border-radius:50%;background:#fff;display:grid;place-items:center;overflow:hidden;">
          <img src="\${IMG_PAY.paybd}" alt="PayBD" style="width:44px;height:auto;mix-blend-mode:multiply;">
        </div>
        <div class="pay-mx" style="min-width:0;">
          <small style="display:block;font-size:12.5px;color:#6b7b9c;margin-bottom:1px;">Merchant Account</small>
          <b style="display:block;white-space:nowrap;font-size:19px;letter-spacing:1px;color:#0b1d45;">3342 0785 6120</b>
        </div>
        <div style="margin-left:auto;text-align:right;">
          <small style="display:block;font-size:12.5px;color:#6b7b9c;">\${getT('orderIdLabel')}</small>
          <b style="display:block;font-size:16px;color:#2a80f5;letter-spacing:0.5px;">#\${orderId}</b>
        </div>
      </div>
    </header>

    <div class="pay-sum" style="background:#eef4fd;border-radius:14px;padding:18px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px;">
      <div>
        <small style="display:block;color:#6b7b9c;font-size:14px;margin-bottom:2px;">\${getT('totalPayable')}</small>
        <div class="pay-amt" style="font-size:32px;font-weight:800;color:#0b1d45;letter-spacing:-0.5px;">\${tk(amount)}</div>
      </div>
      <button class="pay-qr-btn" onclick="showBanglaQR()" style="display:flex;align-items:center;justify-content:center;height:52px;padding:6px 14px;border:1px solid #c6d6ee;border-radius:10px;background:#f5f9ff;cursor:pointer;">
        <img src="\${IMG_PAY.qr}" alt="Bangla QR" style="height:40px;mix-blend-mode:multiply;">
      </button>
    </div>

    <h2 style="font-size:18.5px;font-weight:600;margin:20px 2px 12px;color:#0b1d45;">
      \${currentLang === 'en' ? 'Pay with Mobile Banking' : 'মোবাইল ব্যাংকিং দিয়ে পেমেন্ট করুন'}
    </h2>

    <div class="pay-g" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">
      \${['bkash', 'nagad', 'rocket', 'upay', 'cellfin', 'mcash', 'pathao', 'qr'].map(k => {
        const isSel = selectedPaybdProvider === k;
        const img = IMG_PAY[k];
        return \`
          <div class="pay-m \${isSel ? 'on' : ''}" id="pay-m-\${k}" onclick="selectPayProvider('\${k}')" style="position:relative;height:76px;border:\${isSel ? '2px solid #2a80f5' : '1px solid #d9e4f4'};border-radius:13px;background:linear-gradient(180deg,#fcfdff,#f5f9ff);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:6px;box-shadow:\${isSel ? '0 0 0 3px #2a80f526' : 'none'};">
            \${img ? \`<img src="\${img}" alt="\${k}" style="mix-blend-mode:multiply;max-width:86%;max-height:48px;object-fit:contain;">\` : \`<b style="font-size:13px;color:#2a80f5;">Bangla QR</b>\`}
          </div>
        \`;
      }).join('')}
    </div>

    <div class="pay-ph" style="border-radius:16px;overflow:hidden;border:1px solid #d9e4f4;background:#fff;margin-top:14px;">
      <div class="pay-band" style="background:#2a80f5;padding:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;color:#fff;">
        <div>
          <div style="font-size:13px;opacity:0.92;">\${currentLang === 'en' ? 'Selected Method:' : 'নির্বাচিত মাধ্যমে পেমেন্ট:'}</div>
          <b id="pay-prov-title" style="font-size:22px;font-weight:800;">\${getProvName(selectedPaybdProvider)}</b>
        </div>
        <div style="background:#fff;border-radius:10px;padding:6px 12px;display:grid;place-items:center;min-width:90px;height:48px;">
          \${IMG_PAY[selectedPaybdProvider] ? \`<img id="pay-prov-img" src="\${IMG_PAY[selectedPaybdProvider]}" style="max-height:36px;max-width:80px;object-fit:contain;mix-blend-mode:multiply;">\` : \`<b style="color:#2a80f5;font-size:13px;">Bangla QR</b>\`}
        </div>
      </div>

      <div class="pay-bx" style="padding:16px;">
        <div class="pay-num" style="display:flex;justify-content:space-between;align-items:center;gap:10px;background:#f2f7ff;border:1.5px dashed #2a80f5;border-radius:12px;padding:12px 14px;margin:8px 0 14px;">
          <div>
            <small style="display:block;font-size:12.5px;color:#6b7b9c;">\${getT('merchantNumLabel')}</small>
            <b style="font-size:20px;letter-spacing:1px;color:#0b1d45;">3342 0785 6120</b>
          </div>
          <button class="pay-cp" onclick="copyMerchantNumber()" style="background:#2a80f5;color:#fff;border:0;padding:8px 14px;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;">
            \${getT('copyBtn')}
          </button>
        </div>

        <div style="font-weight:700;font-size:15px;color:#0b1d45;margin-bottom:10px;">
          \${currentLang === 'en' ? 'Payment Steps:' : 'পেমেন্ট নির্দেশিকা:'}
        </div>

        <ol class="pay-st" style="list-style:none;counter-reset:s;display:grid;gap:10px;margin-bottom:16px;">
          <li style="counter-increment:s;display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.4;color:#1d2342;">
            <span style="flex:0 0 24px;height:24px;border-radius:50%;background:#2a80f5;color:#fff;font-weight:700;font-size:12px;display:grid;place-items:center;">1</span>
            <span>\${getT('step1')}</span>
          </li>
          <li style="counter-increment:s;display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.4;color:#1d2342;">
            <span style="flex:0 0 24px;height:24px;border-radius:50%;background:#2a80f5;color:#fff;font-weight:700;font-size:12px;display:grid;place-items:center;">2</span>
            <span>\${getT('step2')} <b style="color:#2a80f5;background:#eef4fd;padding:1px 6px;border-radius:4px;">3342 0785 6120</b></span>
          </li>
          <li style="counter-increment:s;display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.4;color:#1d2342;">
            <span style="flex:0 0 24px;height:24px;border-radius:50%;background:#2a80f5;color:#fff;font-weight:700;font-size:12px;display:grid;place-items:center;">3</span>
            <span>\${getT('step3')} <b style="color:#e5195f;background:#fde8f0;padding:1px 6px;border-radius:4px;">\${tk(amount)}</b> \${getT('step3End')}</span>
          </li>
          <li style="counter-increment:s;display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.4;color:#1d2342;">
            <span style="flex:0 0 24px;height:24px;border-radius:50%;background:#2a80f5;color:#fff;font-weight:700;font-size:12px;display:grid;place-items:center;">4</span>
            <span>\${getT('step4')}</span>
          </li>
        </ol>

        <form onsubmit="confirmPaybdPayment(event)" style="margin-top:16px;display:grid;gap:12px;">
          <label style="display:block;font-size:14px;font-weight:700;color:#0b1d45;">
            \${getT('trxLabel')}
            <input type="text" class="in" id="paybd-final-trx" required placeholder="e.g. BJK7ABC12X" style="width:100%;border:1.5px solid #cfd9ec;border-radius:11px;padding:0 14px;height:48px;font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-top:6px;background:#fff;">
          </label>
          <button type="submit" class="pay-cf" style="width:100%;min-height:50px;border-radius:12px;background:#2a80f5;color:#fff;font-size:17px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;border:0;cursor:pointer;">
            \${getT('confirmPaymentBtn')}
          </button>
        </form>
      </div>
    </div>
  </div>
  \`;
}
`;

// Inject helper functions and replace viewPaybdGateway
if (!appHtml.includes('function getProvName')) {
  appHtml = appHtml.replace('let selectedPaybdProvider = \'bkash\';', 'let selectedPaybdProvider = \'bkash\';\n' + helperFunctions);
}

appHtml = appHtml.replace(/function viewPaybdGateway\(\) \{[\s\S]*?\n\}/, newViewPaybdGateway.trim());

fs.writeFileSync('public/assets/aistudio/fashion-point_6a561526.html', appHtml, 'utf8');
console.log("Updated viewPaybdGateway in fashion-point_6a561526.html");
