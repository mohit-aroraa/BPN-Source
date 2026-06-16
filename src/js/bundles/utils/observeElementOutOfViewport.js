export function trackElementsVisibility(elements, hide, show) {
  const visibilityMap = new Map();
  let footerVisible = false;

  const footer = document.querySelector('footer');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const hasScrolledMoreThan200px = window.scrollY > 200;

      // Track footer separately
      if (entry.target === footer) {
        footerVisible = entry.isIntersecting;
      } else {
        visibilityMap.set(entry.target, entry.isIntersecting);
      }

      const allNotVisible = Array.from(visibilityMap.values()).every(isVisible => !isVisible);
      const anyVisible = Array.from(visibilityMap.values()).some(isVisible => isVisible);

      if (!hasScrolledMoreThan200px) {
        hide();
        return;
      }

      // Hide if footer is visible
      if (footerVisible) {
        hide();
        return;
      }

      if (allNotVisible) {
        show();
      } else if (anyVisible) {
        hide();
      }
    });
  });

  elements.forEach(element => {
    visibilityMap.set(element, true);
    observer.observe(element);
  });

  // Observe footer if it exists
  if (footer) {
    observer.observe(footer);
  }
}
