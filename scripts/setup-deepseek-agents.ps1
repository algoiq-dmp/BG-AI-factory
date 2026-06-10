<#
.SYNOPSIS
Sets up terminal AI Coding Assistants (Claude Code, OpenCode) to use DeepSeek V4 Pro.

.DESCRIPTION
This script reads the .env.local file in the project root, extracts the DEEPSEEK_API_KEY,
and exports the necessary Anthropic overrides so that terminal tools will use DeepSeek
instead of standard Anthropic models.
#>

$envFile = Join-Path $PSScriptRoot "..\.env.local"

if (-not (Test-Path $envFile)) {
    Write-Host "[ERROR] Could not find .env.local at $envFile." -ForegroundColor Red
    Write-Host "Please ensure your .env.local file exists and contains DEEPSEEK_API_KEY." -ForegroundColor Yellow
    exit 1
}

# Parse .env.local for DEEPSEEK_API_KEY
$apiKey = $null
foreach ($line in Get-Content $envFile) {
    if ($line -match "^DEEPSEEK_API_KEY=(.*)") {
        $apiKey = $matches[1].Trim().Trim('"').Trim("'")
        break
    }
}

if (-not $apiKey) {
    Write-Host "[ERROR] DEEPSEEK_API_KEY not found in .env.local." -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] DEEPSEEK_API_KEY found. Configuring terminal environment for DeepSeek V4 Pro..." -ForegroundColor Cyan

# Set Environment Variables for the current session
$env:ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN=$apiKey
$env:ANTHROPIC_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_SUBAGENT_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_EFFORT_LEVEL="max"

Write-Host "[SUCCESS] Environment Variables Configured!" -ForegroundColor Green
Write-Host "You can now run 'claude' or 'opencode' in this terminal, and they will route to DeepSeek V4 Pro." -ForegroundColor Yellow
Write-Host ""
Write-Host "Hint: If you haven't installed claude-code yet, run: npm install -g @anthropic-ai/claude-code" -ForegroundColor Gray
