# leandrohmvieira/mcp-chrome

Our maintained fork of [hangwin/mcp-chrome](https://github.com/hangwin/mcp-chrome). Upstream has had
no commits since 2026-01-06, and npm `mcp-chrome-bridge@1.0.31` (2025-12-30) is its last release.

## Branches

- `master` mirrors upstream. Don't commit here. Sync it with `git fetch upstream && git merge --ff-only upstream/master`.
- `main` is our version, the default branch.

## What differs from upstream

| Change | Why |
|---|---|
| `native-server/src/mcp/mcp-server.ts` builds a new `Server` per connection | Upstream bug #321: the cached singleton throws "Already connected to a transport" for every client after the first, so one `claude mcp list` bricks the endpoint. Upstream PRs #301/#338/#354 were never merged. |

## Building on Windows (native server)

```bash
npm i -g pnpm@8                       # the lockfile is v6
echo "store-dir=F:/pnpm-store" > .npmrc   # keeps the store off C:, gitignored locally
pnpm install --filter "mcp-chrome-bridge..." --frozen-lockfile --ignore-scripts
pnpm run build:shared && pnpm run build:native
```

`--ignore-scripts` is needed because pnpm 8's bundled node-gyp can't compile `better-sqlite3@11.10.0`
on Node 24 here (error MSB8020, the ClangCL toolset). Only the optional agent/CLI features use it. The MCP tools don't.

Check the result against an installed release: the built `app/native-server/dist` should match
the published package, apart from the changes listed above.

## Deployments

- **Desktop (DESKTOP-68UQNDN):** the global `mcp-chrome-bridge@1.0.31` with the same fix applied by hand.
  The extension is loaded unpacked from `F:\mcp-chrome\extension`, id `hbdgbgagpkpjffpklnamcljpakneikee`.
- **Contabo VPS:** the same npm release, patched by `vps-provision/patch_mcp_chrome.py`. Chrome runs headed under Xvfb.
