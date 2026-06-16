export const formatPrice = (price, currencyCode) => {
  // Get active currency from Shopify object first, fallback to provided code or USD
  const activeCurrency = window.Shopify?.currency?.active ||
    currencyCode ||
    props.selectedVariant?.currencyCode ||
    'USD';

  // Use Shopify's currency converter if available (for multi-currency stores)
  let convertedPrice = price;
  if (window.Shopify && window.Shopify.currency && window.Shopify.currency.active !== currencyCode) {
    // Only convert if the active currency is different from the product's currency
    if (window.Shopify.currency.rate) {
      convertedPrice = price * window.Shopify.currency.rate;
    }
  }

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: activeCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currencyDisplay: 'symbol',
  });

  // Format the price and remove any currency code (like 'USD', 'CNY')
  let formattedPrice = formatter.format(convertedPrice);

  // Most currency codes are 3 characters, but we'll look for any letter sequence next to the symbol
  // For example: CN¥33.99 -> ¥33.99 or US$33.99 -> $33.99
  return formattedPrice.replace(/[A-Z]{1,3}(\$|£|€|¥|₩|₹)/, '$1');
};

export const formatDiscountedPrice = (price, discountPercentage, currencyCode) => {
  // Only apply discount if there is an actual discount percentage
  if (discountPercentage <= 0) {
    return formatPrice(price, currencyCode);
  }

  // Apply discount directly to the price
  const discountAmount = price * (discountPercentage / 100);
  const discountedPrice = price - discountAmount;

  // Let formatPrice handle the currency conversion
  return formatPrice(discountedPrice, currencyCode);
};
