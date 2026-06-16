export const DOCUMENT_BODY = document.querySelector('body');
export const BODY_WRAPPER = document.querySelector('.wrapper');
export const DRAWER_ELM = document.getElementsByClassName('sidebar')[0];
export const CART_BTN_REFS = document.querySelectorAll(
  '[data-sl="home-cart-item-count"]',
);
export const PRODUCT_PAGE_PRICE_ELEM =
  document.querySelectorAll('.js-product-price');
export const PRODUCT_PAGE_ADD_TO_CART = document.querySelector(
  'button[data-product-add-to-cart]',
);

export const SORTING_OPTIONS = [
  { name: 'Best Sellers', value: 'best_sellers' },
  { name: 'Price: Low to High', value: 'low_to_high' },
  { name: 'Price: High to Low', value: 'high_to_low' },
  { name: 'Newest', value: 'newest' },
];

export const SIDEBAR_HEADINGS = {
  cart: 'Cart',
};
export const DRAWER_COMPONENTS = {
  cart: 'CustomerCart',
};
export const CART_MESSAGES = {
  GWP: 'Free gift product added to your cart',
};

export const SAVINGS_METER_EXCLUDE = {
  region: [
    'Alaska',
    'Hawaii',
    'American Samoa',
    'Federated States of Micronesia',
    'Guam',
    'Marshall Islands',
    'Northern Mariana Islands',
    'Palau',
    'Puerto Rico',
    'Virgin Islands',
    'Armed Forces Africa',
    'Armed Forces Americas',
    'Armed Forces Canada',
    'Armed Forces Europe',
    'Armed Forces Middle East',
    'Armed Forces Pacific',
  ],
};
export const THEME_BREAKPOINTS = {
  mobile: 320,
  mobileLarge: 640,
  tablet: 768,
  tabletLarge: 991,
  desktopMedium: 1366,
  desktop: 1440,
  desktopLarge: 1920,
};
