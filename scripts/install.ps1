<#
.SYNOPSIS
  Installs mcp-chrome on Windows: the bridge (native host + MCP server) and the Chrome extension.
  This is the maintained fork github.com/leandrohmvieira/mcp-chrome, not hangwin/mcp-chrome.

.EXAMPLE
  irm https://raw.githubusercontent.com/leandrohmvieira/mcp-chrome/main/scripts/install.ps1 | iex

.EXAMPLE
  # with options
  & ([scriptblock]::Create((irm https://raw.githubusercontent.com/leandrohmvieira/mcp-chrome/main/scripts/install.ps1))) -Version v1.1.0

  Re-running it updates an existing install in place (same extension folder, so a reload in
  chrome://extensions or a Chrome restart picks up the new extension).
#>
param(
  # Release tag to install, e.g. v1.1.0. Default: the latest release.
  [string]$Version = 'latest',
  # Where the unpacked extension lives. Chrome loads it from here, so keep it stable.
  [string]$ExtensionDir = (Join-Path $env:LOCALAPPDATA 'mcp-chrome\extension'),
  # Install from a folder holding mcp-chrome-bridge-*.tgz and mcp-chrome-extension-*.zip (CI, offline).
  [string]$AssetsDir,
  # Don't register the MCP server with Claude Code.
  [switch]$NoClaude,
  # Don't open chrome://extensions at the end.
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Repo = 'leandrohmvieira/mcp-chrome'
$ExtensionId = 'ifjjgkpcpjfkfomkpbnkhhblnfgejono'
$UpstreamExtensionId = 'hbdgbgagpkpjffpklnamcljpakneikee'
$McpUrl = 'http://127.0.0.1:12306/mcp'

function Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Info($msg) { Write-Host "    $msg" }
function Warn($msg) { Write-Host "    ! $msg" -ForegroundColor Yellow }

# Runs a native command with its output discarded and returns the exit code. Windows PowerShell 5.1
# turns redirected stderr into errors, which $ErrorActionPreference = 'Stop' would make fatal.
function Get-ExitCode([string]$exe, [string[]]$arguments) {
  $old = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try { & $exe @arguments *> $null } catch {}
  $code = $LASTEXITCODE
  $ErrorActionPreference = $old
  return $code
}

# Picks up PATH entries added by an installer (winget) without dropping this session's own entries.
function Refresh-Path {
  $env:Path = $env:Path + ';' + [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
}

function Get-NodeMajor {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if (-not $node) { return 0 }
  $v = (& node -v) -replace '^v', ''
  return [int]($v.Split('.')[0])
}

# --- 1. Node.js -------------------------------------------------------------
Step 'Checking Node.js (>= 20)'
$major = Get-NodeMajor
if ($major -lt 20) {
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    if ($major -eq 0) { Info 'Node.js not found, installing Node.js LTS with winget...' }
    else { Info "Node.js $major is too old, installing Node.js LTS with winget..." }
    winget install --id OpenJS.NodeJS.LTS -e --silent --accept-source-agreements --accept-package-agreements | Out-Host
    Refresh-Path
    $major = Get-NodeMajor
  }
  if ($major -lt 20) {
    throw 'Node.js 20 or newer is required. Install the LTS from https://nodejs.org and run this again.'
  }
}
Info "node $(& node -v)"

# --- 2. Release files -------------------------------------------------------
$work = Join-Path $env:TEMP ('mcp-chrome-install-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Path $work | Out-Null

if ($AssetsDir) {
  Step "Using release files from $AssetsDir"
  $tgz = Get-ChildItem -Path $AssetsDir -Filter 'mcp-chrome-bridge-*.tgz' | Select-Object -First 1
  $zip = Get-ChildItem -Path $AssetsDir -Filter 'mcp-chrome-extension-*.zip' | Select-Object -First 1
  if (-not $tgz -or -not $zip) { throw "mcp-chrome-bridge-*.tgz / mcp-chrome-extension-*.zip not found in $AssetsDir" }
  $tgzPath = $tgz.FullName
  $zipPath = $zip.FullName
  $tag = 'local'
} else {
  if ($Version -eq 'latest') { $api = "https://api.github.com/repos/$Repo/releases/latest" }
  else { $api = "https://api.github.com/repos/$Repo/releases/tags/$Version" }
  Step "Finding release ($Version) on github.com/$Repo"
  $release = Invoke-RestMethod -Uri $api -Headers @{ 'User-Agent' = 'mcp-chrome-installer' }
  $tag = $release.tag_name
  $tgzAsset = $release.assets | Where-Object { $_.name -like 'mcp-chrome-bridge-*.tgz' } | Select-Object -First 1
  $zipAsset = $release.assets | Where-Object { $_.name -like 'mcp-chrome-extension-*.zip' } | Select-Object -First 1
  $sumAsset = $release.assets | Where-Object { $_.name -eq 'SHA256SUMS.txt' } | Select-Object -First 1
  if (-not $tgzAsset -or -not $zipAsset) { throw "Release $tag has no bridge/extension assets" }
  Info "release $tag"
  $tgzPath = Join-Path $work $tgzAsset.name
  $zipPath = Join-Path $work $zipAsset.name
  Invoke-WebRequest -Uri $tgzAsset.browser_download_url -OutFile $tgzPath -UseBasicParsing
  Invoke-WebRequest -Uri $zipAsset.browser_download_url -OutFile $zipPath -UseBasicParsing
  if ($sumAsset) {
    $sums = (Invoke-WebRequest -Uri $sumAsset.browser_download_url -UseBasicParsing).Content
    if ($sums -is [byte[]]) { $sums = [Text.Encoding]::UTF8.GetString($sums) }
    foreach ($f in @($tgzPath, $zipPath)) {
      $name = Split-Path $f -Leaf
      $line = ($sums -split "`n") | Where-Object { $_ -match [regex]::Escape($name) } | Select-Object -First 1
      $expected = ($line -split '\s+')[0]
      $actual = (Get-FileHash -Algorithm SHA256 -Path $f).Hash.ToLower()
      if ($expected -ne $actual) { throw "Checksum mismatch for $name" }
    }
    Info 'checksums ok'
  }
}

# --- 3. Bridge --------------------------------------------------------------
# A running native host keeps files in the package open, which can make npm fail with EBUSY/EPERM.
$hosts = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -match 'mcp-chrome-bridge' }
if ($hosts) {
  Step 'Stopping the running bridge (Chrome restarts it on its own)'
  $hosts | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  Start-Sleep -Seconds 1
}

Step "Installing the bridge (npm install -g $(Split-Path $tgzPath -Leaf))"
& npm install -g $tgzPath --no-fund --no-audit
if ($LASTEXITCODE -ne 0) { throw 'npm install -g failed (see the output above)' }
# Call the shim by its full path: npm's global folder may not be on this session's PATH yet.
$bridge = Join-Path ((& npm prefix -g) | Select-Object -Last 1) 'mcp-chrome-bridge.cmd'
if (-not (Test-Path $bridge)) { $bridge = 'mcp-chrome-bridge' }

Step 'Registering the native-messaging host for Chrome'
& $bridge register --browser all
if ($LASTEXITCODE -ne 0) { throw 'mcp-chrome-bridge register failed' }

# --- 4. Extension -----------------------------------------------------------
Step "Unpacking the extension to $ExtensionDir"
$unzipped = Join-Path $work 'extension'
Expand-Archive -Path $zipPath -DestinationPath $unzipped -Force
if (-not (Test-Path (Join-Path $unzipped 'manifest.json'))) { throw 'The extension zip has no manifest.json at its root' }
if (Test-Path $ExtensionDir) {
  # Only ever empty a folder that holds an extension (or nothing): -ExtensionDir could point anywhere.
  $existing = @(Get-ChildItem -Path $ExtensionDir -Force)
  if ($existing.Count -gt 0 -and -not (Test-Path (Join-Path $ExtensionDir 'manifest.json'))) {
    throw "$ExtensionDir is not empty and holds no extension; choose another -ExtensionDir"
  }
  Remove-Item -Path (Join-Path $ExtensionDir '*') -Recurse -Force
} else {
  New-Item -ItemType Directory -Path $ExtensionDir -Force | Out-Null
}
Copy-Item -Path (Join-Path $unzipped '*') -Destination $ExtensionDir -Recurse -Force

# Which Chrome profiles already have the fork (or the old upstream extension) loaded?
$profilesRoot = Join-Path $env:LOCALAPPDATA 'Google\Chrome\User Data'
# Preferences is JSON, so the folder appears there with doubled backslashes.
$escapedDir = $ExtensionDir.TrimEnd('\').Replace('\', '\\').ToLower()
$loaded = @()
$elsewhere = @()
$upstream = @()
if (Test-Path $profilesRoot) {
  Get-ChildItem -Path $profilesRoot -Directory | ForEach-Object {
    foreach ($prefName in @('Secure Preferences', 'Preferences')) {
      $pref = Join-Path $_.FullName $prefName
      if (-not (Test-Path $pref)) { continue }
      $text = Get-Content -Path $pref -Raw -ErrorAction SilentlyContinue
      if (-not $text) { continue }
      if ($text.Contains($ExtensionId)) {
        if ($text.ToLower().Contains($escapedDir)) { $loaded += $_.Name } else { $elsewhere += $_.Name }
      }
      if ($text.Contains($UpstreamExtensionId)) { $upstream += $_.Name }
    }
  }
}
$loaded = @($loaded | Select-Object -Unique)
$elsewhere = @($elsewhere | Where-Object { $loaded -notcontains $_ } | Select-Object -Unique)
$upstream = @($upstream | Select-Object -Unique)

# --- 5. Claude Code ---------------------------------------------------------
if (-not $NoClaude -and (Get-Command claude -ErrorAction SilentlyContinue)) {
  Step 'Registering the MCP server with Claude Code'
  if ((Get-ExitCode 'claude' @('mcp', 'get', 'chrome-mcp-server')) -eq 0) {
    Info 'chrome-mcp-server is already configured in Claude Code'
  } else {
    & claude mcp add --scope user --transport http chrome-mcp-server $McpUrl
  }
}

# --- 6. Next steps ----------------------------------------------------------
Remove-Item -Path $work -Recurse -Force -ErrorAction SilentlyContinue
Write-Host ''
Write-Host "mcp-chrome $tag installed." -ForegroundColor Green
Write-Host ''
if ($loaded.Count -gt 0) {
  Write-Host "The extension is already loaded in Chrome ($($loaded -join ', '))."
  Write-Host 'Open chrome://extensions and click the reload icon on "Chrome MCP Server", or restart Chrome.'
} else {
  Write-Host 'One manual step left - Chrome only lets you add an unpacked extension yourself:'
  Write-Host '  1. In Chrome, open chrome://extensions'
  Write-Host '  2. Turn on "Developer mode" (top right)'
  Write-Host '  3. Click "Load unpacked" and choose this folder (it is on your clipboard):'
  Write-Host "     $ExtensionDir" -ForegroundColor Yellow
  Write-Host '  The extension connects to the bridge by itself after loading.'
  try { Set-Clipboard -Value $ExtensionDir } catch {}
}
if ($elsewhere.Count -gt 0) {
  Write-Host ''
  Warn "Chrome profile(s) $($elsewhere -join ', ') load this extension from another folder."
  Warn "Remove that copy in chrome://extensions and load $ExtensionDir instead, so updates reach it."
}
if ($upstream.Count -gt 0) {
  Write-Host ''
  Warn "Chrome profile(s) $($upstream -join ', ') still have the old upstream extension (id $UpstreamExtensionId)."
  Warn 'Remove it in chrome://extensions, or both extensions will fight over port 12306.'
}
Write-Host ''
Write-Host "MCP endpoint: $McpUrl  (streamable HTTP)"
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
  Write-Host "Claude Code: claude mcp add --scope user --transport http chrome-mcp-server $McpUrl"
}
Write-Host 'Check the install any time with: mcp-chrome-bridge doctor'

if (-not $NoBrowser -and $loaded.Count -eq 0) {
  try { Start-Process 'chrome' 'chrome://extensions/' } catch {}
}
