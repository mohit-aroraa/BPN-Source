<template>
  <div class="quiz-page">

    <!--  Page hero  -->
    <div class="quiz-hero">
      <div class="quiz-hero__content">
        <h2 class="quiz-hero__subtitle" v-text="subTitle" />
        <h1 class="quiz-hero__title" v-text="pageConfig.title"></h1>
        <p class="quiz-hero__text" v-text="pageConfig.text" />
        <div class="quiz-hero__tags">
          <div v-for="(tag, index) in tagsWithProducts" :key="{tag}" class="quiz-hero__tag" @click="navigate(index)">
            {{ tag }}
          </div>
        </div>
      </div>
    </div>

    <!--  Content with active tag by default  -->
    <div id="quiz-content" class="quiz-content" ref="quizContent" v-if="activeTag">
      <div class="quiz-content__active-tag">
        <div class="quiz-content__icon">
          <img :src="getCategoryIcon(activeTag)" :alt="activeTag">
        </div>
        {{ activeTag }}
      </div>

      <div class="quiz-content__products-grid">
        <ProductCard
          v-for="product in getProductsForTag(activeTag)"
          :key="product.id"
          :id="product.id"
          :title="product.title"
          :image="product.image"
          :price="product.price_formatted"
          :link="product.link"
          :selected="Boolean(selectedProducts[product.id]?.variantId)"
          :tag="activeTag"
          alignment="horizontal"
          selectable
          @select="onSelectEvent"
          :is-dropdown-open="openProductDropdownId === product.id && openProductDropdownTag === activeTag"
          @dropdown="onDropdownEvent"
        />
      </div>

      <button class="quiz-content__add-button" :disabled="selectedProductCount === 0" v-html="buttonText"
              @click="onAddSelectedProductsClick" />
    </div>

    <!--  tabs to switch between categories  -->
    <div class="quiz-tabs" ref="quizTabs" v-show="tagsWithProducts.length > 1">
      <h2 v-text="pageConfig.tabsTitle" class="quiz-tabs__title" />

      <div class="quiz-tabs__panels">
        <div v-for="(tag, index) in tagsWithProducts" :key="`${tag}-panel`" class="quiz-tabs__panel" v-show="index !== 0"
             :class="{active: activeTab===index}" @click="changeActiveTab(index)">
          <div class="quiz-tabs__panel-icon">
            <img :src="getCategoryIcon(tag)" :alt="tag">
          </div>
          {{ tag }}
        </div>
      </div>

      <div v-for="(tag, index) in tagsWithProducts" v-show="activeTab === index" :key="`${tag}-content`"
           class="quiz-tabs__tab-content">
        <ProductCard
          v-for="product in getProductsForTag(tag)"
          :key="product.id"
          :id="product.id"
          :title="product.title"
          :image="product.image"
          :price="product.price_formatted"
          :link="product.link"
          :is-dropdown-open="openProductDropdownId === product.id && openProductDropdownTag === tag"
          :tag="tag"
          alignment="vertical"
          @select="onSelectEvent"
          @dropdown="onDropdownEvent"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { getQuizPageConfig } from '../../helpers/quiz';
import ProductCard from './ProductCard.vue';
import { getFormattedPrice } from '../cart/helpers';
import cartMethods from '../../../bundles/utils/helpers/cart-helper';
import { openCartDrawerDelayed } from '../../components/product-drawer/cart-actions';

const props = defineProps({
  name: {
    type: String,
    default: () => '',
  },
  tags: {
    type: Array,
    default: () => ([]),
    validator: (value) => value.every((tag) => typeof tag === 'string'),
  },
  products: {
    type: Array,
    default: () => ([]),
    validator: (value) => {
      return value.every((product) => typeof product === 'object');
    },
  },
});

const pageConfig = ref(getQuizPageConfig());
const tags = ref([]);
const activeTab = ref(1);
const quizContent = ref(null);
const quizTabs = ref(null);
const openProductDropdownId = ref(null);
const openProductDropdownTag = ref(null);

// Function to sort tags with 'Endurance' first
const sortTagsWithEnduranceFirst = (tagArray) => {
  const sortedTags = [...tagArray];
  const enduranceIndex = sortedTags.findIndex(tag => tag.toLowerCase() === 'endurance');

  if (enduranceIndex > -1) {
    // Remove 'Endurance' from its current position and add it to the beginning
    const enduranceTag = sortedTags.splice(enduranceIndex, 1)[0];
    sortedTags.unshift(enduranceTag);
  }

  return sortedTags;
};

