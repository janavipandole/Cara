import os, glob

for root in ['.', 'Cara-main']:
    for f_name in glob.glob(os.path.join(root, '*.html')):
        with open(f_name, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # update cache buster for style.css
        if 'style.css?v=2' in content:
            content = content.replace('style.css?v=2', 'style.css?v=4')
            with open(f_name, 'w', encoding='utf-8') as f:
                f.write(content)
        elif 'style.css' in content and 'style.css?v=' not in content:
            content = content.replace('\"style.css\"', '\"style.css?v=4\"')
            with open(f_name, 'w', encoding='utf-8') as f:
                f.write(content)
