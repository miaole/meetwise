/**
 * MEM-00 / INT-TRANSCRIPT-00 证明路径编排（诚实、非关闭）。
 *
 * - 可移植（无 Docker）命令：crypto / domain pin / contracts。
 * - 隔离 DB/HTTP 命令经 `run-e2e-isolated.mjs`；本机无 Docker 时记
 *   `blocked:docker_daemon_missing`，绝不写成通过，也不得把 releaseEvidence 置为真。
 * - 禁止本地 compose Postgres 捷径、禁止改生产 DELETE、禁止开 INT-TRANSCRIPT-01 生产 write。
 *
 *   pnpm mem00-int00:prove-path
 *   node scripts/run-mem00-int00-prove-path.mjs --portable-only
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORTABLE_ONLY = process.argv.includes('--portable-only');
const RECEIPT_ROOT = join(ROOT, '.tmp', 'mem00-int00-prove-path');

/** @typedef {{ id: string, command: string[], kind: 'portable' | 'isolated', item: string }} ProveStep */

/** @type {ProveStep[]} */
const PORTABLE = [
  {
    id: 'privacy-authorization:crypto:prove',
    command: ['pnpm', 'privacy-authorization:crypto:prove'],
    kind: 'portable',
    item: 'INT-TRANSCRIPT-00',
  },
  {
    id: 'privacy-erasure-preview:domain:prove',
    command: ['pnpm', 'privacy-erasure-preview:domain:prove'],
    kind: 'portable',
    item: 'INT-TRANSCRIPT-00',
  },
  {
    id: 'privacy-erasure-preview:contract:prove',
    command: ['pnpm', 'privacy-erasure-preview:contract:prove'],
    kind: 'portable',
    item: 'INT-TRANSCRIPT-00',
  },
  {
    id: 'interview-answer-submission:prove',
    command: ['pnpm', 'interview-answer-submission:prove'],
    kind: 'portable',
    item: 'INT-TRANSCRIPT-00',
  },
  {
    id: 'domain:memory-vector-chunk-deletion',
    command: ['pnpm', '-C', 'packages/domain', 'prove:memory-vector-chunk-deletion'],
    kind: 'portable',
    item: 'MEM-00',
  },
];

/** @type {ProveStep[]} */
const ISOLATED = [
  {
    id: 'privacy-authorization:prove',
    command: ['node', 'scripts/run-e2e-isolated.mjs', 'privacy-authorization:prove:raw'],
    kind: 'isolated',
    item: 'INT-TRANSCRIPT-00',
  },
  {
    id: 'privacy-erasure:http:prove',
    command: ['node', 'scripts/run-e2e-isolated.mjs', 'privacy-erasure:http:prove:raw'],
    kind: 'isolated',
    item: 'INT-TRANSCRIPT-00',
  },
  {
    id: 'memory-governance:prove',
    command: ['node', 'scripts/run-e2e-isolated.mjs', 'memory-governance:prove:raw'],
    kind: 'isolated',
    item: 'MEM-00',
  },
  {
    id: 'memory-control-surface:prove',
    command: ['node', 'scripts/run-e2e-isolated.mjs', 'memory-control-surface:prove:raw'],
    kind: 'isolated',
    item: 'MEM-00/MEM-10',
  },
  {
    id: 'memory:prove',
    command: ['node', 'scripts/run-e2e-isolated.mjs', 'memory:prove:raw'],
    kind: 'isolated',
    item: 'MEM-00 lean',
  },
];

function dockerAvailable() {
  return new Promise((resolveAvailable) => {
    const child = spawn('docker', ['info'], {
      cwd: ROOT,
      stdio: ['ignore', 'ignore', 'ignore'],
      env: process.env,
    });
    child.on('error', () => resolveAvailable(false));
    child.on('exit', (code) => resolveAvailable(code === 0));
  });
}

/**
 * @param {string[]} command
 * @returns {Promise<{ exitCode: number, spawnFailed: boolean, outputSnippet: string }>}
 */
