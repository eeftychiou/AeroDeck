import { spawnSync } from 'child_process';
import path from 'path';

const isLive = process.argv.includes('--live');
console.log(`\n========================================`);
console.log(` AeroDeck Unified Test Runner (${isLive ? 'LIVE' : 'OFFLINE UNIT'})`);
console.log(`========================================\n`);

const testTargets = [
  { name: 'mcp-servers/browser-automation', cmd: 'npm', args: ['test'] },
  { name: 'mcp-servers/model-router', cmd: 'npm', args: ['test'] },
  { name: 'mcp-servers/google-drive', cmd: 'npm', args: ['test'] },
  { name: 'scripts/setup', cmd: 'npm', args: ['test'] },
  { name: 'telegram-bridge & python tests', cmd: 'python', args: ['-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_telegram*.py'] }
];

let failed = false;

for (const target of testTargets) {
  console.log(`[+] Running tests for ${target.name}...`);
  const cwd = target.name.includes('telegram') ? process.cwd() : path.resolve(process.cwd(), target.name);
  const result = spawnSync(target.cmd, target.args, {
    cwd,
    stdio: 'inherit',
    shell: true
  });
  if (result.status !== 0) {
    console.error(`[-] ${target.name} tests failed!`);
    failed = true;
  }
}

if (failed) {
  console.error('\n[X] Some test suites failed.\n');
  process.exit(1);
} else {
  console.log('\n[✓] All test suites passed successfully!\n');
}
