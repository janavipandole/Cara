// Shimmer Skeleton Loader Handler
document.addEventListener("DOMContentLoaded", () => {
    const productsContainer = document.querySelector(".pro-container");
    if (!productsContainer) return;

    // Simulate skeleton state loading
    const showSkeletons = () => {
        const originalContent = productsContainer.innerHTML;
        productsContainer.innerHTML = "";

        for (let i = 0; i < 4; i++) {
            const skeletonCard = document.createElement("div");
            skeletonCard.className = "pro skeleton-card";
            skeletonCard.style.cssText = "height:350px; background:#f6f7f8; border-radius:20px; border:1px solid #cce7d0; display:flex; flex-direction:column; padding:10px 12px; justify-content:space-between; animation: shimmer 1.5s infinite linear; background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%); background-size: 800px 104px;";
            productsContainer.appendChild(skeletonCard);
        }

        const style = document.createElement("style");
        style.innerHTML = `
            @keyframes shimmer {
                0% { background-position: -468px 0; }
                100% { background-position: 468px 0; }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            productsContainer.innerHTML = originalContent;
        }, 1500);
    };

    showSkeletons();
});
