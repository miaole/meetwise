import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { assertFunnelAbsentOrPreview } from '../ops/ecs/preview-funnel-target.mjs';

const run = promisify(execFile);
const root = process.cwd();
const ledger = resolve(root, 'ops/ecs/preview-release-ledger.mjs');
const finalizer = resolve(root, 'ops/ecs/finalize-preview-web-release.sh');
const releaser = resolve(root, 'ops/ecs/release-preview-web.sh');
const directory = await mkdtemp(resolve(tmpdir(), 'meetwise-preview-ledger-'));
const statePath = resolve(directory, 'state.json');
const release = 'a'.repeat(40);

async function state() {
  const { stdout } = await run(process.execPath, [ledger, 'read', '--path', statePath]);
  return JSON.parse(stdout);
}

async function transition(from, to) {
  await run(process.execPath, [ledger, 'transition', '--path', statePath, '--from', from, '--to', to, '--release', release, '--fingerprint', 'b'.repeat(64), '--origin', 'https://preview.tail39416d.ts.net', '--pages', 'disabled']);
}

try {
  assert.equal((await state()).state, 'idle');
  await transition('idle', 'staged');
  await transition('staged', 'active_unpublished');
  await transition('active_unpublished', 'edge_probing');
  await transition('edge_probing', 'publishing');
  await transition('publishing', 'verified');
  await transition('verified', 'revoked');
  await transition('revoked', 'staged');
  await assert.rejects(() => transition('staged', 'verified'), /preview_ledger_transition_invalid/);
  await transition('staged', 'active_unpublished');
  await transition('active_unpublished', 'edge_probing');
  await transition('edge_probing', 'publishing');
  await transition('publishing', 'revoked');

  const [finalizerSource, releaserSource] = await Promise.all([readFile(finalizer, 'utf8'), readFile(releaser, 'utf8')]);
  const privateStage = finalizerSource.indexOf('controller_publish_manifest "$manifest" "$MEETWISE_PREVIEW_PENDING_MANIFEST" 600');
  const intent = finalizerSource.indexOf('controller_ledger_transition edge_probing publishing');
  const verified = finalizerSource.indexOf('controller_ledger_transition publishing verified');
  const publicManifest = finalizerSource.indexOf('controller_publish_manifest "$manifest" "$public_manifest" 644');
  const restartBeforePublic = finalizerSource.lastIndexOf('systemctl restart meetwise-web-preview.service', publicManifest);
  assert.ok(privateStage >= 0 && privateStage < intent && intent < verified && verified < restartBeforePublic && restartBeforePublic < publicManifest, 'the public manifest must follow a private permit, verified ledger and Web restart');
  assert.ok(releaserSource.indexOf('state" == publishing || "$state" == verified') < releaserSource.indexOf('controller_disable_serving'), 'release rollback must revoke before it fails closed');
  assert.match(releaserSource, /controller_ledger_transition "\$state" failed/, 'rollback must terminalize a private publishing or verified record instead of leaving it unrecoverable');
  assert.doesNotMatch(releaserSource, /ln -sfn/, 'release rollback must not guess a previous current pointer');

  assert.equal(assertFunnelAbsentOrPreview({ Web: {} }, 'preview.tail39416d.ts.net'), null);
  assert.equal(assertFunnelAbsentOrPreview({ Web: { 'preview.tail39416d.ts.net:443': { Handlers: { '/': { Proxy: 'http://127.0.0.1:8080' } } } } }, 'preview.tail39416d.ts.net'), 'https://preview.tail39416d.ts.net');
  assert.throws(() => assertFunnelAbsentOrPreview({ Web: { 'other.tail39416d.ts.net:443': { Handlers: { '/': { Proxy: 'http://127.0.0.1:8080' } } } } }, 'preview.tail39416d.ts.net'), /preview_funnel_/);
  console.log('✓ preview release control plane 18/18 assertions passed; releaseEvidence=false');
} finally {
  await rm(directory, { recursive: true, force: true });
}
