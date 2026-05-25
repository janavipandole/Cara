import os, glob, re

for root in ['.', 'Cara-main']:
    for f_name in glob.glob(os.path.join(root, '*.html')):
        with open(f_name, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove ALL instances of footer-big-text completely:
        content = re.sub(r'[ \t]*<!-- Big Brand Text at Footer Base -->\s*(<div class=\\?"footer-big-text\\?">CARA</div>){1,}', '', content, flags=re.IGNORECASE)
        content = re.sub(r'[ \t]*<div class=\\"footer-big-text\\">CARA</div>\s*', '', content)
        content = re.sub(r'[ \t]*<div class="footer-big-text">CARA</div>\s*', '', content)
        
        # Now find the closing </footer> and insert perfectly after it
        content = re.sub(
            r'(</footer>)',
            r'\1\n\n  <!-- Big Brand Text at Footer Base -->\n  <div class="footer-big-text">CARA</div>',
            content,
            count=1 # Only insert after the first closing footer just in case there are multiple, actually wait, there is a commented main-footer.
        )
        
        with open(f_name, 'w', encoding='utf-8') as f:
            f.write(content)
