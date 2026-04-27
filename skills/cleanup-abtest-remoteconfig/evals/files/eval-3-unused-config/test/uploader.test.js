const { validateUpload, requestTimeoutMs } = require('../src/uploader');
const { __setConfigForTest } = require('../src/remoteConfig');

beforeEach(() => {
  __setConfigForTest({
    limits: {
      max_upload_size_bytes: 10485760,
      max_upload_size_override: 52428800,
      max_request_timeout_ms: 30000,
    },
  });
});

describe('validateUpload', () => {
  test('accepts file at the limit', () => {
    expect(validateUpload({ size: 10485760 }).ok).toBe(true);
  });

  test('rejects file over the limit', () => {
    const result = validateUpload({ size: 10485761 });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('file_too_large');
  });
});

describe('requestTimeoutMs', () => {
  test('reads the configured timeout', () => {
    expect(requestTimeoutMs()).toBe(30000);
  });
});
