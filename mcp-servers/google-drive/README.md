# Google Drive MCP Server Setup Guide

This server provides Google Drive integration for AeroDeck. It allows searching (both filenames and full-text content), reading Google Docs as plain text, and downloading binary files locally.

## Prerequisites
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project, enable the **Google Drive API** under API Library.
3. Navigate to **OAuth consent screen**, configure a "Desktop Application" consent screen, and add yourself as a Test User.
4. Navigate to **Credentials**, click **Create Credentials** -> **OAuth client ID**, choose **Desktop application**, and click **Create**.
5. Copy your **Client ID** and **Client Secret**.

## Server Setup
1. Create a `.env` file in this folder:
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   GOOGLE_REDIRECT_URI="http://localhost:3000/oauth2callback"
   PORT=3000
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server once manually in your terminal to perform the first-time browser authentication:
   ```bash
   npm start
   ```
4. Follow the prompt in your terminal: copy and paste the printed authorization URL into your browser, log in, and consent.
5. The browser will redirect to localhost and display "Authentication Successful!".
6. The server will save your credentials to `token.json` in the server root. You can stop the server process now.

## Registering with Antigravity
Add the server configuration to your global `C:\Users\User\.gemini\config\mcp_config.json` file:
```json
"google-drive": {
  "command": "node",
  "args": ["c:/Users/User/Antigravity/Gemini Assistant/mcp-servers/google-drive/dist/index.js"],
  "env": {}
}
```
Restart the Antigravity application to load the server.
