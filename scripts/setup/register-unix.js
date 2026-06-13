import fs from 'fs';
import path from 'path';
import os from 'os';

const mcpConfigFile = path.join(os.homedir(), '.gemini/config/mcp_config.json');
if (fs.existsSync(mcpConfigFile)) {
  const config = JSON.parse(fs.readFileSync(mcpConfigFile, 'utf-8'));
  const cwd = process.cwd();
  
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
