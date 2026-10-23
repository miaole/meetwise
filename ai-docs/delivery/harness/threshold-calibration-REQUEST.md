# THRESHOLD-CALIBRATION REQUEST — 自适应面试四阈值参数化（0.7/0.4/40/0.6 单一出处+纯注入缝·默认值=现值零行为变更·数值校准面挂起登记 · 触面=packages/domain/src/adaptive-interview.ts+domain barrel additive+本卷恰 1 doc · **STOP=`executed:awaiting_post_prove_dual`**（前值 `draft:awaiting_pre_exec_dual`·EXEC 翻面 2026-10-19））

> 战役 meetwise（#38 P2 派单）· 支线 `line/threshold-calibration-draft` · 工作树 `meetwise-thcal` · 起草基线 `origin/feat/mysql-schema-skeleton` @ `4c2ea4c9f`（fetch 亲跑·派单下界「origin tip≥4c2ea4c9f」等号成立亲证=`git branch -r --contains 4c2ea4c9f` 含 origin/feat/mysql-schema-skeleton+origin/line/ag-next-draft 双支·worktree 即钉该 tip=`4c2ea4c9f54ec80eecb1add060a1a8d54288ad36`）· ⛔push ⛔merge 主线（push/翻面权归协调方）· 主仓建支：`git worktree add ../meetwise-thcal -b line/threshold-calibration-draft origin/feat/mysql-schema-skeleton`。
> 立项出处（不自建 SSOT 行——行翻面权归协调方）：①协调方派单 brief（2026-10-19·#38 P2「自适应面试阈值 0.7/0.4/40/0.6 手写常量无校准」S 刀·修法=常量参数化·H1 阈值决议 facts 在主线 nail `141da56f`）；②`ai-docs/delivery/harness/batch-residual-plan.md:62/:102` H7 挂账行 #38「自适应常量」归域刀；③H1 阈值决议 `ai-docs/delivery/harness/h1-thresholds.md`（决议本体 `61034dab`+nail `141da56f`·本刀对基线亲读全文+§1.2:53 承引）。

## §0 现状锚（起草席亲读+blob 亲算 @`4c2ea4c9f`）

