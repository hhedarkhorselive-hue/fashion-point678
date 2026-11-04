const fs = require('fs');

let appHtml = fs.readFileSync('public/assets/aistudio/fashion-point_6a561526.html', 'utf8');

// New viewCheckout and placeOrder logic
const newCheckoutCode = `
function togglePayOption(type) {
  const box = document.getElementById('paybd-details');
  const btn = document.getElementById('chk-submit-btn');
  
  let subtotal = 0;
  cart.forEach(ci => {
    const p = getProd(ci.id);
    subtotal += p.pr * ci.qty;
  });
  const shipping = subtotal >= 1000 ? 0 : selectedShippingRate;
  const total = subtotal + shipping;

  if (box) {
    if (type === 'cod') {
      box.style.display = 'none';
    } else if (type === 'pay_advance') {
      box.style.display = 'block';
      box.innerHTML = '<h4 style="color:var(--pink);margin-bottom:6px;">🚚 ' + (currentLang==='en'?'Advance Delivery Charge Payment':'ডেলিভারি চার্জ অগ্রিম পেমেন্ট') + '</h4><p style="font-size:13.5px;color:var(--ink);">' + (currentLang==='en'?'Pay delivery charge ৳' + shipping + ' in advance via bKash/Nagad/Rocket on PayBD Gateway page to confirm your order.':'আপনার অর্ডার কনফার্ম করতে ডেলিভারি চার্জ ৳' + shipping + ' অগ্রিম বিকাশ, নগদ, রকেটে পেমেন্ট করুন।') + '</p>';
    } else if (type === 'pay_full') {
      box.style.display = 'block';
      box.innerHTML = '<h4 style="color:var(--pink);margin-bottom:6px;">💳 ' + (currentLang==='en'?'Full Amount Online Payment':'ফুল অ্যামাউন্ট অনলাইন পেমেন্ট') + '</h4><p style="font-size:13.5px;color:var(--ink);">' + (currentLang==='en'?'Pay total order amount ৳' + total + ' online to complete payment on PayBD Gateway page.':'পণ্য ও ডেলিভারি চার্জের সর্বমোট ৳' + total + ' অগ্রিম পেমেন্ট সম্পন্ন করুন।') + '</p>';
    }
  }

  if (btn) {
    if (type === 'cod') {
      btn.textContent = getT('confirmOrderBtn');
    } else if (type === 'pay_advance') {
      btn.textContent = (currentLang === 'en' ? 'Pay Delivery Charge (৳' + shipping + ') & Confirm Order' : 'ডেলিভারি চার্জ পে করুন (৳' + shipping + ') & অর্ডার কনফার্ম');
    } else {
      btn.textContent = (currentLang === 'en' ? 'Pay Full Amount (৳' + total + ') & Confirm Order' : 'পে নাও (৳' + total + ') & অর্ডার কনফার্ম');
    }
  }
}

function viewCheckout() {
  if (!cart.length) {
    location.hash = '#/cart';
    return '';
  }
  let subtotal = 0;
  cart.forEach(ci => {
    const p = getProd(ci.id);
    subtotal += p.pr * ci.qty;
  });

  const districts = currentLang === 'en' ? BD_DISTRICTS_EN : BD_DISTRICTS_BN;
  const savedUser = JSON.parse(localStorage.getItem('fp_user') || '{}');

  const finalShip = subtotal >= 1000 ? 0 : selectedShippingRate;
  const total = subtotal + finalShip;

  return \`
  <div class="pg">
    <div class="crumb"><a href="#/">\${getT('home')}</a> / <a href="#/cart">\${getT('cartTitle')}</a> / <span>\${getT('checkout')}</span></div>
    <h1 class="t">\${getT('checkout')}</h1>
    <form onsubmit="placeOrder(event)" class="two" style="margin-top:16px;">
      <div class="box">
        <h3>\${getT('shippingDetails')}</h3>
        <div class="fg">
          <label>
            \${getT('fullName')}
            <input type="text" class="in" id="c-name" required placeholder="\${currentLang==='en'?'e.g. Abdur Rahman':'উদাহরণ: আব্দুর রহমান'}" value="\${savedUser.name || ''}">
          </label>
          <div class="f2">
            <label>
              \${getT('mobileNo')}
              <input type="tel" class="in" id="c-phone" required pattern="[0-9]{11}" placeholder="017XXXXXXXX" value="\${savedUser.phone || ''}">
            </label>
            <label>
              \${getT('district')}
              <select class="in" id="c-dist" required onchange="handleDistrictChange()">
                \${districts.map(d => \`<option value="\${d}" \${savedUser.dist === d ? 'selected' : (d==='Dhaka'||d==='ঢাকা'?'selected':'')}>\${d}</option>\`).join('')}
              </select>
            </label>
          </div>
          <div class="f2">
            <label>
              \${getT('thana')}
              <input type="text" class="in" id="c-thana" required placeholder="\${currentLang==='en'?'e.g. Naria / Sakhipur':'উদাহরণ: সখিপুর'}" value="\${savedUser.thana || ''}">
            </label>
            <label>
              \${getT('address')}
              <input type="text" class="in" id="c-addr" required placeholder="\${currentLang==='en'?'e.g. House 12, Road 5, Balarhat':'উদাহরণ: বিশ্বরোড সংলগ্ন, বালারহাট'}" value="\${savedUser.addr || ''}">
            </label>
          </div>
        </div>

        <h3 style="margin-top:20px;">\${getT('shippingRegion')}</h3>
        <div class="pay" style="margin-bottom:14px;">
          <label>
            <input type="radio" name="ship-rate" id="ship-inside" value="60" \${selectedShippingRate===60?'checked':''} onclick="handleShipRadioChange(60)">
            <span>\${getT('insideDhaka')}</span>
          </label>
          <label>
            <input type="radio" name="ship-rate" id="ship-outside" value="100" \${selectedShippingRate===100?'checked':''} onclick="handleShipRadioChange(100)">
            <span>\${getT('outsideDhaka')}</span>
          </label>
          <label>
            <input type="radio" name="ship-rate" id="ship-express" value="120" \${selectedShippingRate===120?'checked':''} onclick="handleShipRadioChange(120)">
            <span>\${getT('outsideDhaka120')}</span>
          </label>
        </div>

        <h3 style="margin-top:20px;">\${getT('selectPayment')}</h3>
        <div class="pay" style="display:grid;gap:10px;">
          <label style="cursor:pointer;display:flex;align-items:center;gap:10px;padding:12px;border:1.5px solid #d3d8e8;border-radius:10px;">
            <input type="radio" name="pay" value="cod" checked onclick="togglePayOption('cod')">
            <span>\${getT('codOption')}</span>
          </label>
          <label style="cursor:pointer;display:flex;align-items:center;gap:10px;padding:12px;border:1.5px solid #d3d8e8;border-radius:10px;">
            <input type="radio" name="pay" value="pay_advance" onclick="togglePayOption('pay_advance')">
            <span>\${currentLang === 'en' ? 'Pay Advance Delivery Charge (৳' + finalShip + ')' : 'ডেলিভারি চার্জ অগ্রিম দিন (৳' + finalShip + ' - পে নাও)'}</span>
          </label>
          <label style="cursor:pointer;display:flex;align-items:center;gap:10px;padding:12px;border:1.5px solid #d3d8e8;border-radius:10px;">
            <input type="radio" name="pay" value="pay_full" onclick="togglePayOption('pay_full')">
            <span>\${currentLang === 'en' ? 'Pay Full Amount (৳' + total + ' - Pay Now)' : 'ফুল অ্যামাউন্ট অনলাইন পেমেন্ট (৳' + total + ' - পে নাও)'}</span>
          </label>
        </div>

        <div id="paybd-details" style="display:none;margin-top:14px;padding:14px;background:var(--pink2);border:1px solid #f4bfd2;border-radius:8px;">
        </div>
      </div>

      <div class="box">
        <h3>\${getT('orderSummary')}</h3>
        \${cart.map(ci => {
          const p = getProd(ci.id);
          const name = getProdName(p);
          return \`<div class="row"><span>\${name} x \${bn(ci.qty)}</span><b>\${tk(p.pr * ci.qty)}</b></div>\`;
        }).join('')}
        <div class="row" style="border-top:1px solid var(--line);margin-top:8px;padding-top:8px;"><span>\${getT('subtotal')}</span><b>\${tk(subtotal)}</b></div>
        <div class="row"><span>\${getT('shipping')}</span><b id="chk-shipping">\${finalShip === 0 ? getT('freeShipping') : tk(finalShip)}</b></div>
        <div class="row t"><span>\${getT('totalPayable')}</span><b id="chk-total">\${tk(total)}</b></div>

        <button type="submit" id="chk-submit-btn" class="btn" style="width:100%;justify-content:center;margin-top:18px;font-size:16.5px;padding:12px;">\${getT('confirmOrderBtn')}</button>
      </div>
    </form>
  </div>
  \`;
}

function placeOrder(e) {
  if (e) e.preventDefault();

  const nameEl = document.getElementById('c-name');
  const phoneEl = document.getElementById('c-phone');
  const distEl = document.getElementById('c-dist');
  const thanaEl = document.getElementById('c-thana');
  const addrEl = document.getElementById('c-addr');

  const name = nameEl ? nameEl.value.trim() : '';
  const phoneRaw = phoneEl ? phoneEl.value.trim() : '';
  const dist = distEl ? distEl.value : '';
  const thana = thanaEl ? thanaEl.value.trim() : '';
  const addr = addrEl ? addrEl.value.trim() : '';

  const cleanPhone = phoneRaw.replace(/\\D/g, '');

  if (!name || !cleanPhone || cleanPhone.length < 10 || !addr) {
    alert(currentLang === 'en' 
      ? 'Please fill in your full name, valid mobile number (at least 10 digits), and detailed address.' 
      : 'অনুগ্রহ করে আপনার নাম, সঠিক মোবাইল নম্বর এবং বিস্তারিত ঠিকানা প্রদান করুন।');
    return false;
  }

  const payRadio = document.querySelector('input[name="pay"]:checked');
  const payVal = payRadio ? payRadio.value : 'cod';

  let subtotal = 0;
  cart.forEach(ci => {
    const p = getProd(ci.id);
    subtotal += p.pr * ci.qty;
  });
  const shipping = subtotal >= 1000 ? 0 : selectedShippingRate;
  const total = subtotal + shipping;

  const orderId = 'FP' + Math.floor(100000 + Math.random() * 900000);
  let payMethodName = currentLang === 'en' ? 'Cash on Delivery' : 'ক্যাশ অন ডেলিভারি';
  let payAmount = total;

  if (payVal === 'pay_advance') {
    payMethodName = currentLang === 'en' ? 'Advance Delivery Charge Payment' : 'ডেলিভারি চার্জ অগ্রিম পেমেন্ট';
    payAmount = shipping;
  } else if (payVal === 'pay_full') {
    payMethodName = currentLang === 'en' ? 'Full Online Payment' : 'ফুল অনলাইন পেমেন্ট';
    payAmount = total;
  }

  const newOrder = {
    id: orderId,
    name,
    phone: cleanPhone,
    dist,
    thana,
    addr: thana ? \`\${addr}, \${thana}\` : addr,
    items: [...cart],
    subtotal,
    ship: shipping,
    total,
    payAmount,
    payMethod: payMethodName,
    status: payVal === 'cod' ? 'Order Confirmed' : 'PayBD Pending Payment',
    date: new Date().toLocaleString(currentLang === 'en' ? 'en-US' : 'bn-BD')
  };

  lastOrder = newOrder;

  // Save profile & order history locally
  try {
    localStorage.setItem('fp_user', JSON.stringify({ name, phone: cleanPhone, dist, thana, addr }));
    const userOrders = JSON.parse(localStorage.getItem('fp_orders') || '[]');
    userOrders.unshift(newOrder);
    localStorage.setItem('fp_orders', JSON.stringify(userOrders));
  } catch (err) {
    console.warn('localStorage save order error:', err);
  }

  // Non-blocking Firebase sync
  syncOrderToFirebase(newOrder).catch(err => console.warn('Firebase order sync error:', err));

  cart = [];
  saveCart();

  if (payVal === 'cod') {
    toast(currentLang === 'en' ? 'Order confirmed successfully!' : 'অর্ডার সফলভাবে কনফার্ম করা হয়েছে!');
    location.hash = '#/order-success';
  } else {
    // Navigate DIRECTLY OUT to standalone payment page
    toast(currentLang === 'en' ? 'Redirecting to Payment Page...' : 'পেমেন্ট পেজে নিয়ে যাওয়া হচ্ছে...');
    const payUrl = '/pay.html?order_id=' + orderId + '&amount=' + payAmount + '&pay_type=' + payVal;
    setTimeout(() => {
      if (window.top) {
        window.top.location.href = payUrl;
      } else {
        window.location.href = payUrl;
      }
    }, 400);
  }

  return false;
}
`;

// Replace viewCheckout, togglePayOption, placeOrder functions in appHtml
const startMatch = appHtml.indexOf('function togglePayOption(');
const endMatch = appHtml.indexOf('function viewSuccess()');

if (startMatch !== -1 && endMatch !== -1 && startMatch < endMatch) {
  appHtml = appHtml.slice(0, startMatch) + newCheckoutCode.trim() + '\n\n' + appHtml.slice(endMatch);
  fs.writeFileSync('public/assets/aistudio/fashion-point_6a561526.html', appHtml, 'utf8');
  console.log("Updated checkout flow and standalone pay.html redirect in fashion-point_6a561526.html");
} else {
  console.error("Could not find startMatch or endMatch in appHtml!");
}
