/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Registration Form', () => {
    beforeEach(() => {
        // Load the HTML into Jest's jsdom document
        const html = fs.readFileSync(path.resolve(__dirname, 'register.html'), 'utf8');
        document.documentElement.innerHTML = html;

        // Mock localStorage
        let store = {};
        window.localStorage = {
            getItem: jest.fn(key => store[key] || null),
            setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
            clear: jest.fn(() => { store = {}; })
        };

        // Load and execute register.js
        const scriptContent = fs.readFileSync(path.resolve(__dirname, 'register.js'), 'utf8');
        eval(scriptContent);

        // Dispatch DOMContentLoaded to trigger the script's initialization
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    test('should prevent registration with a duplicate email and show error', () => {
        // Setup initial user in localStorage
        window.localStorage.setItem('users', JSON.stringify([
            { email: 'existing@example.com', username: 'Existing User', password: 'Valid123!' }
        ]));

        // Fill form
        document.getElementById('registerUsername').value = 'New User';
        document.getElementById('registerEmail').value = 'existing@example.com'; // Duplicate email
        document.getElementById('registerPassword').value = 'Valid123!';
        document.getElementById('confirmPassword').value = 'Valid123!';

        // Trigger form submit
        const form = document.getElementById('registerForm');
        form.dispatchEvent(new Event('submit', { cancelable: true }));

        // Assertions
        const formMessage = document.getElementById('formMessage');
        expect(formMessage).not.toBeNull();
        expect(formMessage.textContent).toBe('An account with this email already exists.');
        
        // Ensure new user was NOT added
        const users = JSON.parse(window.localStorage.getItem('users'));
        expect(users.length).toBe(1); // Still only the existing user
    });
});
