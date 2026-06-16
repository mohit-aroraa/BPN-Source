/**
 * GTM Data Layer - User Engagement Events
 *
 * Events: search, cta_click, product_option_selected, select_content,
 *         faq_toggle, carousel_interaction, chat_initiated
 */
import { isEventEnabled, pushToDataLayer } from '../utils.js';

/**
 * Track search submissions.
 * Captures from URL param on search results page, form submissions,
 * search button clicks (desktop magnifier), and Enter key presses.
 * @param {Object} config - GTM config object
 */
export const initSearch = (config) => {
  if (!isEventEnabled(config, 'search')) {
    return;
  }

  /* eslint-disable camelcase -- GA4 event schema requires snake_case */

  // Dedup: prevent the same search term from firing twice in quick
  // succession (e.g., both button click and form submit)
  let lastSearchTerm = '';
  let lastSearchTime = 0;

  const pushSearchEvent = (searchTerm) => {
    if (!searchTerm) {
      return;
    }
    const now = Date.now();
    if (searchTerm === lastSearchTerm
      && now - lastSearchTime < 1000) {
      return;
    }
    lastSearchTerm = searchTerm;
    lastSearchTime = now;

    pushToDataLayer({
      event: 'search',
      search_term: searchTerm,
    });
  };

  // 1. Fire on search results page with query from URL
  const isSearchResultsPage = config.templateName === 'search'
    || window.location.pathname.includes('/search');
  if (isSearchResultsPage) {
    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get('q')?.trim();
    if (searchTerm) {
      pushSearchEvent(searchTerm);
    }
  }

  // 2. Listen for search form submissions
  const handleFormSubmit = (event) => {
    const form = event.target;
    if (!form || form.tagName !== 'FORM') {
      return;
    }

    const action = form.getAttribute('action') || '';
    if (!action.includes('/search')) {
      return;
    }

    const searchInput = form.querySelector(
      'input[name="q"], input[type="search"]',
    );
    const searchTerm = searchInput?.value?.trim();
    pushSearchEvent(searchTerm);
  };

  document.addEventListener('submit', handleFormSubmit);

  // 3. Click listeners for search buttons that don't trigger
  //    form submit (desktop search window magnifier button)
  const handleSearchButtonClick = (event) => {
    const btn = event.target.closest(
      '.search-window button.magnifier,'
      + ' .search-window .magnifier',
    );
    if (!btn) {
      return;
    }

    const form = btn.closest('form');
    const searchInput = form?.querySelector(
      'input[name="q"], input[type="search"]',
    );
    const searchTerm = searchInput?.value?.trim();
    pushSearchEvent(searchTerm);
  };

  document.addEventListener('click', handleSearchButtonClick);

  // 4. Handle Enter key on search inputs
  const handleSearchKeydown = (event) => {
    if (event.key !== 'Enter') {
      return;
    }

    const input = event.target;
    if (!input || input.tagName !== 'INPUT') {
      return;
    }

    const form = input.closest('form');
    const action = form?.getAttribute('action') || '';
    if (!action.includes('/search')) {
      return;
    }

    const searchTerm = input.value?.trim();
    pushSearchEvent(searchTerm);
  };

  document.addEventListener('keydown', handleSearchKeydown);

  /* eslint-enable camelcase */
};

/**
 * Determine the location/context of a CTA button.
 * @param {HTMLElement} button - The clicked button element
 * @returns {string} Location description
 */
const getCtaLocation = (button) => {
  // Check for nearest heading by walking up the DOM
  let currentEl = button.parentElement;
  while (currentEl && currentEl !== document.body) {
    const heading = currentEl.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      const text = heading.textContent?.trim();
      if (text) {
        return text;
      }
    }
    currentEl = currentEl.parentElement;
  }

  // Section/container context
  const section = button.closest('section, [data-section-type]');
  if (section) {
    return section.id || section.dataset.sectionId || 'section';
  }

  // Common page locations
  if (button.closest('header, .pageHeader')) {
    return 'header';
  }
  if (button.closest('footer')) {
    return 'footer';
  }
  if (button.closest('.hero, .banner, .page-hero')) {
    return 'hero_banner';
  }

  return 'page_content';
};

