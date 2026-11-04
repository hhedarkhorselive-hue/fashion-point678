const fs = require('fs');

const refHtml = fs.readFileSync('public/assets/aistudio/payment-page__1__faac945b.html', 'utf8');
let appHtml = fs.readFileSync('public/assets/aistudio/fashion-point_6a561526.html', 'utf8');

// Extract css inside <style> from refHtml
const styleMatch = refHtml.match(/<style>([\s\S]*?)<\/style>/);
const refStyle = styleMatch ? styleMatch[1] : '';

console.log("Ref style length:", refStyle.length);

// Extract base64 image data from refHtml:
// logo in .mt: <div class="mt"><img src="..." ...
const mtImgMatch = refHtml.match(/class="mt"><img src="([^"]+)"/);
const mtImg = mtImgMatch ? mtImgMatch[1] : '';

// logo in .pb: <span class="pb"><img src="..." ...
const pbImgMatch = refHtml.match(/class="pb"><img src="([^"]+)"/);
const pbImg = pbImgMatch ? pbImgMatch[1] : '';

// qr img: <button class="qr"[^>]*><img src="([^"]+)"/
const qrImgMatch = refHtml.match(/class="qr"[^>]*><img src="([^"]+)"/);
const qrImg = qrImgMatch ? qrImgMatch[1] : '';

// provider images from .m buttons
const mMatches = [...refHtml.matchAll(/data-k="([^"]+)"[^>]*><img src="([^"]+)"/g)];
const providerImgs = {};
mMatches.forEach(m => {
  providerImgs[m[1]] = m[2];
});

console.log("Found provider images:", Object.keys(providerImgs));
