const fs = require('fs');

const refHtml = fs.readFileSync('public/assets/aistudio/payment-page__1__faac945b.html', 'utf8');
let appHtml = fs.readFileSync('public/assets/aistudio/fashion-point_6a561526.html', 'utf8');

// Extract images
const mtImgMatch = refHtml.match(/class="mt"><img src="([^"]+)"/);
const mtImg = mtImgMatch ? mtImgMatch[1] : '';

const pbImgMatch = refHtml.match(/class="pb"><img src="([^"]+)"/);
const pbImg = pbImgMatch ? pbImgMatch[1] : '';

const qrImgMatch = refHtml.match(/class="qr"[^>]*><img src="([^"]+)"/);
const qrImg = qrImgMatch ? qrImgMatch[1] : '';

const mMatches = [...refHtml.matchAll(/data-k="([^"]+)"[^>]*><img src="([^"]+)"/g)];
const providerImgs = {};
mMatches.forEach(m => {
  providerImgs[m[1]] = m[2];
});

// Construct IMG_PAY object
const IMG_PAY = {
  fp_logo: mtImg,
  paybd: pbImg,
  qr: qrImg,
  bkash: providerImgs.bkash || '',
  nagad: providerImgs.nagad || '',
  rocket: providerImgs.rocket || '',
  upay: providerImgs.upay || '',
  cellfin: providerImgs.cellfin || '',
  mcash: providerImgs.mcash || '',
  pathao: providerImgs.pathao || ''
};

// Check if IMG_PAY exists in appHtml or inject it
const imgPayJs = `const IMG_PAY = ` + JSON.stringify(IMG_PAY, null, 2) + `;`;

if (appHtml.includes('const IMG_PAY =')) {
  appHtml = appHtml.replace(/const IMG_PAY = \{[\s\S]*?\};/, imgPayJs);
} else {
  // Inject after firebaseConfig or script start
  appHtml = appHtml.replace('let db = null;', imgPayJs + '\nlet db = null;');
}

fs.writeFileSync('public/assets/aistudio/fashion-point_6a561526.html', appHtml, 'utf8');
console.log("Injected IMG_PAY into fashion-point_6a561526.html");