- **锚A `packages/domain/src/adaptive-interview.ts`** blob=`b4c5fb161b5022dd27ba1c4084b06ca246260353`（`git rev-parse 4c2ea4c9f:<path>` 亲算）·四常量**模块私有未导出**：`:147` `const CONF_ENOUGH = 0.7`（该能力够强→不再纠缠）·`:148` `const CONF_WEAK = 0.4`（弱于此时离开该能力算无产出换题）·`:152` `const LOW_SCORE = 40`（低分阈·自注「与难度下调阈一致」）·`:154` `const HOOK_CAP = 0.6`（hasHook=true 本轮 confidence 贡献封顶）。**内联同值字面量**：`:232` `s > 0.7 ? 1 : s < 0.4 ? -1 : 0`（难度自适应·与 `:147`/`:148` 数值恒等语义同簇=`:152` 自注自证；`:231` 叙注「答得好(本次>0.7)升,答得差(<0.4)降」同行）。字面量基线计数（`grep -o` 亲跑全文件）：`0.7`×3（`:147` 定义+`:231` 叙注+`:232` 消费）·`0.4`×3（`:148`+`:231`+`:232`）·`40`×2（`:152` 定义行+同行叙注 `<40`）·`0.6`×1（`:154` 定义）。消费位：`LOW_SCORE` `:217`·`HOOK_CAP` `:222`·`CONF_ENOUGH` `:363/:372/:413/:444/:446/:465`·`CONF_WEAK` `:455/:475`。
- **锚B `packages/domain/src/interview-control-signals.ts`** blob=`928ea87093a0abf2dd298b1facf6f25e63efb128`·同值对偶散点：`:45` `export const SIGNAL_CONF_ENOUGH = 0.7`（自注「与 adaptive-interview CONF_ENOUGH 对齐：够强则既非 weak 也非 thrashing」）·`:50` `export const SCORE_LOW = 40`（`scoreFlips` 低带界）——**本刀零触只登记**：`:9`/:12 明文「本文件不 import adaptive-interview.ts，避免与 decideNext 形成环」=DAG 单向铁律，合并须第三叶模块=独立刀裁量。
- **锚C H1 阈值决议** `ai-docs/delivery/harness/h1-thresholds.md` blob=`cc86337a3b3a40425dd010b562617abf876b51d9`（对基线亲算恒等）·**§1.2:53 亲读**：`adaptive-interview.ts:132-139` 行（基线 `9f6edf8f` 锚·现行位漂 `:147-155` 注记级如实登记）判语=「**#38 族（自适应常量·自带回放评测集校准）·不并入本决议数值表·仅登记关联**」。
- **值族普查**：`grep -rn` 四值于 `packages/ai-graphs/src/adaptive-interview/`（graph+6 nodes+state）+`packages/ai-graphs/src/adaptive-interview.ts`+`mock-interview.ts`+`e2e/helpers/interview.ts` **EXIT=1 零命中亲跑**——四值全仓实体恰=锚A 四定义+`:232` 内联+锚B 两对偶。邻接 proof 钉值面（本刀零改承诺）：domain `test/adaptive-interview.proof.ts:30`「强答一次即 confidence≥0.7」blob=`7198b39ac7151badbea7de6074a59d8c3d296ae3`·ai-graphs `test/adaptive-interview.proof.ts:344`「confidence 被 HOOK_CAP 封顶 <0.7」blob=`5dbd3a3556b28873b44ffe301c67b73893fb4401`·worker `test/ag37-deficit-persist.proof.ts:92`（≥40 不计 consecutiveLow 且 <CONF_ENOUGH(0.7) 叙注）。

## 差值定性（派单工序①·判定本刀面）

1. **H1 已交付数值**（锚C 亲读）=LEVEL-SCHEME v2 族全表：五档分地板 50/65/75/85+L1 无下限（§2.1）·辅助常数 R1-R9（§2.2）·发布门加权 κ≥0.60/高估率≤5%/相邻档以外错判率≤1%/L5 100% review_required（§6.1）·facts 召回率 ≥0.70+样本简历集 ≥20 份（§6.3）——**对四常量零交付**（§1.2:53 明文不并入决议数值表）。
2. **数字巧合辨伪**：四常量中 `0.7`、`0.6` 与 H1 门值 `0.70`（facts 召回）/`0.60`（κ）数字形似而**语义完全分立**（面试循环实时控制 vs 离线发布门）——按数字巧合采纳=无据改值（§1.3 否决①）。
3. **判定**：非「决议值≠现值」·系「**决议值缺位（H1 明文不触该族）**」→ 参数化默认值唯一合法形=**现值 0.7/0.4/40/0.6（零行为变更）=本刀面成立**；**数值校准半须真实作答分布/黄金集数据**（H1 §6.2 亲证「该数据现在不存在」·黄金集建成前数值不得作任何通过条件）→ **如实挂起登记归校准刀**（非红停：无冲突决议值可裁；非全刀挂起：参数化半零数据依赖）。

## §1 修法（三件·触面=锚A 一码+domain barrel additive·零迁移零 lockfile·域内零 env 读）

