export const PRODUCT_WITH_META_FIELDS_QUERY = `
  query ProductByHandle($handle: String!, $country: CountryCode!) @inContext(country: $country) {
    product(handle: $handle) {
      id
      title
      description
      options {
        name
        values
      }
      sellingPlanGroups(first: 10) {
        nodes {
          name
          appName
          sellingPlans(first: 10) {
            nodes {
              id
              name
              options { name value }
              priceAdjustments {
                adjustmentValue {
                  ... on SellingPlanFixedAmountPriceAdjustment {
                    adjustmentAmount { amount currencyCode }
                  }
                  ... on SellingPlanFixedPriceAdjustment {
                    price { amount currencyCode }
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
      variants(first: 15) {
        nodes {
          ...VariantFields
        }
      }
      interstitialCategory: metafield(namespace: "custom", key: "interstitial_current_category") {
        reference {
          ...MetaobjectFields
        }
      }
      interstitialCategories: metafield(namespace: "custom", key: "interstitial_categories") {
        references(first: 3) {
          nodes {
            ...MetaobjectFields
          }
        }
      }
      interstitialProducts: metafield(namespace: "custom", key: "interstitial_product_recommendations") {
        references(first: 2) {
          nodes {
            ...ProductFields
          }
        }
      }
      shortDescription: metafield(namespace: "custom", key: "short_description") {
        value
      }
      allowSubscriptions: metafield(namespace: "custom", key: "allow_subscriptions") {
      value
      }
      interstitialEnabled: metafield(namespace: "custom", key: "interstitial_enabled") {
        value
      }
      interstitialTitle: metafield(namespace: "custom", key: "interstitial_popup_title") {
        value
      }
      interstitialCTAOptions: metafield(namespace: "custom", key: "interstitial_cta_options") {
        value
      }
    }
  }

  fragment VariantFields on ProductVariant {
    title
    id
    image { url }
    price { amount currencyCode }
    compareAtPrice { amount currencyCode }
    availableForSale
    servings: metafield(namespace: "custom", key: "servings") {
      value
    }
    variationIcon:metafield(namespace: "custom", key: "product_card_variation_icon") {
      value
    }
    selectedOptions {
      name
      value
    }
    sellingPlanAllocations(first: 10) {
      nodes {
        sellingPlan {
          id
          options { name value }
          }
          priceAdjustments {
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
          }
      }
    }
  }

  fragment MetaobjectFields on Metaobject {
    icon: field(key: "icon") {
      reference {
        ... on MediaImage {
          image { url altText }
        }
      }
    }
    name: field(key: "name") { value }
    subtitle: field(key: "subtitle") { value }
  }

  fragment ProductFields on Product {
    id
    title
    handle
    featuredImage { url altText }
    variants(first: 10) {
      nodes { ...VariantFields }
    }
    options {
      name
      values
    }
    sellingPlanGroups(first: 10) {
      nodes {
        name
        appName
        sellingPlans(first: 10) {
          nodes {
            id
            name
            options { name value }
            priceAdjustments {
              adjustmentValue {
                ... on SellingPlanFixedAmountPriceAdjustment {
                  adjustmentAmount { amount currencyCode }
                }
                ... on SellingPlanFixedPriceAdjustment {
                  price { amount currencyCode }
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
    shortDescription: metafield(namespace: "custom", key: "short_description") {
      value
    }
    allowSubscriptions: metafield(namespace: "custom", key: "allow_subscriptions") {
      value
    }
  }
`;
