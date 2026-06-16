export const dom = {};

const mountDom = () => {
  dom.header = document.querySelector('.pageHeader');
  dom.smsSubscription = document.querySelector('.sms-subscription-not-subscribed.sms-subscription');
  dom.smsSubscriptionSubscribed = document.querySelector('.sms-subscription-subscribed.sms-subscription');
  dom.announcementBar = document.querySelector('.announcementBar');
  dom.siteHeader = document.querySelector('#site-header');
  dom.navItem = document.querySelectorAll('.js-mega-menu');
  dom.searchWrapper = document.querySelector('.search-form');
  dom.searchIcon = document.querySelector('.js-search');
  dom.searchCloseIcon = document.querySelector('.search-form-close');
  dom.searchBar = document.querySelector('.search-form__input');
  dom.mobileMenu = document.querySelector('.mobileDrawer');
  dom.searchButton = document.querySelector('.search-form-submit');
  dom.megamenuOverlay = document.querySelector('.megamenuOverlay');
};

function setOverlayTop() {
  let bannerHeight = 0;

  if (dom.smsSubscription) {
    bannerHeight += dom.smsSubscription.clientHeight;
  }

  if (dom.smsSubscriptionSubscribed) {
    bannerHeight += dom.smsSubscriptionSubscribed.clientHeight;
  }

  if (dom.megamenuOverlay) {
    dom.megamenuOverlay.style.setProperty('--header-top', `${bannerHeight}px`);
  }
}

function setBodyTopPadding() {
  if (dom.header) {
    const $headerHeight = dom.header.clientHeight;
    let bannerHeight = 0;

    if ($headerHeight) {
      setOverlayTop();

      if (dom.smsSubscription) {
        bannerHeight += dom.smsSubscription.clientHeight;
      }

      const root = document.documentElement;

      root.style.setProperty('--body-top-padding', `${$headerHeight + bannerHeight}px`);
      root.style.setProperty('--header-top', `${bannerHeight}px`);

      if (dom.announcementBar) {
        bannerHeight += dom.announcementBar.clientHeight;
      }

      root.style.setProperty(
        '--banner-height',
        `${bannerHeight}px`,
      );

      if (dom.siteHeader) {
        root.style.setProperty(
          '--header-height',
          `${dom.siteHeader.clientHeight}px`,
        );
      }
    }
  }
}

export default function siteHeader() {
  mountDom();

  function removeSearch() {
    if (dom.searchBar && dom.searchWrapper && dom.searchIcon) {
      dom.searchBar.blur();
      dom.searchWrapper.classList.remove('form-open');
      dom.searchIcon.parentElement.classList.remove('is--active');
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
    }
  }

  const outClickHandler = (event) => {
    if (!dom.searchWrapper.contains(event.target)) {
      event.preventDefault();
      event.stopPropagation();

      removeSearch();

      return false;
    }
  };

  const setSearchFormTopPadding = () => {
    const headerElement = document.querySelector('.header__wrapper');
    const rect = headerElement.getBoundingClientRect();
    const bottomLine = rect.bottom;

    dom.searchWrapper.style.setProperty('--search-form-top-padding', `${bottomLine}px`);
  };

  if (dom.searchIcon) {
    dom.searchIcon.addEventListener('click', () => {
      const isOpen = dom.searchWrapper.classList.contains('form-open');
      if (!isOpen) {
        setSearchFormTopPadding();

        const isMobileMenuOpen =
          document.body.classList.contains('drawer-open');
        if (isMobileMenuOpen) {
          document.body.classList.remove('drawer-open');
          dom.mobileMenu.setAttribute('aria-hidden', 'false');
        }
        dom.searchWrapper.classList.add('form-open');
        dom.searchIcon.parentElement.classList.add('is--active');
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        document.addEventListener('click', outClickHandler, { capture: true, once: true });

        setTimeout(() => {
          dom.searchBar.focus();
        }, 50);
      } else {
        removeSearch();
      }
    });
  }

  if (dom.searchButton) {
    dom.searchButton.addEventListener('click', (e) => {
      if (!dom.searchBar.value) {
        e.preventDefault();
      }
    });
  }

  if (dom.searchCloseIcon) {
    dom.searchCloseIcon.addEventListener('click', removeSearch);
  }

  if (dom.navItem) {
    let activeItem = null;

    dom.navItem.forEach((item) => {
      item.addEventListener('mouseover', () => {
        // Close previously active item if exists
        if (activeItem && activeItem !== item) {
          activeItem.classList.remove('is--active');
        }
        
        item.classList.add('is--active');
        document.body.classList.add('megaMenu-open');
        removeSearch();
        activeItem = item;
      });

      item.addEventListener('mouseleave', () => {
        item.classList.remove('is--active');
        document.body.classList.remove('megaMenu-open');
        activeItem = null;
      });
    });
  }

  if (dom.header) {
    setBodyTopPadding();
    window.addEventListener('resize', setBodyTopPadding);

    window.addEventListener('scroll', function () {
      const $headerHeight = dom.header.clientHeight;
      if (window.pageYOffset > $headerHeight) {
        document.body.classList.add('header-sticky');
      } else {
        document.body.classList.remove('header-sticky');
      }
    });

    document.querySelectorAll('.header-dropdown__activity-area').forEach(link => {
      link.addEventListener('click', event => {
        window.location.href = event.currentTarget.dataset.href;
      });
    });
  }
}

export function syncHeaderPadding() {
  try {
    setOverlayTop();
    setBodyTopPadding();
  } catch (e) {
    console.log(e);
  }
}
