---
name: document-drafting
description: Use when creating, rewriting, or editing reports, executive summaries, emails, cover letters, instructions, or structured document files.
---
# Document Drafting

Use this skill to guide the planning, writing, formatting, and refining of high-quality documents.

## Workflow

### Phase 1: Audience & Tone Profiling
Before drafting, analyze the target reader and select the appropriate tone profile:
1. **Audience Analysis:** Identify who will read the document (e.g., executive, technical peer, client, general public).
2. **Raw Source Summarization & Multimodal Handling (Token Conservation):** 
   * For long text inputs or reference documents, delegate summarization to alternative models using the `model-router`'s `route_task` tool with `modelTier: "smart"`.
   * For **images or PDFs**, delegate the analysis and text extraction to the Model Router using `modelTier: "multimodal"`, which dynamically selects the appropriate vision-capable model (like GPT-4o, Gemini, or Claude) based on the user's active API keys.
3. **Tone Selection:** Choose a predefined profile or mix them:
   * **Professional:** Formal vocabulary, active voice, objective, concise.
   * **Technical:** Precise terminology, structured data, explanation of systems, clear specifications.
   * **Conversational:** Engaging, simple vocabulary, direct address, warm but polite.
   * **Executive:** Bottom-line up front (BLUF), bulleted key takeaways, focusing on high-level impact.

### Phase 2: Drafting & Structure
The final drafting must be executed directly by the **main agent** (to leverage full active conversation context and user alignment). Draft the content according to the type of document:
1. **Document Templates:**
   * **Reports & Briefs:** Must start with an **Executive Summary** (max 150 words) and key takeaways.
   * **Correspondence (Emails/Letters):** Must follow the **BLUF (Bottom Line Up Front)** rule in the first two sentences.
   * **Guides & Procedures:** Must include a numbered step-by-step layout with expected outcomes for each step.
2. **Formatting & Styling Standards:**
   * Use standard Markdown headers (`#`, `##`, `###`) sequentially.
   * Emphasize key metrics, decisions, or terms in **bold**.
   * Break down dense text blocks into bulleted or numbered lists.
   * Do not use generic placeholders—always resolve them or prompt the user for them beforehand.

### Phase 3: Post-Draft Editing Checklist
After drafting, verify the output against this edit checklist:
* **Clarity Check:** Are the main points clear and easy to understand on first read?
* **Brevity Check:** Can any sentences or paragraphs be shortened without losing meaning?
* **Formatting Check:** Are the markdown elements rendered correctly? Are there lists and bold text for readability?
* **Tone Match:** Does the text strictly match the selected profile from Phase 1?
