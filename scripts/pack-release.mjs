#!/usr/bin/env node
// Packs a release from already-built output into ./release:
//   mcp-chrome-bridge-<version>.tgz     npm package of the native host, chrome-mcp-shared bundled inside
//   mcp-chrome-extension-<version>.zip  the unpacked extension (manifest.json at the zip root)
//   SHA256SUMS.txt
// Build first: pnpm run build:shared && pnpm run build:native && pnpm run build:extension
import { createHash } from 'node:crypto';
import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'release');
const nativeDir = path.join(root, 'app', 'native-server');
const sharedDir = path.join(root, 'packages', 'shared');
const extDir = path.join(root, 'app', 'chrome-extension', '.output', 'chrome-mv3');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const fail = (msg) => {
  console.error(`pack-release: ${msg}`);
  process.exit(1);
};

for (const [what, p] of [
  ['native server', path.join(nativeDir, 'dist', 'cli.js')],
  ['shared package', path.join(sharedDir, 'dist', 'index.js')],
  ['extension', path.join(extDir, 'manifest.json')],
]) {
  if (!fs.existsSync(p)) fail(`${what} is not built (${p} missing)`);
}

const nativePkg = readJson(path.join(nativeDir, 'package.json'));
const sharedPkg = readJson(path.join(sharedDir, 'package.json'));
const extManifest = readJson(path.join(extDir, 'manifest.json'));
const version = nativePkg.version;
if (extManifest.version !== version) {
  fail(`version mismatch: bridge ${version}, extension ${extManifest.version}`);
}

// The extension id comes from the manifest key; the bridge must allow exactly that id.
if (!extManifest.key) fail('extension manifest has no "key", so its id would depend on the folder');
const idHash = createHash('sha256').update(Buffer.from(extManifest.key, 'base64')).digest('hex');
const extensionId = [...idHash.slice(0, 32)]
  .map((c) => String.fromCharCode(97 + parseInt(c, 16)))
  .join('');
const constants = fs.readFileSync(path.join(nativeDir, 'dist', 'scripts', 'constant.js'), 'utf8');
if (!constants.includes(`'${extensionId}'`)) {
  fail(
    `extension id ${extensionId} is not EXTENSION_ID in the bridge (app/native-server/src/scripts/constant.ts)`,
  );
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// --- bridge tarball -------------------------------------------------------
const stage = path.join(out, '.stage', 'bridge');
fs.mkdirSync(stage, { recursive: true });
fs.cpSync(path.join(nativeDir, 'dist'), path.join(stage, 'dist'), {
  recursive: true,
  filter: (src) => !/node_path\.txt$/.test(src) && !src.includes(`${path.sep}logs${path.sep}`),
});
fs.copyFileSync(path.join(root, 'LICENSE'), path.join(stage, 'LICENSE'));
fs.copyFileSync(path.join(root, 'README.md'), path.join(stage, 'README.md'));

const sharedStage = path.join(stage, 'node_modules', 'chrome-mcp-shared');
fs.cpSync(path.join(sharedDir, 'dist'), path.join(sharedStage, 'dist'), { recursive: true });
// The bundled copy must declare no dependencies: npm treats a bundled package's dependencies as part of
// the bundle and then leaves those that the bridge also uses (the MCP SDK and its whole tree) as empty
// folders. shared's dist has no runtime requires today; refuse to pack if that changes.
for (const f of ['index.js', 'index.mjs']) {
  const code = fs.readFileSync(path.join(sharedDir, 'dist', f), 'utf8');
  const deps = [...code.matchAll(/(?:require\(|from\s*)["']([^"'.][^"']*)["']/g)].map((m) => m[1]);
  if (deps.length)
    fail(
      `chrome-mcp-shared/dist/${f} now loads ${deps.join(', ')} at runtime; add them to the bridge`,
    );
}
const { devDependencies: _d, scripts: _s, dependencies: _sd, ...sharedManifest } = sharedPkg;
fs.writeFileSync(
  path.join(sharedStage, 'package.json'),
  JSON.stringify(sharedManifest, null, 2) + '\n',
);

const { devDependencies: _nd, husky: _h, 'lint-staged': _ls, ...pkg } = nativePkg;
pkg.scripts = { postinstall: nativePkg.scripts.postinstall };
pkg.dependencies = { ...pkg.dependencies, 'chrome-mcp-shared': sharedPkg.version };
pkg.bundleDependencies = ['chrome-mcp-shared'];
pkg.files = ['dist', '!dist/node_path.txt', 'LICENSE', 'README.md'];
fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

execSync(`npm pack --silent --pack-destination "${out}"`, { cwd: stage, stdio: 'inherit' });
const tgz = `${pkg.name}-${version}.tgz`;
if (!fs.existsSync(path.join(out, tgz))) fail(`npm pack did not produce ${tgz}`);

// --- extension zip --------------------------------------------------------
const zipName = `mcp-chrome-extension-${version}.zip`;
const zipPath = path.join(out, zipName);
const has = (cmd) => {
  try {
    execSync(process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`, {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
};
if (process.platform !== 'win32' && has('zip')) {
  execFileSync('zip', ['-qr', zipPath, '.'], { cwd: extDir, stdio: 'inherit' });
} else {
  // bsdtar writes zip archives with -a. On Windows, name System32's tar.exe explicitly: Git Bash puts
  // GNU tar (no zip support) first on PATH.
  const bsdtar =
    process.platform === 'win32'
      ? path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe')
      : 'tar';
  // List the top-level entries instead of '.', which would prefix every name with './'.
  execFileSync(bsdtar, ['-a', '-c', '-f', zipPath, '-C', extDir, ...fs.readdirSync(extDir)], {
    stdio: 'inherit',
  });
}

fs.rmSync(path.join(out, '.stage'), { recursive: true, force: true });

// --- checksums ------------------------------------------------------------
const sums = [tgz, zipName]
  .map(
    (f) =>
      `${createHash('sha256')
        .update(fs.readFileSync(path.join(out, f)))
        .digest('hex')}  ${f}`,
  )
  .join('\n');
fs.writeFileSync(path.join(out, 'SHA256SUMS.txt'), sums + '\n');

console.log(`release/${tgz}\nrelease/${zipName}\nextension id ${extensionId}`);
