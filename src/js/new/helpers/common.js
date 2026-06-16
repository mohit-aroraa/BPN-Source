export const isDesktop = () => window.innerWidth > 480;

export const extractShopifyId = (gid) => {
  return gid?.split('/')?.pop(); // returns '44236338659500'
};

export const openPage = (url) => {
  window.open(url, '_blank');
};
// Scroll management
export const lockBodyScroll = () => {
  // Add cart-open class to html element
  document.documentElement.classList.add('cart-open');

  // Calculate scrollbar width and set it as a CSS variable
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0) {
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
  }
};

export const unlockBodyScroll = () => {
  // Remove cart-open class from html element
  document.documentElement.classList.remove('cart-open');

  // Remove scrollbar width CSS variable
  document.documentElement.style.removeProperty('--scrollbar-width');
};
