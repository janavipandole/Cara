import os

def tweak_css(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Tweak the footer-big-text size to be huge for a 4-letter word
    if '15vw' in content:
        content = content.replace('15vw', '28vw')
        content = content.replace('min(28vw, 250px)', '29vw') # Just relative, don't cap it too low
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

tweak_css('style.css')
tweak_css('Cara-main/style.css')
