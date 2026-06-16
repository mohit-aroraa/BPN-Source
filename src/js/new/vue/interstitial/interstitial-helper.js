export const transformProductResponse = (response) => {
  const product = response.product;
  if (!product) {
    return null;
  }

  // Create a map of selling plans from product level for easy lookup
  const sellingPlansArray = [];
  const sellingPlansMap = {};

  product.sellingPlanGroups?.nodes?.forEach(group => {
    group.sellingPlans?.nodes?.forEach(plan => {
      const planData = {
        id: plan.id,
        name: plan.name,
        appName: group.appName || '',
        options: plan.options,
        priceAdjustments: plan.priceAdjustments,
        groupName: group.name,
      };
      sellingPlansArray.push(planData);
      sellingPlansMap[plan.id] = planData;
    });
  });

  return {
    id: product.id,
    title: product.title,
    shortDescription: product.shortDescription?.value || '',
    allowSubscriptions: product.allowSubscriptions?.value,
    options: product.options,
    sellingPlans: sellingPlansArray, // Add product-level selling plans
    variants: product.variants.nodes.map(variant => ({
      id: variant.id,
      title: variant.title,
      image: variant.image?.url || null,
      servings: variant.servings?.value || null,
      price: parseFloat(variant.price.amount),
      available: variant.availableForSale,
      currencyCode: variant.price.currencyCode,
      sellingPlans: variant.sellingPlanAllocations.nodes.map(allocation => {
        const planDetails = sellingPlansMap[allocation.sellingPlan.id] || {};
        return {
          id: allocation.sellingPlan.id,
          options: planDetails.options || allocation.sellingPlan.options || [],
          adjustedPrice: allocation.priceAdjustments[0]?.price ? parseFloat(allocation.priceAdjustments[0].price.amount) : null,
          compareAtPrice: allocation.priceAdjustments[0]?.compareAtPrice ? parseFloat(allocation.priceAdjustments[0].compareAtPrice.amount) : null,
        };
      }),
      selectedOptions: variant.selectedOptions,
      variationIcon: variant.variationIcon?.value || null,
    })),
    interstitialCategory: product.interstitialCategory?.reference ? {
      icon: product.interstitialCategory.reference.icon?.reference?.image?.url || null,
      name: product.interstitialCategory.reference.name?.value || null,
      subtitle: product.interstitialCategory.reference.subtitle?.value || null,
    } : null,
    interstitialCategories: product.interstitialCategories?.references?.nodes?.map(node => ({
      icon: node.icon?.reference?.image?.url || null,
      name: node.name?.value || null,
      subtitle: node.subtitle?.value || null,
    })) || [],
    interstitialProducts: product.interstitialProducts?.references?.nodes?.map(node => {
      // Create selling plans map for interstitial products too
      const interstitialSellingPlansArray = [];
      const interstitialSellingPlansMap = {}; // Keep map for internal lookup
      node.sellingPlanGroups?.nodes?.forEach(group => {
        group.sellingPlans?.nodes?.forEach(plan => {
          const planData = {
            id: plan.id,
            name: plan.name,
            appName: group.appName || '',
            options: plan.options,
            priceAdjustments: plan.priceAdjustments,
            groupName: group.name,
          };
          interstitialSellingPlansArray.push(planData);
          interstitialSellingPlansMap[plan.id] = planData;
        });
      });

      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        options: node.options,
        shortDescription: node.shortDescription?.value || '',
        allowSubscriptions:node.allowSubscriptions?.value,
        price: parseFloat(node.variants.nodes[0].price.amount) || 0,
        currencyCode: node.variants.nodes[0].price.currencyCode || 'USD',
        image: node.featuredImage?.url || null,
        imageAlt: node.featuredImage?.altText || null,
        sellingPlans: interstitialSellingPlansArray,
        variants: node.variants.nodes.map(variant => ({
          id: variant.id,
          title: variant.title,
          image: variant.image?.url || null,
          available: variant.availableForSale,
          servings: variant.servings?.value || null,
          price: parseFloat(variant.price.amount),
          sellingPlans: variant.sellingPlanAllocations.nodes.map(allocation => {
            const planDetails = interstitialSellingPlansMap[allocation.sellingPlan.id] || {};
            return {
              id: allocation.sellingPlan.id,
              name: planDetails.name || null,
              groupName: planDetails.groupName || null,
              delivery: allocation.sellingPlan.options?.find(opt => opt.name === 'Delivery every')?.value ||
                       planDetails.options?.find(opt => opt.name === 'Delivery every')?.value || null,
              options: planDetails.options || allocation.sellingPlan.options || [],
              adjustedPrice: allocation.priceAdjustments[0]?.price ? parseFloat(allocation.priceAdjustments[0].price.amount) : null,
              compareAtPrice: allocation.priceAdjustments[0]?.compareAtPrice ? parseFloat(allocation.priceAdjustments[0].compareAtPrice.amount) : null,
            };
          }),
          selectedOptions: variant.selectedOptions,
          variationIcon: variant.variationIcon?.value || null,
        })),
      };
    }) || [],
    interstitialCTAOptions: product.interstitialCTAOptions?.value || null,
    interstitialTitle: product.interstitialTitle?.value || null,
    interstitialEnabled: product.interstitialEnabled?.value === 'true' ? true : false,
  };
};

