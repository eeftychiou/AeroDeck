"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activePage = void 0;
exports.closeBrowser = closeBrowser;
exports.handleNavigate = handleNavigate;
exports.handleGetContent = handleGetContent;
exports.handleClickElement = handleClickElement;
exports.handleFillElement = handleFillElement;
exports.setupServer = setupServer;
// Protect stdio stream from stdout pollution
console.log = (...args) => console.error("[LOG]", ...args);
console.info = (...args) => console.error("[INFO]", ...args);
console.warn = (...args) => console.error("[WARN]", ...args);
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const playwright_1 = require("playwright");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
let browser = null;
exports.activePage = null;
async function closeBrowser() {
    await browser?.close();
    browser = null;
    exports.activePage = null;
}
async function handleNavigate(url) {
    if (!browser)
        browser = await playwright_1.chromium.launch({ headless: false });
    if (!exports.activePage)
        exports.activePage = await browser.newPage();
    try {
        await exports.activePage.goto(url);
        return { content: [{ type: "text", text: `Navigated to ${url}` }] };
    }
    catch (e) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
}
async function handleGetContent() {
    if (!exports.activePage)
        return { content: [{ type: "text", text: "Error: No active page" }], isError: true };
    try {
        const html = await exports.activePage.content();
        return { content: [{ type: "text", text: html }] };
    }
    catch (e) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
}
async function handleClickElement(selector) {
    if (!exports.activePage)
        return { content: [{ type: "text", text: "Error: No active page" }], isError: true };
    try {
        await exports.activePage.click(selector);
        return { content: [{ type: "text", text: `Clicked ${selector}` }] };
    }
    catch (e) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
}
async function handleFillElement(selector, value) {
    if (!exports.activePage)
        return { content: [{ type: "text", text: "Error: No active page" }], isError: true };
    try {
        await exports.activePage.fill(selector, value);
        return { content: [{ type: "text", text: `Filled ${selector}` }] };
    }
    catch (e) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
}
function setupServer() {
    const server = new index_js_1.Server({ name: "browser-automation-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
        return {
            tools: [
                {
                    name: "navigate",
                    description: "Navigate to a URL",
                    inputSchema: {
                        type: "object",
                        properties: { url: { type: "string" } },
                        required: ["url"]
                    }
                },
                {
                    name: "get_content",
                    description: "Get the HTML content of the current page",
                    inputSchema: {
                        type: "object",
                        properties: {}
                    }
                },
                {
                    name: "click_element",
                    description: "Click an element on the current page using a CSS selector",
                    inputSchema: {
                        type: "object",
                        properties: { selector: { type: "string" } },
                        required: ["selector"]
                    }
                },
                {
                    name: "fill_element",
                    description: "Fill an input field on the current page using a CSS selector",
                    inputSchema: {
                        type: "object",
                        properties: {
                            selector: { type: "string" },
                            value: { type: "string" }
                        },
                        required: ["selector", "value"]
                    }
                }
            ]
        };
    });
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        if (request.params.name === "navigate") {
            const url = String(request.params.arguments?.url);
            return await handleNavigate(url);
        }
        if (request.params.name === "get_content") {
            return await handleGetContent();
        }
        if (request.params.name === "click_element") {
            const selector = String(request.params.arguments?.selector);
            return await handleClickElement(selector);
        }
        if (request.params.name === "fill_element") {
            const selector = String(request.params.arguments?.selector);
            const value = String(request.params.arguments?.value);
            return await handleFillElement(selector, value);
        }
        throw new Error("Tool not found");
    });
    return server;
}
async function run() {
    const server = setupServer();
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("Browser Automation MCP server running on stdio");
}
// Start unconditionally when executed
run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
