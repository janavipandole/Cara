document.addEventListener("DOMContentLoaded", function () {
    if (!localStorage.getItem("cookieConsent")) {
        const consentBox = document.createElement("div");
        consentBox.id = "cookie-consent-box";
        consentBox.style.position = "fixed";
        consentBox.style.bottom = "0";
        consentBox.style.width = "100%";
        consentBox.style.backgroundColor = "#333";
        consentBox.style.color = "#fff";
        consentBox.style.padding = "15px";
        consentBox.style.textAlign = "center";
        consentBox.style.zIndex = "9999";
        consentBox.innerHTML = `
            We use cookies to enhance your experience. 
            <button id="accept-cookies" style="margin-left:15px; padding:5px 15px; background:#088178; color:#fff; border:none; cursor:pointer;">Accept</button>
        `;
        document.body.appendChild(consentBox);

        document.getElementById("accept-cookies").addEventListener("click", function () {
            localStorage.setItem("cookieConsent", "true");
            consentBox.style.display = "none";
        });
    }
});
