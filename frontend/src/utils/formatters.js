const formatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1
});

// Standard number formatter
const standardFormatter = new Intl.NumberFormat('en-US');

// Currency formatter
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

/**
 * Formats numbers with compact notation for large values
 * @param {number} value - The number to format
 * @returns {string} Formatted number (e.g., "1.5K")
 */
export const formatCompactNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? '0' : num >= 10000 ? formatter.format(num) : standardFormatter.format(num);
};

/**
 * Formats PHP currency with compact notation for large values
 * @param {number} value - The amount to format
 * @returns {string} Formatted currency (e.g., "₱1.5K")
 */
export const formatPHP = (value) => {
  const num = Number(value);
  if (isNaN(num)) return '₱0';
  return num >= 10000
    ? `₱${formatter.format(num)}`
    : currencyFormatter.format(num).replace('PHP', '₱');
};

/**
 * Returns the full precision value as string
 * @param {number} value - The number to format
 * @param {boolean} isCurrency - Whether to format as currency
 * @returns {string} Full precision value
 */
export const getFullValue = (value, isCurrency = false) => {
  const num = Number(value);
  if (isNaN(num)) return isCurrency ? '₱0' : '0';
  return isCurrency
    ? `₱${standardFormatter.format(num)}.00`
    : standardFormatter.format(num);
};