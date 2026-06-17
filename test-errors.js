const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  page.on('response', (response) => {
    if (response.status() === 404) {
      console.log('404 URL:', response.url());
    }
  });

  page.on('pageerror', (error) => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:8080/singleProduct.html', {
    waitUntil: 'networkidle2',
  });

  await browser.close();
})();
