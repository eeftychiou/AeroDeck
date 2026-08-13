"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tests/server.test.ts
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const index_1 = require("../src/index");
describe("Browser Automation MCP", () => {
    it("should initialize a valid MCP server instance", () => {
        const server = (0, index_1.setupServer)();
        expect(server).toBeInstanceOf(index_js_1.Server);
        // Workaround for SDK version >= 1.0.0 where info is _serverInfo
        expect(server._serverInfo?.name).toBe("browser-automation-mcp");
    });
});
describe("Navigate Tool", () => {
    afterAll(async () => {
        await (0, index_1.closeBrowser)();
    });
    it("should return success message after navigation", async () => {
        const result = await (0, index_1.handleNavigate)("http://example.com");
        expect(result.content[0].text).toContain("Navigated to http://example.com");
    });
});
