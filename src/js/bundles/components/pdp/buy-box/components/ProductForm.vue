<template>
  <div :data-productid="activeProductObject?.id">
    <div v-if="activeProductObject?.tags?.includes('bundle')" style="min-height:380px" ref="bundleWidget">
      <div data-rebuy-id="91182" :data-rebuy-shopify-product-ids="activeProductObject.id"></div><!-- hybrid bundle -->
      <div data-rebuy-id="116385" :data-rebuy-shopify-product-ids="activeProductObject.id"></div>
      <!-- health and wellness bundle -->
      <div data-rebuy-id="116833" :data-rebuy-shopify-product-ids="activeProductObject.id"></div>
      <!-- strength bundle -->
      <div data-rebuy-id="117112" :data-rebuy-shopify-product-ids="activeProductObject.id"></div>
      <!-- endurance bundle -->
      <div v-if="activeProductObject?.tags?.includes('test')">
        <div data-rebuy-id="120772" :data-rebuy-shopify-product-ids="activeProductObject.id"></div><!-- test bundle -->
      </div>
    </div>

    <div class="productOptions">
      <!-- product qty select -->
      <div class="product-box hide">
        <div class="form-group select-dropdown">
          <select class="product-box-selectbox" name="quantity" v-model="quantity">
            <option value="1">1</option>
          </select>
        </div>
      </div>
      <div class="productOptionSelectors" v-if="!isDefaultVariant">
        <!-- Options -->
        <template v-if="!isCombinedProduct && !activeProductObject?.tags?.includes('force-oos')">
          <div v-for="option in activeProductObject?.options_with_values" :key="option.name" class="productOptionGroup">
            <p class="chooseVariant__label">{{ option.name }}:</p>
            <div class="variantDropdown" v-if="option.name.toLowerCase() !== 'servings'">
              <button type="button" title="Product Variant selector button" class="variantDropdown__trigger"
                data-sl="variant_dropdown_trigger" :disabled="option.values.length === 1"
                @click.stop.prevent="openOptionDropdown($event)">
                <span class="text">{{
                  productHasSizeOption && !hasUserSelectedSize && option.values.length > 1 ? `Select a
                  size` :
                    getActiveOption(option.values)
                }}</span>
                <svg class="arrow" viewbox="0 0 10 6" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.126 1.126 5.222 5.03a.305.305 0 0 1-.444 0L.874 1.126" fill-rule="evenodd" fill="none"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="#000"></path>
                </svg>
              </button>
              <ul class="variantDropdown__items">
                <li role="button" tabindex="0" :title="optionValue" class="variantDropdown__item"
                  :class="[productHasSizeOption && !hasUserSelectedSize ? '' : currentVariant.options.includes(optionValue) ? 'variantDropdown__item--selected' : '']"
                  v-for="optionValue in option.values" :key="optionValue" @click.self="
                    updateVariant(
                      $event,
                      'dropdown',
                      option.name,
                      option.position,
                      optionValue
                    )
                    ">
                  {{ optionValue }}
                  <sup v-if="!currentVariant.available &&
                    currentVariant.options.includes(optionValue)
                  ">Sold out</sup>
                </li>
              </ul>
            </div>
            <div v-else class="radioGroup">
              <label class="radioGroup__item" v-for="(optionValue, index) in option.values" :key="optionValue"
                :for="option.name + index" :class="{
                  'radioGroup__item--selected':
                    currentVariant.options.includes(optionValue),
                  'radioGroup__item--disabled':
                    !currentVariant.available &&
                    currentVariant.options.includes(optionValue),
                }">
                <input type="radio" name="servings" :id="option.name + index" style="display: none" @change="
                  updateVariant(
                    $event,
                    'serving',
                    option.name,
                    option.position,
                    optionValue
                  )
                  " />
                <span class="radioGroup__itemText">{{ optionValue }}</span>
              </label>
            </div>
          </div>
        </template>
        <!-- Serving Type -->
        <div class="servingType" v-if="originalProductObject.additional_pdp_data && !isCombinedProduct">
          <p class="chooseVariant__label">Serving Type:</p>

          <div id="app">
            <div v-if="originalProductObject.tags.includes('contains-varient')"
              class="radioGroup radioGroup_servingType">
              <a class="radioGroup__item radioGroup__item--selected" style>{{
                originalProductObject?.additional_pdp_data?.original_pdp_label
              }}</a>
              <a class="radioGroup__item" v-bind:href="'https://www.bareperformancenutrition.com/products/' +
                originalProductObject?.additional_pdp_data?.additional_pdp[0]
                  ?.product_handle
                ">{{
                  originalProductObject?.additional_pdp_data?.additional_pdp[0]
                    ?.label
                }}</a>
            </div>
          </div>
        </div>
        <!-- Combo Products -->
        <div class="comboProducts" v-if="isCombinedProduct">
          <p class="chooseVariant__label">Products:</p>
          <div class="radioGroup">
            <label for="combo_products" class="radioGroup__item" :class="{
              'radioGroup__item--selected':
                activeComboProductVariant ===
                originalProductObject?.combo_product_data?.original_variants,
              'radioGroup__item--disabled': fetchingProduct,
            }"><input type="radio" name="combo_products" id="combo_products" style="display: none" :value="originalProductObject?.combo_product_data?.original_variants
              " v-model="activeComboProductVariant" @change="
                changeCombinedProduct(
                  'original',
                  originalProductObject.handle
                )
                " />
              <span class="radioGroup__itemText">{{
                originalProductObject?.combo_product_data?.original_pdp_label
              }}</span></label>
            <label :for="'combo_products' + product.product_handle" class="radioGroup__item" :class="{
              'radioGroup__item--selected':
                activeComboProductVariant === product.variant_id,
              'radioGroup__item--disabled': fetchingProduct,
            }" v-for="product in originalProductObject?.combo_product_data
              ?.combo_products" :key="product.label"><input type="radio" name="combo_products"
                :id="'combo_products' + product.product_handle" style="display: none" :value="product.variant_id"
                v-model="activeComboProductVariant" @change="
                  changeCombinedProduct('additional', product.product_handle)
                  " />
              <span class="radioGroup__itemText">
                {{ product.label }}
              </span></label>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeProductObject.id === '7695188721836'">
      <p class="pdpBelowCta" style="margin-bottom: 15px">
        <strong><span style="color: #eb1000">FREE</span> US Shipping on orders with 3 or more boxes.</strong>
      </p>
    </div>
    <!-- Recharge Code -->
    <SubscriptionToggle v-if="showSubscriptionWidget && !isCombinedProduct"
      :widgetConfig="getSubscriptionWidgetConfiguration" :activeVariant="currentVariant" :product="activeProductObject"
      @purchaseType="setPurchaseType" />

    <!-- Order By -->
    <OrderBy />

    <!-- ATC CTA -->
    <div class="add-to-cart-btn">
      <p style="text-align: center; margin-bottom: 17px; font-size: 0.8rem" v-if="hasDiscountTag &&
        getPurchaseType === 'autodeliver'
      ">
        Save {{ tagDiscount }}% on the first order, 10% on recurring orders.
      </p>
      <button type="button" disabled class="button button-primary" v-if="!activeProductObject?.tags?.includes('bundle') &&
        !activeProductObject?.tags?.includes('show_cta') &&
        activeProductObject?.tags?.includes('not_for_sale')
      ">
        Not For Sale
      </button>
      <button v-if="shouldShowCTA" type="button" name="add"
        :aria-disabled="activeProductObject?.tags?.includes('force-oos') ? true : (isCombinedProduct && activeComboType === 'combo' ? !isComboProductsAvailable ? true : false : (productHasSizeOption && !hasUserSelectedSize && activeProductObject?.variants?.length > 1 ? true : currentVariant.available ? false : true))"
        :disabled="activeProductObject?.tags?.includes('force-oos') ? true : (isCombinedProduct && activeComboType === 'combo' ? !isComboProductsAvailable ? true : false : (productHasSizeOption && !hasUserSelectedSize && activeProductObject?.variants?.length > 1 ? true : currentVariant.available ? false : true))"
        :aria-label="isCombinedProduct && activeComboType === 'combo'
          ? !isComboProductsAvailable
            ? 'Sold out'
            : 'Add to cart'
          : currentVariant.available
            ? 'Add to cart'
            : 'Sold out'
          " class="button button-primary" v-html="addToCartCTAText" @click.prevent="addToCart"></button>
      <div ref="mainCTA"></div>
    </div>

    <a class="btn" href="#" id="BIS_trigger" v-if="shouldShowOOS">Notify me via email</a>

    <a class="button button-primary" target="_blank" :href="externalLink" v-if="shouldShowExternalLink"
      style="margin-bottom: 12px; width: 100%; display: inline-block">Available on Amazon</a>

    <div class="g1mClub" v-if="activeProductObject?.tags?.includes('Limited Edition') && !currentVariant.available || activeProductObject?.tags?.includes('g1mclub') && !currentVariant.available
    ">
      <p class="g1mClub__text para-body-2">
        This <em>limited edition</em> product is no longer available.<br /><br />
        Join the BPN SMS list so you don't miss future exclusives!
      </p>
      <a class="button button-primary g1mClub__cta" href="https://bareperformance.pscrpt.io/6E6jvq" target="_blank"
        aria-label="Join the g1m club">Get Notified</a>
    </div>
    <transition name="fade">
      <div class="floatingCTAFloat" v-show="showFloatingCTA && !isCombinedProduct">
        <div class="floatingCTA">
          <div class="floatingCTA__product-details">
            <div class="floatingCTA__product-title"
              v-html="activeProductObject.title ? activeProductObject.title : activeProductObject.shopify_title"></div>
            <div class="floatingCTA__product-reviews" id="floating_reviews">
              <div data-oke-star-rating data-oke-scroll-disabled="true"
                :data-oke-reviews-product-id="'shopify-' + activeProductObject.id"
                v-html="activeProductObject?.reviews_markup"></div>
            </div>
          </div>
          <div class="floatingCTA__action">
            <select class="floatingCTA__variant-selector" v-model="selectedVariantFloating"
              v-if="activeProductObject?.variants.length > 1">
              <option value="select-a-size"
                v-if="activeProductObject?.variants.length > 1 && productHasSizeOption && selectedVariantFloating === 'select-a-size'">
                Select
                a size
              </option>
              <option :value="variant.id" v-for="variant in activeProductObject?.variants" :key="variant.id">
                {{ variant.title }}
              </option>
            </select>
            <a class="button button-primary floatingCTA__button" target="_blank" :href="externalLink"
              v-if="shouldShowExternalLink" style="width: 100%; display: inline-block">Available on Amazon</a>

            <a class="btn floatingCTA__button" href="#" id="BIS_trigger" v-if="shouldShowOOS" style="margin-bottom: 0">
              Notify me via email
            </a>

            <button v-if="currentAvailability === 'default'" class="button button-primary floatingCTA__button"
              @click="floatingAddToCart" :disabled="isAddingProduct || !isFloatingVariantAvailable">
              {{
                !isFloatingVariantAvailable && selectedVariantFloating !== 'select-a-size'
                  ? "SOLD OUT"
                  : activeProductObject?.tags?.includes('bundle')
                    ? 'CHOOSE FLAVOR'
                    : isAddingProduct
                      ? "ADDING..."
                      : "ADD TO CART"
              }}
            </button>
          </div>
        </div>
      </div>
    </transition>
    <div v-if="initFloatingReviews"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { addUpdateQueryParam, updateLocationPathName } from '../../../../utils/helpers/utility'
