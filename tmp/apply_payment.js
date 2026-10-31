const fs = require('fs');

const refHtml = fs.readFileSync('public/assets/aistudio/Fashion_Point___Payment_Page_472e2f6e.html', 'utf8');
let appHtml = fs.readFileSync('public/assets/aistudio/fashion-point_6a561526.html', 'utf8');

// Extract images
const mtImg = refHtml.match(/class="mt"><img src="([^"]+)"/)[1];
const pbImg = refHtml.match(/class="pb"><img src="([^"]+)"/)[1];
const qrImg = refHtml.match(/class="qr"[^>]*><img src="([^"]+)"/)[1];
const mImgs = [...refHtml.matchAll(/data-k="([^"]+)"[^>]*><img src="([^"]+)"/g)];

const imgs = {
  fp_logo: mtImg,
  paybd: pbImg,
  qr: qrImg
};
mImgs.forEach(m => { imgs[m[1]] = m[2]; });

// Replace or inject IMG_PAY
const imgsJs = "const IMG_PAY = " + JSON.stringify(imgs, null, 2) + ";";
appHtml = appHtml.replace(/const IMG_PAY = \{[\s\S]*?\};/, imgsJs);

// Config & helper functions
const configJs = `
const CFG = {
  merchantId: "334207856120",
  wa: "8801615607928",
  wallets: {
    bkash: "01615607928",
    nagad: "01615607928",
    rocket: "01615607928",
    upay: "01615607928",
    cellfin: "01615607928",
    mcash: "01615607928",
    pathao: "01615607928"
  }
};

const M = {
  bkash: { n: "bKash", c: "#E2136E", u: "*247#", o: "Payment" },
  nagad: { n: "Nagad", c: "#E8312F", u: "*167#", o: "Merchant Pay" },
  rocket: { n: "Rocket", c: "#8C3494", u: "*322#", o: "Merchant Pay" },
  upay: { n: "Upay", c: "#1E5FD8", u: "*268#", o: "Merchant Pay" },
  cellfin: { n: "Cellfin", c: "#139B4A", u: "", o: "Merchant Pay" },
  mcash: { n: "mCash", c: "#2E8B3E", u: "", o: "Merchant Pay" },
  pathao: { n: "Pathao Pay", c: "#1A5DE8", u: "", o: "Merchant Pay" }
};

const CP = \`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>\`;
const CHECK_SVG = \`<svg class="ch" width="22" height="22" viewBox="0 0 24 24" fill="#2a80f5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>\`;

let selPayMethod = "bkash";

function fmt(s){return String(s).replace(/(\\d{4})(?=\\d)/g,"$1 ")}
function junk(t){if(/^(.)\\1+$/.test(t))return true;if(/^\\d+$/.test(t)&&("0123456789012".indexOf(t)>-1||"9876543210987".indexOf(t)>-1))return true;if(/(TEST|FAKE|DEMO|TRXID|XXXX|ABCD|QWER)/.test(t))return true;if(new Set(t.split("")).size<4)return true;if(!/[A-Z]/.test(t)&&!/\\d/.test(t))return true;return false}
function steps(k, amt, refName){
  var m=M[k], a=[];
  a.push("<b>"+m.n+" অ্যাপ</b> খুলে লগইন করুন");
  a.push("<b>Send Money</b> (সেন্ড মানি) এ চাপুন");
  a.push("ওপরের কপি করা নম্বরটি <b>পেস্ট</b> করুন");
  a.push("টাকা দিন: <b>৳"+amt.toFixed(2)+"</b>"+(refName?" · রেফারেন্স: <b>"+refName+"</b>":""));
  a.push("PIN দিয়ে বা বাটন চেপে ধরে কনফার্ম করুন");
  a.push("রিসিপ্টের <b>TrxID</b> কপি করে নিচে বসান");
  return '<ol class="st">'+a.map(function(x){return "<li><span>"+x+"</span></li>"}).join("")+'</ol>';
}
function formPay(k){
  return '<form id="pf" class="fg" novalidate><input type="hidden" name="wallet" value="'+(M[k]?M[k].n:"Bangla QR")+'"><label>যে নম্বর থেকে পাঠিয়েছেন<input class="in" name="s" inputmode="numeric" autocomplete="tel" maxlength="11" placeholder="01XXXXXXXXX" value="'+(user?user.phone:"")+'"></label><label>Transaction ID (TrxID)<input class="in" name="t" autocapitalize="characters" autocomplete="off" spellcheck="false" maxlength="14" placeholder="যেমন: 8N7A6D5EE4" style="text-transform:uppercase"></label><div class="err" id="pf-err" role="alert" style="display:none"></div><button class="cf" id="pf-submit-btn" type="submit">পেমেন্ট কনফার্ম করুন</button></form>';
}
function copyText(v, msg){
  const d = String(v).replace(/\\s/g, '');
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(d).then(()=>toast(msg), ()=>fallbackCopy(d, msg));
  } else {
    fallbackCopy(d, msg);
  }
}
function fallbackCopy(d, msg){
  const i = document.createElement('input');
  i.value = d;
  document.body.appendChild(i);
  i.select();
  try { document.execCommand('copy'); toast(msg); } catch(e){ toast(d); }
  i.remove();
}
`;

