/* ===== FORGOT PASSWORD JS ===== */
/* global showToast */

document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('forgotForm')) return;

  // Toggle eye buttons
  document
    .getElementById('toggleNewPass')
    .addEventListener('click', function () {
      const pwd = document.getElementById('newPassword');
      pwd.type = pwd.type === 'password' ? 'text' : 'password';
      this.classList.toggle('ri-eye-line');
      this.classList.toggle('ri-eye-off-line');
    });

  document
    .getElementById('toggleConfirmPass')
    .addEventListener('click', function () {
      const pwd = document.getElementById('confirmPassword');
      pwd.type = pwd.type === 'password' ? 'text' : 'password';
      this.classList.toggle('ri-eye-line');
      this.classList.toggle('ri-eye-off-line');
    });

  const form = document.getElementById('forgotForm');
  const step1Div = document.getElementById('forgotStep1');
  const step2Div = document.getElementById('forgotStep2');
  const nextBtn = document.getElementById('forgotNextBtn');
  const emailInput = document.getElementById('forgotEmail');
  const answerInput = document.getElementById('securityAnswerInput');
  const displayQuestion = document.getElementById('securityQuestionDisplay');

  let matchedUser = null;

  /* STEP 1: IDENTIFY USER & RETRIEVE CHALLENGE */
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      const email = emailInput.value.trim().replace(/[<>"']/g, '');

      if (!email || !email.includes('@') || !/\S+@\S+\.\S+/.test(email)) {
        showToast('Please enter a valid email address!', 'warning');
        return;
      }

      /* Disable Next Button during simulated lookup */
      nextBtn.disabled = true;
      nextBtn.innerText = 'VERIFYING...';

      setTimeout(function () {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        matchedUser = users.find((u) => u.email === email);

        if (!matchedUser) {
          showToast('No account found with this email!', 'error');
          nextBtn.disabled = false;
          nextBtn.innerText = 'NEXT';
          return;
        }

        // Fetch security question (support backward compatibility for legacy accounts)
        const question =
          matchedUser.securityQuestion ||
          "What is your favorite color? (Legacy Account - Answer 'blue' to reset)";

        // Save fallback answer if not present for legacy accounts
        if (!matchedUser.securityQuestion) {
          matchedUser.securityQuestion =
            "What is your favorite color? (Legacy Account - Answer 'blue' to reset)";
          matchedUser.securityAnswer = 'blue';
        }

        // Display question in step 2
        displayQuestion.innerText = question;

        // Visual step transition
        step1Div.style.display = 'none';
        step2Div.style.opacity = '0';
        step2Div.style.display = 'block';

        // Trigger simple fade-in transition
        setTimeout(() => {
          step2Div.style.transition = 'opacity 0.4s ease';
          step2Div.style.opacity = '1';
        }, 50);

        showToast(
          'Account identified! Please answer your security question.',
          'success'
        );
      }, 1000);
    });
  }

  /* STEP 2: VERIFY ANSWER AND RESET PASSWORD */
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!matchedUser) {
        showToast(
          'Session error, please refresh and re-identify email.',
          'error'
        );
        return;
      }

      const answer = answerInput.value.trim();
      const newPass = document.getElementById('newPassword').value;
      const confirmPass = document.getElementById('confirmPassword').value;

      /* validations */
      if (!answer) {
        showToast('Please answer the security question!', 'warning');
        return;
      }

      // Case-insensitive verification
      if (answer.toLowerCase() !== matchedUser.securityAnswer.toLowerCase()) {
        showToast('Incorrect answer to security question!', 'error');
        return;
      }

      if (/\s/.test(newPass)) {
        showToast('Password must not contain spaces.', 'warning');
        return;
      }

      if (!newPass || newPass.length < 8) {
        showToast('Password must be at least 8 characters long.', 'warning');
        return;
      }

      if (!/[A-Z]/.test(newPass)) {
        showToast(
          'Password must contain at least one uppercase letter (A-Z).',
          'warning'
        );
        return;
      }

      if (!/[a-z]/.test(newPass)) {
        showToast(
          'Password must contain at least one lowercase letter (a-z).',
          'warning'
        );
        return;
      }

      if (!/[0-9]/.test(newPass)) {
        showToast(
          'Password must contain at least one number (0-9).',
          'warning'
        );
        return;
      }

      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPass)) {
        showToast(
          'Password must contain at least one special character (e.g. @, #, $).',
          'warning'
        );
        return;
      }

      if (newPass !== confirmPass) {
        showToast('Passwords do not match!', 'warning');
        return;
      }

      /* Loading state: disable reset button & show spinner */
      const submitBtn = step2Div.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
      }

      /* Simulate async request */
      setTimeout(function () {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u) => u.email === matchedUser.email);

        if (userIndex === -1) {
          showToast('Database sync error. Please try again.', 'error');
          if (submitBtn) {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
          }
          return;
        }

        /* update password */
        users[userIndex].password = newPass;
        localStorage.setItem('users', JSON.stringify(users));

        showToast(
          'Password reset successful! Redirecting to login...',
          'success'
        );

        /* redirect to login after success */
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      }, 1500);
    });
  }
});