- **件① 四常量 export 化+校准 provenance 注记**：`:147/:148/:152/:154` `const`→`export const`（additive·不强制消费方）·四行注释各 append「#38 校准待定：现值=回放评测集钉值（domain proof :30/ai-graphs proof :344 亲引）·H1 决议 §1.2 不并入（nail `141da56f`）·数值改值归校准刀（生产分布数据到位后按 H1 §7 协议）」形态注记。
- **件② `:232` 内联字面量折入具名常量**：`s > 0.7 ? 1 : s < 0.4 ? -1 : 0` → `s > CONF_ENOUGH ? 1 : s < CONF_WEAK ? -1 : 0`（数值恒等·比较符方向严格 `>`/`<` 原形保持·零行为变更）·沿 GAP 单源先例「一处定义，全仓复用禁字面量散布」（`packages/domain/src/assessment.ts:16`·H1 §1.3 先例亲引）·`:231` 叙注原形保留。
- **件③ 纯注入缝（组合根参数·域内零 env 零 IO）**：锚A 新增 `export interface AdaptiveInterviewPolicy { confEnough: number; confWeak: number; lowScore: number; hookCap: number }` + `export const ADAPTIVE_INTERVIEW_POLICY_DEFAULTS: AdaptiveInterviewPolicy`（四字段**直引四常量本体=单一出处·零第二套字面值**）·四消费函数 `ingestAssessment/decideNext/withCurrent/interviewCoverage` 增可选尾参 `policy: AdaptiveInterviewPolicy = ADAPTIVE_INTERVIEW_POLICY_DEFAULTS`（缺省=现值展开·现形调用方零改·`isResolved` 私有助函数随 `interviewCoverage` 随参下传）——沿 `initMind/boundedAbsoluteMaxTurns` 显式参数注入先例；env/config 读取**永入组合根（apps/api·apps/worker）不入 domain**（锚A 头注「纯逻辑,无模型/无 IO → 确定性可 gate」亲证）。`packages/domain/src/index.ts`（blob=`e4ae6e7a9d9b81e3709aac28ffb8098bb0c2aa25`）`:163-175` 具名清单 additive 追加四常量+DEFAULTS+policy 类型。
- **挂起面（如实登记·本刀不修）**：①**数值校准半**——生产/黄金集分布数据 H1 §6.2 亲证不存在，四现值是否恰当本刀不可判亦不可改；②**组合根 env→policy 接线**——现接线=未校准私调生产阈值开口，与数值改值同归校准刀（数据到位后按 H1 §7 协议另立刀）。

### §1.3 否决（四件）

1. **否决无据改值**：四常量数值零改（0.7/0.4/40/0.6 恒等）·§0 三 proof 断言零改全绿承诺；0.70/0.60 数字巧合不采纳（语义分立）。
2. **否决私调阈值行为**：组合根 env→policy 接线本刀不做（§1 挂起面②）·DEFAULTS 外任何调用方传值=越面（现形调用方零传值亲证）·禁借参数化顺手调任何行为分支。
3. **否决跨文件合并对偶散点**：interview-control-signals `SIGNAL_CONF_ENOUGH`/`SCORE_LOW` 零触（锚B `:9`/:12 DAG 单向铁律·`adaptive-interview` 已 import 该文件，反向合并必成环）·仅登记。
4. **否决扩面**：`PROBE_CAP_CORE/NONCORE`/`OFFRAMP_LOW`/`MAX_CLARIFY`/`:333` `0.2` unresolved 封顶等邻接常量不在派单四值·零触；`DEFAULT_ABSOLUTE_MAX_TURNS = 120` 行零字节（check-docs 源词配对面亲引·门8）。

## §2 门矩阵（九门·EXEC 期亲跑落值；门7 起草届树已跑在卷）

