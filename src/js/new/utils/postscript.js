import { safeGet } from './data-safety';

const popupOptions = {
  activePopupBehavior: 'ALWAYS_DISMISS',
  respectPopupStatus: false,
};

const TIMEOUT = 1000;

export const openModal = (popupId) => {
  const open = safeGet(window, 'postscript.popups.open', null);

  if (open !== null) {
    const id = popupId.includes('-') ? popupId : Number(popupId);

    try {
      open(id, popupOptions);
    } catch (e) {
      console.warn(e);
    }
  } else {
    setTimeout(() => {
      openModal(popupId);
    }, TIMEOUT);
  }
};
