#!/usr/bin/env node
/**
 * M2 tenant-authorization skeleton prove — static only.
 * Checks m2-tenant-authorization-model.md exists and pins hard constraints:
 *   不得静默降级 / ≠ RLS / prove list / MUST NOT abandon RLS / sole stack / cutover blocked /
 *   releaseEvidence=false
 * Not HA. Does not start containers, touch .env*, weaken RLS, or self-approve cutover.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docPath = join(root, 'ai-docs/delivery/m2-tenant-authorization-model.md');
const scriptPath = join(root, 'scripts/mysql-stack.m2-tenant.skeleton.proof.mjs');
const principalPath = join(root, 'packages/db/src/principal.ts');

let exitCode = 0;
const lines = [];

function fail(msg) {
  lines.push(`FAIL  ${msg}`);
  exitCode = 1;
}

function pass(msg) {
  lines.push(`PASS  ${msg}`);
}

for (const [label, path] of [
  ['M2 doc', docPath],
  ['proof script', scriptPath],
  ['principal.ts', principalPath],
]) {
  if (existsSync(path)) pass(`${label} present: ${path}`);
  else fail(`${label} missing: ${path}`);
}

if (existsSync(principalPath)) {
  const principal = readFileSync(principalPath, 'utf8');
  if (/export async function asPrincipal/.test(principal)
    && /set_config\('app\.principal_user'/.test(principal)) {
    pass('principal.ts still exports asPrincipal + set_config app.principal_user');
  } else {
    fail('principal.ts must keep asPrincipal + set_config app.principal_user (RLS path intact)');
  }
}

if (existsSync(docPath)) {
  const doc = readFileSync(docPath, 'utf8');

  if (/releaseEvidence\s*=\s*false/i.test(doc)) {
    // Allow forbid language ("不得/不宣称 … releaseEvidence=true"); reject bare achievement claims.
    if (/(不宣称|不得|禁止)[^\n]{0,80}releaseEvidence\s*=\s*true|releaseEvidence\s*=\s*true[^\n]{0,80}(不宣称|不得|禁止)/.test(doc)
      || !/releaseEvidence\s*=\s*true/i.test(doc)) {
      pass('doc releaseEvidence=false (no true claim)');
    } else {
      fail('doc claims releaseEvidence=true without forbid language');
    }
  } else {
    fail('doc must pin releaseEvidence=false');
  }

  if (/Not HA|非 HA|不宣称.*HA/i.test(doc)) {
    pass('doc forbids / does not claim HA');
  } else {
    fail('doc must forbid HA claims');
  }

  if (/应用层 tenant\s*≠\s*RLS|tenant\s*≠\s*RLS/.test(doc)) {
    pass('doc pins 应用层 tenant ≠ RLS');
  } else {
    fail('doc must pin 应用层 tenant ≠ RLS');
  }

  if (/授权根不得静默降级|不得静默降级/.test(doc)) {
    pass('doc pins 不得静默降级');
  } else {
    fail('doc must pin 授权根不得静默降级');
  }

  if (/MUST NOT abandon RLS|不得放弃 RLS|abandon RLS/i.test(doc)
    && /until privacy proves|privacy proves are green|未绿|until proves/i.test(doc)) {
    pass('doc pins MUST NOT abandon RLS until privacy proves green');
  } else {
    fail('doc must pin MUST NOT abandon RLS until privacy proves green');
  }
  if (/MySQL\s*\+\s*Qdrant\s*\+\s*Redis|MySQL\+Qdrant\+Redis/.test(doc)
    && /sole stack|唯一真相|sole-stack/.test(doc)) {
    pass('doc pins MySQL+Qdrant+Redis sole stack');
  } else {
    fail('doc must pin MySQL+Qdrant+Redis sole stack');
  }
  if (/cutover blocked until proves|未绿禁止 cutover|未绿禁止切流|禁止自批 cutover/.test(doc)) {
    pass('doc pins cutover blocked until proves');
  } else {
    fail('doc must pin cutover blocked until proves');
  }

  if (/asPrincipal/.test(doc) && /set_config/.test(doc) && /app\.principal_user/.test(doc)
    && /packages\/db\/src\/principal\.ts/.test(doc)) {
    pass('doc cites asPrincipal / set_config app.principal_user / principal.ts');
  } else {
    fail('doc must cite asPrincipal + set_config app.principal_user + principal.ts');
  }

  if (/FORCE ROW LEVEL SECURITY|RLS FORCE/.test(doc)) {
    pass('doc mentions RLS FORCE');
  } else {
    fail('doc must mention RLS FORCE');
  }

  if (/privacy_issuer|issuer/.test(doc) && /privacy_target_id|privacy_lease|privacy GUC/i.test(doc)) {
    pass('doc covers privacy issuer / privacy GUC');
  } else {
    fail('doc must cover privacy issuer and privacy GUC');
  }

  // Inventory counts (cite, don't invent) — allow ~49 or 51 / 348 / 429
  if (/348/.test(doc) && /429/.test(doc) && /(~?\s*49|51)/.test(doc)) {
    pass('doc cites inventory counts (~49/51 RLS migrations, 348 POLICY, 429 DEFINER)');
  } else {
    fail('doc must cite inventory counts (RLS migrations + 348 POLICY + 429 DEFINER)');
  }

  const provePins = [
    ['privacy-authorization:prove', /privacy-authorization:prove/],
    ['crypto (privacy-authorization:crypto:prove)', /privacy-authorization:crypto:prove|\bcrypto\b/],
    ['erasure-preview', /privacy-erasure-preview:prove|erasure-preview/],
    ['DELETE=503', /DELETE\s*=\s*503|DELETE=503/],
    ['memory-vector-chunk-erasure', /memory-vector-chunk-erasure/],
  ];
  for (const [name, re] of provePins) {
    if (re.test(doc)) pass(`doc prove gate pin: ${name}`);
    else fail(`doc missing prove gate pin: ${name}`);
  }

  if (/显式强制|非.*optional filter|非默认可选|不是.*可选 filter/i.test(doc)) {
    pass('doc requires explicit MySQL-era forces (not optional filters)');
  } else {
    fail('doc must require explicit (non-optional) MySQL-era equivalent forces');
  }

  if (/PG RLS remains source of truth|dual-run 窗口内 PG RLS|本 M2 dual-run/i.test(doc)) {
    fail('doc still presents dual-run / PG RLS as product truth memoir');
  } else {
    pass('doc purged dual-run / PG-RLS-as-product-truth memoir');
  }
  if (/compose\.dev\.yml/.test(doc)) {
    if (/legacy|待删/.test(doc) && !/双跑主路径|dual-run as primary|可并行.*仅开发证明，非 HA/.test(doc)) {
      pass('doc mentions compose.dev only as legacy artifact');
    } else if (/legacy|待删/.test(doc)) {
      pass('doc mentions compose.dev as legacy artifact');
    } else {
      fail('doc mentions compose.dev.yml without legacy/待删 framing');
    }
  } else {
    pass('doc does not promote compose.dev dual-run');
  }

  if (/(不自批|禁止自批|Do not self-approve|不自批切流)/i.test(doc)) {
    pass('doc forbids self-approve cutover');
  } else {
    fail('doc must forbid self-approve cutover');
  }

  if (/(不宣称|不得|禁止)[^\n]{0,80}controlPlaneClosed|controlPlaneClosed[^\n]{0,80}(不宣称|不得|禁止)/.test(doc)
    || !/controlPlaneClosed\s*=\s*true/.test(doc)) {
    pass('doc does not claim controlPlaneClosed=true');
  } else {
    fail('doc must not claim controlPlaneClosed=true');
  }

  if (/MUST NOT abandon RLS|不得放弃 RLS|abandon RLS as truth/i.test(doc)) {
    pass('doc hard constraint: must not abandon RLS as truth until proves green');
  } else {
    fail('doc must state must not abandon RLS as truth until privacy proves green');
  }
}

for (const line of lines) console.log(line);

const finalCmd = `node ${scriptPath}`;
console.log(`CMD=${finalCmd} EXIT=${exitCode}`);
process.exit(exitCode);
