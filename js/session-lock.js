// Automated Inactivity Logout Monitor (authenticated sessions only)
document.addEventListener('DOMContentLoaded', () => {
  let timeout;
  const maxInactivity = 15 * 60 * 1000; // 15 Minutes
  const apiBase = window.CARA_API_BASE_URL || '';

  const resetTimer = () => {
    clearTimeout(timeout);
    timeout = setTimeout(lockSession, maxInactivity);
  };

  const lockSession = () => {
    // Clear any legacy identity values left over from before tokens moved
    // to httpOnly cookies.
    localStorage.removeItem('cara_user_session');
    localStorage.removeItem('cara_user_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('cara_user_email');
    localStorage.removeItem('cara_user_name');
    localStorage.removeItem('cara_user_role');

    // The real session lives in httpOnly cookies, which JS can't clear
    // directly, so ask the server to invalidate them. Use the same
    // fetchWithTimeout wrapper as the /me check so a hung request cannot
    // delay the redirect to login indefinitely.
    fetchFunc(`${apiBase}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
      .catch((err) => console.warn('Failed to end session on server:', err))
      .finally(() => {
        window.location.href = 'login.html';
      });
  };

  const startMonitor = () => {
    ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
      (event) => {
        document.addEventListener(event, resetTimer);
      },
    );
    resetTimer();
  };

  const fetchFunc =
    typeof fetchWithTimeout === 'function' ? fetchWithTimeout : fetch;

  fetchFunc(`${apiBase}/api/auth/me`, {
    method: 'GET',
    credentials: 'include',
  })
    .then((res) => {
      if (res.ok) {
        startMonitor();
      }
    })
    .catch(() => {
      // Anonymous / offline visitors should keep shopping.
    });
});
