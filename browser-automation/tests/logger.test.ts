import { logger } from "../src/logger";
import fs from "fs";

describe("Logger", () => {
  const originalEnv = process.env;
  let consoleErrorMock: jest.SpyInstance;
  let appendFileSyncMock: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});
    appendFileSyncMock = jest.spyOn(fs, "appendFileSync").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it("should log info by default", () => {
    logger.info("Test message");
    expect(consoleErrorMock).toHaveBeenCalled();
    expect(consoleErrorMock.mock.calls[0][0]).toContain("[INFO] Test message");
    expect(appendFileSyncMock).toHaveBeenCalled();
  });

  it("should ignore debug logs if level is INFO", () => {
    process.env.BROWSER_AUTOMATION_LOG_LEVEL = "INFO";
    logger.debug("Test debug message");
    expect(consoleErrorMock).not.toHaveBeenCalled();
    expect(appendFileSyncMock).not.toHaveBeenCalled();
  });

  it("should setup stdio protection", () => {
    const originalConsoleLog = console.log;
    logger.setupStdioProtection();
    expect(console.log).not.toBe(originalConsoleLog);
    
    console.log("Stdio test");
    expect(consoleErrorMock).toHaveBeenCalled();
    expect(consoleErrorMock.mock.calls[0][0]).toContain("Browser Automation Stdio Guard initialized");
    expect(consoleErrorMock.mock.calls[1][0]).toContain("[INFO] Stdio test");
  });
});
