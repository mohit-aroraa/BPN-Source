const memoryCache = new Map();

export const withCache = (fetchFunction, cachePrefix) => {
  return async (handle) => {
    const cacheKey = `${cachePrefix}-${handle}`;

    // Step 1: Check in-memory cache
    if (memoryCache.has(cacheKey)) {
      // Fetch fresh data in background while returning cached data instantly
      fetchFunction(handle).then((freshData) => {
        memoryCache.set(cacheKey, freshData);
        sessionStorage.setItem(cacheKey, JSON.stringify(freshData));
      });

      return memoryCache.get(cacheKey);
    }

    // Step 2: Check sessionStorage
    const storedData = sessionStorage.getItem(cacheKey);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      memoryCache.set(cacheKey, parsedData);

      // Fetch fresh data in the background
      fetchFunction(handle).then((freshData) => {
        memoryCache.set(cacheKey, freshData);
        sessionStorage.setItem(cacheKey, JSON.stringify(freshData));
      });

      return parsedData;
    }

    // Step 3: No cached data, wait for fetch
    const freshData = await fetchFunction(handle);
    memoryCache.set(cacheKey, freshData);
    sessionStorage.setItem(cacheKey, JSON.stringify(freshData));

    return freshData;
  };
};
