# Issue Candidates

1. Title: fix : repair loyalty-rewards-engine module export so tests can construct the class
   Type: fix
   Category: bug
   Files: js/loyalty-rewards-engine.js
   Summary: The existing loyalty-rewards-engine.test.js requires the module and instantiates the class, but the mixed CJS/ESM export returns a namespace object, failing the suite with "LoyaltyRewardsEngine is not a constructor".
   Verification: npm test -- --reporter=default
   Conflict risk: low

2. Title: fix : restore RecentlyViewed window API missing from recently-viewed.js
   Type: fix
   Category: bug
   Files: js/recently-viewed.js
   Summary: Commit 85ff399 overwrote the 303-line recently-viewed module with a 13-line tracker, dropping window.RecentlyViewed (STORAGE_KEY, MAX_ITEMS, getRecentlyViewed, addRecentlyViewed, renderRecentlyViewed) that tests/unit/recently-viewed.test.js relies on. Restore the API while keeping page wiring.
   Verification: npm test -- --reporter=default
   Conflict risk: low

3. Title: fix : remove leftover console.log from checkout-wizard.js
   Type: fix
   Category: bug
   Files: js/checkout-wizard.js
   Summary: checkout-wizard.js logs an initialization message to the console in production, adding noise for a script that currently does nothing else.
   Verification: npm test -- --reporter=default
   Conflict risk: low

4. Title: fix : guard NaN amounts in currency-converter conversion and formatting
   Type: fix
   Category: bug
   Files: js/currency-converter.js
   Summary: convertPrice and formatCurrency produce "NaN" output when handed a non-numeric amount; guard the input so invalid amounts fall back to zero.
   Verification: npm test -- --reporter=default
   Conflict risk: low

5. Title: feat : harden coupon-validator.js against localStorage failures
   Type: feat
   Category: feature
   Files: js/coupon-validator.js
   Summary: localStorage.setItem/removeItem calls in coupon-validator.js can throw in restricted environments; wrap them in try-catch so coupon application never breaks.
   Verification: npm test -- --reporter=default
   Conflict risk: low

6. Title: feat : harden cart-coupon.js against localStorage failures
   Type: feat
   Category: feature
   Files: js/cart-coupon.js
   Summary: cart-coupon.js reads and writes localStorage without guards; add try-catch so restricted storage never breaks coupon application on the cart page.
   Verification: npm test -- --reporter=default
   Conflict risk: low

7. Title: feat : guard captcha input parsing in simple-captcha.js
   Type: feat
   Category: feature
   Files: js/simple-captcha.js
   Summary: The login captcha handler passes an ignored radix argument to getElementById and can throw when the captcha input element is missing; guard the lookup and parse the answer safely.
   Verification: npm test -- --reporter=default
   Conflict risk: low

8. Title: test : add unit tests for coupon-validator.js
   Type: test
   Category: test
   Files: tests/unit/coupon-validator.test.js
   Summary: coupon-validator.js has no test coverage; add vitest tests covering valid code application, invalid code rejection, empty input, event dispatch, and localStorage persistence.
   Verification: npm test -- --reporter=default
   Conflict risk: low

9. Title: test : add unit tests for cart-coupon.js
   Type: test
   Category: test
   Files: tests/unit/cart-coupon.test.js
   Summary: cart-coupon.js has no test coverage; add vitest tests covering coupon apply/remove flows, empty input feedback, and storage persistence.
   Verification: npm test -- --reporter=default
   Conflict risk: low

10. Title: docs : document frontend utility modules in README
   Type: docs
   Category: docs
   Files: README.md
   Summary: README lists page responsibilities but not the frontend utility modules; add a short section describing coupon-validator, currency-converter, recently-viewed, and other js/ helpers.
   Verification: npm test -- --reporter=default
   Conflict risk: low
