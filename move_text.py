import os, glob, re

for root in ['.', 'Cara-main']:
    for f_name in glob.glob(os.path.join(root, '*.html')):
        with open(f_name, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove from inside footer
        if '<!-- Big Brand Text at Footer Base -->' in content:
            # We'll regex replace to pull it out
            content = re.sub(
                r'[ \t]*<!-- Big Brand Text at Footer Base -->\s*<div class="footer-big-text">CARA</div>\s*</footer>',
                r'</footer>\n\n  <!-- Big Brand Text at Footer Base -->\n  <div class="footer-big-text">CARA</div>',
                content
            )
            with open(f_name, 'w', encoding='utf-8') as f:
                f.write(content)
