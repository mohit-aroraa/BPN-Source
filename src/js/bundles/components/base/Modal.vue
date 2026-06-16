<template>
  <div
    class="micromodal micromodal-slide"
    :class="{ 'is-open': isActive }"
    :aria-hidden="!isActive ? 'true' : 'false'"
  >
    <div class="micromodal__overlay" tabindex="-1" @click.self="closeModal">
      <div
        class="micromodal__container"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="ariaLabelledby"
      >
        <header class="micromodal__header">
          <slot name="modal-title" :id="ariaLabelledby"></slot>
          <button
            class="micromodal__close"
            aria-label="Close modal"
            @click="closeModal"
          ></button>
        </header>
        <slot name="modal-content"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineExpose, nextTick, onUnmounted } from 'vue';

const props = defineProps({
  ariaLabelledby: String,
});

const isActive = ref(false);
const triggerElement = ref(null);

const openModal = (trigger) => {
  isActive.value = true;
  document.documentElement.classList.add('lock-body');
  triggerElement.value = trigger;
  document.addEventListener('keydown', onEscKey);
};

const closeModal = () => {
  isActive.value = false;
  document.documentElement.classList.remove('lock-body');
  document.removeEventListener('keydown', onEscKey);

  nextTick(() => {
    if (triggerElement.value) {
      triggerElement.value.focus();
    }
  });
};

const onEscKey = (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
};

onUnmounted(() => {
  document.removeEventListener('keydown', onEscKey);
});

defineExpose({ openModal, closeModal });
</script>
