import os, glob

for root in ['.', 'Cara-main']:
    for f_name in glob.glob(os.path.join(root, '*.html')):
        with open(f_name, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'class=\"footer-big-text\"' not in content:
            if '</footer>' in content:
                # Use regex to find </div> before </footer>
                import re
                content = re.sub(
                    r'(</div>\s*</footer>)',
                    r'</div>\n\n    <!-- Big Brand Text at Footer Base -->\n    <div class=\"footer-big-text\">CARA</div>\n  </footer>',
                    content
                )
                with open(f_name, 'w', encoding='utf-8') as f:
                    f.write(content)
