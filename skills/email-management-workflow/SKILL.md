---
name: email-management-workflow
description: Workflow for using the browser-automation and model-router MCP servers to read and respond to emails.
---
# Email Management Workflow

This skill provides the standard workflow for interacting with webmail interfaces to read unread emails and automatically draft replies using the `browser-automation` and `model-router` MCP servers.

**Note:** The tools from the `browser-automation` and `model-router` MCP servers are automatically available in your context when you are assigned this task.

## Prerequisites & Tool Overview

1. **`browser-automation` Server:** Provides tools for web navigation, DOM extraction, and element interaction (clicking, typing).
2. **`model-router` Server:** Provides the `route_task` tool, which delegates isolated text generation (like drafting an email reply) to a secondary LLM model optimized for writing, saving primary agent context and compute.

## General Rules and Best Practices

- **Wait for Page Loads:** Always explicitly wait for the network to become idle after a navigation or a click that triggers a page load. Webmail clients are heavy single-page applications (SPAs) and require time to render.
- **Robust CSS Selectors:** Use generic and robust CSS selectors. Webmail DOMs are complex. Rely on aria-labels, common classes (e.g., `.unread`, `.zE`, `.bog` in Gmail), or semantic structure rather than deeply nested brittle paths.
- **Retry Logic:** If a DOM element is not found after a page transition, wait 1-2 seconds and re-extract the DOM. Implement a maximum of 3 retries before failing the workflow.
- **Delegate Drafting:** Never draft the email reply yourself. Always use the `route_task` tool to delegate the drafting process to the secondary model.

## Step-by-Step Workflow Example

Below is a concrete example of the thought process and tool sequence for handling unread emails.

### Step 1: Navigate to Webmail and Extract Unread Emails
- **Action:** Use the browser automation tool to navigate to the webmail URL (e.g., `https://mail.google.com`).
- **Action:** Wait for network idle.
- **Action:** Extract the DOM to find unread email rows. Look for elements indicating an unread status (e.g., bolded text, specific icons, or classes like `.unread`).

### Step 2: Open an Unread Email
- **Action:** Identify the CSS selector for the specific unread email row.
- **Action:** Click the email row to open it.
- **Action:** Wait for the email content to render (wait for network idle or a short delay).

### Step 3: Extract Email Content
- **Action:** Extract the DOM of the opened email to read the sender, subject, and body text.
- **Action:** Parse the extracted text to understand the context of the email.

### Step 4: Delegate Draft Generation
- **Action:** Invoke the `route_task` tool from the `model-router` MCP server.
  - **Task Description:** "Draft a polite and professional reply to the following email. Acknowledge their points and provide a brief update."
  - **Context:** Pass the extracted sender, subject, and body text.
- **Action:** Wait for the `route_task` to return the generated draft text.

### Step 5: Navigate to Reply Box and Input Draft
- **Action:** Identify the "Reply" button using DOM extraction and click it.
- **Action:** Extract the DOM to find the CSS selector for the reply text area.
- **Action:** Use the typing tool to input the generated draft into the text area.

### Step 6: Review and Send (or Save as Draft)
- **Action:** Click the "Send" button (or "Save and Close" if the user requested to only prepare drafts).
- **Action:** Verify success by extracting the DOM to check for a confirmation message (e.g., "Message sent").
