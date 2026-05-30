
/* ============================================================
   BLOG SEARCH & FILTER SYSTEM
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("blogSearchInput");
    const tagButtons = document.querySelectorAll(".blog-tag-btn");
    const blogBoxes = document.querySelectorAll(".blog-box");

    if (!searchInput) return;

    let activeTag = "all";
    let searchVal = "";

    function filterBlogs() {
        blogBoxes.forEach(box => {
            const h4 = box.querySelector("h4")?.textContent.toLowerCase() || "";
            const p = box.querySelector("p")?.textContent.toLowerCase() || "";
            const boxTag = box.querySelector("a")?.getAttribute("data-tag") || "fashion";
            
            const matchesSearch = h4.includes(searchVal) || p.includes(searchVal);
            const matchesTag = activeTag === "all" || boxTag === activeTag;

            if (matchesSearch && matchesTag) {
                box.style.display = "flex";
            } else {
                box.style.display = "none";
            }
        });
    }

    searchInput.addEventListener("input", (e) => {
        searchVal = e.target.value.toLowerCase().trim();
        filterBlogs();
    });

    tagButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tagButtons.forEach(b => {
                b.classList.remove("active");
                b.style.background = "transparent";
                b.style.color = "#222";
                b.style.borderColor = "#cde7d8";
            });
            btn.classList.add("active");
            btn.style.background = "#088178";
            btn.style.color = "white";
            btn.style.borderColor = "#088178";
            
            activeTag = btn.getAttribute("data-tag");
            filterBlogs();
        });
    });
});
