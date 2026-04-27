const { getVariant } = require('./experiments');

function renderBanner(userId) {
  const variant = getVariant('homepage_banner_experiment', userId);

  switch (variant) {
    case 'variant_a':
      return {
        headline: 'Save 20% on your first order',
        ctaText: 'Shop Now',
        background: '#FDE68A',
      };
    case 'variant_b':
      return {
        headline: 'Free shipping this week',
        ctaText: 'Browse Deals',
        background: '#A7F3D0',
      };
    case 'variant_c':
      return {
        headline: 'New arrivals just dropped',
        ctaText: 'See What\'s New',
        background: '#BFDBFE',
      };
    case 'control':
    default:
      return {
        headline: 'Welcome back',
        ctaText: 'Continue Shopping',
        background: '#E5E7EB',
      };
  }
}

module.exports = { renderBanner };
