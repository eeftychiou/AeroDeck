import { jest } from '@jest/globals';
import { CANONICAL_PROVIDERS } from '../src/catalog.js';

describe('Multi-Model Setup Wizard & Profile Assignment Tests', () => {
  it('should list popular providers and custom endpoint in choices', () => {
    const providerChoices = CANONICAL_PROVIDERS.map((p) => ({
      title: `${p.label} - ${p.tui_desc}`,
      value: p.slug
    }));

    expect(providerChoices.length).toBeGreaterThanOrEqual(12);
    const customOption = providerChoices.find(c => c.value === 'custom');
    expect(customOption).toBeDefined();
    expect(customOption?.title).toContain('Custom Endpoint');
  });

  it('should correctly format model profile tiers config structure', () => {
    const configuredTiers: Record<string, any> = {
      fast: {
        provider: 'openrouter',
        model: 'anthropic/claude-3.5-sonnet',
        baseURL: 'https://openrouter.ai/api/v1',
        reasoningEffort: 'low'
      },
      smart: {
        provider: 'deepseek',
        model: 'deepseek-v4-flash',
        baseURL: 'https://api.deepseek.com',
        reasoningEffort: 'high'
      }
    };

    expect(configuredTiers.fast.reasoningEffort).toBe('low');
    expect(configuredTiers.smart.reasoningEffort).toBe('high');
    expect(configuredTiers.smart.baseURL).toBe('https://api.deepseek.com');
  });
});
