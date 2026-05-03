param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("apk", "google-play", "ios")]
  [string]$BuildKind
)

$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "Expo-State.ps1")
. (Join-Path $PSScriptRoot "Expo-Build-Artifacts.ps1")

Assert-ExpoInitialized
Assert-EasCli
$whoami = Get-EasWhoami

$repoRoot = Get-AgentRepoRoot
$expoRoot = Get-AgentExpoRoot
$easJson = Join-Path $expoRoot "eas.json"

switch ($BuildKind) {
  "apk" {
    $Platform = "android"
    $Profile = Get-ExpoStateValue "default_android_apk_profile"
  }
  "google-play" {
    $Platform = "android"
    $Profile = Get-ExpoStateValue "default_android_store_profile"
  }
  "ios" {
    $Platform = "ios"
    $Profile = Get-ExpoStateValue "default_ios_profile"
  }
}

function Add-ObjectProperty {
  param(
    [Parameter(Mandatory = $true)]$Object,
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)]$Value
  )

  if (-not $Object.PSObject.Properties[$Name]) {
    $Object | Add-Member -MemberType NoteProperty -Name $Name -Value $Value
  }
}

function Ensure-AndroidBuildProfiles {
  param([Parameter(Mandatory = $true)][string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    Stop-ExpoScript "Missing expo/eas.json after build:configure. Stop and ask Owner to resolve EAS configuration."
  }

  $json = Get-Content -Raw -Encoding UTF8 -LiteralPath $Path | ConvertFrom-Json
  Add-ObjectProperty -Object $json -Name "build" -Value ([pscustomobject]@{})
  Add-ObjectProperty -Object $json.build -Name "production" -Value ([pscustomobject]@{})

  if (-not $json.build.PSObject.Properties["apk"]) {
    $json.build | Add-Member -MemberType NoteProperty -Name "apk" -Value ([pscustomobject]@{
      android = [pscustomobject]@{
        buildType = "apk"
      }
    })
  }
  else {
    Add-ObjectProperty -Object $json.build.apk -Name "android" -Value ([pscustomobject]@{})
    $buildType = $json.build.apk.android.PSObject.Properties["buildType"]
    if ($buildType -and $json.build.apk.android.buildType -ne "apk") {
      Stop-ExpoScript "eas.json build.apk.android.buildType is not apk. Stop and ask Owner before changing existing build profile."
    }
    Add-ObjectProperty -Object $json.build.apk.android -Name "buildType" -Value "apk"
  }

  $json | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -LiteralPath $Path
}

Write-Host "Repo root: $repoRoot"
Write-Host "Expo root: $expoRoot"
Write-Host "EAS account:"
$whoami | ForEach-Object { Write-Host $_ }
Write-Host ""
Write-Host "Fail-fast policy: this script will not repair missing accounts, Apple credentials, bundle identifiers, or EAS credential issues."
Write-Host ""

Push-Location $expoRoot
try {
  if (-not (Test-Path -LiteralPath $easJson)) {
    Write-Host "Configuring EAS Build..."
    eas build:configure --platform $Platform
    if ($LASTEXITCODE -ne 0) {
      Stop-ExpoScript "eas build:configure failed. Stop and ask Owner to resolve the reported issue."
    }
  }
  else {
    Write-Host "expo/eas.json already exists. Skipping build:configure."
  }

  if ($Platform -eq "android") {
    Ensure-AndroidBuildProfiles -Path $easJson
  }

  Write-Host ""
  Write-Host "Starting first interactive EAS Build..."
  Write-Host "Build kind: $BuildKind"
  Write-Host "Platform: $Platform"
  Write-Host "Profile: $Profile"
  if ($Platform -eq "ios") {
    Write-Host "This may require Owner input for Apple account, credentials, or identifiers."
  }
  else {
    Write-Host "Android build does not require a Google Play account."
  }
  eas build --platform $Platform --profile $Profile --wait
  if ($LASTEXITCODE -ne 0) {
    Stop-ExpoScript "First EAS Build failed. Stop and ask Owner to resolve the reported issue."
  }

  $buildDir = New-BuildArtifactsDirectory
  $listPath = Join-Path $buildDir "eas-build-list-output.json"
  $summaryPath = Join-Path $buildDir "build-result.json"

  Write-Host ""
  Write-Host "Fetching latest finished EAS Build artifact..."
  $buildListOutput = & eas build:list --platform $Platform --build-profile $Profile --status finished --limit 1 --json --non-interactive
  if ($LASTEXITCODE -ne 0) {
    Stop-ExpoScript "First EAS Build finished, but artifact lookup failed. Stop and ask Owner to resolve the reported EAS issue."
  }

  $buildListText = ($buildListOutput | Out-String).Trim()
  Set-Content -Encoding UTF8 -LiteralPath $listPath -Value $buildListText
  try {
    $buildJson = $buildListText | ConvertFrom-Json
  }
  catch {
    Stop-ExpoScript "First EAS Build finished, but build:list JSON could not be parsed. See $listPath"
  }

  $downloaded = @(Save-EasBuildArtifacts -BuildJson $buildJson -BuildDir $buildDir -BuildKind $BuildKind -FallbackPlatform $Platform)
}
finally {
  Pop-Location
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$projectId = Get-EasProjectIdFromAppJson

Set-ExpoStateValue -Key "eas_configured" -Value "true" -Raw
if ($Platform -eq "android") {
  Set-ExpoStateValue -Key "android_build_ready" -Value "true" -Raw
  Set-ExpoStateValue -Key "android_build_ready_at" -Value $timestamp
}
else {
  Set-ExpoStateValue -Key "ios_build_ready" -Value "true" -Raw
  Set-ExpoStateValue -Key "ios_build_ready_at" -Value $timestamp
}
if ($projectId) {
  Set-ExpoStateValue -Key "eas_project_id" -Value $projectId
}
Set-ExpoStateValue -Key "last_automated_build_at" -Value $timestamp
Set-ExpoStateValue -Key "last_automated_build_dir" -Value $buildDir
Set-ExpoStateValue -Key "last_automated_build_status" -Value "finished"
Set-ExpoStateValue -Key "last_automated_build_kind" -Value $BuildKind

$summary = [pscustomobject]@{
  builtAt = $timestamp
  buildKind = $BuildKind
  profile = $Profile
  platform = $Platform
  buildDir = $buildDir
  artifacts = $downloaded
}
$summary | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -LiteralPath $summaryPath

Write-Host ""
Write-Host "First EAS Build completed."
Write-Host "Artifacts saved to: $buildDir"
Write-Host "Updated agent-documents/EXPO.md."
