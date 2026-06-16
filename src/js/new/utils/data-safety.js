/**
 * Data Safety Utilities
 *
 * Helper functions for safely accessing potentially undefined or null data
 */

/**
 * Safely access nested properties of an object
 * @param {Object} obj - The object to access
 * @param {String} path - Dot-notation path to the property
 * @param {*} defaultValue - Value to return if property is undefined/null
 * @return {*} The property value or defaultValue
 */
export function safeGet(obj, path, defaultValue = null) {
  if (!obj || !path) {
    return defaultValue;
  }

  const properties = path.split('.');
  let result = obj;

  for (const prop of properties) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[prop];
  }

  return result !== undefined && result !== null ? result : defaultValue;
}

/**
 * Check if a value is not null or undefined
 * @param {*} value - Value to check
 * @return {Boolean} True if value exists
 */
export function exists(value) {
  return value !== null && value !== undefined;
}

/**
 * Safely convert value to number
 * @param {*} value - Value to convert
 * @param {Number} defaultValue - Default value if conversion fails
 * @return {Number} Converted number or default
 */
export function safeNumber(value, defaultValue = 0) {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Safe way to get first element of array
 * @param {Array} array - Array to get first element from
 * @param {*} defaultValue - Default value if array is invalid
 * @return {*} First element or default
 */
export function safeFirst(array, defaultValue = null) {
  return Array.isArray(array) && array.length > 0 ? array[0] : defaultValue;
}

/**
 * Safely parse JSON string
 * @param {String} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @return {*} Parsed object or default
 */
export function safeJsonParse(jsonString, defaultValue = {}) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn('Failed to parse JSON:', e);
    return defaultValue;
  }
}
