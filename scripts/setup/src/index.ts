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
    initialKimi = content.match(/KIMI_API_KEY="?([^"\n]+)"?/)?.[1] || "";
    initialMinimax = content.match(/MINIMAX_API_KEY="?([^"\n]+)"?/)?.[1] || "";
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
      initialId = content.match(/GOOGLE_CLIENT_ID="?([^"\n]+)"?/)?.[1] || "";
      initialSecret = content.match(/GOOGLE_CLIENT_SECRET="?([^"\n]+)"?/)?.[1] || "";
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

  // 3. System Environment Checks
  console.log(chalk.yellow("Running system environment diagnostics..."));
  try {
    const pythonCheck = execSync("python --version", { encoding: "utf-8" });
    console.log(chalk.green(`✔ Python detected: ${pythonCheck.trim()}`));
  } catch (e) {
    try {
      const python3Check = execSync("python3 --version", { encoding: "utf-8" });
      console.log(chalk.green(`✔ Python 3 detected: ${python3Check.trim()}`));
    } catch (err) {
      console.log(chalk.red("✖ Python is not detected in your PATH. Please install Python to run data-processing and transcript-processing skills."));
    }
  }

  try {
    execSync(process.platform === "win32" ? "where ffmpeg" : "which ffmpeg", { stdio: "ignore" });
    console.log(chalk.green("✔ ffmpeg detected (required for video/audio processing)."));
  } catch (e) {
    console.log(chalk.yellow("⚠ ffmpeg is not detected in your PATH. Video-to-audio extraction will fail. Please install ffmpeg."));
  }
  console.log("");

  // 4. Register with install script
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
