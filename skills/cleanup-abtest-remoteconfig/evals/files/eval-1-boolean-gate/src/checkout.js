const { isFeatureEnabled } = require('./flags');

function calculateShipping(cart) {
  if (isFeatureEnabled('new_checkout_flow')) {
    // Tiered shipping: free above $50, flat $5 otherwise.
    return cart.subtotal >= 50 ? 0 : 5;
  }
  // Legacy shipping: flat $7 always.
  return 7;
}

function renderCheckoutPage(cart) {
  if (isFeatureEnabled('new_checkout_flow')) {
    return {
      template: 'checkout-v2',
      shipping: calculateShipping(cart),
      showPromoField: true,
    };
  }
  return {
    template: 'checkout-v1',
    shipping: calculateShipping(cart),
    showPromoField: false,
  };
}

module.exports = { calculateShipping, renderCheckoutPage };
