const fs = require('fs');

let refHtml = fs.readFileSync('public/assets/aistudio/payment-page__1__faac945b.html', 'utf8');

// Replace base64 image sources with placeholder names so we can read the structure
refHtml = refHtml.replace(/src="data:image\/[^;]+;base64,[^"]+"/g, 'src="[BASE64_IMAGE]"');

fs.writeFileSync('/tmp/payment_template_clean.html', refHtml, 'utf8');

console.log("Clean template written to /tmp/payment_template_clean.html. Length:", refHtml.length);
