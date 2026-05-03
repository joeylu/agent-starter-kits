$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

if (-not (Get-Command Get-AgentRepoRoot -ErrorAction SilentlyContinue)) {
  . (Join-Path $PSScriptRoot "Expo-State.ps1")
}

function ConvertTo-BuildArray {
  param($Value)

  if ($null -eq $Value) {
    return @()
  }

  if ($Value -is [System.Array]) {
    return @($Value)
  }

  if ($Value.PSObject.Properties.Name -contains "builds") {
    return ConvertTo-BuildArray $Value.builds
  }

  return @($Value)
}

function Get-BuildPropertyValue {
  param(
    $Object,
    [Parameter(Mandatory = $true)][string]$Name
  )

  if ($null -eq $Object) {
    return $null
  }

  $property = $Object.PSObject.Properties[$Name]
  if ($property) {
    return $property.Value
  }

  return $null
}

function Get-BuildArtifactUrl {
  param($Build)

  $artifacts = Get-BuildPropertyValue -Object $Build -Name "artifacts"
  $candidates = New-Object System.Collections.Generic.List[string]
  foreach ($candidate in @(
    (Get-BuildPropertyValue -Object $artifacts -Name "applicationArchiveUrl"),
    (Get-BuildPropertyValue -Object $artifacts -Name "buildUrl"),
    (Get-BuildPropertyValue -Object $artifacts -Name "artifactUrl"),
    (Get-BuildPropertyValue -Object $Build -Name "applicationArchiveUrl"),
    (Get-BuildPropertyValue -Object $Build -Name "buildUrl"),
    (Get-BuildPropertyValue -Object $Build -Name "artifactUrl")
  )) {
    if ($candidate) {
      $candidates.Add([string]$candidate)
    }
  }

  foreach ($candidate in $candidates) {
    if ($candidate -and ([string]$candidate).StartsWith("http")) {
      return [string]$candidate
    }
  }

  return ""
}

function Get-BuildArtifactExtension {
  param(
    [string]$Url,
    [string]$Platform,
    [string]$BuildKind
  )

  try {
    $path = ([System.Uri]$Url).AbsolutePath
    $extension = [System.IO.Path]::GetExtension($path)
    if ($extension) {
      return $extension
    }
  }
  catch {
  }

  switch ($BuildKind) {
    "apk" { return ".apk" }
    "google-play" { return ".aab" }
    "ios" { return ".ipa" }
  }

  switch ($Platform.ToLowerInvariant()) {
    "android" { return ".aab" }
    "ios" { return ".ipa" }
    default { return ".bin" }
  }
}

function Get-SafeFileNamePart {
  param(
    [string]$Value,
    [string]$Fallback
  )

  if (-not $Value) {
    return $Fallback
  }

  $invalidChars = -join [System.IO.Path]::GetInvalidFileNameChars()
  $pattern = "[{0}]" -f ([regex]::Escape($invalidChars))
  return [regex]::Replace($Value, $pattern, "_")
}

function Get-BuildArtifactsRoot {
  $configured = ""
  try {
    $configured = Get-ExpoStateValue "build_artifacts_dir"
  }
  catch {
    $configured = ""
  }

  if (-not $configured) {
    $configured = "user-assets/builds/"
  }

  $configured = $configured.Trim()
  if ([System.IO.Path]::IsPathRooted($configured)) {
    return $configured
  }

  return (Join-Path (Get-AgentRepoRoot) $configured)
}

function New-BuildArtifactsDirectory {
  $root = Get-BuildArtifactsRoot
  New-Item -ItemType Directory -Path $root -Force | Out-Null

  $timestamp = Get-Date -Format "yyyy-MM-dd-HH-mm-ss"
  $buildDir = Join-Path $root $timestamp
  New-Item -ItemType Directory -Path $buildDir -Force | Out-Null

  return $buildDir
}

function Save-EasBuildArtifacts {
  param(
    [Parameter(Mandatory = $true)]$BuildJson,
    [Parameter(Mandatory = $true)][string]$BuildDir,
    [Parameter(Mandatory = $true)][string]$BuildKind,
    [Parameter(Mandatory = $true)][string]$FallbackPlatform
  )

  $builds = @(ConvertTo-BuildArray $BuildJson)
  if ($builds.Count -eq 0) {
    Stop-ExpoScript "EAS build returned no build records."
  }

  $downloaded = @()
  foreach ($build in $builds) {
    $status = [string](Get-BuildPropertyValue -Object $build -Name "status")
    $buildId = [string](Get-BuildPropertyValue -Object $build -Name "id")
    $buildPlatform = [string](Get-BuildPropertyValue -Object $build -Name "platform")
    if (-not $buildPlatform) {
      $buildPlatform = $FallbackPlatform
    }
    if (-not $buildPlatform) {
      $buildPlatform = "unknown"
    }

    if ($status.ToLowerInvariant() -ne "finished") {
      Stop-ExpoScript "Build $buildId for $buildPlatform did not finish successfully. Status: $status"
    }

    $artifactUrl = Get-BuildArtifactUrl $build
    if (-not $artifactUrl) {
      Stop-ExpoScript "Build $buildId for $buildPlatform has no artifact URL in EAS output."
    }

    $extension = Get-BuildArtifactExtension -Url $artifactUrl -Platform $buildPlatform -BuildKind $BuildKind
    $safeId = Get-SafeFileNamePart -Value $buildId -Fallback "unknown-id"
    $safePlatform = Get-SafeFileNamePart -Value $buildPlatform.ToLowerInvariant() -Fallback "unknown"
    $fileName = "$safePlatform-$safeId$extension"
    $destination = Join-Path $BuildDir $fileName

    Write-Host "Downloading $buildPlatform artifact..."
    Invoke-WebRequest -Uri $artifactUrl -OutFile $destination -UseBasicParsing

    $downloaded += [pscustomobject]@{
      id = $buildId
      platform = $buildPlatform
      status = $status
      artifactUrl = $artifactUrl
      file = $destination
    }
  }

  return @($downloaded)
}
