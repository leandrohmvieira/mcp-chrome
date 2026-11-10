#!/usr/bin/env node
// End-to-end check of an INSTALLED bridge, the way Chrome uses it, without Chrome:
//   1. `mcp-chrome-bridge doctor` must find a valid native-messaging manifest for Chrome
//      whose allowed_origins include the fork's extension id;
//   2. launch the manifest's host the way Chrome does and send the extension's "start" message;
//   3. the MCP endpoint must answer initialize and list the browser tools.
// Usage: node scripts/smoke-bridge.mjs [port]   (default 12399, to stay off a live 12306)
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';

const port = Number(process.argv[2] || 12399);
let host;
const kill = () => {
  if (!host) return;
  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /pid ${host.pid} /t /f`, { stdio: 'ignore' });
    } catch {}
  } else {
    host.kill('SIGTERM');
  }
};
const fail = (msg) => {
  console.error(`smoke: FAIL - ${msg}`);
  kill();
  process.exit(1);
};

let report;
try {
  report = JSON.parse(
    execSync('mcp-chrome-bridge doctor --json --browser chrome', { encoding: 'utf8' }),
  );
} catch (e) {
  // doctor exits non-zero when any check fails; its JSON is still on stdout
  if (!e.stdout) fail(`doctor did not run: ${e.message}`);
  report = JSON.parse(e.stdout);
}
const manifestCheck = report.checks.find((c) => c.id === 'manifest.chrome');
if (!manifestCheck || manifestCheck.status !== 'ok') {
  fail(`Chrome manifest check: ${JSON.stringify(manifestCheck, null, 2)}`);
}
const manifest = JSON.parse(fs.readFileSync(manifestCheck.details.path, 'utf8'));
const origin = manifestCheck.details.expectedOrigin;
console.log(
  `smoke: manifest ok (${manifestCheck.details.path}), allows ${manifest.allowed_origins.join(' ')}`,
);

// Chrome starts the host with the caller's origin as the first argument.
host =
  process.platform === 'win32'
    ? spawn(`"${manifest.path}" ${origin}`, { shell: true, stdio: ['pipe', 'pipe', 'inherit'] })
    : spawn(manifest.path, [origin], { stdio: ['pipe', 'pipe', 'inherit'] });
host.on('exit', (code) => console.log(`smoke: host exited (${code})`));
host.stdout.on('data', () => {});

const send = (msg) => {
  const body = Buffer.from(JSON.stringify(msg));
  const len = Buffer.alloc(4);
  len.writeUInt32LE(body.length, 0);
  host.stdin.write(Buffer.concat([len, body]));
};
send({ type: 'start', payload: { port } });

const url = `http://127.0.0.1:${port}/mcp`;
const headers = {
  'content-type': 'application/json',
  accept: 'application/json, text/event-stream',
};
const parse = async (res) => {
  const text = await res.text();
  const data = text.split('\n').find((l) => l.startsWith('data:'));
  return JSON.parse(data ? data.slice(5) : text);
};

try {
  let init;
  for (let i = 0; i < 60 && !init; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-03-26',
            capabilities: {},
            clientInfo: { name: 'smoke', version: '1' },
          },
        }),
      });
      if (res.ok) init = { session: res.headers.get('mcp-session-id'), body: await parse(res) };
    } catch {}
    if (!init) await new Promise((r) => setTimeout(r, 500));
  }
  if (!init) fail(`no MCP server on ${url} within 30 s`);
  console.log(`smoke: initialize -> ${JSON.stringify(init.body.result?.serverInfo)}`);

  const h = { ...headers, 'mcp-session-id': init.session };
  await fetch(url, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
  });
  const tools = await parse(
    await fetch(url, {
      method: 'POST',
      headers: h,
      body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
    }),
  );
  const names = (tools.result?.tools || []).map((t) => t.name);
  if (!names.includes('chrome_navigate'))
    fail(`tools/list has no chrome_navigate: ${JSON.stringify(tools).slice(0, 300)}`);
  console.log(`smoke: OK - ${names.length} tools`);
} finally {
  kill();
}
process.exit(0);
