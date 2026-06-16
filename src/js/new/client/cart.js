export const fetchCollection = async (handle) => {
  const res = await fetch(`/collections/${handle}/products.json?limit=10`);

  const data = await res.json();

  return data.products;
};

export const fetchProductRecommendations = async (id) => {
  const path = window.Shopify.routes.root + `recommendations/products.json?product_id=${id}&limit=4&intent=related`;

  const res = await fetch(path);

  return res.json();
};
