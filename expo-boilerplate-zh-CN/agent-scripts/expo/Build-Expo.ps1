param(
  [ValidateSet("apk", "google-play", "ios")]
  [string]$BuildKind = "",
  [string]$Profile = "",
  [string]$Platform = ""
)

$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "Expo-State.ps1")
. (Join-Path $PSScriptRoot "Expo-Build-Artifacts.ps1")

function Assert-BuildProfile {
  param(
    [Parameter(Mandatory = $true)][string]$EasJsonPath,
    [Parameter(Mandatory = $true)][string]$ProfileName,
    [Parameter(Mandatory = $true)][string]$BuildKind
  )

  try {
    $json = Get-Content -Raw -Encoding UTF8 -LiteralPath $EasJsonPath | ConvertFrom-Json
  }
  catch {
    Stop-ExpoScript "Cannot parse expo/eas.json. Stop and ask Owner to fix EAS configuration."
  }

  if (-not $json.PSObject.Properties["build"] -or -not $json.build.PSObject.Properties[$ProfileName]) {
    Stop-ExpoScript "Missing EAS build profile '$ProfileName' in expo/eas.json. Run Command init build for the target platform."
  }

  if ($BuildKind -eq "apk") {
    $android = $json.build.$ProfileName.PSObject.Properties["android"]
    if (-not $android -or -not $json.build.$ProfileName.android.PSObject.Properties["buildType"] -or $json.build.$ProfileName.android.buildType -ne "apk") {
      Stop-ExpoScript "EAS build profile '$ProfileName' is not configured for APK output. Run Command init build and choose apk."
    }
  }
}

Assert-ExpoInitialized

if (-not $BuildKind) {
  Stop-ExpoScript "Build kind is required. Ask Owner to choose: apk, google-play, or ios. Then rerun with -BuildKind apk, -BuildKind google-play, or -BuildKind ios."
}

$configured = Get-ExpoStateValue "eas_configured"
if ($configured.ToLowerInvariant() -ne "true") {
  Stop-ExpoScript "EAS Build is not configured. Run Command init build."
}

switch ($BuildKind) {
  "apk" {
    $requiredReadyKey = "android_build_ready"
    if (-not $Platform) { $Platform = "android" }
    if (-not $Profile) { $Profile = Get-ExpoStateValue "default_android_apk_profile" }
  }
  "google-play" {
    $requiredReadyKey = "android_build_ready"
    if (-not $Platform) { $Platform = "android" }
    if (-not $Profile) { $Profile = Get-ExpoStateValue "default_android_store_profile" }
  }
  "ios" {
    $requiredReadyKey = "ios_build_ready"
    if (-not $Platform) { $Platform = "ios" }
    if (-not $Profile) { $Profile = Get-ExpoStateValue "default_ios_profile" }
  }
}

$ready = Get-ExpoStateValue $requiredReadyKey
if ($ready.ToLowerInvariant() -ne "true") {
  if ($BuildKind -eq "ios") {
    Stop-ExpoScript "iOS build is not ready. Run Command init build, choose ios, and complete the first interactive iOS EAS Build."
  }
  else {
    Stop-ExpoScript "Android build is not ready. Run Command init build, choose apk or google-play, and complete the first interactive Android EAS Build."
  }
}

Assert-EasCli
$whoami = Get-EasWhoami

$expoRoot = Get-AgentExpoRoot
$easJson = Join-Path $expoRoot "eas.json"
if (-not (Test-Path -LiteralPath $easJson)) {
  Stop-ExpoScript "Missing expo/eas.json. Run Command init build."
}

Assert-BuildProfile -EasJsonPath $easJson -ProfileName $Profile -BuildKind $BuildKind

$buildDir = New-BuildArtifactsDirectory

$stdoutPath = Join-Path $buildDir "eas-build-output.json"
$stderrPath = Join-Path $buildDir "eas-build-stderr.txt"
$summaryPath = Join-Path $buildDir "build-result.json"

Write-Host "EAS account:"
$whoami | ForEach-Object { Write-Host $_ }
Write-Host ""
Write-Host "Starting non-interactive Expo Cloud Build..."
Write-Host "Profile: $Profile"
Write-Host "Platform: $Platform"
Write-Host "Build kind: $BuildKind"
Write-Host "Build dir: $buildDir"
Write-Host ""

Push-Location $expoRoot
try {
  $stderrTemp = New-TemporaryFile
  $buildOutput = & eas build --platform $Platform --profile $Profile --wait --json --non-interactive 2> $stderrTemp
  $exitCode = $LASTEXITCODE
  $buildOutputText = ($buildOutput | Out-String).Trim()
  Set-Content -Encoding UTF8 -LiteralPath $stdoutPath -Value $buildOutputText
  $stderrText = Get-Content -Raw -LiteralPath $stderrTemp
  Set-Content -Encoding UTF8 -LiteralPath $stderrPath -Value $stderrText
  Remove-Item -LiteralPath $stderrTemp -Force
}
finally {
  Pop-Location
}

if ($exitCode -ne 0) {
  Write-Host "EAS build failed. stderr:"
  Get-Content -Raw -Encoding UTF8 -LiteralPath $stderrPath | Write-Host
  Stop-ExpoScript "Automatic build stopped. Resolve the EAS error, then retry."
}

$jsonText = Get-Content -Raw -Encoding UTF8 -LiteralPath $stdoutPath
try {
  $buildJson = $jsonText | ConvertFrom-Json
}
catch {
  Stop-ExpoScript "EAS build finished but JSON output could not be parsed. See $stdoutPath"
}

$builds = @(ConvertTo-BuildArray $buildJson)
if ($builds.Count -eq 0) {
  Stop-ExpoScript "EAS build returned no build records. See $stdoutPath"
}

$downloaded = @(Save-EasBuildArtifacts -BuildJson $builds -BuildDir $buildDir -BuildKind $BuildKind -FallbackPlatform $Platform)

$summary = [pscustomobject]@{
  builtAt = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
  buildKind = $BuildKind
  profile = $Profile
  platform = $Platform
  buildDir = $buildDir
  artifacts = $downloaded
}

$summary | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -LiteralPath $summaryPath

Set-ExpoStateValue -Key "last_automated_build_at" -Value $summary.builtAt
Set-ExpoStateValue -Key "last_automated_build_dir" -Value $buildDir
Set-ExpoStateValue -Key "last_automated_build_status" -Value "finished"
Set-ExpoStateValue -Key "last_automated_build_kind" -Value $BuildKind

Write-Host ""
Write-Host "Automatic Expo Cloud Build completed."
Write-Host "Artifacts saved to: $buildDir"
