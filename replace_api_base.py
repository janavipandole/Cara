import os

files = [
  'register.js',
  'order-history.js',
  'js/session-lock.js',
  'js/admin-products.js',
  'forgotPassword.js',
  'checkout.js'
]

for file in files:
    if not os.path.exists(file):
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace('window.CARA_API_BASE_URL || \'\'', '(window.CARA_CONFIG ? window.CARA_CONFIG.API_BASE_URL : \'\')')
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)

print("Replaced CARA_API_BASE_URL in scripts.")
