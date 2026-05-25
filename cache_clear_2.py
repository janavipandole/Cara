import os, glob

for root in ['.', 'Cara-main']:
    for f_name in glob.glob(os.path.join(root, '*.html')):
        with open(f_name, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # update cache buster for style.css
        if 'style.css?v=4' in content:
            content = content.replace('style.css?v=4', 'style.css?v=5')
            with open(f_name, 'w', encoding='utf-8') as f:
                f.write(content)
