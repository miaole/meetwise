/** "查了再出"策略核证明(纯):标来源 + 不照搬 + 去重 + 对上能力。 pnpm grounded:prove */
import { isVerbatimCopy, validateGrounded } from '../src/index.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const sources = [{ url: 'https://allow.example/q', text: '请描述 Redis 缓存穿透、击穿、雪崩的区别以及各自的解决方案' }];
const comps = ['缓存', '并发'];

A('isVerbatimCopy:原文长子串 → 判抄', isVerbatimCopy('Redis 缓存穿透、击穿、雪崩的区别以及各自的解决方案是什么', sources) === true);
A('isVerbatimCopy:改写过(短重叠)→ 不判抄', isVerbatimCopy('结合你做的限流,聊聊怎么防止缓存击穿打垮下游', sources) === false);

const r = validateGrounded([
  { q: '结合你简历里的限流改造,聊聊缓存击穿怎么防', competency: '缓存', difficulty: 3, citations: ['https://allow.example/q'] },   // 好:改写+标源+对能力
  { q: '请描述 Redis 缓存穿透、击穿、雪崩的区别以及各自的解决方案', competency: '缓存', difficulty: 3, citations: ['https://allow.example/q'] }, // 照搬→挡
  { q: '谈谈你对缓存的理解', competency: '缓存', difficulty: 2, citations: [] },                                  // 无来源→挡
  { q: '聊聊你喜欢的电影', competency: '娱乐', difficulty: 1, citations: ['x'] },                                  // 跑题→挡
  { q: '结合你简历里的限流改造,聊聊缓存击穿怎么防', competency: '缓存', difficulty: 3, citations: ['y'] },        // 重复→挡
], sources, comps);

A('好题通过(改写+标源+对能力)', r.ok.length === 1 && r.ok[0]?.competency === '缓存');
A('照搬原题被挡(版权底线)', r.rejected.some((x) => x.reason === 'verbatim_copy'));
A('无来源被挡', r.rejected.some((x) => x.reason === 'no_citation'));
A('跑题被挡(不在目标能力)', r.rejected.some((x) => x.reason === 'off_competency'));
A('重复被挡(去重)', r.rejected.some((x) => x.reason === 'duplicate'));

console.log(`\n${fail === 0 ? '✓ 查了再出(标源+不照搬+去重+对能力)全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
