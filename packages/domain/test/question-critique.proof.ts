/** 出题反思自检证明(纯):太短/重复/诱导/跑题 → 挡。 pnpm critique:prove */
import { critiqueQuestion } from '../src/index.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const kw = { 并发: ['限流', '锁', '线程', '并发'] };
A('好题 → ok', critiqueQuestion('结合你的限流改造,聊聊高并发下怎么防超卖', '并发', [], kw).ok === true);
A('过短 → too_short', critiqueQuestion('讲讲', '并发', [], kw).issues.includes('too_short'));
A('重复已问 → duplicate', critiqueQuestion('高并发下怎么防超卖呢', '并发', ['高并发下怎么防超卖呢'], kw).issues.includes('duplicate'));
A('诱导/泄答 → leading', critiqueQuestion('限流就是用滑动窗口对不对?', '并发', [], kw).issues.includes('leading'));
A('跑题(不含能力关键词)→ off_competency', critiqueQuestion('你最喜欢的编程语言是什么', '并发', [], kw).issues.includes('off_competency'));
console.log(`\n${fail === 0 ? '✓ 出题反思自检(太短/重复/诱导/跑题)全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
