[CmdletBinding()]
param(
    [ValidateSet("Auto", "Global", "Workspace")]
    [string]$Scope = "Auto",
    [string]$ProjectPath = "",
    [switch]$SkipBuild,
    [switch]$ForceLocalBuild
)

$ErrorActionPreference = "Stop"

$pluginName = "aerodeck"
$currentDir = (Resolve-Path ".").Path
$currentDirNorm = $currentDir.Replace('\', '/').ToLower()

# 1. Resolve Target Scope
if ($Scope -eq "Auto") {
    if (![string]::IsNullOrWhiteSpace($ProjectPath) -or $currentDirNorm.Contains(".agents/plugins") -or $currentDirNorm.Contains(".agents\plugins")) {
        $Scope = "Workspace"
    } else {
        $Scope = "Global"
    }
}

Write-Host "Installing AeroDeck plugin (Scope: $Scope)..."

# 2. Determine paths according to scope
if ($Scope -eq "Workspace") {
    if (![string]::IsNullOrWhiteSpace($ProjectPath)) {
        $resolvedProjectPath = [System.IO.Path]::GetFullPath($ProjectPath)
        $pluginDir = Join-Path $resolvedProjectPath ".agents\plugins\$pluginName"
    } else {
        $pluginDir = $currentDir
    }
    # Plugin-scoped MCP configuration file
    $mcpConfigFile = Join-Path $pluginDir "mcp_config.json"
} else {
    $pluginDir = "$env:USERPROFILE\.gemini\config\plugins\$pluginName"
    $mcpConfigFile = "$env:USERPROFILE\.gemini\config\mcp_config.json"
}

# 3. Copy plugin files if source directory is not already the target directory
$resolvedSourceFile = (Resolve-Path ".\plugin.json" -ErrorAction SilentlyContinue)
if ($resolvedSourceFile) {
    $sourceDir = [System.IO.Path]::GetDirectoryName($resolvedSourceFile.Path)
    $resolvedTargetDir = [System.IO.Path]::GetFullPath($pluginDir)

    if ($sourceDir -ne $resolvedTargetDir) {
        Write-Host "Copying plugin files to $pluginDir..."
        if (-not (Test-Path $pluginDir)) {
            New-Item -ItemType Directory -Force -Path $pluginDir | Out-Null
        }
        Copy-Item -Path ".\plugin.json" -Destination $pluginDir -Force
        Copy-Item -Recurse -Force -Path ".\skills" -Destination $pluginDir
        if (Test-Path ".\mcp-servers") {
            $destMcp = Join-Path $pluginDir "mcp-servers"
            if (-not (Test-Path $destMcp)) { New-Item -ItemType Directory -Force -Path $destMcp | Out-Null }
            robocopy ".\mcp-servers" $destMcp /E /XD node_modules .git /NFL /NDL /NJH /NJS *>$null
        }
        if (Test-Path ".\agents") {
            Copy-Item -Recurse -Force -Path ".\agents" -Destination $pluginDir -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "Plugin source is already located at target $pluginDir. Skipping file self-copy."
    }
} else {
    $resolvedTargetDir = [System.IO.Path]::GetFullPath($pluginDir)
}

# 4. Resolve MCP Server Execution Source
$globalBaseDir = "$env:USERPROFILE\.gemini\config\plugins\$pluginName"
$globalBuilt = (Test-Path (Join-Path $globalBaseDir "mcp-servers\model-router\dist\index.js")) -and `
               (Test-Path (Join-Path $globalBaseDir "mcp-servers\browser-automation\dist\src\index.js")) -and `
               (Test-Path (Join-Path $globalBaseDir "mcp-servers\google-drive\dist\index.js"))

$isCloudDrive = ($resolvedTargetDir -match "(My Drive|Google Drive|OneDrive|Dropbox)")
$serverBaseDir = $resolvedTargetDir

if ($Scope -eq "Workspace" -and -not $ForceLocalBuild) {
    if ($globalBuilt) {
        $serverBaseDir = $globalBaseDir
        Write-Host "Using pre-built MCP servers from $globalBaseDir (avoids cloud sync issues and node_modules bloat)..."
        $SkipBuild = $true
    } elseif ($isCloudDrive) {
        Write-Host "Detected cloud/virtual drive ($resolvedTargetDir)."
        Write-Host "Building MCP servers into global local directory ($globalBaseDir) to prevent cloud file-locking errors..."
        if (-not (Test-Path $globalBaseDir)) {
            New-Item -ItemType Directory -Force -Path $globalBaseDir | Out-Null
        }
        Copy-Item -Path ".\plugin.json" -Destination $globalBaseDir -Force
        Copy-Item -Recurse -Force -Path ".\skills" -Destination $globalBaseDir
        if (Test-Path ".\mcp-servers") {
            $destMcp = Join-Path $globalBaseDir "mcp-servers"
            if (-not (Test-Path $destMcp)) { New-Item -ItemType Directory -Force -Path $destMcp | Out-Null }
            robocopy ".\mcp-servers" $destMcp /E /XD node_modules .git /NFL /NDL /NJH /NJS *>$null
        }
        $servers = @("browser-automation", "model-router", "google-drive")
        foreach ($server in $servers) {
            $serverPath = Join-Path $globalBaseDir "mcp-servers\$server"
            if (Test-Path $serverPath) {
                Write-Host "  [+] Building mcp-servers/$server on local disk..."
                npm --prefix $serverPath install --no-audit --no-fund --ignore-scripts
                npm --prefix $serverPath run build
            }
        }
        $serverBaseDir = $globalBaseDir
        $SkipBuild = $true
    }
}

if (-not $SkipBuild) {
    Write-Host "Installing dependencies & building MCP servers..."
    $servers = @("browser-automation", "model-router", "google-drive")
    foreach ($server in $servers) {
        $serverPath = Join-Path $serverBaseDir "mcp-servers\$server"
        if (Test-Path $serverPath) {
            Write-Host "  [+] Installing & building mcp-servers/$server..."
            npm --prefix $serverPath install --no-audit --no-fund --ignore-scripts
            npm --prefix $serverPath run build
        }
    }
}

# 5. Register MCP servers
$browserServerPath = Join-Path $serverBaseDir "mcp-servers\browser-automation\dist\src\index.js"
$routerServerPath = Join-Path $serverBaseDir "mcp-servers\model-router\dist\index.js"
$driveServerPath = Join-Path $serverBaseDir "mcp-servers\google-drive\dist\index.js"

$browserServerPath = $browserServerPath -replace '\\', '/'
$routerServerPath = $routerServerPath -replace '\\', '/'
$driveServerPath = $driveServerPath -replace '\\', '/'

$mcpConfigDir = [System.IO.Path]::GetDirectoryName($mcpConfigFile)
if (-not (Test-Path $mcpConfigDir)) {
    New-Item -ItemType Directory -Force -Path $mcpConfigDir | Out-Null
}

$mcpServersMap = @{}
if (Test-Path $mcpConfigFile) {
    $content = Get-Content $mcpConfigFile -Raw
    if (![string]::IsNullOrWhiteSpace($content)) {
        try {
            $existing = $content | ConvertFrom-Json
            if ($existing.mcpServers) {
                foreach ($prop in $existing.mcpServers.PSObject.Properties) {
                    $mcpServersMap[$prop.Name] = $prop.Value
                }
            }
        } catch {
            $mcpServersMap = @{}
        }
    }
}

$mcpServersMap["browser-automation"] = @{
    "command" = "node"
    "args" = @($browserServerPath)
}
$mcpServersMap["model-router"] = @{
    "command" = "node"
    "args" = @($routerServerPath)
}
$mcpServersMap["google-drive"] = @{
    "command" = "node"
    "args" = @($driveServerPath)
}

$finalConfig = @{
    mcpServers = $mcpServersMap
}

$finalConfig | ConvertTo-Json -Depth 10 | Set-Content $mcpConfigFile
Write-Host "Registered MCP servers in $mcpConfigFile"
Write-Host "Installation complete! ($Scope Scope)"
