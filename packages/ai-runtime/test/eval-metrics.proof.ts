/**
 * scoring-eval:prove —— 评分官质量 eval 的**度量数学**确定性证明(per-push CI 唯一真硬门)。
 * 用已知输入/已知输出证明 stddev(n-1)/median/Spearman/Kendall/ICC/成对序 的算术**对**,
 * 且强制覆盖专家审计点名的退化用例:全同分、完全逆序、并列(tie)、单点 outlier、不平衡、单样本。
 * **它只证"我算指标的公式没写错",不证真评分官质量**(那归 nightly 真模型信号,见 smoke/scoring-eval.ts)。
 *   pnpm scoring-eval:prove
 */
import { mean, sampleStddev, median, percentile, mad, fractionalRanks, spearman, kendallTauB, pairwiseOrderAccuracy, icc1, wilsonLowerBound } from '../src/eval-metrics.ts';

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const near = (a: number, b: number, eps = 1e-3) => Math.abs(a - b) < eps;
const isNaNv = (x: number) => Number.isNaN(x);
const sec = (t: string) => console.log(`\n──────── ${t} ────────`);

sec('① 基础离散度(样本 n-1、中位、百分位、MAD)');
A('sampleStddev 用样本方差 n-1([1..5]→1.5811,非总体 1.4142)', near(sampleStddev([1, 2, 3, 4, 5]), 1.58114));
A('单样本 stddev = NaN(方差无定义,不当 0 喂门)', isNaNv(sampleStddev([42])));
A('median 奇数 [1,2,3,4,5]=3', median([1, 2, 3, 4, 5]) === 3);
A('median 偶数 [1,2,3,4]=2.5', median([1, 2, 3, 4]) === 2.5);
A('percentile p90 线性插值([1..10]→9.1)', near(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 90), 9.1));
A('MAD 抗 outlier([1,2,3,4,5]→1;含 outlier 仍稳)', mad([1, 2, 3, 4, 5]) === 1 && mad([1, 2, 3, 4, 100]) === 1);

sec('② 分数秩 + tie-corrected Spearman(并列必然:poor=nonanswer=0)');
A('fractionalRanks 并列取平均秩([10,20,20,40]→[1,2.5,2.5,4])', JSON.stringify(fractionalRanks([10, 20, 20, 40])) === JSON.stringify([1, 2.5, 2.5, 4]));
A('Spearman 完美升序 = 1', near(spearman([1, 2, 3, 4], [10, 20, 30, 40]), 1));
A('Spearman 完全逆序 = -1', near(spearman([1, 2, 3, 4], [40, 30, 20, 10]), -1));
A('Spearman 含并列(rank[1,2,3,4] vs score[0,0,50,80])= 0.9487(tie 修正)', near(spearman([1, 2, 3, 4], [0, 0, 50, 80]), 0.94868));
A('Spearman 全同分 = NaN(常量无相关,不返 1)', isNaNv(spearman([1, 2, 3, 4], [50, 50, 50, 50])));

sec('③ Kendall τ-b(tie 修正)');
A('Kendall 完美升序 = 1', near(kendallTauB([1, 2, 3, 4], [10, 20, 30, 40]), 1));
A('Kendall 完全逆序 = -1', near(kendallTauB([1, 2, 3, 4], [40, 30, 20, 10]), -1));
A('Kendall 含并列(rank[1,2,3,4] vs [0,0,50,80])= 0.9129', near(kendallTauB([1, 2, 3, 4], [0, 0, 50, 80]), 0.91287));