if (!appHtml.includes("let selPayMethod")) {
  appHtml = appHtml.replace(imgsJs, imgsJs + "\n" + configJs);
}

// Replace T.payment and T["payment-done"]
const oldPaymentRegex = /payment:a=>\{[\s\S]*?\},\s*'payment-done':\(\)=>\{[\s\S]*?\},/;

const newPaymentCode = `payment: a => {
  const p = st.get('pendingOrder');
  const s = p ? p.subtotal : cart.reduce((acc, c) => acc + getProd(c.id).pr * c.qty, 0);
  const d = p ? p.ship : ship(s);
  const isFull = p ? (p.payMethod === 'অনলাইন পেমেন্ট (ফুল)') : false;
  const payAmount = isFull ? (s + d) : (d || 60);

  const selKey = a[0] || '';

  if (!selKey) {
    return \`<div class="pg" style="max-width:520px;margin:0 auto;padding-top:10px">
      <header class="mh">
        <div class="mt"><img src="\${IMG_PAY.fp_logo}" alt="ফ্যাশন point"><h1>ফ্যাশন point</h1></div>
        <div class="mm">
          <span class="pb"><img src="\${IMG_PAY.paybd}" alt="PayBD"></span>
          <div class="mx"><small>Merchant Account</small><b id="mid">\${fmt(CFG.merchantId)}</b></div>
          <button class="cp" style="margin-left:auto" data-cpm>\${CP} কপি</button>
        </div>
      </header>
      <div class="sum">
        <div><small>You are paying</small><div class="amt"><span id="amt">৳\${payAmount.toFixed(2)}</span></div></div>
        <button class="qr" data-go="qr" aria-label="Pay with Bangla QR"><img src="\${IMG_PAY.qr}" alt="Bangla QR"></button>
      </div>
      <h2>Pay with Mobile Banking</h2>
      <div class="g">
        \${Object.keys(M).map(k => \`<button class="m \${selPayMethod==k?'on':''}" data-k="\${k}" aria-label="\${M[k].n}"><img src="\${IMG_PAY[k]}" alt="\${M[k].n}">\${selPayMethod==k?CHECK_SVG:''}</button>\`).join('')}
      </div>
      <button class="pay" id="pay-btn">Pay ৳\${payAmount.toFixed(2)}</button>
      <div class="pw">Secured by <img src="\${IMG_PAY.paybd}" style="height:20px;mix-blend-mode:multiply" alt="PayBD"> <b>Pay<span>BD</span></b></div>
    </div>\`;
  }

  if (selKey === 'qr') {
    return \`<div class="pg" style="max-width:520px;margin:0 auto;padding-top:10px">
      <button class="back" data-go="home">← পেছনে যান</button>
      <div class="ph">
        <div class="band" style="background:#16793a">
          <div>পরিশোধযোগ্য টাকা<b>৳\${payAmount.toFixed(2)}</b></div>
          <div class="lg"><img src="\${IMG_PAY.qr}" alt="Bangla QR"></div>
        </div>
        <div class="bx">
          <div class="qrbox"><img src="\${IMG_PAY.qr}" alt="Bangla QR কোড"></div>
          <ol class="st" style="--pc:#16793a">
            <li><span>মোবাইল ব্যাংকিং অ্যাপে <b>Scan QR</b> খুলুন</span></li>
            <li><span>QR স্ক্যান করে <b>৳\${payAmount.toFixed(2)}</b> কনফার্ম করুন</span></li>
            <li><span>রিসিপ্টের <b>TrxID</b> কপি করে নিচে বসান</span></li>
          </ol>
          \${formPay('qr')}
        </div>
      </div>
    </div>\`;
  }

  const m = M[selKey];
  if (!m) return T.payment([]);

  return \`<div class="pg" style="max-width:520px;margin:0 auto;padding-top:10px">
    <button class="back" data-go="home">← পেছনে যান</button>
    <div class="ph" style="--pc:\${m.c}">
      <div class="band">
        <div>পরিশোধযোগ্য টাকা<b>৳\${payAmount.toFixed(2)}</b></div>
        <div class="lg"><img src="\${IMG_PAY[selKey]}" alt="\${m.n}"></div>
      </div>
      <div class="bx">
        <div class="num">
          <div><small>\${m.n} নম্বর (Send Money করুন)</small><b>\${CFG.wallets[selKey]}</b></div>
          <button class="cp" data-copy="\${CFG.wallets[selKey]}">\${CP} কপি</button>
        </div>
        \${steps(selKey, payAmount, p?p.name:'')}
        \${formPay(selKey)}
      </div>
    </div>
  </div>\`;
},
'payment-done': () => {
  const o = orders[0] || st.get('lastOrder', null);
  if (!o) { location.hash = '#/'; route(); return ''; }
  const wm = encodeURIComponent(\`পেমেন্ট কনফার্মেশন\\nমার্চেন্ট: ফ্যাশন পয়েন্ট (\${fmt(CFG.merchantId)})\\nমাধ্যম: \${o.payMethod}\\nটাকা: ৳\${o.paidAmount}\\nTrxID: \${o.trxId||'-'}\\nপ্রেরকের নম্বর: \${o.senderPhone||'-'}\`);

  return \`<div class="pg" style="max-width:520px;margin:0 auto;padding-top:10px">
    <div class="ok">
      <div class="tick"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>
      <h1>পেমেন্ট তথ্য জমা হয়েছে</h1>
      <p>আমরা TrxID যাচাই করে আপনার অর্ডার নিশ্চিত করব।</p>
    </div>
    <div class="rc">
      <div><span>মার্চেন্ট</span><b>ফ্যাশন পয়েন্ট</b></div>
      <div><span>মাধ্যম</span><b>\${o.payMethod}</b></div>
      <div><span>টাকা</span><b>৳\${o.paidAmount}</b></div>
      <div><span>TrxID</span><b>\${o.trxId||'-'}</b></div>
      <div><span>প্রেরকের নম্বর</span><b>\${o.senderPhone||'-'}</b></div>
      <div><span>সময়</span><b>\${o.date}</b></div>
    </div>
    <a class="lk wa" target="_blank" rel="noopener" href="https://wa.me/\${CFG.wa}?text=\${wm}">WhatsApp-এ নিশ্চিত করুন</a>
    <a class="lk ol" href="#/">হোমে ফিরুন</a>
  </div>\`;
},
qr: () => T.payment(['qr']),`;

