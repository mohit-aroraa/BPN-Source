const initGrowthbook = () => {
  const observer = new MutationObserver(() => {
    const messageWrapper = document.querySelector('.cart__footer-message');


    if (messageWrapper && !messageWrapper.dataset.gbInitialized) {
      messageWrapper.dataset.gbInitialized = "true";
      setupSidecartMessage(messageWrapper);
    }

  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};


function setupSidecartMessage(wrapper) {
  window.growthbook_queue = window.growthbook_queue || [];
  window.growthbook_queue.push(_ => {
    const applyFeatureFlags = () => {
      const gb = window._growthbook;
      const value = gb?.getFeatureValue('sidecart-message-test', false);
      const holdout = gb?.getFeatureValue('holdout-pdm-bpn', 'exposed');
      const textElement = wrapper.querySelector("p i");

      if (holdout === 'holdout-q4-2025' || !textElement) {
        wrapper.classList.remove('show');
        return;
      }

      const variants = {
        "variant-b": "Trusted by 530k+ Customers",
        "variant-c": "50,000+ 5-Star Reviews"
      };

      if (variants[value]) {
        textElement.textContent = variants[value];
        wrapper.classList.add('show');
      } else {
        wrapper.classList.remove('show');
      }
    };
    applyFeatureFlags();
    document.addEventListener('growthbookdata', applyFeatureFlags);
  });
}

export default initGrowthbook;
