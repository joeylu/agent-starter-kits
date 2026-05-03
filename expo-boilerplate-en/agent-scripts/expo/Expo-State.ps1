$script:ExpoStateScriptRoot = $PSScriptRoot
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Get-AgentRepoRoot {
  return (Resolve-Path -LiteralPath (Join-Path $script:ExpoStateScriptRoot "..\..")).Path
}

function Get-AgentExpoRoot {
  return (Join-Path (Get-AgentRepoRoot) "expo")
}

function Get-AgentExpoDocumentPath {
  return (Join-Path (Get-AgentRepoRoot) "agent-documents\EXPO.md")
}

function Stop-ExpoScript {
  param([Parameter(Mandatory = $true)][string]$Message)
  Write-Error $Message
  exit 1
}

function Test-AgentCommand {
  param([Parameter(Mandatory = $true)][string]$Name)
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-ExpoStateValue {
  param([Parameter(Mandatory = $true)][string]$Key)

  $path = Get-AgentExpoDocumentPath
  if (-not (Test-Path -LiteralPath $path)) {
    Stop-ExpoScript "Missing agent-documents/EXPO.md. Cannot continue."
  }

  $content = Get-Content -Raw -Encoding UTF8 -LiteralPath $path
  $pattern = "(?m)^\s*-\s*$([regex]::Escape($Key)):\s*(.*?)\s*$"
  $match = [regex]::Match($content, $pattern)
  if (-not $match.Success) {
    Stop-ExpoScript "Missing EXPO.md state key: $Key"
  }

  $value = $match.Groups[1].Value.Trim()
  $backtick = [char]96
  if ($value.StartsWith($backtick) -and $value.EndsWith($backtick) -and $value.Length -ge 2) {
    return $value.Substring(1, $value.Length - 2)
  }
  return $value
}

function Set-ExpoStateValue {
  param(
    [Parameter(Mandatory = $true)][string]$Key,
    [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value,
    [switch]$Raw
  )

  $path = Get-AgentExpoDocumentPath
  if (-not (Test-Path -LiteralPath $path)) {
    Stop-ExpoScript "Missing agent-documents/EXPO.md. Cannot update state."
  }

  $content = Get-Content -Raw -Encoding UTF8 -LiteralPath $path
  $backtick = [char]96
  $storedValue = if ($Raw) { $Value } else { "$backtick$Value$backtick" }
  $pattern = "(?m)^(\s*-\s*$([regex]::Escape($Key)):\s*).*$"
  if (-not [regex]::IsMatch($content, $pattern)) {
    Stop-ExpoScript "Missing EXPO.md state key: $Key"
  }

  $updated = [regex]::Replace($content, $pattern, "`${1}$storedValue")
  Set-Content -Encoding UTF8 -LiteralPath $path -Value $updated
}

function Assert-ExpoInitialized {
  $initialized = Get-ExpoStateValue "expo_initialized"
  if ($initialized.ToLowerInvariant() -ne "true") {
    Stop-ExpoScript "Expo project is not initialized. Run Command init expo."
  }

  $expoRoot = Get-AgentExpoRoot
  $packageJson = Join-Path $expoRoot "package.json"
  if (-not (Test-Path -LiteralPath $packageJson)) {
    Stop-ExpoScript "Expo state says initialized, but expo/package.json is missing. Stop and ask Owner to resolve the state mismatch."
  }
}

function Assert-EasCli {
  if (-not (Test-AgentCommand "eas")) {
    Stop-ExpoScript "EAS CLI is missing. Stop and ask Owner before installing or changing the environment."
  }
}

function Get-EasWhoami {
  Assert-EasCli
  $output = & eas whoami 2>&1
  if ($LASTEXITCODE -ne 0) {
    Stop-ExpoScript "EAS is not logged in. Run eas login manually, then retry."
  }
  return $output
}

function Get-EasProjectIdFromAppJson {
  $appJson = Join-Path (Get-AgentExpoRoot) "app.json"
  if (-not (Test-Path -LiteralPath $appJson)) {
    return ""
  }

  try {
    $json = Get-Content -Raw -Encoding UTF8 -LiteralPath $appJson | ConvertFrom-Json
    if ($json.expo.extra.eas.projectId) {
      return [string]$json.expo.extra.eas.projectId
    }
  }
  catch {
    return ""
  }

  return ""
}
