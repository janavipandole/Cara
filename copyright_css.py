import os
css = '''
.copyright {
    width: 100% !important;
    text-align: center !important;
    flex-basis: 100% !important;
    display: block !important;
}
'''
for f_path in ['style.css', 'Cara-main/style.css']:
    if os.path.exists(f_path):
        with open(f_path, 'a', encoding='utf-8') as f:
            f.write(css)
