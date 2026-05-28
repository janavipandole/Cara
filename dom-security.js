(function() {
    function sanitizeHTML(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"'/]/g, function(m) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '/': '&#x2F;'
            };
            return map[m];
        });
    }
    window.DOMSecurity = {
        sanitizeHTML: sanitizeHTML
    };
})();
