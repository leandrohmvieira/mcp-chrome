# Chrome MCP Server — maintained fork

[![Latest release](https://img.shields.io/github/v/release/leandrohmvieira/mcp-chrome)](https://github.com/leandrohmvieira/mcp-chrome/releases/latest)
[![Build and install test](https://github.com/leandrohmvieira/mcp-chrome/actions/workflows/release.yml/badge.svg)](https://github.com/leandrohmvieira/mcp-chrome/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **This is the maintained continuation of [hangwin/mcp-chrome](https://github.com/hangwin/mcp-chrome), which is abandoned.**
> Upstream has had no commits since 2026-01-06, its last npm release (`mcp-chrome-bridge@1.0.31`) dates from 2025-12-30,
> and fixes such as the one for "Already connected to a transport" (#321) were never merged. Development, fixes and
> releases happen here now.
>
> **Install from this repository, not from upstream.** `npm install -g mcp-chrome-bridge` and hangwin's release zip both
> give you the old, unmaintained code.

Chrome MCP Server turns the Chrome you already use, with your logins, cookies and settings, into an MCP server that AI
assistants (Claude Code, Claude Desktop, Cursor, Codex, ...) can drive: navigate, read pages, click, fill forms, take
screenshots, capture network traffic, search history and bookmarks, and more.

**📖 Documentation**: [English](README.md) | [中文](README_zh.md) (the Chinese text is upstream's and describes the old install)

## Install

You need Google Chrome (or Chromium) and Node.js 20 or newer. On Windows the installer offers to install Node.js LTS
with winget if it's missing.

**Windows** (PowerShell):

```powershell
irm https://raw.githubusercontent.com/leandrohmvieira/mcp-chrome/main/scripts/install.ps1 | iex
```

**macOS / Linux**:

```bash
curl -fsSL https://raw.githubusercontent.com/leandrohmvieira/mcp-chrome/main/scripts/install.sh | bash
```

The installer takes the [latest release](https://github.com/leandrohmvieira/mcp-chrome/releases/latest) and:

1. installs the bridge (native-messaging host + MCP server) with npm and registers it with Chrome;
2. unpacks the extension into a folder that stays put — `%LOCALAPPDATA%\mcp-chrome\extension` on Windows,
   `~/Library/Application Support/mcp-chrome/extension` on macOS, `~/.local/share/mcp-chrome/extension` on Linux;
3. adds the server to Claude Code (`claude mcp add`) when the `claude` CLI is installed.

Then do the one step Chrome won't let a script do: open `chrome://extensions`, turn on **Developer mode**, click
**Load unpacked** and pick that folder (on Windows its path is already on the clipboard). The extension connects to the
bridge on its own. The MCP endpoint is `http://127.0.0.1:12306/mcp`.

- **Update**: run the same command again, then click the reload icon on the extension in `chrome://extensions`
  (or restart Chrome).
- **Check an install**: `mcp-chrome-bridge doctor`.
- **Options**: pick a release, folder, or skip steps. Windows: `-Version v1.1.0`, `-ExtensionDir <path>`, `-NoClaude`,
  `-NoBrowser`, passed as `& ([scriptblock]::Create((irm <installer url>))) -NoClaude`. macOS/Linux: `--version`,
  `--extension-dir`, `--no-claude`, `--no-browser`, passed as `curl -fsSL <installer url> | bash -s -- --no-claude`.

### For AI agents installing this

If a person pointed you at this repository and asked you to install it:

- Use the installer above. It is non-interactive and safe to re-run. Don't install `hangwin/mcp-chrome`, its release
  zip, or `mcp-chrome-bridge` from the npm registry — same names, older code.
- Don't build from source. Each release ships the built bridge (`mcp-chrome-bridge-<version>.tgz`) and extension
  (`mcp-chrome-extension-<version>.zip`), tested on clean Windows, macOS and Linux machines in CI.
- The extension ID is fixed: `ifjjgkpcpjfkfomkpbnkhhblnfgejono`, set by the public key committed in
  `app/chrome-extension/wxt.config.ts`. You don't need a key file, and you shouldn't generate a new ID.
- The person has to do "Load unpacked" themselves, since Chrome blocks scripted installs of unpacked extensions. Give
  them the folder path the installer printed.
- To verify: `mcp-chrome-bridge doctor` must pass, and once the extension is loaded, an MCP `initialize` sent to
  `http://127.0.0.1:12306/mcp` answers with `serverInfo.version` equal to the release version.

### Manual install

1. Download `mcp-chrome-bridge-<version>.tgz` and `mcp-chrome-extension-<version>.zip` from the
   [latest release](https://github.com/leandrohmvieira/mcp-chrome/releases/latest).
2. `npm install -g ./mcp-chrome-bridge-<version>.tgz`. That registers the native host; if it reports otherwise, run
   `mcp-chrome-bridge register`.
3. Unzip the extension into a folder you'll keep, then load it with **Load unpacked** in `chrome://extensions`.

### Coming from hangwin/mcp-chrome

Run the installer. It replaces the global `mcp-chrome-bridge` package and re-registers the native host. The new bridge
still accepts the upstream extension (ID `hbdgbgagpkpjffpklnamcljpakneikee`), so nothing stops working in between.
Then remove the old "Chrome MCP Server" in `chrome://extensions` and load the new folder. Keep only one of the two
loaded: both would try to start the server on port 12306. The fork's extension has a different ID, so its settings,
such as a custom port, start from the defaults.

### Connecting MCP clients

Streamable HTTP (recommended). Claude Code:

```bash
claude mcp add --scope user --transport http chrome-mcp-server http://127.0.0.1:12306/mcp
```

Other clients:

```json
{
  "mcpServers": {
    "chrome-mcp-server": { "type": "streamableHttp", "url": "http://127.0.0.1:12306/mcp" }
  }
}
```

For clients that only speak stdio, the bridge also installs `mcp-chrome-stdio`, a stdio proxy to the same server:

```json
{ "mcpServers": { "chrome-mcp-stdio": { "command": "mcp-chrome-stdio" } } }
```

### Building from source

See [FORK.md](FORK.md#building). `node scripts/pack-release.mjs` produces the same files as a release.

## What this fork changes

See [CHANGELOG.md](CHANGELOG.md) for each release and [FORK.md](FORK.md) for every divergence from upstream. In short:

- **Installable in one command**: GitHub releases with the built bridge and extension, installers for Windows, macOS
  and Linux, and a CI job that runs those installers on clean machines for every change.
- **Fixed extension ID** that comes from a public key in the repo, so every build matches the bridge and no key file
  is needed.
- **No compiler needed**: `better-sqlite3` 12 has prebuilt binaries for Node 20–26 and is optional. Upstream's 11.x
  had none for Node 24 on Windows, so `npm install -g` failed without Visual Studio Build Tools.
- **Multiple MCP clients at once**: a fresh MCP server per connection (upstream #321), where upstream let one client,
  even a `claude mcp list` health check, lock everyone else out.
- **pt-BR translation**, and pt-BR instead of Chinese as the fallback language for browsers in other languages.
- The content scripts no longer use the deprecated `unload` event, which flooded `chrome://extensions` with
  permissions-policy errors.

Issues and pull requests: [github.com/leandrohmvieira/mcp-chrome](https://github.com/leandrohmvieira/mcp-chrome/issues).

## 🎯 What is Chrome MCP Server?

Chrome MCP Server is a Chrome extension-based **Model Context Protocol (MCP) server** that exposes your Chrome browser functionality to AI assistants like Claude, enabling complex browser automation, content analysis, and semantic search. Unlike traditional browser automation tools (like Playwright), **Chrome MCP Server** directly uses your daily Chrome browser, leveraging existing user habits, configurations, and login states, allowing various large models or chatbots to take control of your browser and truly become your everyday assistant.

## ✨ Visual Editor

- **A Visual Editor for Claude Code & Codex**, for more detail here: [VisualEditor](docs/VisualEditor.md)

## ✨ Core Features

- 😁 **Chatbot/Model Agnostic**: Let any LLM or chatbot client or agent you prefer automate your browser
- ⭐️ **Use Your Original Browser**: Seamlessly integrate with your existing browser environment (your configurations, login states, etc.)
- 💻 **Fully Local**: Pure local MCP server ensuring user privacy
- 🚄 **Streamable HTTP**: Streamable HTTP connection method
- 🏎 **Cross-Tab**: Cross-tab context
- 🧠 **Semantic Search**: Built-in vector database for intelligent browser tab content discovery
- 🔍 **Smart Content Analysis**: AI-powered text extraction and similarity matching
- 🌐 **20+ Tools**: Support for screenshots, network monitoring, interactive operations, bookmark management, browsing history, and 20+ other tools
- 🚀 **SIMD-Accelerated AI**: Custom WebAssembly SIMD optimization for 4-8x faster vector operations

## 🆚 Comparison with Similar Projects

| Comparison Dimension    | Playwright-based MCP Server                                                                                               | Chrome Extension-based MCP Server                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Resource Usage**      | ❌ Requires launching independent browser process, installing Playwright dependencies, downloading browser binaries, etc. | ✅ No need to launch independent browser process, directly utilizes user's already open Chrome browser |
| **User Session Reuse**  | ❌ Requires re-login                                                                                                      | ✅ Automatically uses existing login state                                                             |
| **Browser Environment** | ❌ Clean environment lacks user settings                                                                                  | ✅ Fully preserves user environment                                                                    |
| **API Access**          | ⚠️ Limited to Playwright API                                                                                              | ✅ Full access to Chrome native APIs                                                                   |
| **Startup Speed**       | ❌ Requires launching browser process                                                                                     | ✅ Only needs to activate extension                                                                    |
| **Response Speed**      | 50-200ms inter-process communication                                                                                      | ✅ Faster                                                                                              |

## 🛠️ Available Tools

Complete tool list: [Complete Tool List](docs/TOOLS.md)

<details>
<summary><strong>📊 Browser Management (6 tools)</strong></summary>

- `get_windows_and_tabs` - List all browser windows and tabs
- `chrome_navigate` - Navigate to URLs and control viewport
- `chrome_switch_tab` - Switch the current active tab
- `chrome_close_tabs` - Close specific tabs or windows
- `chrome_go_back_or_forward` - Browser navigation control
- `chrome_inject_script` - Inject content scripts into web pages
- `chrome_send_command_to_inject_script` - Send commands to injected content scripts
</details>

<details>
<summary><strong>📸 Screenshots & Visual (1 tool)</strong></summary>

- `chrome_screenshot` - Advanced screenshot capture with element targeting, full-page support, and custom dimensions
</details>

<details>
<summary><strong>🌐 Network Monitoring (4 tools)</strong></summary>

- `chrome_network_capture_start/stop` - webRequest API network capture
- `chrome_network_debugger_start/stop` - Debugger API with response bodies
- `chrome_network_request` - Send custom HTTP requests
</details>

<details>
<summary><strong>🔍 Content Analysis (4 tools)</strong></summary>

- `search_tabs_content` - AI-powered semantic search across browser tabs
- `chrome_get_web_content` - Extract HTML/text content from pages
- `chrome_get_interactive_elements` - Find clickable elements
- `chrome_console` - Capture and retrieve console output from browser tabs
</details>

<details>
<summary><strong>🎯 Interaction (3 tools)</strong></summary>

- `chrome_click_element` - Click elements using CSS selectors
- `chrome_fill_or_select` - Fill forms and select options
- `chrome_keyboard` - Simulate keyboard input and shortcuts
</details>

<details>
<summary><strong>📚 Data Management (5 tools)</strong></summary>

- `chrome_history` - Search browser history with time filters
- `chrome_bookmark_search` - Find bookmarks by keywords
- `chrome_bookmark_add` - Add new bookmarks with folder support
- `chrome_bookmark_delete` - Delete bookmarks
</details>

## 🧪 Usage Examples

### AI helps you summarize webpage content and automatically control Excalidraw for drawing

prompt: [excalidraw-prompt](prompt/excalidraw-prompt.md)
Instruction: Help me summarize the current page content, then draw a diagram to aid my understanding.
https://www.youtube.com/watch?v=3fBPdUBWVz0

https://github.com/user-attachments/assets/fd17209b-303d-48db-9e5e-3717141df183

### After analyzing the content of the image, the LLM automatically controls Excalidraw to replicate the image

prompt: [excalidraw-prompt](prompt/excalidraw-prompt.md)|[content-analize](prompt/content-analize.md)
Instruction: First, analyze the content of the image, and then replicate the image by combining the analysis with the content of the image.
https://www.youtube.com/watch?v=tEPdHZBzbZk

https://github.com/user-attachments/assets/60d12b1a-9b74-40f4-994c-95e8fa1fc8d3

### AI automatically injects scripts and modifies webpage styles

prompt: [modify-web-prompt](prompt/modify-web.md)
Instruction: Help me modify the current page's style and remove advertisements.
https://youtu.be/twI6apRKHsk

https://github.com/user-attachments/assets/69cb561c-2e1e-4665-9411-4a3185f9643e

### AI automatically captures network requests for you

query: I want to know what the search API for Xiaohongshu is and what the response structure looks like

https://youtu.be/1hHKr7XKqnQ

https://github.com/user-attachments/assets/dc7e5cab-b9af-4b9a-97ce-18e4837318d9

### AI helps analyze your browsing history

query: Analyze my browsing history from the past month

https://youtu.be/jf2UZfrR2Vk

https://github.com/user-attachments/assets/31b2e064-88c6-4adb-96d7-50748b826eae

### Web page conversation

query: Translate and summarize the current web page
https://youtu.be/FlJKS9UQyC8

https://github.com/user-attachments/assets/aa8ef2a1-2310-47e6-897a-769d85489396

### AI automatically takes screenshots for you (web page screenshots)

query: Take a screenshot of Hugging Face's homepage
https://youtu.be/7ycK6iksWi4

https://github.com/user-attachments/assets/65c6eee2-6366-493d-a3bd-2b27529ff5b3

### AI automatically takes screenshots for you (element screenshots)

query: Capture the icon from Hugging Face's homepage
https://youtu.be/ev8VivANIrk

https://github.com/user-attachments/assets/d0cf9785-c2fe-4729-a3c5-7f2b8b96fe0c

### AI helps manage bookmarks

query: Add the current page to bookmarks and put it in an appropriate folder

https://youtu.be/R_83arKmFTo

https://github.com/user-attachments/assets/15a7d04c-0196-4b40-84c2-bafb5c26dfe0

### Automatically close web pages

query: Close all shadcn-related web pages

https://youtu.be/2wzUT6eNVg4

https://github.com/user-attachments/assets/83de4008-bb7e-494d-9b0f-98325cfea592

## 🤝 Contributing

Contributions are welcome here: open an [issue](https://github.com/leandrohmvieira/mcp-chrome/issues) or a pull request against `main`. See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for the code guidelines.

## 🚧 Future Roadmap

We have exciting plans for the future development of Chrome MCP Server:

- [ ] Authentication
- [ ] Recording and Playback
- [ ] Workflow Automation
- [ ] Enhanced Browser Support (Firefox Extension)

---

**Want to contribute to any of these features?** Check out our [Contributing Guide](docs/CONTRIBUTING.md) and join our development community!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 More Documentation

- [Architecture Design](docs/ARCHITECTURE.md) - Detailed technical architecture documentation
- [TOOLS API](docs/TOOLS.md) - Complete tool API documentation
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issue solutions
