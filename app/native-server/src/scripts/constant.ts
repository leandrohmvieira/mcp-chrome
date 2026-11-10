export const COMMAND_NAME = 'mcp-chrome-bridge';
// Extension id of this fork's builds (from the public key in app/chrome-extension/wxt.config.ts).
export const EXTENSION_ID = 'ifjjgkpcpjfkfomkpbnkhhblnfgejono';
// Upstream hangwin/mcp-chrome id. Still allowed so existing installs keep working after a bridge update.
export const LEGACY_EXTENSION_IDS = ['hbdgbgagpkpjffpklnamcljpakneikee'];
export const ALLOWED_EXTENSION_IDS = [EXTENSION_ID, ...LEGACY_EXTENSION_IDS];
export const HOST_NAME = 'com.chromemcp.nativehost';
export const DESCRIPTION = 'Node.js Host for Browser Bridge Extension';
