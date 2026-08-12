import { jest } from "@jest/globals";
import { logMessage, setupStdioProtection } from "../src/logger.js";

describe("Logger", () => {
  let originalError: typeof console.error;
  
  beforeEach(() => {
    originalError = console.error;
    console.error = jest.fn();
    delete process.env.MODEL_ROUTER_LOG_LEVEL;
  });

  afterEach(() => {
    console.error = originalError;
  });

  it("should drop DEBUG logs when level is INFO (default)", () => {
    logMessage("DEBUG", "this is a debug message");
    expect(console.error).not.toHaveBeenCalled();
  });

  it("should log INFO logs when level is INFO (default)", () => {
    logMessage("INFO", "this is an info message");
    expect(console.error).toHaveBeenCalled();
  });

  it("should log ERROR logs when level is INFO (default)", () => {
    logMessage("ERROR", "this is an error message");
    expect(console.error).toHaveBeenCalled();
  });
});
