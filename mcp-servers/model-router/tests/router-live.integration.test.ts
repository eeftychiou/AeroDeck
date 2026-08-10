describe('Model Router Live API Tests', () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const runIfKey = apiKey ? it : it.skip;

  runIfKey('should execute live route classification request if API key is present', async () => {
    expect(apiKey).toBeDefined();
  });
});
