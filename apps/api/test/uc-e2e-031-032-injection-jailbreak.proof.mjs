#!/usr/bin/env node
/**
 * UC-E2E-031 / 032 — 注入越狱 / 诱导造假（eval-first honesty · no fake-model e2e pass）
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ UC-E2E-031/032 covered · 本绿 ≠ 全链路 E2E covered
 * 矩阵保持 **gap**(e2e) / **partial**(eval)；EXIT=0 = 诚实钉（禁 e2e fake-model 冒充安全闭环）
 * 质量断言归 ai-eval；抬到 covered = ai-eval suite + gates，不是 e2e
 *
 * 搜码结论（本树）：
 *   - Spec：e2e-scenarios UC-E2E-031/032 明示 model-resist / no-fabricate → ai-eval
 *   - e2e：无 UC-031/032 / TC-E2E-031-model-resist / TC-E2E-032-no-fabricate-model 假绿
 *   - 旁证≠covered：golden-tasks/ · scoring:eval · TC-AIIV-002 / TC-RES-012 / TC-quiz-078
 *     · safety-defense-in-depth · e2e-fake-service-flags (E2E_FAKE_MODEL forbid)
 *   - GuardrailHit：status-machine 新增对象；无 runtime 表/e2e 钉本行 covered
 *
 * 若 e2e 用 fake-model / E2E_FAKE_MODEL 宣称 jailbreak/造假安全闭环 → 拒 EXIT=0
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

function walkFiles(dirRel, pred, acc = []) {
  const abs = resolve(repoRoot, dirRel);
  if (!existsSync(abs)) return acc;
  for (const name of readdirSync(abs, { withFileTypes: true })) {
    const rel = join(dirRel, name.name);
    if (name.isDirectory()) {
      if (name.name === 'node_modules' || name.name === 'dist') continue;
      walkFiles(rel, pred, acc);
    } else if (pred(name.name)) {
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

const UC031_032_RE = /UC-E2E-031|UC-E2E-032|TC-E2E-031|TC-E2E-032/;
const FAKE_JAILBREAK_PASS_RE =
  /E2E_FAKE_MODEL[\s\S]{0,200}(jailbreak|越狱|model-resist|no-fabricate|诱导造假)|fake[-_ ]?model[\s\S]{0,120}(jailbreak|越狱|抗注入|不造假).{0,80}(pass|covered|通过|闭环)/i;
const CLAIM_COVERED_VIA_E2E_RE =
  /UC-E2E-03[12][^\n]{0,120}(e2e[^\n]{0,40})?(covered|已覆盖|安全闭环)|e2e[^\n]{0,80}(fake[-_ ]?model|E2E_FAKE_MODEL)[^\n]{0,80}(031|032|jailbreak|越狱|造假).{0,40}(covered|通过)/i;

const checks = {
  'S1-scenarios-layer-split-ai-eval': () => {
    const scenarios = read('ai-docs/requirements/use-cases/e2e-scenarios.md');
    assert.match(scenarios, /UC-E2E-031/, 'e2e-scenarios defines UC-E2E-031');
    assert.match(scenarios, /UC-E2E-032/, 'e2e-scenarios defines UC-E2E-032');
    assert.match(scenarios, /TC-E2E-031-model-resist/, 'scenarios list TC-E2E-031-model-resist');
    assert.match(scenarios, /TC-E2E-032-no-fabricate-model/, 'scenarios list TC-E2E-032-no-fabricate-model');
    assert.match(
      scenarios,
      /TC-E2E-031-model-resist[\s\S]{0,80}\*\*ai-eval\*\*|ai-eval[\s\S]{0,40}抗注入/,
      '031 model-resist routed to ai-eval (not e2e)',
    );
    assert.match(
      scenarios,
      /TC-E2E-032-no-fabricate-model[\s\S]{0,80}\*\*ai-eval\*\*|不造假[\s\S]{0,40}ai-eval/,
      '032 no-fabricate routed to ai-eval (not e2e)',
    );
    assert.match(
      scenarios,
      /移出 e2e → ai-eval|fake-model[\s\S]{0,80}无法证明模型抵抗|→ ai-eval/,
      'scenarios honesty: forbid e2e fake-model as model-quality proof',
    );
  },

  'S2-e2e-must-not-claim-031-032-via-fake-model': () => {
    const full = read('e2e/full.e2e.ts');
    assert.doesNotMatch(full, UC031_032_RE, 'full.e2e must not pin UC/TC-E2E-031/032');
    assert.doesNotMatch(full, FAKE_JAILBREAK_PASS_RE, 'full.e2e must not fake-model jailbreak/fabricate pass');
    assert.doesNotMatch(full, CLAIM_COVERED_VIA_E2E_RE, 'full.e2e must not claim 031/032 covered');

    const e2eFiles = walkFiles('e2e', (n) => /\.(ts|mjs|js)$/.test(n));
    assert.ok(e2eFiles.length >= 1, 'e2e tree present');
    for (const rel of e2eFiles) {
      const body = read(rel);
      assert.doesNotMatch(body, UC031_032_RE, `${rel} must not pin UC/TC-E2E-031/032`);
      assert.doesNotMatch(body, FAKE_JAILBREAK_PASS_RE, `${rel}: no fake-model jailbreak pass`);
      assert.doesNotMatch(
        body,
        /model-resist|no-fabricate-model|抗注入成功|不造假成功/,
        `${rel}: must not host ai-eval quality assertions`,
      );
    }
  },

  'S3-旁证-golden-tasks-ai-eval-paths': () => {
    const gtReadme = read('ai-docs/testing/golden-tasks/README.md');
    assert.match(gtReadme, /releaseEvidence\s*=\s*false/i, 'golden-tasks README pins releaseEvidence=false');
    assert.match(gtReadme, /scoring:eval/, 'golden-tasks cites scoring:eval as quality layer (非 covering)');
    assert.match(gtReadme, /ai-output|subject/, 'golden-tasks distinguishes ai-output vs mechanism');

    const registry = read('ai-docs/testing/golden-tasks/registry.json');
    assert.match(registry, /"schemaVersion"\s*:\s*2/, 'golden-tasks registry schemaVersion=2');
    assert.match(registry, /scoring:eval/, 'registry lists scoring:eval related (inconclusive)');

    const pkg = read('package.json');
    assert.match(pkg, /"scoring:eval"\s*:/, 'root package.json wires scoring:eval');
    assert.match(pkg, /"golden-tasks:check"\s*:/, 'root package.json wires golden-tasks:check');
    assert.match(pkg, /"golden-tasks:prove"\s*:/, 'root package.json wires golden-tasks:prove');

    const trace = read('ai-docs/testing/traceability-baseline.json');
    assert.match(trace, /TC-E2E-031-model-resist/, 'traceability lists TC-E2E-031-model-resist');
    assert.match(trace, /TC-E2E-032-no-fabricate-model/, 'traceability lists TC-E2E-032-no-fabricate-model');
    assert.match(trace, /TC-AIIV-002-jailbreak/, '旁证 TC-AIIV-002-jailbreak present');
    assert.match(trace, /TC-RES-012-jailbreak-eval/, '旁证 TC-RES-012-jailbreak-eval present');
    assert.match(trace, /TC-quiz-078-jailbreak/, '旁证 TC-quiz-078-jailbreak present');

    const safety = read('ai-docs/rules/ai/safety-defense-in-depth.md');
    assert.match(safety, /越狱|jailbreak|注入/, 'safety-defense-in-depth covers jailbreak/injection');
    assert.match(safety, /诱导造假/, 'safety-defense-in-depth covers fabrication');
    assert.match(
      safety,
      /不用 fake model 证安全|对真实候选模型跑|release-gate/,
      'safety rule: real-model eval, not fake model',
    );

    // domain graph-fake-model 旁证 ≠ UC-031/032 model quality covered
    const quizUc = read('ai-docs/requirements/use-cases/cend-quiz.md');
    assert.match(quizUc, /TC-quiz-078-jailbreak/, 'cend-quiz lists graph-fake-model jailbreak TC (旁证)');
    assert.match(
      quizUc,
      /graph-fake-model|假模型/,
      'quiz jailbreak TC is graph-fake-model mechanism — ≠ production model resist',
    );
  },

  'S4-fake-model-forbid-guards': () => {
    const flags = read('scripts/e2e-fake-service-flags.mjs');
    assert.match(flags, /E2E_FAKE_MODEL/, 'e2e-fake-service-flags lists E2E_FAKE_MODEL');
    assert.match(flags, /assertNoFakeServiceFlags/, 'assertNoFakeServiceFlags exported');
    assert.match(flags, /fake_service_mode_forbidden/, 'fail-closed reason present');

    const guards = read('scripts/e2e-static-guards.mjs');
    assert.match(guards, /E2E_FAKE_MODEL/, 'e2e-static-guards scans E2E_FAKE_MODEL');
    assert.match(guards, /assertNoFakeServiceFlags/, 'static-guards require assertNoFakeServiceFlags');

    const honesty = read('ai-docs/skills/testing/honesty-rules.md');
    assert.match(honesty, /E2E_FAKE_MODEL/, 'honesty-rules forbid E2E_FAKE_MODEL for live evidence');
  },

  'S5-matrix-gap-e2e-partial-eval': () => {
    const matrix = read('ai-docs/delivery/e2e-requirement-coverage-matrix.md');
    assert.match(matrix, /UC-E2E-031\s*\/\s*032/, 'matrix has UC-E2E-031 / 032 row');
    assert.match(
      matrix,
      /UC-E2E-031\s*\/\s*032[^\n]*\*\*gap\*\*\(e2e\)\s*\/\s*\*\*partial\*\*\(eval\)/,
      'matrix keeps gap(e2e)/partial(eval)',
    );
    assert.doesNotMatch(
      matrix,
      /UC-E2E-031\s*\/\s*032[^\n]*\*\*covered\*\*/,
      'matrix must not claim 031/032 covered',
    );
    assert.match(
      matrix,
      /勿用 e2e fake-model 冒充|禁假模型冒充|质量断言归 ai-eval/,
      'matrix notes quality → ai-eval, forbid fake-model e2e',
    );
  },

  'S6-GuardrailHit-TARGET-vs-unwired': () => {
    const sm = read('ai-docs/rules/global/status-machine.md');
    assert.match(sm, /GuardrailHit/, 'status-machine names GuardrailHit');

    const scenarios = read('ai-docs/requirements/use-cases/e2e-scenarios.md');
    assert.match(scenarios, /GuardrailHit\(injection\/jailbreak\)|GuardrailHit\(fabrication\)/, 'scenarios name GuardrailHit kinds');

    // No migration CREATE for guardrail_hit / guard_events as product wire for this UC
    const migDir = resolve(repoRoot, 'packages/db/migrations');
    assert.equal(existsSync(migDir), true, 'migrations present');
    let tableHit = null;
    for (const name of readdirSync(migDir).filter((n) => n.endsWith('.sql'))) {
      const body = readFileSync(join(migDir, name), 'utf8');
      if (/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(?:guardrail_hit|guard_events)\b/i.test(body)) {
        tableHit = name;
        break;
      }
    }
    // If tables appear later, honesty pin still forbids e2e fake-model quality pass;
    // but this S6 expects current unwired inventory for audit path of 031/032.
    assert.equal(tableHit, null, `inventory: no GuardrailHit runtime table yet (found ${tableHit})`);
  },

  'G-GAP-honesty-pins': () => {
    // Fail-closed: if e2e somehow claims fake jailbreak covered, refuse EXIT=0
    const e2eFiles = walkFiles('e2e', (n) => /\.(ts|mjs|js)$/.test(n));
    const fakePass = e2eFiles.find((rel) => {
      const body = read(rel);
      return FAKE_JAILBREAK_PASS_RE.test(body) || CLAIM_COVERED_VIA_E2E_RE.test(body);
    });
    if (fakePass) {
      throw new Error(
        `FAKE_MODEL_CLAIM: ${fakePass} appears to claim 031/032 jailbreak/fabricate safety via fake-model — refuse honesty EXIT=0; remove claim and route quality to ai-eval`,
      );
    }

    pinGap(
      'GAP-UC031-E2E-STRUCTURE',
      'TC-E2E-031-escape / TC-E2E-031-biz-reject: e2e/integration structure surface (DOM escape + biz reject + GuardrailHit) still unwired in e2e/* — gap(e2e)',
    );
    pinGap(
      'GAP-UC031-AI-EVAL',
      'TC-E2E-031-model-resist: production-model injection resist belongs to ai-eval suite + release-gate thresholds — not e2e; fake-model forbidden',
    );
    pinGap(
      'GAP-UC032-FABRICATE-REJECT',
      'TC-E2E-032-fabricate-reject: factuality biz-reject + GuardrailHit(fabrication) integration still gap(e2e)',
    );
    pinGap(
      'GAP-UC032-AI-EVAL',
      'TC-E2E-032-no-fabricate-model: production-model no-fabricate belongs to ai-eval — not e2e fake-model',
    );
    pinGap(
      'GAP-UC031-032-FAKE-MODEL-BAN',
      'Honesty: e2e must NEVER claim 031/032 covered via E2E_FAKE_MODEL / fake-model jailbreak pass; quality → ai-eval track',
    );
    pinGap(
      'GAP-UC031-032-GUARDRAIL',
      'GuardrailHit append-only audit (injection/jailbreak/fabrication) runtime table/API = 0; status-machine names object; ≠ covered',
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
console.log('NOTE: releaseEvidence=false · Not HA · 本绿≠UC-E2E-031/032 covered · 本绿≠全链路 E2E covered');
console.log('NOTE: matrix=gap(e2e)/partial(eval) · EXIT=0=honesty pin ≠ fake jailbreak pass · ≠ covered');
console.log('NOTE: 抬到 covered = ai-eval suite + gates（非 e2e）');
console.log('NOTE: 旁证≠covered: golden-tasks/ · scoring:eval · TC-AIIV-002 · TC-RES-012 · TC-quiz-078 · safety-defense-in-depth · E2E_FAKE_MODEL forbid');
console.log(`CMD=pnpm -C apps/api prove:uc031-032-injection-jailbreak EXIT=${failed === 0 ? 0 : 1}`);
process.exit(failed === 0 ? 0 : 1);
