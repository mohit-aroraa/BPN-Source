/**
 * URL parameter handling for collection filters
 */

/**
 * Apply a single metafield filter parameter
 * @param {string} key - Filter parameter key
 * @param {string} value - Filter parameter value
 * @param {HTMLElement} filtersForm - Filter form element
 * @return {boolean} - Whether the parameter was applied
 */
export function applyMetafieldParam(key, value, filtersForm) {
  const input = filtersForm.querySelector(`input[name="${key}"]`);

  if (input) {
    // If this is a checkbox
    if (input.type === 'checkbox' && input.value === value) {
      input.checked = true;
      return true;
    }
    // If this is a hidden field or text input
    else if ((input.type === 'hidden' || input.type === 'text') && input.name === key) {
      input.value = value;
      return true;
    }
  } else {
    // Create a hidden input if it doesn't exist
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = key;
    hiddenInput.value = value;
    filtersForm.appendChild(hiddenInput);
    return true;
  }

  return false;
}

/**
 * Apply legacy product type parameter
 * @param {string} value - Product type value
 * @param {HTMLElement} filtersForm - Filter form element
 * @return {boolean} - Whether the parameter was applied
 */
export function applyLegacyProductType(value, filtersForm) {
  // Convert to metafield format
  const metafieldKey = 'filter.p.m.custom._filter_type';
  const input = filtersForm.querySelector(`input[name="${metafieldKey}"]`);

  if (!input) {
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = metafieldKey;
    hiddenInput.value = value;
    filtersForm.appendChild(hiddenInput);
    return true;
  }

  return false;
}

/**
 * Process metafield filter parameters from URL
 * @param {URLSearchParams} urlParams - URL parameters
 * @param {HTMLElement} filtersForm - Filter form element
 * @return {boolean} - Whether any parameters were applied
 */
export function processMetafieldParams(urlParams, filtersForm) {
  let paramsApplied = false;

  // Look for any metafield filter parameters
  for (const [key, value] of urlParams.entries()) {
    // Handle metafield filters
    if (key.startsWith('filter.p.m.custom._filter_') && value) {
      paramsApplied = applyMetafieldParam(key, value, filtersForm) || paramsApplied;
    }

    // Handle legacy product_type parameter
    if (key === 'filter.p.product_type' && value) {
      paramsApplied = applyLegacyProductType(value, filtersForm) || paramsApplied;
    }
  }

  return paramsApplied;
}

/**
 * Process sort parameter from URL
 * @param {URLSearchParams} urlParams - URL parameters
 * @return {boolean} - Whether the parameter was applied
 */
export function processSortParam(urlParams) {
  const sortBy = urlParams.get('sort_by');
  if (sortBy) {
    const sortSelect = document.getElementById('SortBy');
    if (sortSelect) {
      sortSelect.value = sortBy;
      return true;
    }
  }
  return false;
}

/**
 * Preserve special URL parameters when constructing filter URLs
 * @param {URLSearchParams} formParams - Form parameters
 * @param {HTMLElement} filtersForm - Filter form element
 * @return {URLSearchParams} - Updated parameters
 */
export function preserveSpecialParams(formParams, filtersForm) {
  const currentParams = new URLSearchParams(window.location.search);

  // Function to check if a parameter matches metafield filter pattern
  const isMetafieldFilter = (param) => param.startsWith('filter.p.m.custom._filter_');

  // First, get all checkboxes to know which ones are actually checked
  const checkedCheckboxNames = new Set();
  filtersForm.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
    checkedCheckboxNames.add(checkbox.name);
  });

  // Only preserve parameters that aren't explicitly unchecked
  for (const [key, value] of currentParams.entries()) {
    // For metafield filters, only preserve if there's no checkbox for it or if the checkbox is checked
    if (isMetafieldFilter(key) && !formParams.has(key)) {
      const checkbox = filtersForm.querySelector(`input[type="checkbox"][name="${key}"]`);

      // Only add the parameter if either:
      // 1. There's no checkbox for this parameter, or
      // 2. The checkbox exists and is checked
      if (!checkbox || checkbox.checked) {
        formParams.set(key, value);
      }
    }
  }

  // Preserve other special parameters
  const specialParams = ['q', 'sort_by'];

  specialParams.forEach(param => {
    if (currentParams.has(param) && !formParams.has(param)) {
      formParams.set(param, currentParams.get(param));
    }
  });

  return formParams;
}
