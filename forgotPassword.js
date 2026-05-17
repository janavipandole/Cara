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
        showToast('Please enter a valid email!', 'warning');
        return;
    }
    if (!newPass || newPass.length < 6) {
        showToast('Password must be at least 6 characters!', 'warning');
        return;
    }

    /* check if email exists in localStorage */
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
        showToast('No account found with this email!', 'error');
        return;
    }

    /* update password */
    users[userIndex].password = newPass;
    localStorage.setItem('users', JSON.stringify(users));

    closeForgotPassword();
    showToast('Password reset successful! Please login.', 'success');
}

/* toast function — self-contained for pages that don't load app.js */
if (typeof showToast === 'undefined') {
    function showToast(message, type) {
        type = type || 'success';
        var container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        var icons = {
            success: 'fa-circle-check',
            error: 'fa-circle-xmark',
            warning: 'fa-triangle-exclamation',
            info: 'fa-circle-info'
        };
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.innerHTML =
            '<i class="fa-solid ' + (icons[type] || icons.success) + ' toast-icon"></i>' +
            '<span class="toast-msg">' + message + '</span>' +
            '<button class="toast-close" aria-label="Close notification">&times;</button>' +
            '<div class="toast-progress"></div>';
        toast.querySelector('.toast-close').addEventListener('click', function() {
            dismissToast(toast);
        });
        container.appendChild(toast);
        setTimeout(function() { dismissToast(toast); }, 4000);
    }

    function dismissToast(toast) {
        if (!toast || toast.classList.contains('toast-hiding')) return;
        toast.classList.add('toast-hiding');
        toast.addEventListener('animationend', function() { toast.remove(); });
    }
}