# General Purpose Agent Design Spec

## Overview
AeroDeck will be expanded to support general-purpose agentic tasks, focusing on work email management (via web clients), online form filling, job applications, and model orchestration. The system will employ a modular architecture utilizing Model Context Protocol (MCP) servers alongside Antigravity 2.0 orchestration.

## Architecture

1. **Orchestrator**: Antigravity 2.0.
2. **Workflow Rules**: AeroDeck markdown skills.
3. **Execution Engines**: Dedicated MCP servers.

## Components

### 1. Browser Automation MCP Server
A standalone Node.js or Python server leveraging Playwright.
- **Purpose**: Bypass limitations of IMAP/SMTP for work emails by directly driving webmail clients, filling online forms, and navigating job boards.
- **Tools Exposed**: `navigate_to_url`, `click_element`, `fill_input_field`, `extract_page_dom`, `take_screenshot`.
- **State Management**: Maintains persistent browser profiles (cookies/sessions) to keep the agent logged into necessary corporate portals without requiring re-authentication on every run.

### 2. Multi-Model Routing MCP Server
A server that abstracts access to secondary LLMs (e.g., via LiteLLM).
- **Purpose**: Offload simple, low-reasoning tasks (e.g., text summarization, drafting standard boilerplate email replies) from the primary orchestrator to faster, cheaper, or local models.
- **Tools Exposed**: `delegate_task_to_model(prompt, model_tier)`.

### 3. AeroDeck Skills
New workflow definitions added to the existing AeroDeck `skills/` directory.
- `web-navigation-workflow.md`: Instructions on using the Browser MCP to systematically handle UI components, wait for page loads, and submit forms reliably.
- `email-management-workflow.md`: Instructions on checking the webmail DOM, reading unread messages, formulating actions, and using the routing MCP to draft replies.

## Scope & Implementation Phases
Due to the scope, the implementation must be decomposed:
- **Phase 1**: Build the Browser Automation MCP server and draft the `web-navigation-workflow` skill.
- **Phase 2**: Draft the `email-management-workflow` skill and test it against a webmail client using the MCP.
- **Phase 3**: Build the Multi-Model Routing MCP and integrate it into the email drafting process.
