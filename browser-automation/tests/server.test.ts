// tests/server.test.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { setupServer, handleNavigate, closeBrowser } from "../src/index";

describe("Browser Automation MCP", () => {
  it("should initialize a valid MCP server instance", () => {
    const server = setupServer();
    expect(server).toBeInstanceOf(Server);
    // Workaround for SDK version >= 1.0.0 where info is _serverInfo
    expect((server as any)._serverInfo?.name).toBe("browser-automation-mcp");
  });
});

describe("Navigate Tool", () => {
  afterAll(async () => {
    await closeBrowser();
  });

  it("should return success message after navigation", async () => {
    const result = await handleNavigate("http://example.com");
    expect(result.content[0].text).toContain("Navigated to http://example.com");
  });
});
