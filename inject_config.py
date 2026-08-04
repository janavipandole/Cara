import os
import glob

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<script src="js/config.js"></script>' in content:
        continue
    
    # Inject into head right before the closing </head>
    new_content = content.replace('</head>', '    <script src="js/config.js"></script>\n</head>')
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)

print(f"Injected config.js into {len(html_files)} HTML files.")