1. **门1 domain prove 三件**：`pnpm --filter @meetwise/domain prove:adaptive` + `prove:adaptive-redesign` + `prove:adaptive-length` EXIT=0 全 PASS·断言零改。
2. **门2 邻接回归五件**：domain `prove:adaptive-signals` + `prove:signal-sse`（锚B 零触面）+ ai-graphs `prove:adaptive-graph` + `prove:adaptive-signals` + `prove:adaptive-compile-contract` EXIT=0。
3. **门3 零行为变更机证**：四定义行（`:147/:148/:152/:154`）除 `export ` 前缀外数值与注记字节恒等+`:232` 改后该行零数字字面量+剔注释行后四值计数基线 2/2/1/1（`:147`+`:232`/`:148`+`:232`/`:152`/`:154`）→改后 1/1/1/1 恒等表+四常量消费位清单（§0 锚A 十位）对基线恒等。
4. **门4 typecheck**：`pnpm turbo typecheck --force` 8/8·0 cached·EXIT=0。
5. **门5 lint**：`pnpm turbo lint --force` EXIT=0·各包 cap 不放宽不上调·单文件 `eslint packages/domain/src/adaptive-interview.ts --max-warnings 0` 亦绿。
6. **门6 markers**：改动集新增行五类标记词（词面运行时组装防自指）+行首冲突标记直扫 0 命中。
7. **门7 docs:check（起草届树已跑在卷）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0·80 required·2261 managed ≤cap 2264（起草届树亲跑）**·EXEC 期预期 2262≤2264（+本卷 REQUEST）。
8. **门8 source-term 配对面零触**：`scripts/ai-docs/check-docs.mjs:328-330` 源词 `DEFAULT_ABSOLUTE_MAX_TURNS = 120`↔真值「绝对杀开关默认 120」配对·锚A `:100` 行零字节机证。
9. **门9 diff 面**：对基线 `4c2ea4c9f` 全支线 diff **恰 3 tracked**=本卷 REQUEST+锚A+domain `index.ts`·零 lockfile 零其他。

## §5 pins

- est live=0（全本地静态面·零模型外呼零 DB 零容器零 secrets）· `actualSpendCny=null` · 零迁移零 DDL 零 lockfile · **域内零 env 读**（纯度契约）· 零行为变更承诺= proofs/typecheck/lint 断言面零改。
- **停止条件（三类）**：**锚漂**=届时 origin tip 对 `4c2ea4c9f` 前进超注记级或锚A/锚B/锚C blob 漂移→停重 pin 回炉；**门红**=门1-9 任一红→停如实升级（Ban 就地改因·Ban 扩面修）；**越面**=数值改值/组合根 env 接线/跨文件合并/四值外常量诉求→停另刀。**校准数值面=挂起（非停止条件）**：生产/黄金集分布数据到位后按 H1 §7 协议另立校准刀。Ban self-approve · alone≠dual · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §8 STOP · `executed:awaiting_post_prove_dual`（三处同值：Status 头/本节/卷尾注·前值 `draft:awaiting_pre_exec_dual` 史录保留·EXEC 翻面 2026-10-19）

- 本卷=起草落卷（起草席）·pre-exec 双审两独立外席待派·Dual PASS≠开工·EXEC 授权权+翻面权归协调方。
- LEDGER 管线行+checklist 段+SSOT 零触（append/翻面权归协调方）·本 commit 不预 claim EXEC 门值（§2 门7 外均预标）。

## §9-rev rev 修订注记（pre-exec 双审第一轮双 FAIL 两席合并修订清单：P1 两件（甲·两席同发现/乙·席2）+P2 复核七件（丙/丁/戊/己/庚/辛/壬）· rev 席落卷 2026-10-19 · **append 注记形 · 上文 §0-§8 一字不洗** · EXEC 期与上文词面冲突处以本节为准读）

**rev 缘由**：本卷 pre-exec 双审第一轮回卷两席双 FAIL·两席合并清单=P1 两件+P2 七件·本席逐位届树亲证（成立九件·不成立一件=壬·证据随条附）后按 rev 回路落卷（只改本卷一个文件·纯文面零码动·码面/migrations/LEDGER/SSOT/他卷零触·落卷形=append 不洗）。**STOP 维持 `draft:awaiting_pre_exec_dual`**（Status 头/§8/卷尾注三处同值零翻·**rev 落卷后重派 pre-exec 双审两独立外席第二轮·窄域=两 P1 件复验+P2 批量回路·alone≠dual·Ban self-approve**）。

### §9-rev.1 修订①（P1-甲·两席同发现）——门3 恒等判据与件① provenance 注记 append 互斥消解（§2 门3 落点）