import SubscriptionToggle from './SubscriptionToggle.vue'
import OrderBy from './OrderBy.vue'
import axios from 'axios'
import { getTagDiscount } from '../../../../utils/discount'
import cartMethods from '../../../../utils/helpers/cart-helper'

const { post } = cartMethods

const AVAILABILITY = {
  default: 'default',
  external: 'external',
  oos: 'oos',
}

const {
  activeProductObject,
  originalProductObject,
  currentVariant,
  getPurchaseType,
} = defineProps({
  activeProductObject: {
    type: Object,
    default: () => ({})
  },
  currentVariant: {
    type: Object,
    default: () => ({})
  },
  originalProductObject: {
    type: Object,
    default: () => ({})
  },
  getPurchaseType: {
    type: String,
    default: undefined
  },
})

const store = useStore()
const quantity = ref(1)
const option1 = ref(null)
const option2 = ref(null)
const option3 = ref(null)
const activeServingTypeProduct = ref(null)
const fetchingProduct = ref(false)
const activeComboProductVariant = ref(null)
const activeComboType = ref(null)
const isAddingProduct = ref(false)
const showFloatingCTA = ref(false)
const selectedVariantFloating = ref(null)
const hasUserSelectedSize = ref(false)
const bundleWidget = ref(null)
const mainCTA = ref(null)

