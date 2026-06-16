<template>
  <accordion>
    <!-- Size Guide -->
    <accordion-item
      ariaControls="sizing-chart"
      wrapperClass="siteAccordion__wrapper--sizingChart"
      v-if="product?.show_size_guide_tab"
    >
      <template v-slot:accordion-trigger> Size Guide </template>
      <template v-slot:accordion-content>
        <div class="sizingChartSection" v-if="measurementMarkup" v-html="measurementMarkup"></div>
        <div class="sizingChartSection" v-if="unisexSizingConversionChartMarkup" v-html="unisexSizingConversionChartMarkup"></div>
      </template>
    </accordion-item>

    <!-- Supplement Facts -->
    <div v-if="product?.show_nutrition_tab">
      <a role="button" href="javascript:void(0);" @click.prevent="openModal(supplementFactModal)" class="siteAccordion__header">
        <span class="siteAccordion__headerText">{{ product?.nutrition_accordion_title }}</span>
      </a>
      <Modal ref="supplementFactModal" ariaLabelledby="supplementFacts">
        <template v-slot:modal-title>
          <div class="micromodal__title" id="supplementFacts" role="title">{{ product?.nutrition_accordion_title }}</div>
        </template>
        <template v-slot:modal-content>
          <div class="micromodal__content">
            <div class="productNutritionContent__modalContent">
              <div class="productNutritionContent__shortText" v-if="nutritionData.nutritionShortContent" v-html="nutritionData.nutritionShortContent"></div>
              <div v-if="nutritionData.nutritionModalMarkup" v-html="nutritionData.nutritionModalMarkup"></div>
            </div>
          </div>
        </template>
      </Modal>
    </div>

    <!-- Ingredients -->
    <div v-if="product?.show_ingredients_tab">
      <a role="button" href="javascript:void(0);" @click.prevent="openModal(ingredientsModal)" class="siteAccordion__header">
        <span class="siteAccordion__headerText"> Ingredients </span>
      </a>
      <Modal ref="ingredientsModal" ariaLabelledby="Ingredients-title">
        <template v-slot:modal-title>
          <div class="micromodal__title" id="Ingredients-title" role="title"> Ingredients </div>
        </template>
        <template v-slot:modal-content>
          <div class="micromodal__content">
            <div class="productIngredientContent__modalContent">
              <p class="productIngredientsShortContent" v-html="product?.ingredients_short_text" v-if="product?.ingredients_short_text"></p>
              <div v-if="product?.ingredients_modal_text_markup" v-html="product?.ingredients_modal_text_markup"></div>
            </div>
          </div>
        </template>
      </Modal>
    </div>

    <!-- How To Use -->
    <accordion-item ariaControls="how_to_use" wrapperClass="siteAccordion__wrapper--howToUse" v-if="product?.show_how_to_use_tab">
      <template v-slot:accordion-trigger> {{ product?.how_to_use_title || "How to use" }} </template>
      <template v-slot:accordion-content>
        <div v-html="product.how_to_use_markup"></div>
      </template>
    </accordion-item>
  </accordion>
</template>

<script setup>
import { ref, computed, toRefs } from 'vue';
import Accordion from '../../../../components/base/Accordion.vue';
import AccordionItem from '../../../../components/base/AccordionItem.vue';
import Modal from '../../../../components/base/Modal.vue';

const props = defineProps({
  product: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  activeVariantId: {
    type: Number,
    required: true,
  },
});

const { product, activeVariantId } = toRefs(props);

const supplementFactModal = ref(null);
const ingredientsModal = ref(null);

const openModal = (modalRef) => {
  if (modalRef) {
    modalRef.openModal();
  }
};

const measurementMarkup = computed(() => {
  return product.value?.show_size_guide_tab && product.value?.measurements
    ? product.value.measurements
    : null;
});

const unisexSizingConversionChartMarkup = computed(() => {
  return product.value?.show_size_guide_tab && product.value?.unisex_sizing_conversion_chart
    ? product.value.unisex_sizing_conversion_chart
    : null;
});

const nutritionData = computed(() => {
  const data = {
    nutritionShortContent: null,
    nutritionModalMarkup: null,
  };

  if (!product.value?.nutrition_data || product.value.nutrition_data.length === 0) {
    return data;
  }

  let selectedVariant = product.value.nutrition_data.find(
    (item) => item.variant_id === activeVariantId.value
  );

  if (!selectedVariant) {
    selectedVariant = product.value.nutrition_data[0];
  }

  data.nutritionShortContent = selectedVariant.nutrition_short_content;
  data.nutritionModalMarkup = selectedVariant.nutrition_modal_markup;

  return data;
});
</script>
