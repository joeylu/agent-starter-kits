param(
    [int]$PreferredPort = 3000,
    [int]$MaxPort = 3009
)

$ErrorActionPreference = 'Stop'

function Write-Failure {
    param(
        [string]$Stage,
        [string]$Message,
        [int]$ExitCode = 1
    )

    Write-Output 'local_result=failed'
    Write-Output "failed_stage=$Stage"
    Write-Output "message=$Message"
    exit $ExitCode
}

function Resolve-CommandPath {
    param([string[]]$Names)

    foreach ($name in $Names) {
        $command = Get-Command $name -ErrorAction SilentlyContinue
        if ($command) {
            return $command.Source
        }
    }

    return $null
}

function Invoke-RequiredCommand {
    param(
        [string]$Stage,
        [string]$FilePath,
        [string[]]$Arguments,
        [string]$WorkingDirectory
    )

    Write-Output "local_status=running stage=$Stage"
    Push-Location $WorkingDirectory
    try {
        & $FilePath @Arguments
        $exitCode = $LASTEXITCODE
    }
    finally {
        Pop-Location
    }

    if ($exitCode -ne 0) {
        Write-Failure -Stage $Stage -Message "$Stage failed with exit code $exitCode" -ExitCode $exitCode
    }
}

function Test-PortOpen {
    param([int]$Port)

    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $asyncResult = $client.BeginConnect('127.0.0.1', $Port, $null, $null)
        if (-not $asyncResult.AsyncWaitHandle.WaitOne(250)) {
            return $false
        }

        $client.EndConnect($asyncResult)
        return $true
    }
    catch {
        return $false
    }
    finally {
        $client.Close()
    }
}

function Test-UrlReady {
    param([string]$Url)

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
        return ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500)
    }
    catch {
        return $false
    }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$documentsDir = Split-Path -Parent $scriptDir
$projectRoot = Split-Path -Parent $documentsDir
$webRoot = Join-Path $projectRoot 'web'
$packageJson = Join-Path $webRoot 'package.json'
$stateDir = Join-Path $scriptDir '.state'
$stateFile = Join-Path $stateDir 'website-dev.json'
$stdoutLog = Join-Path $stateDir 'website-dev.out.log'
$stderrLog = Join-Path $stateDir 'website-dev.err.log'

if (-not (Test-Path $packageJson)) {
    Write-Failure -Stage 'not-initialized' -Message 'Website is not initialized. Ask the AI to initialize the current website first.' -ExitCode 2
}

$nodePath = Resolve-CommandPath -Names @('node.exe', 'node')
if (-not $nodePath) {
    Write-Failure -Stage 'check-node' -Message 'Node.js LTS is not available.'
}

$npmPath = Resolve-CommandPath -Names @('npm.cmd', 'npm.exe', 'npm')
if (-not $npmPath) {
    Write-Failure -Stage 'check-npm' -Message 'npm is not available. Check the Node.js LTS installation.'
}

New-Item -ItemType Directory -Force -Path $stateDir | Out-Null

Invoke-RequiredCommand -Stage 'npm-install' -FilePath $npmPath -Arguments @('install') -WorkingDirectory $webRoot
Invoke-RequiredCommand -Stage 'npm-build' -FilePath $npmPath -Arguments @('run', 'build') -WorkingDirectory $webRoot

if (Test-Path $stateFile) {
    try {
        $existingState = Get-Content -Path $stateFile -Raw | ConvertFrom-Json
        $existingPid = [int]$existingState.pid
        $existingPort = [int]$existingState.port
        $existingUrl = [string]$existingState.url
        $existingProbeUrl = "http://127.0.0.1:$existingPort"
        $existingProcess = Get-Process -Id $existingPid -ErrorAction SilentlyContinue

        if ($existingProcess -and (Test-UrlReady -Url $existingProbeUrl)) {
            Write-Output 'local_result=success'
            Write-Output 'server_status=already-running'
            Write-Output "pid=$existingPid"
            Write-Output "url=$existingUrl"
            exit 0
        }

        if ($existingProcess) {
            $taskkill = Join-Path $env:SystemRoot 'System32\taskkill.exe'
            & $taskkill /PID $existingPid /T /F | Out-Null
        }
    }
    catch {
        Write-Output 'local_status=running stage=clear-stale-state'
    }

    Remove-Item -LiteralPath $stateFile -Force -ErrorAction SilentlyContinue
}

$selectedPort = $null
for ($port = $PreferredPort; $port -le $MaxPort; $port++) {
    if (-not (Test-PortOpen -Port $port)) {
        $selectedPort = $port
        break
    }
}

if (-not $selectedPort) {
    Write-Failure -Stage 'select-port' -Message "Ports $PreferredPort-$MaxPort are all in use."
}

if (Test-Path $stdoutLog) {
    Remove-Item -LiteralPath $stdoutLog -Force
}

if (Test-Path $stderrLog) {
    Remove-Item -LiteralPath $stderrLog -Force
}

Write-Output "local_status=running stage=start-dev port=$selectedPort"
$process = Start-Process `
    -FilePath $npmPath `
    -ArgumentList @('run', 'dev', '--', '--hostname', '127.0.0.1', '--port', [string]$selectedPort) `
    -WorkingDirectory $webRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutLog `
    -RedirectStandardError $stderrLog `
    -PassThru

$probeUrl = "http://127.0.0.1:$selectedPort"
$url = "http://localhost:$selectedPort"
$ready = $false

for ($attempt = 1; $attempt -le 80; $attempt++) {
    Start-Sleep -Milliseconds 500

    if ($process.HasExited) {
        $stderrTail = ''
        if (Test-Path $stderrLog) {
            $stderrTail = (Get-Content -Path $stderrLog -Tail 20 -ErrorAction SilentlyContinue) -join ' '
        }

        Write-Failure -Stage 'start-dev' -Message "dev server exited early. $stderrTail"
    }

    if (Test-UrlReady -Url $probeUrl) {
        $ready = $true
        break
    }
}

if (-not $ready) {
    Write-Failure -Stage 'wait-localhost' -Message "Timed out waiting for $probeUrl"
}

$state = [ordered]@{
    pid = $process.Id
    port = $selectedPort
    url = $url
    webRoot = $webRoot
    startedAt = (Get-Date).ToString('o')
}

$state | ConvertTo-Json | Set-Content -Path $stateFile -Encoding UTF8

Write-Output 'local_result=success'
Write-Output 'server_status=running'
Write-Output "pid=$($process.Id)"
Write-Output "url=$url"
Write-Output "stdout_log=$stdoutLog"
Write-Output "stderr_log=$stderrLog"
