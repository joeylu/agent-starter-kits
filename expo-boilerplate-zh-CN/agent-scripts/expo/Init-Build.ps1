param(
  [ValidateSet("apk", "google-play", "ios")]
  [string]$BuildKind = ""
)

$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "Expo-State.ps1")

Assert-ExpoInitialized
Assert-EasCli
$whoami = Get-EasWhoami

if (-not $BuildKind) {
  Stop-ExpoScript "Build kind is required. Ask Owner to choose: apk, google-play, or ios. Then rerun with -BuildKind apk, -BuildKind google-play, or -BuildKind ios."
}

$interactiveScript = Join-Path $PSScriptRoot "Init-Build-Interactive.ps1"
if (-not (Test-Path -LiteralPath $interactiveScript)) {
  Stop-ExpoScript "Missing interactive build script: $interactiveScript"
}

Write-Host "EAS account:"
$whoami | ForEach-Object { Write-Host $_ }
Write-Host ""
Write-Host "Opening interactive EAS first-build window."
Write-Host "If EAS asks for Apple account, credentials, bundle identifiers, or project settings, Owner must answer manually."
Write-Host "On failure, the script will stop instead of trying to repair configuration."

Start-Process powershell.exe -ArgumentList @(
  "-NoExit",
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-File",
  $interactiveScript,
  "-BuildKind",
  $BuildKind
)

Write-Host "Interactive EAS first-build window opened."
