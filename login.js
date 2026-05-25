document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');
  const passwordInput = document.getElementById('loginPassword');
  const togglePassword = document.getElementById('togglePassword');
  const toggleIcon = document.getElementById('toggleIcon');
  const rememberMe = document.getElementById('rememberMe');

  // ── Password Visibility Toggle Logic ──
  if (passwordInput && togglePassword && toggleIcon) {
    togglePassword.addEventListener('click', function () {
      // Toggle the input field's type attribute
      const isPasswordHidden = passwordInput.type === 'password';
      passwordInput.type = isPasswordHidden ? 'text' : 'password';

      // Toggle the Remix Icon classes cleanly without modifying innerHTML structure
      if (isPasswordHidden) {
        toggleIcon.classList.remove('ri-eye-line');
        toggleIcon.classList.add('ri-eye-off-line');
      } else {
        toggleIcon.classList.remove('ri-eye-off-line');
        toggleIcon.classList.add('ri-eye-line');
      }
    });
  }

  if (!form) return;

  // ── Form Submission Logic ──
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      showToast('Please fill all fields.', 'warning');
      return;
    }

    // ── Loading state: disable button & show spinner ──
    const submitBtn = form.querySelector('.login-btn');
    if (submitBtn) {
      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;
    }

    // Simulate async request (replace with real API call)
    setTimeout(function () {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(
          (u) => u.email === email && u.password === password
        );

        if (!user) {
          showToast('Invalid email or password', 'error');
          return;
        }

        localStorage.setItem('loggedInUser', email);
        sessionStorage.setItem('loggedInUser', email);

        if (rememberMe && !rememberMe.checked) {
          sessionStorage.setItem('loggedInUser', email);
        }

const selectedRoleInput = document.querySelector('input[name="loginRole"]:checked');
const selectedRole = selectedRoleInput ? selectedRoleInput.value : 'USER';

if (user) {
    const userRole = user.role || 'USER';

    // Role mismatch check
    if (userRole !== selectedRole) {
        showToast(`This account is registered as ${userRole}. Please select the correct role.`, 'error');
        if (submitBtn) {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
        return;
    }

    // Store full user session
    localStorage.setItem('loggedInUser', JSON.stringify({
        name: user.username,
        email: user.email,
        role: userRole
    }));

    showToast(`Welcome back, ${user.username}!`, 'success');

    setTimeout(function () {
        if (userRole === 'ADMIN') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    }, 1000);

} else {
    showToast("Invalid email or password", "error");
    if (submitBtn) {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
    }
}
});
