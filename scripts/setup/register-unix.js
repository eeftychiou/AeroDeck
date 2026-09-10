import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { registerMcpServers, getMcpConfigPath } from './dist/register-helper.js';

const cwd = process.cwd();
const servers = ["browser-automation", "model-router", "google-drive"];

const isWorkspace = process.argv.includes('--scope=workspace') || 
                    process.argv.includes('--workspace') ||
                    cwd.replace(/\\/g, '/').toLowerCase().includes('.agents/plugins');
const scope = isWorkspace ? 'workspace' : (process.argv.includes('--scope=global') ? 'global' : 'auto');

console.log(`Installing dependencies & building MCP servers (Scope: ${isWorkspace ? 'Workspace' : 'Global'})...`);
for (const server of servers) {
  const serverPath = path.join(cwd, "mcp-servers", server);
  if (fs.existsSync(serverPath)) {
    console.log(`  [+] Building mcp-servers/${server}...`);
    try {
      execSync(`npm --prefix "${serverPath}" install --no-audit --no-fund --ignore-scripts`, { stdio: 'inherit' });
      execSync(`npm --prefix "${serverPath}" run build`, { stdio: 'inherit' });
    } catch (err) {
      console.error(`  ✖ Failed to build ${server}: ${err.message}`);
    }
  }
}

try {
  const configPath = registerMcpServers({ scope, baseDir: cwd });
  console.log(`Registered servers in: ${configPath}`);
} catch (err) {
  console.error(`Failed to register MCP servers: ${err.message}`);
}
