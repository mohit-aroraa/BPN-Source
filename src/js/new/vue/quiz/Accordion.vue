<template>
  <div class="accordion" v-show="accordionItems.length !== 0">
    <div class="accordion-item" v-for="(item, index) in accordionItems" @click="onAccordionItemSelect(index)"
         :class="{active: index === accordionIndex}">
      <div class="accordion-item__heading">
        <h4 class="accordion-item__title" v-html="item.title"></h4>

        <svg class="toggle-icon" xmlns="http://www.w3.org/2000/svg" width="17" height="10" viewBox="0 0 17 10"
             fill="none"
             @click.capture.stop="onAccordionItemSelect(accordionIndex === index ? -1: index)"
        >
          <path d="M2 2L8.5 8.5L15 2" stroke="black" stroke-width="2" stroke-linecap="square"
                stroke-linejoin="round" />
        </svg>
      </div>

      <div class="accordion-item__content">
        <p v-if="item.text" v-html="convertSchemaToHtml(item.text)"></p>
        <img v-if="item.image" :src="item.image" :alt="activeVariantTitle" />
      </div>
    </div>
  </div>
</template>

<script setup>

import { convertSchemaToHtml } from '@thebeyondgroup/shopify-rich-text-renderer';

const props = defineProps({
  onAccordionItemSelect: {
    type: Function,
    default: () => {
    },
  },
  activeVariantTitle: {
    type: String,
    default: '',
  },
  accordionIndex: {
    type: Number,
    default: 0,
  },
  accordionItems: {
    type: Array,
    default: () => ([]),
  },
});
</script>
