/** AG-16 残② proof：recursionLimit 纪实收口（compile 死键移除终树态+装版契约+默认阀兜底三事实）。
 *  蓝本=ai-docs/delivery/harness/ag16-resume-proof-REQUEST.md §1-件②（§9-rev 修正后定稿文本）·
 *  静态断言形制沿 packages/ai-runtime/test/model-slot-bypass.static.proof.ts（needle 内容集+负例）。
 *  C1 graph.ts 恰一 .compile( 且实参恰 { checkpointer }；C2 图包 src recursionLimit 键形零命中+
 *  注释叙事命中恰四 needle 内容集（graph.ts 三处+generate-question.ts 一处）；C3 装版 version 与
 *  catalog 双向钉 1.4.7；C4 装版 dist/graph/state.js recursionLimit 零命中（compile 契约不收该键）；
 *  C5 装版 dist/pregel/utils/config.js DEFAULT_RECURSION_LIMIT = 25+CONFIG_KEYS 含 recursionLimit
 *  （invoke 侧默认 25 恒兜底）；C6 行为纪实：test-only 自环 StateGraph 缺省 config invoke →
 *  GraphRecursionError 确定性抛出（instanceof 与消息 contains 'Recursion limit of 25' 双钉·禁全串等值）。
 *  纪律：装版定位走 createRequire(import.meta.url).resolve（禁 .pnpm 哈希硬编码）·装版缺失/dist 读
 *  失败=红（禁 skip-as-pass）。no-DB no-网络零外呼。 pnpm prove:adaptive-compile-contract */
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Annotation, GraphRecursionError, START, StateGraph } from '@langchain/langgraph';

let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

const SRC_ROOT = fileURLToPath(new URL('../src', import.meta.url));
const CATALOG_PATH = fileURLToPath(new URL('../../../pnpm-workspace.yaml', import.meta.url));

const listTsFiles = (root: string): string[] => {
  const found: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) found.push(...listTsFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.ts')) found.push(full);
  }
  return found;
};

