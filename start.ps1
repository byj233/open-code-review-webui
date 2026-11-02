# One-click launcher for the Open Code Review web console.
# Builds only what is missing, then serves the console with `ocr web`.
# Double-click start.cmd, or run: .\start.cmd
[CmdletBinding()]
param(
    [switch]$RebuildFrontend,
    [string]$Addr = 'localhost:5484',
    [string]$Repo,
    [switch]$NoOpen
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Write-Step {
    param([string]$Message)
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Stop-WithError {
    param([string]$Message)
    Write-Host "ERROR: $Message" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
    Stop-WithError 'Go was not found. Install Go 1.26+ from https://go.dev/dl/ and reopen this window.'
}

$frontendDir = Join-Path $root 'frontend'
$assetsIndex = Join-Path $root 'internal\console\assets\index.html'
$binary = Join-Path $root 'dist\opencodereview.exe'
$needsFrontend = $RebuildFrontend -or -not (Test-Path $assetsIndex)

if ($needsFrontend) {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Stop-WithError 'npm was not found. Install Node.js 22+ from https://nodejs.org/ and reopen this window.'
    }
    if (-not (Test-Path (Join-Path $frontendDir 'node_modules'))) {
        Write-Step 'Installing frontend dependencies (npm ci, first run only)'
        Push-Location $frontendDir
        try {
            npm ci
        } finally {
            Pop-Location
        }
        if ($LASTEXITCODE -ne 0) {
            Stop-WithError 'npm ci failed.'
        }
    }
    Write-Step 'Building the console (vue-tsc + vite build)'
    Push-Location $frontendDir
    try {
        npm run build
    } finally {
        Pop-Location
    }
    if ($LASTEXITCODE -ne 0) {
        Stop-WithError 'npm run build failed.'
    }
}

Write-Step 'Building the CLI'
New-Item -ItemType Directory -Force -Path (Join-Path $root 'dist') | Out-Null
go build -o $binary ./cmd/opencodereview
if ($LASTEXITCODE -ne 0) {
    Stop-WithError 'go build failed.'
}

$webArgs = @('web', '--addr', $Addr)
if ($NoOpen) {
    $webArgs += '--open=never'
}
if ($Repo) {
    $webArgs += @('--repo', $Repo)
}

Write-Step ("Starting the console at http://{0}" -f $Addr)
& $binary @webArgs
