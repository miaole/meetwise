#!/usr/bin/env node
/**
 * Static prove: UC-E2E-001 / UC-E2E-002 harness+eval exist and pin
 * Key / fixture=pgvector green-risk / blocked honesty / gap honesty.
 * Does NOT run live e2e:isolated. releaseEvidence=false · Not HA · ≠ covered
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const matrixPath = join(root, 'ai-docs/delivery/e2e-requirement-coverage-matrix.md');

const units = [
  {
    id: 'uc-e2e-001-golden-path',
    harness: 'ai-docs/delivery/harness/uc-e2e-001-golden-path.eval.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-001-golden-path.eval.md',
    rowIds: ['UC-E2E-001'],
    mustPins: [
      [/pnpm e2e:isolated/, 'lists pnpm e2e:isolated'],
      [/pnpm e2e:ui:isolated/, 'lists pnpm e2e:ui:isolated'],
      [/MODEL_API_KEY/, 'pins MODEL_API_KEY'],
      [/fixture\s*=\s*pgvector|E2E_PG_IMAGE.*pgvector|pgvector/i, 'pins fixture=pgvector'],
      [/green-risk|R5|BUG-FAKE-R5|BUG-E2E-ISO/i, 'pins green-risk / R5'],
      [/blocked/i, 'pins blocked honesty'],
      [/blocked\s*\(\s*无\s*Key\s*\)|blocked\(无 Key\)/i, 'pins blocked(无 Key)'],
      [/抬到\s*covered|抬 covered/i, 'pins 抬 covered path'],
      [/uc001:live-blocked:prove/i, 'cites uc001:live-blocked:prove'],
      [/本绿\s*≠\s*sole-stack|≠\s*sole-stack migrated|sole-stack migrated/i, 'pins 本绿≠sole-stack migrated'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/≠\s*covered|不得.*covered|禁止.*covered|非.*covered/i, '≠ covered honesty'],
    ],
    forbidCoveredClaim: true,
    matrixStatusRe: [/UC-E2E-001[^\n]*\*\*partial\*\*/i, 'matrix: UC-E2E-001 remains partial'],
    matrixForbidCovered: [/UC-E2E-001[^\n]*\*\*covered\*\*/i, 'matrix: UC-E2E-001 must not be false covered'],
  },
  {
    id: 'uc-e2e-002-cross-device',
    harness: 'ai-docs/delivery/harness/uc-e2e-002-cross-device.eval.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-002-cross-device.eval.md',
    rowIds: ['UC-E2E-002'],
    mustPins: [
      [/uc002:lease:prove|uc-e2e-002-cross-device-lease\.proof/i, 'cites uc002:lease:prove / db lease proof'],
      [/uc002:http:prove|uc-e2e-002-cross-device-http\.proof/i, 'cites uc002:http:prove / HTTP dual-session proof'],
      [/uc010:sse-resume:prove|UC-E2E-010/i, 'cites uc010 SSE prove as 旁证'],
      [/旁证|≠\s*002|≠\s*UC-E2E-002/i, 'pins uc010 旁证 ≠ 002 covered'],
      [/抬到\s*covered|抬 covered|§1b/i, 'pins 抬 covered / §1b'],
      [/HTTP lease|lease mouth|会话在别处活跃|GAP-UC002-HTTP-LEASE/i, 'pins HTTP lease mouth remaining'],
      [/Last-Event-ID|last-event-id|LED/i, 'pins Last-Event-ID / LED'],
      [/NON-UI|非 UI|非UI/i, 'pins NON-UI priority'],
      [/stream-window|sse\.ts|helpers\/sse/i, 'cites sse helpers / stream-window'],
      [/lease|L1|CAS/i, 'pins lease CAS'],
      [/Playwright|降次|browser\.newContext/i, 'pins Playwright demoted'],
      [/partial/i, 'pins partial honesty'],
      [/blocked/i, 'pins blocked honesty'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/≠\s*covered|不得.*covered|禁止.*covered|partial\s*≠\s*covered/i, '≠ covered honesty'],
    ],
    forbidCoveredClaim: true,
    matrixStatusRe: [/UC-E2E-002[^\n]*\*\*partial\*\*/i, 'matrix: UC-E2E-002 remains partial'],
    matrixForbidCovered: [/UC-E2E-002[^\n]*\*\*covered\*\*/i, 'matrix: UC-E2E-002 must not be false covered'],
  },
];

