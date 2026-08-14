/**
 * context-window.proof — **压缩窗口门禁**(用户明确要:"测试压缩用 200K 或更低的窗口,必须测好")。
 * 承重断言:不管总上下文多大(50K→200K 字),`capUserData` 把**每次模型调用的 data 块**摁在 per-service 上限内,
 *   换算 token 后必须落在各档窗口预算内(200K/128K/32K)。这与"per-turn 隔离(模型不带累积 transcript)"一起,
 *   保证**单次调用输入与对话/简历总规模解耦** → 长会话/超长简历都不爆模型窗口。
 * 纯函数,无 DB / 无模型 / 无需 pkill。用法:pnpm window:prove
 */
import { capUserData } from '@meetwise/ai-runtime';

let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };

// 保守 token 估算(中英混合 ~0.6 token/char)+ system 前缀余量。
const toks = (chars: number) => Math.ceil(chars * 0.6) + 300;
// per-service data 上限(与 model-client capUserData 内部一致)。
const SERVICES: Record<string, number> = {
  'mock-interview.evaluate': 12_000,
  'interviewer.ask': 16_000,
  'report.generate': 8_000,
  'resume-quiz.generate': 20_000,
};
const WINDOWS = { '200K': 200_000, '128K': 128_000, '32K': 32_000 };
const HUGE = '分布式锁与限流的工程取舍与线上踩坑'.repeat(20_000);   // ~36 万字,远超任何真实输入

console.log('=== capUserData:超大输入 → 单次调用 data 块恒被摁在 per-service 上限内 ===');
for (const [svc, cap] of Object.entries(SERVICES)) {
  const out = capUserData(HUGE, svc);
  A(`${svc}:36万字输入 → data ≤ ${cap}(实际 ${out.length})`, out.length <= cap);
}

console.log('\n=== 与总上下文规模解耦:50K/100K/200K 字输入 → 同一服务输出长度恒定 ===');
for (const svc of Object.keys(SERVICES)) {
  const sizes = [50_000, 100_000, 200_000].map((n) => capUserData('字'.repeat(n), svc).length);
  A(`${svc}:输出与输入规模无关(${sizes.join('/')} 应全相等)`, new Set(sizes).size === 1);
}

console.log('\n=== 单次调用 token 落在各档窗口预算内(200K/128K/32K) ===');
for (const [svc, cap] of Object.entries(SERVICES)) {
  const callTok = toks(cap);
  for (const [wname, wbudget] of Object.entries(WINDOWS)) {
    A(`${svc} 单次 ≈${callTok}tok ≤ ${wname} 窗口`, callTok <= wbudget);
  }
}

console.log('\n=== 极限窗口探边(8K):暴露需调小 cap 的服务(诚实标注,非失败) ===');
for (const [svc, cap] of Object.entries(SERVICES)) {
  const fits = toks(cap) <= 8_000;
  console.log(`  ${svc.padEnd(26)} ≈${toks(cap)}tok ${fits ? '✓ 8K 够' : '✗ 8K 放不下(若目标小窗口模型需调小此 cap)'}`);
}

console.log(failures === 0
  ? '\n✓ context-window:字符截断上限在 200K/128K/32K 近似预算内成立,单次调用与总上下文规模解耦；这不是语义压缩或真实 tokenizer 证明'
  : `\n✗ ${failures} 条失败`);
process.exit(failures === 0 ? 0 : 1);
