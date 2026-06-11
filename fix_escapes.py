import os
files_to_fix = {
    'checkout.js': [ (26, r'\-') ],
    'js/checkout-timer.js': [ (60, r'\.'), (91, r'\.') ],
    'js/gift-options.js': [ (46, r'\.'), (49, r'\.') ],
    'js/loyalty.js': [ (23, r'\.'), (64, r'\.'), (69, r'\.') ],
    'js/shop-sort-filter.js': [ (46, r'\.'), (56, r'\.'), (60, r'\.') ],
    'products.js': [ (592, r'\/') ],
}

for filepath, edits in files_to_fix.items():
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for line_num, target in edits:
        replacement = target.replace('\\', '')
        lines[line_num - 1] = lines[line_num - 1].replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)
