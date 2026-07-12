const fs = require('fs');
const path = require('path');

const filesToCheck = ['index.html', 'app.js', 'style.css', 'cara.db'];
let errors = 0;

filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
    } else {
        console.warn(`[WARNING] Missing ${file}`);
        errors++;
    }
});

if (errors === 0) {
} else {
    console.warn(`Environment checked with ${errors} warnings.`);
}
