import os, re

def clean_css(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove all instances of Big Footer Brand Text
    content = re.sub(r'/\* Big Footer Brand Text.*?\*/.*?}(?=\s*(\n|/\*|\[data-theme|$))', '', content, flags=re.DOTALL)
    content = re.sub(r'\[data-theme="dark"\] .footer-big-text\s*{.*?}', '', content, flags=re.DOTALL)
    
    css = '''
/* Big Footer Brand Text override */
.footer-big-text {
    width: 100% !important;
    display: block !important;
    font-size: min(15vw, 250px) !important;
    font-weight: 900 !important;
    font-family: Arial, sans-serif !important;
    text-align: center !important;
    line-height: 0.8 !important;
    letter-spacing: -2px !important;
    background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 100%) !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    color: transparent !important;
    user-select: none;
    -webkit-user-select: none;
    padding: 0 !important;
    margin: 50px 0 0 0 !important;
    clear: both !important;
}

[data-theme="dark"] .footer-big-text {
    background: linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 100%) !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
}
'''
    content = content + css
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

clean_css('style.css')
clean_css('Cara-main/style.css')
