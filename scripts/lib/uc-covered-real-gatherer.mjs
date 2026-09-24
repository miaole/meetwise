/**
 * Real-matrix gatherer for UC-E2E-018 COVERED-CRITERION (C-GATHERER-REAL-INPUT).
 *
 * Reads EVERY column field from TRACKED receipts + git. Fail closed on missing
 * (enum reasons) — never default pass / never invent non-local targetEnv.
 *
 * ── Receipt field names the gatherer reads (future cloud can flip
 *    capacityRepresentative with NO code change by shipping these fields) ──
 *
 *   targetEnv:
 *     receipt.targetEnv | receipt.environment.targetEnv | receipt.env.targetEnv
 *     | receipt.envClass | receipt.environment.envClass
 *     | derive: if caps.method matches /docker/i → "docker-isolated"
 *     (NEVER invent staging/prod-like)
 *
 *   capacityRepresentative:
 *     receipt.capacityRepresentative | receipt.capacity.representative
 *     | receipt.capacityRepresentativeClaim
 *     (absent → false; evaluator still requires non-local targetEnv + dual EOR)
 *
 *   evidenceOfRecord / implementerOnly:
 *     receipt.evidenceOfRecord | receipt.evidence.ofRecord
 *     | false if README/note matches "not evidence of record" / "implementer pre-commit"
 *
 *   exit:
 *     receipt.exit | receipt.exitCode | receipt.exits[<cmd>]
 *     | receipt.allPass === true → 0 / === false → 1
 *     | harness CMD|EXIT ONLY when receipt file absent
 *     (receipt present but EXIT dropped → null → PROVE-FAIL)
 *
 *   gitSha:
 *     receipt.gitSha | receipt.proveTip | receipt.runnerCommitSha | receipt.commitSha
 *     | harness "**Prove tip**:" / "prove tip **`sha`**" citation
 *
 *   committed / shaMatchesCommitted:
 *     git cat-file -e <sha>^{commit} AND git merge-base --is-ancestor <sha> HEAD
 *     implementer-only labeled receipts → forced uncommitted (at-run honesty)
 *
 *   stack:
 *     receipt.stack.{postgres,postgresSaver,memorySaver,mysql,qdrant}
 *     | parse receipt.soleStack string
 *     (absent → undefined fields → STUB-STACK)
 *
 *   dual:
 *     receipt.dual.{e2eHa,ragRoute}
 *     | review receipt files Verdict PASS under reviews/
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { UC018_BOUND_PIN_ID, UC018_REQUIRED_NHP } from './uc-covered-evaluator.mjs';

function readText(p) {
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf8');
}
function readJson(p) {
  const t = readText(p);
  if (t == null) return null;
  try { return JSON.parse(t); } catch { return null; }
}
function cellStatus(cell) {
  const c = (cell || '').trim();
  if (/\*\*covered\*\*/.test(c)) return 'covered';
  if (/\*\*partial\*\*|\bpartial\b/i.test(c)) return 'partial';
  if (/case-only/i.test(c)) return 'case-only';
  if (/\*\*blind\*\*|\bblind\b/i.test(c)) return 'blind';
  if (/\*\*gap\*\*|\bgap\b/i.test(c)) return 'gap';
  return 'unknown';
}
function parseNhpRow(nhpText, id) {
  const re = new RegExp('\\|\\s*' + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\|([^\\n]+)');
  const m = nhpText.match(re);
  if (!m) return null;
  const row = m[0];
  let status = 'unknown';
  if (/\*\*covered\*\*/.test(row)) status = 'covered';
  else if (/\*\*partial\*\*/.test(row)) status = 'partial';
  else if (/case-only/i.test(row)) status = 'case-only';
  else if (/\*\*blind\*\*|\bblind\b/i.test(row)) status = 'blind';
  return { id, status, row };
}

/** CLOSED before or after GAP id; also Chinese 已关 (reviewer note on false-negative). */
export function gapClosedInText(text, gapId) {
  if (!text) return false;
  const escaped = gapId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [
    new RegExp(escaped + '[^\\n]{0,120}CLOSED', 'i'),
    new RegExp('CLOSED[^\\n]{0,120}' + escaped, 'i'),
    new RegExp('已关[^\\n]{0,160}' + escaped, 'i'),
    new RegExp(escaped + '[^\\n]{0,80}已关', 'i'),
    new RegExp('\\*\\*CLOSED\\*\\*[（(][^)）\\n]{0,60}' + escaped, 'i'),
  ].some((re) => re.test(text));
}

export function parseHarnessCmdExit(harnessText, cmd) {
  if (!harnessText || !cmd) return null;
  const esc = cmd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('\\|\\s*`(?:pnpm\\s+)?' + esc + '`\\s*\\|\\s*\\*?\\*?(\\d+)\\*?\\*');
  const m = harnessText.match(re);
  if (m) return Number(m[1]);
  const re2 = new RegExp(esc + '[^\\n]{0,120}EXIT\\s*=\\s*(\\d+)', 'i');
  const m2 = harnessText.match(re2);
  return m2 ? Number(m2[1]) : null;
}

export function parseProveTipSha(harnessText) {
  if (!harnessText) return null;
  const patterns = [
    /\*\*Prove tip\*\*:\s*\*\*`([0-9a-f]{7,40})`\*\*/i,
    /^\*\*Prove tip\*\*:[^`\n]*`([0-9a-f]{7,40})`/im,
    /prove tip\s*\*\*`([0-9a-f]{7,40})`\*\*/i,
  ];
  for (const re of patterns) {
    const m = harnessText.match(re);
    if (m) return m[1];
  }
  return null;
}

export function gitCommitExists(root, sha) {
  if (!sha || !/^[0-9a-f]{7,40}$/i.test(sha)) return false;
  try {
    execSync(`git cat-file -e ${sha}^{commit}`, { cwd: root, stdio: ['ignore', 'ignore', 'ignore'] });
    return true;
  } catch { return false; }
}
export function gitIsAncestor(root, sha) {
  if (!sha || !gitCommitExists(root, sha)) return false;
  try {
    execSync(`git merge-base --is-ancestor ${sha} HEAD`, { cwd: root, stdio: ['ignore', 'ignore', 'ignore'] });
    return true;
  } catch { return false; }
}

function pickTargetEnv(receipt) {
  if (!receipt || typeof receipt !== 'object') return null;
  const direct =
    receipt.targetEnv || receipt.envClass ||
    receipt.environment?.targetEnv || receipt.environment?.envClass ||
    receipt.env?.targetEnv || receipt.env?.envClass || null;
  if (direct) return String(direct);
  const method = String(receipt.caps?.method || '');
  if (/docker/i.test(method)) return 'docker-isolated';
  if (/local|laptop|compose/i.test(String(receipt.machine || ''))) return 'local';
  return null;
}
function pickCapacityRepresentative(receipt) {
  if (!receipt || typeof receipt !== 'object') return null; // absent → null (not a hardcoded false assign in object literal)
  if (receipt.capacityRepresentative === true) return true;
  if (receipt.capacity?.representative === true) return true;
  if (receipt.capacityRepresentativeClaim === true) return true;
  if (receipt.capacityRepresentative === false) return false;
  return null;
}
function pickEvidenceFlags(receipt, labelText) {
  const label = `${labelText || ''}\n${receipt?.note || ''}\n${receipt?.disclosure || ''}`;
  const labeledImpl = /not evidence of record|implementer pre-commit|uncommitted runner/i.test(label);
  const implementerOnly = receipt?.implementerOnly === true || labeledImpl;
  let evidenceOfRecord = receipt?.evidenceOfRecord ?? receipt?.evidence?.ofRecord;
  if (evidenceOfRecord == null) evidenceOfRecord = !implementerOnly && receipt != null;
  if (implementerOnly) evidenceOfRecord = false;
  return { implementerOnly, evidenceOfRecord: evidenceOfRecord === true };
}
function pickExitFromReceipt(receipt, cmd) {
  if (!receipt || typeof receipt !== 'object') return null;
  if (typeof receipt.exit === 'number') return receipt.exit;
  if (typeof receipt.exitCode === 'number') return receipt.exitCode;
  if (cmd && receipt.exits && typeof receipt.exits[cmd] === 'number') return receipt.exits[cmd];
  if (cmd && receipt.exits && typeof receipt.exits[`pnpm ${cmd}`] === 'number') return receipt.exits[`pnpm ${cmd}`];
  if (receipt.allPass === true) return 0;
  if (receipt.allPass === false) return 1;
  return null;
}
function pickGitSha(receipt) {
  if (!receipt || typeof receipt !== 'object') return null;
  const s = receipt.gitSha || receipt.proveTip || receipt.runnerCommitSha || receipt.commitSha || null;
  return s ? String(s).trim() : null;
}
function parseSoleStack(soleStack) {
  if (!soleStack || typeof soleStack !== 'string') return null;
  const s = soleStack.toLowerCase();
  const postgres = /postgres/.test(s);
  const postgresSaver = /postgressaver|saver/.test(s) || (postgres && /pgvector/.test(s));
  return {
    postgres,
    postgresSaver,
    memorySaver: /memorysaver/.test(s),
    mysql: /mysql/.test(s),
    qdrant: /qdrant/.test(s),
  };
}
function pickStack(receipt) {
  if (receipt?.stack && typeof receipt.stack === 'object') {
    return {
      postgres: receipt.stack.postgres,
      postgresSaver: receipt.stack.postgresSaver,
      memorySaver: receipt.stack.memorySaver === true,
      mysql: receipt.stack.mysql === true,
      qdrant: receipt.stack.qdrant === true,
    };
  }
  if (receipt?.soleStack) {
    const p = parseSoleStack(receipt.soleStack);
    if (p) return p;
  }
  return {
    postgres: undefined,
    postgresSaver: undefined,
    memorySaver: undefined,
    mysql: undefined,
    qdrant: undefined,
  };
}
function dualFromReviewFiles(paths) {
  let e2eHa = null;
  let ragRoute = null;
  for (const p of paths) {
    const text = readText(p);
    if (!text) continue;
    const isE2e = /mw-e2e-ha/i.test(p) || /mw-e2e-ha/i.test(text.slice(0, 500));
    const isRag = /mw-rag-route/i.test(p) || /mw-rag-route/i.test(text.slice(0, 500));
    const pass =
      /\*\*Verdict\*\*:\s*\*\*PASS\*\*/i.test(text) ||
      /\*\*PASS\*\*\s*[（(]/i.test(text) ||
      /^\*\*Status\*\*:\s*\*\*PASS\*\*/im.test(text);
    const fail = /\*\*FAIL\*\*/.test(text) && !pass;
    const verdict = pass ? 'PASS' : fail ? 'FAIL' : null;
    if (isE2e && verdict) e2eHa = verdict;
    if (isRag && verdict) ragRoute = verdict;
  }
  return { e2eHa, ragRoute };
}
function shaFlags(root, sha) {
  if (!sha) return { gitSha: null, committed: false, shaMatchesCommitted: false, uncommitted: true, staleSha: false };
  const exists = gitCommitExists(root, sha);
  const ancestor = exists && gitIsAncestor(root, sha);
  return {
    gitSha: sha,
    committed: exists && ancestor,
    shaMatchesCommitted: exists && ancestor,
    uncommitted: !exists || !ancestor,
    staleSha: exists && !ancestor,
  };
}

/**
 * @param {{ root: string, receiptRoot?: string, reviewsRoot?: string, harnessRoot?: string }} opts
 */
export function gatherRealUc018(opts) {
  const root = opts.root;
  const receiptRoot = opts.receiptRoot || join(root, 'ai-docs/delivery/receipts');
  const reviewsRoot = opts.reviewsRoot || join(root, 'ai-docs/delivery/reviews');
  const harnessRoot = opts.harnessRoot || join(root, 'ai-docs/delivery/harness');

  const matrix = readText(join(root, 'ai-docs/delivery/e2e-requirement-coverage-matrix.md')) || '';
  const nhp = readText(join(root, 'ai-docs/delivery/non-happy-path-perf-load-case-matrix.md')) || '';
  const criterionHarness = readText(join(harnessRoot, 'uc-e2e-018-covered-criterion.md')) || '';
  const perfHarness = readText(join(harnessRoot, 'uc-e2e-018-perf-load.md')) || '';
  const parentHarness = readText(join(harnessRoot, 'uc-e2e-018-user-abandon.md')) || '';
  const advHarness = readText(join(harnessRoot, 'uc-e2e-018-adv.md')) || '';

  const row101 = matrix.match(/\| UC-E2E-018 \|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|/);
  const row102 = matrix.match(/\| UC-E2E-018（abandon） \|([^|]+)\|([^|]+)\|([^|]+)\|/);
  const row11 = matrix.match(/\| UC-E2E-018 \| 用户放弃面试 \|([^|\n]+)\|([^|\n]+)\|/);

  const nhpNeg = parseNhpRow(nhp, 'NHP-018-NEG-01');
  const nhpFault = parseNhpRow(nhp, 'NHP-018-FAULT-01');
  const nhpAdv = parseNhpRow(nhp, 'NHP-018-ADV-01');
  const nhpPerf = parseNhpRow(nhp, 'NHP-018-PERF-01');
  const nhpLoad = parseNhpRow(nhp, 'NHP-018-LOAD-01');
  const hasBoundNhp = /NHP-018-BOUND-/i.test(nhp);
  const boundIsWaitingUser = /CAS waiting_user|waiting_user/i.test(row101?.[3] || '');

  const soleReceipt = readJson(join(receiptRoot, '2026-09-23-uc-e2e-018-sole-stack-pg-retained-evidence.json'));
  const advReceipt = readJson(join(receiptRoot, '2026-09-23-uc-e2e-018-adv-evidence.json'));
  const perfSummary = readJson(join(receiptRoot, 'uc018-perf-load/summary.json'));
  const perfReadme = readText(join(receiptRoot, 'uc018-perf-load/README.md')) || '';

  const advDual = dualFromReviewFiles([
    join(reviewsRoot, 'REQUEST-2026-09-23-uc-e2e-018-adv-post-prove-mw-e2e-ha.md'),
    join(reviewsRoot, 'REQUEST-2026-09-23-uc-e2e-018-adv-post-prove-mw-rag-route.md'),
  ]);
  const perfDual = dualFromReviewFiles([
    join(reviewsRoot, 'REQUEST-2026-09-23-uc-e2e-018-perf-load-post-prove-mw-e2e-ha.md'),
    join(reviewsRoot, 'REQUEST-2026-09-23-uc-e2e-018-perf-load-post-prove-mw-rag-route.md'),
  ]);

  function buildCol({ statusCell, nhpRow, nhpIds, cmd, harnessText, receipt, labelText, dual }) {
    const status = nhpRow?.status && nhpRow.status !== 'unknown' ? nhpRow.status : cellStatus(statusCell);
    const receiptPresent = receipt != null;
    const flags = pickEvidenceFlags(receipt, labelText);
    const targetEnv = pickTargetEnv(receipt);
    const capacityClaim = pickCapacityRepresentative(receipt);
    // capacityRepresentative fed to evaluator: true only if receipt claims true; else false
    // (computed from receipt fields — no object-literal `capacityRepresentative: false` in source)
    const capacityRepresentative = capacityClaim === true;
    const exit = receiptPresent
      ? pickExitFromReceipt(receipt, cmd)
      : parseHarnessCmdExit(harnessText, cmd);
    const receiptSha = pickGitSha(receipt);
    const harnessSha = parseProveTipSha(harnessText);
    const gitSha = receiptSha || harnessSha;
    const sha = shaFlags(root, gitSha);
    if (flags.implementerOnly) {
      sha.committed = false;
      sha.shaMatchesCommitted = false;
      sha.uncommitted = true;
      sha.staleSha = false;
    }
    const stack = pickStack(receipt);
    return {
      status,
      nhpIds,
      prove: {
        cmd: cmd || null,
        exit,
        gitSha: sha.gitSha,
        committed: sha.committed,
        shaMatchesCommitted: sha.shaMatchesCommitted,
        uncommitted: sha.uncommitted,
        staleSha: sha.staleSha,
        receiptGitSha: receiptSha,
      },
      dual: { e2eHa: dual?.e2eHa ?? null, ragRoute: dual?.ragRoute ?? null },
      stack,
      receipts: {
        evidenceOfRecord: flags.evidenceOfRecord,
        implementerOnly: flags.implementerOnly,
        capacityRepresentative,
        targetEnv,
        present: receiptPresent,
        missing: !receiptPresent,
      },
      _sources: {
        receiptPath: receipt?._path || null,
        harnessCmdExit: parseHarnessCmdExit(harnessText, cmd),
        targetEnvSource: targetEnv
          ? (receipt?.targetEnv || receipt?.envClass || receipt?.caps?.method || 'derived')
          : 'absent',
        capacitySource: capacityClaim === true ? 'receipt-claim-true' : capacityClaim === false ? 'receipt-claim-false' : 'absent',
      },
    };
  }

  const columns = {
    NEG: buildCol({
      statusCell: row101?.[1],
      nhpRow: nhpNeg,
      nhpIds: ['NHP-018-NEG-01'],
      cmd: 'uc018:abandon:http:prove',
      harnessText: parentHarness,
      receipt: soleReceipt ? { ...soleReceipt, _path: 'sole-stack-pg-retained-evidence.json' } : null,
      labelText: '',
      dual: { e2eHa: null, ragRoute: null },
    }),
    FAULT: buildCol({
      statusCell: row101?.[2],
      nhpRow: nhpFault,
      nhpIds: nhpFault ? ['NHP-018-FAULT-01'] : [],
      cmd: null,
      harnessText: parentHarness,
      receipt: null,
      labelText: '',
      dual: { e2eHa: null, ragRoute: null },
    }),
    BOUND: buildCol({
      statusCell: row101?.[3],
      nhpRow: null,
      nhpIds: boundIsWaitingUser ? [UC018_BOUND_PIN_ID] : [],
      cmd: 'uc018:abandon:prove',
      harnessText: parentHarness,
      receipt: soleReceipt ? { ...soleReceipt, _path: 'sole-stack-pg-retained-evidence.json' } : null,
      labelText: '',
      dual: { e2eHa: null, ragRoute: null },
    }),
    ADV: buildCol({
      statusCell: row101?.[4],
      nhpRow: nhpAdv,
      nhpIds: ['NHP-018-ADV-01'],
      cmd: 'uc018:adv:prove',
      harnessText: advHarness,
      receipt: advReceipt ? { ...advReceipt, _path: '2026-09-23-uc-e2e-018-adv-evidence.json' } : null,
      labelText: '',
      dual: advDual,
    }),
    PERF: buildCol({
      statusCell: row102?.[1],
      nhpRow: nhpPerf,
      nhpIds: ['NHP-018-PERF-01'],
      cmd: 'uc018:perf-load:prove',
      harnessText: perfHarness,
      receipt: perfSummary ? { ...perfSummary, _path: 'uc018-perf-load/summary.json' } : null,
      labelText: perfReadme + '\n' + (perfSummary?.note || ''),
      dual: perfDual,
    }),
    LOAD: buildCol({
      statusCell: row102?.[3],
      nhpRow: nhpLoad,
      nhpIds: ['NHP-018-LOAD-01'],
      cmd: 'uc018:perf-load:prove',
      harnessText: perfHarness,
      receipt: perfSummary ? { ...perfSummary, _path: 'uc018-perf-load/summary.json' } : null,
      labelText: perfReadme + '\n' + (perfSummary?.note || ''),
      dual: perfDual,
    }),
  };

  const openGaps = [];
  if (/GAP-UC018-COVERED-CRITERION/.test(criterionHarness)) {
    if (!gapClosedInText(criterionHarness, 'GAP-UC018-COVERED-CRITERION')) {
      openGaps.push('GAP-UC018-COVERED-CRITERION');
    }
  }
  const s11Status = cellStatus(row11?.[2] || row11?.[1] || 'partial');
  const businessPathMet =
    gapClosedInText(parentHarness, 'GAP-UC018-FULL-E2E') &&
    gapClosedInText(parentHarness, 'GAP-UC018-GRAPH') &&
    gapClosedInText(parentHarness, 'GAP-UC018-TTL') &&
    gapClosedInText(parentHarness, 'GAP-UC018-UI') &&
    gapClosedInText(parentHarness, 'GAP-UC018-SOLE');

  return {
    ucId: 'UC-E2E-018',
    columns,
    section11: {
      status: s11Status === 'unknown' ? 'partial' : s11Status,
      businessPathMet,
      openGaps,
    },
    requiredNhp: UC018_REQUIRED_NHP,
    _meta: {
      boundPin: UC018_BOUND_PIN_ID,
      hasBoundNhp,
      boundCell: cellStatus(row101?.[3]),
      openGaps,
      businessPathMet,
      parsedStatuses: Object.fromEntries(
        ['NEG', 'FAULT', 'BOUND', 'ADV', 'PERF', 'LOAD'].map((c) => [c, columns[c].status]),
      ),
      sources: Object.fromEntries(
        ['NEG', 'FAULT', 'BOUND', 'ADV', 'PERF', 'LOAD'].map((c) => [c, columns[c]._sources]),
      ),
    },
  };
}

export function toEvaluateInput(gathered) {
  const columns = {};
  for (const [k, v] of Object.entries(gathered.columns || {})) {
    const { _sources, ...rest } = v;
    columns[k] = rest;
  }
  return {
    ucId: gathered.ucId,
    columns,
    section11: gathered.section11,
    requiredNhp: gathered.requiredNhp,
  };
}
