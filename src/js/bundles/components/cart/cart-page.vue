<template>
  <div class="cart">
    <form action="/cart" method="post" novalidate>
      <div class="section__cols cols">
        <div class="section__col column column--1of2">
          <div class="section__col-inner section__col-inner--small">
            <h4 class="heading-4">Your Cart</h4>
            <cart-shimmer v-if="isLoading" />
            <div v-if="finalItems.length || isLoading">
              <cart-item
                v-for="(item) in finalItems"
                :key="item.key"
                :lineItem="item"
                :isCartPage="true"
                :currencyCode="currencyCode"
                @discountCalculated="discountCalculated"
              />
            </div>
            <div class="section__message" v-else>
              <h5 class="heading-5">Your cart is currently empty.</h5>
              <p>
                Continue browsing
                <a href="/collections/best-sellers"><u>here</u></a>.
              </p>
            </div>
          </div>
        </div>
        <div class="section__col column column--1of2">
          <div class="section__col-inner">
            <h4 class="cart__orderTitle heading-4">Your Order</h4>
            <p>
              <span class="cart__total">SUBTOTAL</span>
              <span class="cart__totalPrice">
                <span class="saso-cart-original-total">{{ itemsSubtotalPrice }}</span>
                <span class="saso-cart-total"></span>
              </span>
            </p>
            <button
              type="button"
              class="button button-primary"
              name="checkout"
              @click.stop="submitCheckoutForm"
              :disabled="!finalItems.length"
            >
              Continue to checkout
            </button>
            <template v-if="finalItems.length > 0">
              <additional-payment-buttons
                v-show="!checkForSubscriptionProduct"
              />
            </template>
            <p
              class="cart__shippingText"
              v-html="savingsMeter?.freeShippingInfo"
            ></p>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import AdditionalPaymentButtons from '../cart/additional-payment-buttons.vue';
import CartItem from './cart-item.vue';
import CartShimmer from '../cart/cart-shimmer.vue';
import { safeGet } from '../../../new/vue/utils/vue-safety';
import { formatPrice } from '../../../new/components/product-drawer/vue/utils';

export default {
  name: 'CartPage',
  components: {
    CartItem,
    CartShimmer,
    AdditionalPaymentButtons,
  },
  mounted() {
    console.log('mounted - CartPage');
    if(window.BPN?.cart?.enableThresholds) {
      window.location.href = '/?openCart=true';
    }
  },
  data() {
    return {
      savingsMeter: this.formatJSON(window.SavingsMeter) || null,
      currencySymbol: window.BPN?.cart?.currencySymbol || '$',
      discounts: {},
    };
  },
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters('cart', [ 'getLineItems', 'getCartTotal', 'getCurrency' ]),
    currencyCode() {
      return this.getCurrency;
    },
    finalItems() {
      return this.getLineItems || [];
    },
    finalCartPrice() {
      return this.getCartTotal / 100;
    },
    checkForSubscriptionProduct() {
      const { finalItems } = this;
      const hasSubscriptionItem = finalItems.some(
        (item) => item?.properties?.shipping_interval_frequency,
      );
      return hasSubscriptionItem;
    },
    itemsSubtotalPrice() {
      const price = this.finalItems.reduce((total, item) => {
        const discount = safeGet(this.discounts, item.key, 0);

        let discountedPrice = item.discounted_price;

        if (discount) {
          discountedPrice = Math.round(safeGet(item, 'selling_plan_allocation.compare_at_price', item.price) * (1 - discount / 100));
        }

        return total + discountedPrice * item.quantity;
      }, 0);

      return formatPrice(price / 100, this.currencyCode);
    },
  },
  methods: {
    discountCalculated(payload) {
      this.discounts[payload.key] = payload.discount;
    },
    formatJSON(obj) {
      if (!(obj instanceof Object)) {
        return;
      }

      Object.keys(obj).forEach((key) => {
        if (obj[key] === 'true') {
          obj[key] = true;
        } else if (obj[key] === 'false') {
          obj[key] = false;
        } else if (Number.isInteger(parseInt(obj[key], 10))) {
          obj[key] = parseInt(obj[key], 10);
        }
      });

      return obj;
    },
    submitCheckoutForm(event) {
      this.visitCheckout = true;
      window.location.href = '/checkout';
    },
  },
};
</script>