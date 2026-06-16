<template>
  <div class="productPurchaseType">
    <div role="radiogroup" aria-label="Choose purchase type, one time or subscription">
      <div class="rc_block rc_block__type rc_block__type__autodeliver"
           :class="{ 'rc_block__type--active': purchaseType === 'autodeliver' }"
           @click="updatePurchaseType('autodeliver')"
      >
        <input type="radio"
               name="purchase_type"
               value="autodeliver"
               v-model="purchaseType"
               class="rc_radio rc_radio__autodeliver"
               autocomplete="off"
               aria-label="Subscription purchase"
        />
        <label class="rc_label rc_label__autodeliver">
          <div class="purchaseType">
            <div class="purchaseType__left">
              <p class="purchaseType__heading" v-html="subscriptionTitle"/>
              <div class="purchaseTypeSmallText" v-html="subscriptionSubTitle"/>
            </div>
            <div class="purchaseType__right">
              <p class="purchaseType__itemPrice">
                <span v-if="discountPercentage > 0" class="rc_price rc_price__autodeliver" aria-label="recurring price">
                  ${{ discountedPrice.discountedAmount | decimalPrice }}
                </span>
              </p>
              <p v-if="!!tagDiscount" class="purchaseTypeSmallText purchaseTypeSmallText--discount">
                Save {{ tagDiscount }}%
              </p>
              <p v-else class="purchaseTypeSmallText purchaseTypeSmallText--discount">
                Save ${{ discountedPrice.discountAmount | decimalPrice }}
              </p>
            </div>
          </div>
        </label>
        <div class="rc_block rc_block__type__options">
          <label for="rc_shipping_interval_frequency"
                 class="rc_label rc_label__deliver_every"
                 aria-label="Subscription frequency options"
          >
            <span class="rc_label__delivery sr-only">{{
              widgetConfig.label_deliver_every
            }}</span>
            <select ref="frequencySelect"
                    name="Shipping frequency"
                    class="rc_select rc_select__frequency styled replaced"
                    @change="updateSellingPlan"
            >

              <option
                v-if='activeVariantID == "12686486854" && sellingPlan.options[0].value !== "30 days" && sellingPlan.options[0].value !== "45 days"'
                :value="sellingPlan.id"
                v-for="(sellingPlan, index) in sellingPlans"
                :key="sellingPlan.id"
                :selected="defaultFrequency == sellingPlan.options[0].value.trim()"
              >
                {{ sellingPlan.options[0].value.replace("(s)", "s") }}
              </option>
              <option
                v-if='activeVariantID != "12686486854" && sellingPlan.options[0].value!== "75 days" && sellingPlan.options[0].value !== "90 days"'
                :value="sellingPlan.id"
                v-for="(sellingPlan, index) in sellingPlans"
                :key="sellingPlan.id"
                :selected="defaultFrequency == sellingPlan.options[0].value.trim()"
              >
                {{ sellingPlan.options[0].value.replace("(s)", "s") }}
              </option>
            </select>
            <div class="purchaseTypeSmallText" style="margin-left: 10px">
              Cancel Anytime /
              <span class="purchaseTypeTextTooltip hover-reveal"
                    role="tooltip"
                    tabindex="0"
                    aria-label="Learn more about subscription"
                    :data-markup="this.snsLearnMore"
              >Learn More</span>
            </div>
          </label>
        </div>
      </div>
      <div class="rc_block rc_block__type rc_block__type__onetime"
           :class="{ 'rc_block__type--active': purchaseType === 'onetime' }"
           v-if="!isSubscriptionOnly"
           @click="updatePurchaseType('onetime')"
      >
        <input type="radio"
               name="purchase_type"
               value="onetime"
               v-model="purchaseType"
               class="rc_radio rc_radio__onetime"
               autocomplete="off"
               aria-label="Onetime purchase"
        />
        <label class="rc_label rc_label__onetime">
          <div class="purchaseType">
            <div class="purchaseType__left">
              <p class="purchaseType__heading">
                {{ widgetConfig.label_onetime }}
              </p>
              <div class="purchaseTypeSmallText">Purchase this time only.</div>
            </div>

            <div v-if="Boolean(tagDiscount)">
              <p class="purchaseType__heading" style="text-align: right">
                ${{ discountedPrice.discountedAmount | decimalPrice }}
              </p>
              <p class="purchaseTypeSmallText purchaseTypeSmallText--discount">Save {{ tagDiscount }}%</p>
            </div>
            <div v-else>
              <p class="purchaseType__heading" style="text-align: right">
                ${{ activeVariant.price | decimalPrice }}
              </p>
            </div>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import setUpTooltip from '../../../global/tooltip';
