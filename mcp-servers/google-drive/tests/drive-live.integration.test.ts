import { describe, it, expect } from "@jest/globals";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tokenPath = path.resolve(__dirname, "../token.json");

const hasCredentials = Boolean(
  (process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID) &&
  (process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET) &&
  (process.env.GOOGLE_DRIVE_REFRESH_TOKEN || fs.existsSync(tokenPath))
);

const describeLive = hasCredentials ? describe : describe.skip;

describeLive("Google Drive Live Integration Tests (Gated)", () => {
  it("should connect and list files from live Google Drive API", async () => {
    const { getOAuth2Client } = await import("../src/auth.js");
    const { google } = await import("googleapis");

    const auth = await getOAuth2Client();
    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.list({
      pageSize: 5,
      fields: "files(id, name, mimeType)",
    });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.files)).toBe(true);
  });
});