- **互斥机制定谳（届树亲证成立）**：§1 件①（本卷 `:21`）词面「四行注释各 append『#38 校准待定：现值=回放评测集钉值…』形态注记」↔ §2 门3（本卷 `:37`）词面「四定义行（`:147/:148/:152/:154`）除 `export ` 前缀外数值与注记字节恒等」——四定义行现树均带行尾注释（`packages/domain/src/adaptive-interview.ts:147` `const CONF_ENOUGH = 0.7;`+行尾注「该能力够强 → 不再纠缠」·`:148/:152/:154` 同构行尾注亲证）→按件① append 落码则注释字节必变·门3 恒等判据必红·互斥成立。
- **修正句**：门3 判据改读「四定义行（`:147/:148/:152/:154`）除 `export ` 前缀**与件① provenance 注记 append 外**，数值与原注记字节恒等（**原注记零删改**）」。

### §9-rev.2 修订②（P1-乙·席2）——门3「`:232` 零数字字面量」不可满足·改「零阈值字面量」口径（§2 门3 落点）

- **不可满足机制定谳（届树亲证成立）**：件②（本卷 `:22`）目标形 `s > CONF_ENOUGH ? 1 : s < CONF_WEAK ? -1 : 0`——折入具名常量后该行仍含 `1`/`-1`/`0` 三个数字字面量（难度升降步进语义·非阈值·件② 不折入）→门3（本卷 `:37`）「`:232` 改后该行零数字字面量」恒不可满足。码面现形亲证：`adaptive-interview.ts:232` `const base = mind.difficulty + (s > 0.7 ? 1 : s < 0.4 ? -1 : 0);`。
- **修正句**：门3 该句改「`:232` 改后该行零**阈值**字面量（`0.7`/`0.4` 该行零命中；`1`/`-1`/`0` 步进字面量不在禁列）」。

### §9-rev.3 修订③（P2 复核七件回路：丙/丁/戊/己/庚/辛 成立落卷+壬 不成立登记）

