---
name: systematic-research
description: Use when performing general web research, scientific literature searches, fact-checking claims, or synthesizing information from multiple sources.
---
# Systematic Research

Use this skill to guide thorough search, cross-referencing, verification, and formatting of factual research reports.

## Workflow

### Phase 1: Source Harvesting & Matrix Creation
Before writing any draft or report, gather your sources and build a **Source Matrix** in a temporary note or scratchpad:
1. **Query Planning:** Formulate 2-3 distinct search queries using search engines or academic databases.
2. **Document Retrieval:** Retrieve the contents of search results.
3. **Delegated Summarization (Token Conservation):** For long articles or search result contents, delegate the summarization to a secondary model (e.g., Kimi) using the `route_task` tool from the `model-router` server (using `modelTier: "smart"`).
4. **Source Matrix Construction:** Build a table in a scratchpad with:
   * **Source Identifier:** Short tag (e.g., `[Smith et al., 2024]` or `[Domain/URL]`).
   * **Key Claims/Findings:** Key facts extracted from the delegated summary.
   * **Evidence Strength/Confidence:** High/Medium/Low based on the source's authority (e.g., peer-reviewed study vs. blog post).

### Phase 2: Cross-Referencing & Conflict Resolution
Evaluate and cross-reference findings from the Source Matrix:
1. **Verify Claims:** Check if each non-trivial claim is supported by at least two independent sources.
2. **Conflict Analysis:** Look for contradictions or conflicting claims.
3. **Resolution & Confidence Rating:**
   * If claims agree: Assign **High Confidence** and link the supporting sources.
   * If sources conflict: Explain the disagreement neutrally, noting the respective sources' evidence strength. Assign **Medium/Low Confidence**.
   * If a claim relies on only a single source: Highlight it as a single-source finding with **Medium Confidence** and note the source's authority.

### Phase 3: Synthesis, Inline Citations, and Bibliography
Format the final output according to these rules:
1. **Heading Hierarchy & Structure:** Use clean markdown headings with an "Executive Summary/Key Findings" section.
2. **Inline Citations:** Format every factual claim with clickable inline links pointing directly to the source URL or specific database ID (e.g., `[Smith et al., 2024](https://...)`). Do not use raw URLs or unlinked text for inline citations.
3. **Confidence Disclosure:** Use callouts or tags (e.g., `[High Confidence]`, `[Conflicting Evidence]`) in the body to make the certainty of key claims explicit.
4. **References/Bibliography:** Include a comprehensive **References** section at the bottom listing all cited sources with their authors, titles, publication dates, and URLs/DOIs.
