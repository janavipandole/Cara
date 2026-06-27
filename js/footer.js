const footerData = {
    logo: "images/logo.png",

    contact: {
        address: "562 Wellington Road, Street 32, San Francisco",
        phone: "+01 2222 365 / (+91) 01 2345 6789",
        hours: "10:00 - 18:00, Mon - Sat"
    },

    social: [
        {
            icon: "fa-brands fa-x-twitter",
            label: "X (formerly Twitter)",
            link: "https://x.com/JanaviPandole"
        },
        {
            icon: "fab fa-github",
            label: "GitHub",
            link: "https://github.com/janavipandole"
        },
        {
            icon: "fab fa-linkedin",
            label: "LinkedIn",
            link: "https://www.linkedin.com/in/janavi-pandole-80a7b2290"
        },
        {
            icon: "fab fa-youtube",
            label: "YouTube",
            link: "https://www.youtube.com/@JanaviPandole"
        }
    ],

    about: [
        { text: "About Us", href: "about.html" },
        { text: "Delivery Information", href: "delivery.html" },
        { text: "Privacy Policy", href: "privacy.html" },
        { text: "Terms and Conditions", href: "terms.html" },
        { text: "Contact Us", href: "contact.html" }
    ],

    account: [
        { text: "Sign In", href: "login.html" },
        { text: "View Cart", href: "cart.html" },
        { text: "My Wishlist", href: "wishlist.html" },
        { text: "Track My Order", href: "cart.html" },
        { text: "Help", href: "contact.html" }
    ],

    newsletter: {
        title: "Newsletter",
        description: "Get email updates about our latest shop and",
        highlight: "special offers."
    },

    apps: {
        appStore: "images/pay/app.jpg",
        playStore: "images/pay/play.jpg"
    },

    payments: [
        {
            icon: "fab fa-cc-visa",
            link: "https://www.visa.com",
            label: "Visa"
        },
        {
            icon: "fab fa-cc-mastercard",
            link: "https://www.mastercard.com",
            label: "Mastercard"
        },
        {
            icon: "fab fa-cc-paypal",
            link: "https://www.paypal.com",
            label: "PayPal"
        },
        {
            icon: "fab fa-cc-amex",
            link: "https://www.americanexpress.com",
            label: "American Express"
        },
        {
            icon: "fab fa-cc-stripe",
            link: "https://stripe.com",
            label: "Stripe"
        }
    ],

    copyright: "© Cara 2026. All rights reserved.",
    license: {
        text: "MIT License",
        href: "license.html"
    }
};

const socialHTML = footerData.social.map(item => `
<a href="${item.link}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}">
    <i class="${item.icon}"></i>
</a>
`).join("");

const aboutHTML = footerData.about.map(item => `
<a href="${item.href}">${item.text}</a>
`).join("");

const accountHTML = footerData.account.map(item => `
<a href="${item.href}">${item.text}</a>
`).join("");

const paymentHTML = footerData.payments.map(item => `
<a href="${item.link}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}">
    <i class="${item.icon}"></i>
</a>
`).join("");

document.getElementById("footer").innerHTML = `
<footer class="section-p1">

    <div class="col">

        <img class="logo" src="${footerData.logo}" alt="Cara Logo">

        <h4>Contact</h4>

        <p><strong>Address:</strong> ${footerData.contact.address}</p>

        <p><strong>Phone:</strong> ${footerData.contact.phone}</p>

        <p><strong>Hours:</strong> ${footerData.contact.hours}</p>

        <div class="follow">

            <h4>Follow us</h4>

            <div class="icon">
                ${socialHTML}
            </div>

        </div>

    </div>

    <div class="col">

        <h4>About</h4>

        ${aboutHTML}

    </div>

    <div class="col">

        <h4>My Account</h4>

        ${accountHTML}

    </div>

    <div class="col newsletter-footer">

        <h4>${footerData.newsletter.title}</h4>

        <p>
            ${footerData.newsletter.description}
            <span>${footerData.newsletter.highlight}</span>
        </p>

        <form class="newsletter-form">

            <input
                type="email"
                placeholder="Your email address"
                required
            >

            <button class="normal" type="submit">
                Sign Up
            </button>

        </form>

    </div>

    <div class="col install">

        <h4>Install App</h4>

        <p>From App Store or Google Play</p>

        <div class="row">

            <img src="${footerData.apps.appStore}" alt="App Store">

            <img src="${footerData.apps.playStore}" alt="Google Play">

        </div>

        <p>Secured Payment Gateways</p>

        <div class="payment-icons">
            ${paymentHTML}
        </div>

    </div>

    <div class="copyright">

        <p>

            ${footerData.copyright}

            |

            <a href="${footerData.license.href}">
                ${footerData.license.text}
            </a>

        </p>

    </div>

</footer>
`;