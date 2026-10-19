# THRESHOLD-CALIBRATION REQUEST — 自适应面试四阈值参数化（0.7/0.4/40/0.6 单一出处+纯注入缝·默认值=现值零行为变更·数值校准面挂起登记 · 触面=packages/domain/src/adaptive-interview.ts+domain barrel additive+本卷恰 1 doc · **STOP=`draft:awaiting_pre_exec_dual`**）

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

## §8 STOP · `draft:awaiting_pre_exec_dual`（三处同值：Status 头/本节/卷尾注）

- 本卷=起草落卷（起草席）·pre-exec 双审两独立外席待派·Dual PASS≠开工·EXEC 授权权+翻面权归协调方。
- LEDGER 管线行+checklist 段+SSOT 零触（append/翻面权归协调方）·本 commit 不预 claim EXEC 门值（§2 门7 外均预标）。

---
*THRESHOLD-CALIBRATION REQUEST · 2026-10-19 起草 · STOP=`draft:awaiting_pre_exec_dual`（三处同值：Status 头/§8/卷尾注） · 基线 `origin/feat/mysql-schema-skeleton` @`4c2ea4c9f`（派单下界等号亲证） · 分支 `line/threshold-calibration-draft` · 工作树 `meetwise-thcal` · 四常量现值 0.7/0.4/40/0.6=注入默认值=回放评测集钉值 · H1 阈值决议对该族零交付（§1.2:53 明文不并入·nail `141da56f`）· 数值校准面挂起待生产分布数据（H1 §6.2 亲证不存在） · est live=0 · actualSpendCny=null · 零迁移零 lockfile 域内零 env · 停止条件三类全设未触发 · Ban self-approve · alone≠dual · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase*
