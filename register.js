document.addEventListener('DOMContentLoaded', () => {
  console.log('register.js loaded');

  const passwordInput = document.getElementById('registerPassword');
  const strengthContainer = document.getElementById('strength-meter-container');
  const strengthBar = document.getElementById('strength-meter-bar');
  const strengthText = document.getElementById('strength-text');

  if (passwordInput && strengthContainer && strengthBar && strengthText) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      if (!val) {
        strengthContainer.style.display = 'none';
        strengthBar.style.width = '0%';
        return;
      }

      strengthContainer.style.display = 'block';

      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[a-z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      let width = '0%';
      let color = '#ef4444'; // Red
      let label = 'Very Weak';

      switch (score) {
        case 1:
          width = '20%';
          color = '#ef4444'; // Red
          label = 'Very Weak';
          break;
        case 2:
          width = '40%';
          color = '#f97316'; // Orange
          label = 'Weak';
          break;
        case 3:
          width = '60%';
          color = '#eab308'; // Amber
          label = 'Medium';
          break;
        case 4:
          width = '80%';
          color = '#22c55e'; // Green
          label = 'Strong';
          break;
        case 5:
          width = '100%';
          color = '#06b6d4'; // Teal
          label = 'Very Strong';
          break;
        default:
          width = '0%';
          color = '#ef4444';
          label = 'Very Weak';
      }

      strengthBar.style.width = width;
      strengthBar.style.backgroundColor = color;
      strengthText.textContent = `Password Strength: ${label}`;
      strengthText.style.color = color;
    });
  }

  const btn = document.getElementById('registerSubmitBtn');

  if (!btn) {
    console.error('Submit button not found!');
    return;
  }

  btn.addEventListener('click', async (e) => {
    e.preventDefault();

    const username = document.getElementById('registerUsername')?.value.trim();
    const email = document.getElementById('registerEmail')?.value.trim();
    const password = document.getElementById('registerPassword')?.value.trim();
    const confirmPassword = document
      .getElementById('confirmPassword')
      ?.value.trim();

    const role =
      document.querySelector('input[name="registerRole"]:checked')?.value ||
      'USER';

    const messageBox = document.getElementById('formMessage');

    // basic validation
    if (!username || !email || !password) {
      messageBox.innerText = 'All fields are required!';
      messageBox.style.color = 'red';
      return;
    }

    if (password !== confirmPassword) {
      messageBox.innerText = 'Passwords do not match!';
      messageBox.style.color = 'red';
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      console.log('Success:', data);

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      messageBox.style.color = 'green';
      messageBox.innerText = 'Account created successfully! Redirecting...';

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    } catch (err) {
      console.error(err);
      messageBox.style.color = 'red';
      messageBox.innerText = err.message;
    }
  });
});
