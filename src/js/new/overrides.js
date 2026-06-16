// TODO: Remove after we remove Rebuy
export const overrideRebuy = () => {
  function waitForRebuySmartCart(callback) {
    if (window.Rebuy && window.Rebuy.SmartCart) {
      callback();
    } else {
      setTimeout(() => waitForRebuySmartCart(callback), 500);
    }
  }

  // Set the skip_open property once Rebuy Smart Cart is available
  waitForRebuySmartCart(() => {
    // eslint-disable-next-line camelcase
    window.Rebuy.SmartCart.skip_open = true;
  });
};