appHtml = appHtml.replace(oldPaymentRegex, newPaymentCode);

// Update processSubmit for pf form
const oldPfRegex = /if\(f\.id=='pf'\)\{[\s\S]*?\n  \}/;

const newPfCode = `if(f.id=='pf' || f.id=='f'){
    const errBox=$('#pf-err') || $('#er');
    const showPfErr=msg=>{if(errBox){errBox.textContent=msg;errBox.style.display='block'}toast(msg)};
    if(errBox)errBox.style.display='none';

    let senderPh=(f.s?f.s.value:(f.sender?f.sender.value:'')).replace(/\\D/g,'');
    if(senderPh.length===13&&senderPh.startsWith('8801'))senderPh=senderPh.slice(2);
    else if(senderPh.length===12&&senderPh.startsWith('880'))senderPh=senderPh.slice(2);
    else if(senderPh.length===10&&senderPh.startsWith('1'))senderPh='0'+senderPh;

    if(!/^01[3-9]\\d{8}$/.test(senderPh)){showPfErr('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');(f.s||f.sender)?.focus();return}
    const trxId = (f.t?f.t.value:(f.trx?f.trx.value:'')).trim().toUpperCase();
    if(!trxId || trxId.length < 8 || trxId.length > 14 || !/^[A-Z0-9]+$/.test(trxId)){showPfErr('Transaction ID ৮ থেকে ১০ অক্ষরের হতে হবে (ইংরেজি বড় হাতের অক্ষর ও সংখ্যা)');(f.t||f.trx)?.focus();return}

    if(junk(trxId)){showPfErr('এটি সঠিক Transaction ID নয়। রিসিপ্ট বা SMS থেকে হুবহু কপি করুন');(f.t||f.trx)?.focus();return}

    const usedTrx = st.get('trx', []);
    if(usedTrx.some(x=>x.t==trxId)){showPfErr('এই Transaction ID আগেই ব্যবহার হয়েছে। একই ID দ্বিতীয়বার গ্রহণযোগ্য নয়');(f.t||f.trx)?.focus();return}

    if(isSubmittingOrder)return;
    isSubmittingOrder=true;
    const submitBtn=$('#pf-submit-btn') || f.querySelector('button[type=submit]');
    if(submitBtn){submitBtn.disabled=true;submitBtn.textContent='পেমেন্ট প্রসেস হচ্ছে...'}

    const p = st.get('pendingOrder') || {};
    const sVal = p.subtotal || cart.reduce((a,c)=>a+getProd(c.id).pr*c.qty,0);
    const dVal = p.ship !== undefined ? p.ship : ship(sVal);
    const isFull = p.payMethod === 'অনলাইন পেমেন্ট (ফুল)';
    const paid = isFull ? (sVal + dVal) : (dVal || 60);
    const due = (sVal + dVal) - paid;
    const walletName = (f.wallet?f.wallet.value:'') || (M[selPayMethod]?M[selPayMethod].n:'মোবাইল ব্যাংকিং');

    const verifyPay = async () => {
      try {
        const res = await fetch('/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trx: trxId,
            amount: paid,
            phone: senderPh,
            method: walletName,
            ref: p.name || 'Order'
          })
        });
        const resData = await res.json();
        if (!resData.ok) {
          isSubmittingOrder = false;
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'পেমেন্ট কনফার্ম করুন'; }
          showPfErr(resData.msg || 'Transaction ID ভেরিফাই করা যায়নি');
          return false;
        }
        return true;
      } catch (err) {
        console.warn('Verify API fallback:', err);
        return true;
      }
    };

    verifyPay().then(ok => {
      if (!ok) return;

      const dateStr = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const o = {
        id: String(Date.now()).slice(-7),
        items: p.items && p.items.length ? p.items : cart.slice(),
        subtotal: sVal,
        ship: dVal,
        total: sVal + dVal,
        paidAmount: paid,
        dueAmount: due,
        payReason: isFull ? 'ফুল পেমেন্ট (অনলাইন)' : 'ডেলিভারি চার্জ (অগ্রিম)',
        payMethod: walletName,
        senderPhone: senderPh,
        trxId: trxId,
        name: p.name || (user?user.name:'গ্রাহক'),
        phone: p.phone || (user?user.phone:''),
        addr: p.addr || '',
        dist: p.dist || 'শরীয়তপুর',
        status: 'পেমেন্ট পর্যালোচনায়',
        date: dateStr
      };

      usedTrx.unshift({ t: trxId, s: senderPh, a: paid, m: walletName, d: dateStr });
      st.set('trx', usedTrx);

      orders.unshift(o);
      st.set('lastOrder', o);
      save();

      syncOrderToFirebase(o);

      cart = [];
      st.set('pendingOrder', null);
      save();

      isSubmittingOrder = false;
      location.hash = '#/payment-done';
      route();
    });
  }`;

