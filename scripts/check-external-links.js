const fs = require('fs');
const path = require('path');

const htmlFiles = fs.readdirSync(process.cwd())
  .filter((f) => f.endsWith('.html'));

let hasError = false;

htmlFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const anchorRegex = /<a\b[^>]*?>/gs;
  let match;

  while ((match = anchorRegex.exec(content)) !== null) {
    const tag = match[0];
    const hasBlank = /target=["']_blank["']/.test(tag);
    const hasRel = /rel=["'][^"']*noopener[^"']*noreferrer[^"']*["']/.test(tag) ||
                   /rel=["'][^"']*noreferrer[^"']*noopener[^"']*["']/.test(tag);

    if (hasBlank && !hasRel) {
      const line = content.slice(0, match.index).split('\n').length;
      console.error(`Missing rel="noopener noreferrer": ${file}:${line}`);
      hasError = true;
    }
  }
});

if (hasError) {
  console.error('\n❌ Found target="_blank" links missing rel="noopener noreferrer"');
  process.exit(1);
} else {
  console.log('✅ All target="_blank" links have rel="noopener noreferrer"');
}