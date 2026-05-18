document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('loginPassword');
    const togglePassword = document.getElementById('togglePassword');

    if (passwordInput && togglePassword) {

    togglePassword.addEventListener('click', function () {

        const isPasswordHidden = passwordInput.type === 'password';

        passwordInput.type = isPasswordHidden ? 'text' : 'password';

        this.innerHTML = isPasswordHidden

            ? '<i class="ri-eye-off-line"></i>'
            : '<i class="ri-eye-line"></i>';
    });
    
}

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            alert('Please fill all fields.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // On successful login
            localStorage.setItem('loggedInUser', email);
            window.location.href = 'index.html';
        } else {
            showToast("Invalid email or password", "error");
        }
    });
});


function showToast(message, type = "success") { const toast = document.getElementById("toast"); const toastMsg = document.getElementById("toast-msg"); const toastIcon = document.getElementById("toast-icon");  if (!toast) { alert(message); return; }  toastMsg.innerText = message; if (type === "success") { toastIcon.innerHTML = "✅"; } else { toastIcon.innerHTML = "❌"; } toast.className = `toast show ${type}`;  setTimeout(() => { toast.classList.remove("show"); }, 3000); }  document.addEventListener("DOMContentLoaded", () => { const googleBtn = document.getElementById("googleLogin"); if (googleBtn) { googleBtn.addEventListener("click", () => { showToast( "Google Login Coming Soon", "success" ); }); }  const githubBtn = document.getElementById("githubLogin"); if (githubBtn) { githubBtn.addEventListener("click", () => { showToast( "GitHub Login Coming Soon", "success" ); }); } });