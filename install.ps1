$ErrorActionPreference = "Stop"

$pluginName = "aerodeck"
$pluginDir = "$env:USERPROFILE\.gemini\config\plugins\$pluginName"
$mcpConfigFile = "$env:USERPROFILE\.gemini\config\mcp_config.json"

Write-Host "Installing AeroDeck plugin to $pluginDir..."

# 1. Copy plugin files if source directory is not already the target directory (avoids self-copy and CWD lock errors)
$resolvedSourceFile = (Resolve-Path ".\plugin.json").Path
$resolvedTargetDir = [System.IO.Path]::GetFullPath($pluginDir)
$resolvedTargetFile = Join-Path $resolvedTargetDir "plugin.json"

if ($resolvedSourceFile -ne $resolvedTargetFile) {
    if (-not (Test-Path $pluginDir)) {
        New-Item -ItemType Directory -Force -Path $pluginDir | Out-Null
    }
    Copy-Item -Path ".\plugin.json" -Destination $pluginDir -Force
    Copy-Item -Recurse -Force -Path ".\skills" -Destination $pluginDir
    if (Test-Path ".\agents") {
        Copy-Item -Recurse -Force -Path ".\agents" -Destination $pluginDir -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "Plugin source is already located at target $pluginDir. Skipping file self-copy."
}

# 2. Register MCP servers
$cwd = (Get-Location).Path
$browserServerPath = Join-Path $cwd "mcp-servers\browser-automation\dist\src\index.js"
$routerServerPath = Join-Path $cwd "mcp-servers\model-router\dist\index.js"
$driveServerPath = Join-Path $cwd "mcp-servers\google-drive\dist\index.js"

$browserServerPath = $browserServerPath -replace '\\', '/'
$routerServerPath = $routerServerPath -replace '\\', '/'
$driveServerPath = $driveServerPath -replace '\\', '/'

$mcpConfig = @{ mcpServers = @{} }
if (Test-Path $mcpConfigFile) {
    $content = Get-Content $mcpConfigFile -Raw
    if (![string]::IsNullOrWhiteSpace($content)) {
        $mcpConfig = $content | ConvertFrom-Json
        if ($null -eq $mcpConfig.mcpServers) {
            $mcpConfig | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value (New-Object PSObject)
        }
    }
}

# Update browser automation server
$browserProps = @{
    "command" = "node"
    "args" = @($browserServerPath)
}
if ($null -eq $mcpConfig.mcpServers."browser-automation") {
    $mcpConfig.mcpServers | Add-Member -MemberType NoteProperty -Name "browser-automation" -Value $browserProps
} else {
    $mcpConfig.mcpServers."browser-automation" = $browserProps
}

# Update model router server
$routerProps = @{
    "command" = "node"
    "args" = @($routerServerPath)
}
if ($null -eq $mcpConfig.mcpServers."model-router") {
    $mcpConfig.mcpServers | Add-Member -MemberType NoteProperty -Name "model-router" -Value $routerProps
} else {
    $mcpConfig.mcpServers."model-router" = $routerProps
}

# Update google drive server
$driveProps = @{
    "command" = "node"
    "args" = @($driveServerPath)
}
if ($null -eq $mcpConfig.mcpServers."google-drive") {
    $mcpConfig.mcpServers | Add-Member -MemberType NoteProperty -Name "google-drive" -Value $driveProps
} else {
    $mcpConfig.mcpServers."google-drive" = $driveProps
}

$mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $mcpConfigFile
Write-Host "Registered MCP servers in $mcpConfigFile"
Write-Host "Installation complete!"
