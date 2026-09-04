/**
 * Optional remote Postgres proof for interview dispatch fairness.
 *
 * Fail-closed when remote config is missing. Never starts Docker, compose,
 * or `scripts/run-e2e-isolated.mjs`. A pass writes one gitignored receipt
 * under `.tmp/interview-dispatch-receipts/` (`releaseEvidence=false`).
 *
 *   pnpm interview-dispatch:prove
 *   node scripts/run-interview-dispatch-prove.mjs --gate-only
 */
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertInterviewDispatchRemoteGate } from './interview-dispatch-remote-gate.mjs';
import { writeInterviewDispatchRemoteReceipt } from './interview-dispatch-receipt.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GATE_ONLY = process.argv.includes('--gate-only');

try {
  assertInterviewDispatchRemoteGate(process.env);
} catch (error) {
  const code = error instanceof Error ? error.message : 'interview_dispatch_prove_requires_remote_postgres';
  console.error(code);
  process.exit(1);
}

if (GATE_ONLY) {
  console.log('interview_dispatch_prove_shallow_gate_ok');
  process.exit(0);
}

const startedAt = new Date();
const proof = spawn('pnpm', ['interview-dispatch:prove:raw'], {
  cwd: ROOT,
  env: process.env,
  stdio: 'inherit',
  shell: false,
});

proof.on('error', (error) => {
  console.error(error instanceof Error ? error.message : 'interview_dispatch_prove_spawn_failed');
  process.exit(1);
});

proof.on('exit', (code, signal) => {
  const exitCode = signal ? 1 : (code ?? 1);
  void (async () => {
    if (exitCode !== 0) {
      console.error('interview-dispatch:prove remote SQL failed; no pass receipt written; releaseEvidence=false');
      process.exit(exitCode);
    }
    const finishedAt = new Date();
    const { relativePath } = await writeInterviewDispatchRemoteReceipt({
      repoRoot: ROOT,
      receiptRoot: join(ROOT, '.tmp', 'interview-dispatch-receipts'),
      outcome: 'passed',
      exitCode: 0,
      startedAt,
      finishedAt,
    });
    console.log(`interview-dispatch remote receipt: ${relativePath}`);
    console.log('Cite that filename in current-runtime-truth.md only after review. releaseEvidence=false. Not per-push CI.');
    process.exit(0);
  })().catch((error) => {
    console.error(error instanceof Error ? error.message : 'interview_dispatch_receipt_write_failed');
    process.exit(1);
  });
});
