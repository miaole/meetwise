// E-WARM-1 — same-DB double-run (deterministic designed-red reproduction).
// Pre-registered (harness §3.2):
//   H-WARM-1: fixed-id fixture + bare INSERT + no cleanup => a second proof run
//   against the SAME isolated DB necessarily fails 23505 interview_pkey.
//   Method: one boot + migrate, then the raw proof target twice against the
//   same container (no teardown), each run teed with PROCESS_EXIT.
//   Judgment: run1 EXIT=0; run2 three-point verbatim match with warm-2.log
//   (duplicate key ... "interview_pkey" + code: '23505' + Key (id)=(...a1)
//   already exists.) => warm class deterministically reproduced.
//   designed-red is booked as designed-red — never as a regression, never
//   retried to green.
//
// E-WARM-2 — preseeded-row single run (variant isolation) with --preseed.
//   H-WARM-2: trigger = a row with the same id already present, independent of
//   same-process accumulation (first run triggers).
//   Method: fresh container + migrate, preseed the ...a1 interview row via
//   external data-plane psql (docker exec, read-only w.r.t. GUC/roles), then a
//   single teed proof run.
//   Judgment: first run already 23505 three-point match => trigger pinned as
//   "residual row in the DB"; combined with E-WARM-1 run1 (fresh never
//   triggers) the fresh path is the only non-triggering one.
import { bootContainer, cleanupContainer, waitForPostgres, migrate, dockerRunning, withheldDiagnostics, runProveRawTeed, baseEnvFor, newContainerName, newToken, writeJson, log, capture } from './lib.mjs';
import { readFileSync } from 'node:fs';

const OUT = '/Users/miaole/Desktop/golucky/meetwise-line-flk/.tmp/flk-exec';
const PRESEED = process.argv.includes('--preseed');
const LABEL = PRESEED ? 'ewarm2-preseed' : 'ewarm1-doublerun';
const RUNS = PRESEED ? 1 : 2;

const name = newContainerName(LABEL);
const token = newToken();
const results = { experiment: LABEL, container: name, runs: [] };
log(`${OUT}/${LABEL}.log`, `EXPERIMENT start container=${name} runs=${RUNS} preseed=${PRESEED}`);
try {
  const boot = await bootContainer(name, token);
  results.port = boot.port;
  await waitForPostgres(name, boot.port, { label: 'boot', logFile: `${OUT}/${LABEL}.log` });
  const env = baseEnvFor(name, token, boot.port);
  await migrate(env, `${OUT}/${LABEL}.log`);
  await waitForPostgres(name, boot.port, { label: 'post-migrate', logFile: `${OUT}/${LABEL}.log` });
  if (!(await dockerRunning(name))) throw new Error('container_not_running_before_prove');
  await waitForPostgres(name, boot.port, { label: 'pre-prove', logFile: `${OUT}/${LABEL}.log` });
  if (PRESEED) {
    // External data-plane preseed, verbatim fixture SQL shape
    // (privacy-authorization.proof.ts:57-62), id ...a1, no GUC/role changes.
    await capture('docker', ['exec', name, 'psql', '-v', 'ON_ERROR_STOP=1', '-U', 'meetwise', '-d', 'meetwise', '-c',
      "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ('00000000-0000-4000-8000-0000000000a1','flk-preseed-owner','active',0,0,'[]'::jsonb)"], { timeoutMs: 10_000 });
    log(`${OUT}/${LABEL}.log`, 'PRESEED inserted id=00000000-0000-4000-8000-0000000000a1 (external psql, admin plane — same plane as fixture admin.query)');
  }
  for (let r = 1; r <= RUNS; r++) {
    const attemptLog = `${OUT}/${LABEL}-run${r}.log`;
    const prove = await runProveRawTeed(env, attemptLog);
    const text = readFileSync(attemptLog, 'utf8');
    const rec = {
      run: r, exit: prove.exit,
      processExitLine: text.match(/PROCESS_EXIT=\d+/)?.[0] ?? null,
      threePoint: {
        duplicateKeyLine: text.includes('duplicate key value violates unique constraint "interview_pkey"'),
        code23505Line: text.includes("code: '23505'"),
        keyValueLine: text.includes('Key (id)=(00000000-0000-4000-8000-0000000000a1) already exists.'),
      },
      passCount: (text.match(/^PASS /gm) ?? []).length,
      failCount: (text.match(/^FAIL /gm) ?? []).length,
    };
    if (prove.exit !== 0) rec.withheld = await withheldDiagnostics(name);
    results.runs.push(rec);
    log(`${OUT}/${LABEL}.log`, `RUN done run=${r} exit=${prove.exit} threePoint=${JSON.stringify(rec.threePoint)} pass=${rec.passCount} fail=${rec.failCount}`);
  }
} catch (err) {
  results.error = String(err.message ?? err).slice(0, 300);
  log(`${OUT}/${LABEL}.log`, `EXPERIMENT error ${results.error}`);
}
await cleanupContainer(name);
writeJson(`${OUT}/${LABEL}-summary.json`, results);
console.log(`DONE ${LABEL} ${results.runs.map((r) => `run${r.run}:exit=${r.exit}`).join(' ')}`);
