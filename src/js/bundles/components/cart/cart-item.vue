<template>
  <div
    class="cartItem"
    :class="{
      'cartItem--processing': fetching,
    }"
  >
    <div class="cartItem__left">
      <div class="cartItem__img">
        <img
          class="img"
          :src="renderLineItem?.featured_image?.url + '&amp;width=90'"
          :alt="renderLineItem.title"
          width="72px"
          height="72px"
          loading="lazy"
          v-if="
            renderLineItem.properties.isFree ||
              renderLineItem.properties.shipping_interval_frequency
          "
        />
        <a
          :href="renderLineItem.url"
          data-sl="cart_item_image"
          :aria-label="`${renderLineItem.title}image`"
          v-else
        >
          <img
            class="img"
            :src="renderLineItem?.featured_image?.url + '&amp;width=90'"
            :alt="renderLineItem.title"
            width="72px"
            height="72px"
            loading="lazy"
          />
        </a>
      </div>
    </div>
    <div class="cartItem__right">
      <div class="cartItem__header">
        <div>
          <a
            v-if="
            renderLineItem.properties.isFree ||
              renderLineItem.properties.shipping_interval_frequency
          "
            class="cartItem__title cartItem__title--no-hover"
          >
            <h3 data-sl="cart_item_title" v-html="renderLineItem.title"></h3></a>
          <a
            class="cartItem__title"
            :href="renderLineItem.url"
            data-sl="`cart_item_url`"
            v-else
          >
            <h3 data-sl="cart_item_title" v-html="renderLineItem.title"></h3>
          </a>

          <p v-if="activeDiscountTag.hasDiscountTag" class="cartItem__priceDiscount">
            SALE {{ activeDiscountTag.discount }}%
          </p>
        </div>
        <template
          v-if="
            isCartItem && !renderLineItem.properties.isFree && !isUpsellItem && renderLineItem.finalPrice
          "
        >
          <button
            class="cartItem__actionBtn cartItem__actionRemove"
            @click.prevent="updateLineItem(true, false)"
            data-sl="cart_item_remove"
          >
            <remove-icon></remove-icon>
          </button>
        </template>
      </div>

      <p
        class="cartItem__variant"
        v-if="renderLineItem.size"
        data-sl="cart_item_size"
      >
        <span>
          {{ renderLineItem.size }}
        </span>
      </p>
      <p
        class="cartItem__variant"
        :class="{ hide: isUpsellItem }"
        v-if="!renderLineItem.properties.isFree"
      >
        <span>
          {{ isSubscriptionProduct }}
        </span>
      </p>

      <p
        class="cartItem__variant cartItem__variant--light"
        v-if="
          isUpsellItem &&
            renderLineItem.variants &&
            renderLineItem.variants.length === 1
        "
      >
        <span>
          {{ renderLineItem.variants[0].title }}
        </span>
      </p>

      <p
        class="cartItem__variant"
        v-if="renderLineItem.description && isUpsellItem"
        v-html="renderLineItem.description"
      ></p>

      <div
        class="cartItem__align"
        :class="{
          'cartItem__align--hide-price':
            isUpsellItem &&
            renderLineItem.variants &&
            renderLineItem.variants.length > 1,
        }"
      >
        <select
          v-show="
            isUpsellItem &&
              renderLineItem.variants &&
              renderLineItem.variants.length > 1
          "
          class="cartItem__variantSelector"
          ref="selctedUpsellvariant"
        >
          <template v-for="variant in renderLineItem.variants">
            <option
              :value="variant.id"
              :key="variant.id"
              v-if="variant.available"
            >
              {{ variant.title }}
            </option>
          </template>
        </select>
        <button
          type="button"
          class="button button-primary button-small cartItem__upsellCta"
          title="Add upsell product to the cart"
          v-if="
            isUpsellItem &&
              renderLineItem.variants &&
              renderLineItem.variants.length === 1
          "
          @click.prevent="addToCart(renderLineItem.title)"
          :disabled="addingUpsellToCart"
        >
          Add to Cart
        </button>
        <div
          class="cartItem__quantity"
          v-if="
            isCartItem && !isUpsellItem && !renderLineItem.properties.isFree && !renderLineItem.isGift && renderLineItem.finalPrice
          "
        >
          <div
            class="cartItem__quantityIcon"
            :aria-label="`decrease quantity for ${renderLineItem.title}`"
            @click.prevent="updateLineItem(false, false)"
            data-sl="item_minus_counter"
            role="button"
          >
            <quantity-icon></quantity-icon>
          </div>
          <input
            class="cartItem__quantityVal"
            aria-live="polite"
            readonly="readonly"
            :value="lineItem.quantity"
            type="text"
            :data-quantity="lineItem.quantity"
            :aria-label="`${renderLineItem.title} quantity is ${lineItem.quantity}`"
          />
          <div
            class="cartItem__quantityIcon"
            :aria-label="`increase quantity for ${renderLineItem.title}`"
            @click.prevent="updateLineItem()"
            data-sl="item_plus_counter"
            role="button"
          >
            <quantity-icon icon-type="plus"></quantity-icon>
          </div>
        </div>
        <p class="cartItem__freeGift" v-if="renderLineItem.properties.isFree">
          Free item
        </p>

        <button
          type="button"
          class="button button-primary button-small cartItem__upsellCta"
          title="Add upsell product to the cart"
          v-if="
            isUpsellItem &&
              renderLineItem.variants &&
              renderLineItem.variants.length > 1
          "
          @click.prevent="addToCart(renderLineItem.title)"
          :disabled="addingUpsellToCart"
        >
          Add <span class="mobile-only">to cart</span> - {{ currencySymbol }}{{ finalPrice.value
          }}<span v-if="finalPrice.sup">{{ '.' + finalPrice.sup }}</span>
        </button>

        <span
          class="cartItem__price cartItem__price--strike"
          :data-item-price="finalPrice.value"
          aria-live="alert"
          :aria-label="`${renderLineItem.title} price is now ${lineItem.quantity}`"
          v-if="showDiscountedPrice"
        >
          <s class="cartItem__priceOriginal">{{ price }}</s>
          <span class="cartItem__priceDiscounted">{{ priceDiscounted }}</span>
        </span>
        <span
          class="cartItem__price"
          :data-item-price="finalPrice.value"
          aria-live="alert"
          :aria-label="`${renderLineItem.title} price is now ${lineItem.quantity}`"
          v-else
        >
          {{ price }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import BaseImage from '../base/image.vue';
import { mapActions } from 'vuex';
// component section
import ArrowDown from '../base/arrow-down.vue';
import QuantityIcon from '../base/quantity-icon.vue';
import RemoveIcon from '../base/remove-icon.vue';
import { fetchProductDetailsAPI } from '../../../new/client/product';
import { exists, safeGet } from '../../../new/vue/utils/vue-safety';
import { formatDiscountedPrice, formatPrice } from '../../../new/components/product-drawer/vue/utils';

export default {
  data() {
    return {
      productDetails: {
        tags: [],
      },
      fetching: false,
      message: '',
      upsellProductVariant: 'default',
      addingUpsellToCart: false,
      currencySymbol: window.BPN?.cart?.currencySymbol || '$',
    };
  },
  props: {
    lineItem: {
      type: Object,
      default: () => {
      },
    },
    isCartItem: {
      type: Boolean,
      default: true,
    },
    isUpsellItem: {
      type: Boolean,
      default: false,
    },
    isCartPage: {
      type: Boolean,
      default: false,
    },
    currencyCode: {
      type: String,
      default: false,
    },
  },
  components: {
    QuantityIcon,
    ArrowDown,
    RemoveIcon,
    BaseImage,
  },
  computed: {
    hasSubscription() {
      return exists(safeGet(this.lineItem, 'selling_plan_allocation.compare_at_price'));
    },
    activeDiscountTag() {
      const pattern = /^ssale\d+$/;
      const tags = this.productDetails?.tags || [];

      const match = tags.find((item) => pattern.test(item));

      if (match) {
        return {
          hasDiscountTag: true,
          discount: Number(match.replace('ssale', '')),
        };
      }

      return {
        hasDiscountTag: false,
        discount: 0,
      };
    },
    showDiscountedPrice() {
      if (this.activeDiscountTag.hasDiscountTag) {
        return true;
      }

      if (this.hasSubscription) {
        return true;
      }

      return this.renderLineItem.originalPrice > this.renderLineItem.finalPrice &&
        !this.isUpsellItem;
    },
    price() {
      let value = this.lineItem.final_line_price;

      if (this.hasSubscription) {
        value = this.lineItem.selling_plan_allocation.compare_at_price * this.lineItem.quantity;
      }

      return formatPrice(value / 100, this.currencyCode);
    },
    priceDiscounted() {
      if (this.activeDiscountTag.hasDiscountTag) {
        let value = this.lineItem.price;

        if (this.hasSubscription && 'selling_plan_allocation' in this.lineItem) {
          value = this.lineItem.selling_plan_allocation.compare_at_price;
        }

        return formatDiscountedPrice(value * this.lineItem.quantity / 100, this.activeDiscountTag.discount, this.currencyCode);
      }

      return formatPrice(this.lineItem.final_line_price / 100, this.currencyCode);
    },
    properties() {
      return this.lineItem?.properties || {};
    },
    renderLineItem() {
      // map cart items properties for render
      const { properties, lineItem } = this;
      const commonProperties = {
        title: properties?._title || lineItem?.product_title,
        description: lineItem?.product_description || '',
        quantity: lineItem?.quantity,
        varianId: lineItem?.variant_id,
        finalPrice: lineItem?.final_line_price,
        properties: properties || {},
        variants: lineItem?.variants || [],
        selling_plan_allocation: lineItem?.selling_plan_allocation,
        type: lineItem?.product_type,
        isGift: properties.__SMSGWP || false,
      };
      return {
        ...commonProperties,
        image: lineItem?.image,
        featured_image: lineItem?.featured_image,
        originalPrice: lineItem?.original_line_price,
        lineItemPrice: lineItem?.final_price,
        size: lineItem?.variant_title,
        url: lineItem?.url,
      };
    },

    finalPrice() {
      const { renderLineItem, getPrice } = this;
      return renderLineItem && renderLineItem.finalPrice
        ? getPrice(renderLineItem.finalPrice)
        : { value: 0, sup: 0 };
    },
    originalPrice() {
      const { renderLineItem, getPrice } = this;
      return renderLineItem && renderLineItem.originalPrice
        ? getPrice(renderLineItem.originalPrice)
        : { value: 0, sup: 0 };
    },
    isSubscriptionProduct() {
      return this.renderLineItem?.selling_plan_allocation
        ? 'Subscription Purchase'
        : 'One-Time Purchase';
    },
  },
  watch: {
    activeDiscountTag() {
      if (this.activeDiscountTag.hasDiscountTag) {
        this.$emit('discountCalculated', {
          key: safeGet(this.lineItem, 'key'),
          discount: this.activeDiscountTag.discount,
        });
      }
    },
  },
  methods: {
    ...mapActions('cart', [ 'ADD', 'UPDATE', 'CHANGE' ]),
    async fetchProductDetails() {
      try {
        if (this.lineItem?.handle) {
          const product = await fetchProductDetailsAPI(this.lineItem.handle);
          this.productDetails = product;
          // you can also console.log if needed
          console.log('Fetched product details:', product);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    },
    async updateLineItem(remove = false, add = true) {
      // update cart item includes add, update, remove
      const { lineItem, renderLineItem, setIsFetching } = this;
      setIsFetching(true);

      const message = remove
        ? `${renderLineItem.title} is removed from your cart`
        : add
          ? `${renderLineItem.title} quantity increased`
          : `${renderLineItem.title} quantity decreased`;
      const change = { id: lineItem.key };
      change.quantity = remove
        ? 0
        : add
          ? lineItem.quantity + 1
          : lineItem.quantity - 1;
      this.$emit(
        'quantityAction',
        !(change && change.quantity === 0),
      );

      await this.CHANGE({
        payload: change,
        shimmer: false,
        instance: this.$store,
        message,
      });
      setIsFetching(false);
    },

    addToCart(productName) {
      // add to cart from outside the cart items
      const { renderLineItem } = this;
      const variantId = this.$refs.selctedUpsellvariant?.value;
      this.$emit('quantityAction', false);
      const message = productName
        ? `${productName} added to cart`
        : 'item added to cart';

      this.setUpsellToCart(true);

      this.ADD({
        payload: {
          id: variantId,
          quantity: 1,
          properties: {},
        },
        shimmer: true,
        instance: this.$store,
        message,
      })
        .then(() => {
          this.setUpsellToCart(false);
        })
        .catch((err) => {
          this.setUpsellToCart(false);
        });
    },

    setIsFetching(value) {
      this.fetching = value;
    },
    setUpsellToCart(value) {
      this.addingUpsellToCart = value;
    },

    updateDateFormat(date) {
      const splittedDate = date.split('-');
      return `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`;
    },
    getPrice(price) {
      const fixedPrice = { value: 0, sup: 0 };
      if (price) {
        const priceSplit = (price / 100).toFixed(2).split('.');
        fixedPrice.value = priceSplit[0];
        fixedPrice.sup = priceSplit[1] > 0 ? priceSplit[1] : 0;
      }
      return fixedPrice;
    },
  },
  mounted() {
    this.fetchProductDetails();
  },
};
</script>