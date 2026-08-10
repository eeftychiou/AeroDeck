# Model Router v4-flash & MiniMax-M3 High Reasoning Effort Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure Model Router MCP to use `deepseek-v4-flash` and `minimax-M3` models with high reasoning effort (`reasoningEffort: "high"`), execute all test cases across the repo, and push to GitHub.

**Architecture:** Update `config.json` tier definitions, modify `mcp-servers/model-router/src/index.ts` to forward reasoning effort parameters in AI SDK `generateText`, update live/unit test suites, and orchestrate git push.

**Tech Stack:** TypeScript, Vercel AI SDK (`@ai-sdk/openai`, `generateText`), Jest, Git.

## Global Constraints
- Zero breaking changes to existing MCP `route_task` tool signature.
- `config.json` must reflect `deepseek-v4-flash` for DeepSeek/smart tier and `minimax-M3` for MiniMax/fast tier.
- AI SDK calls must include high reasoning effort parameters.
- All 5 test suites must pass 100% before committing and pushing.

---

### Task 1: Update Model Router Settings & High Reasoning Effort Logic

**Files:**
- Modify: `mcp-servers/model-router/config.json`
- Modify: `mcp-servers/model-router/src/index.ts`

- [ ] **Step 1: Update config.json default models**

Update `mcp-servers/model-router/config.json`:
```json
{
  "default_model": "deepseek-v4-flash",
  "tiers": {
    "fast": {
      "provider": "minimax",
      "model": "minimax-M3",
      "reasoningEffort": "high"
    },
    "smart": {
      "provider": "deepseek",
      "model": "deepseek-v4-flash",
      "reasoningEffort": "high"
    },
    "reasoning": {
      "provider": "deepseek",
      "model": "deepseek-v4-flash",
      "reasoningEffort": "high"
    }
  },
  "providers": {
    "deepseek": {
      "baseURL": "https://api.deepseek.com",
      "apiKeyEnv": "DEEPSEEK_API_KEY",
      "defaultModel": "deepseek-v4-flash"
    },
    "minimax": {
      "baseURL": "https://api.minimaxi.chat/v1",
      "apiKeyEnv": "MINIMAX_API_KEY",
      "defaultModel": "minimax-M3"
    }
  }
}
```

- [ ] **Step 2: Update src/index.ts to pass reasoningEffort: "high" to generateText**

In `mcp-servers/model-router/src/index.ts`:
```typescript
const { text } = await generateText({
  model,
  prompt,
  providerOptions: {
    openai: {
      reasoningEffort: "high"
    }
  }
});
```

- [ ] **Step 3: Rebuild TypeScript and verify compilation**

Run: `npm --prefix mcp-servers/model-router run build`
Expected: Success with 0 errors.

---

### Task 2: Update & Execute Model Router Integration Tests

**Files:**
- Modify: `mcp-servers/model-router/tests/router-live.integration.test.ts`
- Modify: `mcp-servers/model-router/tests/router.test.ts`

- [ ] **Step 1: Update live integration test assertions**

Ensure live tests check `deepseek-v4-flash` and `minimax-M3` execution.

- [ ] **Step 2: Run model-router test suite**

Run: `npm --prefix mcp-servers/model-router test`
Expected: All unit & integration tests pass.

---

### Task 3: Master Test Suite Verification & Fixes

**Files:**
- Execute master test runner across all components.

- [ ] **Step 1: Run root test suite**

Run: `npm test`
Expected: All 5 test suites (`browser-automation`, `model-router`, `google-drive`, `scripts/setup`, `telegram-bridge`) pass cleanly.

---

### Task 4: Commit & Push to GitHub

- [ ] **Step 1: Create Git Commit**

Commit message: `feat(model-router): update default models to deepseek-v4-flash and minimax-M3 with high reasoning effort`

- [ ] **Step 2: Push to GitHub**

Run: `git push origin main`
Expected: Pushed to GitHub repository cleanly.
