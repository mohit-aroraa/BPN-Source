import cartMethods from "../../utils/helpers/cart-helper";
const { post } = cartMethods;

export default function productCard() {
  const dropdownTriggers = document.querySelectorAll(
    "[data-variant-dropdown-trigger]"
  );
  const dropdownItems = document.querySelectorAll("[data-variant-selector]");
  const addToCtas = document.querySelectorAll("[data-add-to-cart-cta]");

  dropdownTriggers.forEach((elem) => {
    elem.addEventListener("click", toggleDropdown);
  });

  dropdownItems.forEach((el) => {
    el.addEventListener("click", setVariant);
  });

  addToCtas.forEach((btn) => {
    btn.addEventListener("click", addToCart);
  });

  function toggleDropdown() {
    const btn = this;
    const container = btn.closest(".productVariantDropdown");
    container && container.classList.toggle("open");
  }

  function setVariant() {
    const el = this;
    const dropdownParent = el.closest(".productVariantDropdown");
    const dropdownTrigger =
      dropdownParent &&
      dropdownParent.querySelector("[data-variant-dropdown-trigger]");
    const selectedDropdownItem =
      dropdownParent &&
      dropdownParent.querySelector(
        ".js-product-variant-dropdown-item-selected"
      );
    const productCard = el.closest(".js-product-card");
    const variantId = el.dataset?.variantId;
    const variantTitle = el.dataset?.variantTitle;

    //Add active class
    selectedDropdownItem.classList.remove(
      "productVariantDropdown__item--selected",
      "js-product-variant-dropdown-item-selected"
    );
    el.classList.add(
      "productVariantDropdown__item--selected",
      "js-product-variant-dropdown-item-selected"
    );

    // Change dropdown button's text
    dropdownTrigger &&
      variantTitle &&
      (dropdownTrigger.querySelector(".text").innerText = variantTitle);

    dropdownTrigger &&
      variantId &&
      dropdownTrigger.setAttribute("data-selected-item", variantId);

    dropdownParent && dropdownParent.classList.remove("open");
  }

  function addToCart() {
    const el = this;
    const errorElem = el.nextElementSibling;
    const productCard = el.closest(".js-product-card");
    const productCardType = productCard && productCard.dataset?.productCardType;

    //Clear the error message elem
    errorElem && (errorElem.innerText = "");
    //Disable after first click
    el.setAttribute("disabled", true);
    el.innerText = "Loading...";
    const selectedVariantButtons =
      productCard &&
      productCard.querySelectorAll("[data-variant-dropdown-trigger]");
    const productsToAdd = [];
    if (selectedVariantButtons) {
      selectedVariantButtons.forEach((item) => {
        const obj = {
          id: parseInt(item.dataset.selectedItem),
          quantity: 1,
        };
        productsToAdd.push(obj);
      });
    }

    if (productsToAdd.length < 1) return;

    if (productCardType === "single") {
      const properties = {
        _added_from_landing_page: true,
      };
      const addedProperties = productsToAdd.map((item) => ({
        ...item,
        properties: { ...properties },
      }));
      const data = {
        items: [...addedProperties],
      };
      post("add", data).then((res) => {
        handleAddToCartResponse(res, errorElem);
      });
    } else {
      //For combo product
      const discountValue = el.dataset?.comboDiscountValue;
      const pageHandle = el.dataset?.pageHandle || "landing-page";
      const properties = {
        _combo_discount: discountValue ? parseFloat(discountValue) : 0,
        _combo_page: pageHandle,
        _combo_product: true,
        _added_from_landing_page: true,
      };
      const addedProperties = productsToAdd.map((item) => ({
        ...item,
        properties: { ...properties },
      }));

      const data = {
        items: [...addedProperties],
      };
      post("add", data).then((res) => {
        handleAddToCartResponse(res, errorElem);
      });
    }
  }

  function handleAddToCartResponse(response, errorElem) {
    const { status, message } = response;
    if (!status && !message) {
      window.location.href = "/checkout";
    } else if (status == 422) {
      errorElem && (errorElem.innerText = message);
    }
  }
}
