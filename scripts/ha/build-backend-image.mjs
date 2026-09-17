#!/usr/bin/env node
/**
 * Build local Meetwise HA dual backend image tag.
 *
 * releaseEvidence=false · Not HA · claimProductionHA=false
 *
 * Tags: MEETWISE_HA_BACKEND_IMAGE || meetwise-backend:ha-dual-local
 * Dockerfile: docker/Dockerfile.ha-dual (runtime shell; compose bind-mounts repo)
 *
 * Modes:
 *   (default)     → docker build; EXIT=0 on success (still Not HA)
 *   --require-auth→ refuse unless MEETWISE_HA_DUAL_AUTHORIZED=1
 *   --check       → only inspect whether image exists; EXIT=0 if present else 1
 *
 * Building this image ≠ dual instances up ≠ shared-state ≠ production HA.
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const DOCKERFILE = join(ROOT, 'docker/Dockerfile.ha-dual');
const CONTEXT = join(ROOT, 'docker');
const DEFAULT_TAG = 'meetwise-backend:ha-dual-local';
const tag = process.env.MEETWISE_HA_BACKEND_IMAGE ?? DEFAULT_TAG;

const args = process.argv.slice(2);
const requireAuth = args.includes('--require-auth');
const checkOnly = args.includes('--check');
const authorized = Boolean(process.env.MEETWISE_HA_DUAL_AUTHORIZED);

function receipt(fields) {
  const lines = [
    '===== RECEIPT ha:dual:build-image =====',
    `result: ${fields.result}`,
    `haStatus: NOT_HA`,
    `releaseEvidence: false`,
    `claimProductionHA: false`,
    `imageTag: ${tag}`,
    `dockerfile: ${DOCKERFILE}`,
    `authorized: ${authorized}`,
  ];
  if (fields.gap) lines.push(`gap: ${fields.gap}`);
  if (fields.note) lines.push(`note: ${fields.note}`);
  lines.push('===== END RECEIPT =====');
  console.log(lines.join('\n'));
}

function imageExists(image) {
  const r = spawnSync('docker', ['image', 'inspect', image], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return r.status === 0;
}

if (!existsSync(DOCKERFILE)) {
  receipt({
    result: 'FAIL',
    gap: `missing ${DOCKERFILE}`,
  });
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/build-backend-image.mjs')} EXIT=1`);
  process.exit(1);
}

if (checkOnly) {
  const ok = imageExists(tag);
  receipt({
    result: ok ? 'IMAGE_PRESENT' : 'PREREQ_GAP',
    gap: ok
      ? undefined
      : `${tag} missing — run: node scripts/ha/build-backend-image.mjs`,
    note: 'check only; Not HA; image present ≠ dual livez ≠ HA',
  });
  const exit = ok ? 0 : 1;
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/build-backend-image.mjs')} --check EXIT=${exit}`);
  process.exit(exit);
}

if (requireAuth && !authorized) {
  receipt({
    result: 'PREREQ_GAP',
    gap: 'MEETWISE_HA_DUAL_AUTHORIZED unset — refuse build under --require-auth',
    note: 'set MEETWISE_HA_DUAL_AUTHORIZED=1 to build for authorized compose prove; still Not HA',
  });
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/build-backend-image.mjs')} --require-auth EXIT=1`);
  process.exit(1);
}

if (/skeleton-not-for-prod/i.test(tag)) {
  receipt({
    result: 'PREREQ_GAP',
    gap: `refusing to build skeleton tag ${tag} — use meetwise-backend:ha-dual-local`,
  });
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/build-backend-image.mjs')} EXIT=1`);
  process.exit(1);
}

console.error(
  `[ha:dual:build-image] building ${tag} from ${DOCKERFILE} (Not HA; releaseEvidence=false)`,
);
const build = spawnSync(
  'docker',
  ['build', '-f', DOCKERFILE, '-t', tag, CONTEXT],
  { encoding: 'utf8', cwd: ROOT },
);
process.stdout.write(build.stdout || '');
process.stderr.write(build.stderr || '');

if (build.status !== 0) {
  receipt({
    result: 'FAIL',
    gap: `docker build failed exit=${build.status}`,
    note: 'cannot produce local HA dual image; compose --compose stays PREREQ',
  });
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/build-backend-image.mjs')} EXIT=1`);
  process.exit(1);
}

receipt({
  result: 'IMAGE_BUILT',
  note: `${tag} built — still Not HA; next: MEETWISE_HA_DUAL_AUTHORIZED=1 pnpm ha:dual:bring-up -- --compose; C3 shared still GAP; releaseEvidence=false`,
});
console.log(`CMD=node ${join(ROOT, 'scripts/ha/build-backend-image.mjs')} EXIT=0`);
process.exit(0);
