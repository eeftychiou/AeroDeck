# Google Drive MCP Server Implementation Plan (Stage 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new TypeScript-based MCP server in `mcp-servers/google-drive` that uses OAuth 2.0 to authenticate and provides tools to search, read, and download files from Google Drive.

**Architecture/Workflow:** Node.js/TypeScript application utilizing the `@modelcontextprotocol/sdk` and `googleapis`. Incorporates a local HTTP server callback loop to capture OAuth codes and write them to `token.json` for token refreshing.

**Tech Stack/Tools:** 
- Workspace directory: `c:\Users\User\Antigravity\Gemini Assistant`
- Server Path: `mcp-servers/google-drive/`

---

### Task 1: Initialize server configuration and project setup
**Targets:**
- Create: `mcp-servers/google-drive/package.json`
- Create: `mcp-servers/google-drive/tsconfig.json`
- Create: `mcp-servers/google-drive/.env.example`

- [ ] **Step 1: Write/Define success criteria**
  Verify that the server configuration files are created and populated.
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Check if files exist.
  Expected: FAIL
- [ ] **Step 3: Perform minimal implementation / worker action**
  Write configuration files:
  `package.json`:
  ```json
  {
    "name": "google-drive-mcp",
    "version": "1.0.0",
    "description": "Google Drive API MCP server",
    "type": "module",
    "main": "dist/index.js",
    "scripts": {
      "build": "tsc",
      "start": "tsc && node dist/index.js"
    },
    "dependencies": {
      "@modelcontextprotocol/sdk": "^0.6.0",
      "dotenv": "^16.4.5",
      "googleapis": "^140.0.1"
    },
    "devDependencies": {
      "@types/node": "^20.14.9",
      "typescript": "^5.5.2"
    }
  }
  ```
  `tsconfig.json`:
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
  `.env.example`:
  ```env
  GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
  GOOGLE_CLIENT_SECRET="your-client-secret"
  GOOGLE_REDIRECT_URI="http://localhost:3000/oauth2callback"
  PORT=3000
  ```
- [ ] **Step 4: Verify state passes criteria**
  Check that all three files exist in `mcp-servers/google-drive/`.
  Expected: PASS
- [ ] **Step 5: Save/Checkpoint**
  Save work to git index.

---

### Task 2: Implement OAuth Module and Server Logic
**Targets:**
- Create: `mcp-servers/google-drive/src/auth.ts`
- Create: `mcp-servers/google-drive/src/index.ts`

- [ ] **Step 1: Write/Define success criteria**
  Write code handling local OAuth flow, saving `token.json`, registering the MCP schemas, and implementing `search_drive_files`, `read_google_doc`, and `download_drive_file` tools.
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Check if `src/` exists.
  Expected: FAIL
