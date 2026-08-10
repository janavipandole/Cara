const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('fetchData aborts the previous request for the same request key', async () => {
  const scriptPath = path.join(__dirname, '..', 'assets', 'js', 'api.js');
  const script = fs.readFileSync(scriptPath, 'utf8');

  const context = {
    window: {},
    console,
    AbortController: global.AbortController,
    fetch: async (_url, options = {}) => {
      const signal = options.signal;

      return new Promise((resolve, reject) => {
        const abortHandler = () => {
          reject(
            Object.assign(new Error('The operation was aborted.'), {
              name: 'AbortError',
            }),
          );
        };

        if (signal) {
          signal.addEventListener('abort', abortHandler, { once: true });
        }

        setTimeout(() => {
          if (signal && signal.aborted) {
            return;
          }

          resolve({
            ok: true,
            json: async () => ({ ok: true }),
          });
        }, 20);
      });
    },
  };

  vm.createContext(context);
  vm.runInContext(script, context);

  const api = context.window.CaraAPI;
  const firstRequest = api.fetchData('/api/products/1', {
    requestKey: 'product-details',
  });
  const secondRequest = api.fetchData('/api/products/2', {
    requestKey: 'product-details',
  });

  await assert.rejects(firstRequest, (error) => error.name === 'AbortError');
  await assert.doesNotReject(secondRequest);
});
