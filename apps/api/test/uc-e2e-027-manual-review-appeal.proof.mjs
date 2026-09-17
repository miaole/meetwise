#!/usr/bin/env node
/**
 * UC-E2E-027 — 人工复核申诉（NON-UI static inventory + GAP/blocked mark-red）
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ UC-E2E-027 covered · 本绿 ≠ 全链路 E2E covered
 * 矩阵保持 **gap** / **blocked**（产品未接线 honest）；EXIT=0 = 诚实钉缺口
 * ≠ A1 appeal open / A2 overturn CAS / A3 幂等 / A4 lease effect=0 产品/E2E 闭环
 *
 * 搜码结论（本树）：
 *   - Spec：e2e-scenarios UC-E2E-027；status-machine ManualReview TARGET；
 *     architecture/ai/human-review-design.md 明示运行时表/API/UI = 0
 *   - Code：无 ManualReview 模块/HTTP；无 manual_review / review_decision / review_effect 表；
 *     无 e2e TC-E2E-027
 *   - 旁证≠covered：qbank_source ReviewDecision；SelectiveReviewDecision；
 *     resume needs_review 标记；web「人工复核还没开放」文案
 *
 * 若产品浮出（appeal/ManualReview HTTP + 表 + e2e 钉）→ 拒 EXIT=0，
 * 须另刀产品闭环 prove（TC-E2E-027-*），不得继续用 blocked mark-red 叙事。
 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(apiRoot, '../..');

function read(rel) {
  const p = resolve(repoRoot, rel);
  assert.equal(existsSync(p), true, `missing file: ${rel}`);
  return readFileSync(p, 'utf8');
}

function listMigrations() {
  const abs = resolve(repoRoot, 'packages/db/migrations');
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .filter((n) => n.endsWith('.sql'))
    .map((n) => join('packages/db/migrations', n));
}

function walkTsFiles(dirRel, acc = []) {
  const abs = resolve(repoRoot, dirRel);
  if (!existsSync(abs)) return acc;
  for (const name of readdirSync(abs, { withFileTypes: true })) {
    const rel = join(dirRel, name.name);
    if (name.isDirectory()) {
      if (name.name === 'node_modules' || name.name === 'dist') continue;
      walkTsFiles(rel, acc);
    } else if (/\.(ts|mjs|js)$/.test(name.name)) {
      acc.push(rel);
    }
  }
  return acc;
}

const gaps = [];
function pinGap(id, detail) {
  gaps.push({ id, detail });
  console.log(`GAP  ${id}  ${detail}`);
}

const APPEAL_HTTP_RE =
  /@(Post|Get|Put|Patch|Delete)\(['"`][^'"`]*(appeal|manual-review|manual_review|reviews?\/appeal|human-review)/i;
const MANUAL_REVIEW_CTRL_RE =
  /@Controller\(['"`][^'"`]*(appeal|manual-review|manual_review|human-review|reviews)['"`]\)/i;
const MANUAL_REVIEW_TABLE_RE =
  /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(?:manual_review|review_decision|review_effect|review_assignment|review_evidence_snapshot|review_access_audit)\b/i;
const UC027_SCENARIO_RE = /UC-E2E-027|TC-E2E-027/;

const checks = {
  'S1-no-manual-review-appeal-http-module': () => {
    const modulesDir = resolve(repoRoot, 'apps/api/src/modules');
    assert.equal(existsSync(modulesDir), true, 'apps/api/src/modules present');
    const mods = readdirSync(modulesDir);
    assert.ok(!mods.includes('manual-review'), 'no apps/api module manual-review');
    assert.ok(!mods.includes('appeal'), 'no apps/api module appeal');
    assert.ok(!mods.includes('human-review'), 'no apps/api module human-review');

    const controllers = walkTsFiles('apps/api/src').filter((r) => /controller\.(ts|js)$/.test(r));
    assert.ok(controllers.length >= 5, 'expected api controllers inventory');
    let hit = null;
    for (const rel of controllers) {
      const body = read(rel);
      if (MANUAL_REVIEW_CTRL_RE.test(body) || APPEAL_HTTP_RE.test(body)) {
        hit = rel;
        break;
      }
    }
    assert.equal(hit, null, `inventory: no appeal/ManualReview controller routes (found in ${hit})`);
  },

  'S2-no-manual-review-tables': () => {
    const migrations = listMigrations();
    assert.ok(migrations.length >= 10, 'migrations directory should exist');
    let tableHit = null;
    for (const rel of migrations) {
      const body = read(rel);
      if (MANUAL_REVIEW_TABLE_RE.test(body)) {
        tableHit = rel;
        break;
      }
    }
    assert.equal(tableHit, null, `inventory: no ManualReview domain tables (found in ${tableHit})`);
  },

  'S3-旁证-qbank-selective-resume-ne-uc027': () => {
    // qbank ReviewDecision = approved/rejected for qbank_source — ≠ ManualReview outcome_code
    const qbank = read('packages/db/src/qbank-curation.ts');
    assert.match(qbank, /export type ReviewDecision\s*=\s*'approved'\s*\|\s*'rejected'/, 'qbank ReviewDecision旁证 present');
    assert.doesNotMatch(
      qbank,
      /UC-E2E-027|ManualReview|upheld|overturned|ReviewEffect|申诉/,
      'qbank ReviewDecision must not claim UC-027 ManualReview appeal semantics',
    );

    // SelectiveReviewDecision = scoring route review|skip — ≠ appeal case
    const scor = read('packages/domain/src/scoring-operation-routing.ts');
    assert.match(scor, /SelectiveReviewDecision/, 'SelectiveReviewDecision旁证 present');
    assert.doesNotMatch(
      scor,
      /UC-E2E-027|ManualReview|ReviewEffect|申诉案件/,
      'SelectiveReviewDecision ≠ UC-027 appeal case machine',
    );

    // resume needs_review is a profile status mark — not a ManualReview case
    const resume = read('packages/db/src/resume.ts');
    assert.match(resume, /needs_review/, 'resume needs_review旁证 present');
    assert.doesNotMatch(
      resume,
      /ManualReview|UC-E2E-027|ReviewDecision\.outcome|appeal/,
      'resume needs_review ≠ ManualReview appeal workflow',
    );
  },

  'S4-no-e2e-uc027-scenario': () => {
    const full = read('e2e/full.e2e.ts');
    assert.doesNotMatch(full, UC027_SCENARIO_RE, 'full.e2e must not claim UC-E2E-027 / TC-E2E-027');
    assert.doesNotMatch(
      full,
      /\b(ManualReview|ReviewEffect|申诉复核|appeal.?open|overturned)\b/,
      'full.e2e must not host ManualReview appeal flow',
    );
    const e2eDir = resolve(repoRoot, 'e2e');
    if (existsSync(e2eDir)) {
      for (const name of readdirSync(e2eDir)) {
        if (!/\.(e2e\.)?ts$/.test(name) && !name.endsWith('.ts')) continue;
        const rel = join('e2e', name);
        const body = read(rel);
        assert.doesNotMatch(body, UC027_SCENARIO_RE, `${rel} must not pin UC-027`);
      }
    }
  },

  'S5-scenarios-and-TARGET-design-vs-unwired-product': () => {
    const scenarios = read('ai-docs/requirements/use-cases/e2e-scenarios.md');
    assert.match(scenarios, /UC-E2E-027/, 'e2e-scenarios defines UC-E2E-027');
    assert.match(scenarios, /TC-E2E-027-appeal/, 'scenarios list TC-E2E-027-appeal');
    assert.match(scenarios, /ManualReview|ReviewDecision|ReviewEffect/, 'scenarios name ManualReview domain');

    const sm = read('ai-docs/rules/global/status-machine.md');
    assert.match(sm, /### ManualReview/, 'status-machine documents ManualReview');
    assert.match(
      sm,
      /ManualReview（人工复核案件，TARGET）|当前没有运行时表\/API\/UI/,
      'status-machine honesty: ManualReview TARGET / no runtime surface',
    );

    const design = read('ai-docs/architecture/ai/human-review-design.md');
    assert.match(design, /TARGET/, 'human-review-design marks TARGET');
    assert.match(
      design,
      /运行时代码中通用 `ManualReview` 表、API.*均为 \*\*0\*\*|表、API、审核员角色、案件 UI、申诉 E2E 均为 \*\*0\*\*/,
      'design inventory: ManualReview runtime = 0',
    );

    // UI copy may admit not open — must not claim live appeal UX
    const how = resolve(repoRoot, 'apps/web/app/recruiter/how-it-works/page.tsx');
    if (existsSync(how)) {
      const body = readFileSync(how, 'utf8');
      assert.match(body, /人工复核/, 'web how-it-works mentions 人工复核 (旁证文案)');
      assert.match(body, /还没开放|未开放|不可用|不提供/, 'web honesty: 人工复核 not open');
    }
  },

  'G-GAP-product-surface-or-pins': () => {
    const controllers = walkTsFiles('apps/api/src').filter((r) => /controller\.(ts|js)$/.test(r));
    const routesWired = controllers.some((rel) => {
      const body = read(rel);
      return MANUAL_REVIEW_CTRL_RE.test(body) || APPEAL_HTTP_RE.test(body);
    });
    const migrations = listMigrations();
    const tablesWired = migrations.some((rel) => MANUAL_REVIEW_TABLE_RE.test(read(rel)));
    const e2eHits = (() => {
      const full = read('e2e/full.e2e.ts');
      if (UC027_SCENARIO_RE.test(full)) return true;
      const e2eDir = resolve(repoRoot, 'e2e');
      if (!existsSync(e2eDir)) return false;
      return readdirSync(e2eDir).some((name) => {
        if (!name.endsWith('.ts')) return false;
        return UC027_SCENARIO_RE.test(read(join('e2e', name)));
      });
    })();
    const mods = readdirSync(resolve(repoRoot, 'apps/api/src/modules'));
    const moduleWired = mods.includes('manual-review') || mods.includes('appeal') || mods.includes('human-review');

    if (routesWired || tablesWired || e2eHits || moduleWired) {
      throw new Error(
        'PRODUCT_SURFACE: ManualReview/appeal routes, tables, module, or UC-027 e2e appears wired — refuse blocked EXIT=0; wire product isolation prove (TC-E2E-027-*) instead of mark-red',
      );
    }

    pinGap(
      'GAP-UC027-APPEAL-OPEN',
      'TC-E2E-027-appeal / A1: no HTTP create appeal → ManualReview open (subject+principal+idempotency+evidence snapshot); product blocked',
    );
    pinGap(
      'GAP-UC027-OVERTURN-CAS',
      'TC-E2E-027-overturn / A2: no ReviewEffect expected-version CAS → single new AssessmentVersion + audit reason; overturned path unwired',
    );
    pinGap(
      'GAP-UC027-IDEMPOTENT',
      'A3: no same-subject idempotency key converging duplicate appeals to one open case',
    );
    pinGap(
      'GAP-UC027-LEASE-EFFECT0',
      'A4: no expired reviewer lease → decision/effect=0; ReviewAssignment lease product absent',
    );
    pinGap(
      'GAP-UC027-D3-STATUS',
      'D3 ManualReview on status-machine is TARGET (design-only); runtime tables/API/UI=0 per human-review-design; qbank ReviewDecision / resume needs_review / SelectiveReview ≠ this case machine',
    );
    pinGap(
      'GAP-UC027-E2E',
      'No e2e/*.e2e.ts / full.e2e pins UC-E2E-027 / TC-E2E-027; authz RLS for claim/decide/effect unproven',
    );
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(checks)) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (e) {
    failed += 1;
    console.log(`FAIL ${name}: ${(e && e.message) || e}`);
  }
}

console.log('');
console.log(`GAPS=${gaps.length} ${gaps.map((g) => g.id).join(',')}`);
console.log('NOTE: releaseEvidence=false · Not HA · 本绿≠UC-E2E-027 covered · 本绿≠全链路 E2E covered');
console.log('NOTE: matrix=gap/blocked(产品未接线 honest) · EXIT=0=mark-red ≠ closed / ≠ partial-closed');
console.log('NOTE: 旁证≠covered: qbank ReviewDecision · SelectiveReviewDecision · resume needs_review · web「人工复核还没开放」');
console.log(`CMD=pnpm -C apps/api prove:uc027-manual-review-appeal EXIT=${failed === 0 ? 0 : 1}`);
process.exit(failed === 0 ? 0 : 1);
