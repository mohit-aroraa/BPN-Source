<template>
  <ol
    aria-label="breadcrumb"
    class="breadcrumbMain PDP__breadcrumb"
    :class="additionalClass"
    v-html="BreadcrumbMarkup"
  ></ol>
</template>

<script>
export default {
  name: 'PDPBreadcrumb',
  props: {
    BreadcrumbMarkup: {
      type: String,
      required: true,
      default: '',
    },
    additionalClass: {
      type: String,
      required: false,
      default: '',
    },
  },
};
</script>
