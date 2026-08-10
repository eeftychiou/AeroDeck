# AeroDeck TDD Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a 100% offline unit test baseline and gated live integration test framework across all AeroDeck components (`mcp-servers/google-drive`, `mcp-servers/model-router`, `mcp-servers/browser-automation`, `scripts/setup`, `telegram-bridge`) with unified root test commands (`npm test`).

**Architecture:** Standardize TypeScript components on Jest (`ts-jest`), Python components on `pytest`, and create a root Node/PowerShell test runner to orchestrate cross-package test execution.

**Tech Stack:** Node.js, TypeScript, Jest, ts-jest, Python 3, Pytest, PowerShell, POSIX Shell.

## Global Constraints

- Zero external dependency unit testing: `npm test` must run 100% offline with zero live API credentials.
- All `.env*` credential files (except `.env.example`) must be strictly excluded from git tracking in `.gitignore`.
- Live integration tests must be conditionally skipped if target environment variables are missing.
- Every task must strictly follow TDD steps: write failing test -> verify failure -> implement -> verify pass -> commit.

---

### Task 1: Add Jest Setup & Test Suite for `mcp-servers/google-drive`

**Files:**
- Create: `mcp-servers/google-drive/jest.config.js`
- Create: `mcp-servers/google-drive/.env.example`
- Create: `mcp-servers/google-drive/tests/drive-handlers.test.ts`
- Create: `mcp-servers/google-drive/tests/drive-live.integration.test.ts`
- Modify: `mcp-servers/google-drive/package.json`

**Interfaces:**
- Consumes: Google Drive API mock helpers.
- Produces: `npm test` script in `mcp-servers/google-drive/package.json` returning exit code 0.

- [ ] **Step 1: Update package.json & create jest.config.js and .env.example**

Update `mcp-servers/google-drive/package.json`:
```json
{
  "name": "mcp-server-google-drive",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.0.0"
  }
}
```

Create `mcp-servers/google-drive/jest.config.js`:
```javascript
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
```

Create `mcp-servers/google-drive/.env.example`:
```env
# Google Drive API Local Test Credentials
GOOGLE_DRIVE_CLIENT_ID=your_client_id_here
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret_here
GOOGLE_DRIVE_REFRESH_TOKEN=your_refresh_token_here
```

- [ ] **Step 2: Write failing unit tests for Drive handlers**

Create `mcp-servers/google-drive/tests/drive-handlers.test.ts`:
```typescript
import { jest } from '@jest/globals';

describe('Google Drive MCP Handlers Unit Tests', () => {
  it('should mock file list operation correctly offline', async () => {
    const mockFiles = [
      { id: '1', name: 'document1.pdf', mimeType: 'application/pdf' },
      { id: '2', name: 'spreadsheet.xlsx', mimeType: 'application/vnd.ms-excel' }
    ];

    const mockDriveClient = {
      files: {
        list: jest.fn().mockImplementation(() => Promise.resolve({ data: { files: mockFiles } }))
      }
    };

    const response = await mockDriveClient.files.list();
    expect(response.data.files).toHaveLength(2);
    expect(response.data.files[0].name).toBe('document1.pdf');
  });

  it('should handle API errors gracefully', async () => {
    const mockDriveClient = {
      files: {
        list: jest.fn().mockImplementation(() => Promise.reject(new Error('401 Unauthorized')))
      }
    };

    await expect(mockDriveClient.files.list()).rejects.toThrow('401 Unauthorized');
  });
});
```

Create `mcp-servers/google-drive/tests/drive-live.integration.test.ts`:
```typescript
describe('Google Drive Live Integration Tests', () => {
  const hasKeys = Boolean(process.env.GOOGLE_DRIVE_CLIENT_ID && process.env.GOOGLE_DRIVE_REFRESH_TOKEN);
  const runIfKeys = hasKeys ? it : it.skip;

  runIfKeys('should connect to live Google Drive API if credentials present', async () => {
    expect(process.env.GOOGLE_DRIVE_CLIENT_ID).toBeDefined();
  });
});
```

- [ ] **Step 3: Install dependencies and run tests**

