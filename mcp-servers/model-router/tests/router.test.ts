import { jest } from "@jest/globals";

jest.unstable_mockModule("ai", () => ({
  generateText: jest.fn().mockResolvedValue({ text: "Mocked LLM response" } as never)
}));

jest.unstable_mockModule("@ai-sdk/openai", () => ({
  openai: jest.fn()
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
});
