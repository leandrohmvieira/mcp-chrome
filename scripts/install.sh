#!/usr/bin/env bash
# Installs mcp-chrome on macOS / Linux: the bridge (native host + MCP server) and the Chrome extension.
# This is the maintained fork github.com/leandrohmvieira/mcp-chrome, not hangwin/mcp-chrome.
#
#   curl -fsSL https://raw.githubusercontent.com/leandrohmvieira/mcp-chrome/main/scripts/install.sh | bash
#   curl -fsSL .../install.sh | bash -s -- --version v1.1.0
#
# Options:
#   --version <tag>       release to install (default: latest)
#   --extension-dir <d>   where the unpacked extension lives (keep it stable; Chrome loads it from there)
#   --assets-dir <d>      install from local mcp-chrome-bridge-*.tgz / mcp-chrome-extension-*.zip (CI, offline)
#   --no-claude           don't register the MCP server with Claude Code
#   --no-browser          don't open chrome://extensions at the end
# Re-running it updates an existing install in place.
set -euo pipefail

REPO="leandrohmvieira/mcp-chrome"
EXTENSION_ID="ifjjgkpcpjfkfomkpbnkhhblnfgejono"
UPSTREAM_EXTENSION_ID="hbdgbgagpkpjffpklnamcljpakneikee"
MCP_URL="http://127.0.0.1:12306/mcp"

VERSION="latest"
ASSETS_DIR=""
NO_CLAUDE=0
NO_BROWSER=0
if [[ "$(uname -s)" == "Darwin" ]]; then
  EXTENSION_DIR="$HOME/Library/Application Support/mcp-chrome/extension"
  CHROME_PROFILES="$HOME/Library/Application Support/Google/Chrome"
else
  EXTENSION_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/mcp-chrome/extension"
  CHROME_PROFILES="$HOME/.config/google-chrome"
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version) VERSION="$2"; shift 2 ;;
    --extension-dir) EXTENSION_DIR="$2"; shift 2 ;;
    --assets-dir) ASSETS_DIR="$2"; shift 2 ;;
    --no-claude) NO_CLAUDE=1; shift ;;
    --no-browser) NO_BROWSER=1; shift ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

step() { printf '\033[36m==> %s\033[0m\n' "$*"; }
info() { printf '    %s\n' "$*"; }
warn() { printf '\033[33m    ! %s\033[0m\n' "$*"; }
die() { printf '\033[31merror: %s\033[0m\n' "$*" >&2; exit 1; }

# --- 1. Node.js -------------------------------------------------------------
step "Checking Node.js (>= 20)"
command -v node >/dev/null || die "Node.js 20+ is required. Install the LTS from https://nodejs.org (or with nvm) and run this again."
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[[ "$NODE_MAJOR" -ge 20 ]] || die "Node.js $NODE_MAJOR is too old; 20+ is required."
info "node $(node -v)"

# --- 2. Release files -------------------------------------------------------
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

if [[ -n "$ASSETS_DIR" ]]; then
  step "Using release files from $ASSETS_DIR"
  TGZ="$(ls "$ASSETS_DIR"/mcp-chrome-bridge-*.tgz | head -1)"
  ZIP="$(ls "$ASSETS_DIR"/mcp-chrome-extension-*.zip | head -1)"
  TAG="local"
