function sanitizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeOptionalString(value) {
  if (value == null) return null;
  const sanitized = sanitizeString(value);
  return sanitized || null;
}

function isValidEmail(value) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
}

module.exports = {
  sanitizeString,
  sanitizeOptionalString,
  isValidEmail,
  isPositiveNumber
};
