document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchCount = document.getElementById('searchCount');
    const products = document.querySelectorAll('.pro-container .pro');
    const noResultsMsg = document.getElementById('noResultsMsg');
    const clearBtn = document.createElement('button');
    
    // Add clear button to search box
    clearBtn.innerHTML = '<i class="ri-close-line"></i>';
    clearBtn.className = 'clear-btn';
    clearBtn.style.display = 'none';
    searchInput.parentNode.insertBefore(clearBtn, searchBtn);

    let currentCategory = 'all';

    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        products.forEach(product => {
            const title = product.querySelector('h5').innerText.toLowerCase();
            const brand = product.querySelector('span').innerText.toLowerCase();
            const category = product.getAttribute('data-category');

            const matchesSearch = title.includes(searchTerm) || brand.includes(searchTerm);
            const matchesCategory = currentCategory === 'all' || category === currentCategory;

            if (matchesSearch && matchesCategory) {
                product.style.display = '';
                visibleCount++;
            } else {
                product.style.display = 'none';
            }
        });

        searchCount.innerText = `${visibleCount} product${visibleCount !== 1 ? 's' : ''}`;
        
        if (visibleCount === 0) {
            noResultsMsg.style.display = 'block';
        } else {
            noResultsMsg.style.display = 'none';
        }

        clearBtn.style.display = searchTerm ? 'block' : 'none';
    }

    // Event Listeners
    searchInput.addEventListener('input', filterProducts);
    searchBtn.addEventListener('click', filterProducts);
    
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterProducts();
    });

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.getAttribute('data-filter');
            filterProducts();
        });
    });
});
