(function() {
    window.CaraAPI = {
        fetchData: async function(url, options = {}) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) throw new Error("HTTP request failed: " + response.status);
                return await response.json();
            } catch (e) {
                console.error("API Request Error:", e);
                throw e;
            }
        }
    };
})();
