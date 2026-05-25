import os, re
css = '''
/* Big Footer Brand Text override */
.footer-big-text {
    width: 100% !important;
    display: block !important;
    font-size: 28vw !important;
    font-weight: 900 !important;
    font-family: 'Helvetica Neue', Arial, sans-serif !important;
    text-align: center !important;
    line-height: 0.75 !important;
    letter-spacing: -1vw !important;
    background: linear-gradient(180deg, #111111 0%, #eeeeee 100%) !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    color: transparent !important;
    user-select: none;
    -webkit-user-select: none;
    padding: 0 !important;
    margin: 30px 0 0 0 !important;
    clear: both !important;
    overflow: hidden !important;
    white-space: nowrap !important;
}

[data-theme="dark"] .footer-big-text {
    background: linear-gradient(180deg, #ffffff 0%, #1a1a1a 100%) !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
}
'''
for filepath in ['style.css', 'Cara-main/style.css']:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove old copies
    content = re.sub(r'/\* Big Footer Brand Text.*?\*/.*?\[data-theme="dark"\] .footer-big-text\s*{[^}]*}', '', content, flags=re.DOTALL)
    content = re.sub(r'/\* Big Footer Brand Text override.*?\*/.*?\[data-theme="dark"\] .footer-big-text\s*{[^}]*}', '', content, flags=re.DOTALL)
    content = re.sub(r'\.footer-big-text\s*{[^}]*}', '', content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n' + css)
