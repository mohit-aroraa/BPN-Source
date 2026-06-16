import axios from 'axios';

import { withCache } from '../utils/cache';

export const fetchProductDetailsAPI = async (handle) => {
  const response = await axios.get(`/products/${handle}?view=details`);
  return response.data;
};

export const fetchProductSubscriptionsAPI = async (handle) => {
  const response = await axios.get(`/products/${handle}?view=subscription`);
  return response.data;
};

export const fetchProductDetails = withCache(fetchProductDetailsAPI, 'productDetails');
export const fetchProductSubscriptions = withCache(fetchProductSubscriptionsAPI, 'productSubscriptions');
