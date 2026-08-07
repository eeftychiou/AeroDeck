[CmdletBinding()]
param(
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

$ErrorActionPreference = "Stop"

try {
    # 1. Instantiate Outlook COM Object
    $outlook = New-Object -ComObject Outlook.Application
    $namespace = $outlook.GetNamespace("MAPI")

    # 2. Determine target folder (5 = olFolderSentMail, 6 = olFolderInbox)
    $folderEnum = 5
    if ($SentOnly -or ($Folder -eq "Sent Items")) {
        $folderEnum = 5
    } elseif ($Folder -eq "Inbox") {
        $folderEnum = 6
    } else {
        $folderEnum = 5
    }

    $folderObj = $namespace.GetDefaultFolder($folderEnum)
    $items = $folderObj.Items
    $items.Sort("[SentOn]", $true)

    # 3. Apply Date Filters via Restrict()
    $filterParts = @()
    if ($StartDate -and $StartDate.Trim() -ne "") {
        $dtStart = [datetime]::Parse($StartDate)
        $startStr = $dtStart.ToString("MM/dd/yyyy hh:mm tt", [System.Globalization.CultureInfo]::InvariantCulture)
        $filterParts += "[SentOn] >= '$startStr'"
    }
    if ($EndDate -and $EndDate.Trim() -ne "") {
        $dtEnd = [datetime]::Parse($EndDate)
        $endStr = $dtEnd.ToString("MM/dd/yyyy hh:mm tt", [System.Globalization.CultureInfo]::InvariantCulture)
        $filterParts += "[SentOn] <= '$endStr'"
    }

    if ($filterParts.Count -gt 0) {
        $filterString = $filterParts -join " and "
        $items = $items.Restrict($filterString)
    }

    # 4. Search and Process Items
    $results = @()
    $count = 0

    foreach ($item in $items) {
        if ($count -ge $MaxResults) {
            break
        }

        # Safely extract core properties
        $subject = ""
        $body = ""
        $senderName = ""

        try {
            if ($item.Subject) { $subject = $item.Subject }
            if ($item.Body) { $body = $item.Body }
            if ($item.SenderName) { $senderName = $item.SenderName }
        } catch {
            # Skip non-mail items or items with inaccessible properties
            continue
        }

        # Query Filtering (Subject, Body, SenderName)
        if ($Query -and $Query.Trim() -ne "") {
            $q = $Query.Trim()
            $matchSubject = ($subject -and ($subject.IndexOf($q, [System.StringComparison]::OrdinalIgnoreCase) -ge 0))
            $matchBody = ($body -and ($body.IndexOf($q, [System.StringComparison]::OrdinalIgnoreCase) -ge 0))
            $matchSender = ($senderName -and ($senderName.IndexOf($q, [System.StringComparison]::OrdinalIgnoreCase) -ge 0))

            if (-not ($matchSubject -or $matchBody -or $matchSender)) {
                continue
            }
        }

        # Format Body length
        $formattedBody = ""
        if ($body) {
            if ($IncludeFullBody) {
                $formattedBody = $body
            } else {
                if ($body.Length -gt 300) {
                    $formattedBody = $body.Substring(0, 300) + "..."
                } else {
                    $formattedBody = $body
                }
            }
        }

        # Process Attachments
        $attachments = @()
        try {
            if ($item.Attachments -and $item.Attachments.Count -gt 0) {
                foreach ($att in $item.Attachments) {
                    $attInfo = [ordered]@{
                        FileName  = $att.FileName
                        Size      = $att.Size
                        SavedPath = $null
                    }

                    if ($SaveAttachments) {
                        $outputDir = [System.IO.Path]::GetFullPath($AttachmentOutputDir)
                        if (-not (Test-Path -Path $outputDir)) {
                            New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
                        }
                        $safeFileName = $att.FileName -replace '[\\/:*?"<>|]', '_'
                        $prefix = [guid]::NewGuid().ToString().Substring(0, 8)
                        $savePath = Join-Path -Path $outputDir -ChildPath "${prefix}_${safeFileName}"
                        try {
                            $att.SaveAsFile($savePath)
                            $attInfo.SavedPath = $savePath
                        } catch {
                            $attInfo.SavedPath = "ERROR: " + $_.Exception.Message
                        }
                    }

                    $attachments += $attInfo
                }
            }
        } catch {
            # In case attachment collection cannot be accessed
        }

        # Recipient parsing
        $toRecipients = @()
        try {
            if ($item.Recipients) {
                foreach ($rec in $item.Recipients) {
                    $toRecipients += $rec.Name
                }
            }
        } catch {}

        # SentOn formatting
        $sentOnStr = $null
        try {
            if ($item.SentOn) {
                $sentOnStr = $item.SentOn.ToString("yyyy-MM-ddTHH:mm:ssZ")
            }
        } catch {}

        # Sender Email Address
        $senderEmail = $null
        try {
            $senderEmail = $item.SenderEmailAddress
        } catch {}

        $emailObj = [ordered]@{
            Subject            = $subject
            SenderName         = $senderName
            SenderEmailAddress = $senderEmail
            To                 = ($toRecipients -join "; ")
            SentOn             = $sentOnStr
            Body               = $formattedBody
            HasAttachments     = ($attachments.Count -gt 0)
            Attachments        = $attachments
        }

        $results += $emailObj
        $count++
    }

    # 5. Return clean JSON output
    $jsonOutput = ConvertTo-Json -InputObject @($results) -Depth 5 -Compress
    Write-Output $jsonOutput
    exit 0

} catch {
    $errObj = [ordered]@{
        error  = $_.Exception.Message
        status = "COM_ERROR"
    }
    $errJson = ConvertTo-Json -InputObject $errObj -Depth 5 -Compress
    Write-Output $errJson
    exit 1
}
