document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

        if (!name || !email || !password) {
            alert('Please fill all fields.');
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
        // On successful registration
        showToast('Signup successful! Welcome to Cara.');
        localStorage.setItem('loggedInUser', email);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
});