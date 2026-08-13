import { logger } from "./logger";
logger.setupStdioProtection();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { chromium, Browser, Page } from "playwright";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

let browser: Browser | null = null;
export let activePage: Page | null = null;

export async function closeBrowser() {
  await browser?.close();
  browser = null;
  activePage = null;
}

export async function handleNavigate(url: string) {
  logger.debug("Navigate requested", { url });
  if (!browser) browser = await chromium.launch({ headless: false });
  if (!activePage) activePage = await browser.newPage();
  
  try {
    await activePage.goto(url);
    logger.debug("Navigate successful", { url });
    return { content: [{ type: "text", text: `Navigated to ${url}` }] };
  } catch (e: any) {
    logger.error("Navigate failed", { url, error: e.message });
    return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
  }
}

export async function handleGetContent() {
  logger.debug("Get content requested");
  if (!activePage) return { content: [{ type: "text", text: "Error: No active page" }], isError: true };
  try {
    const html = await activePage.content();
    logger.debug("Content retrieved", { length: html.length });
    return { content: [{ type: "text", text: html }] };
  } catch (e: any) {
    logger.error("Get content failed", { error: e.message });
    return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
  }
}

export async function handleClickElement(selector: string) {
  logger.debug("Click element requested", { selector });
  if (!activePage) return { content: [{ type: "text", text: "Error: No active page" }], isError: true };
  try {
    await activePage.click(selector);
    logger.debug("Element clicked", { selector });
    return { content: [{ type: "text", text: `Clicked ${selector}` }] };
  } catch (e: any) {
    logger.error("Click element failed", { selector, error: e.message });
    return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
  }
}

export async function handleFillElement(selector: string, value: string) {
  logger.debug("Fill element requested", { selector });
  if (!activePage) return { content: [{ type: "text", text: "Error: No active page" }], isError: true };
  try {
    await activePage.fill(selector, value);
    logger.debug("Element filled", { selector });
    return { content: [{ type: "text", text: `Filled ${selector}` }] };
  } catch (e: any) {
    logger.error("Fill element failed", { selector, error: e.message });
    return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
  }
}

export function setupServer() {
  const server = new Server(
    { name: "browser-automation-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
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

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("Browser Automation MCP server running on stdio");
}

// Start unconditionally when executed
run().catch((error) => {
  logger.error("Server error", { error });
  process.exit(1);
});