const getSubscriptionWidgetConfiguration = computed(() => store.getters['product/getSubscriptionWidgetConfiguration'])
const getSelectedSellingPlan = computed(() => store.getters['product/getSelectedSellingPlan'])
const additionalProducts = computed(() => store.getters['product/getAdditionalProducts'])

const initFloatingReviews = computed(() => {
  if (showFloatingCTA && window.innerWidth > 1366) {
    const floatingWidgetElement = document.getElementById('floating_reviews');
    if (!floatingWidgetElement) return
    setTimeout(() => {
      window.okeWidgetApi && window.okeWidgetApi.initWidget(floatingWidgetElement);
    }, 10);
  }
  return 0;
})

const hasDiscountTag = computed(() => getTagDiscount(activeProductObject?.tags) !== undefined)
const tagDiscount = computed(() => getTagDiscount(activeProductObject?.tags))
const productHasSizeOption = computed(() => {
  const { options } = activeProductObject || {}
  return options?.some(option => option.toLowerCase() === 'size')
})
const showSubscriptionWidget = computed(() => {
  const { available, selling_plan_groups } = activeProductObject
  const { published } = getSubscriptionWidgetConfiguration.value
  return available && published && selling_plan_groups.length
})
const isDefaultVariant = computed(() => currentVariant?.title?.includes("Default Title"))
const externalLink = computed(() => {
  const { external_link } = currentVariant
  return 'url' in external_link ? external_link.url : ''
})
const currentAvailability = computed(() => {
  const { availability = AVAILABILITY.default } = currentVariant
  return availability
})
const shouldShowCTA = computed(() => {
  const { availability = AVAILABILITY.default } = currentVariant
  if (availability === AVAILABILITY.external || availability === AVAILABILITY.oos) return false
  return !activeProductObject?.tags?.includes('bundle') && !activeProductObject?.tags?.includes('not_for_sale')
})
const shouldShowExternalLink = computed(() => currentAvailability.value === AVAILABILITY.external)
const shouldShowOOS = computed(() => {
  const { availability = AVAILABILITY.default } = currentVariant
  if (availability === AVAILABILITY.external) return false
  if (availability === AVAILABILITY.oos) return true
  return !isCombinedProduct.value &&
    !activeProductObject?.tags?.includes('g1mclub') &&
    !activeProductObject?.tags?.includes('bis-hidden') &&
    !isCurrentVariantAvailable.value
})
const isCombinedProduct = computed(() => !!originalProductObject?.combo_product_data)
const isComboProductsAvailable = computed(() => {
  if (!isCombinedProduct.value) return false
  if (activeComboType.value !== "combo") return false

  let available = true
  const passedVariants = activeComboProductVariant.value
    .split(",")
    .reduce((acc, x) => acc.concat(+x), [])

  for (const key in additionalProducts.value) {
    if (Object.hasOwnProperty.call(additionalProducts.value, key)) {
      const pdpObj = additionalProducts.value[key]
      const { variants } = pdpObj || {}
      variants.forEach((variant) => {
        if (passedVariants.includes(variant.id) && !variant.available) available = false
      })
    }
    if (!available) break
  }
  return available
})
const addToCartCTAText = computed(() => {
  const { available, price } = currentVariant
  const { tags } = activeProductObject || {}
  const bfcm2023 = tags?.includes("bfcm2023")

  if (isAddingProduct.value) return "ADDING..."
  if (isCombinedProduct.value && activeComboType.value === "combo") {
    return !isComboProductsAvailable.value ? "Sold Out" : "Add to cart"
  }

  if (tags?.includes('force-oos')) return "Sold out"
  if (!available && bfcm2023) return "Coming November 24th"
  if (!available) return "Sold Out"
  if (getPurchaseType === "autodeliver") return "Add Subscription to Cart"
  return "Add to cart"
})
const isCurrentVariantAvailable = computed(() => {
  const { available } = currentVariant || {}
  const bisSideElem = document.querySelector(".bis-reset")
  if (available) {
    bisSideElem && (bisSideElem.style.display = "none")
  } else {
    bisSideElem && (bisSideElem.style.display = "block")
  }
  return available
})
const isFloatingVariantAvailable = computed(() => {
  const selectedVariantFloatingNumber = selectedVariantFloating.value && parseInt(selectedVariantFloating.value)
  const findVariant = activeProductObject?.variants.find(
    (variant) => variant.id === selectedVariantFloatingNumber
  )
  return findVariant && findVariant.available
})

