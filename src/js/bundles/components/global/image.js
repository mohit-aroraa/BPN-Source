const IO = new IntersectionObserver(
  (ObserverEntry) => {
    ObserverEntry.forEach((entry) => {
      const { isIntersecting, target } = entry;
      if (isIntersecting) {
        const isSvg = target.dataset.svg === 'true';

        if (!isSvg) {
          const source = target.querySelector('source');
          const srcset = source.dataset.srcset;
          source.srcset = srcset;
        } else {
          const img = target.querySelector('img');
          img.src = img.dataset.src;
        }

        target.dataset.loaded = true;
        IO.unobserve(target);
      }
    });
  },
  {
    rootMargin: '10px',
    threshold: 0,
  },
);

((w) => {
  const lazyImages = (window.lazyImages = window.lazyImages || []);

  function lazyImageFn(el) {
    const loaded = el.dataset.loaded;
    if (loaded !== 'true') {
      IO.observe(el);
    }
  }

  w.lazyImageFn = lazyImageFn;
  lazyImages.forEach((el) => lazyImageFn(el));
})(window);
