export default function siteAccordion() {
  const accordionTriggers = document.querySelectorAll(
    "[data-accordion-trigger]"
  );

  accordionTriggers.forEach((accordionTrigger) => {
    accordionTrigger.addEventListener("click", function () {
      const accordionWrapper = this.closest(".js-site-accordion-parent");

      //Get the previous opened accordion and close it
      const prevOpenedAccordion =
        accordionWrapper &&
        accordionWrapper.querySelector(".siteAccordion__wrapper.is-active");

      const prevTrigger =
        prevOpenedAccordion &&
        prevOpenedAccordion.querySelector("[data-accordion-trigger]");

      const prevAccordionBody =
        prevOpenedAccordion &&
        prevOpenedAccordion.querySelector(".siteAccordion__content");

      if (prevTrigger && prevAccordionBody && this !== prevTrigger) {
        prevOpenedAccordion.classList.remove("is-active");
        prevTrigger.setAttribute("aria-expanded", false);
        prevAccordionBody.style.maxHeight = null;
      }

      //Toggle current item
      const { parentElement } = this;
      const { nextElementSibling } = this;
      const ariaVal =
        this.getAttribute("aria-expanded") === "true" ? false : true;

      if (parentElement) {
        parentElement.classList.toggle("is-active");
      }
      this.setAttribute("aria-expanded", ariaVal);
      try {
        if (nextElementSibling.style.maxHeight) {
          nextElementSibling.style.maxHeight = null;
        } else {
          nextElementSibling.style.maxHeight =
            nextElementSibling.scrollHeight + "px";
        }
      } catch (error) {
        console.log("Accordion content block not found");
      }
    });
  });
}
