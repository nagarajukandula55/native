export const pageView = (url) => {
  window.gtag("event", "page_view", {
    page_path: url,
  });
};

export const viewProduct = (product) => {
  window.gtag("event", "view_item", {
    currency: "INR",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.title,
        price: product.price,
      },
    ],
  });
};

export const addToCart = (product) => {
  window.gtag("event", "add_to_cart", {
    currency: "INR",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.title,
        price: product.price,
      },
    ],
  });
};

export const purchase = (order) => {
  window.gtag("event", "purchase", {
    transaction_id: order.id,
    value: order.total,
    currency: "INR",
  });
};