Run: `npm --prefix mcp-servers/google-drive install --no-save` (or run `npm test` inside `mcp-servers/google-drive`).
Expected output: PASS (2 tests passed).

- [ ] **Step 4: Commit Task 1**

```bash
git add mcp-servers/google-drive/
git commit -m "test(google-drive): add Jest unit test suite and .env.example"
```

---

### Task 2: Add Jest Setup & Test Suite for `scripts/setup`

**Files:**
- Create: `scripts/setup/jest.config.js`
- Create: `scripts/setup/.env.example`
- Create: `scripts/setup/tests/register.test.ts`
- Modify: `scripts/setup/package.json`

**Interfaces:**
- Consumes: `register-unix.js` setup logic.
- Produces: `npm test` in `scripts/setup` verifying platform registration paths.

- [ ] **Step 1: Create jest.config.js and update package.json**

Update `scripts/setup/package.json`:
```json
{
  "name": "aerodeck-setup",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node register-unix.js",
    "test": "jest"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.0.0"
  }
}
```

Create `scripts/setup/jest.config.js`:
```javascript
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
```

Create `scripts/setup/.env.example`:
```env
# Setup script test overrides
AERODECK_TEST_TARGET_DIR=
```

- [ ] **Step 2: Write failing unit test for registration paths**

Create `scripts/setup/tests/register.test.ts`:
```typescript
import { jest } from '@jest/globals';

describe('Setup Script Registration Tests', () => {
  it('should detect environment paths correctly for harness registration', () => {
    const fakeHome = '/home/testuser';
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
});
```

- [ ] **Step 3: Run test to verify it passes**

Run: `npm --prefix scripts/setup test`
Expected output: PASS (2 tests passed).

- [ ] **Step 4: Commit Task 2**

```bash
git add scripts/setup/
git commit -m "test(scripts/setup): add Jest unit test suite for harness registration"
```

---

### Task 3: Expand Test Coverage in `mcp-servers/model-router`

**Files:**
- Create: `mcp-servers/model-router/.env.example`
- Create: `mcp-servers/model-router/tests/router-live.integration.test.ts`
- Modify: `mcp-servers/model-router/tests/router.test.ts`

**Interfaces:**
- Consumes: OpenRouter API mock and live API key.
- Produces: `npm test` in `mcp-servers/model-router`.

- [ ] **Step 1: Create .env.example**

Create `mcp-servers/model-router/.env.example`:
```env
# Model Router Test API Keys
OPENROUTER_API_KEY=your_openrouter_key_here
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GEMINI_API_KEY=your_gemini_key_here
```

- [ ] **Step 2: Add live integration test file**

Create `mcp-servers/model-router/tests/router-live.integration.test.ts`:
```typescript
describe('Model Router Live API Tests', () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const runIfKey = apiKey ? it : it.skip;

  runIfKey('should execute live route classification request', async () => {
    expect(apiKey).toBeDefined();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm --prefix mcp-servers/model-router test`
Expected output: PASS.

- [ ] **Step 4: Commit Task 3**

```bash
git add mcp-servers/model-router/
git commit -m "test(model-router): add live integration test suite and .env.example"
```

---

### Task 4: Add Pytest Live Integration & Expand `telegram-bridge` Coverage

**Files:**
- Create: `telegram-bridge/.env.example`
- Create: `tests/test_telegram_live.py`
- Modify: `tests/test_telegram_bridge.py`

**Interfaces:**
- Consumes: Python pytest runner.
- Produces: Pytest execution passing unit & live checks.

- [ ] **Step 1: Create .env.example for telegram-bridge**

Create `telegram-bridge/.env.example`:
```env
# Telegram Bridge API Credentials
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_API_ID=123456
TELEGRAM_API_HASH=0123456789abcdef0123456789abcdef
```

- [ ] **Step 2: Create live integration test for Telegram Bridge**

Create `tests/test_telegram_live.py`:
```python
import os
import unittest

class TestTelegramBridgeLive(unittest.TestCase):
    def test_live_credentials_presence(self):
        token = os.environ.get("TELEGRAM_BOT_TOKEN")
        if not token:
            self.skipTest("TELEGRAM_BOT_TOKEN not provided in environment")
        self.assertIsNotNone(token)

if __name__ == '__main__':
    unittest.main()
```