import { getTagDiscount } from '../../../../utils/discount';

export default {
  name: 'SubscriptionToggle',
  props: {
    widgetConfig: {
      type: Object,
      required: true,
      default: {},
    },
    product: {
      type: Object,
      required: true,
      default: {},
    },
    activeVariant: {
      type: Object,
      required: true,
      default: {},
    },
    snsLearnMore: {
      type: String,
      default(popup) {
        return `<div class="purchaseTypeTextTooltip__body"><div class="purchaseTypeTextTooltipBody__header"><p class="purchaseTypeTextTooltipBody__headerText">BENEFITS OF SUBSCRIPTIONS</p><button type="button" class="purchaseTypeTextTooltipBody__close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11"><g stroke="#000" stroke-width="1.7" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><path d="m10 1-9 9M1 1l9 9"/></g></svg></button></div><ul class="purchaseTypeTextTooltip__list"><li>• ${this.product.discount_value}% off subscription for life</li><li>• Modify or cancel anytime</li><li>• Priority to July 4 and Black Friday sales</li><li>• Automatically delivered on your schedule</li></ul></div>`;
      },
    },
  },
  data() {
    return {
      purchaseType:
          this.widgetConfig.select_subscription_first || this.isSubscriptionOnly
            ? 'autodeliver'
            : 'onetime',
      selectedSellingPlan: null,
    };
  },
  watch: {
    activeVariant: {
      handler() {
        this.$emit('purchaseType', this.purchaseTypeEventObj);
      },
    },
    product: {
      handler() {
        this.selectedSellingPlan = this.sellingPlans[0].id;
        this.$emit('purchaseType', this.purchaseTypeEventObj);
      },
    },
  },
  computed: {
    tagDiscount() {
      return getTagDiscount(this.product.tags);
    },
    sellingPlans() {
      const { selling_plan_groups } = this.product;
      return selling_plan_groups[0].selling_plans || [];
    },
    defaultFrequency() {
      const { default_frequency } = this.product;
      const defaultFrequency = this.activeVariant.default_frequency !== null ? this.activeVariant.default_frequency : default_frequency;
      return defaultFrequency || null;
    },
    activeVariantID() {
      return this.activeVariant.id;
    },
    isSubscriptionOnly() {
      const { requires_selling_plan } = this.product;
      return requires_selling_plan;
    },
    discountPercentage() {
      const { price_adjustments } = this.sellingPlans[0];
      const tagDiscount = this.tagDiscount;

      if (tagDiscount) {
        return tagDiscount;
      }

      return (price_adjustments.length && price_adjustments[0].value) || 0;
    },
    subscriptionTitle() {
      const tagDiscount = this.tagDiscount;

      if (tagDiscount) {
        return `Subscribe & Save <s>15%</s> <span class="has-red-color">${tagDiscount}% FOR LIFE</span>`;
      }

      return 'Subscribe & Save 15%';
    },
    subscriptionSubTitle() {
      const tagDiscount = this.tagDiscount;

      if (tagDiscount) {
        return `<b>${this.product.subscription_sub_title}</b>`;
      }

      return this.product.subscription_sub_title;
    },
    purchaseTypeEventObj() {
      const { purchaseType, selectedSellingPlan, discountedPrice } = this;
      return {
        purchaseType,
        selectedSellingPlan,
        discountedAmount: discountedPrice.discountedAmount,
      };
    },
    discountedPrice() {
      const { discountPercentage } = this;
      const { price } = this.activeVariant;
      const discount = {
        discountedAmount: null,
        discountAmount: null,
      };
      const discountAmount =
          discountPercentage > 0 ? (price * discountPercentage) / 100 : 0;
      const discountedAmount =
          discountPercentage > 0 ? price - discountAmount : price;
      discount.discountAmount = discountAmount;
      discount.discountedAmount = discountedAmount;
      return discount;
    },
  },
  mounted() {
    //Set the initial selling plan
    const selectElement = this.$refs.frequencySelect;
    const selectedOption = selectElement.options[selectElement.selectedIndex].value;
    this.selectedSellingPlan = selectedOption || this.sellingPlans[0].id;
    this.$emit('purchaseType', this.purchaseTypeEventObj);
    //Init tooltip
    setUpTooltip();
  },
  methods: {
    updatePurchaseType(purchaseType) {
      this.purchaseType = purchaseType;
      this.$emit('purchaseType', this.purchaseTypeEventObj);
    },
    updateSellingPlan(e) {
      const { target } = e;
      this.selectedSellingPlan = parseInt(target.value);
      this.$emit('purchaseType', this.purchaseTypeEventObj);
    },
  },
};
</script>
