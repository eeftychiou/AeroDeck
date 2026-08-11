# Google Drive & Workspace MCP Server Setup Guide

This server provides Google Drive & Workspace integration for AeroDeck. It allows searching (both filenames and full-text content), reading Google Docs as plain text, and downloading binary files locally.

---

## 1. Automated Setup (Recommended)

You can automatically configure Google Workspace credentials and complete OAuth authentication using the AeroDeck Setup Wizard:

```bash
# Automated setup for Google Workspace & Drive
npm run setup:google
```

The wizard will:
1. Allow you to import a downloaded Google Cloud `credentials.json` file OR enter Client ID & Secret manually.
2. Spin up a local OAuth callback server on `http://localhost:3000/oauth2callback`.
3. Open your browser automatically for consent.
4. Save refresh tokens to `token.json` and configuration to `.env`.

---

## 2. Google Cloud Console Setup (Step-by-Step)

If you haven't created Google Cloud OAuth credentials yet:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `AeroDeck-Drive-Integration`).
3. Enable the **Google Drive API** under **APIs & Services** -> **Library**.
4. Configure **OAuth consent screen**:
   - Select **User Type**: **Internal** (for Google Workspace enterprise users) or **External** (for personal Gmail accounts).
   - Fill in App Name (e.g. `AeroDeck Agent`) and User Support Email.
   - Add Scope: `https://www.googleapis.com/auth/drive.readonly`.
   - **Crucial for Personal/External Accounts**: Add your email under **Test Users**.
5. Create Credentials:
   - Navigate to **Credentials** -> **Create Credentials** -> **OAuth client ID**.
   - Application type: **Desktop App**.
   - Download the JSON file (`credentials.json`) or copy **Client ID** and **Client Secret**.

---

## 3. Re-Authentication & Token Renewal

To re-authorize or switch Google accounts at any time, run:

```bash
npm run setup:google
```

Select **Yes** when prompted to re-authorize Google Workspace access.

---

## 4. Manual Registration

If you prefer to register the MCP server manually in `mcp_config.json`:

```json
"google-drive": {
  "command": "node",
  "args": ["/path/to/AeroDeck/mcp-servers/google-drive/dist/index.js"],
  "env": {}
}
```