1. **丙（成立）·§0 值族普查 worker proof 路径补全**：「worker `test/ag37-deficit-persist.proof.ts:92`」→「worker `apps/worker/test/ag37-deficit-persist.proof.ts:92`」。亲证：届树实存 `apps/worker/test/ag37-deficit-persist.proof.ts`·其 `:92` 词面「// 'meets'=50 分确定性分量:非低分(≥40 不计 consecutiveLow)且 <CONF_ENOUGH(0.7)→ keep probing。」。
2. **丁（成立）·立项出处② 归属精确化**：出处② 改读「`:62`=**批2 散件族行**、`:102`=**H7 挂账行**（批2 残余段）·两行均含 #38」。亲证：`batch-residual-plan.md:62` 词面 `| #38/#73/#80/#119/#171/#173/#185/#200/#213/#49/#160/#163/#48/#201/#202 | 散件族：校准联动/ASR 来源/外呼/未接线/…`（批2 节 `:47` 起·批3 节 `:64` 止）·`:102` 词面 `| H7 | 挂账（不立刀） | #38/#73/#80/… | LEDGER「各归域刀或 5E」…`（「### 批2 残余 → 6 组 + 1 挂账」`:93` 起）——原词面「:62/:102 H7 挂账行」并称不确·两行分属两段。
3. **戊（成立）·门7 计数时点口径补注**：门7「2261 managed ≤cap 2264（起草届树亲跑）」补注时点口径=「**2261=REQUEST 落卷前实测**（起草席跑门时本卷未入树）」；rev 席届树（**含本卷**）亲跑 `node scripts/ai-docs/check-docs.mjs` **EXIT=0**·回执词面「ai-docs check passed: 80 required files verified; public text policy scanned **2262** managed worktree files」=含本卷恰 +1·与门7「EXEC 期预期 2262」自洽；rev 纯 append 零新增文件·EXEC 期预期维持 2262≤2264（EXEC 亲跑落值为准）。
4. **己（成立）·件② GAP 先例行号更引**：「`packages/domain/src/assessment.ts:16`」→「`packages/domain/src/assessment.ts:14-18`」。亲证：`:14` 词面「达标线单源（EXTREV-1 SCORE-WRITER rev2 D5(i)）：60 一处定义，全仓复用禁字面量散布。」（先例语句本行）·`:16` 词面「S1 的 v5→disposition 过渡桥已随 #52 提示词 v6 上线废除…」（落注记块内·原引不确）·`:18` `export const GAP = 60;`（声明行）。
5. **庚（成立·含一处逐行校正）·值族普查口径收窄+test 钉值面补列**：§0「四值**全仓**实体恰=锚A 四定义+`:232` 内联+锚B 两对偶」收窄为「四值 **src** 实体恰=锚A 四定义+`:232` 内联+锚B 两对偶」（普查 face=原列四 face·rev 席复跑 grep **EXIT=1 零命中**亲证）；test 钉值面原列三行（domain proof `:30`/ai-graphs proof `:344`/worker ag37 `:92`·本席逐行复证在）之外**补列**：`apps/worker/test/adaptive-lifecycle.proof.ts:351`「…score 50→confidence<0.7→turn1 路由」·`apps/worker/test/adaptive-offtopic.proof.ts:75`「…confidence >= 0.7」·`packages/ai-graphs/test/adaptive-interview.proof.ts:77`「…confidence >= 0.7」·`packages/domain/test/adaptive-redesign.proof.ts:21`「…confidence 被封顶 <0.7(算"还可深挖")」/`:29`「…confidence≥0.7(够强)」——清单 6 引中 5 引四值钉值成立。**逐行校正如实登记**：清单所列 `adaptive-offtopic.proof.ts:63` 词面「…depthProbed=非核心cap 2,confidence≤0.2 → 不会再追问」钉值=`0.2`（unresolved 封顶邻接值·对应锚A `:333` `Math.min(c.confidence, 0.2)`）·**非四值族**→`:63` 不入四值钉值面·`:75` 照列；另本席补录叙注级 0.7 钉注两行防「钉值面已穷」误读：ai-graphs proof `:328`「…封顶 <0.7 → 继续 probe 同一能力」·redesign proof `:17`「…confidence 被封顶(<0.7)→ decideNext 继续 probe 同一能力」；worker offtopic `:113`/`:116` 的 `40` 系循环守卫（`guard++ < 40`）非阈值钉值不入面。
6. **辛（成立）·卷头建支命令史录注**：卷头（本卷 `:3`）「主仓建支：`git worktree add ../meetwise-thcal -b line/threshold-calibration-draft origin/feat/mysql-schema-skeleton`」注明=**起草史录**（起草时点行使·支 `line/threshold-calibration-draft` 已建并推 origin·rev 席 worktree 即由 origin 该支建出亲证）；**EXEC 接续形**=`git worktree add ../meetwise-thcal line/threshold-calibration-draft`（**无 `-b`**）。
7. **壬（不成立·如实登记跳过）**：席2 提「check-docs.mjs 源词配对块行号微校为 `:328-332`」**不成立**——届树亲证：`scripts/ai-docs/check-docs.mjs:328` `source: "packages/domain/src/adaptive-interview.ts",`·`:329` `sourceTerm: "DEFAULT_ABSOLUTE_MAX_TURNS = 120",`·`:330` `truthTerm: "绝对杀开关默认 120",`——**现引 `:328-330` 恰=配对三行精确命中**；条目整块含花括号=`:327-331`·`:332`=**次条目**（scoring-honesty）开括号——「`:328-332`」跨入次条目较现引更不确。**维持现引零改**。

**rev 自检回执**：markers 五类标记词+行首冲突标记直扫本卷改动集 **0 命中**（词面运行时组装防自指·本席亲跑）；`node scripts/ai-docs/check-docs.mjs` **EXIT=0**（rev 时点届树亲跑·2262 managed ≤cap 2264·append 零新增文件）；`git diff --numstat` 恰 1 tracked=本卷 .md（新增节纯插入+卷尾注行尾 append·原字符零删改·零码面）；migrations 全目录零触；LEDGER/SSOT 零触；est live=0（rev turn 全只读+1 doc append）；pins 零翻（`actualSpendCny=null` 同源）。

