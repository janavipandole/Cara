// Auto Scrollspy Table of Contents Navigation
document.addEventListener("DOMContentLoaded", () => {
    const parentContainer = document.querySelector(".privacy-content") || document.querySelector("section");
    if (!parentContainer) return;

    // Create TOC sidebar
    const toc = document.createElement("div");
    toc.id = "privacy-toc-sidebar";
    toc.style.cssText = "position:sticky; top:120px; width:220px; padding:15px; background:rgba(8,129,120,0.04); border-left:3px solid #088178; align-self:flex-start; margin-right:20px; font-family:sans-serif;";
    
    const tocTitle = document.createElement("h4");
    tocTitle.textContent = "Policy Contents";
    tocTitle.style.cssText = "margin:0 0 10px 0; color:#088178; text-transform:uppercase; font-size:13px; font-weight:700;";
    toc.appendChild(tocTitle);

    const headers = document.querySelectorAll("h2, h3");
    headers.forEach((header, idx) => {
        const id = `policy-sec-${idx}`;
        header.id = id;

        const link = document.createElement("a");
        link.href = `#${id}`;
        link.textContent = header.textContent;
        link.style.cssText = "display:block; font-size:12px; margin-bottom:8px; text-decoration:none; color:#555; font-weight:500; transition:color 0.2s;";
        
        link.addEventListener("click", (e) => {
            e.preventDefault();
            header.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        toc.appendChild(link);
    });

    // Insert TOC before layout
    parentContainer.parentNode.insertBefore(toc, parentContainer);
    parentContainer.style.display = "flex";
    parentContainer.style.flexDirection = "row";
});

// Scroll observer updating table-of-contents highlight selectors dynamically.