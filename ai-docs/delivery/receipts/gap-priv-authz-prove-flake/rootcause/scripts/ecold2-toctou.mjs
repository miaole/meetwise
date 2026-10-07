// E-COLD-2 — check-then-use (TOCTOU) container-exit injection.
// Pre-registered (harness §3.1): replicate the cold-start sequence externally
// (boot -> ready(3-consecutive) -> migrate -> post-migrate re-attest ->
// pre-probe(Running check + 3-consecutive)) with the runner's own commands and
// env, then inject container exit between the pre-probe and the prove spawn.
//   H-COLD-2: exit in the TOCTOU gap -> prove-side `connect ECONNREFUSED
//   127.0.0.1:<port>`; exit timing explains the state_bytes bands (29 vs 226).
//   Judgment: injected run stderr matches cold-5.log L18/L24 verbatim shape
//   (`Error: connect ECONNREFUSED 127.0.0.1:<port>` + `code: 'ECONNREFUSED'`)
//   and WITHHELD byte bands are comparable; none-injected controls EXIT=0.
//   Counter-case: injected shape != ECONNREFUSED -> H-COLD-2 cannot fully
//   explain the historical cold failures; differences booked.
// Attempts: stop x1, kill x1, none x3 (control), stop-band x1 (keep container
// without --rm purely to capture the exited State JSON byte band).
import { bootContainer, cleanupContainer, waitForPostgres, migrate, dockerRunning, withheldDiagnostics, runProveRawTeed, baseEnvFor, newContainerName, newToken, writeJson, log, capture } from './lib.mjs';
import { readFileSync } from 'node:fs';

const OUT = '/Users/miaole/Desktop/golucky/meetwise-line-flk/.tmp/flk-exec';
const ATTEMPTS = [
  { id: 'stop-1', inject: 'stop', keep: false },
  { id: 'kill-1', inject: 'kill', keep: false },
  { id: 'none-1', inject: 'none', keep: false },
  { id: 'none-2', inject: 'none', keep: false },
  { id: 'none-3', inject: 'none', keep: false },
  { id: 'stop-band-1', inject: 'stop', keep: true },
];
const results = [];

for (const at of ATTEMPTS) {
  const name = newContainerName(`cold2-${at.id}`);
  const token = newToken();
  const attemptLog = `${OUT}/ecold2-${at.id}.log`;
  log(`${OUT}/ecold2.log`, `ATTEMPT start id=${at.id} inject=${at.inject} keep=${at.keep} container=${name}`);
  const rec = { id: at.id, inject: at.inject, keep: at.keep, container: name };
  try {
    const boot = await bootContainer(name, token, { keep: at.keep });
    rec.port = boot.port;
    await waitForPostgres(name, boot.port, { label: 'boot', logFile: attemptLog });
    const env = baseEnvFor(name, token, boot.port);
    await migrate(env, attemptLog);
    await waitForPostgres(name, boot.port, { label: 'post-migrate', logFile: attemptLog });
    if (!(await dockerRunning(name))) throw new Error('isolated_postgres_container_not_running_before_prove:false');
    await waitForPostgres(name, boot.port, { label: 'pre-prove', logFile: attemptLog });
    rec.preProbePassed = true;
    if (at.inject === 'stop') await capture('docker', ['stop', name], { timeoutMs: 30_000 });
    if (at.inject === 'kill') await capture('docker', ['kill', name], { timeoutMs: 30_000 });
    const prove = await runProveRawTeed(env, attemptLog);
    rec.exit = prove.exit;
    const text = readFileSync(attemptLog, 'utf8');
    rec.econnrefusedLine = text.match(/Error: connect ECONNREFUSED 127\.0\.0\.1:\d+/)?.[0] ?? null;
    rec.econnrefusedCodeLine = text.includes("code: 'ECONNREFUSED'") ?? false;
    rec.processExitLine = text.match(/PROCESS_EXIT=\d+/)?.[0] ?? null;
    rec.elifecycle = text.includes('ELIFECYCLE');
    rec.withheld = await withheldDiagnostics(name);
    log(`${OUT}/ecold2.log`, `ATTEMPT done id=${at.id} exit=${prove.exit} refusedLine=${JSON.stringify(rec.econnrefusedLine)} withheld=${JSON.stringify(rec.withheld)}`);
  } catch (err) {
    rec.error = String(err.message ?? err).slice(0, 300);
    rec.withheld = await withheldDiagnostics(name).catch(() => null);
    log(`${OUT}/ecold2.log`, `ATTEMPT error id=${at.id} ${rec.error}`);
  }
  if (!at.keep) await cleanupContainer(name);
  results.push(rec);
}
writeJson(`${OUT}/ecold2-summary.json`, { experiment: 'ecold2-toctou', attempts: results });
console.log(`DONE ecold2 ${results.map((r) => `${r.id}:exit=${r.exit ?? 'ERR'}`).join(' ')}`);
