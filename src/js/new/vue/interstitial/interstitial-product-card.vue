<template>
  <div class="interstitial__product">
    <div class="interstitial__product-category">
      <img :src="recommendation?.category?.icon" height="24" width="24" alt="Product Icon"
        class="interstitial__product-category-icon" />
      <div class="interstitial__product-category-name">{{ recommendation.category?.name }}</div>
      <div class="interstitial__product-category-subtitle">{{ recommendation.category?.subtitle }}</div>
    </div>
    <div class="interstitial__product-info">
      <div class="interstitial__product-toggle">
        <img :src="recommendation.image" alt="Product Image" class="interstitial__product-image" />
        <input v-model="recommendation.isSelected" :disabled="recommendation.isCurrentProduct"
          :checked="recommendation.isCurrentProduct" type="checkbox" :name="recommendation.title">
      </div>
      <div class="w-full">
        <div class="interstitial__product-title-and-price">
          <h3 class="interstitial__product-title-and-price-title">{{ recommendation.title }}</h3>
          <div v-if="!recommendation.isCurrentProduct" class="interstitial__product-title-and-price-price">
            <div class="discounted-price" v-if="ctaOptions !== 'OTP Only'">
              {{ currencySymbol }}{{ recommendation.selectedVariant.sellingPlans[0]?.adjustedPrice }}
            </div>
            <div class="original-price" :class="{ 'line-through': ctaOptions !== 'OTP Only' }">
              <span>
                {{ currencySymbol }}
              </span>{{ recommendation.selectedVariant.price }}
            </div>
          </div>
        </div>
        <div v-if="recommendation.shortDescription" class="interstitial__product-description">
          {{ recommendation.shortDescription }}
        </div>
        <div class="interstitial__product-servings-and-flavours"
          v-if="recommendation.selectedVariant.servings || (recommendation.flavors?.length && !recommendation.isCurrentProduct)">
          <div v-if="recommendation.selectedVariant.servings" class="interstitial__product-servings">
            Servings: {{ recommendation.selectedVariant.servings }}
          </div>
          <div v-if="recommendation.selectedVariant.servings && recommendation.flavors?.length > 1">
            •
          </div>
          <div v-if="recommendation.flavors?.length > 1 && !recommendation.isCurrentProduct"
            class="interstitial__product-flavours">
            {{ recommendation.flavors.length }} Flavors
          </div>
        </div>
        <VariantSelector v-if="recommendation.variants.length > 1 && !recommendation.isCurrentProduct"
          :variants="recommendation.variants" :options="recommendation.options"
          :variationsMeta="recommendation.variants" v-model="recommendation.selectedVariantId"
          @update:modelValue="onVariantChange" />

        <div class="interstitial__product-variant"
          v-if="recommendation.variants.length > 1 && recommendation.isCurrentProduct">
          <span v-html="recommendation.selectedVariant.variationIcon"></span>
          {{ recommendation.selectedVariant.title }}
        </div>

        <div v-if="recommendation.isCurrentProduct" class="interstitial__product-added-to-cart">
          <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="15"
            height="12">
            <g clip-path="url(#clip0_1165_627)">
              <path d="M1.875 6.75L4.5 9.375L10.5 3.375" stroke="#fff" stroke-width="1.5" stroke-linejoin="round">
              </path>
            </g>
            <defs>
              <clipPath id="clip0_1165_627">
                <rect width="12" height="12" fill="white"></rect>
              </clipPath>
            </defs>
          </svg> added to cart
        </div>
        <div
          v-if="recommendation.isCurrentProduct && !productInCart.selling_plan_allocation && ctaOptions !== 'OTP Only'"
          class="interstitial__product-conversion-note">
          This item will be converted to subscription.
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import VariantSelector from '../../components/product-drawer/vue/variant-selector.vue';

const onVariantChange = (variantId) => {
  const newVariant = props.recommendation.variants.find(v => v.id === variantId);
  if (newVariant) {
    props.recommendation.selectedVariant = newVariant
  }
};

// Define props
const props = defineProps({
  recommendation: {
    type: Object,
    required: true
  },
  currencySymbol: {
    type: String,
    default: '$'
  },
  productInCart: {
    type: Object,
    default: null
  },
  ctaOptions: {
    type: String,
    default: null
  }
})
</script>
