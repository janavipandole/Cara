
/* ============================================================
   SCROLL TRIGGERED NEWSLETTER SUBSCRIPTION TOAST
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const dialog = document.getElementById("newsletter-toast-dialog");
    const closeBtn = document.getElementById("close-news-toast");
    const form = document.getElementById("newsToastForm");

    if (!dialog) return;

    // Check if dismissed or already signed up
    const alreadySubscribed = localStorage.getItem("newsletter_subscribed") === "true";
    const dismissedTime = localStorage.getItem("newsletter_toast_dismissed");
    
    // Minimum 1 day between prompts if dismissed
    const oneDay = 24 * 60 * 60 * 1000;
    const canShow = !alreadySubscribed && (!dismissedTime || (Date.now() - parseInt(dismissedTime)) > oneDay);

    if (canShow) {
        let triggered = false;
        window.addEventListener("scroll", () => {
            if (triggered) return;
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > 40) {
                triggered = true;
                dialog.style.bottom = "30px";
            }
        });
    }

    closeBtn.addEventListener("click", () => {
        dialog.style.bottom = "-300px";
        localStorage.setItem("newsletter_toast_dismissed", Date.now().toString());
    });

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("newsToastEmail").value;
            localStorage.setItem("newsletter_subscribed", "true");
            dialog.style.bottom = "-300px";
            
            if (typeof showToast === "function") {
                showToast("Coupon active! Try 'CARA20' in checkout.", "success");
            } else {
                alert("Subscribed! Use code CARA20 to claim your 20% off.");
            }
        });
    }
});
