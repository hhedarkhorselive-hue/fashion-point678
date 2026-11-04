const fs = require('fs');

const refHtml = fs.readFileSync('public/assets/aistudio/payment-page__1__faac945b.html', 'utf8');
const appHtml = fs.readFileSync('public/assets/aistudio/fashion-point_6a561526.html', 'utf8');

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

console.log("MT Img len:", mtImg.length);
console.log("PB Img len:", pbImg.length);
console.log("QR Img len:", qrImg.length);
console.log("Found provider images keys:", Object.keys(providerImgs));
