document.addEventListener('DOMContentLoaded', () => {
  const contactPickerContainer = document.getElementById('contactPickerContainer');
  const contactPickerBtn = document.getElementById('contactPickerBtn');

  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');

  // Check if Contact Picker API is supported
  const supported = ('contacts' in navigator && 'ContactsManager' in window);

  if (supported && contactPickerContainer && contactPickerBtn) {
    contactPickerContainer.style.display = 'block';

    contactPickerBtn.addEventListener('click', async () => {
      const props = ['name', 'email', 'tel'];
      const opts = { multiple: false };

      try {
        const contacts = await navigator.contacts.select(props, opts);
        
        if (contacts && contacts.length > 0) {
          const contact = contacts[0];

          if (contact.name && contact.name.length > 0) {
            fullNameInput.value = contact.name[0];
            validateFieldSafely(fullNameInput);
          }
          if (contact.email && contact.email.length > 0) {
            emailInput.value = contact.email[0];
            validateFieldSafely(emailInput);
          }
          if (contact.tel && contact.tel.length > 0) {
            phoneInput.value = contact.tel[0];
            validateFieldSafely(phoneInput);
          }
          
          if (typeof window.showToast === 'function') {
            window.showToast('Contact details filled successfully!', 'success');
          }
        }
      } catch (err) {
        console.error('Contact Picker API error:', err);
        // User may have cancelled or permission denied
      }
    });
  }

  function validateFieldSafely(input) {
    if (typeof window.validateField === 'function') {
       window.validateField(input);
    } else {
       // dispatch input and blur events so checkout.js can pick it up
       input.dispatchEvent(new Event('input', { bubbles: true }));
       input.dispatchEvent(new Event('blur', { bubbles: true }));
    }
  }
});
