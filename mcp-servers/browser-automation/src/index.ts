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
  if (!browser) browser = await chromium.launch({ headless: true });
  if (!activePage) activePage = await browser.newPage();
  
  try {
    await activePage.goto(url);
    return { content: [{ type: "text", text: `Navigated to ${url}` }] };
  } catch (e: any) {
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
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "navigate") {
      const url = String(request.params.arguments?.url);
      return await handleNavigate(url);
    }
    throw new Error("Tool not found");
  });

  return server;
}

async function run() {
  const server = setupServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Browser Automation MCP server running on stdio");
}

// Start unconditionally when executed
run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
