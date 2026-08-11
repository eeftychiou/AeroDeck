import { jest } from '@jest/globals';
import { normalizeCatalog } from '../src/catalog.js';

describe('Setup Models Navigation & Choices Formatting Tests', () => {
  const sampleCatalogData = {
    version: 1,
    providers: {
      openrouter: {
        metadata: {
          display_name: 'OpenRouter'
        },
        models: [
          { id: 'anthropic/claude-3.5-sonnet', description: 'Sonnet model' },
          { id: 'google/gemini-2.5-pro', description: 'Gemini model' }
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

  it('should format provider select choices with clean titles and correct model counts', () => {
    const catalog = normalizeCatalog(sampleCatalogData);
    const providerKeys = Object.keys(catalog.providers);
    const providerChoices = providerKeys.map((key) => {
      const prov = catalog.providers[key];
      const displayName = prov?.name || key;
      const modelCount = prov?.models?.length || 0;
      return {
        title: `${displayName} (${modelCount} models)`,
        value: key
      };
    });

    expect(providerChoices).toHaveLength(2);
    expect(providerChoices[0].title).toBe('OpenRouter (2 models)');
    expect(providerChoices[1].title).toBe('Nous Portal (1 models)');
    expect(providerChoices[0].title).not.toContain('undefined');
    expect(providerChoices[1].title).not.toContain('undefined');
  });

  it('should format model select choices cleanly with provider tags and model IDs', () => {
    const catalog = normalizeCatalog(sampleCatalogData);
    const selectedProviderKeys = ['openrouter', 'nous'];
    const availableModelChoices: { title: string; value: { provider: string; model: string } }[] = [];

    for (const provKey of selectedProviderKeys) {
      const provInfo = catalog.providers[provKey];
      const provDisplayName = provInfo?.name || provKey;
      for (const m of provInfo.models) {
        const modelDisplayName = m.name || m.id;
        availableModelChoices.push({
          title: `${modelDisplayName} [${provDisplayName}] (${m.id})`,
          value: { provider: provKey, model: m.id }
        });
      }
    }

    expect(availableModelChoices).toHaveLength(3);
    expect(availableModelChoices[0].title).toBe('claude-3.5-sonnet (anthropic) [OpenRouter] (anthropic/claude-3.5-sonnet)');
    expect(availableModelChoices[1].title).toBe('gemini-2.5-pro (google) [OpenRouter] (google/gemini-2.5-pro)');
    expect(availableModelChoices[2].title).toBe('hermes-3-llama-3.1-405b (nous) [Nous Portal] (nous/hermes-3-llama-3.1-405b)');
    expect(availableModelChoices[0].title).not.toContain('undefined');
  });
});
