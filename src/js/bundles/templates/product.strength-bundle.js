import 'Styles/new/templates/product.strength-bundle.scss';
import Swiper from 'swiper';
import { FreeMode, Thumbs, Pagination, Navigation } from 'swiper';
import cartMethods from '../utils/helpers/cart-helper';
import { EVENTS } from '../../new/vue/cart/constants';

const { post } = cartMethods;

const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const root = () => qs('.strength-bundle-pdp');

// Variant data injected by Liquid into window.BPN.bundleProduct
const bundleProduct = () => window.BPN?.bundleProduct;

// ─── Gallery ──────────────────────────────────────────────────────────────────

function initGallery() {
  const thumbEl = qs('.strength-bundle-pdp__gallery-thumbnail');
  const mainEl  = qs('.strength-bundle-pdp__gallery-main');
  if (!thumbEl || !mainEl || thumbEl.dataset.sbbReady) return;
  thumbEl.dataset.sbbReady = '1';

  const thumbSwiper = new Swiper(thumbEl, {
    modules: [FreeMode],
    direction: 'vertical',
    slidesPerView: 'auto',
    spaceBetween: 12,
    freeMode: true,
    watchSlidesProgress: true,
    slideToClickedSlide: true,
  });

  new Swiper(mainEl, {
    modules: [Thumbs, Pagination, Navigation],
    slidesPerView: 1,
    thumbs: { swiper: thumbSwiper },
    pagination: {
      el: '.strength-bundle-pdp__gallery-pagination',
      clickable: true,
    },
    navigation: {
      prevEl: '.swiper-button-prev',
      nextEl: '.swiper-button-next',
    },
    breakpoints: {
      // Mobile: peek at next slide
      0: {
        slidesPerView: 1.1,
        spaceBetween: 10,
      },
      // Desktop: single full slide, no peek
      768: {
        slidesPerView: 1,
        spaceBetween: 0,
      },
    },
  });
}

// ─── Variant matching ─────────────────────────────────────────────────────────
// selections = array indexed by option position, value = the chosen string
// Returns the first variant whose options array matches selections exactly.

function findVariant(selections) {
  return bundleProduct()?.variants?.find(v =>
    selections.every((val, i) => val === null || v.options[i] === val)
  ) ?? null;
}

// Read current selections from the DOM (the is-selected flavor per option)
function readSelections() {
  const components = qsa('.sbb__component[data-option-index]', root());
  const selections = new Array(components.length).fill(null);
  components.forEach(comp => {
    const idx = parseInt(comp.dataset.optionIndex, 10);
    const sel = qs('.sbb__flavor.is-selected', comp);
    if (sel) selections[idx] = sel.dataset.value;
  });
  return selections;
}

// Sync ATC button variant-id and availability with current selections
function syncATC() {
  const btn = qs('.sbb__atc-btn', root());
  if (!btn) return;

  const selections = readSelections();
  const allPicked  = selections.every(v => v !== null);
  const variant    = allPicked ? findVariant(selections) : null;

  btn.classList.toggle('is-unavailable', allPicked && variant && !variant.available);
  btn.classList.toggle('is-incomplete',  !allPicked);

  if (variant) {
    btn.dataset.variantId = variant.id;
    btn.textContent = ''; // replaced below
  }

  // Re-render label + prices (keeps them in sync after selection changes)
  renderATCLabel(btn, variant);
}

function renderATCLabel(btn, variant) {
  const bp = bundleProduct();
  const labelEl   = document.createElement('span');
  labelEl.className = 'sbb__atc-label';

  if (variant && !variant.available) {
    labelEl.textContent = 'SOLD OUT';
  } else {
    labelEl.textContent = 'ADD TO CART';
  }

  btn.innerHTML = '';
  btn.appendChild(labelEl);

  if (bp) {
    const pricesEl = document.createElement('span');
    pricesEl.className = 'sbb__atc-prices';
    if (bp.compareAtPrice > bp.price) {
      const s = document.createElement('s');
      s.className = 'sbb__atc-compare';
      s.textContent = formatMoney(bp.compareAtPrice);
      pricesEl.appendChild(s);
    }
    const priceEl = document.createElement('span');
    priceEl.className = 'sbb__atc-price';
    priceEl.textContent = formatMoney(bp.price);
    pricesEl.appendChild(priceEl);
    btn.appendChild(pricesEl);
  }
}

