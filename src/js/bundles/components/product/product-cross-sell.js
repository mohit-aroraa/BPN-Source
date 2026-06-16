/**
 * Product Cross-sell Component
 * Handles product replacement and cart functionality for cross-sell sections
 */
const initCrossSell = () => {
  const runCrossSell = () => {
    // ---------- Utils ----------
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const toStr = (v) => v == null ? '' : String(v);
    const isAdded = (p) => p?.addProduct === true || p?.addProduct === 'true';

    function toCurrency(value) {
      if (value == null) return '$0.00';
      const raw = String(value).trim();
      const n = Number(raw.replace(',', ''));
      if (!isFinite(n)) return '$0.00';
      const inDollars = raw.includes('.') || n < 1000;
      return '$' + (inDollars ? n : (n / 100)).toFixed(2);
    }

    function applyVariantUI(crossSellItem, variant) {
      const addButton = $('.add-to-cart-btn', crossSellItem);
      const priceEl = $('.price', crossSellItem);

      if (addButton && variant) {
        addButton.dataset.variantId = toStr(variant.id);
        addButton.disabled = !Boolean(variant.available);
        addButton.textContent = variant.available ? 'ADD' : 'SOLD OUT';
      }
      if (priceEl && variant && variant.price != null) {
        priceEl.textContent = toCurrency(variant.price);
      }
    }

    // Check if cross-sell container exists
    const crossSellContainer = $('.cross-sell-products');
    if (!crossSellContainer) return;

    let allProducts = [];
    const productsEl = document.getElementById('cross-sell-products-data');

    if (productsEl) {
      try {
        allProducts = JSON.parse(productsEl.textContent) || [];
      } catch (e) {
        console.error('Error parsing products:', e);
      }
    }

    allProducts.forEach(p => {
      p.id = toStr(p.id);
      p.addProduct = isAdded(p);
      if (Array.isArray(p.variants)) {
        p.variants.forEach(v => { v.id = toStr(v.id); });
      }
    });

    const idxById = new Map(allProducts.map((p, i) => [p.id, i]));

    function getCurrentlyShownIds() {
      return $$('.cross-sell-add-btn').map(btn => toStr(btn.dataset.productId));
    }

    function getNextProduct(currentProductId) {
      const currentIdx = idxById.get(toStr(currentProductId));
      if (currentIdx == null || allProducts.length <= 1) return null;

      const shown = new Set(getCurrentlyShownIds());

      for (let step = 1; step < allProducts.length; step++) {
        const nextIdx = (currentIdx + step) % allProducts.length;
        const next = allProducts[nextIdx];
        if (isAdded(next)) continue;
        if (shown.has(toStr(next.id))) continue;
        if (toStr(next.id) === toStr(currentProductId)) continue;
        return next;
      }
      return null;
    }

    function rebuildVariantSelector(crossSellItem, newProduct) {
      const info = $('.product-info', crossSellItem);
      if (!info) return;

      const oldWrapper = $('.select-wrapper', info);
      if (oldWrapper) oldWrapper.remove();

      const oldSelect = $('.variant-selector', info);
      if (oldSelect) oldSelect.remove();

      const label = $('.product-variant', crossSellItem);
      const variants = Array.isArray(newProduct.variants) ? newProduct.variants : [];
      const firstAvailable = variants.find(v => v.available) || variants[0];

      if (variants.length > 1) {
        const wrapper = document.createElement('div');
        wrapper.className = 'select-wrapper';
        const select = document.createElement('select');
        select.className = 'variant-selector';
        select.dataset.productId = toStr(newProduct.id);

        const frag = document.createDocumentFragment();
        for (const v of variants) {
          const opt = document.createElement('option');
          opt.value = toStr(v.id);
          opt.dataset.price = toStr(v.price);
          opt.textContent = v.title + (v.available ? '' : ' - Sold Out');
          if (!v.available) opt.disabled = true;
          frag.appendChild(opt);
        }
        select.appendChild(frag);
        wrapper.appendChild(select);

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "16");
        svg.setAttribute("height", "16");
        svg.setAttribute("viewBox", "0 0 16 16");
        svg.setAttribute("fill", "none");
        svg.setAttribute("class", "select-arrow");

        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", "M8 9.28736L12.6669 4.53928L14 5.8956L8 12L2 5.8956L3.33312 4.53928L8 9.28736Z");
        path.setAttribute("fill", "black");

        svg.appendChild(path);
        wrapper.appendChild(svg);

        info.appendChild(wrapper);

        if (firstAvailable) {
          select.value = toStr(firstAvailable.id);
          applyVariantUI(crossSellItem, firstAvailable);
        }

        if (label) label.textContent = `${variants.length} OPTIONS`;
      } else {
        if (firstAvailable) {
          applyVariantUI(crossSellItem, firstAvailable);
          if (label) {
            label.textContent = (newProduct.variantInfo
              ? newProduct.variantInfo
              : (firstAvailable.title || 'ORIGINAL')).toUpperCase();
          }
        } else {
          const addButton = $('.add-to-cart-btn', crossSellItem);
          if (addButton) {
            addButton.disabled = true;
            addButton.textContent = 'SOLD OUT';
          }
        }
      }
    }

    function updateProduct(crossSellItem, newProduct) {
      const img = $('.product-image img', crossSellItem);
      if (img && newProduct.image) img.src = newProduct.image;

      const title = $('.product-title', crossSellItem);
      if (title && newProduct.title) {
        title.textContent = newProduct.title.toUpperCase();
        title.setAttribute('title', newProduct.title);
      }

      const type = $('.product-type', crossSellItem);
      if (type && newProduct.filterGoal) type.textContent = newProduct.filterGoal.toUpperCase();

      const variantLbl = $('.product-variant', crossSellItem);
      if (variantLbl && newProduct.variantInfo) {
        variantLbl.textContent = newProduct.variantInfo.toUpperCase();
      }

      const priceEl = $('.price', crossSellItem);
      if (priceEl && newProduct.price != null) {
        priceEl.textContent = toCurrency(newProduct.price);
      }

      const btn = $('.add-to-cart-btn', crossSellItem);
      if (btn) {
        btn.dataset.variantId = toStr(newProduct.variantId);
        btn.dataset.productId = toStr(newProduct.id);
      }

      rebuildVariantSelector(crossSellItem, newProduct);
    }

    // Event listeners
    crossSellContainer.addEventListener('change', (e) => {
      const select = e.target.closest('.variant-selector');
      if (!select) return;

      const option = select.options[select.selectedIndex];
      const crossSellItem = select.closest('.cross-sell-item');
      const variant = {
        id: option.value,
        price: option.dataset.price,
        available: !option.disabled,
        title: option.textContent.replace(' - Sold Out', '')
      };
      applyVariantUI(crossSellItem, variant);
    });

    crossSellContainer.addEventListener('click', async (e) => {
      const button = e.target.closest('.cross-sell-add-btn');
      if (!button) return;

      const variantId = toStr(button.dataset.variantId);
      const currentProductId = toStr(button.dataset.productId);
      const crossSellItem = button.closest('.cross-sell-item');
      if (!variantId || !crossSellItem) return;

      button.textContent = 'ADDING...';
      button.disabled = true;

      try {
        let nextProduct = getNextProduct(currentProductId);

        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
        });

        const idx = idxById.get(currentProductId);
        if (idx != null) {
          allProducts[idx].addProduct = true;
        }

        if (nextProduct && (isAdded(nextProduct) || getCurrentlyShownIds().includes(toStr(nextProduct.id)))) {
          nextProduct = getNextProduct(currentProductId);
        }

        if (nextProduct) {
          updateProduct(crossSellItem, nextProduct);
        } else {
          button.textContent = 'ADDED!';
        }

        if (window.theme?.updateCartCount) window.theme.updateCartCount();
        if (window.theme?.openCartDrawer) setTimeout(() => window.theme.openCartDrawer(), 500);

        setTimeout(() => {
          button.textContent = 'ADD';
          button.style.backgroundColor = '';
          button.disabled = false;
        }, 2000);
      } catch (err) {
        console.error('Error:', err);
        button.textContent = 'ERROR';
        button.style.backgroundColor = '#dc3545';
        setTimeout(() => {
          button.textContent = 'ADD';
          button.style.backgroundColor = '';
          button.disabled = false;
        }, 2000);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCrossSell);
  } else {
    runCrossSell();
  }
};

// Make it available globally if needed
window.initCrossSell = initCrossSell;

const initProductCrossSell = () => {
  initCrossSell();
};

export default initProductCrossSell;