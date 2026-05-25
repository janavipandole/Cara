//let the html elements load before the js runs
document.addEventListener("DOMContentLoaded", function() {
    const reviewForm = document.getElementById("reviewForm");
    const reviewsList = document.getElementById("reviews-list");

    const savedReviews = JSON.parse(localStorage.getItem("productReviews")) || [];
    function displayReview(name, rating, text) {
        let starString = "★".repeat(rating) + "☆".repeat(5 - rating);
        
        
        const reviewDiv = document.createElement("div");
        reviewDiv.className = "single-review";
        reviewDiv.innerHTML = `
            <div class="review-header">
                <strong>${name}</strong>
                <span class="stars">${starString}</span>
            </div>
            <p>${text}</p>
        `;
        reviewsList.appendChild(reviewDiv);
    } 
    savedReviews.forEach(review => {
        displayReview(review.name, review.rating, review.text);
    });
    reviewForm.addEventListener("submit", function (e) { 
        e.preventDefault();
        
        //Getting the values given by the user
        const name = document.getElementById("reviewerName").value;
        const rating = parseInt(document.getElementById("rating").value);
        const text = document.getElementById("reviewText").value;

        //display values
        displayReview(name, rating, text);

        // Saving in local storage to prevent deletion as we refresh
        savedReviews.push({name: name, rating: rating, text: text});
        localStorage.setItem("productReviews", JSON.stringify(savedReviews));
        
        //Again reseting the form after submission so that new user can fill their information
        reviewForm.reset();
        alert("Thank you for your review!");
    });
});

                    
        

