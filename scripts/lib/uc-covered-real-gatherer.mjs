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
 *     (receipt present but EXIT dropped → null → MISSING-RECEIPT; nonzero → PROVE-FAIL)
 *
 *   gitSha:
 *     receipt.gitSha | proveTip | runnerCommitSha | commitSha | requestTip
 *     | harness "**Prove tip**:" / "prove tip **`sha`**" citation
 *     (same precedence as GRAPH tipOk — Ban inventing when all absent)
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
 *     | review files via dualFromReviewFiles — strict last `Verdict: PASS|FAIL` line
 *       (optional **bold** only; no trailing junk); role from path suffix only
 */
import { execSync } from 'node:child_process';
import {
  isBackfillReceiptShape,
  isPreferableBackfillReceipt,
  EMITTED_BY,
} from './uc018-receipt-backfill-guard.mjs';
import { unwrapStackValue } from './uc018-receipt-backfill-facts.mjs';
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

/** CLOSED before/after GAP id + 已关; Ban/不得/禁止/不可/未/not windows do NOT count as closed. */
export function gapClosedInText(text, gapId) {
  if (!text) return false;
  const escaped = gapId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(escaped + '[^\\n]{0,120}CLOSED', 'i'),
    new RegExp('CLOSED[^\\n]{0,120}' + escaped, 'i'),
    new RegExp('已关[^\\n]{0,160}' + escaped, 'i'),
    new RegExp(escaped + '[^\\n]{0,80}已关', 'i'),
    new RegExp('\\*\\*CLOSED\\*\\*[（(][^)）\\n]{0,60}' + escaped, 'i'),
  ];
  const banNear = /不得|禁止|\bBan\b|不可|未|不得写已关|\bnot\b|not\s+closed|≠\s*closed/i;
  for (const re of patterns) {
    const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m;
    while ((m = r.exec(text)) !== null) {
      const from = Math.max(0, m.index - 48);
      const window = text.slice(from, m.index + m[0].length + 16);
      if (banNear.test(window)) continue;
      return true;
    }
  }
  return false;
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
/**
 * Evidence-of-record / implementer-only flags.
 * Backfill overlays (`_source === 'backfill'`): judge SOLELY by the receipt's own
 * fields (implementerOnly / evidenceOfRecord). Ban legacy README / labelText bleed
 * (mw-rag-route FAIL @629f956 · PERF/LOAD silent-brown).
 * Legacy (and non-backfill): label heuristics still apply to the receipt they describe.
 */
export function pickEvidenceFlags(receipt, labelText) {
  if (receipt?._source === 'backfill') {
    const implementerOnly = receipt?.implementerOnly === true;
    let evidenceOfRecord = receipt?.evidenceOfRecord ?? receipt?.evidence?.ofRecord;
    if (evidenceOfRecord == null) evidenceOfRecord = false;
    if (implementerOnly) evidenceOfRecord = false;
    return { implementerOnly, evidenceOfRecord: evidenceOfRecord === true };
  }
  const label = `${labelText || ''}\n${receipt?.note || ''}\n${receipt?.disclosure || ''}`;
  const labeledImpl = /not evidence of record|implementer pre-commit|uncommitted runner/i.test(label);
  const implementerOnly = receipt?.implementerOnly === true || labeledImpl;
  // B-EOR-FAIL-OPEN: absent ⇒ false (never soft-default true)
  let evidenceOfRecord = receipt?.evidenceOfRecord ?? receipt?.evidence?.ofRecord;
  if (evidenceOfRecord == null) evidenceOfRecord = false;
  if (implementerOnly) evidenceOfRecord = false;
  return { implementerOnly, evidenceOfRecord: evidenceOfRecord === true };
}
export function pickExitFromReceipt(receipt, cmd) {
  if (!receipt || typeof receipt !== 'object') return null;
  if (typeof receipt.exit === 'number') return receipt.exit;
  if (typeof receipt.exitCode === 'number') return receipt.exitCode;
  if (cmd && receipt.exits && typeof receipt.exits[cmd] === 'number') return receipt.exits[cmd];
  if (cmd && receipt.exits && typeof receipt.exits[`pnpm ${cmd}`] === 'number') return receipt.exits[`pnpm ${cmd}`];
  if (cmd && receipt.cmds && typeof receipt.cmds[cmd] === 'number') return receipt.cmds[cmd];
  if (cmd && receipt.cmds && typeof receipt.cmds[`pnpm ${cmd}`] === 'number') return receipt.cmds[`pnpm ${cmd}`];
  // C-ALLPASS-EXIT0: Ban inventing EXIT from allPass boolean — require explicit exit/exitCode/exits/cmds
  return null;
}
/**
 * Tip SHA precedence (aligned with GRAPH tipOk wiring):
 *   gitSha | proveTip | runnerCommitSha | commitSha | requestTip
 * First non-empty wins. Ban inventing SHA when all absent.
 */
