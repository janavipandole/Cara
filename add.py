import os, glob

for root in ['.', 'Cara-main']:
    for f_name in glob.glob(os.path.join(root, '*.html')):
        with open(f_name, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'class=\"footer-big-text\"' not in content:
            if '</footer>' in content:
                content = content.replace(
                    '    </div>\n  </footer>',
                    '    </div>\n\n    <!-- Big Brand Text at Footer Base -->\n    <div class=\"footer-big-text\">CARA</div>\n  </footer>'
                )
                content = content.replace(
                    '    </div>\r\n  </footer>',
                    '    </div>\r\n\r\n    <!-- Big Brand Text at Footer Base -->\r\n    <div class=\"footer-big-text\">CARA</div>\r\n  </footer>'
                )
                with open(f_name, 'w', encoding='utf-8') as f:
                    f.write(content)
