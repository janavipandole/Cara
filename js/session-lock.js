// Automated Inactivity Logout Monitor
document.addEventListener('DOMContentLoaded', () => {
  let timeout;
  const maxInactivity = 15 * 60 * 1000; // 15 Minutes

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
    // directly, so ask the server to invalidate them.
    const apiBase = window.CARA_API_BASE_URL || '';
    fetch(`${apiBase}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
      .catch((err) => console.warn('Failed to end session on server:', err))
      .finally(() => {
        console.info('Session cleared due to inactivity.');
        window.location.href = 'login.html';
      });
  };

  // User activity listeners
  ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
    (event) => {
      document.addEventListener(event, resetTimer);
    },
  );

  resetTimer();
});