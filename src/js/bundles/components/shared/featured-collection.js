// Import Swiper and modules
import Swiper, { A11y, Scrollbar, FreeMode } from "swiper";
import { setVariant } from "../../utils/helpers/setVariant";
import { THEME_BREAKPOINTS } from "../../utils/constants";
import cartMethods from "../../utils/helpers/cart-helper";
const { post } = cartMethods;

export default function featuredCollection() {
  const featuredCollectionWrapper = document.querySelectorAll(
    "[data-featured-collection-slider]"
  );
  const triggerButtons = document.querySelectorAll(
    "[data-upsell-variant-dropdown-trigger]"
  );
  const upsellDropdownItems = document.querySelectorAll(
    "[data-upsell-variant-selector]"
  );
  const ctas = document.querySelectorAll(
    "[data-featured-collection-slider] .js-upsell-add-to-cart-btn"
  );
  if (window.innerWidth < THEME_BREAKPOINTS.tablet) {
    featuredCollectionWrapper.forEach((item) => {
      new Swiper(item, {
        // Install modules
        modules: [A11y, Scrollbar, FreeMode],
        slidesPerView: 1.5,
        spaceBetween: 16,
        speed: 500,
        observer: false,
        loop: false,
        a11y: true,
        freeMode: true,
        scrollbar: {
          el: ".swiper-scrollbar",
          hide: false,
        },
        // Responsive breakpoints
        breakpoints: {
          // when window width is >= 640px
          640: {
            slidesPerView: 3,
          },
        },
      });
    });
  }

  //Toggle open class on the variant wrapper
  triggerButtons.forEach((triggerButton) => {
    triggerButton.addEventListener("click", function () {
      const { parentElement } = this;
      parentElement.classList.toggle("open");
    });
  });

  //Add event listener on each dropdown item
  upsellDropdownItems.forEach((upsellDropdownItem) => {
    upsellDropdownItem.addEventListener("click", setVariant);
  });

  //Custom Add to cart functionality
  ctas.forEach((cta) => {
    cta.addEventListener("click", () => {
      addProductToCart(cta);
    });
  });
}

function addProductToCart(elem) {
  if (!elem) return;
  elem.innerText = "Adding...";
  const parentElement = elem?.closest("[data-form='AddToCartForm']");
  const variantIdElem = parentElement?.querySelector("[name='id']");
  if (!variantIdElem) return;
  const variantId = parseInt(variantIdElem.value);
  post("add", {
    id: variantId,
    quantity: 1,
  })
    .then(() => {
      elem.innerText = "add to cart";
    })
    .catch(() => {
      elem.innerText = "add to cart";
    });
}
