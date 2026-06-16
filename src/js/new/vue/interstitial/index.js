import { createApp, h } from 'vue';


// Components
import RecommendationsPopup from './recommendations-popup.vue';


let popupApp = null;
let popupInstance = null;

export const initInterstitial = () => {
  if (popupApp) {
    return popupInstance;
  }

  try {
    // Create a container for the popup
    const container = document.createElement('div');
    container.id = 'interstitial-popup-container';
    document.body.appendChild(container);

    // Create Vue app
    popupApp = createApp(RecommendationsPopup);
    popupInstance = popupApp.mount(container);

    return popupInstance;
  } catch (error) {
    console.error('Failed to initialize interstitial popup:', error);
    return null;
  }
};

export const getPopupInstance = () => popupInstance;

const cleanupPopup = () => {
  if (popupApp) {
    try {
      popupApp.unmount();
      popupApp = null;
      popupInstance = null;

      // Remove container
      const container = document.getElementById('interstitial-popup-container');
      if (container) {
        container.remove();
      }
    } catch (error) {
      console.error('Failed to cleanup popup:', error);
    }
  }
};

window.addEventListener('beforeunload', cleanupPopup);
