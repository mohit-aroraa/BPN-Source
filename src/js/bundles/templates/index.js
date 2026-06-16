import 'Styles/templates/index.scss';
import initHomepageHero from '../components/shared/homepage-hero';
import categoriesSlider from '../components/shared/categories';
import testedBlockSlider from '../components/shared/tested-block';
import reviewSlider from '../components/shared/curated-reviews';
import featuredInSlider from '../components/shared/featured-in';
import {VideoTracker} from '../components/shared/video-block';
import communityBlock from '../components/shared/community-block';
import {reviewsSlider} from '../components/shared/reviews';
import initRecommendations from '../components/shared/recommendations';
import initJoinUs from '../components/shared/join-us';
import initTestimonials from '../components/shared/testimonials';
import initYoutube from '../components/shared/youtube';
import initMenuCarousel from '../components/shared/carousel-mobile';

try {
  categoriesSlider();
  testedBlockSlider();
  reviewSlider();
  featuredInSlider();
  communityBlock();
  new VideoTracker();

  // redesign components
  initHomepageHero();
  initMenuCarousel();
  reviewsSlider();
  initRecommendations();
  initJoinUs();
  initTestimonials();
  initYoutube();
  // featuredCollection()
} catch (error) {
  console.log(error);
}
