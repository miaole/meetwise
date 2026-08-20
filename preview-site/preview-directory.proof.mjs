import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { generateKeyPairSync } from 'node:crypto';
import { resolve } from 'node:path';
import { manifestFingerprint, signManifest, unsignedManifest } from '../ops/ecs/preview-release-manifest.mjs';

const directory = import.meta.dirname;
const html = await readFile(resolve(directory, 'index.html'), 'utf8');
const css = await readFile(resolve(directory, 'styles.css'), 'utf8');
const workflow = await readFile(resolve(directory, '../.github/workflows/pages-preview.yml'), 'utf8');
const artifactDir = resolve(directory, '../.tmp/preview-directory-proof');
await rm(artifactDir, { recursive: true, force: true });
await promisify(execFile)(process.execPath, [resolve(directory, '../scripts/build-preview-directory.mjs'), artifactDir]);
const built = await readFile(resolve(artifactDir, 'index.html'), 'utf8');
const validDir = resolve(directory, '../.tmp/preview-directory-valid-proof');
await rm(validDir, { recursive: true, force: true });
await mkdir(validDir, { recursive: true });
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const now = Date.now();
const validManifest = signManifest({
  schemaVersion: 1,
  status: 'verified',
  releaseDigest: 'c3de7fe',
  commit: 'c3de7fe3e67c917c3d73e0065165aaa8ddab7fe8',
  tree: '1'.repeat(40),
  webBuildSha256: 'a'.repeat(64),
  staticAssetsSha256: 'b'.repeat(64),
  origin: 'https://preview.tail0000000.ts.net',
  mode: 'public-read-only',
  issuedAt: new Date(now - 60_000).toISOString(),
  expiresAt: new Date(now + 60_000).toISOString(),
  revoked: false,
  receipts: { candidate: 'c'.repeat(64), loopback: 'd'.repeat(64), methodGate: 'e'.repeat(64), edge: 'f'.repeat(64), blackbox: '0'.repeat(64) },
  signingKeyId: 'ecs-preview-ed25519-v1',
}, privateKey.export({ type: 'pkcs8', format: 'pem' }));
const validManifestPath = resolve(validDir, 'manifest.json');
const validKeyPath = resolve(validDir, 'public.pem');
await writeFile(validManifestPath, `${JSON.stringify(validManifest)}\n`);
await writeFile(validKeyPath, publicKey.export({ type: 'spki', format: 'pem' }));
await promisify(execFile)(process.execPath, [resolve(directory, '../scripts/build-preview-directory.mjs'), resolve(validDir, 'enabled'), validManifestPath, validKeyPath]);
const enabled = await readFile(resolve(validDir, 'enabled/index.html'), 'utf8');
const fullStackManifest = signManifest({
  ...unsignedManifest(validManifest),
  mode: 'public-full-stack',
  receipts: { runtime: '1'.repeat(64), synthetic: '2'.repeat(64), database: '3'.repeat(64), edge: '4'.repeat(64), blackbox: '5'.repeat(64) },
}, privateKey.export({ type: 'pkcs8', format: 'pem' }));
const fullStackManifestPath = resolve(validDir, 'full-stack.json');
await writeFile(fullStackManifestPath, `${JSON.stringify(fullStackManifest)}\n`);
await promisify(execFile)(process.execPath, [resolve(directory, '../scripts/build-preview-directory.mjs'), resolve(validDir, 'full-stack'), fullStackManifestPath, validKeyPath]);
const fullStackEnabled = await readFile(resolve(validDir, 'full-stack/index.html'), 'utf8');
const probeManifest = signManifest({
  ...unsignedManifest(fullStackManifest),
  mode: 'public-full-stack-probe',
}, privateKey.export({ type: 'pkcs8', format: 'pem' }));
const probeManifestPath = resolve(validDir, 'full-stack-probe.json');
await writeFile(probeManifestPath, `${JSON.stringify(probeManifest)}\n`);
await promisify(execFile)(process.execPath, [resolve(directory, '../scripts/build-preview-directory.mjs'), resolve(validDir, 'full-stack-probe'), probeManifestPath, validKeyPath]);
const probeDisabled = await readFile(resolve(validDir, 'full-stack-probe/index.html'), 'utf8');
const expiredManifestPath = resolve(validDir, 'expired.json');
await writeFile(expiredManifestPath, `${JSON.stringify({ ...validManifest, issuedAt: new Date(now - 120_000).toISOString(), expiresAt: new Date(now - 60_000).toISOString() })}\n`);
await promisify(execFile)(process.execPath, [resolve(directory, '../scripts/build-preview-directory.mjs'), resolve(validDir, 'expired'), expiredManifestPath, validKeyPath]);
const expired = await readFile(resolve(validDir, 'expired/index.html'), 'utf8');
const revokedManifest = signManifest({ ...unsignedManifest(validManifest), status: 'revoked', revoked: true }, privateKey.export({ type: 'pkcs8', format: 'pem' }));
const revokedManifestPath = resolve(validDir, 'revoked.json');
await writeFile(revokedManifestPath, `${JSON.stringify(revokedManifest)}\n`);
await promisify(execFile)(process.execPath, [resolve(directory, '../scripts/build-preview-directory.mjs'), resolve(validDir, 'revoked'), revokedManifestPath, validKeyPath, '--force-disabled']);
const revokedState = JSON.parse(await readFile(resolve(validDir, 'revoked/preview-link-state.json'), 'utf8'));
await rm(artifactDir, { recursive: true, force: true });
await rm(validDir, { recursive: true, force: true });
let failures = 0;

