/* eslint-disable max-lines -- Promotion tracking covers Klaviyo popups + banner sections */
/**
 * GTM Data Layer - Marketing & Lead Events
 *
 * Events: login, sign_up, generate_lead, view_promotion, select_promotion
 */
import { pushToDataLayer, isEventEnabled, getCurrency } from '../utils.js';

/**
 * Track user login events.
 * Uses sessionStorage flag to detect login across page navigation.
 *
 * Phase 1: On login page, set sessionStorage flag on form submit
 * Phase 2: On any page, check flag + logged-in status to fire event
 *
 * @param {Object} config - GTM config object
 */
export const initLogin = (config) => {
  if (!isEventEnabled(config, 'login')) {
    return;
  }

  const STORAGE_KEY = 'gtm_just_logged_in';
  const SHOP_PAY_GUEST_KEY = 'gtm_was_guest';

  // Phase 1: Set flag on login form submit
  if (config.templateName === 'login') {
    const loginForm = document.querySelector(
      '#customer_login, form[action*="/account/login"]',
    );
    if (loginForm) {
      loginForm.addEventListener('submit', () => {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      });
    }
  }

  // Phase 2: Check for login flag on any page
  const justLoggedIn = sessionStorage.getItem(STORAGE_KEY);
  const isLogged = window.BPN?.customer?.isLogged === true;
  const wasGuest = sessionStorage.getItem(SHOP_PAY_GUEST_KEY);

  if (!isLogged) {
    sessionStorage.setItem(SHOP_PAY_GUEST_KEY, 'true');
  }

  if (justLoggedIn === 'true') {
    const hasUserData = window.dataLayer?.some(
      (entry) => entry.event === 'user_data_update' && entry.user_id,
    );

    if (hasUserData) {
      pushToDataLayer({
        event: 'login',
        method: 'email',
      });
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(SHOP_PAY_GUEST_KEY);
    } else if (config.templateName === 'login') {
      // Login attempt failed (redirected back to login page) -- clear the flag
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } else if (isLogged && wasGuest === 'true') {
    // User is logged in now, but was a guest previously and didn't use the form
    pushToDataLayer({
      event: 'login',
      method: 'shop_pay',
    });
    sessionStorage.removeItem(SHOP_PAY_GUEST_KEY);
  }
};

/**
 * Track new account registration.
 * Uses sessionStorage flag to detect signup across page navigation.
 *
 * Phase 1: On register page, set sessionStorage flag on form submit
 * Phase 2: On any other page, check flag to fire event
 *
 * @param {Object} config - GTM config object
 */
export const initSignUp = (config) => {
  if (!isEventEnabled(config, 'sign_up')) {
    return;
  }

  const STORAGE_KEY = 'gtm_just_signed_up';

  // Phase 1: Set flag on register form submit
  if (config.templateName === 'register') {
    const registerForm = document.querySelector(
      '#RegisterForm, #create_customer, form[action*="/account"]',
    );
    if (registerForm) {
      registerForm.addEventListener('submit', () => {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      });
    }
  }

  // Phase 2: Check for signup flag on any page
  const justSignedUp = sessionStorage.getItem(STORAGE_KEY);
  if (justSignedUp === 'true') {
    if (config.templateName !== 'register') {
      // Redirected away from register page = signup succeeded
      pushToDataLayer({
        event: 'sign_up',
        method: 'email',
      });
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      // Still on register page = signup may have failed
      const hasError = document.querySelector(
        '.form-message--error, .input-error-message',
      );
      if (hasError) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }
};

/**
 * Track lead generation events (newsletter, forms).
 * Covers Klaviyo form submissions and native Shopify newsletter forms.
 * Deduplicates by email per session via sessionStorage.
 * @param {Object} config - GTM config object
 */
export const initGenerateLead = (config) => {
  if (!isEventEnabled(config, 'generate_lead')) {
    return;
  }

  const trackLead = (email) => {
    if (!email) {
      return;
    }

    const lastEmail = sessionStorage.getItem('gtm_last_lead_email');
    if (lastEmail === email) {
      return;
    }
    sessionStorage.setItem('gtm_last_lead_email', email);

    /* eslint-disable camelcase -- GA4 event schema requires snake_case */
    pushToDataLayer({
      event: 'generate_lead',
      currency: getCurrency(),
      value: 0.5,
      lead_type: 'newsletter',
    });
    /* eslint-enable camelcase */
  };

  // Klaviyo form submissions
  window.addEventListener('klaviyoForms', (event) => {
    const type = event.detail?.type;
    if (type !== 'submit' && type !== 'stepSubmit') {
      return;
    }

    const formId = event.detail?.formId;
    const form = formId
      ? document.querySelector(`[data-klaviyo-form-id="${formId}"]`)
      : null;
    const emailInput = form?.querySelector('input[type="email"]');
    const email = emailInput?.value
      || event.detail?.metaData?.$email
      || 'klaviyo_lead';
    trackLead(email);
  });

  // Native Shopify newsletter form submissions
  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!form || form.tagName !== 'FORM') {
      return;
    }

    const action = form.getAttribute('action') || '';
    if (!action.includes('/contact')) {
      return;
    }

    const formTypeInput = form.querySelector(
      'input[name="form_type"][value="customer"]',
    );
    const newsletterTag = form.querySelector(
      'input[name="contact[tags]"][value="newsletter"]',
    );
    const emailInput = form.querySelector(
      'input[type="email"], input[name="contact[email]"]',
    );

    if (formTypeInput && newsletterTag && emailInput) {
      trackLead(emailInput.value);
    }
  });
};

