# Outlook Mailbox Search & Research Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a local Windows PowerShell Outlook COM search bridge and workflow skill to allow research agents to search sent/received Outlook emails, filter by date ranges, retrieve full message bodies, and extract attachments for research tasks.

**Architecture/Workflow:** Native PowerShell script (`scripts/outlook-search.ps1`) using COM automation (`Outlook.Application`) and MAPI DASL query filtering, paired with an AeroDeck research skill (`skills/outlook-mail-research/SKILL.md`). Operational Configuration B.

**Tech Stack/Tools:** Windows PowerShell 5.1+, Outlook MAPI COM API, JSON formatting, AeroDeck Skill Framework.

---

### Task 1: Create PowerShell Outlook Search Script (`scripts/outlook-search.ps1`)

**Targets:**
- Create: `scripts/outlook-search.ps1`

- [ ] **Step 1: Write success criteria**
```json
{
  "criteria": "scripts/outlook-search.ps1 script exists, accepts -Query, -Folder, -SentOnly, -StartDate, -EndDate, -MaxResults, -IncludeFullBody, -SaveAttachments parameters, and outputs valid JSON."
}
```

- [ ] **Step 2: Verify current state fails**
Run: `powershell -ExecutionPolicy Bypass -File .\scripts\outlook-search.ps1 -SentOnly`
Expected: FAIL (File missing)

- [ ] **Step 3: Perform minimal implementation**
Create `scripts/outlook-search.ps1` with the following implementation:
```powershell
[CmdletBinding()]
param (
    [string]$Query = "",
    [string]$Folder = "Sent Items",
    [switch]$SentOnly,
    [string]$StartDate = "",
    [string]$EndDate = "",
    [int]$MaxResults = 10,
    [switch]$IncludeFullBody,
    [switch]$SaveAttachments,
    [string]$AttachmentOutputDir = "scratch/outlook_attachments"
)

try {
    $outlook = New-Object -ComObject Outlook.Application -ErrorAction Stop
    $namespace = $outlook.GetNamespace("MAPI")
    
    # Select folder (default to Sent Items if -SentOnly or -Folder is "Sent Items" / "Sent")
    if ($SentOnly -or $Folder -eq "Sent Items" -or $Folder -eq "Sent") {
        $folderObj = $namespace.GetDefaultFolder(5) # 5 = olFolderSentMail
    } elseif ($Folder -eq "Inbox") {
        $folderObj = $namespace.GetDefaultFolder(6) # 6 = olFolderInbox
    } else {
        $folderObj = $namespace.GetDefaultFolder(5)
    }

    $items = $folderObj.Items
    $items.Sort("[SentOn]", $true) # Sort descending

    # Build DASL / Jet query filter
    $filters = @()
    if ($StartDate) {
        $startStr = ([DateTime]$StartDate).ToString("yyyy-MM-dd 00:00:00")
        $filters += "[SentOn] >= '$startStr'"
    }
    if ($EndDate) {
        $endStr = ([DateTime]$EndDate).ToString("yyyy-MM-dd 23:59:59")
        $filters += "[SentOn] <= '$endStr'"
    }

    if ($filters.Count -gt 0) {
        $filterString = $filters -join " AND "
        $items = $items.Restrict($filterString)
    }

    $results = @()
    $count = 0

    if ($SaveAttachments -and -not (Test-Path $AttachmentOutputDir)) {
        New-Item -ItemType Directory -Path $AttachmentOutputDir -Force | Out-Null
    }

    foreach ($item in $items) {
        if ($count -ge $MaxResults) { break }
        
        # Check text query match if query provided
        if ($Query) {
            $matchSubject = $item.Subject -like "*$Query*"
            $matchBody = $item.Body -like "*$Query*"
            $matchSender = $item.SenderName -like "*$Query*"
            if (-not ($matchSubject -or $matchBody -or $matchSender)) {
                continue
            }
        }

        # Process attachments
        $attachmentsList = @()
        if ($item.Attachments.Count -gt 0) {
            foreach ($att in $item.Attachments) {
                $attInfo = @{
                    FileName = $att.FileName
                    SizeBytes = $att.Size
                }
                if ($SaveAttachments) {
                    $savePath = Join-Path (Resolve-Path $AttachmentOutputDir).Path $att.FileName
                    try {
                        $att.SaveAsFile($savePath)
                        $attInfo["SavedPath"] = $savePath
                    } catch {
                        $attInfo["SavedPath"] = "Error saving: $_"
                    }
                }
                $attachmentsList += $attInfo
            }
        }

        # Select body (full or truncated)
        $bodyText = $item.Body
        if (-not $IncludeFullBody -and $bodyText -and $bodyText.Length -gt 300) {
            $bodyText = $bodyText.Substring(0, 300) + "..."
        }

        $mailObj = [PSCustomObject]@{
            EntryID        = $item.EntryID
            Subject        = $item.Subject
            Sender         = "$($item.SenderName) <$($item.SenderEmailAddress)>"
            Recipients     = ($item.Recipients | ForEach-Object { $_.Name }) -join ", "
            SentOn         = $item.SentOn.ToString("o")
            Folder         = $folderObj.Name
            Body           = $bodyText
            HasAttachments = ($item.Attachments.Count -gt 0)
            Attachments    = $attachmentsList
        }

        $results += $mailObj
        $count++
    }

    $results | ConvertTo-Json -Depth 5 -Compress
} catch {
    $errObj = [PSCustomObject]@{
        error   = $_.Exception.Message
        status  = "COM_ERROR"
    }
    $errObj | ConvertTo-Json
    exit 1
}
```