function pickGitSha(receipt) {
  if (!receipt || typeof receipt !== 'object') return null;
  const s =
    receipt.gitSha ||
    receipt.proveTip ||
    receipt.runnerCommitSha ||
    receipt.commitSha ||
    receipt.requestTip ||
    null;
  return s ? String(s).trim() : null;
}
function parseSoleStack(soleStack) {
  if (!soleStack || typeof soleStack !== 'string') return null;
  const s = soleStack.toLowerCase();
  // Explicit tokens only — Ban inferring postgresSaver from postgres+pgvector alone (:185 removed)
  const postgres = s.includes('postgres');
  const postgresSaver = /postgressaver/.test(s);
  return {
    postgres: postgres ? true : undefined,
    postgresSaver: postgresSaver ? true : undefined,
    memorySaver: /memorysaver/.test(s) ? true : false,
    mysql: /mysql/.test(s) ? true : false,
    qdrant: /qdrant/.test(s) ? true : false,
  };
}
function pickStack(receipt) {
  if (receipt?.stack && typeof receipt.stack === 'object') {
    // Unwrap sourced {value,source} facts; legacy flat booleans still work.
    // 'unobserved' → undefined (evaluator fail-closed STUB-STACK).
    return {
      postgres: unwrapStackValue(receipt.stack.postgres),
      postgresSaver: unwrapStackValue(receipt.stack.postgresSaver),
      memorySaver: unwrapStackValue(receipt.stack.memorySaver),
      mysql: unwrapStackValue(receipt.stack.mysql),
      qdrant: unwrapStackValue(receipt.stack.qdrant),
    };
  }
  if (receipt?.soleStack) {
    const p = parseSoleStack(receipt.soleStack);
    if (p) return p;
  }
  // Absent → all undefined (evaluator ⇒ STUB-STACK)
  return {
    postgres: undefined,
    postgresSaver: undefined,
    memorySaver: undefined,
    mysql: undefined,
    qdrant: undefined,
  };
}
/**
 * Strict machine-readable dual verdict (round 5 — last-line-only).
 *
 * Exact last-non-empty-line regex (after trimming trailing whitespace/CR):
 *   /^(\*\*)?Verdict: (PASS|FAIL)(\*\*)?$/
 * Bold must be balanced (both `**` or neither). No scanning earlier lines.
 * Retraction = last line is FAIL.
 *
 * Defense in depth:
 *   - unclosed `<!--` anywhere ⇒ null
 *   - any `Verdict:` line inside an HTML comment block ⇒ null
 *   - unterminated markdown fence (``` / ~~~) ⇒ null (Verdict would be inside code)
 *
 * Removed: markdown fence/quote/indent stripping code path (and the no-op stub).
 *
 * Role binding unchanged: path suffix + (when root given) latest git author
 * must match mw-e2e-ha / mw-rag-route. Unparseable ⇒ MISSING-DUAL.
 * Known limit (not blocker): git-author can be spoofed via `git -c user.name/email`;
 * path+author is tamper-evident in review only, not cryptographic.
 */
export const REVIEW_VERDICT_LINE_RE = /^(\*\*)?Verdict: (PASS|FAIL)(\*\*)?$/;

