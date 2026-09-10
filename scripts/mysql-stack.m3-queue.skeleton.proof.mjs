#!/usr/bin/env node
/**
 * M3 queue/wakeup selection prove — static only.
 * Checks m3-queue-wakeup-selection.md exists and pins Q1–Q5 + hard constraints:
 *   仅选型文档覆盖 Q1–Q5 / 不切生产 wakeup / MySQL+Qdrant+Redis sole stack /
 *   不宣称 reconciler 已接|已切 / releaseEvidence=false / Not HA
 * Not HA. Does not start containers, cut production wakeup, wire reconciler,
 * touch .env*, or self-approve cutover.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docPath = join(root, 'ai-docs/delivery/m3-queue-wakeup-selection.md');
const scriptPath = join(root, 'scripts/mysql-stack.m3-queue.skeleton.proof.mjs');
const wakeupConstPath = join(root, 'packages/db/src/worker-job-wakeup.ts');
const wakeupListenerPath = join(root, 'apps/worker/src/job-wakeup-listener.ts');

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
  ['M3 selection doc', docPath],
  ['proof script', scriptPath],
  ['worker-job-wakeup.ts', wakeupConstPath],
  ['job-wakeup-listener.ts', wakeupListenerPath],
]) {
  if (existsSync(path)) pass(`${label} present: ${path}`);
  else fail(`${label} missing: ${path}`);
}

if (existsSync(wakeupConstPath)) {
  const wakeup = readFileSync(wakeupConstPath, 'utf8');
  if (/meetwise_worker_wakeup_v1/.test(wakeup) && /WORKER_JOB_WAKEUP_CHANNEL/.test(wakeup)) {
    pass('worker-job-wakeup.ts still pins meetwise_worker_wakeup_v1');
  } else {
    fail('worker-job-wakeup.ts must keep meetwise_worker_wakeup_v1 channel constant');
  }
}

if (existsSync(wakeupListenerPath)) {
  const listener = readFileSync(wakeupListenerPath, 'utf8');
  if (/LISTEN/.test(listener) && /WORKER_JOB_WAKEUP_CHANNEL/.test(listener)) {
    pass('job-wakeup-listener.ts still LISTENs on WORKER_JOB_WAKEUP_CHANNEL (production wakeup not cut)');
  } else {
    fail('job-wakeup-listener.ts must still LISTEN on WORKER_JOB_WAKEUP_CHANNEL (do not cut production wakeup)');
  }
}

if (existsSync(docPath)) {
  const doc = readFileSync(docPath, 'utf8');

  if (/仅选型文档覆盖\s*Q1\s*[–-]\s*Q5|仅选型文档覆盖 Q1–Q5/.test(doc)) {
    pass('doc scope: 仅选型文档覆盖 Q1–Q5');
  } else {
    fail('doc must pin 仅选型文档覆盖 Q1–Q5');
  }

  for (const q of ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']) {
    if (new RegExp(`\\b${q}\\b`).test(doc)) pass(`doc covers ${q}`);
    else fail(`doc missing ${q}`);
  }

  if (/不切生产 wakeup/.test(doc)) {
    pass('doc pins 不切生产 wakeup');
  } else {
    fail('doc must pin 不切生产 wakeup');
  }

  if (/MySQL\s*\+\s*Qdrant\s*\+\s*Redis|MySQL\+Qdrant\+Redis/.test(doc)
    && /sole stack|唯一真相|sole-stack/.test(doc)) {
    pass('doc pins MySQL+Qdrant+Redis sole stack');
  } else {
    fail('doc must pin MySQL+Qdrant+Redis sole stack');
  }
  if (/cutover blocked until proves|禁止自批 cutover|未绿禁止切流/.test(doc)) {
    pass('doc pins cutover blocked until proves / no self-approve');
  } else {
    fail('doc must pin cutover blocked until proves');
  }
  if (/PG wakeup remains source of truth/i.test(doc)) {
    fail('doc still pins PG wakeup remains source of truth (purged memoir)');
  } else {
    pass('doc purged PG-wakeup-as-product-truth memoir');
  }
  if (/dual-run|双跑/.test(doc) && /compose\.dev/.test(doc) && !/legacy|待删/.test(doc)) {
    fail('doc presents compose.dev dual-run without legacy framing');
  } else {
    pass('doc does not present dual-run as primary path');
  }

  if (/meetwise_worker_wakeup_v1/.test(doc)) {
    pass('doc cites meetwise_worker_wakeup_v1');
  } else {
    fail('doc must cite meetwise_worker_wakeup_v1');
  }

  if (/LISTEN\s*\/\s*NOTIFY|LISTEN\/NOTIFY/.test(doc)) {
    pass('doc cites LISTEN/NOTIFY');
  } else {
    fail('doc must cite LISTEN/NOTIFY');
  }

  // Q1 options
  if (/Redis Streams/i.test(doc) && /PubSub/i.test(doc) && /轮询/.test(doc)) {
    pass('doc Q1 options: Redis Streams / PubSub / 轮询');
  } else {
    fail('doc must select among Redis Streams / PubSub / 轮询 for Q1');
  }

  // Q2
  if (/FOR UPDATE SKIP LOCKED|SKIP LOCKED/.test(doc)) {
    pass('doc Q2 cites SKIP LOCKED / claim');
  } else {
    fail('doc must cover FOR UPDATE SKIP LOCKED claim (Q2)');
  }

  // Q3
  if (/pg_advisory|SET NX PX|Redis.*租约|advisory/.test(doc)) {
    pass('doc Q3 covers advisory / Redis lease');
  } else {
    fail('doc must cover pg_advisory / Redis lease (Q3)');
  }

  // Q4 — must forbid claiming reconciler cutover; must NOT assert already cut
  if (/不宣称 reconciler 已接/.test(doc) && /不宣称 reconciler 已切/.test(doc)) {
    pass('doc pins 不宣称 reconciler 已接 / 已切');
  } else {
    fail('doc must pin 不宣称 reconciler 已接 and 不宣称 reconciler 已切');
  }

  if (/MODEL-OP reconciler|model-invocation-reconcile/.test(doc)) {
    pass('doc Q4 cites MODEL-OP reconciler / model-invocation-reconcile');
  } else {
    fail('doc must cite MODEL-OP reconciler path (Q4)');
  }

  // Reject bare achievement claims for reconciler cutover
  if (/(已接|已切)[^\n]{0,40}reconciler|reconciler[^\n]{0,40}(已接|已切)/i.test(doc)
    && !/(不宣称|禁止|不得)[^\n]{0,40}reconciler[^\n]{0,20}(已接|已切)|(不宣称|禁止|不得)[^\n]{0,20}(已接|已切)/.test(doc)) {
    fail('doc appears to claim reconciler already cut/connected without forbid language');
  } else {
    pass('doc does not claim reconciler already connected/cut');
  }

  // Q5 evidence pins
  if (/worker-wakeup:prove/.test(doc)) {
    pass('doc Q5 cites worker-wakeup:prove');
  } else {
    fail('doc must cite worker-wakeup:prove (Q5)');
  }

  if (/model-invocation-reconcile:prove/.test(doc)) {
    pass('doc Q5 cites model-invocation-reconcile:prove');
  } else {
    fail('doc must cite model-invocation-reconcile:prove (Q5)');
  }

  if (/≠\s*队列已迁|连通绿[^\n]{0,40}≠[^\n]{0,40}队列/.test(doc)
    && /≠\s*MODEL-OP reconciler 已切|≠[^\n]{0,20}reconciler 已切/.test(doc)) {
    pass('doc pins connectivity green ≠ queue migrated ≠ reconciler cut');
  } else {
    fail('doc must pin connectivity green ≠ 队列已迁 ≠ reconciler 已切');
  }

  if (/releaseEvidence\s*=\s*false/i.test(doc)) {
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

  if (/job-wakeup-listener/.test(doc) && /worker-job-wakeup\.ts/.test(doc)) {
    pass('doc cites job-wakeup-listener + worker-job-wakeup.ts');
  } else {
    fail('doc must cite job-wakeup-listener and worker-job-wakeup.ts');
  }
}


// Q4 co-equal evidence gates (mw-model-op conditional)
const doc = existsSync(docPath) ? readFileSync(docPath, 'utf8') : '';
if (/本绿\s*≠\s*已迁|本绿 ≠ 已迁|≠ cutover/i.test(doc)) {
  pass('doc pins 本绿 ≠ 已迁 / ≠ cutover');
} else {
  fail('doc must pin 本绿 ≠ 已迁 / ≠ cutover');
}
if (/usageCalibrationReconciler/.test(doc) && /model-invocation-reconcile:prove/.test(doc) && /model-op00-usage-reconciler:prove/.test(doc) && /同列/.test(doc)) {
  pass('doc lists usageCalibrationReconciler co-equal with model-invocation-reconcile under Q4');
} else {
  fail('doc must co-list usageCalibrationReconciler + model-invocation-reconcile:prove as Q4 gates');
}

for (const line of lines) console.log(line);

const finalCmd = `node ${scriptPath}`;
console.log(`CMD=${finalCmd} EXIT=${exitCode}`);
process.exit(exitCode);
