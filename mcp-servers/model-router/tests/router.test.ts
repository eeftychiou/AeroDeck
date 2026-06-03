import { routeTask } from "../src/index.js";
describe("Model Router", () => {
  it("should route simple tasks successfully", async () => {
    const res = await routeTask("Say hello", "fast");
    expect(res).toBeDefined();
    expect(res).toContain("mock"); // Expecting a mock string back for now
  });
});
