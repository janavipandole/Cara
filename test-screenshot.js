const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto('http://localhost:8080/singleProduct.html', {
    waitUntil: 'networkidle2',
  });
  await page.screenshot({ path: 'test-screenshot.png', fullPage: true });

  await browser.close();
})();