- [ ] **Step 3: Perform minimal implementation / worker action**
  Write source files.
  `src/auth.ts`:
  ```typescript
  import { google } from "googleapis";
  import fs from "fs";
  import path from "path";
  import http from "http";
  import { fileURLToPath } from "url";

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const TOKEN_PATH = path.join(__dirname, "../token.json");

  export async function getOAuth2Client() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/oauth2callback";

    if (!clientId || !clientSecret) {
      throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env");
    }

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
      oAuth2Client.setCredentials(token);
      return oAuth2Client;
    }

    // First-time authorization flow
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/drive.readonly"],
      prompt: "consent",
    });

    console.error("\n==================================================");
    console.error("AUTHORIZATION REQUIRED FOR GOOGLE DRIVE MCP SERVER");
    console.error("Open the following URL in your browser to log in:");
    console.error(authUrl);
    console.error("==================================================\n");

    const code = await startLocalCallbackServer();
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.error("Authorization successful! Token saved to token.json");
    return oAuth2Client;
  }

  function startLocalCallbackServer(): Promise<string> {
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
  ```

  `src/index.ts`:
  ```typescript
  import dotenv from "dotenv";
  import { fileURLToPath } from "url";
  import path from "path";
  import fs from "fs";
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const envPath = path.resolve(__dirname, "../.env");

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  import { Server } from "@modelcontextprotocol/sdk/server/index.js";
  import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
  import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
  import { google } from "googleapis";
  import { getOAuth2Client } from "./auth.js";

  let drive: any;

  async function initializeDrive() {
    const auth = await getOAuth2Client();
    drive = google.drive({ version: "v3", auth });
  }

  export function setupServer() {
    const server = new Server(
      { name: "google-drive", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "search_drive_files",
            description: "Search Google Drive files by filename and full-text content.",
            inputSchema: {
              type: "object",
              properties: {
                query: { type: "string", description: "Search query keyword" }
              },
              required: ["query"]
            }
          },
          {
            name: "read_google_doc",
            description: "Read the text content of a Google Doc or plain text file by ID.",
            inputSchema: {
              type: "object",
              properties: {
                fileId: { type: "string", description: "Google Drive File ID" }
              },
              required: ["fileId"]
            }
          },
          {
            name: "download_drive_file",
            description: "Download a binary file (PDF/Image) to a local directory.",
            inputSchema: {
              type: "object",
              properties: {
                fileId: { type: "string", description: "Google Drive File ID" },
                outputPath: { type: "string", description: "Absolute path to save file locally" }
              },
              required: ["fileId", "outputPath"]
            }
          }
        ]
      };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!drive) {
        await initializeDrive();
      }

      const { name, arguments: args } = request.params;
      const parsedArgs = args as any;

      try {
        if (name === "search_drive_files") {
          const res = await drive.files.list({
            q: `name contains '${parsedArgs.query}' or fullText contains '${parsedArgs.query}'`,
            fields: "files(id, name, mimeType, webViewLink)",
          });
          return {
            content: [{ type: "text", text: JSON.stringify(res.data.files, null, 2) }]
          };
        }

        if (name === "read_google_doc") {
          const fileMeta = await drive.files.get({
            fileId: parsedArgs.fileId,
            fields: "mimeType, name",
          });

          if (fileMeta.data.mimeType === "application/vnd.google-apps.document") {
            const res = await drive.files.export({
              fileId: parsedArgs.fileId,
              mimeType: "text/plain",
            });
            return {
              content: [{ type: "text", text: res.data as string }]
            };
          } else {
            const res = await drive.files.get({
              fileId: parsedArgs.fileId,
              alt: "media",
            });
            return {
              content: [{ type: "text", text: typeof res.data === "string" ? res.data : JSON.stringify(res.data) }]
            };
          }
        }

        if (name === "download_drive_file") {
          const dest = fs.createWriteStream(parsedArgs.outputPath);
          const res = await drive.files.get(
            { fileId: parsedArgs.fileId, alt: "media" },
            { responseType: "stream" }
          );

          await new Promise((resolve, reject) => {
            res.data
              .on("error", reject)
              .pipe(dest)
              .on("error", reject)
              .on("finish", resolve);
          });

          return {
            content: [{ type: "text", text: `Successfully downloaded file to: ${parsedArgs.outputPath}` }]
          };
        }

        throw new Error(`Tool not found: ${name}`);
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error executing tool: ${err.message}` }],
          isError: true,
        };
      }
    });

    return server;
  }

  async function run() {
    await initializeDrive();
    const server = setupServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Google Drive MCP server running on stdio");
  }

  const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
  if (isMainModule) {
    run().catch((error) => {
      console.error("Server error:", error);
      process.exit(1);
    });
  }
  ```
- [ ] **Step 4: Verify state passes criteria**
  Check that ts files compile: `npm run build` or `npx tsc` inside `mcp-servers/google-drive`.
  Expected: PASS
- [ ] **Step 5: Save/Checkpoint**
  Save work to git index.

---

### Task 3: Write Onboarding README
**Targets:**
- Create: `mcp-servers/google-drive/README.md`

- [ ] **Step 1: Write/Define success criteria**
  The README must contain step-by-step instructions on setting up Google API Credentials, the local `.env` file, starting the server for the authorization callback loop, and updating `mcp_config.json`.
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Check if README exists.
  Expected: FAIL
- [ ] **Step 3: Perform minimal implementation / worker action**
  Write the file:
  ```markdown
  # Google Drive MCP Server Setup Guide

  This server provides Google Drive integration for AeroDeck. It allows searching (both filenames and full-text content), reading Google Docs as plain text, and downloading binary files locally.

  ## Prerequisites
  1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
  2. Create a new project, enable the **Google Drive API** under API Library.
  3. Navigate to **OAuth consent screen**, configure a "Desktop Application" consent screen, and add yourself as a Test User.
  4. Navigate to **Credentials**, click **Create Credentials** -> **OAuth client ID**, choose **Desktop application**, and click **Create**.
  5. Copy your **Client ID** and **Client Secret**.

  ## Server Setup
  1. Create a `.env` file in this folder:
     ```env
     GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
     GOOGLE_CLIENT_SECRET="your-client-secret"
     GOOGLE_REDIRECT_URI="http://localhost:3000/oauth2callback"
     PORT=3000
     ```
  2. Install dependencies:
     ```bash
     npm install
     ```
  3. Start the server once manually in your terminal to perform the first-time browser authentication:
     ```bash
     npm start
     ```
  4. Follow the prompt in your terminal: copy and paste the printed authorization URL into your browser, log in, and consent.
  5. The browser will redirect to localhost and display "Authentication Successful!".
  6. The server will save your credentials to `token.json` in the server root. You can stop the server process now.

  ## Registering with Antigravity
  Add the server configuration to your global `C:\Users\User\.gemini\config\mcp_config.json` file:
  ```json
  "google-drive": {
    "command": "node",
    "args": ["c:/Users/User/Antigravity/Gemini Assistant/mcp-servers/google-drive/dist/index.js"],
    "env": {}
  }
  ```
  Restart the Antigravity application to load the server.
  ```
- [ ] **Step 4: Verify state passes criteria**
  Check if `README.md` exists and contains instructions.
  Expected: PASS
- [ ] **Step 5: Save/Checkpoint**
  Commit the files.
