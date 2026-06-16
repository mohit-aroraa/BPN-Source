export function getHandleFromUrl(url) {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);

  return pathParts.includes('products') ? pathParts[pathParts.indexOf('products') + 1] : null;
}
