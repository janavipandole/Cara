const fs = require('fs');
const path = require('path');

const directoryPath = __dirname;

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    
    files.forEach(function (file) {
        if (path.extname(file) === '.html') {
            const filePath = path.join(directoryPath, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Replace img tags to include loading="lazy" if not present
            // We focus on product, feature, and pay images which are often below the fold
            let modifiedContent = content.replace(/<img([^>]+)>/g, (match, p1) => {
                if (match.includes('loading="lazy"')) return match; // Already lazy loaded
                
                // Don't lazy load the main logo, which is typically above the fold
                if (match.includes('logo.png')) return match;
                
                // Insert loading="lazy" before the closing bracket
                // Ensuring we handle both <img ...> and <img ... />
                if (p1.endsWith('/')) {
                    return `<img ${p1.slice(0, -1)} loading="lazy" />`;
                } else {
                    return `<img ${p1} loading="lazy">`;
                }
            });

            if (content !== modifiedContent) {
                fs.writeFileSync(filePath, modifiedContent, 'utf8');
                console.log(`Updated ${file}`);
            }
        }
    });
});
