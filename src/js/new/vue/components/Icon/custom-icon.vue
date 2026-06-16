<script setup>
import { computed } from 'vue';

import Loader from './Loader.vue';
import Decrease from './Decrease.vue';
import Increase from './Increase.vue';
import Trigger from './Trigger.vue';
import Gallery from './Gallery.vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
    validator: (value) => {
      const validIcons = [ 'loader', 'decrease', 'increase', 'selector-icon', 'gallery' ];

      return validIcons.includes(value);
    },
    default: () => undefined,
  },
  clickId: {
    type: String,
  },
});

const icons = {
  loader: Loader,
  decrease: Decrease,
  increase: Increase,
  trigger: Trigger,
  gallery: Gallery,
};

const icon = computed(() => {

  return icons[props.name];
});
</script>

<template>
  <component v-if="icon" :is="icon" :clickId="clickId" :class="name" />
</template>
