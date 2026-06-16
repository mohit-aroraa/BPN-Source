import { createStore } from 'vuex';

const collectionStore = {
  namespaced: true,

  state: () => ({
    collectionProducts: window?.BPN?.collection_page_data?.products || [],
    collectionFilters: window?.BPN?.collection_page_data?.filter_data || [],
  }),

  getters: {
    getCollectionProducts: (state) => state.collectionProducts,
    getCollectionMasterFilters: (state) => state.collectionFilters,
  },

  mutations: {
    ADD_PRODUCTS_TO_COLLECTIONS: (state, products) => {
      state.collectionProducts = [ ...state.collectionProducts, ...products ];
    },
  },

  actions: {
    addProductsToCollectionArray: ({ commit }, payload) => {
      commit('ADD_PRODUCTS_TO_COLLECTIONS', payload);
    },
  },
};

export default createStore({
  modules: {
    collection: collectionStore,
  },
});
