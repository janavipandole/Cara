(function () {
  const activeRequests = new Map();

  function createAbortSignal(requestKey, options = {}) {
    const existingController = activeRequests.get(requestKey);
    if (existingController) {
      existingController.abort();
    }

    const controller = new AbortController();
    activeRequests.set(requestKey, controller);

    const signal = options.signal;
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          controller.abort();
        },
        { once: true },
      );
    }

    return controller;
  }

  window.CaraAPI = {
    fetchData: async function (url, options = {}) {
      const requestKey = options.requestKey || url;
      const controller = createAbortSignal(requestKey, options);
      const requestOptions = {
        ...options,
        signal: controller.signal,
      };

      delete requestOptions.requestKey;

      try {
        const response = await fetch(url, requestOptions);
        if (!response.ok)
          throw new Error('HTTP request failed: ' + response.status);
        return await response.json();
      } catch (e) {
        if (e.name === 'AbortError') {
          throw e;
        }
        console.error('API Request Error:', e);
        throw e;
      } finally {
        if (activeRequests.get(requestKey) === controller) {
          activeRequests.delete(requestKey);
        }
      }
    },
    abortRequest: function (requestKey) {
      const controller = activeRequests.get(requestKey);
      if (controller) {
        controller.abort();
        activeRequests.delete(requestKey);
      }
    },
  };
})();
