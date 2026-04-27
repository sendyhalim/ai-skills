const { getConfigValue } = require('./remoteConfig');

function validateUpload(file) {
  const maxBytes = getConfigValue('limits.max_upload_size_bytes');
  if (file.size > maxBytes) {
    return { ok: false, reason: 'file_too_large', limit: maxBytes };
  }
  return { ok: true };
}

function requestTimeoutMs() {
  return getConfigValue('limits.max_request_timeout_ms');
}

module.exports = { validateUpload, requestTimeoutMs };