const openOptionDropdown = (e) => {
  e.stopPropagation()
  const triggerBtn = e.target
  const dropdownWrapperElem = triggerBtn.closest(".variantDropdown")
  triggerBtn && dropdownWrapperElem.classList.toggle("open")
}

const updateVariant = (e, optionRenderType, optionName = "", optionPosition, optionValue) => {
  if (productHasSizeOption.value && optionName.toLowerCase() === 'size' && !hasUserSelectedSize.value) {
    hasUserSelectedSize.value = true
  }

  const { variants } = activeProductObject || {}
  if (optionRenderType === "dropdown") {
    const dropdownWrapperElem = e.target.closest(".variantDropdown")
    dropdownWrapperElem && dropdownWrapperElem.classList.remove("open")
  }

  switch (optionPosition) {
    case 1:
      option1.value = optionValue;
      break
    case 2:
      option2.value = optionValue;
      break
    case 3:
      option3.value = optionValue;
      break
  }

  const filterVariant = variants.find(
    (variant) =>
      variant?.option1 === option1.value &&
      variant?.option2 === option2.value &&
      variant?.option3 === option3.value
  )

  store.dispatch('product/mutateSelectedVariant', filterVariant)
  addUpdateQueryParam("variant", filterVariant.id)
}

const getActiveOption = (optionValues) => {
  const { options } = currentVariant || {}
  const commonOption = optionValues.filter((item) => options.includes(item))
  return commonOption.length === 1 ? commonOption.toString() : optionValues[0].toString()
}

