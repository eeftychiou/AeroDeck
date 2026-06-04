$ErrorActionPreference = "Stop"

$pluginName = "aerodeck"
$pluginDir = "$env:USERPROFILE\.gemini\config\plugins\$pluginName"
$mcpConfigFile = "$env:USERPROFILE\.gemini\config\mcp_config.json"

Write-Host "Uninstalling AeroDeck plugin..."

if (Test-Path $pluginDir) {
    Remove-Item -Recurse -Force $pluginDir
    Write-Host "Removed plugin directory $pluginDir"
}

if (Test-Path $mcpConfigFile) {
    $content = Get-Content $mcpConfigFile -Raw
    if (![string]::IsNullOrWhiteSpace($content)) {
        $mcpConfig = $content | ConvertFrom-Json
        if ($null -ne $mcpConfig.mcpServers) {
            $mcpConfig.mcpServers.PSObject.Properties.Remove("browser-automation")
            $mcpConfig.mcpServers.PSObject.Properties.Remove("model-router")
            
            $mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $mcpConfigFile
            Write-Host "Unregistered MCP servers from $mcpConfigFile"
        }
    }
}

Write-Host "Uninstallation complete!"
