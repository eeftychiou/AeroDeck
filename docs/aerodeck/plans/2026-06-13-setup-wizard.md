# Interactive Setup Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a cross-platform interactive CLI Setup Wizard under `scripts/setup` that handles environment validation, API key configuration and testing (Kimi/Minimax), Google Drive OAuth setup, and global MCP registration.

**Architecture/Workflow:** Node.js/TypeScript application using the `prompts` library for CLI prompts, `chalk` for terminal formatting, and standard HTTP/HTTPS API calls to verify credentials before writing `.env` files.

**Tech Stack/Tools:** 
- Workspace directory: `c:\Users\User\Antigravity\Gemini Assistant`
- Setup Wizard Path: `scripts/setup/`

---

### Task 1: Project configuration and npm package setup
**Targets:**
- Create: `scripts/setup/package.json`
- Create: `scripts/setup/tsconfig.json`
- Modify: `package.json:1-10`

- [ ] **Step 1: Write/Define success criteria**
  Verify configuration files are written and the root package.json is updated.
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Check if `scripts/setup/package.json` exists.
  Expected: FAIL
- [ ] **Step 3: Perform minimal implementation / worker action**
  Create files:
  `scripts/setup/package.json`:
  ```json
  {
    "name": "setup-wizard",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "build": "tsc",
      "start": "tsc && node dist/index.js"
    },
    "dependencies": {
      "prompts": "^2.4.2",
      "chalk": "^5.3.0",
      "dotenv": "^16.4.5",
      "googleapis": "^140.0.1"
    },
    "devDependencies": {
      "typescript": "^5.5.2",
      "@types/node": "^20.14.9"
    }
  }
  ```
  `scripts/setup/tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    },
    "include": ["src/**/*"]
  }
  ```
  Add to root `package.json` under `"scripts"`:
  `"setup": "npm --prefix scripts/setup install && npm --prefix scripts/setup run start"`
- [ ] **Step 4: Verify state passes criteria**
  Check if the configurations are successfully created.
  Expected: PASS
- [ ] **Step 5: Save/Checkpoint**
  Stage the changes.

---

### Task 2: Implement Active Validators
**Targets:**
- Create: `scripts/setup/src/validators.ts`

- [ ] **Step 1: Write/Define success criteria**
  Write validation logic that makes non-destructive HTTPS check calls for Kimi and Minimax APIs, and checks Google Drive credentials.
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Check if files exist.
  Expected: FAIL
- [ ] **Step 3: Perform minimal implementation / worker action**
  Create `scripts/setup/src/validators.ts`:
  ```typescript
  import http from "https";

  export function testKimiKey(key: string): Promise<boolean> {
    return new Promise((resolve) => {
      const data = JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 5
      });

      const req = http.request({
        hostname: "api.moonshot.cn",
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        }
      }, (res) => {
        resolve(res.statusCode === 200);
      });

      req.on("error", () => resolve(false));
      req.write(data);
      req.end();
    });
  }

  export function testMinimaxKey(key: string): Promise<boolean> {
    return new Promise((resolve) => {
      const data = JSON.stringify({
        model: "minimax-text-01",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 5
      });

      const req = http.request({
        hostname: "api.minimax.chat",
        path: "/v1/text/chat",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        }
      }, (res) => {
        resolve(res.statusCode === 200);
      });

      req.on("error", () => resolve(false));
      req.write(data);
      req.end();
    });
  }
  ```
- [ ] **Step 4: Verify state passes criteria**
  Check that `src/validators.ts` exists and compiles cleanly.
  Expected: PASS
- [ ] **Step 5: Save/Checkpoint**
  Stage the files.

---

### Task 3: Implement Setup Wizard Core Logic
**Targets:**
- Create: `scripts/setup/src/index.ts`

- [ ] **Step 1: Write/Define success criteria**
  Implement the CLI questionnaire using `prompts`, coordinate file writing for `.env` and `token.json`, and run the installation script.
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Check if `src/index.ts` exists.
  Expected: FAIL
