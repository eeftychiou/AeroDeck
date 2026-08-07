# Outlook Mailbox Search & Research Integration Design

**Date:** 2026-08-07  
**Status:** Approved  
**Target Plugin/Component:** AeroDeck Core / Scripts & Skills  

---

## 1. Overview & Context

AeroDeck agents often perform research tasks that require context from past correspondence, project discussions, or shared attachments stored in local Microsoft Outlook desktop mailboxes.

This design introduces a zero-dependency local Outlook search tool (`scripts/outlook-search.ps1`) and a corresponding workflow skill (`skills/outlook-mail-research/SKILL.md`). Together, they enable research agents and subagents to query local Outlook mail stores (specifically focusing on sent mail, date range filtering, full message body retrieval, and attachment extraction for research analysis).

---

## 2. Goals & Key Requirements

- **Local & Zero External Dependencies:** Run directly against the Windows Desktop Outlook MAPI client without requiring Azure AD registration, cloud API tokens, or 3rd party dependencies.
- **Sent Mail Targeting:** Provide explicit support for searching sent items (`-SentOnly` / `-Folder "Sent Items"`) to isolate outbound communications and decisions.
- **Precise Date Range Filtering:** Allow filtering by `-StartDate` and `-EndDate` formatted as ISO dates (`YYYY-MM-DD`), executing MAPI/DASL query restrictions at the store level.
- **Full Email Body Retrieval:** Option to include complete plain-text email bodies for deep synthesis in research tasks.
- **Attachment Extraction:** Automatically save attachments (PDF, DOCX, XLSX, TXT, CSV) to a workspace scratch directory (`scratch/outlook_attachments/`) and return local file paths so research subagents can read and analyze them natively.

---

## 3. Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AeroDeck Agent                         │
└──────────────────────────────┬──────────────────────────────┘
                               │
               Executes powershell script
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             scripts/outlook-search.ps1                      │
│  - Parses CLI flags (-Query, -SentOnly, -StartDate, etc.)   │
│  - Instantiates Outlook COM (Outlook.Application)           │
│  - Applies DASL query restriction on MAPI store             │
│  - Extracts bodies & saves attachments to scratch/          │
│  - Outputs clean JSON payload to stdout                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Local Outlook Desktop Client                  │
│       (MAPI Folders: Sent Items, Inbox, Archives)           │
└─────────────────────────────────────────────────────────────┘
```

### Components Created:

1. **`scripts/outlook-search.ps1`**  
   Powershell CLI tool to query Outlook COM object, filter items, extract attachments, and emit JSON.

2. **`skills/outlook-mail-research/SKILL.md`**  
   Workflow skill providing instructions and guidelines for agents and research subagents on when and how to invoke the search tool during research tasks.

---

## 4. Script Parameters & Interface

`scripts/outlook-search.ps1` accepts the following parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `-Query` | String | `""` | Search text matched against Subject, Body, and Recipient names. |
| `-Folder` | String | `"Sent Items"` | Target folder (`"Sent Items"`, `"Inbox"`, or `"All"`). |
| `-SentOnly` | Switch | `False` | Forces search to target only the `Sent Items` folder (`olFolderSentMail`). |
| `-StartDate` | String | `""` | Filter emails sent/received on or after `YYYY-MM-DD`. |
| `-EndDate` | String | `""` | Filter emails sent/received on or before `YYYY-MM-DD`. |
| `-MaxResults` | Int | `10` | Maximum number of emails to return (1-50). |
| `-IncludeFullBody` | Switch | `False` | Returns complete plain-text body instead of truncated snippet. |
| `-SaveAttachments` | Switch | `False` | Saves attachments to `scratch/outlook_attachments/` and populates file paths in JSON. |

---

## 5. Output JSON Schema

```json
[
  {
    "EntryID": "000000008F...",
    "Subject": "Project Alpha Technical Specs",
    "Sender": "user@company.com",
    "Recipients": ["colleague@company.com"],
    "SentOn": "2026-07-20T14:15:00Z",
    "Folder": "Sent Items",
    "Body": "Attached are the final technical specs...",
    "HasAttachments": true,
    "Attachments": [
      {
        "FileName": "Specs_v2.pdf",
        "SavedPath": "C:\\Users\\User\\Antigravity\\Gemini Assistant\\scratch\\outlook_attachments\\Specs_v2.pdf",
        "SizeBytes": 245100
      }
    ]
  }
]
```

---

## 6. Error Handling & Security

- **COM Availability:** If Outlook desktop client is not installed or COM initialization fails, script exits with non-zero code and returns a JSON error message `{ "error": "Outlook COM application unavailable" }`.
- **Read-Only Access:** The script performs search and extraction only; it contains no methods to edit, delete, or send emails.
- **Sanitization:** HTML tags are stripped from message bodies, leaving clean plain text for agent processing.
- **Attachment Safety:** Attachments are extracted into a sandboxed `scratch/outlook_attachments/` directory within the workspace.

---

## 7. Verification Plan

1. **Powershell Execution Verification:**
   - Execute `powershell -ExecutionPolicy Bypass -File .\scripts\outlook-search.ps1 -SentOnly -MaxResults 3`
   - Verify non-empty JSON response matching schema.
2. **Date Range Verification:**
   - Test `-StartDate` and `-EndDate` flags and verify returned `SentOn` timestamps fall within bounds.
3. **Attachment Extraction Verification:**
   - Run script with `-SaveAttachments` on an email with attachments and check `scratch/outlook_attachments/` folder contents.
4. **Skill Behavior Test:**
   - Verify skill file `skills/outlook-mail-research/SKILL.md` is valid markdown and formatted according to AeroDeck guidelines.
