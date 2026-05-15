// Helper function to fetch and inject HTML components into a placeholder element
async function loadComponent(elementId, componentPath, callback) {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const response = await fetch(componentPath);
        if (response.ok) {
            element.innerHTML = await response.text();
            if (callback) callback();
        } else {
            console.error(`Failed to load component: ${componentPath}`);
        }
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
    }
}

// Highlights the active page in the navigation menu based on the current URL
function setActiveNavLink() {
    const navLinks = document.querySelectorAll('#navbar li a');
    const currentPath = globalThis.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Main initialization function called on page load
function init() {
    // load header first
    loadComponent('header-placeholder', 'components/header.html', () => {
        setActiveNavLink();
        
        // re-init app js functions if they exist
        if (typeof initMobileMenu === 'function') initMobileMenu();
        if (typeof initTheme === 'function') initTheme();
    });

    // load footer
    loadComponent('footer-placeholder', 'components/footer.html');
}

document.addEventListener('DOMContentLoaded', init);
