import { jest } from "@jest/globals";

jest.unstable_mockModule("ai", () => ({
  generateText: jest.fn().mockResolvedValue({ text: "Mocked LLM response" } as never)
}));

jest.unstable_mockModule("@ai-sdk/openai", () => ({
  openai: jest.fn(),
  createOpenAI: jest.fn().mockReturnValue(jest.fn())
}));

jest.unstable_mockModule("@ai-sdk/anthropic", () => ({
  anthropic: jest.fn()
}));

jest.unstable_mockModule("@ai-sdk/google", () => ({
  google: jest.fn()
}));

const { routeTask } = await import("../src/index.js");

describe("Model Router", () => {
  it("should route simple tasks successfully", async () => {
    const res = await routeTask("Say hello", "fast");
    expect(res).toBeDefined();
    expect(res).toContain("Mocked LLM response");
  });

  it("should inject reasoning_effort and extra_body into fetch payload for deepseek via custom headers", async () => {
    // 1. Trigger the route which should create the provider instance
    await routeTask("Test reasoning", "default", "deepseek-v4-flash", undefined, false, "high");

    // 2. Get the fetch function passed to createOpenAI
    const { createOpenAI } = await import("@ai-sdk/openai");
    expect(jest.mocked(createOpenAI)).toHaveBeenCalled();
    const callArgs = jest.mocked(createOpenAI).mock.calls.find(c => c[0]?.name === "deepseek");
    expect(callArgs).toBeDefined();
    const customFetch = callArgs![0].fetch;
    expect(customFetch).toBeDefined();

    // 3. Simulate an outgoing fetch request with the custom header
    const mockInit: any = {
      headers: new Headers({ "x-custom-reasoning-effort": "high" }),
      body: JSON.stringify({ model: "deepseek-v4-flash", messages: [] })
    };
    
    // We mock global fetch just for this test
    const originalFetch = global.fetch;
    let interceptedInit: any;
    global.fetch = jest.fn().mockImplementation((url, init) => {
      interceptedInit = init;
      return Promise.resolve(new Response());
    }) as any;

    await customFetch!("https://api.deepseek.com/chat/completions", mockInit);

    // 4. Assert the header is removed and the payload is injected
    const finalHeaders = new Headers(interceptedInit.headers);
    expect(finalHeaders.has("x-custom-reasoning-effort")).toBe(false);
    
    const finalBody = JSON.parse(interceptedInit.body);
    expect(finalBody.reasoning_effort).toBe("high");
    expect(finalBody.extra_body).toBeDefined();
    expect(finalBody.extra_body.thinking.type).toBe("enabled");

    global.fetch = originalFetch;
  });
});
