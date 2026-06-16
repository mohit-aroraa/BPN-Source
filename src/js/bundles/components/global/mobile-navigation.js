const dom = {};

const cacheDom = () => {
  dom.trigger = document.querySelector('.header__menu-link');
  dom.triggerMenuItemOpen = document.querySelectorAll('.js-menuOpen');
  dom.tiggerMenuItemClose = document.querySelectorAll('.js-collaposible-back');
  dom.searchFrom = document.querySelector('.search-form');
  dom.searchFromClose = document.querySelector('.js-search');
  dom.drawerBackdrop = document.querySelector('.drawer_backDrop');
  dom.closeButtom = document.querySelector('.close-menu-link-container .mobile--only.close-menu-link');
};

const closeSiblingMenus = (menu) => {
  menu.parentNode.querySelectorAll('.js-menuOpen').forEach((item) => {
    if (menu === item) {
      if (menu.classList.contains('is--open')) {
        menu.classList.remove('is--open');
        menu.nextElementSibling.classList.remove('is--active');
      } else {
        menu.classList.add('is--open');
        menu.nextElementSibling.classList.add('is--active');
      }
    } else {
      if (menu.innerText.includes('SUPPLEMENTS') && item.dataset.name === 'shop') {
        item.classList.add('is--open');
        item.nextElementSibling.classList.add('is--active');
      } else {
        item.classList.remove('is--open');
        item.nextElementSibling.classList.remove('is--active');
      }
    }
  });
};

function toggleNavigation() {
  const horizontalNav = document.querySelector('.mobile__horizontal_nav');

  if (horizontalNav) {
    horizontalNav.scrollLeft = 0;
  }

  const menuDrawer = document.querySelector('.mobileDrawer');
  const isSearchFormOpen = dom.searchFrom.classList.contains('form-open');

  if (isSearchFormOpen) {
    dom.searchFrom.classList.remove('form-open');
    if (dom.searchFromClose) {
      dom.searchFromClose.parentElement.classList.remove('is--active');
    }
  }

  if (menuDrawer.getAttribute('aria-hidden') === 'true') {
    menuDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open', 'menu--open');
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  } else {
    menuDrawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open', 'menu--open');
    document.body.style.overflow = 'auto';
    document.body.style.touchAction = 'auto';
  }
}

const bindUIActions = () => {
  dom.trigger.addEventListener('click', toggleNavigation);
  dom.closeButtom.addEventListener('click', toggleNavigation);

  if (dom.triggerMenuItemOpen) {
    dom.triggerMenuItemOpen.forEach((menu) => {
      menu.addEventListener('click', () => {
        closeSiblingMenus(menu);
      });
    });
  }

  if (dom.tiggerMenuItemClose) {
    dom.tiggerMenuItemClose.forEach((button) => {
      button.querySelector('.js-close-menuDrawer.icon--menuClose ').addEventListener('click', () => {
        toggleNavigation();
      }, { capture: true });

      button.addEventListener('click', () => {
        const activeMenuItem = button.parentNode.closest('.mobile__nav-menu-item');

        if (activeMenuItem) {
          activeMenuItem.querySelector('.mobile__nav-menuItemToggle.js-menuOpen.is--open').classList.remove('is--open');
        }
        button.parentNode.classList.remove('is--active');
      });
    });
  }

  if (dom.drawerBackdrop) {
    const menuDrawer = document.querySelector('.mobileDrawer');
    dom.drawerBackdrop.addEventListener('click', () => {
      menuDrawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('drawer-open', 'menu--open');
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
    });
  }
};

const initOpenCartTrigger = () => {
  document.querySelectorAll('.cart-trigger').forEach((item) => {
    item.addEventListener('click', () => {
      window.openCartDrawer();
    });
  });
};

export const mobileNavigation = () => {
  cacheDom();
  bindUIActions();
  initOpenCartTrigger();
};
