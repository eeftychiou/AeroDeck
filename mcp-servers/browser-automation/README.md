# Browser Automation MCP Server

An MCP (Model Context Protocol) server providing browser automation capabilities built with Node.js, TypeScript, Playwright, and Jest.

## Overview

The Browser Automation MCP server allows LLMs and autonomous agents to control a headless or headful Chromium browser via Playwright. It exposes standardized MCP tools for navigating web pages, retrieving page HTML content, clicking page elements, and filling out web forms.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Playwright Browsers**: Chromium browser installed via Playwright

## Installation & Build Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browser binaries (if not already installed):
   ```bash
   npx playwright install chromium
   ```

3. Build/compile TypeScript to JavaScript:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Exposed MCP Tools

The server communicates via stdio using the `@modelcontextprotocol/sdk` standard. The exposed tools are detailed below:

### 1. `navigate`
Navigates the active browser session to the specified URL. Automatically launches Chromium browser and creates a new page if none is open.

- **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "The HTTP or HTTPS URL to navigate to"
      }
    },
    "required": ["url"]
  }
  ```
- **Example Usage**:
  ```json
  {
    "url": "https://example.com"
  }
  ```

### 2. `get_content`
Retrieves the full HTML string content of the current active browser page.

- **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {}
  }
  ```
- **Example Usage**:
  ```json
  {}
  ```

### 3. `click_element`
Triggers a click event on an element matching the given CSS selector on the current page.

- **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "selector": {
        "type": "string",
        "description": "CSS selector matching the target element to click"
      }
    },
    "required": ["selector"]
  }
  ```
- **Example Usage**:
  ```json
  {
    "selector": "button#submit-form"
  }
  ```

### 4. `fill_element`
Fills a text input field matching the given CSS selector with the specified string value.

- **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "selector": {
        "type": "string",
        "description": "CSS selector matching the target input element"
      },
      "value": {
        "type": "string",
        "description": "Text value to fill into the input element"
      }
    },
    "required": ["selector", "value"]
  }
  ```
- **Example Usage**:
  ```json
  {
    "selector": "input[name='q']",
    "value": "AeroDeck automation"
  }
  ```
