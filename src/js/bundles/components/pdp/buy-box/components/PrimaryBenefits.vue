<template>
  <div class="productPrimaryBenefits">
    <div
      class="productPrimaryBenefits__card"
      v-for="productPrimaryBenefit in data"
      :key="productPrimaryBenefit.heading"
    >
      <div class="productPrimaryBenefits__iconWrapper">
        <BaseImage objectFit="cover" :image="productPrimaryBenefit.icon"/>
      </div>
      <div class="productPrimaryBenefits__copy">
        <p
          class="lead-4 text-uppercase productPrimaryBenefits__heading"
          v-html="productPrimaryBenefit.heading"
        ></p>
        <p
          class="productPrimaryBenefits__text"
          v-html="productPrimaryBenefit.primary_title"
        ></p>
      </div>
    </div>
  </div>
</template>

<script>
import BaseImage from '../../../base/image.vue';

export default {
  name: 'PrimaryBenefits',
  props: {
    data: {
      type: Array,
      required: true,
      default: [],
    },
  },
  components: {
    BaseImage,
  },
};
</script>