function runCommand(command) {
  return new Promise((resolveRun) => {
    let output = '';
    const child = spawn(command[0], command.slice(1), {
      cwd: ROOT,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const append = (chunk) => {
      if (output.length < 64 * 1024) output += chunk.toString('utf8');
    };
    child.stdout.on('data', append);
    child.stderr.on('data', append);
    child.on('error', (error) => {
      resolveRun({
        exitCode: 1,
        spawnFailed: true,
        outputSnippet: error instanceof Error ? error.message : 'spawn_failed',
      });
    });
    child.on('exit', (code) => {
      resolveRun({
        exitCode: code ?? 1,
        spawnFailed: false,
        outputSnippet: output.slice(-2000),
      });
    });
  });
}

function classifyIsolatedFailure(outputSnippet, spawnFailed) {
  if (spawnFailed) return 'blocked:command_spawn_failed';
  if (/bounded_command_spawn_failed|ENOENT|docker: command not found|Cannot connect to the Docker daemon/i.test(outputSnippet)) {
    return 'blocked:docker_daemon_missing';
  }
  return 'failed';
}

async function main() {
  const startedAt = new Date();
  const hasDocker = await dockerAvailable();
  /** @type {Array<Record<string, unknown>>} */
  const results = [];
  let portableFailed = 0;
  let isolatedFailed = 0;
  let isolatedBlocked = 0;

  console.log('MEM00_INT00_PROVE_PATH start portable_only=%s docker_available=%s releaseEvidence=false', PORTABLE_ONLY, hasDocker);

  for (const step of PORTABLE) {
    console.log('RUN  %s (%s)', step.id, step.item);
    const ran = await runCommand(step.command);
    const outcome = ran.exitCode === 0 ? 'passed' : 'failed';
    if (outcome === 'failed') portableFailed += 1;
    console.log('%s  %s exit=%s', outcome === 'passed' ? 'PASS' : 'FAIL', step.id, ran.exitCode);
    results.push({
      id: step.id,
      item: step.item,
      kind: step.kind,
      outcome,
      exitCode: ran.exitCode,
      reason: outcome === 'failed' ? 'portable_prove_failed' : undefined,
    });
  }

  if (!PORTABLE_ONLY) {
    for (const step of ISOLATED) {
      if (!hasDocker) {
        console.log('BLOCK %s (%s) reason=docker_daemon_missing', step.id, step.item);
        isolatedBlocked += 1;
        results.push({
          id: step.id,
          item: step.item,
          kind: step.kind,
          outcome: 'blocked',
          exitCode: 1,
          reason: 'blocked:docker_daemon_missing',
        });
        continue;
      }
      console.log('RUN  %s (%s)', step.id, step.item);
      const ran = await runCommand(step.command);
      if (ran.exitCode === 0) {
        console.log('PASS  %s exit=0', step.id);
        results.push({
          id: step.id,
          item: step.item,
          kind: step.kind,
          outcome: 'passed',
          exitCode: 0,
        });
        continue;
      }
      const reason = classifyIsolatedFailure(ran.outputSnippet, ran.spawnFailed);
      if (reason.startsWith('blocked:')) {
        console.log('BLOCK %s reason=%s', step.id, reason);
        isolatedBlocked += 1;
      } else {
        console.log('FAIL  %s reason=%s exit=%s', step.id, reason, ran.exitCode);
        isolatedFailed += 1;
      }
      results.push({
        id: step.id,
        item: step.item,
        kind: step.kind,
        outcome: reason.startsWith('blocked:') ? 'blocked' : 'failed',
        exitCode: ran.exitCode,
        reason,
      });
    }
  } else {
    for (const step of ISOLATED) {
      results.push({
        id: step.id,
        item: step.item,
        kind: step.kind,
        outcome: 'skipped',
        exitCode: null,
        reason: 'skipped:portable_only',
      });
      console.log('SKIP  %s reason=portable_only', step.id);
    }
  }

  const finishedAt = new Date();
  const summary = {
    schemaVersion: 1,
    class: 'local_untrusted_mem00_int00_prove_path_receipt',
    releaseEvidence: false,
    controlPlaneClosed: false,
    intTranscript01ProductionWrite: false,
    publicDeleteStill503Required: true,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    dockerAvailable: hasDocker,
    portableOnly: PORTABLE_ONLY,
    counts: {
      portableFailed,
      isolatedFailed,
      isolatedBlocked,
      total: results.length,
    },
    results,
    honesty: {
      note: 'Portable green does not close MEM-00 or INT-TRANSCRIPT-00. Isolated blocked/failed is not skip-as-pass. Do not flip releaseEvidence to true.',
    },
  };

  await mkdir(RECEIPT_ROOT, { recursive: true });
  const stamp = finishedAt.toISOString().replace(/[:.]/g, '-');
  const receiptName = `${stamp}-mem00-int00-prove-path.json`;
  const receiptPath = join(RECEIPT_ROOT, receiptName);
  await writeFile(receiptPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  console.log('MEM00_INT00_PROVE_PATH_SUMMARY portable_failed=%s isolated_failed=%s isolated_blocked=%s releaseEvidence=false', portableFailed, isolatedFailed, isolatedBlocked);
  console.log('MEM00_INT00_PROVE_PATH_RECEIPT file=.tmp/mem00-int00-prove-path/%s release_evidence=false', receiptName);

  // Portable failures are hard fails. Isolated blocked (no Docker) is expected on
  // this host and must not be rewritten as pass; overall exit stays non-zero so
  // operators cannot treat the path as a closed control-plane gate.
  if (portableFailed > 0 || isolatedFailed > 0 || isolatedBlocked > 0) {
    process.exitCode = 1;
    return;
  }
  process.exitCode = 0;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'mem00_int00_prove_path_failed');
  process.exitCode = 1;
});
