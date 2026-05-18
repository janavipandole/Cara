document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

       if (!name || !email || !password) {
    showToast('Please fill all fields.', 'warning');
    return;
}

// Password validation
const passwordRegex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

if (!passwordRegex.test(password)) {

    showToast(
        'Password must contain:<br>' +
        '- Minimum 8 characters<br>' +
        '- One uppercase letter<br>' +
        '- One lowercase letter<br>' +
        '- One number<br>' +
        '- One special character',
        'warning'
    );

    return;
}

        let users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) {
            showToast('Email already registered.', 'error');
            return;
        }
        if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
        showToast('Username already exists.', 'error');
        return;
        }
        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));
        // On successful registration
        showToast('Signup successful! You are now logged in.', 'success');
        localStorage.setItem('loggedInUser', email);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
});