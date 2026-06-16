import "Styles/templates/article.scss";
import featuredCollection from "../components/shared/featured-collection";
try {
  featuredCollection();
} catch (error) {
  console.log(error);
}
