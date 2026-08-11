import prompts from "prompts";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import http from "http";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../../");

export async function setupGoogle() {
  console.log(chalk.bold.cyan("\n=== AeroDeck Google Workspace & Drive Setup ===\n"));

  console.log(chalk.bold.yellow("📋 Quick Setup Guide for Google OAuth Credentials:"));
  console.log(chalk.gray("1. Enable Google Drive API: ") + chalk.blue("https://console.cloud.google.com/apis/library/drive.googleapis.com"));
  console.log(chalk.gray("2. Go to Credentials page:  ") + chalk.blue("https://console.cloud.google.com/apis/credentials"));
  console.log(chalk.gray("3. Click '+ CREATE CREDENTIALS' -> 'OAuth client ID' -> Select 'Desktop app'."));
  console.log(chalk.gray("4. Download the JSON file or copy your Client ID & Client Secret.\n"));

  const driveDir = path.join(rootDir, "mcp-servers/google-drive");
  const driveEnvPath = path.join(driveDir, ".env");
  const tokenPath = path.join(driveDir, "token.json");

  let initialId = "";
  let initialSecret = "";

  if (fs.existsSync(driveEnvPath)) {
    const content = fs.readFileSync(driveEnvPath, "utf-8");
    initialId = content.match(/GOOGLE_CLIENT_ID="?([^"\n]+)"?/)?.[1] || "";
    initialSecret = content.match(/GOOGLE_CLIENT_SECRET="?([^"\n]+)"?/)?.[1] || "";
  }

  const modeAnswer = await prompts({
    type: "select",
    name: "inputMode",
    message: "How would you like to provide your Google Cloud OAuth credentials?",
    choices: [
      { title: "🌐 Open Google Cloud Console in browser to create credentials", value: "browser" },
      { title: "📁 Import downloaded credentials.json file", value: "file" },
      { title: "✏️  Enter Client ID & Client Secret manually", value: "manual" },
      { title: "⏭️  Skip Google Drive setup for now", value: "skip" }
    ]
  });

  if (modeAnswer.inputMode === "skip") {
    console.log(chalk.yellow("Skipping Google Drive setup.\n"));
    return;
  }

  if (modeAnswer.inputMode === "browser") {
    console.log(chalk.blue("Opening Google Cloud Console Credentials page..."));
    openBrowser("https://console.cloud.google.com/apis/credentials");
  }

  let clientId = initialId;
  let clientSecret = initialSecret;

  if (modeAnswer.inputMode === "file" || modeAnswer.inputMode === "browser") {
    const fileAnswer = await prompts({
      type: "text",
      name: "jsonPath",
      message: "Enter absolute path to your downloaded credentials.json file:"
    });

    if (fileAnswer.jsonPath) {
      const cleanPath = fileAnswer.jsonPath.trim().replace(/^["']|["']$/g, "");
      if (fs.existsSync(cleanPath)) {
        try {
          const rawJson = JSON.parse(fs.readFileSync(cleanPath, "utf-8"));
          const creds = rawJson.installed || rawJson.web;
          if (creds && creds.client_id && creds.client_secret) {
            clientId = creds.client_id;
            clientSecret = creds.client_secret;
            console.log(chalk.green("✔ Successfully extracted Client ID & Secret from credentials.json"));
          } else {
            console.log(chalk.red("✖ Invalid credentials.json format. Falling back to manual entry."));
          }
        } catch (err: any) {
          console.log(chalk.red(`✖ Failed to parse credentials file: ${err.message}`));
        }
      } else {
        console.log(chalk.red(`✖ File not found at path: ${cleanPath}`));
      }
    }
  }

  if (!clientId || !clientSecret || modeAnswer.inputMode === "manual") {
    const clientAnswers = await prompts([
      {
        type: "text",
        name: "clientId",
        message: "Enter your GOOGLE_CLIENT_ID:",
        initial: clientId
      },
      {
        type: "password",
        name: "clientSecret",
        message: "Enter your GOOGLE_CLIENT_SECRET:",
        initial: clientSecret
      }
    ]);
    clientId = clientAnswers.clientId || clientId;
    clientSecret = clientAnswers.clientSecret || clientSecret;
  }

  if (!clientId || !clientSecret) {
    console.log(chalk.yellow("⚠ Missing Google OAuth credentials. Skipping Drive configuration."));
    return;
  }

  // Save .env file for google-drive server
  const driveEnvContent = `GOOGLE_CLIENT_ID="${clientId}"\nGOOGLE_CLIENT_SECRET="${clientSecret}"\nGOOGLE_REDIRECT_URI="http://localhost:3000/oauth2callback"\nPORT=3000\n`;
  fs.writeFileSync(driveEnvPath, driveEnvContent);
  console.log(chalk.green("✔ Saved Google Drive credentials to mcp-servers/google-drive/.env"));

  // Check if re-auth or initial auth is needed
  let needAuth = !fs.existsSync(tokenPath);
  if (!needAuth) {
    const reauthAns = await prompts({
      type: "confirm",
      name: "reauth",
      message: "Existing token.json found. Do you want to re-authorize Google Workspace access?",
      initial: false
    });
    needAuth = reauthAns.reauth;
  }

  if (needAuth) {
    console.log(chalk.yellow("Starting local OAuth authorization server on http://localhost:3000/oauth2callback ..."));
    const oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      "http://localhost:3000/oauth2callback"
    );

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/drive.readonly"],
      prompt: "consent",
    });

    console.log(chalk.bold.blue("\nOpening browser for Google Workspace authorization:"));
    console.log(chalk.underline.blue(authUrl) + "\n");

    // Automatically open browser
    openBrowser(authUrl);

    try {
      const code = await startCallbackServer();
      const { tokens } = await oAuth2Client.getToken(code);
      fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
      console.log(chalk.green("✔ OAuth authentication successful! Saved token.json\n"));
    } catch (err: any) {
      console.log(chalk.red(`✖ Authorization failed: ${err.message}`));
    }
  } else {
    console.log(chalk.green("✔ Existing token.json verified.\n"));
  }

  console.log(chalk.bold.green("✔ Google Workspace & Drive setup complete!\n"));
}

function openBrowser(url: string) {
  const startCmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
  exec(`${startCmd} "${url}"`, () => {});
}

function startCallbackServer(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const urlObj = new URL(req.url || "", "http://localhost:3000");
        if (urlObj.pathname === "/oauth2callback") {
          const code = urlObj.searchParams.get("code") || "";
          const error = urlObj.searchParams.get("error");

          if (error) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(`<h1>Authentication Failed</h1><p>${error}</p>`);
            reject(new Error(error));
            server.close();
            return;
          }

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end("<h1>Google Workspace Authorization Successful!</h1><p>You can close this tab and return to the terminal.</p>");
          resolve(code);
          setTimeout(() => server.close(), 1000);
        } else {
          res.writeHead(404);
          res.end();
        }
      } catch (err) {
        reject(err);
      }
    });

    server.listen(3000, () => {});
  });
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  setupGoogle().catch(console.error);
}
