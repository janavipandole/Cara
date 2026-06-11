document.addEventListener('DOMContentLoaded', () => {
  console.log('register.js loaded');

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
