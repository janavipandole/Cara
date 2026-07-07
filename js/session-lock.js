// Automated Inactivity Logout Monitor
document.addEventListener("DOMContentLoaded", () => {
    let timeout;
    const maxInactivity = 15 * 60 * 1000; // 15 Minutes

    const resetTimer = () => {
        clearTimeout(timeout);
        timeout = setTimeout(lockSession, maxInactivity);
    };

    const lockSession = () => {
        localStorage.removeItem("cara_user_session");
        localStorage.removeItem("cara_user_token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("cara_user_email");
        localStorage.removeItem("cara_user_name");
        localStorage.removeItem("cara_user_role");
        console.warn("Session cleared due to inactivity.");
    };

    // User activity listeners
    ["click", "mousemove", "keypress", "scroll", "touchstart"].forEach(event => {
        document.addEventListener(event, resetTimer);
    });

    resetTimer();
});
