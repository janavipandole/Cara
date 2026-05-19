document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("userName").textContent = user.name;
    document.getElementById("userEmail").textContent = user.email;

    // Optional (since you don’t collect mobile yet)
    const mobileEl = document.getElementById("userMobile");
    if (mobileEl) {
        mobileEl.textContent = user.mobile || "Not provided";
    }
});