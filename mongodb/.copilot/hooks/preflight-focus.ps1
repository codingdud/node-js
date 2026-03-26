param(
    [switch]$Strict
)

$ErrorActionPreference = "Stop"

$requiredPaths = @(
    ".github/prompts/workspace-focus.prompt.md",
    ".vscode/mcp.json",
    ".copilot/skills/mongodb-sharding/SKILL.md",
    ".copilot/hooks/HARD-STOP.md",
    ".copilot/toolsets/toolsets.json"
)

$missing = @()

foreach ($path in $requiredPaths) {
    if (-not (Test-Path -LiteralPath $path)) {
        $missing += $path
    }
}

if ($missing.Count -gt 0) {
    Write-Host "Preflight failed. Missing required workspace focus artifacts:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
    exit 1
}

Write-Host "Preflight passed. Workspace focus artifacts are present." -ForegroundColor Green

if ($Strict) {
    Write-Host "Strict mode enabled: no additional strict checks configured yet." -ForegroundColor Yellow
}
