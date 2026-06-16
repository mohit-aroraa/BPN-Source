import { createApp, ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import cartPage from '../cart/cart-page.vue';
import store from '../../utils/store/cartStore';

const cartPageInstanceComponent = {
  mounted() {
    console.log('mounted');
  },
  setup() {
    const storeInstance = useStore();
    const isLoading = ref(false);
    const getLineItems = computed(() => storeInstance.getters['cart/getLineItems']);
    const getCartTotal = computed(() => storeInstance.getters['cart/getCartTotal']);

    const pushToDataLayer = () => {
    };

    const INIT = async () => {
      isLoading.value = true;
      await storeInstance.dispatch('cart/INIT');
      isLoading.value = false;
      pushToDataLayer();
    };

    const SYNC = async () => {
      await storeInstance.dispatch('cart/SYNC');
      pushToDataLayer();
    };

    onMounted(() => {
      document.addEventListener('cart:updated', SYNC);
      INIT();
    });

    return {
      isLoading,
      getLineItems,
      getCartTotal,
    };
  },
  components: { cartPage },
  template: '<cart-page :is-loading="isLoading"/>',
};

export const cartPageInstance = createApp(cartPageInstanceComponent).use(store).mount('#cartPageItems');
