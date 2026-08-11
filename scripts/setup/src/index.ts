import prompts from "prompts";
import chalk from "chalk";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { setupModels } from "./setup-models.js";
import { setupGoogle } from "./setup-google.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../../");

async function run() {
  console.log(chalk.bold.cyan("\n========================================================"));
  console.log(chalk.bold.cyan("           AeroDeck Interactive Setup Wizard           "));
  console.log(chalk.bold.cyan("========================================================\n"));

  // 1. Model Router Configuration
  const modelConfigAns = await prompts({
    type: "confirm",
    name: "setupModels",
    message: "Do you want to configure AI Model Providers & Model Router?",
    initial: true
  });

  if (modelConfigAns.setupModels) {
    await setupModels();
  }

  // 2. Google Workspace & Drive Setup
  const driveAns = await prompts({
    type: "confirm",
    name: "setupDrive",
    message: "Do you want to configure Google Drive & Workspace integration?",
    initial: true
  });

  if (driveAns.setupDrive) {
    await setupGoogle();
  }

  // 3. System Environment Diagnostics
  console.log(chalk.bold.yellow("Running system environment diagnostics...\n"));
  try {
    const pythonCheck = execSync("python --version", { encoding: "utf-8" });
    console.log(chalk.green(`✔ Python detected: ${pythonCheck.trim()}`));
  } catch (e) {
    try {
      const python3Check = execSync("python3 --version", { encoding: "utf-8" });
      console.log(chalk.green(`✔ Python 3 detected: ${python3Check.trim()}`));
    } catch (err) {
      console.log(chalk.red("✖ Python is not detected in your PATH. Install Python to run data-processing and transcript-processing skills."));
    }
  }

  try {
    execSync(process.platform === "win32" ? "where ffmpeg" : "which ffmpeg", { stdio: "ignore" });
    console.log(chalk.green("✔ ffmpeg detected (required for video/audio extraction)."));
  } catch (e) {
    console.log(chalk.yellow("⚠ ffmpeg is not detected in your PATH. Video-to-audio processing will fail."));
    console.log(chalk.gray("   To install ffmpeg on Windows: run 'winget install ffmpeg' or 'choco install ffmpeg'."));
  }
  console.log("");

  // 4. MCP Server Registration
  console.log(chalk.bold.yellow("Registering MCP servers in mcp_config.json..."));
  try {
    if (process.platform === "win32") {
      execSync("powershell -File .\\install.ps1", { cwd: rootDir, stdio: "inherit" });
    } else {
      execSync("node scripts/setup/register-unix.js", { cwd: rootDir, stdio: "inherit" });
    }
    console.log(chalk.green("✔ MCP Servers registered successfully!\n"));
  } catch (e: any) {
    console.log(chalk.red(`✖ MCP Server registration failed: ${e.message}\n`));
  }

  console.log(chalk.bold.green("========================================================"));
  console.log(chalk.bold.green("         AeroDeck Setup Complete & Ready to Use!        "));
  console.log(chalk.bold.green("========================================================\n"));
}

run().catch(console.error);
