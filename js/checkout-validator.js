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
  if (!expiryStr || !/^\d{2}\/\d{2}$/.test(expiryStr.trim())) return { valid: false, error: 'invalid_format' };
  const [monthStr, yearStr] = expiryStr.trim().split('/');
  const month = parseInt(monthStr, 10);
  const year = parseInt(`20${yearStr}`, 10);

  if (month < 1 || month > 12) return { valid: false, error: 'invalid_month' };
  if (isNaN(month) || isNaN(year)) return { valid: false, error: 'invalid_format' };

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear) return { valid: false, error: 'expired' };
  if (year === currentYear && month < currentMonth) return { valid: false, error: 'expired' };

  return { valid: true, error: null };
}

const POSTAL_CODE_PATTERNS = {
  US: /^\d{5}(-\d{4})?$/,
  IN: /^\d{6}$/,
  UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
  CA: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i,
  AU: /^\d{4}$/};

export function validatePostalCode(postalCode, country = 'US') {
  if (!postalCode) return false;
  const clean = postalCode.trim();
  const pattern = POSTAL_CODE_PATTERNS[country.toUpperCase()];
  if (pattern) {
    return pattern.test(clean);
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

export function validateCVVCode(cvv) {
  return typeof cvv === 'string' && /^\d{3,4}$/.test(cvv.trim());
}