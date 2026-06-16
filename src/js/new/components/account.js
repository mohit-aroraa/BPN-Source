const domCache = {
  container: undefined,
};

const initDom = () => {
  domCache.container = document.querySelector('.account__side-nav .navigation-container');
};

function updateFadeEffect() {
  const scrollWidth = domCache.container.scrollWidth;
  const clientWidth = domCache.container.clientWidth;
  const scrollLeft = domCache.container.scrollLeft;

  if (scrollLeft + clientWidth < scrollWidth - 10) {
    domCache.container.style.maskImage = 'linear-gradient(to right, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0))';
    domCache.container.style.webkitMaskImage = 'linear-gradient(to right, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0))';
  } else {
    domCache.container.style.maskImage = 'none';
    domCache.container.style.webkitMaskImage = 'none';
  }
}

function scrollToActiveNavItem() {
  const activeItem = document.querySelector('.account__side-nav__item--active');

  if (!domCache.container || !activeItem) {
    return;
  }

  const containerRect = domCache.container.getBoundingClientRect();
  const itemRect = activeItem.getBoundingClientRect();

  if (itemRect.left >= containerRect.left && itemRect.right <= containerRect.right) {
    return;
  }

  domCache.container.scrollTo({
    left: activeItem.offsetLeft - domCache.container.offsetLeft,
  });

  setTimeout(updateFadeEffect, 200);
}

const syncAccountNavigationActiveItem = (items, path) => {
  items.forEach(item => {
    const url = new URL(item.href);
    const linkPath = `${url.pathname}${url.search}`;

    const isActive = path === linkPath;

    const isDashboard = path === 'account/' || path.includes('account?login_success=true') && linkPath === '/account';
    const isSubscriptionPage = path.includes('/apps/subscriptions/manage/') && linkPath.includes('/apps/subscriptions/manage/');
    const isOrderPage = linkPath === '/account?view=orders_history' && path.includes('account/orders/');

    item.classList.toggle('account__side-nav__item--active', isActive || isDashboard || isSubscriptionPage || isOrderPage);
  });
};

const attachEvents = (items) => {
  if (domCache.container) {
    domCache.container.addEventListener('scroll', updateFadeEffect);
  }

  window.addEventListener('resize', updateFadeEffect);

  items.forEach(item => {
    item.addEventListener('click', (event) => {
      const url = new URL(event.target.href);
      const linkPath = `${url.pathname}${url.search}`;

      syncAccountNavigationActiveItem(items, linkPath);
    });
  });
};

export const syncAccountNavigation = () => {
  const items = document.querySelectorAll('.account__side-nav .navigation-container a');

  if (items.length === 0) {
    return;
  }

  initDom();

  attachEvents(items);

  syncAccountNavigationActiveItem(items, `${window.location.pathname}${window.location.search}`);

  scrollToActiveNavItem();

  updateFadeEffect();
};