/**
 * CTA selector whitelist.
 * Only these specific classes trigger cta_click.
 */
const CTA_SELECTOR = [
  '.bpn-homepage-hero__cta--primary',
  '.bpn-homepage-hero__cta--secondary',
  '.bpn-footer__link--primary',
  '.bpn-footer__link--secondary',
].join(', ');

/**
 * Track navigational CTA clicks.
 * Scoped to specific hero and footer CTA elements only.
 * @param {Object} config - GTM config object
 */
export const initCtaClick = (config) => {
  if (!isEventEnabled(config, 'cta_click')) {
    return;
  }

  /* eslint-disable camelcase -- GA4 event schema requires snake_case */

  const handleClick = (event) => {
    const button = event.target.closest(CTA_SELECTOR);
    if (!button) {
      return;
    }

    const linkText = button.textContent?.trim() || '';
    const linkUrl = button.href || button.getAttribute('href') || '';
    const ctaLocation = getCtaLocation(button);

    pushToDataLayer({
      event: 'cta_click',
      link_text: linkText,
      link_url: linkUrl,
      cta_location: ctaLocation,
    });
  };

  document.addEventListener('click', handleClick);

  /* eslint-enable camelcase */
};

/**
 * Track product option changes on PDP.
 * Uses click delegation with BPN-specific selectors for flavor dropdowns,
 * subscription toggles, delivery frequency, servings/size, and thumbnails.
 * @param {Object} config - GTM config object
 */
export const initProductOptionSelected = (config) => {
  if (!isEventEnabled(config, 'product_option_selected')) {
    return;
  }

  if (config.templateName !== 'product') {
    return;
  }

  const productData = window.BPN?.currentProductData;
  if (!productData) {
    return;
  }

  /* eslint-disable camelcase -- GA4 event schema requires snake_case */

  let lastTracked = { name: '', value: '', time: 0 };

  const isDuplicate = (name, value) => {
    const now = Date.now();
    if (lastTracked.name === name
      && lastTracked.value === value
      && now - lastTracked.time < 300) {
      return true;
    }
    lastTracked = { name, value, time: now };
    return false;
  };

  const pushOptionEvent = (optionType, optionValue) => {
    pushToDataLayer({
      event: 'product_option_selected',
      option_type: optionType,
      option_value: optionValue,
      product_id: productData.id?.toString() || '',
      product_name:
        productData.shopify_raw_title || productData.title || '',
    });
  };

  const handleClick = (event) => {
    const target = event.target;

    // 1. Flavor dropdown items
    const flavorItem = target.closest(
      '.product-hero__dropdown-item.variation-option',
    );
    if (flavorItem) {
      const optionValue = flavorItem.dataset.value
        || flavorItem.querySelector('.name')?.textContent?.trim()
        || '';
      if (optionValue && !isDuplicate('flavor', optionValue)) {
        pushOptionEvent('flavor', optionValue);
      }
      return;
    }

    // 2. Subscription toggle (Subscribe vs One-time purchase)
    const subToggle = target.closest(
      '.buy-box__purchase-type.buy-box__subscription,'
      + ' .buy-box__purchase-type.buy-box__one-time-purchase',
    );
    if (subToggle) {
      const clickId = target.closest('[data-click-id]')
        ?.dataset?.clickId || '';
      let optionValue = '';
      if (clickId === 'pdp_buyblock_subscribe'
        || subToggle.classList.contains('buy-box__subscription')) {
        optionValue = 'subscription';
      } else {
        optionValue = 'one-time';
      }
      if (!isDuplicate('purchase_type', optionValue)) {
        pushOptionEvent('purchase_type', optionValue);
      }
      return;
    }

    // 3. Delivery frequency dropdown items
    const deliveryItem = target.closest(
      '.delivery-type-dropdown__dropdown-item',
    );
    if (deliveryItem) {
      const optionValue = deliveryItem.textContent?.trim() || '';
      if (optionValue
        && !isDuplicate('delivery_frequency', optionValue)) {
        pushOptionEvent('delivery_frequency', optionValue);
      }
      return;
    }

    // 4. Servings/Size selector items
    const selectorItem = target.closest(
      '.selector__item.variation-option',
    );
    if (selectorItem) {
      const optionValue = selectorItem.dataset.value
        || selectorItem.textContent?.trim() || '';
      const clickId = selectorItem.dataset?.clickId || '';
      const optionType = clickId
        ? clickId.replace('pdp_buyblock_', '')
          .replace(/-/g, '_').replace('_selector', '')
        : 'size';
      if (optionValue && !isDuplicate(optionType, optionValue)) {
        pushOptionEvent(optionType, optionValue);
      }
      return;
    }

    // 5. Flavor thumbnails
    const thumbnail = target.closest(
      '.product-flavors-thumbnails-item',
    );
    if (thumbnail) {
      const optionValue = thumbnail.querySelector('p')
        ?.textContent?.trim() || '';
      if (optionValue && !isDuplicate('flavor', optionValue)) {
        pushOptionEvent('flavor', optionValue);
      }
    }
  };

  document.addEventListener('click', handleClick);

  /* eslint-enable camelcase */
};

