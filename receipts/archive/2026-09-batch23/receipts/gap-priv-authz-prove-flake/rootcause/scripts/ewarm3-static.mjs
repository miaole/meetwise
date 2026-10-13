// E-WARM-3 — current-tree boundary verification (zero execution, static only).
// Pre-registered (harness §3.2): book the static facts —
//   (a) fixture face: bare INSERT, no ON CONFLICT, no post-run cleanup,
//       fixed ids ...a1/...a2 at privacy-authorization.proof.ts:125-126;
//   (b) warm_v2 used NEW containers (not a reused-DB path) => v2 20/20 has
//       zero coverage power over the 23505 class (review 49ef158 §5);
//   (c) attempt-1 JSON/log disagreement semantics retained (blobs + FAIL 3811cf1);
//   (d) historical green runs never re-covered the warm class.
// Zero execution: no docker, no prove, no SQL.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = '/Users/miaole/Desktop/golucky/meetwise-line-flk';
const OUT = `${ROOT}/.tmp/flk-exec`;
const sh = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8' });
const proof = readFileSync(`${ROOT}/packages/db/test/privacy-authorization.proof.ts`, 'utf8');
const proofLines = proof.split('\n');

const facts = {
  experiment: 'ewarm3-static',
  a_fixtureFace: {
    insertInterviewVerbatim: proofLines.slice(56, 62).join('\n'),
    insertAtLine: proofLines.findIndex((l) => l.includes('async function insertInterview')) + 1,
    onConflictCount: (proof.match(/ON CONFLICT/g) ?? []).length,
    deleteFromInterviewCount: (proof.match(/DELETE FROM interview/g) ?? []).length,
    truncateCount: (proof.match(/TRUNCATE/g) ?? []).length,
    fixedIdA: { line: proofLines.findIndex((l) => l.includes("'00000000-0000-4000-8000-0000000000a1'")) + 1, value: '00000000-0000-4000-8000-0000000000a1' },
    fixedIdOther: { line: proofLines.findIndex((l) => l.includes("'00000000-0000-4000-8000-0000000000a2'")) + 1, value: '00000000-0000-4000-8000-0000000000a2' },
    insertCalls: (proof.match(/await insertInterview\(/g) ?? []).length,
  },
  b_warmV2NotReusedDb: {
    source: 'receipts/uc052-pool-role-leak/privacy-authorization-flake-ledger.jsonl warm_v2 rows + review 49ef158 §5 (quoted in backlog :68)',
    backlogVerbatim: sh('git', ['show', 'HEAD:ai-docs/delivery/gap-bug-backlog.md']).split('\n')[67].slice(0, 200) + '…',
  },
  c_attempt1Disagreement: {
    oneshotAttempt1JsonBlob: sh('git', ['hash-object', 'ai-docs/delivery/receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.json']).trim(),
    expectedJsonBlob: '8cc9db56079a60fc6410472632dbf4899952c9c2',
    oneshotAttempt1LogBlob: sh('git', ['hash-object', 'ai-docs/delivery/receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.log']).trim(),
    expectedLogBlob: 'e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77',
    failCommitPresent: (() => { try { sh('git', ['cat-file', '-e', '3811cf1b47d3c3a939c2077b9c7386ab036069e6']); return true; } catch { return false; } })(),
  },
  d_anchorCheck: {
    cold5Blob: sh('git', ['hash-object', 'ai-docs/delivery/receipts/uc052-pool-role-leak/logs/cold-5.log']).trim(),
    warm2Blob: sh('git', ['hash-object', 'ai-docs/delivery/receipts/uc052-pool-role-leak/logs/warm-2.log']).trim(),
    historicalBlob: sh('git', ['hash-object', 'ai-docs/delivery/receipts/uc052-pool-role-leak/logs/historical-first-failure-ECONNREFUSED-69de818.log']).trim(),
    jsonlBlob: sh('git', ['hash-object', 'ai-docs/delivery/receipts/uc052-pool-role-leak/privacy-authorization-flake-ledger.jsonl']).trim(),
    expected: {
      cold5: 'd066fcd8e8a6805e903b706196c3ead5d7cd9feb',
      warm2: '4ce66da1ac4dbaea808580fcaa94784ef689a095',
      historical: 'db8ade3ba4fecc01a7cb7d019b8424174628d631',
      jsonl: '272f0314e0eff8a9192c658a6a72584ae70146f4',
    },
  },
};
facts.zeroDrift =
  facts.c_attempt1Disagreement.oneshotAttempt1JsonBlob === facts.c_attempt1Disagreement.expectedJsonBlob &&
  facts.c_attempt1Disagreement.oneshotAttempt1LogBlob === facts.c_attempt1Disagreement.expectedLogBlob &&
  facts.d_anchorCheck.cold5Blob === facts.d_anchorCheck.expected.cold5 &&
  facts.d_anchorCheck.warm2Blob === facts.d_anchorCheck.expected.warm2 &&
  facts.d_anchorCheck.historicalBlob === facts.d_anchorCheck.expected.historical &&
  facts.d_anchorCheck.jsonlBlob === facts.d_anchorCheck.expected.jsonl;
writeFileSync(`${OUT}/ewarm3-static-summary.json`, `${JSON.stringify(facts, null, 2)}\n`);
console.log(`DONE ewarm3 zeroDrift=${facts.zeroDrift} onConflict=${facts.a_fixtureFace.onConflictCount} cleanupDeletes=${facts.a_fixtureFace.deleteFromInterviewCount}`);
