
/* ============================================================
   CUSTOMER REVIEWS SYSTEM
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const starContainer = document.getElementById("starInput");
    const reviewForm = document.getElementById("reviewForm");
    const reviewsList = document.getElementById("reviewsList");
    const avgRating = document.getElementById("avgRating");

    if (!starContainer) return;

    let selectedRating = 0;

    // Handle interactive star hover & clicks
    const stars = starContainer.querySelectorAll(".star-btn");
    stars.forEach(star => {
        star.addEventListener("click", () => {
            selectedRating = parseInt(star.getAttribute("data-star"));
            stars.forEach((s, idx) => {
                if (idx < selectedRating) {
                    s.className = "ri-star-fill star-btn";
                } else {
                    s.className = "ri-star-line star-btn";
                }
            });
        });
    });

    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            if (selectedRating === 0) {
                alert("Please select a star rating!");
                return;
            }

            const name = document.getElementById("reviewerName").value.trim();
            const text = document.getElementById("reviewerText").value.trim();

            // Create new review element
            const newReview = document.createElement("div");
            newReview.style.borderBottom = "1px solid #eee";
            newReview.style.paddingBottom = "15px";
            newReview.style.marginBottom = "15px";
            newReview.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <strong style="color: #222;">${name}</strong>
                    <span style="color: #ffbd27;">${'<i class="ri-star-fill"></i>'.repeat(selectedRating)}${'<i class="ri-star-line"></i>'.repeat(5 - selectedRating)}</span>
                </div>
                <p style="font-size: 14px; color: #6c757d; line-height: 1.6;">${text}</p>
            `;

            reviewsList.prepend(newReview);
            reviewForm.reset();
            selectedRating = 0;
            stars.forEach(s => s.className = "ri-star-line star-btn");
            
            // Show toast if accessible
            if (typeof showToast === "function") {
                showToast("Review submitted successfully! Thank you.", "success");
            } else {
                alert("Review submitted successfully!");
            }
        });
    }
});

// Logic rendering star-ratings and client comment listings under local storage caches.