function htmlCommentDefenseFails(text) {
  // Unclosed <!-- (last <!-- after last -->)
  let i = 0;
  let depthOpenAt = -1;
  while (i < text.length) {
    const open = text.indexOf('<!--', i);
    const close = text.indexOf('-->', i);
    if (open < 0 && close < 0) break;
    if (open >= 0 && (close < 0 || open < close)) {
      depthOpenAt = open;
      i = open + 4;
      const nextClose = text.indexOf('-->', i);
      if (nextClose < 0) return true; // unclosed
      const block = text.slice(open, nextClose + 3);
      if (/Verdict:\s*(PASS|FAIL)/i.test(block)) return true;
      i = nextClose + 3;
      depthOpenAt = -1;
      continue;
    }
    // stray -->
    i = close + 3;
  }
  return false;
}

/** Unterminated ``` / ~~~ fence anywhere ⇒ fail closed (like unclosed <!--). */
function unterminatedFenceFails(text) {
  const lines = String(text).split(/\r?\n/);
  let open = null; // { ch: '`'| '~', len: number }
  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');
    const m = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!m) continue;
    const fence = m[1];
    const ch = fence[0];
    const len = fence.length;
    const info = m[2] || '';
    if (!open) {
      // opening fence: backtick fences cannot contain backticks in info string
      if (ch === '`' && info.includes('`')) continue;
      open = { ch, len };
      continue;
    }
    // closing: same char, length >= open, info must be empty (whitespace only)
    if (ch === open.ch && len >= open.len && info.trim() === '') {
      open = null;
    }
  }
  return open != null;
}

/**
 * Verdict ONLY from the last non-empty line of the raw file.
 * @returns {'PASS'|'FAIL'|null}
 */
export function parseReviewFileVerdict(text) {
  if (!text || typeof text !== 'string') return null;
  if (htmlCommentDefenseFails(text)) return null;
  if (unterminatedFenceFails(text)) return null;

  const lines = text.split(/\r?\n/);
  let lastNonEmpty = null;
  for (const line of lines) {
    // trim trailing whitespace + CR only for emptiness / match prep
    const trimmedEnd = line.replace(/[ \t\f\v]+$/g, '').replace(/\r$/, '');
    if (trimmedEnd.trim().length === 0) continue;
    lastNonEmpty = trimmedEnd;
  }
  if (lastNonEmpty == null) return null;

  const m = lastNonEmpty.match(/^(\*\*)?Verdict: (PASS|FAIL)(\*\*)?$/);
  if (!m) return null;
  const openBold = m[1] === '**';
  const closeBold = m[3] === '**';
  if (openBold !== closeBold) return null; // unbalanced bold
  return m[2] === 'PASS' || m[2] === 'FAIL' ? m[2] : null;
}

