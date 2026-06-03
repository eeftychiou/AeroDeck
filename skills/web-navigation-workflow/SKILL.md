---
name: web-navigation-workflow
description: Use when you need to navigate the web, load web pages, or extract information from websites using the browser-automation MCP server
---

# Web Navigation Workflow

## Overview
This skill provides instructions on how to use the `browser-automation` MCP server to navigate the web, load pages, and deal with common web obstacles.

## When to Use
- You need to access a live web page or web application.
- You need to extract information from a website that requires browser rendering.
- You need to interact with web content using the `browser-automation` server.

## Connecting to the MCP Server
The `browser-automation` server runs on **Node.js** and is located in the `mcp-servers/browser-automation` directory. 
The tools provided by this MCP server (such as `navigate`) will be **automatically provided in your context**. You do not need to manually start the server, configure paths, or perform any manual connection steps; simply use the tools available to you.

## Navigation & DOM Rules
When using tools to interact with web pages, you must follow these explicit rules to ensure reliability:
- **Persistent Pages**: The server uses a persistent `activePage` behind the scenes. Once you navigate to a page, it remains open. Do not repeatedly navigate to the same URL unless changing destinations.
- **Wait for Network Idle**: Always ensure the page fully loads and the network becomes idle before proceeding. Modern web pages render content asynchronously and may require time after the initial load.
- **Extracting the DOM**: After navigating and waiting, extract the DOM to understand the page structure. Use available evaluation tools to retrieve HTML, inner text, or specific node structures.
- **Handling CSS Selectors**: Be precise with your CSS selectors. When querying elements, prefer stable attributes like `id`, `data-testid`, or explicit structural paths.
- **Retry Logic**: Implement retry logic when interacting with web pages. Elements might take time to appear in the DOM. If an element is not found, wait briefly and evaluate the DOM again.

## Dealing with Cookie Banners and Popups
Modern web pages frequently display cookie consent banners or modals that obscure content. Even if a dedicated click tool has not yet been built, you must anticipate these obstacles:
- Inspect the DOM specifically for common banner or popup identifiers (e.g., `#cookie-banner`, `.modal-overlay`).
- Use available DOM evaluation tools to bypass them, such as injecting JavaScript to hide the banner (`element.style.display = 'none'`) or programmatically clicking the "Accept" button (`element.click()`).

## Example Workflow

```markdown
1. **Thought:** I need to load the target URL, wait for it to be fully rendered, and extract its content while ensuring no cookie banners block my view.
2. **Action:** Call the `navigate` tool with the target URL.
3. **Action:** Wait for the network to reach an idle state so all asynchronous content is fully loaded.
4. **Action:** Evaluate JavaScript to extract the current DOM/HTML. 
5. **Thought:** Let me check if there's a cookie banner in the extracted DOM. I see a `<div id="cookie-consent-modal">`.
6. **Action:** Evaluate JavaScript to remove or accept the cookie banner (e.g., `document.getElementById('cookie-consent-modal').remove();`).
7. **Action:** Re-extract the clean DOM to parse the required information.
8. **Thought:** The page is now clean. I'll use precise CSS selectors to extract the target data. If my selector fails, I will apply retry logic and check again.
```