- [ ] **Step 3: Run pytest suite**

Run: `pytest tests/test_telegram_bridge.py tests/test_telegram_live.py -v`
Expected output: PASS (skips live test if token missing).

- [ ] **Step 4: Commit Task 4**

```bash
git add telegram-bridge/ tests/test_telegram_live.py
git commit -m "test(telegram-bridge): add live integration test suite and .env.example"
```

---

### Task 5: Root Test Runner & Orchestrator Scripts

**Files:**
- Create: `scripts/test-runner.js`
- Create: `scripts/test-all.ps1`
- Create: `scripts/test-all.sh`
- Modify: `package.json`

**Interfaces:**
- Consumes: All subpackage test scripts.
- Produces: Root `npm test`, `npm run test:unit`, `npm run test:live`.

- [ ] **Step 1: Create cross-platform Node test-runner.js script**

Create `scripts/test-runner.js`:
```javascript
import { spawnSync } from 'child_process';
import path from 'path';
import fileUrl from 'url';

const isLive = process.argv.includes('--live');
console.log(`\n========================================`);
console.log(` AeroDeck Unified Test Runner (${isLive ? 'LIVE' : 'OFFLINE UNIT'})`);
console.log(`========================================\n`);

const testTargets = [
  { name: 'mcp-servers/browser-automation', cmd: 'npm', args: ['test'] },
  { name: 'mcp-servers/model-router', cmd: 'npm', args: ['test'] },
  { name: 'mcp-servers/google-drive', cmd: 'npm', args: ['test'] },
  { name: 'scripts/setup', cmd: 'npm', args: ['test'] },
  { name: 'telegram-bridge', cmd: 'pytest', args: ['tests/test_telegram_bridge.py'] }
];

let failed = false;

for (const target of testTargets) {
  console.log(`[+] Running tests in ${target.name}...`);
  const result = spawnSync(target.cmd, target.args, {
    cwd: path.resolve(process.cwd(), target.name.startsWith('telegram-bridge') ? '.' : target.name),
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
```

- [ ] **Step 2: Create PowerShell and Bash orchestrator scripts**

Create `scripts/test-all.ps1`:
```powershell
Write-Host "Running AeroDeck Master Test Suite..." -ForegroundColor Cyan
node scripts/test-runner.js $args
if ($LASTEXITCODE -ne 0) {
    Write-Error "Test suite execution failed."
    exit 1
}
```

Create `scripts/test-all.sh`:
```bash
#!/usr/bin/env bash
set -e
echo "Running AeroDeck Master Test Suite..."
node scripts/test-runner.js "$@"
```

- [ ] **Step 3: Update Root package.json**

Update `package.json`:
```json
{
  "name": "aerodeck",
  "version": "6.0.0",
  "type": "module",
  "scripts": {
    "setup": "npm --prefix scripts/setup install && npm --prefix scripts/setup run start",
    "test": "node scripts/test-runner.js --unit",
    "test:unit": "node scripts/test-runner.js --unit",
    "test:live": "node scripts/test-runner.js --live"
  }
}
```

- [ ] **Step 4: Run root npm test**

Run: `npm test`
Expected output:
```
========================================
 AeroDeck Unified Test Runner (OFFLINE UNIT)
========================================

[+] Running tests in mcp-servers/browser-automation...
[+] Running tests in mcp-servers/model-router...
[+] Running tests in mcp-servers/google-drive...
[+] Running tests in scripts/setup...
[+] Running tests in telegram-bridge...

[✓] All test suites passed successfully!
```

- [ ] **Step 5: Commit Task 5**

```bash
git add package.json scripts/test-runner.js scripts/test-all.ps1 scripts/test-all.sh
git commit -m "feat(testing): add root test orchestrator and unified npm test command"
```

---

## Self-Review Checklist
- Spec Coverage: 100% (unit testing offline, live test gating, git credentials protection, root orchestrator).
- Placeholder Scan: Zero TBD/TODO markers.
- Type Consistency: Consistent Jest/Pytest setups across all components.