function formatMoney(cents) {
  return '$' + (cents / 100).toFixed(2).replace(/\.00$/, '');
}

// ─── Flavor selection ─────────────────────────────────────────────────────────

function initFlavorSelection() {
  qsa('.sbb__component', root()).forEach(comp => {
    const flavors = qsa('.sbb__flavor', comp);
    flavors.forEach(btn => {
      btn.addEventListener('click', () => {
        flavors.forEach(f => {
          f.classList.remove('is-selected');
          f.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('is-selected');
        btn.setAttribute('aria-checked', 'true');
        comp.classList.remove('is-incomplete');
        syncATC();
      });
    });
  });
}

// ─── Quantity selector ────────────────────────────────────────────────────────

function initQty() {
  const qty = qs('.sbb__qty', root());
  if (!qty || qty.dataset.sbbReady) return;
  qty.dataset.sbbReady = '1';

  const valueEl = qs('.sbb__qty-value', qty);
  const prevBtn = qs('[data-dir="prev"]', qty);

  qty.addEventListener('click', e => {
    const btn = e.target.closest('[data-dir]');
    if (!btn) return;
    const current = parseInt(valueEl.textContent || '1', 10) || 1;
    const next = btn.dataset.dir === 'next' ? current + 1 : Math.max(1, current - 1);
    valueEl.textContent = next;
    prevBtn.classList.toggle('is-disabled', next <= 1);
    prevBtn.toggleAttribute('disabled', next <= 1);
  });
}

// ─── Add to cart ──────────────────────────────────────────────────────────────

async function handleATC(e) {
  const btn        = e.currentTarget;
  const variantId  = parseInt(btn.dataset.variantId, 10);
  const optionCount = parseInt(btn.dataset.optionCount, 10) || 0;
  const qty        = parseInt(qs('.sbb__qty-value', root())?.textContent || '1', 10) || 1;

  // Validate: highlight any component with no selection
  const selections = readSelections();
  const incomplete = selections.slice(0, optionCount).some(v => v === null);
  if (incomplete || !variantId) {
    qsa('.sbb__component', root()).forEach((c, i) => {
      c.classList.toggle('is-incomplete', selections[i] === null);
    });
    return;
  }

  const variant = findVariant(selections);
  if (!variant?.available) return;

  btn.disabled = true;
  try {
    await post('add', { id: variant.id, quantity: qty });
    document.dispatchEvent(new CustomEvent(EVENTS.ITEM_ADDED, {
      detail: { id: variant.id },
    }));
  } finally {
    btn.disabled = false;
  }
}

function initATC() {
  const atcBtn = qs('.sbb__atc-btn', root());
  if (!atcBtn || atcBtn.dataset.sbbReady) { syncATC(); return; }
  atcBtn.dataset.sbbReady = '1';
  atcBtn.addEventListener('click', handleATC);
  syncATC(); // set initial state based on Liquid-pre-selected values
}

// ─── Product info accordions ──────────────────────────────────────────────────

function initAccordions() {
  qsa('[data-sbb-accordion]', root()).forEach(accordion => {
    const trigger = qs('.sbb__accordion-trigger', accordion);
    if (!trigger || trigger.dataset.sbbReady) return;
    trigger.dataset.sbbReady = '1';

    trigger.addEventListener('click', () => {
      const isOpen = accordion.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

function init() {
  initGallery();
  initFlavorSelection();
  initQty();
  initATC();
  initAccordions();
}

if (document.querySelector('.strength-bundle-pdp')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
