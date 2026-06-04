$ErrorActionPreference = "Stop"

$pluginName = "aerodeck"
$pluginDir = "$env:USERPROFILE\.gemini\config\plugins\$pluginName"
$mcpConfigFile = "$env:USERPROFILE\.gemini\config\mcp_config.json"

Write-Host "Installing AeroDeck plugin to $pluginDir..."

# 1. Copy plugin files
if (Test-Path $pluginDir) {
    Remove-Item -Recurse -Force $pluginDir
}
New-Item -ItemType Directory -Force -Path $pluginDir | Out-Null
Copy-Item -Path ".\plugin.json" -Destination $pluginDir
Copy-Item -Recurse -Path ".\skills" -Destination $pluginDir
Copy-Item -Recurse -Path ".\agents" -Destination $pluginDir -ErrorAction SilentlyContinue

# 2. Register MCP servers
$cwd = (Get-Location).Path
$browserServerPath = Join-Path $cwd "mcp-servers\browser-automation\dist\src\index.js"
$routerServerPath = Join-Path $cwd "mcp-servers\model-router\dist\index.js"

$browserServerPath = $browserServerPath -replace '\\', '/'
$routerServerPath = $routerServerPath -replace '\\', '/'

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

$mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $mcpConfigFile
Write-Host "Registered MCP servers in $mcpConfigFile"
Write-Host "Installation complete!"
