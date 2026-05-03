$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$stateDir = Join-Path $scriptDir '.state'
$stateFile = Join-Path $stateDir 'website-dev.json'

if (-not (Test-Path $stateFile)) {
    Write-Output 'stop_result=success'
    Write-Output 'server_status=not-running'
    Write-Output 'message=No recorded local dev server.'
    exit 0
}

$state = Get-Content -Path $stateFile -Raw | ConvertFrom-Json
$pidValue = [int]$state.pid
$process = Get-Process -Id $pidValue -ErrorAction SilentlyContinue

if ($process) {
    $taskkill = Join-Path $env:SystemRoot 'System32\taskkill.exe'
    & $taskkill /PID $pidValue /T /F | Out-Null
}

Remove-Item -LiteralPath $stateFile -Force

Write-Output 'stop_result=success'
Write-Output 'server_status=stopped'
Write-Output "pid=$pidValue"
