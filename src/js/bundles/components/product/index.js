import {initFaqCarousel} from './faq';
import {initProductDetailsCarousel} from './product-details';
import initProductCrossSell from './product-cross-sell';
import {initMediaCarousel} from './media-carousel';
import {initStackRecommendationsCarousel} from './stack-recommendations';
import {initBuyBox} from './buy-box';
import initJoinUs from '../shared/join-us';
import {initOrderBy} from "../product/order-by";

export const initPDPRedesign = () => {
  initOrderBy();
  initBuyBox();
  initProductDetailsCarousel();
  initMediaCarousel();
  initFaqCarousel();
  initProductCrossSell();
  initStackRecommendationsCarousel();
  initJoinUs();
};

