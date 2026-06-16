<template>
  <section class="collectionSection">
    <div class="collectionGrid js-filter-desktop"
         :class="{
           'collectionGrid--noFilter': getCollectionMasterFilters.length === 0,
         }"
    >
      <div class="collectionGrid__left">
        <div class="collectionFilterDesktop">
          <p class="collectionFilterDesktop__heading">Filter Products</p>

          <div class="collectionFilterSection">
            <div class="collectionFilterSection__filterWrapper" v-for="filter in finalFilters" :key="filter.heading">
              <div class="collectionFilterSection__filterBlock" v-if="filter.isFilterEnable">
                <p class="collectionFilterSection__title">
                  {{ filter.heading }}
                </p>

                <ul class="collectionFilterSection__filterItems" v-if="filter.filters.length > 0">
                  <li class="collectionFilterSection__filterItem"
                      v-for="(tag, index) in filter.filters"
                      :key="index + tag"
                  >
                    <div class="collectionFilterSection__check">
                      <input type="checkbox"
                             class="collectionFilterSection__checkbox"
                             :id="filter.filter_type + index"
                             autocomplete="off"
                             @change="
                               addFilter($event, filter.filter_type, tag.name)
                             "
                      />
                      <label class="collectionFilterSection__label" :for="filter.filter_type + index">
                        {{ tag.name }}
                        <span v-if="filter.filter_type === 'category'">({{ tag.count }})</span>
                      </label>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="collectionGrid__right">
        <div class="collectionSortDesktop">
          <p class="productCount">
            {{ filteredProducts.length + " Items" }}
          </p>

          <div class="sortTriggerMobile">
            <div class="indicator" v-show="isMobileFilterApplied"></div>
            <button title="Open mobile filter"
                    type="button"
                    class="sortTriggerMobile__button"
                    @click="showMobileFilter"
                    data-sl="open_mobile_filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 14" width="14">
                <g stroke="#000001"
                   stroke-width="2"
                   fill="none"
                   fill-rule="evenodd"
                   stroke-linecap="round"
                   stroke-linejoin="round"
                >
                  <path d="M15.182 1.545H1M15.182 7H1M15.182 12.455H1"/>
                </g>
              </svg>
              Filter & Sort
            </button>
          </div>
          <div class="collectionSortDesktop__wrapper">
            <p class="collectionSortDesktop__filterText">Sort by</p>
            <div class="collectionSortDesktopDropdown"
                 :class="{
                   'collectionSortDesktopDropdown--open': isSortDropdownOpen,
                 }"
            >
              <button type="button"
                      class="collectionSortDesktopDropdown__trigger"
                      title="Sort trigger"
                      @click="openSortDropdown"
                      v-click-outside="closeSortDropdown"
                      :aria-expanded="isSortDropdownOpen ? 'true' : 'false'"
                      data-sl="sort_dropdown_desktop"
              >
                {{ selectedSort.name }}

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 6">
                  <path d="M11 0 6.27 4.73a.37.37 0 0 1-.54 0L1 0"
                        stroke="#000"
                        fill="none"
                        fill-rule="evenodd"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                  />
                </svg>
              </button>
              <ul class="collectionSortDesktopDropdown__items"
                  v-if="sortOptions.length > 0"
                  v-show="isSortDropdownOpen"
              >
                <template v-for="sort in sortOptions">
                  <li v-if="selectedSort.value !== sort.value"
                      class="collectionSortDesktopDropdown__item"
                      :class="{
                        'collectionSortDesktopDropdown__item--selected':
                          selectedSort.value === sort.value,
                      }"
                      role="button"
                      tabindex="0"
                      :key="sort.value"
                      :data-sort-value="sort.value"
                      @click="setSortFilter(sort)"
                  >
                    {{ sort.name }}
                  </li>
                </template>
              </ul>
            </div>
          </div>
        </div>
        <div class="collectionGrid__products" v-if="paginatedOrders.length">
          <grid-item v-for="(product, index) in paginatedOrders"
                     :key="product.id"
                     :product="product"
                     :loopIndex="index"
          />
        </div>
        <div v-else>No product found</div>
        <div id="observeBottom"></div>
      </div>
    </div>
    <aside class="mobileFilter"
           :class="{ 'mobileFilter--visible': isMobileFilterVisible }"
           :aria-hidden="isMobileFilterVisible ? 'false' : 'true'"
           v-trap="closeMobileFilter"
           tabindex="0"
    >
      <div class="mobileFilterTop">
        <p class="mobileFilterTop__heading">Filter & Sort</p>
        <button type="button"
                class="mobileFilter__close"
                title="close mobile filter drawer"
                @click="closeMobileFilter"
                data-sl="close_mobile_filter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
            <g stroke="#000"
               stroke-width="1.8"
               fill="none"
               fill-rule="evenodd"
               stroke-linecap="round"
               stroke-linejoin="round"
            >
              <path d="m1.263 1.278 9.474 9.444M10.737 1.278l-9.474 9.444"/>
            </g>
          </svg>
        </button>
      </div>

      <div class="mobileFilterContent">
        <div class="mobileFilterContentShortBy">
          <p class="mobileFilterContentShortBy__text">Sort by</p>
          <div class="mobileFilterContentShortByDropdown"
               :class="{
                 'mobileFilterContentShortByDropdown--open': isMobSortDropdownOpen,
               }"
          >
            <button type="button"
                    class="mobileFilterContentShortByDropdown__trigger"
                    title="Sort trigger"
                    @click="openMobSortDropdown"
                    v-click-outside="closeMobSortDropdown"
                    :aria-expanded="isMobSortDropdownOpen ? 'true' : 'false'"
                    data-sl="sort_dropdown_mobile"
            >
              {{ selectedSort.name }}

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 6" class="arrow">
                <path d="M11 0 6.27 4.73a.37.37 0 0 1-.54 0L1 0"
                      stroke="#000"
                      fill="none"
                      fill-rule="evenodd"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                />
              </svg>
            </button>
            <ul class="mobileFilterContentShortByDropdown__items"
                v-if="sortOptions.length > 0"
                v-show="isMobSortDropdownOpen"
            >
              <template v-for="sort in sortOptions">
                <li v-if="selectedSort.value !== sort.value"
                    class="mobileFilterContentShortByDropdown__item"
                    :class="{
                      'mobileFilterContentShortByDropdown__item--selected':
                        selectedSort.value === sort.value,
                    }"
                    role="button"
                    :key="sort.value"
                    :data-sort-value="sort.value"
                    @click="setSortFilter(sort)"
                >
                  {{ sort.name }}
                </li>
              </template>
            </ul>
          </div>
        </div>
        <div class="mobileFilterSection">
          <div class="mobileFilterSection__filterWrapper" v-for="filter in finalFilters" :key="filter.heading">
            <div class="mobileFilterSection__filterBlock" v-if="filter.isFilterEnable">
              <p class="mobileFilterSection__title">
                {{ filter.heading }}
              </p>

              <ul class="mobileFilterSection__filterItems" v-if="filter.filters.length > 0">
                <li class="mobileFilterSection__filterItem" v-for="(tag, index) in filter.filters" :key="index + tag">
                  <div class="collectionFilterSection__check">
                    <input type="checkbox"
                           class="collectionFilterSection__checkbox collectionFilterSection__checkbox--mobile"
                           autocomplete="off"
                           @change="addFilter($event, filter.filter_type, tag.name)"
                           :data-filter="tag.name"
                           :id="'mob_' + filter.filter_type + index"
                    />
                    <label class="collectionFilterSection__label collectionFilterSection__label--mobile"
                           :for="'mob_' + filter.filter_type + index"
                    >
                      {{ tag.name }}
                      <span v-if="filter.filter_type === 'category'">({{ tag.count }})</span>
                    </label>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="mobileFilterBottom" v-if="getCollectionMasterFilters.length > 0">
        <button type="button"
                class="mobileFilter__clearFilter"
                title="clear mobile selected filter"
                @click="clearSelectedMobileFilter"
                data-sl="clear_filter_mobile"
        >
          Clear All
        </button>
        <button type="button"
                class="mobileFilter__applyFilter button button-primary"
                title="Apply selected mobile filter"
                @click="applyMobileFilter"
                data-sl="apply_filter_mobile"
        >
          APPLY
        </button>
      </div>
    </aside>
  </section>
