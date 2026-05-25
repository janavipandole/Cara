import os

css = '''

/* Premium Glassmorphism Navbar Redesign override */
#header {
    background: rgba(255, 255, 255, 0.6) !important;
    -webkit-backdrop-filter: blur(25px) saturate(200%) !important;
    backdrop-filter: blur(25px) saturate(200%) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.5) !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important;
    padding: 15px 80px !important;
    transition: all 0.4s ease !important;
}

[data-theme="dark"] #header {
    background: rgba(15, 15, 15, 0.7) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
}

#navbar li a {
    font-size: 16px !important; /* more professional size, 22px was too large */
    font-weight: 600 !important;
    padding: 8px 12px !important;
    margin: 0 5px !important;
    border-radius: 8px !important;
    transition: all 0.3s ease !important;
    position: relative !important;
    z-index: 1 !important;
}

#navbar li a:hover,
#navbar li a.active {
    color: var(--accent) !important;
    text-shadow: 0 0 10px rgba(8, 129, 120, 0.3) !important;
}

/* Remove old underline */
#navbar li:not(.nav-icon) a::after {
    display: none !important;
}

/* New Hover Pill/Glow effect */
#navbar li a::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: rgba(8, 129, 120, 0.08) !important;
    border-radius: 8px !important;
    transform: scale(0.8) !important;
    opacity: 0 !important;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
    z-index: -1 !important;
}

[data-theme="dark"] #navbar li a::before {
    background: rgba(8, 129, 120, 0.2) !important;
}

#navbar li a:hover::before,
#navbar li a.active::before {
    transform: scale(1) !important;
    opacity: 1 !important;
}

/* Premium Login Button Styling */
#navbar li a[href="login.html"],
#navbar li a[href="#"]:contains("Logout"),
#logout-btn {
    background: linear-gradient(135deg, #088178 0%, #06635c 100%) !important;
    color: #fff !important;
    padding: 10px 24px !important;
    border-radius: 30px !important;
    box-shadow: 0 4px 15px rgba(8, 129, 120, 0.4) !important;
    font-weight: 700 !important;
    letter-spacing: 0.5px !important;
    text-shadow: none !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

#navbar li a[href="login.html"]::before,
#logout-btn::before {
    display: none !important;
}

#navbar li a[href="login.html"]:hover,
#logout-btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(8, 129, 120, 0.6) !important;
    color: #fff !important;
    background: linear-gradient(135deg, #09998e 0%, #088178 100%) !important;
}

/* Active Login Button Animation (Click) */
#navbar li a[href="login.html"]:active,
#logout-btn:active {
    transform: translateY(1px) !important;
    box-shadow: 0 2px 10px rgba(8, 129, 120, 0.4) !important;
}

/* Responsive adjustment for Mobile padding */
@media (max-width: 799px) {
    #header {
        padding: 15px 20px !important;
    }
}
'''

for filepath in ['style.css', 'Cara-main/style.css']:
    if os.path.exists(filepath):
        with open(filepath, 'a', encoding='utf-8') as f:
            f.write(css)
