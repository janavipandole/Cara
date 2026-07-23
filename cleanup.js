const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Remove button
  content = content.replace(/<button[^>]*id="(scrollTopBtn|topBtn)"[^>]*>.*?<\/button>/gis, '');
  // Remove inline JS scripts that reference it
  content = content.replace(/<script>\s*(?:const|var|let)\s+(?:scrollTopBtn|scrollBtn|topBtn)\s*=\s*document\.getElementById\(['"](?:scrollTopBtn|topBtn)['"]\).*?<\/script>/gis, '');
  // Remove inline CSS for it
  content = content.replace(/#(scrollTopBtn|topBtn)\s*{[^}]*}/gis, '');
  content = content.replace(/#(scrollTopBtn|topBtn):hover\s*{[^}]*}/gis, '');
  
  fs.writeFileSync(file, content);
});

// Also remove from try-on.js
const tryOnJs = path.join(__dirname, 'try-on.js');
if (fs.existsSync(tryOnJs)) {
  let tryOnContent = fs.readFileSync(tryOnJs, 'utf8');
  tryOnContent = tryOnContent.replace(/const\s+topBtn\s*=\s*document\.getElementById\(['"]topBtn['"]\);.*topBtn\.addEventListener\(['"]click['"].*?}\);/gis, '');
  fs.writeFileSync(tryOnJs, tryOnContent);
}

console.log('Cleanup done');
