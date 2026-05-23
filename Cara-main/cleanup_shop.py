from pathlib import Path

path = Path(r'c:\Users\amitk\OneDrive\Desktop\Cara\Cara-main\shop.html')
text = path.read_text(encoding='utf-8')
start = text.find('<section id="product1" class="section-p1">')
if start == -1:
    raise SystemExit('start marker not found')
second = text.find('<!-- Search bar (compact, above product grid) -->', start)
if second == -1:
    raise SystemExit('search comment not found')
# Remove duplicate hard-coded section content that appears before the intended search bar
new_text = text[:start] + text[second:]
path.write_text(new_text, encoding='utf-8')
print('Removed duplicate product section block')
