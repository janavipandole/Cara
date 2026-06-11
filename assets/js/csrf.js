// CSRF Protection Helper Module
class CSRFProtection {
  static getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  static injectToken(headers = {}) {
    const token =
      this.getCookie('csrftoken') ||
      document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
    return headers;
  }
}
