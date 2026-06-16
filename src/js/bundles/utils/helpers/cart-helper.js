import axios from 'axios';

import { getCustomerPhone } from '../../../new/helpers/customer';
import { getCustomerIsSMSSubscribed } from '../../../new/helpers/customer';

// Log cart api error to sentry
const mapCartErrorMessage = (err, payload, type) => {
  const { responseJSON } = err;
  if (responseJSON && responseJSON.status && responseJSON.description) {
    window.enableToast && window.enableToast(responseJSON.description, 'error');
  } else {
    window.enableToast && window.enableToast(err, 'error');
  }
  if (window.logToSentry) {
    const error = `Error during cart api interaction ${responseJSON.description || 'mapping'
      }`;
    const tags = [
      { name: 'add_to_cart', value: 'failed' },
      { name: 'interaction_type', value: type },
    ];
    const context = {
      name: 'cart_api_interaction',
      data: JSON.stringify(payload),
    };
    window.logToSentry(error, tags, context, 'Error');
    console.warn(error);
  }
};

const methods = {
  get(url) {
    return axios
      .get(url)
      .then((res) => res.data)
      .catch((e) => {
        mapCartErrorMessage(e, null, url);
      });
  },

  post(url, payload) {
    return axios
      .post(url, payload)
      .then((res) => res.data)
      .catch((e) => {
        mapCartErrorMessage(e, payload, url);
      });
  },
};

export const isSMSGWPProperty = (properties = {}) => {
  try {
    return properties.__SMSGWP === true;
  } catch (e) {
    return false;
  }
};


export default {
  async get() {
    return methods.get('/cart/update.js');
  },
  async change(payload) {
    return await methods.post('/cart/change.js', payload);
  },
  async update(payload) {
    return await methods.post('/cart/update.js', payload);
  },
  async clear() {
    return methods.post('/cart/clear.js');
  },
  async postBatch(type, items) {
    const payload = {
      items: items.map((item) => {
        const product = { ...item };

        if (!isSMSGWPProperty(product.properties)) {
          product.properties = product.properties || {};
          product.properties.__SMS = getCustomerIsSMSSubscribed();
        }

        return product;
      }),
    };

    if (!getCustomerPhone()) {
      console.warn('Phone number not found. Proceeding without SMS flag.');
    }

    return methods.post(`/cart/${type}.js`, payload);
  },

  async post(type, payload) {
    // Handle object payload with items array: {items: [{id: abc}, {id: 123}]}
    if (payload.items && Array.isArray(payload.items)) {
      payload.items.forEach(item => {
        if (!isSMSGWPProperty(item.properties)) {
          item.properties = item.properties || {};
          item.properties.__SMS = getCustomerIsSMSSubscribed();
        }
      });
    }
    // Handle single object payload: {id: abc}
    else if (payload && typeof payload === 'object') {
      if (!isSMSGWPProperty(payload.properties)) {
        payload.properties = payload.properties || {};
        payload.properties.__SMS = getCustomerIsSMSSubscribed();
      }
    }

    if (!getCustomerPhone()) {
      console.warn('Phone number not found. Proceeding without SMS flag.');
    }

    return methods.post(`/cart/${type}.js`, payload);
  },
};
