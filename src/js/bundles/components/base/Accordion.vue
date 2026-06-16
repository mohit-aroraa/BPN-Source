<template>
  <div class="siteAccordion">
    <slot></slot>
  </div>
</template>

<script setup>
import { reactive, provide } from 'vue';

const accordionState = reactive({
  count: 0,
  active: null,
});

provide('Accordion', accordionState);
</script>
