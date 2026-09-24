#!/usr/bin/env node
/**
 * UC-E2E-004 — career-path 全链路（NON-UI static inventory + GAP mark-red）
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ UC-E2E-004 covered · 本绿 ≠ 全链路 E2E covered
 * 矩阵保持 **gap**（honest）；EXIT=0 = 诚实钉缺口 ≠ A1/A2/A3 HTTP/E2E 闭环
 *
 * 搜码结论（本树）：
 *   - HTTP POST/GET /interview/:id/career-path 存在，但 generateCareerPath = 域 deriveCareerPath 确定性派生
 *   - 无 packages/ai-graphs career-path 图文件；无 AiGraphRun(career-path) 接线
 *   - generateCareerPath 只写 career_path 表；不更新 CapabilityProfile / GrowthTimeline
 *   - 无 e2e/*.e2e.ts 覆盖 TC-E2E-004-*；profile/growth 只聚合 assessment_report
 *
 * 旁证（≠ covered）：neg:interview career-path 409/404/401；domain scoring-honesty deriveCareerPath；
 *   report:prove / graph:prove（他图）；validate.ts 局部 HTTP；web report 页 GET 渲染
 *
 * 若产品浮出真实 AiGraphRun(career-path) + GrowthTimeline 写入 + e2e 主路径 → 拒 EXIT=0，
 * 须另刀 HTTP/E2E prove，不得继续用 gap mark-red 叙事。
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

function listFiles(dirRel, pred) {
  const abs = resolve(repoRoot, dirRel);
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .filter((n) => pred(n))
    .map((n) => join(dirRel, n));
}

const gaps = [];
function pinGap(id, detail) {
  gaps.push({ id, detail });
  console.log(`GAP  ${id}  ${detail}`);
}

const GRAPH_WIRE_RE =
  /\bAiGraphRun\s*\(\s*['"]career-path['"]|\bgraphName\s*[:=]\s*['"]career-path['"]|\bcareer-path\.graph|\bbuildCareerPathGraph\b/i;

const checks = {
  'S1-http-routes-present': () => {
    const ctrl = read('apps/api/src/modules/interview/interview.controller.ts');
    assert.match(ctrl, /@Post\(':id\/career-path'\)/, 'controller POST :id/career-path');
    assert.match(ctrl, /@Get\(':id\/career-path'\)/, 'controller GET :id/career-path');
    assert.match(ctrl, /generateCareerPath\s*\(/, 'controller generateCareerPath');
    assert.match(ctrl, /getCareerPath\s*\(/, 'controller getCareerPath');
    const svc = read('apps/api/src/modules/interview/interview.service.ts');
    assert.match(svc, /generateCareerPath\s*\(\s*principal:\s*string,\s*id:\s*string\s*\)/, 'service generateCareerPath signature');
    assert.match(svc, /getCareerPath\s*\(\s*principal:\s*string,\s*id:\s*string\s*\)/, 'service getCareerPath signature');
  },

  'S2-http-is-deterministic-derive-not-graph': () => {
    const svc = read('apps/api/src/modules/interview/interview.service.ts');
    const region = (() => {
      const i = svc.indexOf('generateCareerPath(principal');
      assert.ok(i >= 0, 'generateCareerPath present');
      return svc.slice(i, i + 2200);
    })();
    assert.match(region, /\bderiveCareerPath\s*\(/, 'generateCareerPath must call deriveCareerPath');
    assert.match(
      region,
      /INSERT INTO career_path/,
      'generateCareerPath must persist career_path row',
    );
    assert.doesNotMatch(region, GRAPH_WIRE_RE, 'generateCareerPath must not wire AiGraphRun(career-path)');
    assert.doesNotMatch(
      region,
      /\benqueue\b|\bworker\b|\bdispatchGraph\b|\brunGraph\b/i,
      'generateCareerPath must not dispatch worker graph (inventory: sync derive)',
    );
    const domain = read('packages/domain/src/career.ts');
    assert.match(domain, /export function deriveCareerPath/, 'domain deriveCareerPath present');
  },

  'S3-no-career-path-graph-file': () => {
    const graphsSrc = resolve(repoRoot, 'packages/ai-graphs/src');
    assert.equal(existsSync(graphsSrc), true, 'packages/ai-graphs/src present');
    const names = readdirSync(graphsSrc);
    const careerFiles = names.filter((n) => /career-path|career_path|careerPath/i.test(n));
    assert.equal(
      careerFiles.length,
      0,
      `unexpected career-path graph file(s): ${careerFiles.join(',')}`,
    );
    const index = read('packages/ai-graphs/src/index.ts');
    assert.doesNotMatch(
      index,
      /buildCareerPathGraph|from ['"]\.\/career-path/,
      'ai-graphs index must not export career-path graph',
    );
    // report graph exists as 旁证 sibling — must remain present so we do not confuse "no graphs pkg"
    assert.match(index, /buildReportGraph|from ['"]\.\/report/, 'report graph export present (旁证≠career-path)');
  },

  'S4-no-growth-timeline-write-on-generate': () => {
    const svc = read('apps/api/src/modules/interview/interview.service.ts');
    const region = (() => {
      const i = svc.indexOf('generateCareerPath(principal');
      return svc.slice(i, i + 2200);
    })();
    assert.doesNotMatch(
      region,
      /\bCapabilityProfile\b|\bGrowthTimeline\b|\bgrowth_timeline\b|\bcapability_profile\b/i,
      'generateCareerPath must not write CapabilityProfile/GrowthTimeline',
    );
    // profile growth aggregates assessment_report only — no career_path join
    const profile = read('apps/api/src/modules/profile/profile.service.ts');
    const growthRegion = (() => {
      const i = profile.indexOf('growth(principal');
      assert.ok(i >= 0, 'profile.growth present');
      return profile.slice(i, i + 1800);
    })();
    assert.match(growthRegion, /assessment_report/, 'growth reads assessment_report');
    assert.doesNotMatch(
      growthRegion,
      /\bcareer_path\b/,
      'profile.growth must not join career_path (A2 career association absent)',
    );
  },

  'S5-no-e2e-career-path-scenario': () => {
    const e2eFiles = listFiles('e2e', (n) => n.endsWith('.e2e.ts') || n === 'full.e2e.ts');
    assert.ok(e2eFiles.length >= 1, 'e2e suite files should exist');
    for (const rel of e2eFiles) {
      const body = read(rel);
      assert.doesNotMatch(
        body,
        /career-path|career_path|TC-E2E-004|UC-E2E-004/i,
        `${rel} must not claim UC-E2E-004 career-path coverage`,
      );
    }
    // helpers dir optional scan
    const helpersDir = resolve(repoRoot, 'e2e/helpers');
    if (existsSync(helpersDir)) {
      for (const n of readdirSync(helpersDir)) {
        if (!/\.(ts|mjs|js)$/.test(n)) continue;
        const body = readFileSync(join(helpersDir, n), 'utf8');
        assert.doesNotMatch(
          body,
          /TC-E2E-004|UC-E2E-004/,
          `e2e/helpers/${n} must not pin UC-E2E-004`,
        );
      }
    }
  },

  'G-GAP-product-surface-or-pins': () => {
    const graphsSrc = resolve(repoRoot, 'packages/ai-graphs/src');
    const careerFiles = existsSync(graphsSrc)
      ? readdirSync(graphsSrc).filter((n) => /career-path|career_path|careerPath/i.test(n))
      : [];
    const svc = read('apps/api/src/modules/interview/interview.service.ts');
    const genRegion = (() => {
      const i = svc.indexOf('generateCareerPath(principal');
      return svc.slice(i, i + 2200);
    })();
    const fullGraphSurface =
      careerFiles.length > 0 ||
      GRAPH_WIRE_RE.test(genRegion) ||
      (/\bGrowthTimeline\b|\bgrowth_timeline\b/i.test(genRegion) && /INSERT/i.test(genRegion));

    if (fullGraphSurface) {
      throw new Error(
        'PRODUCT_SURFACE: career-path graph / GrowthTimeline write appears wired — refuse gap EXIT=0; wire HTTP/E2E prove (TC-E2E-004-*) instead of mark-red',
      );
    }

    pinGap(
      'GAP-UC004-E2E-MAIN',
      'TC-E2E-004-main: no e2e/*.e2e.ts HTTP/SSE scenario for career-path A1/A2 (curve ≥2 dims + growth档案关联)',
    );
    pinGap(
      'GAP-UC004-GRAPH',
      'AiGraphRun(career-path) created→active→succeeded: no career-path graph file / worker graph prove; HTTP is sync deriveCareerPath only',
    );
    pinGap(
      'GAP-UC004-GROWTH-A1A2',
      'A1/A2: generateCareerPath does not update CapabilityProfile/GrowthTimeline; profile/growth aggregates assessment_report only (no career_path association)',
    );
    pinGap(
      'GAP-UC004-FAIL-A3',
      'TC-E2E-004-fail / A3: no E2E for graph fail→AiGraphRun=failed + UI degrade + retry + quota unchanged',
    );
    pinGap(
      'GAP-UC004-UNCERTAINTY',
      'TC-E2E-004-uncertainty / E-validate-fail: dual schema+business uncertainty reject path not in e2e (model quality → ai-eval; product dual-validator gate not HTTP-proven)',
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
console.log('NOTE: releaseEvidence=false · Not HA · 本绿≠UC-E2E-004 covered · 本绿≠全链路 E2E covered');
console.log('NOTE: matrix=gap(honest) · EXIT=0=mark-red honesty ≠ A1/A2/A3 closed');
console.log('NOTE: 旁证≠covered: neg:interview · scor-00-honesty/domain career · report:prove · validate.ts · web report GET');
console.log(`CMD=pnpm -C apps/api prove:uc004-career-path EXIT=${failed === 0 ? 0 : 1}`);
process.exit(failed === 0 ? 0 : 1);
