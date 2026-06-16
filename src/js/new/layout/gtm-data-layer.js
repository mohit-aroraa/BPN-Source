import { getConfig } from '../components/gtm-data-layer/utils.js';
import { initError404, initOutOfStockView } from '../components/gtm-data-layer/events/system.js';
import {
  initViewItem,
  initViewItemList,
  initSelectItem,
  initAddToCart,
  initViewCart,
  initCartOperations,
} from '../components/gtm-data-layer/events/ecommerce.js';
import {
  initSearch,
  initCtaClick,
  initProductOptionSelected,
  initSelectContent,
  initFaqToggle,
  initCarouselInteraction,
  initChatInitiated,
} from '../components/gtm-data-layer/events/engagement.js';
import {
  initLogin,
  initSignUp,
  initGenerateLead,
  initViewPromotion,
  initSelectPromotion,
} from '../components/gtm-data-layer/events/marketing.js';

/**
 * GTM Data Layer - Main Entry Point
 *
 * Reads configuration from the Liquid-rendered JSON block,
 * then initializes only the enabled event listeners.
 */
const init = () => {
  const config = getConfig();

  if (!config || !config.enabled) {
    return;
  }

  // System events
  initError404(config);
  initOutOfStockView(config);

  // Ecommerce events
  initViewItem(config);
  initViewItemList(config);
  initSelectItem(config);
  initAddToCart(config);
  initViewCart(config);

  // Cart operation events
  initCartOperations(config);

  // Engagement events
  initSearch(config);
  initCtaClick(config);
  initProductOptionSelected(config);
  initSelectContent(config);
  initFaqToggle(config);
  initCarouselInteraction(config);
  initChatInitiated(config);

  // Marketing & lead events
  initLogin(config);
  initSignUp(config);
  initGenerateLead(config);
  initViewPromotion(config);
  initSelectPromotion(config);
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
