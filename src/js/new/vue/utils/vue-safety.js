/**
 * Vue.js Safety Utilities
 *
 * Helper functions for safely accessing data in Vue components
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
  ;

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
 * Creates a safe computed property getter that handles undefined/null values
 * @param {Function} getter - The original getter function
 * @param {*} defaultValue - Default value to return if getter would access undefined
 * @return {Function} Safe getter function
 */
export function safeComputed(getter, defaultValue = null) {
  return function(...args) {
    try {
      const result = getter.apply(this, args);
      return exists(result) ? result : defaultValue;
    } catch (e) {
      console.warn('Error in computed property:', e);
      return defaultValue;
    }
  };
}

/**
 * Safely access a property of an object with a default value
 * @param {Object} obj - The object to access
 * @param {String} prop - The property name
 * @param {*} defaultValue - Value to return if property is undefined/null
 * @return {*} The property value or defaultValue
 */
export function safeProp(obj, prop, defaultValue = null) {
  if (!obj || obj[prop] === undefined || obj[prop] === null) {
    return defaultValue;
  }
  return obj[prop];
}

/**
 * Safely invoke a method on an object
 * @param {Object} obj - The object with the method
 * @param {String} method - The method name
 * @param {Array} args - Arguments to pass to the method
 * @param {*} defaultValue - Value to return if method doesn't exist or throws
 * @return {*} Method result or defaultValue
 */
export function safeInvoke(obj, method, args = [], defaultValue = null) {
  if (!obj || typeof obj[method] !== 'function') {
    return defaultValue;
  }

  try {
    return obj[method](...args);
  } catch (e) {
    console.warn(`Error invoking ${method}:`, e);
    return defaultValue;
  }
}

/**
 * Wraps a computed property definition with safe access
 * @param {Object} computedDef - Object with computed property getters
 * @return {Object} Safe computed properties
 */
export function safeComputedProps(computedDef) {
  const result = {};

  for (const [ key, getter ] of Object.entries(computedDef)) {
    result[key] = safeComputed(getter);
  }

  return result;
}
