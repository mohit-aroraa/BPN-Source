<template>
  <div class="bpn-product-content__variant">
    <div v-for="(option, index) in options" :key="option.name" class="bpn-product-content__option">
      <label :for="`option-${index}`" class="bpn-product-content__option-name">
        {{ option.name }} ({{ getVisibleOptionCount(index) }})
      </label>

      <div class="bpn-product-content__custom-dropdown">
        <div class="bpn-product-content__dropdown-selected" :class="{ 'active': openDropdown === index }"
          @click="toggleDropdown(index)"
          :data-click-id="clickIdPrefix ? `${clickIdPrefix}_drawer_${option.name.toLowerCase()}-selector` : ''">
          <div class="bpn-product-content__dropdown-selected-inner">
            <span v-if="getSelectedVariationIcon(index)" v-html="getSelectedVariationIcon(index)"
              class="bpn-product-content__variation-icon">
            </span>
            <span>{{ selectedOptions[index] }}</span>
            <span v-if="getSelectedIsVariationOOS(index)" class="sold-out-label">SOLD OUT</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        <div v-show="openDropdown === index" class="bpn-product-content__dropdown-options">
          <template v-for="value in option.values" :key="value">
            <div v-if="!isVariationHidden(index, value)" class="bpn-product-content__dropdown-option"
              :class="{
                'bpn-product-content__dropdown-option--selected': selectedOptions[index] === value, 'oos': getIsVariationOOS(index, value)
              }" @click="selectOption(index, value)">
              <span v-if="getVariationIcon(index, value)" v-html="getVariationIcon(index, value)"
                class="bpn-product-content__variation-icon">
              </span>
              {{ value }}

              <span v-if="getIsVariationOOS(index, value)" class="sold-out-label">SOLD OUT</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { extractShopifyId } from '../../../helpers/common';

