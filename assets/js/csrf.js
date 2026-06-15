// CSRF Security Header Injection Helper
class CSRFHelper {
    static getToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }
    static injectHeaders(headers = {}) {
        const token = this.getToken();
        if (token) {
            headers['X-CSRF-Token'] = token;
        }
        return headers;
    }
}