const addToCart = async () => {
  if (getPurchaseType === "autodeliver") {
    let now = new Date()
    now.setTime(now.getTime() + (30 * 60 * 1000))
    document.cookie = "BPN_hasSubscription=true;path=/;expires=" + now.toUTCString() + ";"
  }

  if (isCombinedProduct.value && activeComboType.value === "combo") {
    const passedVariants = activeComboProductVariant.value
      .split(",")
      .reduce((acc, x) => acc.concat(+x), [])

    const items = passedVariants.map(variantId => ({
      id: variantId,
      quantity: 1,
    }))

    try {
      isAddingProduct.value = true
      await post("add", { items })
      window.openCartDrawer()
    } catch (err) {
      console.log(err)
    } finally {
      isAddingProduct.value = false
    }
  } else {
    const { id } = currentVariant || {}
    const sellingPlan = getPurchaseType === "onetime" ? null : getSelectedSellingPlan.value

    if (id && quantity.value) {
      try {
        isAddingProduct.value = true
        await post("add", {
          quantity: 1,
          id,
          selling_plan: sellingPlan,
        })
        window.openCartDrawer()
      } catch (err) {
        console.log(err)
      } finally {
        isAddingProduct.value = false
      }
    }
  }
}

const setPurchaseType = (payload) => {
  const { purchaseType, selectedSellingPlan, discountedAmount } = payload
  store.dispatch('product/mutatePurchaseType', purchaseType)
  store.dispatch('product/mutateSelectedSellingPlan', selectedSellingPlan)
  store.dispatch('product/mutateSubscriptionDiscountedAmount', discountedAmount)
}

