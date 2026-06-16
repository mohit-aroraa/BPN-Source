import { createStore } from 'vuex';
import cartMethods from '../helpers/cart-helper';

const { get, post } = cartMethods;

function syncCartInstances(instance, lineItems) {
  const { cartPageInstance } = window;

  if (cartPageInstance && instance && instance === cartPageInstance.$store) {
    cartPageInstance.$store.commit('cart/SET_LINE_ITEMS', lineItems);
  }
}

function setCartMessage(commit, message) {
  if (message) {
    commit('SET_MESSAGE', message);
    setTimeout(() => commit('SET_MESSAGE', null), 4000);
  }
}

const cartStore = {
  namespaced: true,
  state: () => ({
    lineItems: {},
    fetching: false,
    message: null,
  }),
  getters: {
    getCurrency: (state) => {
      return state.lineItems.currency || 'USD';
    },
    getLineItems: (state) => {
      return state.lineItems.items || [];
    },
    cartData: (state) => state.lineItems.items,
    getCartTotal: (state) => state.lineItems?.total_price || 0,
    getCartOriginTotal: (state) => state.lineItems?.original_total_price || 0,
    getLoading: (state) => state.fetching,
    getCartMessage: (state) => state.message,
  },
  mutations: {
    SET_LINE_ITEMS: (state, items) => {
      state.lineItems = items;
    },
    SET_LOADING: (state, fetching) => {
      state.fetching = fetching;
    },
    SET_MESSAGE: (state, message) => {
      state.message = message;
    },
  },
  actions: {
    async INIT({ commit }) {
      let lineItems = await get();
      const productsAddedFromLandingPage = lineItems?.items?.filter(
        (item) => item.properties?._added_from_landing_page === true,
      ) || [];
      if (productsAddedFromLandingPage.length) {
        let update = { updates: {} };
        productsAddedFromLandingPage.forEach((item) => {
          update.updates[item.key] = 0;
        });
        lineItems = await post('update', update);
      }
      commit('SET_LINE_ITEMS', lineItems);
      commit('SET_LOADING', false);
      return lineItems;
    },
    async SYNC({ commit }) {
      let lineItems = await get();
      commit('SET_LINE_ITEMS', lineItems);
      return lineItems;
    },
    async ADD({ commit, dispatch }, { payload, shimmer, instance, message }) {
      if (shimmer) {
        commit('SET_LOADING', true);
      }
      const lineItem = await post('add', payload);
      const lineItems = await dispatch('INIT');
      if (lineItems) {
        setCartMessage(commit, message);
        syncCartInstances(instance, lineItems);
      }
      return lineItem;
    },
    async UPDATE({ commit }, { payload, shimmer, instance, message }) {
      if (shimmer) {
        commit('SET_LOADING', true);
      }
      const lineItems = await post('update', payload);
      if (lineItems) {
        commit('SET_LINE_ITEMS', lineItems);
        setCartMessage(commit, message);
        syncCartInstances(instance, lineItems);
      }
      return lineItems;
    },
    async CHANGE({ commit }, { payload, shimmer, instance, message }) {
      if (shimmer) {
        commit('SET_LOADING', true);
      }
      await post('change', payload);
      const lineItems = await get();
      if (lineItems) {
        commit('SET_LINE_ITEMS', lineItems);
        setCartMessage(commit, message);
        syncCartInstances(instance, lineItems);
      }
      return lineItems;
    },
    async CLEAR({ commit }) {
      commit('SET_LOADING', true);
      const lineItems = await post('clear', null);
      if (lineItems) {
        commit('SET_LINE_ITEMS', lineItems);
        commit('SET_LOADING', false);
      }
    },
  },
};

const store = createStore({
  modules: {
    cart: cartStore,
  },
});

export default store;
