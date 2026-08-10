# AeroDeck Utility & Administrative Scripts

This directory contains administrative utilities, setup tools, search automation scripts, and release versioning tools for AeroDeck.

## Summary of Scripts

| Script / Directory | Description | Primary Usage |
| ------------------ | ----------- | ------------- |
| [`scripts/setup/`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/scripts/setup) | Interactive CLI setup wizard for AeroDeck configuration | `npm run setup` |
| [`scripts/outlook-search.ps1`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/scripts/outlook-search.ps1) | PowerShell MAPI script to search local Outlook mailboxes & attachments | `powershell -File scripts/outlook-search.ps1 -Query "..."` |
| [`scripts/bump-version.sh`](file:///c:/Users/User/Antigravity/Gemini%20Assistant/scripts/bump-version.sh) | Bash version bump and drift audit tool | `bash scripts/bump-version.sh 6.0.0` |

---

## 1. Setup Wizard (`scripts/setup/`)

The setup wizard provides an interactive command-line interface for setting up AeroDeck dependencies, API keys, Google Drive OAuth integration, and workspace environment settings.

### Execution
Run from the root of the repository:
```bash
npm run setup
```
Or directly within the directory:
```bash
cd scripts/setup
npm install
npm start
```

---

## 2. Outlook Mailbox Search (`scripts/outlook-search.ps1`)

A PowerShell script utilizing Windows Outlook COM/MAPI objects (`Outlook.Application`) to search local Outlook folders (`Sent Items`, `Inbox`), filter by date ranges, extract metadata, and optionally download email attachments.

### Parameters

- **`-Query <string>`**: Search string matched against email Subject, Body, and Sender Name. Default: `""` (matches all).
- **`-Folder <string>`**: Target Outlook folder. Supported values: `"Sent Items"` (default), `"Inbox"`.
- **`-SentOnly`**: Switch flag to explicitly target the Sent Items folder (`olFolderSentMail`).
- **`-StartDate <string>`**: Filters emails sent on or after this date (e.g., `"2026-08-01"` or `"08/01/2026"`).
- **`-EndDate <string>`**: Filters emails sent on or before this date (e.g., `"2026-08-10"` or `"08/10/2026"`).
- **`-MaxResults <int>`**: Maximum number of emails to return. Default: `10`.
- **`-IncludeFullBody`**: Switch flag. When set, returns full email body text; otherwise truncates body to 300 characters.
- **`-SaveAttachments`**: Switch flag. When set, extracts and saves email attachments to disk.
- **`-AttachmentOutputDir <string>`**: Directory path where attachments are saved when `-SaveAttachments` is passed. Default: `"scratch/outlook_attachments"`.

### Example Usage

```powershell
powershell -ExecutionPolicy Bypass -File scripts/outlook-search.ps1 `
  -Query "Project Update" `
  -StartDate "2026-08-01" `
  -EndDate "2026-08-10" `
  -SaveAttachments `
  -IncludeFullBody `
  -MaxResults 5
```

---

## 3. Version Bump & Audit Tool (`scripts/bump-version.sh`)

A Bash script that maintains version synchronization across all manifest files registered in `.version-bump.json` (such as `package.json`, `plugin.json`, `gemini-extension.json`, etc.) and performs repo-wide audits to catch hardcoded version drift.

### Arguments & Usage

- **`bash scripts/bump-version.sh <new-version>`**: Bumps version across all target files declared in `.version-bump.json` to `<new-version>` (e.g. `6.0.0`) and runs an audit automatically.
- **`bash scripts/bump-version.sh --check`**: Inspects declared manifest files and checks if all versions match. Exits with non-zero status if drift is detected.
- **`bash scripts/bump-version.sh --audit`**: Runs `--check` and searches the repository for undeclared occurrences of the current version string to identify hardcoded references.

### Example Usage

```bash
# Check version alignment across manifests
bash scripts/bump-version.sh --check

# Bump all manifests to version 6.0.0
bash scripts/bump-version.sh 6.0.0

# Audit repository for stale version references
bash scripts/bump-version.sh --audit
```