const changeCombinedProduct = async (type, productHandle) => {
  if (type === "original") {
    activeComboType.value = "combo"
    const { variants, selected_or_first_available_variant } = originalProductObject
    const variant = variants?.find(
      (variant) => variant.id === selected_or_first_available_variant.id
    ) || {}

    store.dispatch('product/mutateActiveProduct', originalProductObject)
    store.dispatch('product/mutateSelectedVariant', variant)
  } else {
    activeComboType.value = "single"
    const variantIdInteger = parseInt(activeComboProductVariant.value)
    const additionalProductObj = additionalProducts.value[productHandle]
    const { variants } = additionalProductObj
    const filteredVariant = variants?.find((variant) => variant.id === variantIdInteger) || {}

    store.dispatch('product/mutateActiveProduct', additionalProductObj)
    store.dispatch('product/mutateSelectedVariant', filteredVariant)
  }
}

const fetchProductData = async (productHandle) => {
  try {
    const response = await axios.get(`/products/${productHandle}?view=dynamic_data`)
    return response.data
  } catch (err) {
    console.log("Error in fetching product details", err)
    return null
  }
}

const handleResponse = (productObj) => {
  const { variants, selected_or_first_available_variant } = productObj
  const variant = variants?.find(
    (variant) => variant.id === selected_or_first_available_variant.id
  ) || {}

  const { option1: opt1, option2: opt2, option3: opt3 } = variant
  option1.value = opt1
  option2.value = opt2
  option3.value = opt3

  store.dispatch('product/mutateSelectedVariant', variant)
  store.dispatch('product/mutateActiveProduct', productObj)

  addUpdateQueryParam("variant", variant.id)
  updateLocationPathName(`/products/${productObj.handle}`)
}

const checkMainCTAPosition = () => {
  if (!mainCTA.value) return
  const rect = mainCTA.value.getBoundingClientRect()
  showFloatingCTA.value = rect.top < 0
}

const floatingAddToCart = async () => {
  const isBundleProduct = activeProductObject?.tags?.includes('bundle')
  if (isBundleProduct && bundleWidget.value) {
    const yOffset = -120
    const y = bundleWidget.value.getBoundingClientRect().top + window.scrollY + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
    return
  }

  const id = selectedVariantFloating.value
  try {
    isAddingProduct.value = true
    await post("add", {
      quantity: 1,
      id,
      selling_plan: null,
    })
    window.openCartDrawer()
  } catch (err) {
    console.log(err)
  } finally {
    isAddingProduct.value = false
  }
}

const setFloatingCtaVariant = () => {
  const { selected_or_first_available_variant } = activeProductObject
  if (productHasSizeOption.value && activeProductObject?.variants?.length > 1 && selectedVariantFloating.value !== 'select-a-size') {
    selectedVariantFloating.value = 'select-a-size'
  } else {
    selectedVariantFloating.value = selected_or_first_available_variant.id
  }
}

onMounted(() => {
  const { option1: opt1, option2: opt2, option3: opt3 } = currentVariant
  option1.value = opt1
  option2.value = opt2
  option3.value = opt3

  setFloatingCtaVariant()

  activeServingTypeProduct.value = originalProductObject?.handle
  if (isCombinedProduct.value) {
    activeComboProductVariant.value = originalProductObject?.combo_product_data.original_variants
    activeComboType.value = "combo"

    const combinedProductHandle = originalProductObject?.combo_product_data?.combo_products.map(
      (product) => product.product_handle
    )

    combinedProductHandle.forEach(async (handle) => {
      fetchingProduct.value = true
      const response = await fetchProductData(handle)
      fetchingProduct.value = false
      store.dispatch('product/mutateAdditionalProducts', {
        productHandle: handle,
        productObj: response,
      })
    })
  }

  window.addEventListener("scroll", checkMainCTAPosition)
  checkMainCTAPosition()
})

onUnmounted(() => {
  window.removeEventListener("scroll", checkMainCTAPosition)
})
</script>

<style scoped>
/* Transition animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
