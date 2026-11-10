# Changelog

Releases of the maintained fork. Upstream (hangwin/mcp-chrome) stopped at `mcp-chrome-bridge` 1.0.31 / extension 1.0.0.

## v1.1.0 (2026-11-10)

First release of the fork.

**Installation**

- GitHub releases ship the built bridge (`mcp-chrome-bridge-<version>.tgz`) and extension
  (`mcp-chrome-extension-<version>.zip`), so nobody has to build from source.
- One-command installers: `scripts/install.ps1` (Windows) and `scripts/install.sh` (macOS / Linux). They install the
  bridge, register the native host, unpack the extension to a fixed folder, and add the server to Claude Code.
- CI builds every change and runs the installers on clean Windows, macOS and Linux runners, then checks that the
  installed host serves the MCP tools.
- `better-sqlite3` goes from 11.10 to 12 and becomes optional. 11.10 had no prebuilt binary for Node 24 on Windows, so
  `npm install -g` needed Visual Studio Build Tools. Only the agent-chat storage uses it; the MCP tools run without it.
- The npm package bundles its `chrome-mcp-shared` instead of fetching upstream's copy from the registry.

**Extension ID**

- The extension has its own fixed ID, `ifjjgkpcpjfkfomkpbnkhhblnfgejono`, from a public key committed in
  `app/chrome-extension/wxt.config.ts`. Builds no longer need a key in `.env.local` (without one they got a random ID
  and the bridge refused them).
- The bridge allows both that ID and upstream's `hbdgbgagpkpjffpklnamcljpakneikee`, so existing installs keep working.

**Fixes** (also in the fork before this release)

- A fresh MCP server per connection (upstream #321): a second client, even a `claude mcp list` health check, no
  longer bricks the endpoint with "Already connected to a transport".
- pt-BR translation and pt-BR as the fallback locale instead of zh_CN.
- Content scripts clean up on `pagehide` instead of the deprecated `unload`.
- `serverInfo.version` reports the bridge version instead of a fixed `1.0.0`.
