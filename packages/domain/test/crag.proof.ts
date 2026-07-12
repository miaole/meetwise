/** CRAG 自纠检索证明(纯+seam):评级决策 + 仅在本地不够好时自主 web 探索。 pnpm crag:prove */
import { gradeRetrieval, cragRetrieve } from '../src/index.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

// 评级决策
A('top 高(0.85)→ use_local 且剥掉无关(只留 score≥0.5)', (() => { const v = gradeRetrieval([{ ref: 'a', score: 0.85 }, { ref: 'b', score: 0.3 }]); return v.action === 'use_local' && v.kept.length === 1 && v.kept[0].ref === 'a'; })());
A('top 低(0.2)→ fallback_web 弃用本地', (() => { const v = gradeRetrieval([{ ref: 'a', score: 0.2 }]); return v.action === 'fallback_web' && v.kept.length === 0; })());
A('top 中(0.55)→ augment_web 混合', gradeRetrieval([{ ref: 'a', score: 0.55 }]).action === 'augment_web');
A('空检索 → fallback_web(自主探索)', gradeRetrieval([]).action === 'fallback_web');

// 自纠编排:够好不探;不够好才自主探(可靠且不浪费)
let webCalls = 0;
const deps = (localScore: number) => ({
  localRetrieve: async () => localScore < 0 ? [] : [{ ref: 'q1', score: localScore }],
  webExplore: async () => { webCalls++; return [{ url: 'https://allow.ex/x', text: '某真题素材' }]; },
});
webCalls = 0; let r = await cragRetrieve('限流', deps(0.9));
A('本地够好 → 用本地,绝不浪费去探 web(webExplore 未调)', r.verdict.action === 'use_local' && webCalls === 0 && r.web.length === 0);
webCalls = 0; r = await cragRetrieve('冷门技术', deps(0.15));
A('本地不行 → 自主回退 web 探索(webExplore 调用 + 拿到源)', r.verdict.action === 'fallback_web' && webCalls === 1 && r.web.length === 1);
webCalls = 0; r = await cragRetrieve('半熟话题', deps(0.55));
A('本地模糊 → 本地+web 混合(都有)', r.verdict.action === 'augment_web' && webCalls === 1 && r.local.length === 1 && r.web.length === 1);

console.log(`\n${fail === 0 ? '✓ CRAG 自纠检索(可靠自己探索:够好用本地/不行才自主探)全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
