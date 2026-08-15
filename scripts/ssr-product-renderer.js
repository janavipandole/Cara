/**
 * Mock Server-Side Rendering (SSR) Engine for Product Pages
 * Simulates a Next.js/Nuxt.js style SSR pipeline to pre-render 
 * product HTML and inject dynamic SEO meta tags before sending to the client.
 */

export class SSRProductRenderer {
  constructor(apiEndpoint) {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Mocks the `getServerSideProps` functionality.
   * Fetches data on the server before rendering the HTML.
   */
  async getServerSideProps(productId) {
    console.log(`[SSR] Fetching data for product ID: ${productId} on the server...`);
    
    // Simulating database/API fetch latency
    await new Promise(resolve => setTimeout(resolve, 150));

    // Mock product data
    return {
      id: productId,
      name: 'Premium Insulated Winter Parka',
      description: 'Stay warm this winter with our high-quality insulated parka. Water resistant and stylish.',
      price: 129.99,
      image: 'https://cara.local/images/products/winter-parka.jpg',
      inStock: true
    };
  }

  /**
   * Generates dynamic SEO meta tags based on the fetched product data.
   */
  generateMetaTags(product) {
    return `
      <title>${product.name} | Cara Store</title>
      <meta name="description" content="${product.description}" />
      
      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="product" />
      <meta property="og:url" content="https://cara.local/product/${product.id}" />
      <meta property="og:title" content="${product.name}" />
      <meta property="og:description" content="${product.description}" />
      <meta property="og:image" content="${product.image}" />
      
      <!-- Twitter -->
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://cara.local/product/${product.id}" />
      <meta property="twitter:title" content="${product.name}" />
      <meta property="twitter:description" content="${product.description}" />
      <meta property="twitter:image" content="${product.image}" />
    `;
  }

  /**
   * Hydrates a base HTML template with product data and meta tags.
   */
  async renderProductPage(productId) {
    try {
      const product = await this.getServerSideProps(productId);
      const metaTags = this.generateMetaTags(product);

      // Constructing the final HTML string to be sent to the browser
      const hydratedHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${metaTags}
          <link rel="stylesheet" href="/style.css">
        </head>
        <body>
          <div id="ssr-root">
            <main class="product-details">
              <h1>${product.name}</h1>
              <img src="${product.image}" alt="${product.name}" />
              <p class="price">$${product.price.toFixed(2)}</p>
              <p class="desc">${product.description}</p>
              <button ${!product.inStock ? 'disabled' : ''}>
                ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </main>
          </div>
          <!-- Client-side hydration script would load here -->
          <script src="/js/hydration.js"></script>
        </body>
        </html>
      `;

      console.log(`[SSR] Page rendered successfully for ${product.name}`);
      return hydratedHtml;

    } catch (error) {
      console.error('[SSR] Failed to render product page:', error);
      throw new Error('Internal Server Error during SSR');
    }
  }
}

// Usage Example for an Express Backend:
// const renderer = new SSRProductRenderer('http://api.cara.local');
//
// app.get('/product/:id', async (req, res) => {
//   try {
//     const html = await renderer.renderProductPage(req.params.id);
//     res.status(200).send(html);
//   } catch (error) {
//     res.status(500).send('<h1>Something went wrong</h1>');
//   }
// });
