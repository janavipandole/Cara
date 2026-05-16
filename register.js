document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return false;
        const domain = email.split('@')[1].toLowerCase();
        return domain === 'gmail.com';
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

        if (!name || !email || !password) {
            alert('Please fill all fields.');
            return;
        }

        if (!isValidEmail(email)) {
            alert('Enter a valid gmail address');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users') || '[]');

        if (users.find(u => u.email === email)) {
            alert('Email already registered.');
            return;
        }

        if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
            alert('Username already exists.');
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));

        alert('Signup successful! You are now logged in.');
        localStorage.setItem('loggedInUser', email);
        window.location.href = 'index.html';
    });
});
