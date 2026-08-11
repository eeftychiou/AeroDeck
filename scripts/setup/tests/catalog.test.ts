import { jest } from '@jest/globals';
import { normalizeCatalog, getProviderDisplayName, getModelDisplayName, CANONICAL_PROVIDERS, fetchLiveModels } from '../src/catalog.js';

describe('Hermes Model Catalog & Canonical Providers Tests', () => {
  it('should export CANONICAL_PROVIDERS list matching hermes_cli/models.py', () => {
    expect(CANONICAL_PROVIDERS.length).toBeGreaterThanOrEqual(12);
    const openrouter = CANONICAL_PROVIDERS.find(p => p.slug === 'openrouter');
    expect(openrouter).toBeDefined();
    expect(openrouter?.defaultBaseURL).toBe('https://openrouter.ai/api/v1');

    const custom = CANONICAL_PROVIDERS.find(p => p.slug === 'custom');
    expect(custom).toBeDefined();
    expect(custom?.label).toBe('Custom Endpoint');
  });

  it('should extract provider display name correctly from canonical providers', () => {
    const name = getProviderDisplayName('openrouter');
    expect(name).toBe('OpenRouter');
    expect(name).not.toBeUndefined();
  });

  it('should handle live model fetching gracefully when endpoint is unreachable', async () => {
    const models = await fetchLiveModels('http://127.0.0.1:99999/v1');
    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBe(0);
  });
});