// Function to distribute products uniquely across tags
const distributeProductsAcrossTagsUniquely = (products, sortedTags) => {
  const usedProductIds = new Set();
  const tagProductMap = {};

  // Initialize the map
  sortedTags.forEach(tag => {
    tagProductMap[tag] = [];
  });

  // Distribute products, prioritizing earlier tags
  sortedTags.forEach(tag => {
    products.forEach(product => {
      // Check if product has this tag and hasn't been used yet
      if (product.tags.includes(tag) && !usedProductIds.has(product.id)) {
        tagProductMap[tag].push(product);
        usedProductIds.add(product.id);
      }
    });
  });

  return tagProductMap;
};

// Create sorted tags and product distribution
const sortedTags = computed(() => sortTagsWithEnduranceFirst(props.tags));
const tagProductMap = computed(() => distributeProductsAcrossTagsUniquely(props.products, sortedTags.value));

// Filter out tags that don't have any products
const tagsWithProducts = computed(() => {
  return sortedTags.value.filter(tag => {
    const products = tagProductMap.value[tag] || [];
    return products.length > 0;
  });
});

const selectedProducts = ref(props.products.reduce((acc, product) => {
  if (tagsWithProducts.value.length > 0 && product.tags.includes(tagsWithProducts.value[0])) {
    return {
      ...acc,
      [product.id]: {
        variantId: product.variants[0].id,
        price: product.variants[0].price * 100,
      },
    };
  }

  return acc;
}, 0));

onMounted(() => {
  tags.value = tagsWithProducts.value;
});

const changeActiveTab = (index) => {
  activeTab.value = index;
};

// Updated function to check products using the unique distribution
const hasProductRequiredTag = (product, tag) => {
  return tagProductMap.value[tag]?.some(p => p.id === product.id) || false;
};

// Updated function to get products for a specific tag
const getProductsForTag = (tag) => {
  return tagProductMap.value[tag] || [];
};

const onDropdownEvent = (payload) => {
  openProductDropdownId.value = payload.id;
  openProductDropdownTag.value = payload.tag;
};

const onSelectEvent = (data) => {
  selectedProducts.value[data.productId] = {
    variantId: data.variantId,
    price: data.price,
  };
};

const getTopOffset = (element) => {
  const offsetHeight = document.querySelector('.pageHeader.header__wrapper')?.offsetHeight || 80;

  return element.getBoundingClientRect().top + window.scrollY - offsetHeight;
};

const navigate = (index) => {
  const element = index === 0 ? quizContent.value : quizTabs.value;

  if (element) {
    window.scrollTo({
      top: getTopOffset(element),
      behavior: 'smooth',
    });
  }

  activeTab.value = index;
};

const subTitle = computed(() => {
  if (props.name) {
    return `${props.name}'s PERSONALIZED`;
  }

  return 'PERSONALIZED';
});

const activeTag = computed(() => {
  return tagsWithProducts.value[0];
});

const getCategoryIcon = (tag) => {
  return pageConfig.value.icons[tag];
};

const selectedProductCount = computed(() => {
  return Object.values(selectedProducts.value).reduce((acc, product) => {
    if (product.variantId) {
      return acc + 1;
    }

    return acc;
  }, 0);
});

const selectedProductPrice = computed(() => {
  return Object.values(selectedProducts.value).reduce((acc, product) => {
    if (product.variantId) {
      return acc + product.price;
    }

    return acc;
  }, 0);
});

const buttonText = computed(() => {
  if (selectedProductCount.value === 0) {
    return 'select products';
  }

  return `Add ${selectedProductCount.value} products to cart - ${getFormattedPrice(selectedProductPrice.value, window.BPN?.cart?.currencySymbol)}`;
});

const onAddSelectedProductsClick = async () => {
  try {
    const items = Object.values(selectedProducts.value).reduce((items, product) => {
      if (product.variantId) {
        items.push({ id: parseInt(product.variantId), quantity: 1, properties: {} });
      }

      return items;
    }, []);
    await cartMethods.postBatch('add', items);

    openCartDrawerDelayed();
  } catch (e) {
    console.log(e);
  }
};

// Auto-set activeTab to the first tag if tags change
watch(() => props.tags, (newTags) => {
  if (tagsWithProducts.value.length > 0) {
    activeTab.value = 1;
  }
}, { immediate: true });

// Export the function for use in template
defineExpose({
  getProductsForTag,
  tagsWithProducts
});

</script>