/**
 * Track content selection interactions (select_content).
 * Covers collection filter checkboxes and sort dropdown items.
 * Uses event delegation for Vue-rendered elements.
 * @param {Object} config - GTM config object
 */
export const initSelectContent = (config) => {
  if (!isEventEnabled(config, 'select_content')) {
    return;
  }

  /* eslint-disable camelcase -- GA4 event schema uses snake_case */

  // 1. Collection filter checkbox changes
  const handleFilterChange = (event) => {
    const checkbox = event.target.closest(
      '.collectionFilterSection__checkbox,'
      + ' .collectionFilterSection__checkbox--mobile',
    );
    if (!checkbox) {
      return;
    }

    // Only fire when checked (filter applied), not unchecked
    if (!checkbox.checked) {
      return;
    }

    // Extract filter info from data attributes or label text
    const filterValue = checkbox.dataset.filter || '';
    const label = checkbox.closest('label');
    const contentId = filterValue
      || label?.textContent?.trim() || '';

    if (contentId) {
      pushToDataLayer({
        event: 'select_content',
        content_type: 'filter',
        content_id: contentId,
      });
    }
  };

  document.addEventListener('change', handleFilterChange);

  // 2. Collection sort item clicks
  const handleSortClick = (event) => {
    const sortItem = event.target.closest(
      '.collectionSortDesktopDropdown__item,'
      + ' .mobileFilterContentShortByDropdown__item',
    );
    if (!sortItem) {
      return;
    }

    const contentId = sortItem.dataset.sortValue
      || sortItem.textContent?.trim() || '';

    if (contentId) {
      pushToDataLayer({
        event: 'select_content',
        content_type: 'sort',
        content_id: contentId,
      });
    }
  };

  document.addEventListener('click', handleSortClick);

  /* eslint-enable camelcase */
};

/**
 * Track FAQ accordion/expandable opens (faq_toggle).
 * Handles <details>/<summary> and BPN information accordion patterns.
 * Deduplicates by question text per page load.
 * @param {Object} config - GTM config object
 */