</template>

<script>
import { SORTING_OPTIONS } from '../../utils/constants';
import { mapGetters, mapActions } from 'vuex';
import GridItem from './components/grid-item.vue';
import focusTrap from '../../utils/directives/focus-trap';

export default {
  name: 'CollectionPage',
  components: {
    GridItem,
  },
  data() {
    return {
      currentPage: 1,
      maxPerPage: 6,
      selectedCategory: [],
      selectedDietaryPreferences: [],
      selectedCategoryMobile: [],
      selectedDietaryPreferencesMobile: [],
      sortOptions: [ ...SORTING_OPTIONS ],
      selectedSort: SORTING_OPTIONS[0] || {},
      isSortDropdownOpen: false,
      isMobSortDropdownOpen: false,
      observer: null,
      isMobile: false,
      windowWidth: window.innerWidth,
      isMobileFilterVisible: false,
    };
  },
  directives: {
    trap: focusTrap, // Register focusTrap as a directive instead of mixin
  },
  watch: {
    paginatedOrders(newValue, oldValue) {
      setTimeout(() => {
        window.okeWidgetApi && window.okeWidgetApi.initAllWidgets();
      }, 10);
    },
  },
  created() {
    const { addProductsToCollectionArray } = this;
    const productCount = window?.BPN?.collection_page_data?.products_count || 0;
    //if products count is greater than 50 then get the second set of products
    if (productCount > 50) {
      const currentURL = window.location.href;
      const urlObject = new URL(currentURL);
      const basePath = urlObject.pathname;
      fetch(`${basePath}/?view=json&page=2`)
        .then(response => response.json())
        .then(data => {
          if (!data.length) {
            return;
          }
          addProductsToCollectionArray(data);
        })
        .catch(err => console.log(err));
    }
  },
  mounted() {
    //To get window width
    this.getWindowWidth();
    this.$nextTick(() => {
      window.addEventListener('resize', this.getWindowWidth);
    });
    //Intersection observer to lazy load the product tiles
    this.observer = new IntersectionObserver(
      (ObserverEntry) => {
        ObserverEntry.forEach((entry) => {
          const { isIntersecting } = entry;
          if (isIntersecting) {
            this.loadMore();
          }
        });
      },
      {
        rootMargin: '200px 0px 0px 0px',
      },
    );
    const observeBottom = document.getElementById('observeBottom');
    if (observeBottom) {
      this.observer.observe(observeBottom);
    }
  },
  computed: {
    ...mapGetters('collection', [
      'getCollectionProducts',
      'getCollectionMasterFilters',
    ]),
    finalFilters() {
      const { getCollectionMasterFilters, getCollectionProducts } = this;
      let filters;
      if (getCollectionMasterFilters.length) {
        filters = getCollectionMasterFilters.map((filter) => {
          let filterArr = [];
          if (filter.filters) {
            const splitArr = filter.filters.split(' | ');
            if (splitArr.length > 0) {
              splitArr.forEach((item) => {
                const data = {
                  name: item,
                };
                const foundProducts = getCollectionProducts.filter(
                  (product) => {
                    if (
                      product.product_category &&
                      product.product_category.length > 0
                    ) {
                      const lowerCaseTags = product.product_category.map(
                        (tag) => tag.toLowerCase(),
                      );
                      if (lowerCaseTags.includes(item.toLowerCase())) {
                        return true;
                      } else {
                        return false;
                      }
                    }
                  },
                );
                if (foundProducts && foundProducts.length > 0) {
                  data.count = foundProducts.length;
                } else {
                  data.count = 0;
                }
                filterArr.push(data);
              });
            }
          }
          return {
            isFilterEnable: filter?.filter_enable,
            heading: filter?.filter_heading,
            // eslint-disable-next-line camelcase
            filter_type: filter?.filter_type,
            filters: filterArr && filterArr.length > 0 ? filterArr : [],
          };
        });
      }
      return filters ? filters : [];
    },
    filteredProducts() {
      const {
        getCollectionProducts,
        selectedCategory,
        selectedDietaryPreferences,
      } = this;

      if (getCollectionProducts.length > 0) {
        if (
          selectedCategory.length === 0 &&
          selectedDietaryPreferences.length === 0
        ) {
          return getCollectionProducts;
        }

        const productFilteredByCategory = getCollectionProducts.filter(
          (product) => {
            if (
              product.product_category &&
              product.product_category.length > 0
            ) {
              const matched = product.product_category.some((tag) =>
                selectedCategory.includes(tag.toLowerCase()),
              );
              return matched ? true : false;
            } else {
              return false;
            }
          },
        );

        if (
          (productFilteredByCategory.length > 0 &&
            selectedDietaryPreferences.length === 0) ||
          (productFilteredByCategory.length === 0 &&
            selectedDietaryPreferences.length === 0) ||
          (productFilteredByCategory.length === 0 &&
            selectedDietaryPreferences.length > 0 &&
            selectedCategory.length !== 0)
        ) {
          return productFilteredByCategory;
        } else if (
          selectedCategory.length === 0 &&
          selectedDietaryPreferences.length > 0
        ) {
          const productFilteredByDietaryPref = getCollectionProducts.filter(
            (product) => {
              if (
                product.product_dietary_preferences &&
                product.product_dietary_preferences.length > 0
              ) {
                const matched = product.product_dietary_preferences.some(
                  (tag) =>
                    selectedDietaryPreferences.includes(tag.toLowerCase()),
                );
                return matched ? true : false;
              } else {
                return false;
              }
            },
          );
          return productFilteredByDietaryPref &&
          productFilteredByDietaryPref.length > 0
            ? productFilteredByDietaryPref
            : [];
        } else if (
          productFilteredByCategory.length > 0 &&
          selectedDietaryPreferences.length > 0
        ) {
          const finalFilter = productFilteredByCategory.filter((product) => {
            if (
              product.product_dietary_preferences &&
              product.product_dietary_preferences.length > 0
            ) {
              const matched = product.product_dietary_preferences.some((tag) =>
                selectedDietaryPreferences.includes(tag.toLowerCase()),
              );
              return matched ? true : false;
            } else {
              return false;
            }
          });
          return finalFilter && finalFilter.length > 0 ? finalFilter : [];
        } else {
          return getCollectionProducts;
        }
      } else {
        return [];
      }
    },
    sortedProducts() {
      const { filteredProducts, selectedSort } = this;

      if (filteredProducts.length > 0) {
        let products = [ ...filteredProducts ];
        if (selectedSort.value === 'best_sellers') {
          return filteredProducts;
        } else if (selectedSort.value === 'low_to_high') {
          return products.sort(
            (a, b) => a?.variants[0].price - b?.variants[0].price,
          );
        } else if (selectedSort.value === 'high_to_low') {
          return products.sort(
            (a, b) => b?.variants[0].price - a?.variants[0].price,
          );
        } else if (selectedSort.value === 'newest') {
          return products.sort((a, b) => {
            const dateA = new Date(a.published_at);
            const dateB = new Date(b.published_at);
            return dateB.getTime() - dateA.getTime();
          });
        } else {
          return filteredProducts;
        }
      } else {
        return filteredProducts;
      }
    },
    totalResults() {
      return Object.keys(this.filteredProducts).length;
    },
    paginatedOrders() {
      const { getCollectionProducts } = this;
      return getCollectionProducts.length > 8
        ? this.sortedProducts.slice(0, this.currentPage * this.maxPerPage)
        : this.sortedProducts;
    },
    isMobileFilterApplied() {
      const { selectedCategory, selectedDietaryPreferences } = this;
      if (
        selectedCategory.length > 0 ||
        selectedDietaryPreferences.length > 0
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
  methods: {
    ...mapActions('collection', [
      'addProductsToCollectionArray',
    ]),
    loadMore() {
      const { sortedProducts, paginatedOrders } = this;
      if (sortedProducts.length === paginatedOrders.length) {
        return;
      }
      this.currentPage += 1;
    },
    addFilter(e, filterType, tag) {
      this.currentPage = 1;
      if (!this.isMobile) {
        const productSection = document.querySelector('.js-filter-desktop');
        const y = productSection.getBoundingClientRect().top + window.scrollY - 130;
        setTimeout(() => {
          window.scrollTo({ top: y, behavior: 'smooth' });
        }, 10);
        if (e.target.checked) {
          if (filterType === 'category') {
            this.selectedCategory.push(tag.toLowerCase());
          } else if (filterType === 'dietary_preferences') {
            this.selectedDietaryPreferences.push(tag.toLowerCase());
          }
        } else {
          if (filterType === 'category') {
            this.selectedCategory = this.selectedCategory.filter(
              (selectedFilter) =>
                selectedFilter.toLowerCase() !== tag.toLowerCase(),
            );
          } else if (filterType === 'dietary_preferences') {
            this.selectedDietaryPreferences =
              this.selectedDietaryPreferences.filter(
                (selectedFilter) =>
                  selectedFilter.toLowerCase() !== tag.toLowerCase(),
              );
          }
        }
      } else {
        if (e.target.checked) {
          if (filterType === 'category') {
            this.selectedCategoryMobile.push(tag.toLowerCase());
          } else if (filterType === 'dietary_preferences') {
            this.selectedDietaryPreferencesMobile.push(tag.toLowerCase());
          }
        } else {
          if (filterType === 'category') {
            this.selectedCategoryMobile = this.selectedCategoryMobile.filter(
              (selectedFilter) =>
                selectedFilter.toLowerCase() !== tag.toLowerCase(),
            );
          } else if (filterType === 'dietary_preferences') {
            this.selectedDietaryPreferencesMobile =
              this.selectedDietaryPreferencesMobile.filter(
                (selectedFilter) =>
                  selectedFilter.toLowerCase() !== tag.toLowerCase(),
              );
          }
        }
      }
    },
    openSortDropdown() {
      this.isSortDropdownOpen = !this.isSortDropdownOpen;
    },
    closeSortDropdown() {
      this.isSortDropdownOpen = false;
    },
    openMobSortDropdown() {
      this.isMobSortDropdownOpen = !this.isMobSortDropdownOpen;
    },
    closeMobSortDropdown() {
      this.isMobSortDropdownOpen = false;
    },
    setSortFilter(sort) {
      this.selectedSort = sort;
    },
    getWindowWidth() {
      this.windowWidth = window.innerWidth;

      if (this.windowWidth < 991) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    },
    showMobileFilter() {
      this.isMobileFilterVisible = true;
      document.body.style.overflow = 'hidden';
    },
    closeMobileFilter() {
      const { selectedDietaryPreferences, selectedCategory } = this;
      const allFilters = [ ...selectedDietaryPreferences, ...selectedCategory ];
      //Reset the selected filters on Mobile
      this.selectedCategoryMobile = this.selectedCategoryMobile.filter((item) =>
        selectedCategory.includes(item),
      );
      this.selectedDietaryPreferencesMobile =
        this.selectedDietaryPreferencesMobile.filter((item) =>
          selectedDietaryPreferences.includes(item),
        );

      const getFilerChecks = document.querySelectorAll(
        '.collectionFilterSection__checkbox--mobile',
      );
      if (getFilerChecks.length > 0) {
        getFilerChecks.forEach((check) => {
          const filterValue = check.dataset.filter;
          if (allFilters.includes(filterValue.toLowerCase())) {
            check.checked = true;
          } else {
            check.checked = false;
          }
        });
      }
      this.isMobileFilterVisible = false;
      document.body.style.overflow = 'auto';
      const drawerTrigger = document.querySelector(
        '[data-sl="open_mobile_filter"]',
      );
      if (drawerTrigger) {
        drawerTrigger.focus();
      }
    },
    applyMobileFilter() {
      const {
        selectedDietaryPreferencesMobile,
        selectedCategoryMobile,
        closeMobileFilter,
      } = this;
      this.selectedCategory.length = 0;
      this.selectedCategory = [ ...selectedCategoryMobile ];
      this.selectedDietaryPreferences.length = 0;
      this.selectedDietaryPreferences = [ ...selectedDietaryPreferencesMobile ];
      closeMobileFilter();
    },
    clearSelectedMobileFilter() {
      const getFilerChecks = document.querySelectorAll(
        '.collectionFilterSection__checkbox--mobile',
      );
      if (getFilerChecks.length > 0) {
        getFilerChecks.forEach((check) => {
          check.checked = false;
        });
      }
      this.selectedDietaryPreferencesMobile = [];
      this.selectedCategoryMobile = [];
      this.selectedCategory = [];
      this.selectedDietaryPreferences = [];
      this.closeMobileFilter();
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    this.observer.disconnect();
  },
};
</script>

