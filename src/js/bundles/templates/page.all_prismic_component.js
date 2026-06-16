import "Styles/templates/page.all_prismic_component.scss";
import MicroModal from "micromodal";
import categoriesSlider from "../components/shared/categories";
import testedBlockSlider from "../components/shared/tested-block";
import featuredCollection from "../components/shared/featured-collection";
import reviewSlider from "../components/shared/curated-reviews";
import { VideoTracker } from "../components/shared/video-block";

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
  categoriesSlider();
  featuredCollection();
  reviewSlider();
  testedBlockSlider();
  new VideoTracker();
} catch (error) {
  console.log(error);
}
