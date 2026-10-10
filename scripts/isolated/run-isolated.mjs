/**
 * S3 — clearer entry for the generic isolated runner (fixture shell).
 *
 * Forwards argv to scripts/run-e2e-isolated.mjs so existing package.json
 * aliases (pnpm e2e:isolated, *:prove wrappers) stay valid on the legacy path.
 * Prefer this path in new docs / ops when meaning "start temporary DB cluster
 * then spawn any target" — not "this alone is live E2E covered".
 *
 * LIVE vs prove-shell: see ./targets-live-e2e.mjs · ./targets-domain-prove.mjs
 * R5-MARKED-RED: default E2E_PG_IMAGE remains pgvector — NOT sole-stack truth.
 * G3: sole fail-closed bans unmarked E2E_PG_IMAGE as sole green (approved=compose.mysql-local only).
 * releaseEvidence=false · Not HA · 本绿≠已迁 · 壳本身 ≠ covered · ≠ flip isolation default
 *
 * Rollback: delete scripts/isolated/ (or git revert); legacy entrypoint unchanged.
 */
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const legacy = join(dirname(fileURLToPath(import.meta.url)), '..', 'run-e2e-isolated.mjs');
const child = spawn(process.execPath, [legacy, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
});

child.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