else
  if [[ "$VERSION" == "latest" ]]; then API="https://api.github.com/repos/$REPO/releases/latest"
  else API="https://api.github.com/repos/$REPO/releases/tags/$VERSION"; fi
  step "Finding release ($VERSION) on github.com/$REPO"
  curl -fsSL -H "User-Agent: mcp-chrome-installer" "$API" -o "$WORK/release.json"
  read -r TAG TGZ_URL ZIP_URL SUM_URL < <(node -e '
    const r = require(process.argv[1]);
    const url = (re) => (r.assets.find((a) => re.test(a.name)) || {}).browser_download_url || "-";
    console.log(r.tag_name, url(/^mcp-chrome-bridge-.*\.tgz$/), url(/^mcp-chrome-extension-.*\.zip$/), url(/^SHA256SUMS\.txt$/));
  ' "$WORK/release.json")
  [[ "$TGZ_URL" != "-" && "$ZIP_URL" != "-" ]] || die "release $TAG has no bridge/extension assets"
  info "release $TAG"
  TGZ="$WORK/$(basename "$TGZ_URL")"
  ZIP="$WORK/$(basename "$ZIP_URL")"
  curl -fsSL "$TGZ_URL" -o "$TGZ"
  curl -fsSL "$ZIP_URL" -o "$ZIP"
  if [[ "$SUM_URL" != "-" ]]; then
    curl -fsSL "$SUM_URL" -o "$WORK/SHA256SUMS.txt"
    (cd "$WORK" && grep -E "  ($(basename "$TGZ")|$(basename "$ZIP"))\$" SHA256SUMS.txt | \
      { if command -v sha256sum >/dev/null; then sha256sum -c --quiet -; else shasum -a 256 -c --quiet -; fi; }) \
      || die "checksum mismatch"
    info "checksums ok"
  fi
fi
[[ -f "$TGZ" && -f "$ZIP" ]] || die "bridge or extension file missing"

# --- 3. Bridge --------------------------------------------------------------
step "Installing the bridge (npm install -g $(basename "$TGZ"))"
if ! npm install -g "$TGZ" --no-fund --no-audit; then
  die "npm install -g failed. If it was a permission error (EACCES), use a Node.js from nvm/fnm, or run
    npm config set prefix ~/.npm-global   and add ~/.npm-global/bin to PATH; don't use sudo."
fi

# npm's global bin folder may not be on PATH in this shell
BRIDGE="$(npm prefix -g)/bin/mcp-chrome-bridge"
[[ -x "$BRIDGE" ]] || BRIDGE="mcp-chrome-bridge"

step "Registering the native-messaging host for Chrome"
"$BRIDGE" register --browser all

# --- 4. Extension -----------------------------------------------------------
step "Unpacking the extension to $EXTENSION_DIR"
mkdir -p "$WORK/extension"
if command -v unzip >/dev/null; then unzip -q "$ZIP" -d "$WORK/extension"
elif command -v python3 >/dev/null; then python3 -m zipfile -e "$ZIP" "$WORK/extension"
else die "need unzip (or python3) to unpack the extension"; fi
[[ -f "$WORK/extension/manifest.json" ]] || die "the extension zip has no manifest.json at its root"
if [[ -d "$EXTENSION_DIR" ]]; then
  # Only ever empty a folder that holds an extension (or nothing): --extension-dir could point anywhere.
  if [[ -n "$(ls -A "$EXTENSION_DIR")" && ! -f "$EXTENSION_DIR/manifest.json" ]]; then
    die "$EXTENSION_DIR is not empty and holds no extension; choose another --extension-dir"
  fi
  find "$EXTENSION_DIR" -mindepth 1 -delete
fi
mkdir -p "$EXTENSION_DIR"
cp -R "$WORK/extension/." "$EXTENSION_DIR/"

LOADED=0
UPSTREAM=0
if [[ -d "$CHROME_PROFILES" ]]; then
  grep -rlsq --include="*Preferences" "$EXTENSION_ID" "$CHROME_PROFILES" && LOADED=1 || true
  grep -rlsq --include="*Preferences" "$UPSTREAM_EXTENSION_ID" "$CHROME_PROFILES" && UPSTREAM=1 || true
fi

# --- 5. Claude Code ---------------------------------------------------------
if [[ "$NO_CLAUDE" -eq 0 ]] && command -v claude >/dev/null; then
  step "Registering the MCP server with Claude Code"
  if claude mcp get chrome-mcp-server >/dev/null 2>&1; then
    info "chrome-mcp-server is already configured in Claude Code"
  else
    claude mcp add --scope user --transport http chrome-mcp-server "$MCP_URL"
  fi
fi

# --- 6. Next steps ----------------------------------------------------------
echo
printf '\033[32mmcp-chrome %s installed.\033[0m\n\n' "$TAG"
if [[ "$LOADED" -eq 1 ]]; then
  echo "The extension is already loaded in Chrome."
  echo 'Open chrome://extensions and click the reload icon on "Chrome MCP Server", or restart Chrome.'
else
  echo "One manual step left - Chrome only lets you add an unpacked extension yourself:"
  echo "  1. In Chrome, open chrome://extensions"
  echo '  2. Turn on "Developer mode" (top right)'
  echo '  3. Click "Load unpacked" and choose this folder:'
  printf '\033[33m     %s\033[0m\n' "$EXTENSION_DIR"
  echo "  The extension connects to the bridge by itself after loading."
fi
if [[ "$UPSTREAM" -eq 1 ]]; then
  echo
  warn "A Chrome profile still has the old upstream extension (id $UPSTREAM_EXTENSION_ID)."
  warn "Remove it in chrome://extensions, or both extensions will fight over port 12306."
fi
echo
echo "MCP endpoint: $MCP_URL  (streamable HTTP)"
command -v claude >/dev/null || echo "Claude Code: claude mcp add --scope user --transport http chrome-mcp-server $MCP_URL"
echo "Check the install any time with: mcp-chrome-bridge doctor"

if [[ "$NO_BROWSER" -eq 0 && "$LOADED" -eq 0 && "$(uname -s)" == "Darwin" ]]; then
  open -a "Google Chrome" "chrome://extensions/" 2>/dev/null || true
fi
