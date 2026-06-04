# Design Options: General-Purpose Agentic Capabilities in AeroDeck

This document summarizes the options and architecture details for expanding AeroDeck to support general-purpose agentic tasks, such as browser automation, email management, OAuth2 flows, and scheduling.

---

## 1. Browser Automation (Playwright)

To fill forms, register for events, and apply online, the agent needs a reliable browser automation interface.

### Option A: Playwright Python Script Suite (Recommended)
- **Implementation**: A set of standalone Python scripts using `playwright-python`.
- **Key Features**:
  - `browser_run.py`: Script to navigate, click, fill forms, and solve basic interaction flows.
  - State persistence: Save/restore browser state (cookies, local storage) to a JSON file (e.g., `browser_state.json`) to keep the user logged in across runs.
- **AeroDeck Skill**: `skills/browser-automation/SKILL.md` detailing the RED-GREEN cycle for DOM element interactions, taking screenshots on failure, and selector detection.

### Option B: Node.js/Playwright Integration
- **Implementation**: Node.js scripts using Playwright.
- **Key Features**: Similar to Option A, but using JS.
- **Comparison**: Python is typically easier for users to configure and integrate with scientific/data pipelines, whereas JS is native to web technologies.

---

## 2. Email Management (IMAP/SMTP)

To read incoming verification codes, reply to emails, and send updates.

### Option A: Generic IMAP/SMTP Helper
- **Implementation**: Python script using standard libraries (`imaplib`, `smtplib`, `email`).
- **Key Features**:
  - `email_client.py`: Commands to search inbox (e.g., search by sender/subject to extract verification codes), read email body, and send text/HTML emails.
  - Credentials read from `.env` or system environment variables.
- **AeroDeck Skill**: `skills/email-management/SKILL.md` detailing safety procedures (e.g., never emailing unrecognized addresses, verifying email content draft with the human partner first).

---

## 3. OAuth2 Flow Manager

To handle secure authorization with platforms like Gmail, Google Calendar, Slack, etc.

### Option A: Local OAuth2 Helper Server
- **Implementation**: A lightweight Python helper (`oauth_helper.py`) that boots a local web server (e.g., on port 8080) to capture redirect URLs and exchange authorization codes for access/refresh tokens.
- **Key Features**:
  - Automatically handles authorization URLs.
  - Caches tokens securely in a local encrypted or plain JSON file.

---

## 4. Task Scheduler / Cron Utility

To run recurring checks (e.g., check email every 15 minutes, scrape a form submission status daily).

### Option A: Simple Python Cron Runner
- **Implementation**: A lightweight python daemon/runner (`scheduler.py`) that loads a local `schedule.json` list and triggers tasks.
- **AeroDeck Skill**: `skills/task-scheduling/SKILL.md` detailing how to configure cron expressions and review execution logs.
