[CmdletBinding()]
param(
    [ValidateSet("Auto", "Global", "Workspace")]
    [string]$Scope = "Auto",
    [string]$ProjectPath = "",
    [switch]$SkipBuild
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

# 4. Build MCP servers & install dependencies (with --ignore-scripts to avoid infinite recursion)
$baseDir = $resolvedTargetDir

if (-not $SkipBuild) {
    Write-Host "Installing dependencies & building MCP servers..."
    $servers = @("browser-automation", "model-router", "google-drive")
    foreach ($server in $servers) {
        $serverPath = Join-Path $baseDir "mcp-servers\$server"
        if (Test-Path $serverPath) {
            Write-Host "  [+] Installing & building mcp-servers/$server..."
            npm --prefix $serverPath install --no-audit --no-fund --ignore-scripts
            npm --prefix $serverPath run build
        }
    }
}

# 5. Register MCP servers
$browserServerPath = Join-Path $baseDir "mcp-servers\browser-automation\dist\src\index.js"
$routerServerPath = Join-Path $baseDir "mcp-servers\model-router\dist\index.js"
$driveServerPath = Join-Path $baseDir "mcp-servers\google-drive\dist\index.js"

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
