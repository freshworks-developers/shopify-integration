const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const ORDER_ID_PATTERN = /^#?\d+$/;

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(String(email || '').trim());
}

export function isValidOrderId(value) {
  return ORDER_ID_PATTERN.test(String(value || '').trim());
}

export function normalizeOrderId(value) {
  return String(value || '').trim().replace(/^#/, '');
}