- [ ] **Step 4: Verify state passes criteria**
Run: `powershell -ExecutionPolicy Bypass -File .\scripts\outlook-search.ps1 -SentOnly -MaxResults 1`
Expected: PASS (Returns clean JSON output or handled COM response)

- [ ] **Step 5: Save/Checkpoint**
Commit changes to git:
`git add scripts/outlook-search.ps1; git commit -m "feat: add powershell outlook search bridge script"`

---

### Task 2: Create AeroDeck Workflow Skill (`skills/outlook-mail-research/SKILL.md`)

**Targets:**
- Create: `skills/outlook-mail-research/SKILL.md`

- [ ] **Step 1: Write success criteria**
```json
{
  "criteria": "skills/outlook-mail-research/SKILL.md exists with valid YAML frontmatter and step-by-step guidance for research subagents."
}
```

- [ ] **Step 2: Verify current state fails**
Inspect: `skills/outlook-mail-research/SKILL.md`
Expected: FAIL (File missing)

- [ ] **Step 3: Perform minimal implementation**
Create `skills/outlook-mail-research/SKILL.md` with content:
```markdown
---
name: outlook-mail-research
description: Workflow for querying local Windows Outlook mailboxes (sent & inbox), filtering date ranges, and extracting attachments for research tasks.
---

# Outlook Mailbox Research Workflow

This skill instructs research agents on how to search local Windows Outlook desktop mailboxes and incorporate email context/attachments into research tasks.

## Tool Execution

Agents invoke `scripts/outlook-search.ps1` via PowerShell command execution.

### Basic Usage Examples

**Search Sent Mail for a specific query:**
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\outlook-search.ps1 -SentOnly -Query "Q3 roadmap" -MaxResults 5
```

**Search Emails within a Date Range with Full Message Bodies:**
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\outlook-search.ps1 -SentOnly -StartDate "2026-06-01" -EndDate "2026-08-01" -IncludeFullBody
```

**Extract Email Attachments for Research Analysis:**
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\outlook-search.ps1 -Query "budget" -SaveAttachments -IncludeFullBody
```

## Guidelines for Research Subagents

1. **Focus on Sent Items First:** Outbound emails often contain decisions, status updates, and finalized deliverables sent to clients or colleagues. Use `-SentOnly` when searching for project decisions.
2. **Filter by Date Window:** Use `-StartDate` and `-EndDate` to scope the search to the specific time period relevant to the research query.
3. **Inspect Saved Attachments:** When `-SaveAttachments` is specified, read the extracted files in `scratch/outlook_attachments/` (using standard file viewing tools) to synthesize data from attached PDFs, spreadsheets, or documents into research artifacts.
4. **Cite Email Context:** When including findings in research reports, cite the Email Subject, Sender/Recipient, and Date (e.g., *[Email: "Q3 Planning", Sent: 2026-07-15]*).
```

- [ ] **Step 4: Verify state passes criteria**
Run check: Verify file `skills/outlook-mail-research/SKILL.md` exists and contains required frontmatter.
Expected: PASS

- [ ] **Step 5: Save/Checkpoint**
Commit changes to git:
`git add skills/outlook-mail-research/SKILL.md; git commit -m "feat: add outlook-mail-research skill"`

---

### Task 3: Integration & End-to-End Verification

**Targets:**
- Verify `scripts/outlook-search.ps1`
- Verify `skills/outlook-mail-research/SKILL.md`

- [ ] **Step 1: Write success criteria**
```json
{
  "criteria": "PowerShell script executes cleanly without syntax errors and skill file is recognized in AeroDeck workspace."
}
```

- [ ] **Step 2: Run verification command**
Run: `powershell -ExecutionPolicy Bypass -Command "& { & '.\scripts\outlook-search.ps1' -SentOnly -MaxResults 1 }"`
Expected: Clean execution (JSON output or handled COM status)

- [ ] **Step 3: Save/Checkpoint**
Commit any remaining changes to git.
