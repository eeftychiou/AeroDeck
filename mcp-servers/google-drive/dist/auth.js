import { google } from "googleapis";
import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOKEN_PATH = path.join(__dirname, "../token.json");
export async function getOAuth2Client() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/oauth2callback";
    if (!clientId || !clientSecret) {
        throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env");
    }
    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
        oAuth2Client.setCredentials(token);
        return oAuth2Client;
    }
    // First-time authorization flow
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/drive.readonly"],
        prompt: "consent",
    });
    console.error("\n==================================================");
    console.error("AUTHORIZATION REQUIRED FOR GOOGLE DRIVE MCP SERVER");
    console.error("Open the following URL in your browser to log in:");
    console.error(authUrl);
    console.error("==================================================\n");
    const code = await startLocalCallbackServer();
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.error("Authorization successful! Token saved to token.json");
    return oAuth2Client;
}
function startLocalCallbackServer() {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            const urlObj = new URL(req.url || "", "http://localhost:3000");
            if (urlObj.pathname === "/oauth2callback") {
                const code = urlObj.searchParams.get("code") || "";
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end("<h1>Authentication Successful!</h1><p>You can close this tab and return to the terminal.</p>");
                resolve(code);
                setTimeout(() => server.close(), 1000);
            }
            else {
                res.writeHead(404);
                res.end();
            }
        });
        server.listen(3000);
    });
}
