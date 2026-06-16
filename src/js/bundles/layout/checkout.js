import "Styles/layout/checkout.scss";

//Add * on the placeholder
const requiredInputs = document.querySelectorAll(
  ".field--required .field__input"
);

if (requiredInputs.length) {
  inputPlaceHolder(requiredInputs);
}
// Select the node that will be observed for mutations
const targetNode = document.querySelector(".main__content");

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true };

// Callback function to execute when mutations are observed
const callback = function (mutationsList) {
  for (var mutation of mutationsList) {
    if (mutation.type == "childList" || mutation.type == "attributes") {
      //Add * on the placeholder if DOM gets updated. Fix issue for apply promocode
      //Get the fresh nodeList after mutation
      const requiredFields = document.querySelectorAll(
        ".field--required .field__input"
      );
      if (requiredFields.length) {
        inputPlaceHolder(requiredFields);
      }
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

window.addEventListener("resize", showOrder);

//Show order details on page load when in mobile
showOrder();

//Hide promo code field initially
hidePromoCode();

//Add * on the placeholder
function inputPlaceHolder(elemList) {
  elemList.forEach((elem) => {
    const currentPlaceholder = elem?.placeholder || "";
    if (currentPlaceholder.endsWith("*")) return;
    const finalPlaceholder = `${currentPlaceholder}*`;
    elem.setAttribute("placeholder", finalPlaceholder);
  });
}

function showOrder() {
  if (window.innerWidth < 999.98) {
    const toggleBtn = document.querySelector(".order-summary-toggle");
    const isOpen =
      toggleBtn && toggleBtn.classList.contains("order-summary-toggle--hide");
    //Keep the order summary open on mobile
    if (!isOpen) {
      toggleBtn.click();
    }
  }
}

// Select the node that will be observed for mutations
const promoFieldWrapper = document.querySelector("#order-summary");

// Options for the observer (which mutations to observe)
const promoFieldConfig = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const addSubscriptionText = (mutationList, observer) => {
  for (const mutation of mutationList) {
    if (
      mutation.type === "subtree" ||
      mutation.type === "chidList" ||
      mutation.type === "attributes"
    ) {
      const promoFieldWrapper = document.querySelector(
        ".order-summary__section .fieldset .field .field__input-btn-wrapper"
      );
      const isPromoFieldWrapperVisible = promoFieldWrapper.style.display;
      const isTextPresent = document.querySelector(".js-subscription-text");
      if (!promoFieldWrapper) return;

      if (!isTextPresent) {
        const html =
          isPromoFieldWrapperVisible === "none"
            ? `<p class="js-subscription-text subscription-message" style="display:none">**Discounts are applicable for one time purchases ONLY and are not valid on subscription based orders</p>`
            : `<p class="js-subscription-text subscription-message">**Discounts are applicable for one time purchases ONLY and are not valid on subscription based orders</p>`;
        promoFieldWrapper.insertAdjacentHTML("afterend", html);
      } else {
        if (isPromoFieldWrapperVisible === "none") {
          isTextPresent.style.display = "none";
        } else {
          isTextPresent.style.display = "block";
        }
      }
    }
  }
};

// Create an observer instance linked to the callback function
const promoFieldMOInstance = new MutationObserver(addSubscriptionText);

// Start observing the target node for configured mutations
promoFieldMOInstance.observe(promoFieldWrapper, promoFieldConfig);

function insertPromofieldButton(field, fieldInput) {
  const text = "Gift card or discount code +";
  const btn = document.createElement("a");
  btn.href = "javascript:void(0);";
  btn.classList.add("promoFieldTrigger");
  btn.innerText = text;
  btn.setAttribute("role", "button");
  field && field.appendChild(btn);

  btn.onclick = function () {
    fieldInput && (fieldInput.style.display = "flex");
    btn.remove();
  };
}

function hidePromoCode() {
  const field = document.querySelector(
    ".order-summary__section .fieldset .field"
  );
  const fieldInput = document.querySelector(
    ".order-summary__section .fieldset .field .field__input-btn-wrapper"
  );
  const foundPromo =
    document.querySelectorAll(".tags-list").length > 0 ? true : false;
  const foundNotice =
    document.querySelectorAll(".notice.notice--warning").length > 0
      ? true
      : false;

  if (!foundPromo && !foundNotice) {
    if (!fieldInput) return;
    fieldInput.style.display = "none";
    // insertPromofieldButton(field, fieldInput);
  }
}
const checkBoxes = [
  {
    name: "marketing field",
    element: document.getElementById("checkout_buyer_accepts_marketing"),
  },
  {
    name: "save address",
    element: document.getElementById("checkout_remember_me"),
  },
];

function uncheckDefault(nodeList) {
  nodeList.forEach((item) => {
    if (item.element) {
      const isChecked = item.element.checked;
      if (isChecked) {
        item.element.setAttribute("checked", false);
      }
    }
  });
}

uncheckDefault(checkBoxes);
