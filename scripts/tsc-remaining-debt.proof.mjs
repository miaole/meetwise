#!/usr/bin/env node
/**
 * A-P0-TSC 剩余债清单元（fail-closed，不假绿）。
 * - 每个含 .ts/.tsx 的 workspace 必须已在 ci.yml typecheck 选择面，或属于本清单登记范围的包。
 * - 无 TS 源的包必须登记在 noTsSources；一旦出现 .ts/.tsx 即红。
 * - 清单指纹（file:line:col:TScode）必须与当前 tsc 输出全等：增债或默默修好都不许悄悄过。
 * - 空指纹范围（worker fc/evidence）必须保持 0 错。
 * 反证：在 smoke 下种植临时类型错误 → 本证明 EXIT 1；删除后 EXIT 0。
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = join(root, 'scripts/tsc-remaining-debt.json');
const ciPath = join(root, '.github/workflows/ci.yml');
const PROBE = 'tsconfig.l7-debt-probe.json';
let failures = 0;
const A = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !detail ? '' : ` — ${detail}`}`);
  if (!ok) failures += 1;
};

const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
const ciText = readFileSync(ciPath, 'utf8');
const expectMatch = ciText.match(/const expect=(\[[^\]]+\])/);
if (!expectMatch) {
  A('ci.yml 含 typecheck 选择面 expect 数组', false, '未解析到 const expect=[...]');
  process.exit(1);
}
const ciExpect = Function(`return ${expectMatch[1]}`)();
A('ci.yml 选择面是 11 个已点亮零错任务', Array.isArray(ciExpect) && ciExpect.length === 11, JSON.stringify(ciExpect));

const workspaces = [];
const walkPkg = (dir) => {
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) return;
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  workspaces.push({ dir, rel: relative(root, dir) || '.', name: pkg.name ?? 'meetwise', scripts: pkg.scripts ?? {} });
};
walkPkg(root);
for (const sub of ['apps', 'packages']) {
  const base = join(root, sub);
  if (!existsSync(base)) continue;
  for (const ent of readdirSync(base)) {
    const d = join(base, ent);
    if (statSync(d).isDirectory()) walkPkg(d);
  }
}

const isTsFile = (name) => /\.(ts|tsx)$/.test(name) && !name.endsWith('.d.ts');
const dirHasTs = (dir) => {
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let ents;
    try { ents = readdirSync(cur, { withFileTypes: true }); } catch { continue; }
    for (const ent of ents) {
      if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.next' || ent.name === 'coverage') continue;
      const p = join(cur, ent.name);
      if (ent.isDirectory()) stack.push(p);
      else if (isTsFile(ent.name)) return true;
    }
  }
  return false;
};

const noTs = new Set(inventory.noTsSources ?? []);
const debtPackages = new Set(Object.values(inventory.scopes).map((s) => s.package));

for (const ws of workspaces) {
  const hasTs = dirHasTs(ws.dir);
  const rel = ws.rel === '.' ? '.' : ws.rel;
  if (!hasTs) {
    if (rel === '.') continue; // 根仓的 TS 在 e2e/，由 //#typecheck 覆盖
    A(`${rel} 无 TS 源且登记在 noTsSources`, noTs.has(rel), `未登记或仍有 TS：${rel}`);
    continue;
  }
  noTs.delete(rel);
  const taskId = rel === '.' ? '//#typecheck' : `${ws.name}#typecheck`;
  const lit = ciExpect.includes(taskId);
  const inDebt = debtPackages.has(rel) || (rel === '.' && debtPackages.has('.'));
  const hasScript = typeof ws.scripts.typecheck === 'string' && ws.scripts.typecheck.length > 0;
  if (lit) {
    A(`${rel} 已在选择面且有 typecheck script`, hasScript, taskId);
  } else if (inDebt) {
    A(`${rel} 未点亮但已登记剩余债（不假绿）`, true);
  } else {
    A(`${rel} 有 TS 则必须在选择面或剩余债清单`, false, taskId);
  }
}
for (const leftover of noTs) {
  A(`noTsSources 条目仍无 TS：${leftover}`, !dirHasTs(join(root, leftover)), '登记过时，包已有 TS 源');
}

const parseFingerprints = (output, prefix) => {
  const items = [];
  for (const line of output.split(/\r?\n/)) {
    const m = /^(.+)\((\d+),(\d+)\): error (TS\d+):/.exec(line);
    if (!m) continue;
    if (prefix && !m[1].startsWith(prefix)) continue;
    items.push(`${m[1]}:${m[2]}:${m[3]}:${m[4]}`);
  }
  return items;
};

const runScope = (scope) => {
  const cwd = join(root, scope.package);
  const probe = join(cwd, PROBE);
  writeFileSync(probe, `${JSON.stringify({ ...scope.tsconfig }, null, 2)}\n`);
  try {
    const r = spawnSync('pnpm', ['exec', 'tsc', '-p', PROBE, '--noEmit', '--pretty', 'false'], {
      cwd,
      encoding: 'utf8',
      env: process.env,
    });
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    return parseFingerprints(out, scope.fingerprintFilterPrefix);
  } finally {
    rmSync(probe, { force: true });
  }
};

const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

for (const [name, scope] of Object.entries(inventory.scopes)) {
  const actual = runScope(scope);
  const expected = scope.fingerprints ?? [];
  A(
    `${name} 指纹全等（${expected.length}）`,
    same(actual, expected),
    `expected=${expected.length} actual=${actual.length}`
      + (same(actual, expected) ? '' : `; onlyActual=${actual.filter((x) => !expected.includes(x)).slice(0, 8).join(',') || '∅'}`
        + `; onlyExpected=${expected.filter((x) => !actual.includes(x)).slice(0, 8).join(',') || '∅'}`),
  );
}

// 反证：种植临时类型错误，指纹必须变红；清理后必须恢复。
const mutDir = join(root, 'apps/worker/smoke');
const mutFile = join(mutDir, 'l7-tsc-remaining-debt-mut.ts');
const mutScope = inventory.scopes['apps/worker/smoke'];
try {
  writeFileSync(mutFile, 'export const l7TscMut: string = 1;\n');
  const mutated = runScope(mutScope);
  const grew = mutated.length > mutScope.fingerprints.length
    && mutated.some((fp) => fp.startsWith('smoke/l7-tsc-remaining-debt-mut.ts:') && fp.endsWith(':TS2322'));
  A('反证：smoke 种植类型错误后指纹增多且命中 MUT 文件', grew, `actual=${mutated.length}`);
} finally {
  rmSync(mutFile, { force: true });
}
const restored = runScope(mutScope);
A('反证还原：删除 MUT 文件后 smoke 指纹恢复', same(restored, mutScope.fingerprints), `actual=${restored.length}`);

if (failures > 0) {
  console.error(`tsc-remaining-debt: ${failures} FAIL`);
  process.exit(1);
}
console.log('tsc-remaining-debt: all PASS');
