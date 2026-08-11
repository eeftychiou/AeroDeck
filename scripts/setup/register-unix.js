import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

const cwd = process.cwd();
const servers = ["browser-automation", "model-router", "google-drive"];

console.log("Installing dependencies & building MCP servers on Unix...");
for (const server of servers) {
  const serverPath = path.join(cwd, "mcp-servers", server);
  if (fs.existsSync(serverPath)) {
    console.log(`  [+] Building mcp-servers/${server}...`);
    try {
      execSync(`npm --prefix "${serverPath}" install --no-audit --no-fund`, { stdio: 'inherit' });
      execSync(`npm --prefix "${serverPath}" run build`, { stdio: 'inherit' });
    } catch (err) {
      console.error(`  ✖ Failed to build ${server}: ${err.message}`);
    }
  }
}

const mcpConfigFile = path.join(os.homedir(), '.gemini/config/mcp_config.json');
if (fs.existsSync(mcpConfigFile)) {
  const config = JSON.parse(fs.readFileSync(mcpConfigFile, 'utf-8'));
  
  config.mcpServers = config.mcpServers || {};
  config.mcpServers["browser-automation"] = {
    command: "node",
    args: [path.join(cwd, "mcp-servers/browser-automation/dist/src/index.js").replace(/\\/g, "/")]
  };
  config.mcpServers["model-router"] = {
    command: "node",
    args: [path.join(cwd, "mcp-servers/model-router/dist/index.js").replace(/\\/g, "/")]
  };
  config.mcpServers["google-drive"] = {
    command: "node",
    args: [path.join(cwd, "mcp-servers/google-drive/dist/index.js").replace(/\\/g, "/")]
  };

  fs.writeFileSync(mcpConfigFile, JSON.stringify(config, null, 2));
  console.log("Registered servers on Unix path: " + mcpConfigFile);
}