const props = defineProps({
  variants: {
    type: Array,
    required: true,
  },
  variationsMeta: {
    type: Array,
    required: true,
    default: () => ([]),
  },
  options: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  clickIdPrefix: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const openDropdown = ref(null);

const availableCombinations = computed(() => {
  const combinations = {};

  props.variants.forEach(variant => {
    if (!variant.available) return;

    const option1 = variant.option1;
    const option2 = variant.option2;
    const option3 = variant.option3;

    if (option1) {
      combinations[`0:${option1}`] = true;

      if (option2) {
        combinations[`1:${option2}`] = combinations[`1:${option2}`] || {};
        if (typeof combinations[`1:${option2}`] === 'object') {
          combinations[`1:${option2}`][option1] = true;
        }

        if (option3) {
          combinations[`2:${option3}`] = combinations[`2:${option3}`] || {};
          if (typeof combinations[`2:${option3}`] === 'object') {
            combinations[`2:${option3}`][`${option1}:${option2}`] = true;
          }
        }
      }
    }
  });

  return combinations;
});

const selectedOptions = ref(['', '', '']);

watch(() => props.modelValue, (newValue) => {
  if (!newValue) return;

  const variant = props.variants.find(v => v.id === newValue);
  if (variant) {
    selectedOptions.value = [
      variant.option1 || '',
      variant.option2 || '',
      variant.option3 || '',
    ];
  }
}, { immediate: true });

watch(selectedOptions, (newOptions) => {
  const variant = props.variants.find(v =>
    v.option1 === newOptions[0] &&
    v.option2 === (newOptions[1] || null) &&
    v.option3 === (newOptions[2] || null),
  );

  if (variant && variant.id !== props.modelValue) {
    emit('update:modelValue', variant.id);
  }
}, { deep: true });

const isValueSelected = (optionIndex, value) => {
  return selectedOptions.value[optionIndex] === value;
};

const isValueAvailable = (optionIndex, value) => {
  const key = `${optionIndex}:${value}`;

  if (optionIndex === 0) {
    return !!availableCombinations.value[key];
  }

  if (optionIndex === 1) {
    const option1 = selectedOptions.value[0];
    return (
      availableCombinations.value[key] &&
      (typeof availableCombinations.value[key] !== 'object' || availableCombinations.value[key][option1])
    );
  }

  if (optionIndex === 2) {
    const option1 = selectedOptions.value[0];
    const option2 = selectedOptions.value[1];
    return (
      availableCombinations.value[key] &&
      (typeof availableCombinations.value[key] !== 'object' ||
        availableCombinations.value[key][`${option1}:${option2}`])
    );
  }

  return false;
};

const isMetaAvailableOOS = (id) => {
  const availability = props.variationsMeta.find(v => v.id === id)?.availability || 'default';

  return availability === 'oos';
};

const getVisibleOptionCount = (optionIndex) => {
  return props.options[optionIndex].values.filter(value => !isVariationHidden(optionIndex, value)).length;
};

const isVariationHidden = (optionIndex, value) => {
  for (const variant of props.variants) {
    if ((optionIndex === 0 && variant.option1 === value) ||
      (optionIndex === 1 && variant.option2 === value) ||
      (optionIndex === 2 && variant.option3 === value)) {

      let variantId = variant.id;
      if (typeof variantId !== 'number') {
        variantId = extractShopifyId(variant.id);
      }
      const availability = props.variationsMeta.find(v => v.id === variantId)?.availability || 'default';
      return availability === 'hidden';
    }
  }
  return false;
};

const getIsVariationOOS = (optionIndex, value) => {
  // Find a variant with this option value at the specified position
  for (const variant of props.variants) {
    if ((optionIndex === 0 && variant.option1 === value) ||
      (optionIndex === 1 && variant.option2 === value) ||
      (optionIndex === 2 && variant.option3 === value)) {

      let variantId = variant.id
      if (typeof variantId !== 'number') {
        variantId = extractShopifyId(variant.id);
      }
      if (isMetaAvailableOOS(variantId)) {
        return true;
      }

      // Return false if the variant is not available
      return !variant.available;
    }
  }

  return false;
};

const getSelectedIsVariationOOS = (optionIndex) => {
  const value = selectedOptions.value[optionIndex];
  if (!value) return false;

  return getIsVariationOOS(optionIndex, value);
};

// Get variation icon for a specific option value
const getVariationIcon = (optionIndex, value) => {
  // Find a variant with this option value at the specified position
  for (const variant of props.variants) {
    if ((optionIndex === 0 && variant.option1 === value) ||
      (optionIndex === 1 && variant.option2 === value) ||
      (optionIndex === 2 && variant.option3 === value)) {

      // Return the variation icon if available
      return variant.variationIcon || null;
    }
  }
  return null;
};

// Get the variation icon for the currently selected option at index
const getSelectedVariationIcon = (optionIndex) => {
  const value = selectedOptions.value[optionIndex];
  if (!value) return null;

  return getVariationIcon(optionIndex, value);
};

const toggleDropdown = (index) => {
  openDropdown.value = openDropdown.value === index ? null : index;
};

const selectOption = (optionIndex, value) => {
  const newOptions = [...selectedOptions.value];
  newOptions[optionIndex] = value;

  for (let i = optionIndex + 1; i < newOptions.length; i++) {
    newOptions[i] = '';
  }

  selectedOptions.value = newOptions;
  toggleDropdown(optionIndex);
};

// Click outside handler for dropdown
const handleClickOutside = (event) => {
  if (openDropdown.value !== null) {
    const dropdowns = document.querySelectorAll('.bpn-product-content__custom-dropdown');
    let clickedInside = false;

    dropdowns.forEach(dropdown => {
      if (dropdown.contains(event.target)) {
        clickedInside = true;
      }
    });

    if (!clickedInside) {
      openDropdown.value = null;
    }
  }
};

// Setup click outside handling
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