function check(name, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures += 1;
}

check('renders a static project introduction and a manifest-derived main-project entry state',
  html.includes('Meetwise 知面')
  && html.includes('<!-- PREVIEW_PRIMARY_ENTRY -->')
  && html.includes('<!-- PREVIEW_RAG_ENTRY -->')
  && html.includes('查看 GitHub 源码'));
check('uses preview-only public wording', html.includes('预览版') && !html.includes('测试版'));
check('does not embed a bare IP address, port, secret or private endpoint',
  !/https?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?/.test(html)
  && !/(?:api[_-]?key|password|postgres(?:ql)?|redis):\/\//i.test(html));
check('keeps the directory static and side-effect free',
  !/<script\b|\bfetch\s*\(|\bXMLHttpRequest\b/i.test(html));
check('marks the prototype directory as non-indexable until its trusted release chain exists',
  html.includes('name="robots" content="noindex,nofollow"'));
check('fails closed until a signed preview manifest enables real HTTPS destinations',
  built.includes('aria-disabled="true"')
  && !/href="https?:\/\/(?!github\.com\/miaole\/meetwise\")/.test(built));
check('renders only the exact signed HTTPS origin and republishes disabled output when it expires',
  /href="https:\/\/preview\.tail0000000\.ts\.net" rel="noopener noreferrer"/.test(enabled)
  && /href="https:\/\/preview\.tail0000000\.ts\.net" rel="noopener noreferrer"/.test(fullStackEnabled)
  && fullStackEnabled.includes('进入题库与岗位路由预览')
  && fullStackEnabled.includes('已随主项目部署')
  && probeDisabled.includes('aria-disabled="true"')
  && !/href="https?:\/\/preview\.tail0000000\.ts\.net"/.test(probeDisabled)
  && expired.includes('aria-disabled="true"')
  && !/href="https?:\/\/preview\.tail0000000\.ts\.net"/.test(expired));
check('a trusted revoked manifest produces the exact disabled receipt fingerprint',
  revokedState.state === 'disabled' && revokedState.manifestSha256 === manifestFingerprint(revokedManifest));
check('uses the confirmed public source repository with a safe external-link policy',
  /href="https:\/\/github\.com\/miaole\/meetwise" rel="noopener noreferrer"/.test(html));
check('provides responsive and reduced-motion presentation',
  css.includes('@media (max-width: 720px)') && css.includes('prefers-reduced-motion'));
check('publishes only a generated static directory from the protected default branch',
  workflow.includes('branches: [main]')
  && workflow.includes('      - preview-site/**')
  && workflow.includes("github.ref == 'refs/heads/main'")
  && workflow.includes('node scripts/build-preview-directory.mjs .pages-preview')
  && workflow.includes('node scripts/verify-preview-origin.mjs')
  && workflow.includes('      - scripts/verify-preview-origin.mjs')
  && workflow.includes('      - ops/ecs/full-stack/nginx-meetwise-full-stack.conf')
  && workflow.includes('--force-disabled')
  && workflow.includes('preview-site/release-manifest.json ops/ecs/keys/preview-release-ed25519.pub.pem --force-disabled')
  && workflow.includes('steps.origin.outputs.fetched')
  && workflow.includes("cron: '17 * * * *'")
  && !workflow.includes('pull_request')
  && !workflow.includes('pull_request_target'));
check('uses a separate least-privilege Pages deployment job with pinned actions',
  workflow.includes('permissions:\n  contents: read')
  && workflow.includes('pages: write')
  && workflow.includes('id-token: write')
  && workflow.includes('actions/upload-pages-artifact@7b1f4a764d45c48632c6b24a0339c27f5614fb0b')
  && workflow.includes('actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e')
  && !workflow.includes('secrets.'));

if (failures) process.exitCode = 1;