appHtml = appHtml.replace(oldPfRegex, newPfCode);

// Add event handlers for .m card click, #pay-btn, data-cpm, data-copy, data-go
const oldClickRegex = /document\.addEventListener\('click',e=>\{[\s\S]*?\n\}\);/;

const newClickCode = `document.addEventListener('click', e => {
  const t = e.target.closest('button,a,[data-menu],[data-copy-num],[data-k],[data-go],[data-copy],[data-cpm],#pay-btn,.m');
  if(!t) return;
  const d = t.dataset;

  if (t.classList.contains('m') || t.closest('.m')) {
    const card = t.classList.contains('m') ? t : t.closest('.m');
    const k = card.dataset.k;
    selPayMethod = k;
    document.querySelectorAll('.m').forEach(b => b.classList.toggle('on', b.dataset.k == k));
    return;
  }

  if (t.id == 'pay-btn' || t.closest('#pay-btn')) {
    if (selPayMethod) {
      location.hash = '#/payment/' + selPayMethod;
      route();
    } else {
      toast('একটি পেমেন্ট মাধ্যম বেছে নিন');
    }
    return;
  }

  if (d.go === 'qr' || t.closest('[data-go="qr"]')) {
    selPayMethod = 'qr';
    location.hash = '#/payment/qr';
    route();
    return;
  }

  if (d.go === 'home' || t.closest('[data-go="home"]')) {
    selPayMethod = 'bkash';
    location.hash = '#/payment';
    route();
    return;
  }

  if (d.cpm !== undefined || t.closest('[data-cpm]')) {
    copyText(CFG.merchantId, 'মার্চেন্ট নম্বর কপি হয়েছে');
    return;
  }

  if (d.copy) {
    copyText(d.copy, 'নম্বর কপি হয়েছে');
    return;
  }

  if(t.type=='submit'||t.getAttribute('type')=='submit'||t.id=='co-submit-btn'||t.id=='pf-submit-btn'||t.id=='cf-submit-btn'){
    const f=t.closest('form');
    if(f){e.preventDefault();processSubmit(f);return}
  }
  if(d.copyNum){copyText(d.copyNum,'নম্বর কপি হয়েছে')}
  if((d.menu!==undefined&&t.tagName!='A')||(t.tagName=='A'&&d.menu!==undefined)){$('#dr').classList.toggle('show');document.querySelector('.ov').classList.toggle('show')}
  if(d.a){addCart(+d.a)}
  if(d.ad){addCart(+d.ad,sel.qty,sel.size)}
  if(d.buy){addCart(+d.buy,sel.qty,sel.size);location.hash='#/checkout';route()}
  if(d.w){const i=+d.w;wish.includes(i)?wish=wish.filter(x=>x!=i):wish.push(i);save();upd();toast(wish.includes(i)?'পছন্দের তালিকায় যোগ হয়েছে':'তালিকা থেকে সরানো হয়েছে');if(location.hash.startsWith('#/wishlist'))route();else document.querySelectorAll(\`[data-w="\${i}"].hb\`).forEach(b=>b.classList.toggle('on',wish.includes(i)))}
  if(d.sl!==undefined){go(+d.sl);clearInterval(slideT)}
  if(d.sz){sel.size=d.sz;document.querySelectorAll('[data-sz]').forEach(b=>b.classList.toggle('on',b.dataset.sz==sel.size))}
  if(d.sq){sel.qty=Math.max(1,sel.qty+ +d.sq);$('#sq').textContent=bn(sel.qty)}
  if(d.cq){const[i,v]=d.cq.split(':');cart[i].qty=Math.max(1,cart[i].qty+ +v);save();route()}
  if(d.rm!==undefined){cart.splice(+d.rm,1);save();route()}
  if(d.allcart!==undefined){wish.forEach(i=>addCart(i));route()}
  if(d.out!==undefined){user=null;save();shell();route();toast('লগআউট হয়েছে')}
  if(d.tab){const r=d.tab=='r';document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b==t));$('#nm').hidden=!r;$('#au').dataset.m=d.tab;$('#au button.btn').textContent=r?'রেজিস্টার করুন':'লগইন করুন';$('#er').textContent=''}
});`;

appHtml = appHtml.replace(oldClickRegex, newClickCode);

fs.writeFileSync('public/assets/aistudio/fashion-point_6a561526.html', appHtml);
console.log('Successfully integrated payment flow matching Fashion_Point___Payment_Page_472e2f6e.html.');
