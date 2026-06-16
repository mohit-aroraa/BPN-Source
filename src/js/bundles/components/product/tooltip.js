const TIMEOUT = 200;

export const initTooltip = () => {
  const tooltipButtons = document.querySelectorAll('.tooltip-trigger');
  const tooltips = document.querySelectorAll('.tooltip-content');
  let isMobile = window.matchMedia('(max-width: 767px)').matches;
  let closeTimeout;

  function openTooltip(tooltip) {
    if (tooltip) {
      tooltip.classList.add('active');
      if (closeTimeout) {clearTimeout(closeTimeout);}
    }
  }

  function closeTooltip(tooltip) {
    if (tooltip) {
      closeTimeout = setTimeout(() => {
        tooltip.classList.remove('active');
      }, TIMEOUT);
    }
  }

  function closeAllTooltips(target) {
    tooltips.forEach(tooltip => {
      if (target !== tooltip) {
        closeTooltip(tooltip);
      }
    });
  }

  tooltipButtons.forEach((button, index) => {
    const tooltip = tooltips[index];

    if (!tooltip) {
      console.error(`Tooltip content not found for trigger at index ${index}`);
      return;
    }

    button.addEventListener('mouseenter', () => {
      if (!isMobile) {openTooltip(tooltip);}
    });

    button.addEventListener('mouseleave', () => {
      if (!isMobile) {closeTooltip(tooltip);}
    });

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();

      if (isMobile) {
        if (tooltip.classList.contains('active')) {
          closeTooltip(tooltip);
        } else {
          closeAllTooltips(tooltip);
          openTooltip(tooltip);
        }
      }

      return false;
    });

    tooltip.addEventListener('mouseenter', () => {
      if (closeTimeout) {clearTimeout(closeTimeout);} // Cancel close if hovering on content
    });

    tooltip.addEventListener('mouseleave', () => {
      closeTooltip(tooltip);
    });
  });

  document.addEventListener('click', (event) => {
    const isClickInsideButton = Array.from(tooltipButtons).some(button => button.contains(event.target));
    const isClickInsideContent = Array.from(tooltips).some(tooltip => tooltip.contains(event.target));

    if (!isClickInsideButton && !isClickInsideContent) {
      closeAllTooltips();
    }
  });

  window.addEventListener('resize', () => {
    isMobile = window.matchMedia('(max-width: 767px)').matches;
  });
};
