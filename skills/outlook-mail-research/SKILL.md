---
name: outlook-mail-research
description: Workflow for querying local Windows Outlook mailboxes (sent & inbox), filtering date ranges, and extracting attachments for research tasks.
---

# Outlook Mail Research Workflow

Use this skill when conducting research or extracting evidence from local desktop Windows Outlook mailboxes (Sent Items & Inbox).

## Tool Execution Command

Execute the search script using PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\outlook-search.ps1 <parameters>
```

## Practical Usage Examples

### 1. Search Sent Mail for a Query
Search sent items for specific keywords or topics (returns top matching entries):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\outlook-search.ps1 -SentOnly -Query "project proposal" -MaxResults 5
```

### 2. Search Date Range with Full Bodies
Query sent mail across a specific timeframe and include full message body text for comprehensive review:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\outlook-search.ps1 -SentOnly -StartDate "2026-06-01" -EndDate "2026-08-01" -IncludeFullBody
```

### 3. Extract Attachments for Analysis
Search mail, include full body text, and automatically extract attachments to disk for direct inspection:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\outlook-search.ps1 -Query "budget forecast" -SaveAttachments -IncludeFullBody
```

## Guidelines for Research Subagents

1. **Prioritize Sent Mail (`-SentOnly`)**: Focus on sent items when looking for outbound decisions, finalized deliverables, submitted reports, and authoritative outgoing communications.
2. **Scope Search by Date Windows (`-StartDate` / `-EndDate`)**: Limit search results to relevant time ranges to speed up retrieval and reduce irrelevant matches.
3. **Inspect Saved Attachments**: Downloaded attachments are saved to `scratch/outlook_attachments/`. Inspect extracted files (PDFs, docs, spreadsheets, images) using file viewing tools (`view_file`).
4. **Cite Email Sources**: Always cite exact email metadata in research reports and artifacts:
   - **Subject**
   - **Sender**
   - **Recipient(s)**
   - **Date / Time**
