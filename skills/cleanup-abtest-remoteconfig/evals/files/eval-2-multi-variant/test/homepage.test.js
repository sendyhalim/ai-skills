const { renderBanner } = require('../src/homepage');
const { __setVariantForTest } = require('../src/experiments');

describe('renderBanner', () => {
  test('control variant shows welcome back copy', () => {
    __setVariantForTest('homepage_banner_experiment', 'control');
    const banner = renderBanner('user-1');
    expect(banner.headline).toBe('Welcome back');
    expect(banner.ctaText).toBe('Continue Shopping');
  });

  test('variant A shows 20% off headline', () => {
    __setVariantForTest('homepage_banner_experiment', 'variant_a');
    const banner = renderBanner('user-1');
    expect(banner.headline).toBe('Save 20% on your first order');
  });

  test('variant B shows free shipping headline', () => {
    __setVariantForTest('homepage_banner_experiment', 'variant_b');
    const banner = renderBanner('user-1');
    expect(banner.headline).toBe('Free shipping this week');
  });

  test('variant C shows new arrivals headline', () => {
    __setVariantForTest('homepage_banner_experiment', 'variant_c');
    const banner = renderBanner('user-1');
    expect(banner.headline).toBe('New arrivals just dropped');
  });
});
