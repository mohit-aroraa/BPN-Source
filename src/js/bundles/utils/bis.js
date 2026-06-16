const getFormatterProductData = (product) => {
  return {
    id: product.productId,
    handle: product.handle,
    title: product.title,
    variants: product.variants,
    available: false,
    tags: [],
  };
};

const setupConfig = (product, selectedVariant) => {
  window.BIS.Config.product = product;
  window.BIS.Config.productHandle = product.handle;
  window.BIS.Config.variants = product.variants;

  window.BIS.popup = window.BIS.createPopover();

  window.BIS.popup.settings.product = product;
  window.BIS.popup.product = product;
  window.BIS.popup.variants = product.variants;
  window.BIS.popup.variant = selectedVariant;
  window.BIS.popup._variantsById = Object.fromEntries(
    product.variants.map(v => [ v.id, v ]),
  );
};

const isPopupPresent = () => window.BIS && window.BIS.popup && typeof window.BIS.popup.show === 'function';

const showBISPopup = (variantId) => {
  if (isPopupPresent()) {

    window.BIS.popup.createUI({
      variant_id: variantId,
    });

    window.BIS.popup.form.selectVariant(variantId);

    window.BIS.popup.show();
  } else {
    console.warn('Back in Stock popup not initialized yet.');
  }
};

function decodeSpecialChars(value) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

export const openBackInStackModal = (product) => {
  try {
    product.variants = product.variants.map((variant) => ({ ...variant, title: decodeSpecialChars(variant.title) }));
    const productData = getFormatterProductData(product);
    const selectedVariant = product.variants.find(variant => variant.id === product.variantId);

    if (selectedVariant) {
      setupConfig(productData, selectedVariant);
      showBISPopup(selectedVariant.id);
    } else {
      console.warn('No selected variation.');
      setupConfig(productData, selectedVariant);
      showBISPopup(product.variantId);
    }

  } catch (e) {
    console.log(e);
    console.warn('Back in Stock popup not initialized yet.');
  }
};
