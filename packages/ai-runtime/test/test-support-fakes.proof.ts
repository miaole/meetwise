/**
 * #74 边界证明（5E 批量清理刀·裁决项⑥「边界 prove」形）——fake 族生产包边界。
 *
 * 断言面（5E REQUEST §2-5 全域口径）：
 *   P1  生产主入口源（src/index.ts·注释剥离）零 fake 名残留（fakeAsr/fakeTts/fakeEmbedder/
 *       fakeStreamingAsr/fakeStreamingTts 五名全域）；
 *   P2  package.json exports 含 './test-support' → './test/support/fakes.ts'（子路径在位）；
 *   P3  运行时负测：主入口命名空间五 fake 名全缺席（越线 import 拿到 undefined——必红形）；
 *   P4  运行时正测：test-support 子路径五 fake 名全在且可调用；
 *   P5  生产 src 静态扫描（注释剥离）：除三个 fake 定义宿主模块（voice.ts/embedder.ts/
 *       voice-stream.ts——实现体留置处）外，全仓生产源零 fake 名引用；
 *   P6  exports map 封闭性：仅 "./" + 三个 test-support 子路径，无 "./src/*" 深导出逃生口。
 *
 *   pnpm -C packages/ai-runtime prove:test-support-fakes
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as entry from '../src/index.ts';
import * as fakes from './support/fakes.ts';

const here = resolve(dirname(fileURLToPath(import.meta.url)), '..');   // packages/ai-runtime
const repoRoot = resolve(here, '../..');

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

const FAKE_NAMES = ['fakeAsr', 'fakeTts', 'fakeEmbedder', 'fakeStreamingAsr', 'fakeStreamingTts'] as const;
const DEFINITION_HOSTS = new Set(['voice.ts', 'embedder.ts', 'voice-stream.ts']);   // fake 实现体留置的三个 src 模块

/** 注释剥离（行注释+块注释）：防「勘误注里提及 fake 名」造成假红（沿 g7-bootstrap-zero-prod-import 先例）。 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

// P1 主入口源零 fake 名
const indexSrc = stripComments(readFileSync(join(here, 'src/index.ts'), 'utf8'));
const p1residual = FAKE_NAMES.filter((n) => indexSrc.includes(n));
A('P1 主入口 src/index.ts 零 fake 导出名（全域五名·注释剥离后）', p1residual.length === 0);

// P2 exports 子路径在位
const pkg = JSON.parse(readFileSync(join(here, 'package.json'), 'utf8'));
A("P2 package.json exports './test-support' → './test/support/fakes.ts'", pkg?.exports?.['./test-support'] === './test/support/fakes.ts');

// P3 运行时负测：主入口命名空间五名缺席
const p3leaked = FAKE_NAMES.filter((n) => n in (entry as Record<string, unknown>));
A('P3 主入口运行时命名空间零 fake（越线 import 拿 undefined）', p3leaked.length === 0);

// P4 运行时正测：test-support 子路径五名全在且可调用
const p4missing = FAKE_NAMES.filter((n) => {
  const v = (fakes as Record<string, unknown>)[n];
  return typeof v !== 'function';
});
A('P4 test-support 子路径五 fake 全在且为函数', p4missing.length === 0);

// P5 生产 src 静态扫描（定义宿主三模块除外）
function* walkTs(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walkTs(p);
    else if (name.endsWith('.ts')) yield p;
  }
}
const productionRoots = [
  join(here, 'src'),
  join(repoRoot, 'apps/api/src'),
  join(repoRoot, 'apps/worker/src'),
  join(repoRoot, 'packages/domain/src'),
  join(repoRoot, 'packages/contracts/src'),
  join(repoRoot, 'packages/db/src'),
];
const p5hits: string[] = [];
for (const root of productionRoots) {
  for (const file of walkTs(root)) {
    if (DEFINITION_HOSTS.has(file.split('/').pop() ?? '') && root === join(here, 'src')) continue;   // 实现体宿主豁免
    const stripped = stripComments(readFileSync(file, 'utf8'));
    for (const n of FAKE_NAMES) if (stripped.includes(n)) p5hits.push(`${file} :: ${n}`);
  }
}
A('P5 生产源零 fake 引用（三定义宿主除外·注释剥离后）', p5hits.length === 0);
if (p5hits.length) console.log('  残留明细:', p5hits);

// P6 exports 封闭性（无深导出逃生口）
const exportKeys = Object.keys(pkg?.exports ?? {});
const P6_ALLOWED = new Set(['.', './g7-bootstrap', './g7-bootstrap.ts', './g7-test-support', './test-support']);
const p6ok = exportKeys.length === P6_ALLOWED.size && exportKeys.every((k) => P6_ALLOWED.has(k));
A('P6 exports map 封闭：仅主入口+test-support/g7 三族子路径（无 ./src/* 逃生口）', p6ok);

console.log(`\n${fail === 0 ? '✓ test-support-fakes 边界证明全部通过' : '✗ ' + fail + ' 项失败'}`);
process.exit(fail === 0 ? 0 : 1);
