/**
 * Price { Number }
 * Returns decimal shopify price
 */
export function decimalPrice(price) {
  return (price / 100).toFixed(2) || 0;
}

export function addUpdateQueryParam(paramName, paramValue) {
  // Get the current query string
  let search = window.location.search;

  // Check if the query string is empty
  if (!search) {
    search = `?${paramName}=${paramValue}`;
  } else {
    // If the parameter already exists, update its value
    const name = `${paramName}=`;
    const startIndex = search.indexOf(name);
    if (startIndex !== -1) {
      // Get the start and end indexes of the parameter
      const endIndex =
        search.indexOf('&', startIndex) !== -1
          ? search.indexOf('&', startIndex)
          : search.length;
      // Replace the parameter value with the new one
      search =
        search.slice(0, startIndex) +
        `${name}${paramValue}` +
        search.slice(endIndex);
    } else {
      // If the parameter doesn't exist, add it to the end of the query string
      search += `&${name}${paramValue}`;
    }
  }
  history.replaceState({}, '', window.location.pathname + search);
}

export function updateLocationPathName(pathName) {
  const currentUrl = new URL(window.location.href);
  const newPath = pathName;
  const newUrl = new URL(newPath, currentUrl.origin);

  // Copy over the search parameters
  currentUrl.searchParams.forEach((value, key) => {
    newUrl.searchParams.append(key, value);
  });

  window.history.replaceState({}, '', newUrl.href);
}

export function dataLayerCartInteraction(
  eventName,
  currency = 'USD',
  totalPrice,
  products = [],
  paymentType = null,
) {
}



