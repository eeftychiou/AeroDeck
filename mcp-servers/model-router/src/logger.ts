import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultLogPath = path.resolve(__dirname, "../model-router.log");

const logFilePath = process.env.MODEL_ROUTER_LOG_PATH || defaultLogPath;

export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export function logMessage(level: LogLevel, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  let metaStr = "";
  if (meta !== undefined) {
    try {
      metaStr = typeof meta === "string" ? meta : JSON.stringify(meta);
    } catch {
      metaStr = String(meta);
    }
  }

  const logLine = `[${timestamp}] [${level}] ${message} ${metaStr}`.trim() + "\n";

  // Always write log messages to stderr so stdio JSON-RPC on stdout is NEVER corrupted
  console.error(logLine.trim());

  // Also append to local debug log file for persistent troubleshooting
  try {
    fs.appendFileSync(logFilePath, logLine);
  } catch (err) {
    // Fallback silently if file is not writable
  }
}

/**
 * Protects the stdio MCP protocol by redirecting stdout writes from libraries
 * (e.g. Vercel AI SDK console.log/console.info/console.warn) to stderr/file logging.
 */
export function setupStdioProtection() {
  process.env.AI_SDK_LOG_WARNINGS = "false";

  // Preserve native stdout write for valid MCP JSON-RPC protocol messages
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);

  // Redirect console methods that naturally write to stdout
  console.log = (...args: any[]) => {
    logMessage("INFO", args.map(a => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "));
  };
  console.info = (...args: any[]) => {
    logMessage("INFO", args.map(a => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "));
  };
  console.warn = (...args: any[]) => {
    logMessage("WARN", args.map(a => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "));
  };

  // Capture uncaught exceptions and unhandled rejections to prevent raw process crash output on stdout
  process.on("uncaughtException", (error: Error) => {
    logMessage("ERROR", "Uncaught Exception detected in Model Router process", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  });

  process.on("unhandledRejection", (reason: any) => {
    logMessage("ERROR", "Unhandled Promise Rejection detected in Model Router process", reason);
  });

  logMessage("INFO", "Model Router Stdio Guard initialized. All debug logs routed to stderr and " + logFilePath);
}
