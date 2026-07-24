// Real-Time Form Validation Engine for Checkout

export function validateCreditCardLuhn(cardNumber) {
  const cleanNum = String(cardNumber).replace(/\D/g, '');
  if (!cleanNum || cleanNum.length < 13 || cleanNum.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = cleanNum.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNum.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function validateExpiryDate(expiryStr) {
  if (!expiryStr || !/^\d{2}\/\d{2}$/.test(expiryStr.trim())) return false;
  const [monthStr, yearStr] = expiryStr.trim().split('/');
  const month = parseInt(monthStr, 10);
  const year = parseInt(`20${yearStr}`, 10);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

export function validatePostalCode(postalCode, country = 'US') {
  if (!postalCode) return false;
  const clean = postalCode.trim();
  if (country === 'US') {
    return /^\d{5}(-\d{4})?$/.test(clean);
  }
  return clean.length >= 3 && clean.length <= 10;
}

export function validateEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePhone(phone) {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}