const transformVariant = (variant, product) => {
  // Create a new object instead of mutating the original
  return {
    ...variant,
    option1: variant.selectedOptions.find(opt => opt.name === product.options[0]?.name)?.value || null,
    option2: product.options.length > 1 ? variant.selectedOptions.find(opt => opt.name === product.options[1]?.name)?.value || null : null,
    option3: product.options.length > 2 ? variant.selectedOptions.find(opt => opt.name === product.options[2]?.name)?.value || null : null,
  };
};

export const productRecommendations = (transformedResponse, includeCurrentProduct = true) => {
  if (!transformedResponse) {
    console.warn('productRecommendations: No response provided');
    return [];
  }

  const {
    id,
    title,
    shortDescription,
    allowSubscriptions,
    interstitialCTAOptions,
    interstitialTitle,
    interstitialEnabled,
    variants,
    options,
    sellingPlans, // Now available at product level
    interstitialCategory,
    interstitialCategories = [],
    interstitialProducts = [],
  } = transformedResponse;

  const productsArray = [];

  // Add current product if requested and data exists
  if (includeCurrentProduct && id && title) {
    const currentProduct = {
      id,
      title,
      options,
      shortDescription,
      allowSubscriptions,
      interstitialCTAOptions,
      interstitialTitle,
      interstitialEnabled,
      interstitialCategories,
      handle: null,
      price: variants?.[0]?.price || 0,
      image: variants?.[0]?.image || null,
      variants: variants || [],
      sellingPlans: sellingPlans || [], // Use array consistently
      category: interstitialCategory || null,
      isCurrentProduct: true,
      currencyCode: variants?.[0]?.currencyCode,
    };

    productsArray.push(currentProduct);
  }

  let currentCategoryIndex =  interstitialCategories.findIndex(item => item.name === interstitialCategory?.name);
  let filteredCategories =[];
  if (currentCategoryIndex !== -1) {
    filteredCategories =  [...interstitialCategories.slice(0, currentCategoryIndex), ...interstitialCategories.slice(currentCategoryIndex + 1)];
  } else {
    filteredCategories = interstitialCategories.filter(category =>
      category?.name && category.name !== interstitialCategory?.name,
    );
  }


  // Add interstitial products if requested
  if (interstitialProducts.length > 0) {
    interstitialProducts.forEach((product, index) => {
      const categoryData = filteredCategories[index];

      const interstitialProduct = {
        id: product.id,
        title: product.title,
        handle: product.handle,
        shortDescription: product.shortDescription || '',
        allowSubscriptions: product.allowSubscriptions,
        price: product.price,
        image: product.image,
        variants: product.variants || [],
        sellingPlans: product.sellingPlans || [], // Use array consistently
        category: categoryData,
        isCurrentProduct: false,
        currencyCode: product.variants?.[0]?.currencyCode || 'USD',
        options: product.options || [],
      };
      productsArray.push(interstitialProduct);
    });
  }

  // Transform variants without mutating original arrays
  return productsArray.map(product => ({
    ...product,
    selectedVariant: null,
    selectedVariantId: null,
    variants: product.variants.map(variant => transformVariant(variant, product)),
  }));
};

export const shouldShowInterstitial = (cartEvent , totalItems) => {
  if(!window.BPN?.interstitial?.enabled) {
    return false;
  }
  try {
    const interstitialOpenCount = parseInt(sessionStorage.getItem('interstitial_open_count') || '0');
    if (interstitialOpenCount >= (window.BPN?.interstitial?.maximum_frequency || 3)) {
      return false;
    }
  } catch (e) {
    console.warn('Failed to read interstitial count from sessionStorage:', e);
    return false;
  }

  if (totalItems > (window.BPN?.interstitial?.max_products || 2)) {
    return false;
  }
  if (window.location.pathname === '/') {
    return false;
  }
  if (cartEvent?.type === 'rebuy:cart.add' || cartEvent?.type === 'cart:ITEM:added' && !cartEvent?.detail?.fromInterstitial) {
    return true;
  }
  return false;
};

export const sortProductsByCategories = (products, categories) => {
  // Early return if no categories or products
  if (!Array.isArray(categories) || categories.length === 0) {
    return products.slice(); // Return a copy to avoid mutations
  }

  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  // Create a map of category names to their order/index
  const categoryOrderMap = new Map();
  categories.forEach((category, index) => {
    if (category?.name) {
      categoryOrderMap.set(category.name, index);
    }
  });

  // Sort products based on their category order
  return products.slice().sort((a, b) => {
    const nameA = a?.category?.name;
    const nameB = b?.category?.name;

    const orderA = nameA !== null ? categoryOrderMap.get(nameA) : undefined;
    const orderB = nameB !== null ? categoryOrderMap.get(nameB) : undefined;

    // Handle cases where category might not be found
    if (orderA === undefined && orderB === undefined) {
      return 0;
    }
    if (orderA === undefined) {
      return 1; // Put unknown categories at the end
    }
    if (orderB === undefined) {
      return -1;
    }
    return orderA - orderB;
  });
};