export function roleFromReviewPath(filePath) {
  const base = String(filePath || '').replace(/\\/g, '/');
  const name = base.split('/').pop() || base;
  if (/-mw-e2e-ha\.md$/i.test(name) || /\/mw-e2e-ha\//i.test(base)) return 'e2eHa';
  if (/-mw-rag-route\.md$/i.test(name) || /\/mw-rag-route\//i.test(base)) return 'ragRoute';
  return null;
}

/** Latest commit author touching file: `Name <email>`. */
export function latestCommitAuthor(root, filePath) {
  if (!root || !filePath) return null;
  try {
    const out = execSync(`git log -1 --format='%an <%ae>' -- ${filePath}`, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

export function authorMatchesRole(author, role) {
  if (!author || !role) return false;
  if (role === 'e2eHa') return /mw-e2e-ha/i.test(author);
  if (role === 'ragRoute') return /mw-rag-route/i.test(author);
  return false;
}

/**
 * @param {string[]} paths
 * @param {string} [root] — required for C-NO-GIT-AUTHOR (role↔latest-author). Absent root ⇒ path-only (tests).
 */
export function dualFromReviewFiles(paths, root) {
  let e2eHa = null;
  let ragRoute = null;
  for (const p of paths) {
    const text = readText(p);
    if (!text) continue;
    const role = roleFromReviewPath(p);
    if (!role) continue;
    if (root) {
      const author = latestCommitAuthor(root, p);
      if (!authorMatchesRole(author, role)) {
        // Fail closed: wrong/missing author ⇒ leave slot null (MISSING-DUAL)
        continue;
      }
    }
    const verdict = parseReviewFileVerdict(text);
    if (verdict == null) continue;
    if (role === 'e2eHa') e2eHa = verdict;
    if (role === 'ragRoute') ragRoute = verdict;
  }
  return { e2eHa, ragRoute };
}

function shaFlags(root, sha) {
  // Emit verifiedSha bound to the SHA actually cat-file + ancestor-checked when committed.
  if (!sha) {
    return {
      gitSha: null,
      verifiedSha: null,
      committed: false,
      shaMatchesCommitted: false,
      uncommitted: true,
      staleSha: false,
    };
  }
  const exists = gitCommitExists(root, sha);
  const ancestor = exists && gitIsAncestor(root, sha);
  const committed = exists && ancestor;
  return {
    gitSha: sha,
    verifiedSha: committed ? sha : null,
    committed,
    shaMatchesCommitted: committed,
    uncommitted: !committed,
    staleSha: exists && !ancestor,
  };
}
/** Fail closed if working tree is dirty (non-empty porcelain). Ignored paths = gitignored only. */
export function assertCleanPorcelain(root) {
  const out = execSync('git status --porcelain', { cwd: root, encoding: 'utf8' });
  const dirty = out.split('\n').map((l) => l.trimEnd()).filter(Boolean);
  if (dirty.length > 0) {
    const err = new Error(
      `DIRTY_TREE: git status --porcelain non-empty (${dirty.length} lines). Refuse gather/prove.\n` +
        dirty.slice(0, 30).join('\n'),
    );
    err.code = 'DIRTY_TREE';
    err.dirty = dirty;
    throw err;
  }
  return true;
}

/**
 * @param {{ root: string, receiptRoot?: string, reviewsRoot?: string, harnessRoot?: string, skipPorcelainCheck?: boolean }} opts
 */

/** waiting_user historical backfill: fail-closed (C-WAITING-USER-RULE). */
export const WAITING_USER_BACKFILL_STATUS = 'MISSING-EVIDENCE';

/**
 * Prefer machine-emitted backfill overlay; never mutate legacy files.
 * Legacy remains untouched on disk; gatherer reads backfill first when shape-valid.
 * @param {string} receiptRoot
 * @param {string} backfillFile e.g. 'SOLE.json'
 * @param {string} legacyRel e.g. '2026-09-23-uc-e2e-018-sole-stack-pg-retained-evidence.json'
 */
export function readReceiptPreferBackfill(receiptRoot, backfillFile, legacyRel) {
  const backfillRel = `uc018-receipt-backfill/${backfillFile}`;
  const backfillAbs = join(receiptRoot, backfillRel);
  const bfExists = existsSync(backfillAbs);
  const bf = bfExists ? readJson(backfillAbs) : null;

  // Fail-closed: a present backfill file that is not preferable MUST NOT fall
  // back to legacy (Ban silent green). Flag BACKFILL-FAILED for the evaluator.
  if (bfExists) {
    if (isPreferableBackfillReceipt(bf)) {
      return { ...bf, _path: backfillRel, _source: 'backfill', _backfillFailed: false };
    }
    const exitMissing = !(bf && typeof bf.exit === 'number' && Number.isInteger(bf.exit));
    const failReason = exitMissing
      ? 'missing-or-invalid-proveExit'
      : (bf && bf.exit !== 0)
        ? 'prove-exit-nonzero'
        : (!bf || bf.emittedBy !== EMITTED_BY)
          ? 'emittedBy-or-shape-invalid'
          : 'shape-invalid';
    return {
      ...(bf && typeof bf === 'object' ? bf : {}),
      _path: backfillRel,
      _source: 'backfill-failed',
      _backfillFailed: true,
      _backfillFailReason: failReason,
      // Force non-green evidence flags (no silent legacy wash)
      evidenceOfRecord: false,
      implementerOnly: false,
      present: true,
      missing: true,
      exit: exitMissing ? null : bf.exit,
    };
  }

  const legacy = readJson(join(receiptRoot, legacyRel));
  if (legacy && typeof legacy === 'object') {
    return { ...legacy, _path: legacyRel, _source: 'legacy', _backfillFailed: false };
  }
  return null;
}

export function gatherRealUc018(opts) {
  const root = opts.root;
  if (!opts.skipPorcelainCheck) {
    assertCleanPorcelain(root);
  }
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

  // C-GATHERER-PATH-WIRE: prefer uc018-receipt-backfill/*.json overlays (machine-emitted);
  // legacy paths retained as fallback · Ban overwriting legacy · Ban duplicated SSOT writes
  const soleReceipt = readReceiptPreferBackfill(
    receiptRoot,
    'SOLE.json',
    '2026-09-23-uc-e2e-018-sole-stack-pg-retained-evidence.json',
  );
  const advReceipt = readReceiptPreferBackfill(
    receiptRoot,
    'ADV.json',
    '2026-09-23-uc-e2e-018-adv-evidence.json',
  );
  const perfSummary = readReceiptPreferBackfill(
    receiptRoot,
    'PERF-LOAD.json',
    'uc018-perf-load/summary.json',
  );
  const perfReadme = readText(join(receiptRoot, 'uc018-perf-load/README.md')) || '';

  const advDual = dualFromReviewFiles([
    join(reviewsRoot, 'REQUEST-2026-09-23-uc-e2e-018-adv-post-prove-mw-e2e-ha.md'),
    join(reviewsRoot, 'REQUEST-2026-09-23-uc-e2e-018-adv-post-prove-mw-rag-route.md'),
  ], root);
  const perfDual = dualFromReviewFiles([
    join(reviewsRoot, 'REQUEST-2026-09-23-uc-e2e-018-perf-load-post-prove-mw-e2e-ha.md'),
    join(reviewsRoot, 'REQUEST-2026-09-23-uc-e2e-018-perf-load-post-prove-mw-rag-route.md'),
  ], root);
  // NEG/BOUND: sole-stack + waiting-user post-prove reviews (fail closed if missing)
  const soleDual = dualFromReviewFiles([
    join(reviewsRoot, 'REQUEST-2026-09-23-uc-e2e-018-sole-stack-pg-retained-post-prove-mw-e2e-ha.md'),
    join(reviewsRoot, 'REQUEST-2026-09-23-uc-e2e-018-sole-stack-pg-retained-post-prove-mw-rag-route.md'),
  ], root);
  const waitingDual = dualFromReviewFiles([
    join(reviewsRoot, '2026-09-10-uc-e2e-018-waiting-user-mw-e2e-ha.md'),
  ], root);
  const negBoundDual = {
    e2eHa: soleDual.e2eHa || waitingDual.e2eHa || null,
    ragRoute: soleDual.ragRoute || waitingDual.ragRoute || null,
  };
  // FAULT: GRAPH evidence only if committed tip + parseable cmds; else MISSING-RECEIPT
  const graphReceipt = readReceiptPreferBackfill(
    receiptRoot,
    'GRAPH.json',
    '2026-09-23-uc-e2e-018-graph-safely-terminated-evidence.json',
  );
  const graphDual = dualFromReviewFiles([
    join(reviewsRoot, 'REQUEST-2026-09-23-uc-e2e-018-graph-safely-terminated-post-prove-mw-e2e-ha.md'),
    join(reviewsRoot, 'REQUEST-2026-09-23-uc-e2e-018-graph-safely-terminated-post-prove-mw-rag-route.md'),
  ], root);
  let faultReceipt = null;
  let faultReceiptNote = 'no dedicated FAULT prove receipt';
  if (graphReceipt && typeof graphReceipt === 'object') {
    const tip = pickGitSha(graphReceipt);
    const tipOk = tip ? gitCommitExists(root, tip) && gitIsAncestor(root, tip) : false;
    const hasCmdExit =
      (graphReceipt.cmds && typeof graphReceipt.cmds['uc018:graph:prove'] === 'number') ||
      (graphReceipt.exits && typeof graphReceipt.exits['uc018:graph:prove'] === 'number');
    if (hasCmdExit && tipOk) {
      faultReceipt = {
        ...graphReceipt,
        _path: graphReceipt._path || '2026-09-23-uc-e2e-018-graph-safely-terminated-evidence.json',
      };
      faultReceiptNote =
        'wired GRAPH evidence (tip ' + tip + ' committed+ancestor; cmds present; no stack => STUB-STACK)';
    } else {
      faultReceiptNote =
        'GRAPH evidence present but not wired (tipOk=' + tipOk + ' hasCmdExit=' + hasCmdExit + ') => MISSING-RECEIPT';
    }
  }

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
      sha.verifiedSha = null;
    }
    const stack = pickStack(receipt);
    return {
      status,
      nhpIds,
      prove: {
        cmd: cmd || null,
        exit,
        gitSha: sha.gitSha,
        verifiedSha: sha.verifiedSha,
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
        backfillFailed: receipt?._backfillFailed === true,
        backfillFailReason: receipt?._backfillFailReason || null,
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
      receipt: soleReceipt ? { ...soleReceipt, _path: soleReceipt._path || 'sole-stack-pg-retained-evidence.json' } : null,
      labelText: '',
      dual: negBoundDual,
    }),
    FAULT: buildCol({
      statusCell: row101?.[2],
      nhpRow: nhpFault,
      nhpIds: nhpFault ? ['NHP-018-FAULT-01'] : [],
      cmd: faultReceipt ? 'uc018:graph:prove' : null,
      harnessText: parentHarness,
      receipt: faultReceipt,
      labelText: '',
      dual: faultReceipt ? graphDual : { e2eHa: null, ragRoute: null },
    }),
    BOUND: buildCol({
      statusCell: row101?.[3],
      nhpRow: null,
      nhpIds: boundIsWaitingUser ? [UC018_BOUND_PIN_ID] : [],
      cmd: 'uc018:abandon:prove',
      harnessText: parentHarness,
      receipt: soleReceipt ? { ...soleReceipt, _path: soleReceipt._path || 'sole-stack-pg-retained-evidence.json' } : null,
      labelText: '',
      dual: negBoundDual,
    }),
    ADV: buildCol({
      statusCell: row101?.[4],
      nhpRow: nhpAdv,
      nhpIds: ['NHP-018-ADV-01'],
      cmd: 'uc018:adv:prove',
      harnessText: advHarness,
      receipt: advReceipt ? { ...advReceipt, _path: advReceipt._path || '2026-09-23-uc-e2e-018-adv-evidence.json' } : null,
      labelText: '',
      dual: advDual,
    }),
    PERF: buildCol({
      statusCell: row102?.[1],
      nhpRow: nhpPerf,
      nhpIds: ['NHP-018-PERF-01'],
      cmd: 'uc018:perf-load:prove',
      harnessText: perfHarness,
      receipt: perfSummary ? { ...perfSummary, _path: perfSummary._path || 'uc018-perf-load/summary.json' } : null,
      // README/label heuristics ONLY for legacy receipt they describe (Ban bleed onto backfill)
      labelText: perfSummary?._source === 'legacy'
        ? (perfReadme + '\n' + (perfSummary?.note || ''))
        : (perfSummary?.note || ''),
      dual: perfDual,
    }),
    LOAD: buildCol({
      statusCell: row102?.[3],
      nhpRow: nhpLoad,
      nhpIds: ['NHP-018-LOAD-01'],
      cmd: 'uc018:perf-load:prove',
      harnessText: perfHarness,
      receipt: perfSummary ? { ...perfSummary, _path: perfSummary._path || 'uc018-perf-load/summary.json' } : null,
      labelText: perfSummary?._source === 'legacy'
        ? (perfReadme + '\n' + (perfSummary?.note || ''))
        : (perfSummary?.note || ''),
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
      waitingUserBackfill: WAITING_USER_BACKFILL_STATUS,
      openGaps,
      businessPathMet,
      faultReceiptNote,
      dualSources: {
        NEG: 'sole-stack-pg-retained-post-prove + waiting-user reviews',
        FAULT: faultReceipt ? 'graph-safely-terminated-post-prove' : 'none (MISSING-DUAL)',
        BOUND: 'sole-stack-pg-retained-post-prove + waiting-user reviews',
        ADV: 'adv-post-prove',
        PERF: 'perf-load-post-prove',
        LOAD: 'perf-load-post-prove',
      },
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
