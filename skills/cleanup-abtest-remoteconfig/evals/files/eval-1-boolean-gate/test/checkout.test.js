const { calculateShipping, renderCheckoutPage } = require('../src/checkout');
const { __setFlagForTest } = require('../src/flags');

describe('calculateShipping', () => {
  test('legacy flow charges flat $7', () => {
    __setFlagForTest('new_checkout_flow', false);
    expect(calculateShipping({ subtotal: 20 })).toBe(7);
    expect(calculateShipping({ subtotal: 100 })).toBe(7);
  });

  test('new flow is free above $50 threshold', () => {
    __setFlagForTest('new_checkout_flow', true);
    expect(calculateShipping({ subtotal: 49 })).toBe(5);
    expect(calculateShipping({ subtotal: 50 })).toBe(0);
    expect(calculateShipping({ subtotal: 200 })).toBe(0);
  });
});

describe('renderCheckoutPage', () => {
  test('legacy template used when flag off', () => {
    __setFlagForTest('new_checkout_flow', false);
    const page = renderCheckoutPage({ subtotal: 100 });
    expect(page.template).toBe('checkout-v1');
    expect(page.showPromoField).toBe(false);
  });

  test('v2 template used when flag on', () => {
    __setFlagForTest('new_checkout_flow', true);
    const page = renderCheckoutPage({ subtotal: 100 });
    expect(page.template).toBe('checkout-v2');
    expect(page.showPromoField).toBe(true);
  });
});