/* ── C1：graph.ts 恰一 .compile( 且实参恰 { checkpointer }（死键移除终树态）── */
const graphSrc = readFileSync(join(SRC_ROOT, 'adaptive-interview/graph.ts'), 'utf8');
const compileCallCount = [...graphSrc.matchAll(/\.compile\s*\(/g)].length;
A('C1 graph.ts 恰一 .compile( 调用', compileCallCount === 1);
A('C1 compile 实参恰 { checkpointer }（死键移除终树态·CIW2 偏离⑦）', graphSrc.includes('.compile({ checkpointer })'));
A('C1 负例:再置 recursionLimit 键即失配（needle 有牙）',
  !graphSrc.replace('.compile({ checkpointer })', '.compile({ checkpointer, recursionLimit: 25 })').includes('.compile({ checkpointer })'));

/* ── C2：图包 src recursionLimit 键形零命中+注释叙事恰四 needle 内容集（防死键回潮）── */
const KEY_SHAPE = /\brecursionLimit\s*:/;
const tsFiles = listTsFiles(SRC_ROOT);
const keyShapeHits = tsFiles.filter((file) => KEY_SHAPE.test(readFileSync(file, 'utf8')));
A('C2 图包 src recursionLimit 键形（recursionLimit:）零命中（死键零回潮）', keyShapeHits.length === 0);
const graphNeedles = [
  'recursionLimit 上限',
  'recursionLimit（interrupt resume 重置计数',
  'recursionLimit 形参',
];
const generateNeedle = 'recursionLimit+连续帽双层防放大';
const graphWordCount = (graphSrc.match(/recursionLimit/g) ?? []).length;
const generateSrc = readFileSync(join(SRC_ROOT, 'adaptive-interview/nodes/generate-question.ts'), 'utf8');
const generateWordCount = (generateSrc.match(/recursionLimit/g) ?? []).length;
A('C2 注释叙事 needle 内容集:graph.ts 三处在场', graphNeedles.every((needle) => graphSrc.includes(needle)));
A('C2 注释叙事 needle 内容集:generate-question.ts 一处在场', generateSrc.includes(generateNeedle));
A('C2 词面计数恰 3+1（键形与叙事面零漂移）', graphWordCount === 3 && generateWordCount === 1);
const otherFiles = tsFiles.filter((file) => !file.endsWith('adaptive-interview/graph.ts') && !file.endsWith('adaptive-interview/nodes/generate-question.ts'));
const otherHits = otherFiles.filter((file) => readFileSync(file, 'utf8').includes('recursionLimit'));
A('C2 图包 src 其余文件 recursionLimit 词面零命中', otherHits.length === 0);
A('C2 负例:键形注入即命中（防恒真假绿）', KEY_SHAPE.test(`${graphSrc}\nconst compile = recursionLimit: 25;`));

/* ── C3+C4+C5：装版定位（createRequire 动态·禁 .pnpm 哈希硬编码）+三事实纪实 ── */
const requireFromHere = createRequire(import.meta.url);
const installedPkgPath = requireFromHere.resolve('@langchain/langgraph/package.json');
const installedPkg = JSON.parse(readFileSync(installedPkgPath, 'utf8')) as { version: string };
const catalogSrc = readFileSync(CATALOG_PATH, 'utf8');
A('C3 catalog 钉版 1.4.7 在卷（pnpm-workspace.yaml）', catalogSrc.includes("'@langchain/langgraph': 1.4.7"));
A('C3 装版 package.json version 恒等 catalog（1.4.7 双向钉）', installedPkg.version === '1.4.7');
const installedRoot = join(installedPkgPath, '..');
const stateJsPath = join(installedRoot, 'dist/graph/state.js');
const stateJs = readFileSync(stateJsPath, 'utf8');
A('C4 装版 dist/graph/state.js recursionLimit 零命中（compile 选项契约不收该键）', !stateJs.includes('recursionLimit'));
A('C4 负例:同一 include 检测器非恒假（变异文本必被检出·needle 有牙）', (stateJs.slice(0, 200) + 'recursionLimit').includes('recursionLimit'));
const configJsPath = join(installedRoot, 'dist/pregel/utils/config.js');
const configJs = readFileSync(configJsPath, 'utf8');
A('C5 装版 dist/pregel/utils/config.js DEFAULT_RECURSION_LIMIT = 25 在卷', configJs.includes('DEFAULT_RECURSION_LIMIT = 25'));
A('C5 CONFIG_KEYS 含 recursionLimit（invoke 侧 config 键）', configJs.includes('"recursionLimit"'));
A('C5 invoke 侧缺省装配 recursionLimit: DEFAULT_RECURSION_LIMIT（默认 25 恒兜底）',
  configJs.includes('recursionLimit: DEFAULT_RECURSION_LIMIT'));

/* ── C6：行为纪实——test-only 自环小图缺省 config invoke → GraphRecursionError（默认阀生效）── */
const LOOP_STATE = Annotation.Root({
  n: Annotation<number>({ reducer: (_a, b) => b, default: () => 0 }),
});
const loopGraph = new StateGraph(LOOP_STATE)
  .addNode('spin', () => ({ n: 1 }))
  .addEdge(START, 'spin')
  .addEdge('spin', 'spin')
  .compile();
let recursionError: unknown = null;
try {
  await loopGraph.invoke({}, { configurable: { ['thread_id']: 'ag16-compile-contract-c6-self-loop' } });
} catch (e) {
  recursionError = e;
}
const isRecursionError = recursionError instanceof GraphRecursionError;
const recursionMessage = recursionError instanceof Error ? recursionError.message : '';
A('C6 缺省 config invoke 自环小图 → GraphRecursionError 确定性抛出（instanceof 钉）', isRecursionError);
A('C6 消息钉 contains \'Recursion limit of 25\'（默认阀 25 生效纪实·禁全串等值）',
  isRecursionError && recursionMessage.includes('Recursion limit of 25'));

console.log(fail ? `\n✗ ${fail} adaptive-compile-contract failed` : '\n✓ adaptive-compile-contract: recursionLimit 纪实三事实+行为阀全通过');
process.exit(fail ? 1 : 0);
