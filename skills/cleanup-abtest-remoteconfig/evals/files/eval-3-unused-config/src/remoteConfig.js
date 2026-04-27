const fs = require('fs');
const path = require('path');

let CACHE = null;

function loadRemoteConfig() {
  if (CACHE) return CACHE;
  const raw = fs.readFileSync(
    path.join(__dirname, '..', 'config', 'remote-config.yaml'),
    'utf8'
  );
  CACHE = parseSimpleYaml(raw);
  return CACHE;
}

function getConfigValue(keyPath) {
  const cfg = loadRemoteConfig();
  return keyPath.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), cfg);
}

function __setConfigForTest(cfg) {
  CACHE = cfg;
}

// Minimal YAML parser for this fixture (flat and one-level nested keys only).
function parseSimpleYaml(raw) {
  const out = {};
  let section = null;
  for (const rawLine of raw.split('\n')) {
    const line = rawLine.replace(/#.*$/, '').trimEnd();
    if (!line.trim()) continue;
    if (!line.startsWith(' ')) {
      const [k] = line.split(':');
      section = k.trim();
      out[section] = {};
    } else {
      const [k, v] = line.trim().split(':');
      const value = v.trim();
      out[section][k.trim()] =
        value === 'true' ? true :
        value === 'false' ? false :
        /^\d+$/.test(value) ? Number(value) :
        value;
    }
  }
  return out;
}

module.exports = { loadRemoteConfig, getConfigValue, __setConfigForTest };
