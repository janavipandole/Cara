console.log("REGISTER JS LOADED");
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!name || !email || !password) {
            alert('Please fill all fields.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users') || '[]');

        if (users.find(u => u.email === email)) {
            showToast('Email already registered.', 'error');
            return;
        }

        users.push({
            name,
            email,
            password,
            mobile: "",
            orders: []
        });

        localStorage.setItem('users', JSON.stringify(users));

        alert('Signup successful!');

        window.location.href = 'login.html';
    });
});