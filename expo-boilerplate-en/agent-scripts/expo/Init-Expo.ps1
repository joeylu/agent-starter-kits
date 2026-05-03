param(
  [string]$Template = "default@sdk-55",
  [switch]$InstallMissingDependencies
)

$ErrorActionPreference = "Stop"

$stateScript = Join-Path $PSScriptRoot "Expo-State.ps1"
if (Test-Path -LiteralPath $stateScript) {
  . $stateScript
}

function Get-RepoRoot {
  $scriptDir = Split-Path -Parent $PSCommandPath
  return (Resolve-Path -LiteralPath (Join-Path $scriptDir "..\..")).Path
}

function Test-Command {
  param([Parameter(Mandatory = $true)][string]$Name)
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-CommandVersion {
  param(
    [Parameter(Mandatory = $true)][string]$Command,
    [Parameter(Mandatory = $true)][string[]]$Arguments
  )

  if (-not (Test-Command $Command)) {
    return $null
  }

  try {
    return (& $Command @Arguments 2>&1 | Select-Object -First 1).ToString()
  }
  catch {
    return "installed"
  }
}

function Install-WithWinget {
  param(
    [Parameter(Mandatory = $true)][string]$PackageId,
    [Parameter(Mandatory = $true)][string]$DisplayName
  )

  if (-not (Test-Command "winget")) {
    throw "Cannot install $DisplayName automatically because winget is not available."
  }

  winget install --id $PackageId --exact --accept-package-agreements --accept-source-agreements
}

function Install-MissingDependency {
  param([Parameter(Mandatory = $true)][string]$Dependency)

  switch ($Dependency) {
    "Node.js" { Install-WithWinget -PackageId "OpenJS.NodeJS.LTS" -DisplayName "Node.js LTS" }
    "Git" { Install-WithWinget -PackageId "Git.Git" -DisplayName "Git" }
    "EAS CLI" { npm install --global eas-cli }
    default { throw "No installer is configured for $Dependency." }
  }
}

function Update-ProcessPath {
  $machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
  $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machinePath;$userPath"
}

function Get-PackageDependencyVersion {
  param(
    [Parameter(Mandatory = $true)]$Package,
    [Parameter(Mandatory = $true)][string]$Name
  )

  $dependenciesProperty = $Package.PSObject.Properties["dependencies"]
  if ($dependenciesProperty -and $Package.dependencies) {
    $dependency = $Package.dependencies.PSObject.Properties[$Name]
    if ($dependency) {
      return [string]$dependency.Value
    }
  }

  $devDependenciesProperty = $Package.PSObject.Properties["devDependencies"]
  if ($devDependenciesProperty -and $Package.devDependencies) {
    $devDependency = $Package.devDependencies.PSObject.Properties[$Name]
    if ($devDependency) {
      return [string]$devDependency.Value
    }
  }

  return ""
}

function Test-ExpoProject {
  param([Parameter(Mandatory = $true)][string]$Path)

  $packageJson = Join-Path $Path "package.json"
  if (-not (Test-Path -LiteralPath $packageJson)) {
    return $false
  }

  try {
    $package = Get-Content -Raw -Encoding UTF8 -LiteralPath $packageJson | ConvertFrom-Json
  }
  catch {
    return $false
  }

  $expoVersion = Get-PackageDependencyVersion -Package $package -Name "expo"
  if (-not $expoVersion) {
    return $false
  }

  $hasAppJson = Test-Path -LiteralPath (Join-Path $Path "app.json")
  $hasAppConfigJs = Test-Path -LiteralPath (Join-Path $Path "app.config.js")
  $hasAppConfigTs = Test-Path -LiteralPath (Join-Path $Path "app.config.ts")

  return ($hasAppJson -or $hasAppConfigJs -or $hasAppConfigTs)
}

function Sync-ExpoState {
  param([Parameter(Mandatory = $true)][string]$Path)

  if (-not (Get-Command Set-ExpoStateValue -ErrorAction SilentlyContinue)) {
    return
  }

  $packageJson = Join-Path $Path "package.json"
  if (-not (Test-Path -LiteralPath $packageJson)) {
    Write-Error "Cannot sync Expo state: missing package.json."
    exit 1
  }

  $package = Get-Content -Raw -Encoding UTF8 -LiteralPath $packageJson | ConvertFrom-Json
  $easCliVersion = Get-CommandVersion -Command "eas" -Arguments @("--version")
  $expoVersion = Get-PackageDependencyVersion -Package $package -Name "expo"
  $reactVersion = Get-PackageDependencyVersion -Package $package -Name "react"
  $reactNativeVersion = Get-PackageDependencyVersion -Package $package -Name "react-native"
  $easJson = Join-Path $Path "eas.json"
  $projectId = ""

  if (Get-Command Get-EasProjectIdFromAppJson -ErrorAction SilentlyContinue) {
    $projectId = Get-EasProjectIdFromAppJson
  }

  Set-ExpoStateValue -Key "expo_initialized" -Value "true" -Raw
  Set-ExpoStateValue -Key "expo_root" -Value "expo/"
  Set-ExpoStateValue -Key "expo_cli" -Value "npx expo"
  Set-ExpoStateValue -Key "expo_package" -Value $(if ($expoVersion) { $expoVersion.TrimStart("~", "^") } else { "" })
  if ($expoVersion) {
    $sdk = $expoVersion.TrimStart("~", "^").Split(".")[0]
    Set-ExpoStateValue -Key "expo_sdk" -Value $sdk
  }
  else {
    Set-ExpoStateValue -Key "expo_sdk" -Value ""
  }
  Set-ExpoStateValue -Key "react" -Value $(if ($reactVersion) { $reactVersion } else { "" })
  Set-ExpoStateValue -Key "react_native" -Value $(if ($reactNativeVersion) { $reactNativeVersion } else { "" })
  Set-ExpoStateValue -Key "eas_cli" -Value $(if ($easCliVersion) { $easCliVersion } else { "" })

  $easWhoami = & eas whoami 2>&1
  if ($LASTEXITCODE -eq 0) {
    $whoamiLines = @($easWhoami)
    Set-ExpoStateValue -Key "eas_logged_in" -Value "true" -Raw
    Set-ExpoStateValue -Key "eas_logged_in_account" -Value $(if ($whoamiLines.Count -ge 1) { [string]$whoamiLines[0] } else { "" })
    Set-ExpoStateValue -Key "eas_logged_in_email" -Value $(if ($whoamiLines.Count -ge 2) { [string]$whoamiLines[1] } else { "" })
  }
  else {
    Set-ExpoStateValue -Key "eas_logged_in" -Value "false" -Raw
    Set-ExpoStateValue -Key "eas_logged_in_account" -Value ""
    Set-ExpoStateValue -Key "eas_logged_in_email" -Value ""
  }

  Set-ExpoStateValue -Key "eas_configured" -Value $((Test-Path -LiteralPath $easJson).ToString().ToLowerInvariant()) -Raw
  Set-ExpoStateValue -Key "eas_project_id" -Value $(if ($projectId) { $projectId } else { "" })
  Set-ExpoStateValue -Key "android_build_ready" -Value "false" -Raw
  Set-ExpoStateValue -Key "android_build_ready_at" -Value ""
  Set-ExpoStateValue -Key "ios_build_ready" -Value "false" -Raw
  Set-ExpoStateValue -Key "ios_build_ready_at" -Value ""
  Set-ExpoStateValue -Key "last_automated_build_at" -Value ""
  Set-ExpoStateValue -Key "last_automated_build_dir" -Value ""
  Set-ExpoStateValue -Key "last_automated_build_status" -Value ""
  Set-ExpoStateValue -Key "last_automated_build_kind" -Value ""
}

$repoRoot = Get-RepoRoot
$expoDir = Join-Path $repoRoot "expo"

Write-Host "Repo root: $repoRoot"
Write-Host "Expo root: $expoDir"
Write-Host ""

if (-not (Test-Path -LiteralPath $expoDir)) {
  New-Item -ItemType Directory -Path $expoDir | Out-Null
  Write-Host "Created expo directory."
}

$existingItems = Get-ChildItem -Force -LiteralPath $expoDir
$hasExistingItems = $existingItems.Count -gt 0

$checks = @(
  @{ Name = "Node.js"; Command = "node"; Arguments = @("-v") },
  @{ Name = "npm"; Command = "npm"; Arguments = @("-v") },
  @{ Name = "npx"; Command = "npx"; Arguments = @("-v") },
  @{ Name = "Git"; Command = "git"; Arguments = @("--version") },
  @{ Name = "EAS CLI"; Command = "eas"; Arguments = @("--version") }
)

$missing = New-Object System.Collections.Generic.List[string]

Write-Host "Checking cloud-build environment..."
foreach ($check in $checks) {
  $version = Get-CommandVersion -Command $check.Command -Arguments $check.Arguments
  if ($null -eq $version) {
    $missing.Add($check.Name)
    Write-Host "[missing] $($check.Name)"
  }
  else {
    Write-Host "[ok] $($check.Name): $version"
  }
}
Write-Host ""

if ($missing.Count -gt 0) {
  Write-Host "Missing dependencies:"
  foreach ($item in $missing) {
    Write-Host "- $item"
  }
  Write-Host ""
  Write-Host "This project uses Expo Cloud Build only."
  Write-Host "Android Studio, Android SDK, and Xcode are intentionally not checked or installed."
  Write-Host ""

  if (-not $InstallMissingDependencies) {
    Write-Host "Initialization stopped before dependency installation."
    Write-Host "Ask Owner for approval, then rerun with -InstallMissingDependencies."
    Write-Error "Missing dependencies must be approved before installation."
    exit 1
  }

  $installOrder = @("Node.js", "Git", "EAS CLI")
  foreach ($dependency in $installOrder) {
    $shouldInstallNode = $dependency -eq "Node.js" -and (
      $missing -contains "Node.js" -or
      $missing -contains "npm" -or
      $missing -contains "npx"
    )

    if (($missing -contains $dependency) -or $shouldInstallNode) {
      Write-Host "Installing $dependency..."
      Install-MissingDependency -Dependency $dependency
      Update-ProcessPath
    }
  }

  if (($missing -contains "npm") -or ($missing -contains "npx")) {
    Write-Host "npm and npx are installed with Node.js. Restart PowerShell if they are still unavailable."
  }
}

$stillMissing = New-Object System.Collections.Generic.List[string]
foreach ($check in $checks) {
  if (-not (Test-Command $check.Command)) {
    $stillMissing.Add($check.Name)
  }
}

if ($stillMissing.Count -gt 0) {
  Write-Host ""
  Write-Host "The following dependencies are still unavailable in this PowerShell session:"
  foreach ($item in $stillMissing) {
    Write-Host "- $item"
  }
  Write-Error "Initialization stopped. Restart PowerShell or install the missing dependencies manually, then run init expo again."
  exit 1
}

if ($hasExistingItems) {
  if (-not (Test-ExpoProject -Path $expoDir)) {
    Write-Error "Cannot initialize Expo: expo directory is not empty and is not a valid Expo project. Expected package.json with expo dependency and app.json or app.config.*."
    exit 1
  }

  Write-Host ""
  Write-Host "Existing Expo project detected. Adopting without overwriting source files."
  Sync-ExpoState -Path $expoDir
  Write-Host "EXPO.md updated for existing Expo project."
  Write-Host "Next command: Run Command start expo"
  exit 0
}

Write-Host ""
Write-Host "Initializing Expo project in $expoDir ..."
$tempName = "expo-app-init-" + (Get-Date -Format "yyyyMMddHHmmss")
$tempDir = Join-Path $repoRoot $tempName

if (Test-Path -LiteralPath $tempDir) {
  Write-Error "Temporary directory already exists: $tempDir"
  exit 1
}

Push-Location $repoRoot
try {
  npx --yes create-expo-app@latest $tempName --template $Template --yes
  $tempGit = Join-Path $tempDir ".git"
  if (Test-Path -LiteralPath $tempGit) {
    Remove-Item -LiteralPath $tempGit -Recurse -Force
  }
  Get-ChildItem -Force -LiteralPath $tempDir | ForEach-Object {
    Move-Item -LiteralPath $_.FullName -Destination $expoDir -Force
  }
  Remove-Item -LiteralPath $tempDir -Force
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "Expo project initialized."
Write-Host "Next command: Run Command start expo"
Sync-ExpoState -Path $expoDir
