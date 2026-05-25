import os
for f_path in ['style.css', 'Cara-main/style.css']:
    if not os.path.exists(f_path): continue
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if '.footer-big-text' not in content:
        # We append the styles to the end of the file
        css = '''

/* Big Footer Brand Text */
.footer-big-text {
    width: 100%;
    margin-top: 30px;
    font-size: min(18vw, 250px);
    font-weight: 900;
    font-family: inherit;
    text-align: center;
    line-height: 0.8;
    letter-spacing: -2px;
    background: linear-gradient(to bottom, #000000 10%, #e0e0e0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
    user-select: none;
    -webkit-user-select: none;
    text-transform: uppercase;
    transition: background 0.3s ease;
}

[data-theme="dark"] .footer-big-text {
    background: linear-gradient(to bottom, #ffffff 10%, #1a1a1a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
}
'''
        with open(f_path, 'a', encoding='utf-8') as f:
            f.write(css)
