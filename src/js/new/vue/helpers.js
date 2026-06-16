import { createApp, h } from 'vue';

import clickOutside from '../../bundles/utils/directives/click-outside';
import focusTrap from '../../bundles/utils/directives/focus-trap';

export const initVueApp = ({ selector, name, component, props }) => {
  const container = document.querySelector(selector);

  if (!container) {
    console.warn(`Container for ${name} was not found`);
    return;
  }

  const app = createApp({
    render: () => h(component, props),
  });

  app.directive('trap', focusTrap);
  app.directive('click-outside', clickOutside);

  app.mount(container);

  return app;
};
