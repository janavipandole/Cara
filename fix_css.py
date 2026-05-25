import re

with open('style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace literal backtick-n with actual newlines
content = content.replace('`n', '\n')

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(content)
    
print('Fixed literal backtick-n characters to newlines')
