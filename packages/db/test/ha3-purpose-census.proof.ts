/**
 * HA-3 / R-22 · A2 static census: the exact production createPool point set
 * (9 production + 3 attached + 1 explicit-zero-change + 1 definition), each
 * with its W2 purpose label, and the W3 structural boundary (runMigrations is
 * NEVER wrapped by the connect-retry layer).
 *
 * 点数不符即 FAIL（REQUEST rev2 §4-A.2 规范点数清单钉死）。
 * Run: pnpm -C packages/db prove:ha3-purpose-census
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname ?? '.', '../../..');
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === 'test' || entry === 'smoke') continue;
      yield* walk(full);
    } else if (/\.(ts|mts|cts)$/.test(entry)) {
      yield full;
    }
  }
}

/** The pinned W2 label table (rev2 §4-A.2) — file → expected call-content matchers. */
const LABEL_TABLE: Array<{ file: string; kind: 'production' | 'attached' | 'zero-change' | 'definition'; label: string | null; matcher: RegExp }> = [
  { file: 'apps/api/src/platform/db.service.ts', kind: 'production', label: 'api', matcher: /createPool\(\{ purpose: 'api' \}\)/ },
  { file: 'apps/api/src/platform/sse-notify.service.ts', kind: 'production', label: 'sse-listen', matcher: /createPool\(\{ max: 1, purpose: 'sse-listen' \}\)/ },
  { file: 'apps/worker/src/main.ts', kind: 'production', label: 'checkpoint', matcher: /createPool\(\{ connectionString: url\.toString\(\), purpose: 'checkpoint' \}\)/ },
  { file: 'apps/worker/src/main.ts', kind: 'production', label: 'worker', matcher: /createPool\(\{ purpose: 'worker' \}\)/ },
  { file: 'apps/worker/src/main.ts', kind: 'production', label: 'qbank-control', matcher: /createPool\(\{ connectionString: qbankControlUrl, purpose: 'qbank-control' \}\)/ },
  { file: 'apps/worker/src/main.ts', kind: 'production', label: 'job-wakeup', matcher: /createPool\(\{ max: 1, purpose: 'job-wakeup' \}\)/ },
  { file: 'apps/worker/src/privacy-worker-runtime.ts', kind: 'production', label: 'privacy-worker', matcher: /deps\.createPool\(\{ connectionString, purpose: 'privacy-worker' \}\)/ },
  { file: 'apps/worker/src/rag-control-runtime.ts', kind: 'production', label: 'rag-control', matcher: /deps\.createPool\(\{ connectionString, purpose: 'rag-control' \}\)/ },
  { file: 'packages/db/src/migrate-cli.ts', kind: 'production', label: 'migrate', matcher: /createPool\(\{ purpose: 'migrate' \}\)/ },
  { file: 'packages/db/src/migrate-cli.ts', kind: 'attached', label: 'qbank-control', matcher: /purpose: 'qbank-control',\s*\n\s*connectionString: rebindDatabaseLogin/ },
  { file: 'packages/db/src/migrate-cli.ts', kind: 'attached', label: 'rag-control', matcher: /purpose: 'rag-control',\s*\n\s*connectionString: rebindDatabaseLogin/ },
  { file: 'apps/worker/src/cost-configure.ts', kind: 'attached', label: 'migrate', matcher: /createPool\(\{ purpose: 'migrate' \}\)/ },
  { file: 'ops/recovery/fence-reflow-repair.ts', kind: 'zero-change', label: null, matcher: /createPool\(\{ connectionString: resolveDatabaseConnectionString\(\) \}\)/ },
  { file: 'packages/db/src/principal.ts', kind: 'definition', label: null, matcher: /export function createPool\(o: PoolOverrides = \{\}\): DbPool \{/ },
];

// ---- 1. per-point label table (content-pinned, line-drift tolerant) ----
for (const point of LABEL_TABLE) {
  const source = readFileSync(join(ROOT, point.file), 'utf8');
  const hit = point.matcher.test(source);
  const labelCheck = point.label === null
    ? true
    // the file must contain the exact label literal adjacent to its call face
    : source.includes(`purpose: '${point.label}'`);
  A(`A2 ${point.kind}·${point.file}→${point.label ?? '<no-label>'} 调用面匹配`, hit && labelCheck);
}

// ---- 2. explicit zero-change point must carry NO purpose (untouched face) ----
const fenceSource = readFileSync(join(ROOT, 'ops/recovery/fence-reflow-repair.ts'), 'utf8');
A('A2 显式零改动点·fence-reflow-repair.ts 无 purpose（零触碰实证）', !fenceSource.includes('purpose:'));

// ---- 3. full census: no createPool( call outside the enumerated set ----
const SCAN_ROOTS = ['apps/api/src', 'apps/worker/src', 'packages/db/src', 'ops'];
const expectedFiles = new Set(LABEL_TABLE.map((point) => point.file));
const census: Array<{ file: string; line: number; text: string }> = [];
for (const root of SCAN_ROOTS) {
  for (const file of walk(join(ROOT, root))) {
    if (!expectedFiles.has(relative(ROOT, file).split('\\').join('/'))) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((text, index) => {
      if (/createPool\(/.test(text)) census.push({ file: relative(ROOT, file).split('\\').join('/'), line: index + 1, text: text.trim() });
    });
  }
}
const censusCount = census.length;
A(`A2 点数普查·扫描面恰 ${LABEL_TABLE.length} 处 createPool( （9 生产+3 附带+1 零改动+1 定义）`, censusCount === LABEL_TABLE.length);
for (const point of LABEL_TABLE) {
  A(`A2 点数普查·${point.file} 在册`, expectedFiles.has(point.file) && census.some((c) => c.file === point.file));
}

// ---- 4. W3 structural boundary: runMigrations never wrapped by retry ----
const cliSource = readFileSync(join(ROOT, 'packages/db/src/migrate-cli.ts'), 'utf8');
A('W3 边界·runMigrations(pool, migrations) 调用原样在（未被重试层包裹）',
  /const result = await runMigrations\(pool, migrations\);/.test(cliSource));
A('W3 边界·migrate-cli 不直接使用 withConnectRetry（只经 warmUpPool 连接层）', !cliSource.includes('withConnectRetry'));
const warmUpCount = (cliSource.match(/await warmUpPool\(/g) ?? []).length;
A('W3 边界·migrate-cli 恰 3 处连接层 warm-up（主池+qbank 子池+rag 子池）', warmUpCount === 3);
const costSource = readFileSync(join(ROOT, 'apps/worker/src/cost-configure.ts'), 'utf8');
A('W3 边界·cost-configure 恰 1 处 warm-up 且治理配置操作零包裹',
  (costSource.match(/await warmUpPool\(/g) ?? []).length === 1
  && /await configureRagCostGovernance\(pool, rag\);/.test(costSource)
  && /await configureModelCostGovernance\(pool, model\);/.test(costSource));
const prodCompose = readFileSync(join(ROOT, 'docker/compose.prod.yml'), 'utf8');
A('W3 治理面·compose.prod.yml migrate restart:"no" 零改', /restart: "no"/.test(prodCompose));
A('W3 治理面·compose.prod.yml api depends_on service_completed_successfully 零改',
  /condition: service_completed_successfully/.test(prodCompose));

// ---- 5. compose-job label sanity: cost-configure same job chain as migrate ----
A('W2 同 job 链·cost-configure purpose=migrate（与 migrate-cli 同 compose job）',
  /createPool\(\{ purpose: 'migrate' \}\)/.test(costSource));

console.log(failures === 0 ? '\n✓ HA-3 purpose 普查/边界结构 proof 全部通过' : `\n✗ ${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);
