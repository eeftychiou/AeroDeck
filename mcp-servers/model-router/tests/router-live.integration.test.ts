import { describe, it, expect } from "@jest/globals";
import { routeTask } from "../src/index.js";

describe('Model Router Live API Tests', () => {
  const hasDeepSeek = Boolean(process.env.DEEPSEEK_API_KEY);
  const runIfDeepSeek = hasDeepSeek ? it : it.skip;

  const hasMiniMax = Boolean(process.env.MINIMAX_API_KEY);
  const runIfMiniMax = hasMiniMax ? it : it.skip;

  runIfDeepSeek('should execute live routeTask call using DeepSeek API key', async () => {
    const response = await routeTask('Hello, respond with OK', 'deepseek');
    expect(typeof response).toBe('string');
    expect(response).not.toContain('Error routing task');
  });

  runIfMiniMax('should execute live routeTask call using MiniMax API key', async () => {
    const response = await routeTask('Hello, respond with OK', 'minimax');
    expect(typeof response).toBe('string');
    expect(response).not.toContain('Error routing task');
  });
});
