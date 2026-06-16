<template>
  <div
    :class="[
      'siteAccordion__wrapper ' + wrapperClass,
      visible ? 'is-active' : '',
    ]"
  >
    <a
      class="siteAccordion__header"
      role="button"
      href="javascript:void(0);"
      :aria-expanded="visible ? 'true' : 'false'"
      :aria-controls="ariaControls"
      :class="{ accordion__trigger_active: visible }"
      @click="open"
    >
      <span class="siteAccordion__headerText">
        <slot name="accordion-trigger"></slot>
      </span>
      <span class="siteAccordion__icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 7">
          <path
            d="m10.847 1.153-4.73 4.73a.37.37 0 0 1-.539 0l-4.73-4.73"
            stroke="#000"
            stroke-width="1.5"
            fill="none"
            fill-rule="evenodd"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </a>

    <transition
      name="accordion"
      @enter="start"
      @after-enter="end"
      @before-leave="start"
      @after-leave="end"
    >
      <div class="siteAccordion__content" v-show="visible" :id="ariaControls">
        <div class="siteAccordion__contentPaddingBottom">
          <slot name="accordion-content"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';

const props = defineProps({
  wrapperClass: {
    type: String,
    default: '',
  },
  ariaControls: {
    type: String,
    default: '',
  },
});

const Accordion = inject('Accordion');

const index = ref(null);
const visible = computed(() => index.value === Accordion.active);

const open = () => {
  Accordion.active = visible.value ? null : index.value;
};

const start = (el) => {
  el.style.height = el.scrollHeight + 'px';
};

const end = (el) => {
  el.style.height = '';
};

onMounted(() => {
  index.value = Accordion.count++;
});
</script>

<style lang="scss" scoped>
.siteAccordion__content {
  overflow: visible;
  max-height: none;
  transition: none;
}

.accordion-enter-active,
.accordion-leave-active {
  will-change: height, opacity;
  transition: height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}

.accordion-enter,
.accordion-leave-to {
  height: 0 !important;
  opacity: 0;
}
</style>
