import fs from "fs";
import path from "path";

const defaultLogPath = path.resolve(__dirname, "../browser-automation.log");
const logFilePath = process.env.BROWSER_AUTOMATION_LOG_PATH || defaultLogPath;

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

const LOG_SEVERITY: Record<LogLevel, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const currentLevelStr = (process.env.BROWSER_AUTOMATION_LOG_LEVEL || "INFO").toUpperCase();
const currentLevel: LogLevel = LOG_SEVERITY[currentLevelStr as LogLevel] !== undefined ? (currentLevelStr as LogLevel) : "INFO";

export const logger = {
  logMessage(level: LogLevel, message: string, meta?: any) {
    if (LOG_SEVERITY[level] < LOG_SEVERITY[currentLevel]) {
      return; // Silently drop logs below configured severity
    }

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
  },
  debug(message: string, meta?: any) {
    this.logMessage("DEBUG", message, meta);
  },
  info(message: string, meta?: any) {
    this.logMessage("INFO", message, meta);
  },
  warn(message: string, meta?: any) {
    this.logMessage("WARN", message, meta);
  },
  error(message: string, meta?: any) {
    this.logMessage("ERROR", message, meta);
  },
  setupStdioProtection() {
    process.env.AI_SDK_LOG_WARNINGS = "false";
  
    // Redirect console methods that naturally write to stdout
    console.log = (...args: any[]) => {
      this.info(args.map(a => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "));
    };
    console.info = (...args: any[]) => {
      this.info(args.map(a => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "));
    };
    console.warn = (...args: any[]) => {
      this.warn(args.map(a => (typeof a === "object" ? JSON.stringify(a) : a)).join(" "));
    };
  
    // Capture uncaught exceptions and unhandled rejections to prevent raw process crash output on stdout
    process.on("uncaughtException", (error: Error) => {
      this.error("Uncaught Exception detected in Browser Automation process", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    });
  
    process.on("unhandledRejection", (reason: any) => {
      this.error("Unhandled Promise Rejection detected in Browser Automation process", reason);
    });
  
    this.info("Browser Automation Stdio Guard initialized. All debug logs routed to stderr and " + logFilePath);
  }
};