## §9-EXEC 记录（EXEC 落码席·2026-10-19·按卷落码·九门亲跑 EXIT 原值如实登记）

- **接续形**：工作树 `meetwise-thcal` 分支 `line/threshold-calibration-draft` @`c6ed33ec` 现成接续（卷头 `-b` 命令系起草史录未重跑·承 §9-rev.3.6 辛）；依赖由协调方后台 `pnpm install --frozen-lockfile` 供给（`node_modules` 轮询第 1 轮即在场上·无 install 进程残留）。
- **届树重 pin（落码前）**：HEAD=`c6ed33ec`；锚A blob=`b4c5fb161b5022dd27ba1c4084b06ca246260353`·锚B=`928ea87093a0abf2dd298b1facf6f25e63efb128`·锚C=`cc86337a3b3a40425dd010b562617abf876b51d9`·barrel=`e4ae6e7a9d9b81e3709aac28ffb8098bb0c2aa25` 对 §0 逐字恒等；§0 行号（:147/:148/:152/:154/:217/:222/:231/:232/:100/:333+十位消费位）对届树零漂移亲证；`git fetch origin` 亲跑·`origin/feat/mysql-schema-skeleton`=`4c2ea4c9f` **未前进**（锚漂未触发）。
- **落点**：件① 四定义行 `export ` 化+原行尾注原字节后 append「—— #38 校准待定：现值=回放评测集钉值（domain proof :30/ai-graphs proof :344 亲引）·H1 决议 §1.2 不并入（nail 141da56f）·数值改值归校准刀（生产分布数据到位后按 H1 §7 协议）」（按 §9-rev.1 修正形）；件② `:232` 内联折入 `s > CONF_ENOUGH ? 1 : s < CONF_WEAK ? -1 : 0`（`:231` 叙注原形保留·步进 `1/-1/0` 不折入·承 §9-rev.2）；件③ `AdaptiveInterviewPolicy` 接口+`ADAPTIVE_INTERVIEW_POLICY_DEFAULTS`（四字段直引四常量本体·零第二套字面值）+四消费函数 `ingestAssessment/decideNext/withCurrent/interviewCoverage` 可选尾参 `policy = ADAPTIVE_INTERVIEW_POLICY_DEFAULTS`+`isResolved` 随 `interviewCoverage` 随参下传（卷 :23 点名面）；barrel `:163-175` 块 additive 追加 `CONF_ENOUGH, CONF_WEAK, LOW_SCORE, HOOK_CAP, ADAPTIVE_INTERVIEW_POLICY_DEFAULTS`+`type AdaptiveInterviewPolicy`（桶内无同名冲突亲证）。
- **九门 EXIT 原值**：门1 `prove:adaptive`/`prove:adaptive-redesign`/`prove:adaptive-length` 各 **EXIT=0** 全 PASS·断言零改；门2 domain `prove:adaptive-signals`/`prove:signal-sse`+ai-graphs `prove:adaptive-graph`/`prove:adaptive-signals`/`prove:adaptive-compile-contract` 各 **EXIT=0**；门3 机证脚本 **EXIT=0**（四定义行除 `export ` 前缀与注记 append 外字节恒等·原注记零删改；`:232` 零阈值字面量且步进 `1/-1/0` 在场；剔注释计数基线 **2/2/1/1**→改后 **1/1/1/1** 恒等表亲印；十位消费位对基线恒等；`:231`/`:100` 原字节在位）；门4 `pnpm turbo typecheck --force` **EXIT=0**（**8 successful / 8 total·0 cached**）；门5 `pnpm turbo lint --force` **EXIT=0**（12/12·0 cached·domain `--max-warnings 115` 帽原值未动）+单文件 `eslint src/adaptive-interview.ts --max-warnings 0` **EXIT=0**；门6 改动集码面新增行（39 行）五类标记词+行首冲突标记 **0 命中**·**EXIT=0**（卷 append 后终扫复跑同值）；门7 `node scripts/ai-docs/check-docs.mjs` **EXIT=0**（**80 required·2262 managed ≤cap 2264**·届树 `public-text-policy.mjs` `MAX_FILES = 2_264` 亲证=卷 EXEC 期预期值）；门8 `check-docs.mjs:328-330` 源词配对三行精确命中（`:327`/`:331` 花括号界亲证=§9-rev.3.7 壬维持现引）+锚A `:100` 行零字节（门3 机证内）；门9 对基线 `4c2ea4c9f` 全支线 diff **恰 3 tracked**=本卷 REQUEST+锚A `adaptive-interview.ts`+domain `index.ts`·零 lockfile 零其他（commit 后复验同值）。
- **偏离/登记（三件如实）**：①协调方 brief 提「proof 落新臂（默认注入四臂+注入变体臂·具体以卷为准）」——卷门1 断言零改+门9 恰 3 tracked 约束下不新增 test 面，按「以卷为准」**未落新臂**；默认注入路径=现值回放由门1/门2 八件 proof（缺省尾参=DEFAULTS=现值展开）全绿覆盖，**注入变体行为面无独立机证——如实登记，归数值接线面另行补臂**。②卷 :23 点名下传面仅 `isResolved`；EXEC 另将 `provenanceOf` 形参与其内 `interviewCoverage` 调用、`decideNext` 内 `:411` 覆盖快照调用一并随参下传（「随参下传」pattern 的 seam 一贯性补全·缺省恒等零行为变更·非四定义行非十位消费位·门3 断言面零触）。③门3 机证脚本首跑断言式笔误（40 基线剔注释计数误写 2——卷括注自明 40 系 `:152` 单位 1）即改即复跑·机证印值与卷恒等·非码面非门红。
- **pins**：est live=0（全本地静态面·零模型外呼零 DB 零容器零 secrets）·`actualSpendCny=null`·零迁移零 DDL 零 lockfile·域内零 env 读·数值校准半挂起照旧（生产/黄金集分布数据到位后按 H1 §7 协议另立）·组合根 env→policy 接线挂起照旧。

