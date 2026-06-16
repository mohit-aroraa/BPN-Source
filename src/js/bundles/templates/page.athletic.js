import "Styles/templates/page.athletic.scss";
import MicroModal from "micromodal";
import reviewSlider from "../components/shared/curated-reviews";
import testedBlockSlider from "../components/shared/tested-block";
import featuredPageSlider from "../components/shared/featured-page";
import productCard from "../components/shared/landing-page-product-card";
import cartMethods from "../utils/helpers/cart-helper";
const { post } = cartMethods;
const triggers = document.querySelectorAll(".js-scroll-to-section");
triggers.forEach((item) => {
  item.addEventListener("click", scrollToProductSection);
});

//Scroll to the product area
function scrollToProductSection(e) {
  e.preventDefault();
  const productGrid = document.querySelector("#comboProductArea");
  const offset = productGrid && productGrid.offsetTop;
  if (!offset) return;
  window.scrollTo({ top: offset, behavior: "smooth" });
}

//Initialize modal
const micromodalOptions = {
  awaitCloseAnimation: true,
  disableFocus: true,
  onShow: function (modal) {
    // do something when modal opens
    document.documentElement.classList.add("lock-body");
    // document.body.classList.add("lock-body");
  },
  onClose: function (modal) {
    // do something when modal closes
    document.documentElement.classList.remove("lock-body");
    // document.body.classList.remove("lock-body");
  },
};

try {
  MicroModal.init({ ...micromodalOptions });
} catch (e) {
  console.log("micromodal error: ", e);
}

try {
  reviewSlider();
  testedBlockSlider();
  featuredPageSlider();
  productCard();
} catch (error) {
  console.log(error);
}

//Clear cart when user land on the marketing landing page
post("clear", {}).then((res) => {
  console.log(res);
});

window.addEventListener(
  "pageshow",
  function () {
    const navigationType = performance.getEntriesByType("navigation")[0].type;
    if (navigationType === "back_forward") {
      post("clear", {}).then((res) => {
        console.log(res);
      });
    }
  },
  false
);
