import "Styles/templates/404.scss";
import featuredCollection from "../components/shared/featured-collection";
try {
  featuredCollection();
} catch (error) {
  console.log(error);
}
