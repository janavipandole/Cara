# Cara E-Commerce - Issues & Pull Request

---

## Issue 1: Broken HTML in blog.html

The closing `</h4>` tag on line 129 was missing its opening angle bracket. It read `Trends/h4>` instead of `Trends</h4>`. The browser treats everything after that as part of an unclosed heading, so the layout breaks from that point.

**Fix:** Replaced `Trends/h4>` with `Trends</h4>`.

---

## Issue 2: Duplicate CSS and invalid properties in style.css

- **Duplicate `#pagination` block.** The pagination styles showed up twice (lines 752-763 and 1742-1790). The first block only had basic centering and link colors. The second had hover states, disabled states, and dark mode overrides. The first one was dead weight.

- **`button.white` had `border: none` immediately followed by `border: 1px solid white`.** The second value always wins, so `border: none` does nothing. Also had `text-decoration: none` on a button, which does nothing.

**Fix:** Removed the first `#pagination` block. Cleaned up `button.white` by dropping the dead `border: none` and the useless `text-decoration`.

---

## Issue 3: Multiple typos across pages

Found across 7 HTML files:

| File | Before | After |
|---|---|---|
| index.html | "upcomming season" | "upcoming season" |
| index.html | "spring/smmer" | "spring/summer" |
| index.html | "NEW FOOTEEAR COLLECTION" | "NEW FOOTWEAR COLLECTION" |
| index.html, shop.html, blog.html, about.html, singleProduct.html, cart.html, license.html | "App Store ro Google Play" | "App Store or Google Play" |
| index.html, singleProduct.html | "New Morden Design" | "New Modern Design" |
| about.html | "scollamount" | "scrollamount" |
| blog.html | "Skater Girls Iterms" | "Skater Girl Items" |

---

## Issue 4: Broken navigation link in footer

The "My Account" column in the footer had two "View Cart" links. One pointed to `#` (a dead placeholder), the other pointed to `cart.html`. Having two identical labels for different URLs is confusing for users and screen readers.

**Fix:** Removed the dead `href="#"` link, kept the working one pointing to `cart.html`.

---

## Issue 5: Newsletter inputs use `type="text"` instead of `type="email"`

Every newsletter signup form across all pages used `type="text"` for the email field. That means no client-side email validation, and mobile browsers won't show the email keyboard layout.

**Fix:** Changed all newsletter email inputs from `type="text"` to `type="email"`.

---

## Issue 6: Missing password confirmation check in registration

The registration form had a "Confirm Password" field but never actually checked if it matched the password field. Also, passwords were stored in plaintext in localStorage with no minimum length check.

**Fix:** Added a check that confirm-password matches password. Added a minimum 6-character requirement. The plaintext storage is still there (you'd need a backend to fix that properly), but at least the form won't silently accept mismatched passwords anymore.

---

## Pull Request

### Title

Fix HTML, CSS, typo, and form validation issues across the site

### Description

This fixes a handful of bugs and small issues I came across while going through the codebase:

- A broken HTML tag in blog.html that was messing up the page layout
- Duplicate CSS blocks in style.css and a dead property on the white button class
- A bunch of typos - "ro" instead of "or", "Morden" instead of "Modern", "scollamount" instead of "scrollamount", and a few others
- Two "View Cart" links in the footer where one was a dead placeholder
- Newsletter forms using type="text" for email fields instead of type="email"
- Registration form that let you submit without checking if the passwords actually matched

Most of these are small fixes, but they add up. The blog page renders properly now, the CSS is less confusing, and the registration form won't let mismatched passwords through anymore.