- [ ] **Step 3: Perform minimal implementation / worker action**
  Create `scripts/setup/src/index.ts`:
  ```typescript
  import prompts from "prompts";
  import chalk from "chalk";
  import fs from "fs";
  import path from "path";
  import { execSync } from "child_process";
  import { fileURLToPath } from "url";
  import { google } from "googleapis";
  import http from "http";
  import { testKimiKey, testMinimaxKey } from "./validators.js";

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.resolve(__dirname, "../../../");

  async function run() {
    console.log(chalk.bold.cyan("\n=== AeroDeck Interactive Setup Wizard ===\n"));

    // 1. Model Router Setup
    const routerEnvPath = path.join(rootDir, "mcp-servers/model-router/.env");
    let initialKimi = "";
    let initialMinimax = "";

    if (fs.existsSync(routerEnvPath)) {
      const content = fs.readFileSync(routerEnvPath, "utf-8");
      initialKimi = content.match(/KIMI_API_KEY="?([^"\n]+)"?/)?[1] || "";
      initialMinimax = content.match(/MINIMAX_API_KEY="?([^"\n]+)"?/)?[1] || "";
    }

    const routerAnswers = await prompts([
      {
        type: "text",
        name: "kimi",
        message: "Enter your KIMI_API_KEY (Moonshot):",
        initial: initialKimi
      },
      {
        type: "text",
        name: "minimax",
        message: "Enter your MINIMAX_API_KEY (Minimax):",
        initial: initialMinimax
      }
    ]);

    if (routerAnswers.kimi) {
      console.log(chalk.yellow("Validating Kimi Key..."));
      const isKimiValid = await testKimiKey(routerAnswers.kimi);
      if (isKimiValid) {
        console.log(chalk.green("✔ Kimi Key validated successfully!"));
      } else {
        console.log(chalk.red("✖ Kimi Key validation failed. Storing key anyway."));
      }
    }

    if (routerAnswers.minimax) {
      console.log(chalk.yellow("Validating Minimax Key..."));
      const isMinimaxValid = await testMinimaxKey(routerAnswers.minimax);
      if (isMinimaxValid) {
        console.log(chalk.green("✔ Minimax Key validated successfully!"));
      } else {
        console.log(chalk.red("✖ Minimax Key validation failed. Storing key anyway."));
      }
    }

    // Write Model Router env
    const routerEnvContent = `KIMI_API_KEY="${routerAnswers.kimi || ""}"\nMINIMAX_API_KEY="${routerAnswers.minimax || ""}"\n`;
    fs.writeFileSync(routerEnvPath, routerEnvContent);
    console.log(chalk.green("✔ Saved Model Router API keys to .env\n"));

    // 2. Google Drive Setup
    const driveAnswers = await prompts({
      type: "confirm",
      name: "setupDrive",
      message: "Do you want to configure Google Drive integration?",
      initial: true
    });

    if (driveAnswers.setupDrive) {
      const driveEnvPath = path.join(rootDir, "mcp-servers/google-drive/.env");
      let initialId = "";
      let initialSecret = "";

      if (fs.existsSync(driveEnvPath)) {
        const content = fs.readFileSync(driveEnvPath, "utf-8");
        initialId = content.match(/GOOGLE_CLIENT_ID="?([^"\n]+)"?/)?[1] || "";
        initialSecret = content.match(/GOOGLE_CLIENT_SECRET="?([^"\n]+)"?/)?[1] || "";
      }

      const clientAnswers = await prompts([
        {
          type: "text",
          name: "clientId",
          message: "Enter your GOOGLE_CLIENT_ID:",
          initial: initialId
        },
        {
          type: "text",
          name: "clientSecret",
          message: "Enter your GOOGLE_CLIENT_SECRET:",
          initial: initialSecret
        }
      ]);

      if (clientAnswers.clientId && clientAnswers.clientSecret) {
        const driveEnvContent = `GOOGLE_CLIENT_ID="${clientAnswers.clientId}"\nGOOGLE_CLIENT_SECRET="${clientAnswers.clientSecret}"\nGOOGLE_REDIRECT_URI="http://localhost:3000/oauth2callback"\nPORT=3000\n`;
        fs.writeFileSync(driveEnvPath, driveEnvContent);
        console.log(chalk.green("✔ Saved Google Drive credentials to .env"));

        // OAuth Loop Check
        const tokenPath = path.join(rootDir, "mcp-servers/google-drive/token.json");
        if (!fs.existsSync(tokenPath)) {
          console.log(chalk.yellow("First-time Google Drive authentication needed. Starting local browser flow..."));
          const oAuth2Client = new google.auth.OAuth2(
            clientAnswers.clientId,
            clientAnswers.clientSecret,
            "http://localhost:3000/oauth2callback"
          );

          const authUrl = oAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: ["https://www.googleapis.com/auth/drive.readonly"],
            prompt: "consent",
          });

          console.log(chalk.bold.blue("\nOpen this link in your browser to authorize access:"));
          console.log(chalk.underline.blue(authUrl) + "\n");

          const code = await startCallbackServer();
          const { tokens } = await oAuth2Client.getToken(code);
          fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
          console.log(chalk.green("✔ Authentication successful! Saved token.json\n"));
        } else {
          console.log(chalk.green("✔ Found existing token.json, skipping login flow.\n"));
        }
      }
    }

    // 3. Register with install script
    console.log(chalk.yellow("Registering MCP servers in mcp_config.json..."));
    try {
      if (process.platform === "win32") {
        execSync("powershell -File .\\install.ps1", { cwd: rootDir, stdio: "inherit" });
      } else {
        execSync("node scripts/setup/register-unix.js", { cwd: rootDir, stdio: "inherit" });
      }
      console.log(chalk.green("✔ MCP Servers registered successfully!\n"));
    } catch (e: any) {
      console.log(chalk.red(`✖ Registration failed: ${e.message}\n`));
    }

    console.log(chalk.bold.green("=== AeroDeck Setup Wizard Complete! ===\n"));
  }

  function startCallbackServer(): Promise<string> {
    return new Promise((resolve) => {
      const server = http.createServer((req, res) => {
        const urlObj = new URL(req.url || "", "http://localhost:3000");
        if (urlObj.pathname === "/oauth2callback") {
          const code = urlObj.searchParams.get("code") || "";
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end("<h1>Authentication Successful!</h1><p>You can close this tab and return to the terminal.</p>");
          resolve(code);
          setTimeout(() => server.close(), 1000);
        } else {
          res.writeHead(404);
          res.end();
        }
      });
      server.listen(3000);
    });
  }

  run().catch(console.error);
  ```
  And also create a simple Unix register helper `scripts/setup/register-unix.js` for macOS/Linux cross-platform capability:
  ```javascript
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
  ```
- [ ] **Step 4: Verify state passes criteria**
  Check compilation: `npm --prefix scripts/setup run build`.
  Expected: PASS
- [ ] **Step 5: Save/Checkpoint**
  Commit files.