/* -- Promotion Tracking (view_promotion / select_promotion) -- */

/**
 * Load a Set from sessionStorage by key.
 * @param {string} key - Storage key (prefixed with gtm_)
 * @returns {Set<string>}
 */
const loadTrackedSet = (key) => {
  try {
    const stored = sessionStorage.getItem(`gtm_${key}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

/**
 * Persist a Set to sessionStorage by key.
 * @param {string} key - Storage key (prefixed with gtm_)
 * @param {Set<string>} set - The set to persist
 */
const saveTrackedSet = (key, set) => {
  try {
    sessionStorage.setItem(`gtm_${key}`, JSON.stringify([...set]));
  } catch (e) {
    console.warn('GTM Data Layer: Failed to save promotion tracking', e);
  }
};

// Shared module state for promotion tracking
let promotionListenerAttached = false;
let trackViewEnabled = false;
let trackSelectEnabled = false;
const viewedPromotions = loadTrackedSet('viewed_promotions');
const selectedPromotions = loadTrackedSet('selected_promotions');

/**
 * Attach the shared klaviyoForms listener once for both promotion events.
 */
const attachPromotionListener = () => {
  if (promotionListenerAttached) {
    return;
  }
  promotionListenerAttached = true;

  window.addEventListener('klaviyoForms', (event) => {
    const type = event.detail?.type;
    const formId = event.detail?.formId || 'unknown';
    const metaData = event.detail?.metaData || {};
    const promotionName = metaData.$form_name
      || metaData.formName
      || 'Klaviyo Popup';

    /* eslint-disable camelcase -- GA4 promotion schema requires snake_case */
    const promotionId = `klaviyo_form_${formId}`;

    if (trackViewEnabled && type === 'open') {
      if (!viewedPromotions.has(formId)) {
        viewedPromotions.add(formId);
        saveTrackedSet('viewed_promotions', viewedPromotions);

        pushToDataLayer({
          event: 'view_promotion',
          promotion_id: promotionId,
          promotion_name: promotionName,
          creative_name: 'klaviyo_popup',
        });
      }
    }

    if (trackSelectEnabled
      && (type === 'submit' || type === 'stepSubmit')) {
      if (!selectedPromotions.has(formId)) {
        selectedPromotions.add(formId);
        saveTrackedSet('selected_promotions', selectedPromotions);

        pushToDataLayer({
          event: 'select_promotion',
          promotion_id: promotionId,
          promotion_name: promotionName,
          creative_name: 'klaviyo_popup',
        });
      }
    }
    /* eslint-enable camelcase */
  });
};

/**
 * Track promotion view events (view_promotion).
 * Sources: Klaviyo popups (via event listener).
 * Deduplicated per promotionId per session.
 * @param {Object} config - GTM config object
 */
export const initViewPromotion = (config) => {
  if (!isEventEnabled(config, 'view_promotion')) {
    return;
  }
  trackViewEnabled = true;
  attachPromotionListener();
};

/**
 * Track promotion select events (select_promotion).
 * Sources: Klaviyo popups (via event listener).
 * Deduplicated per promotionId per session.
 * @param {Object} config - GTM config object
 */
export const initSelectPromotion = (config) => {
  if (!isEventEnabled(config, 'select_promotion')) {
    return;
  }
  trackSelectEnabled = true;
  attachPromotionListener();
};
