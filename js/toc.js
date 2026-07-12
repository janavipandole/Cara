document.addEventListener("DOMContentLoaded", () => {

    const policyPage = document.querySelector("#policy-page");
    if (!policyPage) return;

    // Create wrapper
    const wrapper = document.createElement("div");
    wrapper.id = "policy-layout";

    wrapper.style.display = "flex";
    wrapper.style.alignItems = "flex-start";
    wrapper.style.maxWidth = "1200px";
    wrapper.style.margin = "0 auto";
    wrapper.style.gap = "25px";

    policyPage.parentNode.insertBefore(wrapper, policyPage);
    wrapper.appendChild(policyPage);

    // Create sidebar
    const toc = document.createElement("div");
    toc.id = "privacy-toc-sidebar";

    toc.style.cssText = `
        position:sticky;
        top:120px;
        width:220px;
        padding:15px;
        background:rgba(8,129,120,.04);
        border-left:3px solid #088178;
        flex-shrink:0;
    `;

    wrapper.prepend(toc);

    // Only policy headings
    const headers = policyPage.querySelectorAll(".policy-section h2");

    headers.forEach((header, index) => {

        header.id = `policy-sec-${index}`;

        const link = document.createElement("a");

        link.href = "#" + header.id;
        link.textContent = header.textContent;

        link.style.cssText = `
            display:block;
            margin-bottom:8px;
            color:#555;
            text-decoration:none;
        `;

        toc.appendChild(link);
    });

});