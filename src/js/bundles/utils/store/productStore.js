import { createStore } from 'vuex';

const productStore = {
  namespaced: true,
  state: () => {
    const currentProductData = window?.BPN?.currentProductData || {}
    const availableVariantId = currentProductData.selected_or_first_available_variant?.id

    const firstAvailableVariant = currentProductData.variants?.find(
      variant => variant.id === availableVariantId
    )

    return ({
      originalProductInfo: currentProductData,
      selectedVariant: firstAvailableVariant,
      activeProduct: currentProductData,
      subscriptionWidgetConfiguration: window?.BPN?.rcWidgetData || {},
      purchaseType: 'onetime',
      selectedSellingPlan: null,
      subscriptionDiscountedAmount: 0,
      additionalProducts: {},
    })
  },

  getters: {
    getOriginalProductObject: (state) => state.originalProductInfo,
    getSelectedVariant: (state) => state.selectedVariant,
    getActiveProduct: (state) => state.activeProduct,
    getSubscriptionWidgetConfiguration: (state) => state.subscriptionWidgetConfiguration,
    getPurchaseType: (state) => state.purchaseType,
    getSelectedSellingPlan: (state) => state.selectedSellingPlan,
    getSubscriptionDiscountedAmount: (state) => state.subscriptionDiscountedAmount,
    getAdditionalProducts: (state) => state.additionalProducts,
  },

  mutations: {
    SET_SELECTED_VARIANT(state, variant) {
      state.selectedVariant = variant;
    },
    SET_ACTIVE_PRODUCT(state, product) {
      state.activeProduct = product;
    },
    SET_ORIGINAL_PRODUCT(state, product) {
      state.originalProductInfo = product;
    },
    SET_PURCHASE_TYPE(state, purchaseType) {
      state.purchaseType = purchaseType;
    },
    SET_SELECTED_SELLING_PLAN(state, selectedSellingPlan) {
      state.selectedSellingPlan = selectedSellingPlan;
    },
    SET_SUBSCRIPTION_DISCOUNTED_AMOUNT(state, subscriptionDiscountedAmount) {
      state.subscriptionDiscountedAmount = subscriptionDiscountedAmount;
    },
    SET_ADDITIONAL_PRODUCT(state, payload) {
      state.additionalProducts[payload.productHandle] = payload.productObj;
    },
  },

  actions: {
    mutateSelectedVariant({ commit }, payload) {
      commit('SET_SELECTED_VARIANT', payload);
    },
    mutateActiveProduct({ commit }, payload) {
      commit('SET_ACTIVE_PRODUCT', payload);
    },
    mutateOriginalProduct({ commit }, payload) {
      commit('SET_ORIGINAL_PRODUCT', payload);
    },
    mutatePurchaseType({ commit }, payload) {
      commit('SET_PURCHASE_TYPE', payload);
    },
    mutateSelectedSellingPlan({ commit }, payload) {
      commit('SET_SELECTED_SELLING_PLAN', payload);
    },
    mutateSubscriptionDiscountedAmount({ commit }, payload) {
      commit('SET_SUBSCRIPTION_DISCOUNTED_AMOUNT', payload);
    },
    mutateAdditionalProducts({ commit }, payload) {
      commit('SET_ADDITIONAL_PRODUCT', payload);
    },
  },
};

const store = createStore({
  modules: {
    product: productStore,
  },
});

export default store;
