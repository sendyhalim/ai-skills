// Central feature flag registry.
// Reads flag state from the in-memory store seeded at boot from remote config.

const STORE = {
  new_checkout_flow: false,
  dark_mode_enabled: true,
  referral_bonus_v2: false,
};

function isFeatureEnabled(name) {
  if (!(name in STORE)) {
    throw new Error(`Unknown feature flag: ${name}`);
  }
  return STORE[name];
}

function __setFlagForTest(name, value) {
  STORE[name] = value;
}

module.exports = { isFeatureEnabled, __setFlagForTest };
