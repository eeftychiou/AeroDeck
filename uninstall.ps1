[CmdletBinding()]
param(
    [ValidateSet("Auto", "Global", "Workspace")]
    [string]$Scope = "Auto",
    [string]$ProjectPath = "",
    [switch]$RemovePluginDir
)

$ErrorActionPreference = "Stop"

$pluginName = "aerodeck"
$currentDir = (Resolve-Path ".").Path
$currentDirNorm = $currentDir.Replace('\', '/').ToLower()

if ($Scope -eq "Auto") {
    if (![string]::IsNullOrWhiteSpace($ProjectPath) -or $currentDirNorm.Contains(".agents/plugins") -or $currentDirNorm.Contains(".agents\plugins")) {
        $Scope = "Workspace"
    } else {
        $Scope = "Global"
    }
}

Write-Host "Uninstalling AeroDeck plugin (Scope: $Scope)..."

if ($Scope -eq "Workspace") {
    if (![string]::IsNullOrWhiteSpace($ProjectPath)) {
        $resolvedProjectPath = [System.IO.Path]::GetFullPath($ProjectPath)
        $pluginDir = Join-Path $resolvedProjectPath ".agents\plugins\$pluginName"
    } else {
        $pluginDir = $currentDir
    }
    $mcpConfigFile = Join-Path $pluginDir "mcp_config.json"
} else {
    $pluginDir = "$env:USERPROFILE\.gemini\config\plugins\$pluginName"
    $mcpConfigFile = "$env:USERPROFILE\.gemini\config\mcp_config.json"
}

if ($RemovePluginDir -and (Test-Path $pluginDir)) {
    Remove-Item -Recurse -Force $pluginDir
    Write-Host "Removed plugin directory $pluginDir"
}

if (Test-Path $mcpConfigFile) {
    $content = Get-Content $mcpConfigFile -Raw
    if (![string]::IsNullOrWhiteSpace($content)) {
        try {
            $mcpConfig = $content | ConvertFrom-Json
            if ($null -ne $mcpConfig.mcpServers) {
                $mcpConfig.mcpServers.PSObject.Properties.Remove("browser-automation")
                $mcpConfig.mcpServers.PSObject.Properties.Remove("model-router")
                $mcpConfig.mcpServers.PSObject.Properties.Remove("google-drive")
                
                $mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $mcpConfigFile
                Write-Host "Unregistered MCP servers from $mcpConfigFile"
            }
        } catch {
            Write-Host "Could not parse $mcpConfigFile"
        }
    }
}

Write-Host "Uninstallation complete!"
