// Import Swiper and modules
import { setVariant } from "../../utils/helpers/setVariant";

export default function flannelProductGrid() {
  const triggerButtons = document.querySelectorAll(
    "[data-upsell-variant-dropdown-trigger]"
  );
  const upsellDropdownItems = document.querySelectorAll(
    "[data-upsell-variant-selector]"
  );

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
}
