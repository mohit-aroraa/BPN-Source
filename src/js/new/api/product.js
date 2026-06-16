/**
 * Product API
 *
 * Handles fetching product data from Shopify Storefront API
 */
import { graphqlClient } from '../utils/graphql-client.js';

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Number} maxRetries - Maximum number of retries
 * @returns {Promise} - Result of the function
 */
async function retryWithBackoff(fn, maxRetries = 3) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;

      if (retries >= maxRetries) {
        throw error;
      }

      // Wait with exponential backoff (300ms, 900ms, 2700ms)
      const waitTime = 300 * Math.pow(3, retries - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      console.log(`Retrying API call (attempt ${retries}/${maxRetries})...`);
    }
  }
}

/**
 * Transform Storefront API data to our internal format
 * @param {Object} product - Raw product data from Storefront API
 * @returns {Object} Transformed product data in our internal format
 */
const transformProductData = (product) => {
  // Transform images
  const images = product.images.nodes.map(image => ({
    src: image.url,
    alt: image.altText || product.title,
    width: image.width,
    height: image.height,
  }));

  // Transform variants
  const variants = product.variants.nodes.map(variant => {
    // Extract option values from selectedOptions
    const option1 = variant.selectedOptions.find(opt => opt.name === product.options[0]?.name)?.value || null;
    const option2 = product.options.length > 1
      ? variant.selectedOptions.find(opt => opt.name === product.options[1]?.name)?.value || null
      : null;
    const option3 = product.options.length > 2
      ? variant.selectedOptions.find(opt => opt.name === product.options[2]?.name)?.value || null
      : null;

    // Get the raw price amount without conversion to cents
    const priceAmount = parseFloat(variant.price.amount);
    const compareAtPriceAmount = variant.compareAtPrice
      ? parseFloat(variant.compareAtPrice.amount)
      : null;

    return {
      id: variant.id,
      title: variant.title,
      available: variant.availableForSale,
      price: priceAmount,
      compareAtPrice: compareAtPriceAmount,
      currencyCode: variant.price.currencyCode,
      option1,
      option2,
      option3,
      variationIcon: variant.metafield?.value || null,
      hasSellingPlan: (variant.sellingPlanAllocations?.nodes?.length ?? 0) > 0,
    };
  });

  // Transform selling plan groups
  const sellingPlanGroups = product.sellingPlanGroups?.nodes.map(group => {
    const sellingPlans = group.sellingPlans.nodes.map(plan => {
      // Extract discount percentage from price adjustments
      let discount = 0;
      let currencyCode = null;

      if (plan.priceAdjustments && plan.priceAdjustments.length > 0) {
        const adjustmentValue = plan.priceAdjustments[0].adjustmentValue;

        if (adjustmentValue.adjustmentPercentage) {
          discount = adjustmentValue.adjustmentPercentage;
        } else if (adjustmentValue.adjustmentAmount) {
          currencyCode = adjustmentValue.adjustmentAmount.currencyCode;
        } else if (adjustmentValue.price) {
          currencyCode = adjustmentValue.price.currencyCode;
        }
      }

      return {
        id: plan.id,
        name: plan.name,
        discount: discount,
        currencyCode: currencyCode,
      };
    });

    return {
      name: group.name,
      appId: group.appName || '',
      sellingPlans,
    };
  }) || [];

  // Get default currency code from first variant
  const defaultCurrencyCode = variants[0]?.currencyCode || 'USD';

  // Return transformed product data
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    vendor: product.vendor,
    tags: product.tags || [],
    allowsSubscriptions: product.metafield?.value,
    enableStackAndSave: product.enableStackAndSaveMeta?.value === 'true',
    images,
    options: product.options,
    variants,
    sellingPlanGroups,
    currencyCode: defaultCurrencyCode,
  };
};

/**
 * Fetch a product by handle
 * @param {string} handle - Product handle to fetch
 * @returns {Promise<Object>} The product data
 */
export const fetchProductByHandle = async (handle) => {
  if (!handle) {
    throw new Error('Product handle is required');
  }

  return retryWithBackoff(async () => {
    // Get the active country code - fallback to US if not available
    const countryCode = window.Shopify?.country || 'US';

    const query = `
      query ProductByHandle($handle: String!, $country: CountryCode!)
      @inContext(country: $country) {
        product(handle: $handle) {
          id
          title
          handle
          description
          vendor
          tags
          metafield(namespace: "custom", key: "allow_subscriptions") {
            value
          }
          enableStackAndSaveMeta: metafield(namespace: "custom", key: "enable_stack_and_save") {
            value
          }
          images(first: 10) {
            nodes {
              url
              altText
              width
              height
            }
          }
          options {
            name
            values
          }
          variants(first: 100) {
            nodes {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              metafield(namespace: "custom", key: "product_card_variation_icon") {
                value
              }
              sellingPlanAllocations(first: 1) {
                nodes {
                  sellingPlan {
                    id
                  }
                }
              }
            }
          }
          sellingPlanGroups(first: 5) {
            nodes {
              name
              appName
              sellingPlans(first: 5) {
                nodes {
                  id
                  name
                  description
                  options {
                    name
                    value
                  }
                  priceAdjustments {
                    adjustmentValue {
                      ... on SellingPlanFixedAmountPriceAdjustment {
                        adjustmentAmount {
                          amount
                          currencyCode
                        }
                      }
                      ... on SellingPlanFixedPriceAdjustment {
                        price {
                          amount
                          currencyCode
                        }
                      }
                      ... on SellingPlanPercentagePriceAdjustment {
                        adjustmentPercentage
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      // Get the active currency from Shopify object
      const activeCurrency = window.Shopify?.currency?.active || 'USD';

      // Use the GraphQL client to fetch product data with country context
      const data = await graphqlClient.query(query, {
        handle,
        country: countryCode,
      });

      // Check if product exists
      if (!data.product) {
        throw new Error(`Product not found: ${handle}`);
      }

      // Transform the data to our internal format
      return transformProductData(data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  });
};


export const fetchProductVariantsMetaApi = async (handle) => {
  const res = await fetch(`/products/${handle}?view=meta`);

  return res.json();
};
