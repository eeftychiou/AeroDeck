import { Server } from "@modelcontextprotocol/sdk/server/index.js";

export function setupServer() {
  return new Server(
    { name: "browser-automation-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );
}
