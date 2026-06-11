// Search History Dropdown Manager
document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.querySelector(".newsletter-form") || document.querySelector("form");
    if (!searchForm) return;

    const input = searchForm.querySelector("input[type='email']") || searchForm.querySelector("input");
    if (!input) return;

    // Create search suggestions dropdown
    const dropdown = document.createElement("div");
    dropdown.id = "search-history-dropdown";
    dropdown.style.cssText = "display:none; position:absolute; background:#fff; border:1px solid #ccc; width:100%; z-index:9999; border-radius:4px; box-shadow:0 4px 8px rgba(0,0,0,0.1); padding:10px; max-height:200px; overflow-y:auto; color: #333;";
    
    // Ensure parent container is relative
    input.parentNode.style.position = "relative";
    input.parentNode.appendChild(dropdown);

    const loadHistory = () => {
        const history = JSON.parse(localStorage.getItem("cara_search_history")) || [];
        dropdown.innerHTML = "";
        if (history.length === 0) {
            dropdown.innerHTML = "<p style='font-size:12px;color:#888;margin:0;'>No recent searches</p>";
            return;
        }

        const title = document.createElement("p");
        title.style.cssText = "font-size:11px; font-weight:700; color:#088178; margin:0 0 5px 0; text-transform:uppercase;";
        title.textContent = "Recent Searches";
        dropdown.appendChild(title);

        history.forEach(item => {
            const row = document.createElement("div");
            row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:5px 0; cursor:pointer; font-size:13px; border-bottom:1px solid #eee;";
            
            const textSpan = document.createElement("span");
            textSpan.textContent = item;
            textSpan.addEventListener("click", () => {
                input.value = item;
                dropdown.style.display = "none";
            });

            const delBtn = document.createElement("i");
            delBtn.className = "ri-delete-bin-line";
            delBtn.style.cssText = "color:#e23e57; cursor:pointer; font-size:12px;";
            delBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                removeFromHistory(item);
            });

            row.appendChild(textSpan);
            row.appendChild(delBtn);
            dropdown.appendChild(row);
        });
    };

    const removeFromHistory = (item) => {
        let history = JSON.parse(localStorage.getItem("cara_search_history")) || [];
        history = history.filter(x => x !== item);
        localStorage.setItem("cara_search_history", JSON.stringify(history));
        loadHistory();
    };

    input.addEventListener("focus", () => {
        loadHistory();
        dropdown.style.display = "block";
    });

    document.addEventListener("click", (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = "none";
        }
    });

    searchForm.addEventListener("submit", (e) => {
        const val = input.value.trim();
        if (val) {
            let history = JSON.parse(localStorage.getItem("cara_search_history")) || [];
            history = history.filter(x => x !== val);
            history.unshift(val);
            localStorage.setItem("cara_search_history", JSON.stringify(history.slice(0, 5)));
        }
    });
});

// Local storage parser populating clickable search history suggestion bubbles.