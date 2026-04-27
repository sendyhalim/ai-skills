const ASSIGNMENTS = {
  homepage_banner_experiment: 'control',
};

function getVariant(experimentName, userId) {
  return ASSIGNMENTS[experimentName] || 'control';
}

function __setVariantForTest(experimentName, variant) {
  ASSIGNMENTS[experimentName] = variant;
}

module.exports = { getVariant, __setVariantForTest };
