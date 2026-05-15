/* csritik-max - forgotPassword.js */

/* opens the modal */
function openForgotPassword() {
    document.getElementById('fp-overlay').classList.add('active');
    document.getElementById('fp-email').value = '';
    document.getElementById('fp-newpass').value = '';
}

/* closes the modal */
function closeForgotPassword() {
    document.getElementById('fp-overlay').classList.remove('active');
}

/* close modal when clicking outside */
document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('fp-overlay');
    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) closeForgotPassword();
        });
    }
});

/* main reset logic */
function submitForgotPassword() {
    const email = document.getElementById('fp-email').value.trim();
    const newPass = document.getElementById('fp-newpass').value;

    /* validation */
    if (!email || !email.includes('@')) {
        showToast('⚠️ Please enter a valid email!', true);
        return;
    }
    if (!newPass || newPass.length < 6) {
        showToast('⚠️ Password must be at least 6 characters!', true);
        return;
    }

    /* check if email exists in localStorage */
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
        showToast('⚠️ No account found with this email!', true);
        return;
    }

    /* update password */
    users[userIndex].password = newPass;
    localStorage.setItem('users', JSON.stringify(users));

    closeForgotPassword();
    showToast('✅ Password reset successful! Please login.');
}

/* toast function */
function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const icon = document.getElementById('toast-icon');
    if (icon) icon.textContent = isError ? '⚠️' : '✅';
    document.getElementById('toast-msg').textContent = msg;
    toast.style.background = isError ? '#dc2626' : '#1e293b';
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}