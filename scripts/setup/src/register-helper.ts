import path from 'path';
import os from 'os';
import fs from 'fs';

export interface McpRegistrationOptions {
  scope?: 'auto' | 'global' | 'workspace';
  baseDir?: string;
}

export interface McpServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface McpConfigFile {
  mcpServers: Record<string, McpServerConfig>;
}

export function getMcpConfigPath(options: McpRegistrationOptions = {}): string {
  const scope = options.scope || 'auto';
  const baseDir = options.baseDir || process.cwd();

  if (scope === 'workspace') {
    return path.join(baseDir, 'mcp_config.json');
  }

  if (scope === 'auto') {
    const normBase = baseDir.replace(/\\/g, '/').toLowerCase();
    if (normBase.includes('.agents/plugins') || normBase.includes('.agents\\plugins')) {
      return path.join(baseDir, 'mcp_config.json');
    }
  }

  return path.join(os.homedir(), '.gemini/config/mcp_config.json');
}

export function generateMcpServerConfig(baseDir: string): McpConfigFile {
  const browserDist = path.join(baseDir, 'mcp-servers/browser-automation/dist/src/index.js').replace(/\\/g, '/');
  const routerDist = path.join(baseDir, 'mcp-servers/model-router/dist/index.js').replace(/\\/g, '/');
  const driveDist = path.join(baseDir, 'mcp-servers/google-drive/dist/index.js').replace(/\\/g, '/');

  return {
    mcpServers: {
      'browser-automation': {
        command: 'node',
        args: [browserDist]
      },
      'model-router': {
        command: 'node',
        args: [routerDist]
      },
      'google-drive': {
        command: 'node',
        args: [driveDist]
      }
    }
  };
}

export function registerMcpServers(options: McpRegistrationOptions = {}): string {
  const targetConfigPath = getMcpConfigPath(options);
  const baseDir = options.baseDir || process.cwd();
  const serversConfig = generateMcpServerConfig(baseDir);

  const parentDir = path.dirname(targetConfigPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  let existingConfig: McpConfigFile = { mcpServers: {} };
  if (fs.existsSync(targetConfigPath)) {
    try {
      const raw = fs.readFileSync(targetConfigPath, 'utf-8');
      if (raw.trim()) {
        existingConfig = JSON.parse(raw);
        existingConfig.mcpServers = existingConfig.mcpServers || {};
      }
    } catch (e) {
      existingConfig = { mcpServers: {} };
    }
  }

  existingConfig.mcpServers = {
    ...existingConfig.mcpServers,
    ...serversConfig.mcpServers
  };

  fs.writeFileSync(targetConfigPath, JSON.stringify(existingConfig, null, 2));
  return targetConfigPath;
}
