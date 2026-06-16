<template>
  <div class="productSection">
    <div class="productSection__details--mob">
      <Breadcrumb :BreadcrumbMarkup="breadCrumb" additionalClass="PDP__breadcrumb--mobile"/>
      <div class="PDP__reviews PDP__reviews--mobile" @click="scrollToReviews">
        <div data-oke-star-rating
             :data-oke-reviews-product-id="'shopify-' + activeProductObject.id"
             v-html="activeProductObject?.reviews_markup"
        ></div>
      </div>
      <h1 class="productTitle"
          v-html="activeProductObject.title ? activeProductObject.title : activeProductObject.shopify_title"
      >
      </h1>
      <ProductPrice :variant="currentVariant"
                    :purchaseType="getPurchaseType"
                    :subscriptionDiscountedAmount="getSubscriptionDiscountedAmount"
                    :product="activeProductObject"
      />
    </div>
    <div class="PDP__container">
      <div class="productSection__wrapper">
        <div class="productSection__left js-pdp-buy-box-left">
          <Breadcrumb :BreadcrumbMarkup="breadCrumb" additionalClass="PDP__breadcrumb--desktop"/>
          <ProductSlider :media="productMedia" :badgeData="activeProductObject.product_badge_data &&
                           activeProductObject.product_badge_data.has_badge
                           ? activeProductObject.product_badge_data
                           : {}
                         "
          />
        </div>
        <div class="productSection__right js-pdp-buy-box-right">
          <div class="productSection__data">
            <div class="productSection__details--desktop">
              <div class="PDP__reviews PDP__reviews--desktop" @click="scrollToReviews">
                <div data-oke-star-rating
                     :data-oke-reviews-product-id="'shopify-' + activeProductObject.id
                     "
                     v-html="activeProductObject?.reviews_markup"
                ></div>
              </div>
              <h1 class="productTitle"
                  v-html="activeProductObject.title ? activeProductObject.title : activeProductObject.shopify_title"
              >
              </h1>
              <ProductPrice :variant="currentVariant"
                            :purchaseType="getPurchaseType"
                            :subscriptionDiscountedAmount="getSubscriptionDiscountedAmount"
                            :product="activeProductObject"
              />
            </div>
            <p class="productServingText" v-if="activeProductObject.serving_text">
              {{ activeProductObject.shopify_title }}
              ({{ activeProductObject.serving_text }})
            </p>
            <p class="productShortDescription" v-if="activeProductObject.excerpt">
              {{ activeProductObject.excerpt }}
            </p>
            <ProductForm
              v-if="activeProductObject.id !== undefined"
              :activeProductObject="activeProductObject"
              :currentVariant="currentVariant"
              :originalProductObject="getOriginalProductObject"
              :getPurchaseType="getPurchaseType"
            />
            <p class="pdpBelowCta"
               v-if="!hasDiscountTag &&
                 activeProductObject.copy_below_cta
               "
            >
              {{ activeProductObject.copy_below_cta }}
            </p>
          </div>
          <PrimaryBenefitsComponent v-if="primaryBenefits.length" :data="primaryBenefits"/>
          <div class="PDP__details"
               :class="{
                 'PDP__details--sizeGuide':
                   !primaryBenefits.length &&
                   activeProductObject?.show_size_guide_tab,
               }"
          >
            <BuyBoxAccordion :product="activeProductObject" :activeVariantId="currentVariant.id"/>
          </div>
        </div>
      </div>
      <div data-rebuy-id="125545"
           :data-rebuy-shopify-product-ids="activeProductObject.id"
           style="
          max-width: 1400px;
          margin: 20px auto 0;
          min-height: 630px;
          padding-bottom: 0;
        "
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import Breadcrumb from './components/Breadcrumb.vue';
import ProductPrice from './components/ProductPrice.vue';
import ProductSlider from './components/ProductSlider.vue';
import ProductForm from './components/ProductForm.vue';
import PrimaryBenefitsComponent from './components/PrimaryBenefits.vue';
import BuyBoxAccordion from './components/BuyBoxAccordion.vue';
import { THEME_BREAKPOINTS } from '../../../utils/constants';
import { getTagDiscount } from '../../../utils/discount';

const store = useStore();

const getOriginalProductObject = computed(() => store.getters['product/getOriginalProductObject']);
const currentVariant = computed(() => store.getters['product/getSelectedVariant']);
const activeProductObject = computed(() => store.getters['product/getActiveProduct']);
const getPurchaseType = computed(() => store.getters['product/getPurchaseType']);
const getSubscriptionDiscountedAmount = computed(() => store.getters['product/getSubscriptionDiscountedAmount']);

onMounted(() => {
  const pdpLeftSection = document.querySelector(".js-pdp-buy-box-left");
  const pdpRightSection = document.querySelector(".js-pdp-buy-box-right");
  if (
    window.innerWidth > THEME_BREAKPOINTS.mobileLarge &&
    pdpLeftSection &&
    pdpRightSection
  ) {
    if (pdpRightSection.clientHeight > pdpLeftSection.clientHeight) {
      pdpLeftSection.classList.add("sticky");
    }
  }
});

const hasDiscountTag = computed(() => getTagDiscount(activeProductObject.value?.tags) !== undefined);
const breadCrumb = computed(() => activeProductObject.value?.breadcrumb || '');

const productMedia = computed(() => {
  const { title } = currentVariant.value || {};
  const { media = [], shopify_title: shopifyTitle } = activeProductObject.value || {};

  const nonHiddenMedias = media?.filter(
    (item) =>
      (item?.alt && !item?.alt.includes('@exclude')) || item?.alt === null
  );

  const allAltTextImages = nonHiddenMedias.map((media) => ({
    ...media,
    alt: media.alt === null ? shopifyTitle : media.alt
  }));

  const variantSpecificMedia = allAltTextImages.filter(
    (media) =>
      media?.alt &&
      (media?.alt.toLowerCase().includes(title.toLowerCase()) ||
        media?.alt.toLowerCase().includes(shopifyTitle.toLowerCase()) ||
        media?.alt === '@hide-plp' ||
        media?.alt === '@common')
  );

  return variantSpecificMedia.length ? variantSpecificMedia : media;
});

const primaryBenefits = computed(() => {
  const { primary_benefits: benefits = [] } = activeProductObject.value;

  return benefits
});

const scrollToReviews = () => {
  const pdpReviewsSection = document.getElementById('js-pdp-reviews');
  if (!pdpReviewsSection) return;
  const y = pdpReviewsSection.getBoundingClientRect().top - 127;
  setTimeout(() => {
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, 10);
};
</script>

