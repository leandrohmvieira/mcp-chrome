# leandrohmvieira/mcp-chrome

The maintained continuation of [hangwin/mcp-chrome](https://github.com/hangwin/mcp-chrome). Upstream has had no
commits since 2026-01-06, and npm `mcp-chrome-bridge@1.0.31` (2025-12-30) is its last release. Users install from this
repository's GitHub releases (see the README); nothing is published to npm, where the name belongs to upstream.

## Branches

- `main` is ours and the default branch. CI builds and install-tests every push.
- `master` mirrors upstream. Don't commit here. Sync it with `git fetch upstream && git merge --ff-only upstream/master`.

## What differs from upstream

| Change | Why |
|---|---|
| Releases + installers: `scripts/pack-release.mjs`, `scripts/install.ps1`, `scripts/install.sh`, `.github/workflows/release.yml` | Upstream's install was "download a zip, `npm i -g` from the registry, hope the ids match". Agents installing the fork fell back to upstream, and building from source on the target machine was the only way to get our code. |
| Fixed extension id `ifjjgkpcpjfkfomkpbnkhhblnfgejono`: the public key is committed in `app/chrome-extension/wxt.config.ts`; the bridge's `allowed_origins` lists it plus upstream's `hbdgbgagpkpjffpklnamcljpakneikee` (`native-server/src/scripts/constant.ts`) | Native messaging only talks to extension ids listed in the host manifest. Upstream pinned its id with a key nobody else had, so a clean build got a random id and "Service Not Started". |
| `better-sqlite3` ^12 as an optional dependency, loaded lazily in `agent/db/client.ts` | 11.10 has no Node 24 prebuild on Windows, so `npm i -g` needed Visual Studio Build Tools. Only the agent-chat storage uses it. |
| The release tarball bundles `chrome-mcp-shared` | Upstream fetched its own copy from npm. The bundled copy's `dependencies` are stripped: npm treats a bundled package's dependencies as part of the bundle and leaves the bridge's shared ones (the MCP SDK tree) as empty folders. `pack-release.mjs` refuses to pack if shared's dist ever gains a runtime require. |
| `native-server/src/mcp/mcp-server.ts` builds a new `Server` per connection | Upstream bug #321: the cached singleton throws "Already connected to a transport" for every client after the first, so one `claude mcp list` bricks the endpoint. Upstream PRs #301/#338/#354 were never merged. |
| `serverInfo.version` is the bridge's package version | Lets a client tell which build it reaches; upstream hardcoded `1.0.0`. |
| User-visible text in pt-BR: new `_locales/pt_BR`, `default_locale: 'pt_BR'`, translated hard-coded strings (popup, sidepanel, workflow builder, record-replay, inject scripts, native-server CLI) | Upstream defaulted to `zh_CN`, so any Chrome language without a locale (pt-BR included) showed Chinese. Code comments and the `*_zh.md` docs stay Chinese on purpose. Kept on purpose: Readability's ad/loading regexes (pt words appended) and the multilingual model-warmup texts. |
| The quick-panel and element-picker content scripts clean up on a non-persisted `pagehide` instead of `unload` | `unload` is deprecated and many sites block it via Permissions-Policy. That logged one "Permissions policy violation: unload is not allowed" error per tab in chrome://extensions, and the listener also kept pages out of the back/forward cache. |

## Extension id and keys

The manifest `key` is the extension's public key; Chrome derives the id from it. It is public by design and lives in
`wxt.config.ts`. The matching private key is only needed to pack a `.crx` or for a first Chrome Web Store upload; it
is kept outside the repo by the maintainer.

`CHROME_EXTENSION_KEY` (env, or `app/chrome-extension/.env.local`) overrides the key. Use it only to build with another
id, for example upstream's key to keep an existing install (and its settings) on `hbdgbgagpkpjffpklnamcljpakneikee`.
A release must never be built that way: `pack-release.mjs` fails when the manifest's id isn't the bridge's
`EXTENSION_ID`. To change the id, change the key in `wxt.config.ts` and `EXTENSION_ID` together, and move the old id
to `LEGACY_EXTENSION_IDS` so installed extensions keep connecting.

## Releasing

1. Bump `version` in `app/native-server/package.json`, `app/chrome-extension/package.json` and the root
   `package.json` (CI refuses a tag that doesn't match), and add a `## vX.Y.Z` section to `CHANGELOG.md`.
2. Commit, then `git tag vX.Y.Z && git push origin main vX.Y.Z`.
3. The workflow builds, runs the installers on clean Windows (PowerShell 5.1, Node 22/24), macOS and Linux
   (Node 20/24) runners, smoke-tests the installed host (`scripts/smoke-bridge.mjs`), and publishes the release with
   the tarball, the extension zip and `SHA256SUMS.txt`. The release notes are that version's CHANGELOG section.

The installers always take the latest release, so a release is live for new installs as soon as it is published.

## Building

```bash
npm i -g pnpm@8                       # the lockfile is v6
pnpm install --frozen-lockfile --ignore-scripts
pnpm run build:shared && pnpm run build:native
pnpm --filter chrome-mcp-server exec wxt prepare
NODE_ENV=production pnpm --filter chrome-mcp-server exec wxt build   # -> app/chrome-extension/.output/chrome-mv3
node scripts/pack-release.mjs         # -> release/ (the same files as a GitHub release)
```

`--ignore-scripts` skips compiling `better-sqlite3`, which the build doesn't need (pnpm 8's bundled node-gyp also
fails on it under Node 24 on Windows). If `.env.local` sets another `CHROME_EXTENSION_KEY`, run the extension build as
`CHROME_EXTENSION_KEY= ... wxt build` to get the fork's id. On Windows, a `store-dir=<path>` line in an untracked
`.npmrc` moves the pnpm store off the system drive.

To try a packed bridge without touching this machine's native-host registration, install it into a scratch prefix with
`npm i -g --prefix <dir> release/mcp-chrome-bridge-*.tgz --ignore-scripts` and start its `dist/index.js` yourself. The
full path (register, doctor, host launched the way Chrome does) is what CI's install-test job covers.

`vue-tsc --noEmit` reports 133 errors that come from upstream (mostly in `tests/`). Compare against that baseline
instead of expecting zero.
