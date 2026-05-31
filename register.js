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
    const securityQuestion = document.getElementById('securityQuestion')?.value;
    const securityAnswer = document
      .getElementById('securityAnswer')
      ?.value.trim();

    const role =
      document.querySelector('input[name="registerRole"]:checked')?.value ||
      'USER';

    const messageBox = document.getElementById('formMessage');

    // basic validation
    if (
      !username ||
      !email ||
      !password ||
      !securityQuestion ||
      !securityAnswer
    ) {
      messageBox.innerText = 'All fields are required!';
      messageBox.style.color = 'red';
      return;
    }

    if (password !== confirmPassword) {
      messageBox.innerText = 'Passwords do not match!';
      messageBox.style.color = 'red';
      return;
    }

    // Save to client-side localStorage users database fallback
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u) => u.email === email)) {
      messageBox.innerText = 'Email already registered in local database!';
      messageBox.style.color = 'red';
      return;
    }
    users.push({
      name: username,
      email: email,
      password: password,
      role: role,
      securityQuestion: securityQuestion,
      securityAnswer: securityAnswer,
    });
    localStorage.setItem('users', JSON.stringify(users));

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

      localStorage.setItem(
        'loggedInUser',
        JSON.stringify({
          name: data.user.username,
          email: data.user.email,
          role: data.user.role,
        })
      );

      messageBox.style.color = 'green';
      messageBox.innerText = 'Account created successfully! Redirecting...';

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    } catch (err) {
      console.warn(
        'Backend API error or server offline. Using client-side mock registration fallback.'
      );
      console.error(err);

      localStorage.setItem(
        'loggedInUser',
        JSON.stringify({
          name: username,
          email: email,
          role: role,
        })
      );

      messageBox.style.color = 'green';
      messageBox.innerText =
        'Account created successfully (Local Database)! Redirecting...';

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    }
  });
});
