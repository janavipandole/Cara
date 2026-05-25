import os
f_path = 'Cara-main/style.css'
if os.path.exists(f_path):
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace footer .col
    if 'transition: transform 0.3s ease' not in content:
        content = content.replace(
'''footer .col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1 1 220px;
    min-width: 200px;
    margin-bottom: 20px;
}''',
'''footer .col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1 1 220px;
    min-width: 200px;
    margin-bottom: 20px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    padding: 10px;
    border-radius: 8px;
}

footer .col:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}'''
        )
        # Replace footer a
        content = content.replace(
'''footer a {
    font-size: 14px;
    text-decoration: none;
    color: var(--footer-text);
    margin-bottom: 8px;
    transition: color 0.3s ease;
}''',
'''footer a {
    font-size: 14px;
    text-decoration: none;
    color: var(--footer-text);
    margin-bottom: 8px;
    transition: color 0.3s ease, padding-left 0.3s ease;
    position: relative;
    display: inline-block;
}

footer a::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -2px;
    left: 0;
    background-color: var(--accent);
    transition: width 0.3s ease;
}

footer a:hover {
    color: var(--accent);
    padding-left: 5px;
}

footer a:hover::after {
    width: 100%;
}

/* Exclude hover animation from icon links */
footer .follow a:hover,
footer .payment-icons a:hover {
    padding-left: 0;
}
footer .follow a::after,
footer .payment-icons a::after {
    display: none;
}'''
        )
        with open(f_path, 'w', encoding='utf-8') as f:
            f.write(content)
