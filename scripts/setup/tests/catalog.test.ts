import { jest } from '@jest/globals';
import { normalizeCatalog, getProviderDisplayName, getModelDisplayName } from '../src/catalog.js';

describe('Hermes Model Catalog Normalization & Navigation Tests', () => {
  const onlineHermesRawCatalog = {
    version: 1,
    updated_at: '2026-08-03T22:03:15Z',
    metadata: {
      source: 'hermes-agent repo'
    },
    providers: {
      openrouter: {
        metadata: {
          display_name: 'OpenRouter',
          note: 'Curated OpenRouter models'
        },
        models: [
          { id: 'anthropic/claude-3.5-sonnet', description: 'Sonnet model' },
          { id: 'deepseek/deepseek-r1', description: 'Reasoning model' }
        ]
      },
      nous: {
        metadata: {
          display_name: 'Nous Portal'
        },
        models: [
          { id: 'nous/hermes-3-llama-3.1-405b' }
        ]
      }
    }
  };

  const offlineFallbackRawCatalog = {
    version: '1.0.0',
    providers: {
      deepseek: {
        name: 'DeepSeek',
        baseURL: 'https://api.deepseek.com',
        apiKeyEnv: 'DEEPSEEK_API_KEY',
        models: [
          { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', provider: 'deepseek' }
        ]
      }
    }
  };

  it('should extract provider display name correctly from online Hermes catalog format', () => {
    const name = getProviderDisplayName('openrouter', onlineHermesRawCatalog.providers.openrouter);
    expect(name).toBe('OpenRouter');
    expect(name).not.toBeUndefined();
    expect(name).not.toContain('undefined');
  });

  it('should extract provider display name correctly from offline catalog format', () => {
    const name = getProviderDisplayName('deepseek', offlineFallbackRawCatalog.providers.deepseek);
    expect(name).toBe('DeepSeek');
    expect(name).not.toBeUndefined();
    expect(name).not.toContain('undefined');
  });

  it('should extract model display name correctly', () => {
    const onlineModelName = getModelDisplayName({ id: 'anthropic/claude-3.5-sonnet', description: 'Sonnet' });
    expect(onlineModelName).toBe('claude-3.5-sonnet (anthropic)');

    const offlineModelName = getModelDisplayName({ id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash' });
    expect(offlineModelName).toBe('DeepSeek V4 Flash');
  });

  it('should normalize online Hermes catalog format into clean standard schema', () => {
    const normalized = normalizeCatalog(onlineHermesRawCatalog);
    expect(normalized.providers.openrouter.name).toBe('OpenRouter');
    expect(normalized.providers.openrouter.apiKeyEnv).toBe('OPENROUTER_API_KEY');
    expect(normalized.providers.openrouter.models[0].name).toBeDefined();
    expect(normalized.providers.openrouter.models[0].name).not.toContain('undefined');
    expect(normalized.providers.nous.name).toBe('Nous Portal');
    expect(normalized.providers.nous.apiKeyEnv).toBe('NOUS_API_KEY');
  });

  it('should normalize offline catalog format seamlessly', () => {
    const normalized = normalizeCatalog(offlineFallbackRawCatalog);
    expect(normalized.providers.deepseek.name).toBe('DeepSeek');
    expect(normalized.providers.deepseek.apiKeyEnv).toBe('DEEPSEEK_API_KEY');
    expect(normalized.providers.deepseek.models[0].name).toBe('DeepSeek V4 Flash');
  });
});