export const initFaqToggle = (config) => {
  if (!isEventEnabled(config, 'faq_toggle')) {
    return;
  }

  /* eslint-disable camelcase -- GA4 event schema uses snake_case */
  const trackedQuestions = new Set();

  const handleClick = (event) => {
    // Pattern 1: <details>/<summary> elements
    const summary = event.target.closest('summary');
    if (summary) {
      const details = summary.parentElement;
      if (details?.tagName === 'DETAILS') {
        // Only track opening (details.open is true when currently open)
        if (details.open) {
          return;
        }

        const question = summary.textContent?.trim() || 'FAQ';
        if (trackedQuestions.has(question)) {
          return;
        }
        trackedQuestions.add(question);

        pushToDataLayer({
          event: 'faq_toggle',
          faq_question: question,
        });
        return;
      }
    }

    // Pattern 2: BPN information accordion on PDP
    const accordionTitle = event.target.closest(
      '.information-accordion__item-title',
    );
    if (accordionTitle) {
      const accordionItem = accordionTitle.closest(
        '.information-accordion__item',
      );

      // Only fire on open -- check if the item does NOT already
      // have .active class (the click handler in buy-box.js will
      // toggle it after this event fires)
      if (accordionItem?.classList.contains('active')) {
        return;
      }

      const question = accordionTitle.textContent?.trim() || 'FAQ';

      if (trackedQuestions.has(question)) {
        return;
      }
      trackedQuestions.add(question);

      pushToDataLayer({
        event: 'faq_toggle',
        faq_question: question,
      });
    }
  };
  /* eslint-enable camelcase */

  document.addEventListener('click', handleClick, true);
};

/**
 * Track carousel arrow clicks (carousel_interaction).
 * Listens for clicks on Swiper navigation buttons.
 * @param {Object} config - GTM config object
 */
export const initCarouselInteraction = (config) => {
  if (!isEventEnabled(config, 'carousel_interaction')) {
    return;
  }

  /* eslint-disable camelcase -- GA4 event schema uses snake_case */
  const handleClick = (event) => {
    const button = event.target.closest(
      '.swiper-button-next, .swiper-button-prev',
    );
    if (!button) {
      return;
    }

    const isNext = button.classList.contains('swiper-button-next');
    const isPrev = button.classList.contains('swiper-button-prev');

    if (!isNext && !isPrev) {
      return;
    }

    const swiperContainer = button.closest('.swiper');
    const carouselId = swiperContainer?.id
      || swiperContainer?.dataset?.carouselId
      || swiperContainer?.closest('section')?.id
      || 'swiper';

    pushToDataLayer({
      event: 'carousel_interaction',
      interaction_type: 'arrow_click',
      slide_direction: isPrev ? 'previous' : 'next',
      carousel_id: carouselId,
    });
  };
  /* eslint-enable camelcase */

  document.addEventListener('click', handleClick);
};

/**
 * Track chat widget open (chat_initiated).
 * Uses Gorgias Chat API with graceful degradation.
 * Only fires once per page load.
 * @param {Object} config - GTM config object
 */
export const initChatInitiated = (config) => {
  if (!isEventEnabled(config, 'chat_initiated')) {
    return;
  }

  /* eslint-disable camelcase -- GA4 event schema uses snake_case */
  let tracked = false;

  const trackChat = () => {
    if (tracked) {
      return;
    }
    tracked = true;

    pushToDataLayer({
      event: 'chat_initiated',
      chat_location: 'floating_widget',
    });
  };

  const initGorgias = () => {
    if (window.GorgiasChat) {
      window.GorgiasChat.init().then(() => {
        window.GorgiasChat.on('widget:opened', trackChat);
      }).catch(() => {
        // Gorgias init failed, no-op
      });
    } else {
      window.addEventListener('gorgias-widget-loaded', () => {
        if (window.GorgiasChat) {
          window.GorgiasChat.init().then(() => {
            window.GorgiasChat.on('widget:opened', trackChat);
          }).catch(() => {});
        }
      });
    }
  };
  /* eslint-enable camelcase */

  setTimeout(initGorgias, 1000);
};
