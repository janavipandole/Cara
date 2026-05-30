
/* ============================================================
   BLOG READING PROGRESS & TIME
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const articleBody = document.querySelector(".article-body");
    const articleMeta = document.querySelector(".article-meta");
    if (articleBody && articleMeta) {
        const words = articleBody.innerText.trim().split(/\s+/).length;
        const readTime = Math.ceil(words / 200);
        
        const readTimeBadge = document.createElement("span");
        readTimeBadge.className = "article-read-time";
        readTimeBadge.style.fontSize = "13px";
        readTimeBadge.style.color = "#999";
        readTimeBadge.style.fontWeight = "600";
        readTimeBadge.innerHTML = `• <i class="ri-book-open-line"></i> ${readTime} min read`;
        articleMeta.appendChild(readTimeBadge);

        const progBarContainer = document.createElement("div");
        progBarContainer.className = "read-progress-container";
        progBarContainer.style.position = "fixed";
        progBarContainer.style.top = document.getElementById("header") ? document.getElementById("header").offsetHeight + "px" : "0px";
        progBarContainer.style.left = "0";
        progBarContainer.style.width = "100%";
        progBarContainer.style.height = "4px";
        progBarContainer.style.backgroundColor = "rgba(0,0,0,0.1)";
        progBarContainer.style.zIndex = "1000";

        const progBar = document.createElement("div");
        progBar.className = "read-progress-bar";
        progBar.style.width = "0%";
        progBar.style.height = "100%";
        progBar.style.backgroundColor = "#088178";
        progBar.style.transition = "width 0.1s ease";
        progBarContainer.appendChild(progBar);
        document.body.appendChild(progBarContainer);

        window.addEventListener("scroll", () => {
            const rect = articleBody.getBoundingClientRect();
            const scrolled = window.scrollY - (articleBody.offsetTop - (document.getElementById("header") ? document.getElementById("header").offsetHeight : 0));
            let percent = (scrolled / rect.height) * 100;
            if (percent < 0) percent = 0;
            if (percent > 100) percent = 100;
            progBar.style.width = percent + "%";
        });
    }
});
