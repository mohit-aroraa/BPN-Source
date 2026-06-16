<template>
  <div class="productGridItem">
    <div class="productGridItem__media">
      <!-- Slider main container -->
      <div ref="swiper" class="swiper">
        <!-- Additional required wrapper -->
        <div class="swiper-wrapper">
          <!-- Slides -->
          <div class="swiper-slide productGridItem__slide" v-for="(image, index) in productImages" :key="index">
            <a :href="`/products/${productItem.handle}`" :title="productItem.title" @click="pushItemToDataLayer">
              <img class="gridItem__mediaImage" :src="image.src + '&amp;width=470'" :alt="productItem.title"
                width="470px" height="470px" loading="lazy" />
            </a>
          </div>
        </div>
        <!-- If we need navigation buttons -->
        <div class="swiper-button-prev productGridItem__arrow">
          <svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>Left Arrow</title>
            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round"
              stroke-linejoin="round">
              <g transform="translate(-1.000000, -1.000000)" stroke="#000000" stroke-width="1.5">
                <g transform="translate(2.000000, 2.000000)">
                  <polyline points="6 0 0 6 6 12"></polyline>
                  <line x1="0" y1="6" x2="12" y2="6"></line>
                </g>
              </g>
            </g>
          </svg>
        </div>
        <div class="swiper-button-next productGridItem__arrow">
          <svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>Right Arrow</title>
            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round"
              stroke-linejoin="round">
              <g transform="translate(-1.000000, -1.000000)" stroke="#000000" stroke-width="1.5">
                <g transform="translate(2.000000, 2.000000)">
                  <polyline points="6 0 12 6 6 12"></polyline>
                  <line x1="0" y1="6" x2="12" y2="6"></line>
                </g>
              </g>
            </g>
          </svg>
        </div>
      </div>
      <span class="productGridItem__badge" v-if="productItem.product_badge_data &&
        productItem.product_badge_data.has_badge
      " :style="{
        '--badgeBgClr': productItem.product_badge_data.badge_background_color
          ? productItem.product_badge_data.badge_background_color
          : '#D9C79C',
        '--badgeTxtClr': productItem.product_badge_data.badge_text_color
          ? productItem.product_badge_data.badge_text_color
          : '#ffffff',
      }">{{ productItem.product_badge_data.badge_title }}</span>
    </div>
    <div class="productGridItem__ProductDetails">
      <div class="productGridItem__rating">
        <div data-oke-star-rating :data-oke-reviews-product-id="'shopify-' + productItem.id"
          v-html="productItem?.reviews_markup"></div>
      </div>
      <a :href="`/products/${productItem.handle}`" class="to_pdp_trigger_description_title"
        @click="pushItemToDataLayer">
        <div class="productGridItem__header">
          <div class="productGridItem__titleWrapper">
            <p class="productGridItem__ProductTitle" v-html="productItem.title"></p>
            <p class="productGridItem__servingText" v-if="productItem.serving">
              {{ productItem.serving }}
            </p>
          </div>

          <p class="productGridItem__productPrice" v-if="discountScriptActivated">
            <span class="discounted">{{ currencySymbol }}{{ (discountedPrice / 100).toFixed(2) }}</span>
            <s class="original">{{ currencySymbol }}{{ variantFinalPrice.value }}.{{
              variantFinalPrice.sup == "0" || variantFinalPrice.sup == "00"
                ? "00"
                : variantFinalPrice.sup
            }}</s>
          </p>
          <p class="productGridItem__productPrice" v-else>
            <span :class="{ discounted: productItem.compare_at_price }">
              {{ currencySymbol }}{{ variantFinalPrice.value }}.{{
                variantFinalPrice.sup == "0" || variantFinalPrice.sup == "00"
                  ? "00"
                  : variantFinalPrice.sup
              }}
            </span>
            <s class="original" v-if="productItem.compare_at_price">{{ currencySymbol }}{{
              (productItem.compare_at_price /
                100).toFixed(2)
            }}</s>
          </p>
        </div>
        <p class="productGridItem__shortDescription" v-if="productItem.product_description"
          v-html="productItem.product_description"></p>
      </a>
    </div>
    <div class="productGridItem__action">
      <div class="productVariantDropdown" :class="{ open: isDropdownOpen }" v-if="!productItem?.tags?.includes('bundle') &&
        productItem?.variants?.length && !productItem?.tags?.includes('force-oos')
      ">
        <button type="button" title="Product variant selector" class="productVariantDropdown__trigger"
          @click="openDropdown" v-click-outside="closeDropdown" :disabled="productItem.variants.length === 1"
          :aria-expanded="isDropdownOpen ? 'true' : 'false'" :data-sl="'variant_selector_dropdown_' + productItem.id">
          <span
            v-html="selectedVariantTitle === 'size' && product?.variants?.length > 1 ? 'Select a size' : selectedVariantTitle"></span>
          <svg class="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 6">
            <path d="M9.126 1.126 5.222 5.03a.305.305 0 0 1-.444 0L.874 1.126" stroke="#000" stroke-width="1.5"
              fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <ul class="productVariantDropdown__items" v-show="isDropdownOpen">
          <li class="productVariantDropdown__item" v-for="variant in productItem.variants" :key="variant.id" :class="{
            'productVariantDropdown__item--selected':
              selectedVariantId === variant.id && selectedVariantTitle !== 'size',
            'productVariantDropdown__item--soldOut': !variant.available,
          }" role="button" :title="variant.title" :data-variant-id="variant.id" @click="setVariant(variant)">
            <span v-html="variant.title"></span>
            <sup v-if="!variant.available">Sold Out</sup>
          </li>
        </ul>
      </div>
      <div class="productGridItem__subscriptionText" v-if="showSubscriptionWidget">
        <label>
          <input type="checkbox" name="Select subscription" title="Select subscription" autocomplete="off"
            v-model="addSubscription">
          <span class="copy para-body-2">Upgrade to subscription <span v-if="!discountScriptActivated">and <u>save {{
            firstSellingPlans?.price_adjustments[0]?.value
                }}%</u></span></span>
        </label>
      </div>
      <a class="button button-primary productGridItem__addToCartBtn" v-if="productItem?.tags?.includes('bundle')"
        :href="`/products/${productItem.handle}`">
        Select Bundle Options
      </a>
      <button v-else type="button" class="button button-primary productGridItem__addToCartBtn"
        @click.prevent="addToCart(product)" title="Add to cart" data-sl="add_to_cart"
        :disabled="isAddingProduct || !isSelectedVariantAvailable || selectedVariantTitle === 'size' || product?.tags?.includes('force-oos')">
        {{
          isAddingProduct
            ? "ADDING..."
            : productItem?.tags?.includes('bfcm2023') && !isSelectedVariantAvailable
              ? 'Coming November 24th'
              : product?.tags?.includes('force-oos')
                ? 'Sold Out'
                : isSelectedVariantAvailable
                  ? "ADD TO CART"
                  : "Sold Out"
        }}
      </button>
    </div>
  </div>
