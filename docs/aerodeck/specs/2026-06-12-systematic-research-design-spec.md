# Design Specification: Systematic Research Skill

**Date:** 2026-06-12  
**Status:** Approved  
**Topic:** `systematic-research` Skill  

## Triggering Conditions

* **Name:** `systematic-research`
* **Triggering Description:** Use when performing general web research, scientific literature searches, fact-checking claims, or synthesizing information from multiple sources.

## Core Phases & Workflow

### Phase 1: Source Harvesting & Matrix Creation
Before writing any final response, the assistant must gather sources and populate a structured **Source Matrix** in its scratchpad:
1. **Query Planning:** Formulate 2-3 distinct search queries using search engines or academic databases (like PubMed, arXiv, Europe PMC).
2. **Document Retrieval:** Retrieve the contents of relevant search results using browser automation or direct database tools.
3. **Delegated Summarization (Token Conservation):** For long articles or search result content, instead of reading the entire raw text in the main session, delegate the summarization of the document to a secondary model (e.g., Kimi via the `model-router`'s `route_task` tool with `modelTier: "smart"`).
4. **Source Matrix Construction:** Build a table in a temporary markdown/text draft containing:
   * **Source Identifier:** Short tag (e.g., `[Smith et al., 2024]` or `[Domain/URL]`).
   * **Key Claims/Findings:** Key facts extracted from the delegated summary.
   * **Evidence Strength/Confidence:** High/Medium/Low based on the source's authority (e.g., peer-reviewed study vs. blog post).

### Phase 2: Cross-Referencing & Conflict Resolution
Once the Source Matrix is populated, the assistant must cross-reference and evaluate the findings:
1. **Verify Claims:** Check if each non-trivial claim is supported by at least two independent sources in the matrix.
2. **Conflict Analysis:** Scan the matrix for contradictions or conflicting claims.
3. **Resolution & Confidence Rating:**
   * If claims agree: Assign **High Confidence** and link the supporting sources.
   * If sources conflict: Explain the disagreement neutrally, noting the respective sources' evidence strength. Assign **Medium/Low Confidence** depending on the disagreement.
   * If a claim relies on only a single source: Highlight it as a single-source finding with **Medium Confidence** and note the source's authority.

### Phase 3: Synthesis, Inline Citations, and Bibliography
When drafting the final response, the assistant must apply these formatting rules:
1. **Heading Hierarchy & Structure:** Use a clear markdown structure with an Executive Summary/Key Findings section at the top.
2. **Inline Citations:** Format every factual claim with clickable inline links pointing directly to the source URL or specific database ID (e.g., `[Smith et al., 2024](https://...)` or `[PubMed ID](https://...)`). Do not use raw URLs or unlinked text for inline citations.
3. **Confidence Disclosure:** Use callouts or tags (e.g., `[High Confidence]`, `[Conflicting Evidence]`) in the body to make the certainty of key claims explicit.
4. **References/Bibliography:** Include a comprehensive **References** section at the bottom of the document listing all cited sources with their authors, titles, publication dates, and URLs/DOIs in a standardized format.