---
*THRESHOLD-CALIBRATION REQUEST · 2026-10-19 起草 · STOP=`executed:awaiting_post_prove_dual`（三处同值：Status 头/§8/卷尾注·前值 `draft:awaiting_pre_exec_dual` 史录保留·EXEC 翻面 2026-10-19） · 基线 `origin/feat/mysql-schema-skeleton` @`4c2ea4c9f`（派单下界等号亲证） · 分支 `line/threshold-calibration-draft` · 工作树 `meetwise-thcal` · 四常量现值 0.7/0.4/40/0.6=注入默认值=回放评测集钉值 · H1 阈值决议对该族零交付（§1.2:53 明文不并入·nail `141da56f`）· 数值校准面挂起待生产分布数据（H1 §6.2 亲证不存在） · est live=0 · actualSpendCny=null · 零迁移零 lockfile 域内零 env · 停止条件三类全设未触发 · Ban self-approve · alone≠dual · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase · §9-rev rev 修订注记落卷 2026-10-19（pre-exec 双审第一轮双 FAIL 两席合并清单·P1 两件互斥/口径消解+P2 七件回路·壬不成立登记）· rev 后重派 pre-exec 双审两独立外席第二轮（窄域=两 P1 件复验+P2 批量回路）· §9-EXEC 落卷 2026-10-19（EXEC 落码席按卷落码·九门亲跑全绿 EXIT 原值+偏离三件如实登记见 §9-EXEC·STOP 三处翻 `executed:awaiting_post_prove_dual`·post-prove 双审待派）*
