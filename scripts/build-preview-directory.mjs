import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { manifestFingerprint, verifyManifest } from '../ops/ecs/preview-release-manifest.mjs';

const root = process.cwd();
const sourceDir = resolve(root, 'preview-site');
const outputDir = resolve(root, process.argv[2] ?? '.tmp/pages-preview-artifact');
const manifestPath = resolve(root, process.argv[3] ?? 'preview-site/release-manifest.json');
const publicKeyPath = resolve(root, process.argv[4] ?? 'ops/ecs/keys/preview-release-ed25519.pub.pem');
const forceDisabled = process.argv.includes('--force-disabled');
const template = await readFile(resolve(sourceDir, 'index.html'), 'utf8');
const css = await readFile(resolve(sourceDir, 'styles.css'), 'utf8');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const publicKey = await readFile(publicKeyPath, 'utf8');

let entry = '<span class="button button-primary is-disabled" aria-disabled="true">主项目入口准备中 <span aria-hidden="true">↗</span></span>';
let detail = '<span class="button button-card is-disabled" aria-disabled="true">预览环境准备中 <span aria-hidden="true">↗</span></span>';
let version = '预览环境准备中';
let updated = '等待受控 ECS 环境就绪';

let state = 'disabled';
if (!forceDisabled && manifest.status === 'verified' && ['public-read-only', 'public-full-stack'].includes(manifest.mode)) {
  try {
    verifyManifest(manifest, publicKey);
    const href = manifest.origin;
    entry = `<a class="button button-primary" href="${href}" rel="noopener noreferrer">打开项目预览版 <span aria-hidden="true">↗</span></a>`;
    detail = `<a class="button button-card" href="${href}" rel="noopener noreferrer">进入项目预览版 <span aria-hidden="true">↗</span></a>`;
    version = `release ${manifest.releaseDigest}`;
    updated = `有效至 ${new Date(manifest.expiresAt).toISOString().slice(0, 10)}`;
    state = 'verified';
  } catch {
    // A stale, revoked, malformed, or unverifiable manifest must actively
    // publish the disabled page instead of leaving an older enabled artifact.
  }
}

const html = template
  .replace('<!-- PREVIEW_PRIMARY_ENTRY -->', entry)
  .replace('<!-- PREVIEW_CORE_ENTRY -->', detail)
  .replace('<!-- PREVIEW_RELEASE_VERSION -->', version)
  .replace('<!-- PREVIEW_RELEASE_UPDATED -->', updated);

if (html.includes('<!-- PREVIEW_')) throw new Error('preview_directory_template_marker_missing');
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
const manifestSha256 = manifestFingerprint(manifest);
const linkState = {
  schemaVersion: 1,
  state,
  manifestSha256,
  releaseDigest: state === 'verified' ? manifest.releaseDigest : null,
};
await Promise.all([
  writeFile(resolve(outputDir, 'index.html'), html),
  writeFile(resolve(outputDir, 'styles.css'), css),
  writeFile(resolve(outputDir, 'preview-link-state.json'), `${JSON.stringify(linkState)}\n`),
]);
process.stdout.write(`preview directory built: ${basename(outputDir)}; entry=${state}\n`);