</template>

<script>
import Swiper, { A11y, Navigation } from 'swiper';
import cartMethods from '../../../utils/helpers/cart-helper';
import { getTagDiscount } from '../../../utils/discount';
import BaseImage from '../../base/image.vue';
import { EVENTS } from '../../../../new/vue/cart/constants'

const { post } = cartMethods;

export default {
  name: 'GridItem',
  props: {
    product: {
      default: {},
      type: Object,
      required: true,
    },
    loopIndex: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  data() {
    return {
      isDropdownOpen: false,
      selectedVariantId: null,
      selectedVariantTitle: null,
      isAddingProduct: false,
      addSubscription: false,
      currencySymbol: window.BPN?.cart?.currencySymbol || '$',
    };
  },
  components: {
    BaseImage,
  },
  mounted() {
    if (this.product && this.productItem.variants.length) {
      this.selectedVariantId = this.productItem.variants[0].id;
      if (this.productHasSizeOption && this.productItem?.variants?.length > 1) {
        this.selectedVariantTitle = 'size';
      } else {
        this.selectedVariantTitle = this.productItem.variants[0].title;
      }
    }

    //Initialize swiper
    new Swiper(this.$refs.swiper, {
      // configure Swiper to use modules
      modules: [Navigation, A11y],
      // Optional parameters
      loop: true,
      observer: true,
      // Navigation arrows
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  },
  computed: {
    tagDiscount() {
      return getTagDiscount(this.product.tags);
    },
    discountScriptActivated() {
      return getTagDiscount(this.product.tags) !== undefined;
    },
    productItem() {
      const { product } = this;
      if (product && product.variants.length > 0) {
        product.variants.sort((a, b) => b?.available - a?.available);
      }
      return product;
    },
    showSubscriptionWidget() {
      const { available, selling_plan_groups, recharge_widget_status } = this.product;
      return !!(available && recharge_widget_status && selling_plan_groups.length);
    },
    firstSellingPlans() {
      const { selling_plan_groups } = this.product;
      return selling_plan_groups[0]?.selling_plans[0] || {};
    },
    discountedPrice() {
      const { selectedVariant, tagDiscount } = this;
      const { price } = selectedVariant || {};

      if (tagDiscount) {
        return price - price * tagDiscount / 100;
      }

      return price;
    },
    productImages() {
      const images = this.product?.media.filter(
        (media) =>
          media?.media_type === 'image' && !media?.alt?.includes('@hide-plp'),
      );
      return images.length ? images : [];
    },
    selectedVariant() {
      const findVariant = this.product?.variants.find(
        (variant) => variant?.id === this.selectedVariantId,
      );
      return findVariant ? findVariant : {};
    },
    isSelectedVariantAvailable() {
      const { selectedVariant } = this;

      return !!(selectedVariant && selectedVariant.available);
    },
    variantFinalPrice() {
      const { selectedVariant } = this;
      const fixedPrice = { value: 0, sup: 0 };
      if (selectedVariant && selectedVariant.price) {
        const priceSplit = (selectedVariant.price / 100).toFixed(2).split('.');
        fixedPrice.value = priceSplit[0];
        fixedPrice.sup = priceSplit[1] > 0 ? priceSplit[1] : 0;
      }
      return fixedPrice;
    },
    productHasSizeOption() {
      const { options } = this.product || {};
      return options.some(option => option.toLowerCase() === 'size');
    },
  },
  methods: {
    openDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    closeDropdown() {
      this.isDropdownOpen = false;
    },
    setVariant(variant) {
      if (variant) {
        this.selectedVariantId = variant.id ? variant.id : null;
        this.selectedVariantTitle = variant.title ? variant.title : null;
      }
    },
    addToCart() {
      const { selectedVariantId, firstSellingPlans, addSubscription } = this;
      const quantity = 1;
      const id = selectedVariantId;
      if (id && quantity) {
        this.isAddingProduct = true;
        post('add', {
          id,
          quantity,
          selling_plan: addSubscription ? firstSellingPlans?.id : null,
        })
          .then((data) => {
            this.isAddingProduct = false;
            document.dispatchEvent(new CustomEvent(EVENTS.ITEM_ADDED, {
              detail: { id },
            }));
          })
          .catch((err) => {
            this.isAddingProduct = false;
          });
      }
    },
    pushItemToDataLayer() {
    },
  },
};
</script>