sec('④ 成对序正确率(单调性主指标;组内、相等分排除、可选只比非相邻档)');
const perfect = [[{ rank: 1, score: 0 }, { rank: 2, score: 0 }, { rank: 3, score: 50 }, { rank: 4, score: 80 }]];
const r1 = pairwiseOrderAccuracy(perfect, 1);
A('完美序:accuracy=1,comparable=5,ties=1(两个0分不算逆序),inversions=0', r1.accuracy === 1 && r1.comparable === 5 && r1.ties === 1 && r1.inversions === 0);
const withInv = [[{ rank: 1, score: 0 }, { rank: 2, score: 0 }, { rank: 3, score: 50 }, { rank: 4, score: 30 }]];   // rank4 应最高分却只 30 → 逆序
const r2 = pairwiseOrderAccuracy(withInv, 1);
A('含逆序(好答案反低分):accuracy=0.8,inversions=1', near(r2.accuracy, 0.8) && r2.inversions === 1);
const r3 = pairwiseOrderAccuracy(perfect, 2);   // 只比档差≥2 的对(相邻档人也难分,不断言)
A('minGap=2 只断非相邻档:comparable=3 全对', r3.comparable === 3 && r3.accuracy === 1);
A('跨题不比:两组各自组内比,不产生跨组对', pairwiseOrderAccuracy([[{ rank: 1, score: 10 }], [{ rank: 1, score: 90 }]], 1).comparable === 0);

sec('⑤ ICC(1,1) 一致性头号指标(同时抓"组内噪声低"与"跨档区分度高")');
const tight = [[80, 82, 81], [60, 61, 59], [30, 32, 31]];   // 组内紧、跨档分得开 → 好评分官
A('ICC 组内紧+跨档分明 → 高(>0.95)', icc1(tight) > 0.95);
const degenerate = [[50, 51, 49], [50, 49, 51], [51, 50, 49]];   // 恒给~50,零区分度 → 退化评分官
A('ICC 退化评分官(恒给~50,无区分度)→ 低(<0.3),纯 stddev 抓不到它 ICC 能', icc1(degenerate) < 0.3);
A('ICC 不平衡(每档采样数不等)= NaN(按 inconclusive 处理,不喂门)', isNaNv(icc1([[1, 2], [1, 2, 3]])));
A('ICC 档数<2 = NaN', isNaNv(icc1([[1, 2, 3]])));
A('ICC 每档采样<2 = NaN', isNaNv(icc1([[1], [2], [3]])));

sec('⑥ 聚合选型(审计 H6/失败#2):p90 对孤儿 outlier 是盲的 → 必须配绝对帽;成片不稳才靠 p90');
const oneOutlier = [3, 4, 3, 5, 4, 3, 4, 5, 4, 3, 4, 22];   // 11 条稳 + 1 条狂抖(SD=22)
A('中位 stddev 稳(≤8,单条 outlier 不炸中位)', median(oneOutlier) <= 8);
A('p90 对"孤儿 outlier"盲(仍≤8)——所以 p90 不够,必须配绝对帽', percentile(oneOutlier, 90) <= 8);
A('绝对帽(max)抓到孤儿 outlier(>20)', Math.max(...oneOutlier) > 20);
const spreadUnstable = [3, 4, 3, 18, 4, 17, 4, 16, 4, 3, 19, 4];   // ~1/3 条成片不稳
A('p90 抓得到"成片不稳"(>15)——不稳集中时 p90 才是对的聚合', percentile(spreadUnstable, 90) > 15);

sec('⑦ 真实模型样本比例：Wilson 95% 下界(防止把小样本全过写成 100%)');
A('9/9 表观 100%，Wilson 95% 下界仅约 70.1%', near(wilsonLowerBound(9, 9), 0.7009, 1e-3));
A('36/36 表观 100%，Wilson 95% 下界约 90.4%(达到 0.90 需至少此量级)', near(wilsonLowerBound(36, 36), 0.9036, 1e-3));
A('有一次失败也会明显降低下界(35/36 < 0.90)', wilsonLowerBound(35, 36) < 0.9);
A('空样本/越界成功数不产生伪结论(NaN)', isNaNv(wilsonLowerBound(0, 0)) && isNaNv(wilsonLowerBound(4, 3)));

console.log(`\n${fail === 0 ? '✓ 评分官度量数学全绿(退化用例全覆盖;真评分官质量归 nightly 信号)' : '✗ ' + fail + ' 项失败'}`);
process.exit(fail === 0 ? 0 : 1);
