import { spawn } from 'child_process';
import fs from 'fs';

const serverName = process.argv[2];
const toolName = process.argv[3];
const argsJson = process.argv[4];

if (!serverName || !toolName || !argsJson) {
  console.error('Usage: node call_mcp_tool.mjs <serverName> <toolName> <argsJson>');
  process.exit(1);
}

const configPath = 'C:/Users/User/.gemini/config/mcp_config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const serverConfig = config.mcpServers[serverName];

if (!serverConfig) {
  console.error(`Server ${serverName} not found in mcp_config.json`);
  process.exit(1);
}

const child = spawn(serverConfig.command, serverConfig.args, { stdio: ['pipe', 'pipe', 'inherit'] });

let responseBuffer = '';
child.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop();
  
  for (const line of lines) {
    if (line.trim()) {
      try {
        const msg = JSON.parse(line);
        if (msg.result) {
          if (msg.result.content && msg.result.content[0] && msg.result.content[0].text) {
             console.log(msg.result.content[0].text);
          } else {
             console.log(JSON.stringify(msg.result, null, 2));
          }
          child.kill();
          process.exit(0);
        }
        if (msg.error) {
          console.error(JSON.stringify(msg.error, null, 2));
          child.kill();
          process.exit(1);
        }
      } catch (e) { }
    }
  }
});

const req = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: toolName,
    arguments: JSON.parse(argsJson)
  }
};

child.stdin.write(JSON.stringify(req) + '\n');
