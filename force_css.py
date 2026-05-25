import os

css = '''

/* Big Footer Brand Text override */
.footer-big-text {
    width: 100% !important;
    flex-basis: 100% !important;
    display: block !important;
    margin-top: 40px !important;
    font-size: 20vw !important;
    font-weight: 900 !important;
    text-align: center !important;
    line-height: 0.8 !important;
    letter-spacing: -2px !important;
    background: linear-gradient(180deg, #111111 0%, #eeeeee 100%) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    color: transparent !important;
    user-select: none;
    -webkit-user-select: none;
    text-transform: uppercase !important;
    padding: 0 !important;
    clear: both !important;
}

[data-theme="dark"] .footer-big-text {
    background: linear-gradient(180deg, #ffffff 0%, #1a1a1a 100%) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
}
'''
for f_path in ['style.css', 'Cara-main/style.css']:
    if os.path.exists(f_path):
        with open(f_path, 'a', encoding='utf-8') as f:
            f.write(css)
