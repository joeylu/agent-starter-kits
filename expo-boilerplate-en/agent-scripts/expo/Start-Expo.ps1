$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $PSCommandPath
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $scriptDir "..\..")).Path
$expoDir = Join-Path $repoRoot "expo"
$packageJson = Join-Path $expoDir "package.json"
$defaultPorts = @(8081, 19000, 19001, 19002)

if (-not (Test-Path -LiteralPath $packageJson)) {
  Write-Error "Cannot start Expo: expected package.json at $packageJson."
  exit 1
}

$nodeProcesses = Get-CimInstance Win32_Process -Filter "name = 'node.exe'" | Where-Object {
  $_.CommandLine -and $_.CommandLine -match [regex]::Escape($expoDir)
}

if ($nodeProcesses) {
  Write-Error "Cannot start Expo: an Expo/Metro node process already appears to be running. Close the existing PowerShell window first, or explicitly approve LLM to close it."
  $nodeProcesses | Select-Object ProcessId, CommandLine | Format-List | Out-String | Write-Host
  exit 1
}

$occupiedPorts = @()
foreach ($port in $defaultPorts) {
  $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if ($connections) {
    $occupiedPorts += $port
  }
}

if ($occupiedPorts.Count -gt 0) {
  Write-Error "Cannot start Expo: required development port(s) already in use: $($occupiedPorts -join ', '). Close the existing PowerShell window first, or explicitly approve LLM to close the process."
  exit 1
}

$windowTitle = "Expo Go QR - $expoDir"
$innerCommand = @"
`$Host.UI.RawUI.WindowTitle = '$windowTitle'
Set-Location -LiteralPath '$expoDir'
Write-Host 'Expo project: $expoDir'
Write-Host 'Close this PowerShell window to stop the Expo process.'
Write-Host ''
npm start
"@

$encodedCommand = [Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes($innerCommand))

Start-Process powershell.exe -ArgumentList @(
  "-NoExit",
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-EncodedCommand",
  $encodedCommand
)

Write-Host "Started Expo in a new PowerShell window."
Write-Host "Close that PowerShell window to stop the Expo process."
