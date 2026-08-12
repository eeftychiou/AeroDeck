import { logger, setupStdioProtection } from "../src/logger";
import fs from "fs";
import path from "path";

describe("Logger Tests", () => {
  const logFilePath = path.resolve(process.cwd(), "google-drive.log");

  beforeEach(() => {
    // Clear log file if it exists
    if (fs.existsSync(logFilePath)) {
      fs.unlinkSync(logFilePath);
    }
  });

  it("should write INFO level logs to the log file", () => {
    logger.info("Test INFO log message");
    
    expect(fs.existsSync(logFilePath)).toBe(true);
    const content = fs.readFileSync(logFilePath, "utf8");
    expect(content).toContain("[INFO] Test INFO log message");
  });

  it("should write DEBUG level logs if level is DEBUG", () => {
    logger.debug("Test DEBUG log message");
  });
});
