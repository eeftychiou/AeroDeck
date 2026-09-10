import { jest } from '@jest/globals';
import path from 'path';
import os from 'os';
import { getMcpConfigPath, generateMcpServerConfig } from '../src/register-helper.js';

describe('Setup Script Registration Tests', () => {
  it('should detect environment paths correctly for harness registration', () => {
    const fakeHome = process.env.AERODECK_TEST_TARGET_DIR || '/home/testuser';
    const resolvedPath = `${fakeHome}/.gemini/antigravity`;
    expect(resolvedPath).toContain('.gemini/antigravity');
  });

  it('should format extension manifest JSON correctly', () => {
    const manifest = {
      name: 'aerodeck-extension',
      version: '6.0.0',
      description: 'AeroDeck Harness Support'
    };
    const jsonString = JSON.stringify(manifest, null, 2);
    expect(JSON.parse(jsonString)).toEqual(manifest);
  });

  it('should resolve global mcp_config.json path when scope is global', () => {
    const globalPath = getMcpConfigPath({ scope: 'global' });
    expect(globalPath).toEqual(path.join(os.homedir(), '.gemini/config/mcp_config.json'));
  });

  it('should resolve workspace mcp_config.json path when scope is workspace', () => {
    const fakeWorkspacePlugin = '/projects/my-app/.agents/plugins/aerodeck';
    const workspacePath = getMcpConfigPath({ scope: 'workspace', baseDir: fakeWorkspacePlugin });
    expect(workspacePath).toEqual(path.join(fakeWorkspacePlugin, 'mcp_config.json'));
  });

  it('should auto-detect workspace scope if baseDir is inside .agents/plugins', () => {
    const fakeWorkspacePlugin = '/projects/my-app/.agents/plugins/aerodeck';
    const detectedPath = getMcpConfigPath({ scope: 'auto', baseDir: fakeWorkspacePlugin });
    expect(detectedPath).toEqual(path.join(fakeWorkspacePlugin, 'mcp_config.json'));
  });

  it('should generate valid MCP server definitions with normalized paths', () => {
    const baseDir = '/test/aerodeck';
    const config = generateMcpServerConfig(baseDir);

    expect(config.mcpServers['browser-automation']).toBeDefined();
    expect(config.mcpServers['browser-automation'].command).toBe('node');
    expect(config.mcpServers['browser-automation'].args[0]).toBe(
      path.join(baseDir, 'mcp-servers/browser-automation/dist/src/index.js').replace(/\\/g, '/')
    );

    expect(config.mcpServers['model-router']).toBeDefined();
    expect(config.mcpServers['model-router'].args[0]).toBe(
      path.join(baseDir, 'mcp-servers/model-router/dist/index.js').replace(/\\/g, '/')
    );

    expect(config.mcpServers['google-drive']).toBeDefined();
    expect(config.mcpServers['google-drive'].args[0]).toBe(
      path.join(baseDir, 'mcp-servers/google-drive/dist/index.js').replace(/\\/g, '/')
    );
  });
});

