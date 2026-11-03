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
| User-visible text in pt-BR: new `_locales/pt_BR`, `default_locale: 'pt_BR'`, translated hard-coded strings (popup, sidepanel, workflow builder, record-replay, inject scripts, native-server CLI) | Upstream defaulted to `zh_CN`, so any Chrome language without a locale (pt-BR included) showed Chinese. Code comments and the `*_zh.md` docs stay Chinese on purpose. Kept on purpose: Readability's ad/loading regexes (pt words appended) and the multilingual model-warmup texts. |

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

## Building the extension

```bash
pnpm install --filter "chrome-mcp-server..." --frozen-lockfile --ignore-scripts
cd app/chrome-extension && npx wxt prepare
NODE_ENV=production npx wxt build      # -> app/chrome-extension/.output/chrome-mv3
```

Before building, put `CHROME_EXTENSION_KEY=<the manifest "key" of the installed extension>` in
`app/chrome-extension/.env.local` (gitignored). That pins the id to `hbdgbgagpkpjffpklnamcljpakneikee`,
so the native-messaging manifest and the extension's settings carry over. Without it Chrome
assigns a new id and the bridge reports "Service Not Started".

`vue-tsc --noEmit` reports 133 errors that come from upstream (mostly in `tests/`). Compare
against that baseline instead of expecting zero.

## Deployments

- **Desktop (DESKTOP-68UQNDN):** the global `mcp-chrome-bridge@1.0.31` with the same fix applied by hand.
  The extension is loaded unpacked from `F:\mcp-chrome\extension`, id `hbdgbgagpkpjffpklnamcljpakneikee`.
- **Contabo VPS:** the same npm release, patched by `vps-provision/patch_mcp_chrome.py`. Chrome runs headed under Xvfb.
