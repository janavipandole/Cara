document.addEventListener("DOMContentLoaded", function () {
  var forms = document.querySelectorAll(".newsletter-form");
  var API_BASE = window.CARA_API_BASE_URL || "http://127.0.0.1:8000";

  forms.forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var email = input ? input.value.trim() : "";
      var button = form.querySelector('button[type="submit"]');

      if (!email) {
        if (typeof showToast === "function") {
          showToast("Please enter your email address", "warning");
        }
        return;
      }

      if (button) {
        button.disabled = true;
        button.textContent = "Subscribing...";
      }

      fetch(API_BASE + "/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      })
        .then(function (res) {
          if (!res.ok) {
            return res.json().then(function (data) {
              throw new Error(data.detail || "Subscription failed");
            });
          }
          return res.json();
        })
        .then(function () {
          if (typeof showToast === "function") {
            showToast("Successfully subscribed to newsletter!", "success");
          }
          if (input) input.value = "";
        })
        .catch(function (err) {
          if (typeof showToast === "function") {
            showToast(err.message, "error");
          }
        })
        .finally(function () {
          if (button) {
            button.disabled = false;
            button.textContent = "Sign Up";
          }
        });
    });
  });
});