let exitCode = 0;
const lines = [];
function fail(msg) {
  lines.push(`FAIL  ${msg}`);
  exitCode = 1;
}
function pass(msg) {
  lines.push(`PASS  ${msg}`);
}

if (!existsSync(matrixPath)) fail(`matrix missing: ${matrixPath}`);
else pass(`matrix present: ${matrixPath}`);

const matrix = existsSync(matrixPath) ? readFileSync(matrixPath, 'utf8') : '';

for (const u of units) {
  const hPath = join(root, u.harness);
  const ePath = join(root, u.evalDoc);
  if (!existsSync(hPath)) fail(`${u.id}: harness missing ${u.harness}`);
  else pass(`${u.id}: harness present`);
  if (!existsSync(ePath)) fail(`${u.id}: eval missing ${u.evalDoc}`);
  else pass(`${u.id}: eval present`);

  const h = existsSync(hPath) ? readFileSync(hPath, 'utf8') : '';
  const e = existsSync(ePath) ? readFileSync(ePath, 'utf8') : '';
  const both = `${h}\n${e}`;

  for (const row of u.rowIds) {
    if (both.includes(row)) pass(`${u.id}: cites matrix row ${row}`);
    else fail(`${u.id}: must cite matrix row ${row}`);
  }

  const harnessFile = u.harness.split('/').pop();
  if (
    matrix.includes(u.harness) ||
    matrix.includes(`harness/${harnessFile}`) ||
    matrix.includes(harnessFile)
  ) {
    pass(`${u.id}: matrix references harness filename`);
  } else {
    fail(`${u.id}: matrix must reference harness path/filename`);
  }

  for (const [re, label] of u.mustPins) {
    if (re.test(both)) pass(`${u.id}: ${label}`);
    else fail(`${u.id}: missing pin — ${label}`);
  }

  if (u.forbidCoveredClaim) {
    // Allow "≠ covered" / "不得…covered" / "非 covered" but not status=covered claims
    const falseCovered =
      /覆盖状态[^\n]*\*\*covered\*\*|状态\s*=\s*covered|升格为\s*`?covered`?/i.test(both) &&
      !/禁止.*covered|不得.*covered|≠\s*covered|非.*covered|假 covered/i.test(both);
    // Stronger: claim that UC is covered
    if (/UC-E2E-00[12][^\n]{0,80}\*\*covered\*\*/i.test(both)) {
      fail(`${u.id}: must not claim UC covered`);
    } else if (/本切片[^\n]*covered|已覆盖 UC-E2E/i.test(both) && !/不得|禁止|≠|非/.test(both)) {
      fail(`${u.id}: must not claim covered`);
    } else {
      pass(`${u.id}: does not claim covered`);
    }
  }

  if (matrix) {
    const [okRe, okLabel] = u.matrixStatusRe;
    const [badRe, badLabel] = u.matrixForbidCovered;
    if (badRe.test(matrix)) fail(badLabel);
    else if (okRe.test(matrix)) pass(okLabel);
    else fail(okLabel.replace('remains', 'must remain'));
  }
}

if (matrix) {
  if (/releaseEvidence.*false/i.test(matrix)) pass('matrix: releaseEvidence=false');
  else fail('matrix: must keep releaseEvidence=false');
}

console.log(lines.join('\n'));
console.log(`\nCMD=pnpm eval-uc-e2e-001-002-cite:prove EXIT=${exitCode}`);
console.log(
  'NOTE: 本绿≠业务 covered；001 partial/blocked + R5 green-risk；002 partial（lease CAS + HTTP GET/LED；≠ covered；uc010=旁证≠002；HTTP lease mouth 仍缺）；未跑 e2e:isolated（无 Key）',
);
process.exit(exitCode);
