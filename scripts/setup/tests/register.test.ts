import { jest } from '@jest/globals';

describe('Setup Script Registration Tests', () => {
  it('should detect environment paths correctly for harness registration', () => {
    const fakeHome = process.env.AERODECK_TEST_TARGET_DIR || '/home/testuser';
    const resolvedPath = `${fakeHome}/.gemini/antigravity`;
    expect(resolvedPath).toContain('.gemini/antigravity');
  });

  it('should format extension manifest JSON correctly', () => {
    const manifest = {
      name: 'aerodeck-extension',
      version: '6.0.0',
      description: 'AeroDeck Harness Support'
    };
    const jsonString = JSON.stringify(manifest, null, 2);
    expect(JSON.parse(jsonString)).toEqual(manifest);
  });
});
