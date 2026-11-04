# ERRATA-SESSION-1105 REQUEST — 会话勘误总刀收编起草卷（本会话全部已登记勘误+协调方裁断九项行使 · docs-only · 起草落卷即停零码动零实跑）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-11-05 起草落卷即停 · pre-exec 双审两独立外席待派 → Dual PASS → 协调方明示 EXEC 授权后始有 EXEC（行使面=§2 九项：七项既有面 in-place/行区/文件尾 additive 注 + 一项收据 `.log` 收编机械行使 + 一项 checklist 读数登记 append · 全部原文零字节改写·前值史录保留）· alone ≠ dual · Ban self-approve · est live=0 · markers=0 · 状态钉四处：本行+§8+§9+卷尾·同值 · ⛔push ⛔merge 主线 · 翻面/关账/销案终裁行使源=协调方裁断随令）

**席位**：meetwise「ERRATA-SESSION-1105 总刀」起草席（协调方派单令「收编本会话全部已登记勘误+协调方裁断 · 逐条行使 · append-only 勘误纪律 · 原文不洗 · 前值史录保留 · 逐条注登记源」· 只起草不 EXEC · ⛔push ⛔动主仓 ⛔触在飞树）。

**基线**：`origin/main` @ **`fd2b74635`**（full `fd2b74635…` = PR #205 `line/g7w-status-pin` 并线点 · `git fetch origin` 本 turn EXIT=0 · worktree `meetwise-errata` 由 `git worktree add ../meetwise-errata -b line/errata-draft origin/main` 亲立 · HEAD 落 `fd2b74635` 亲证）。起草前本树三门亲跑：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2484 = cap `2_484` 恰等零余量**（`scripts/ai-docs/public-text-policy.mjs:306` `const MAX_FILES = 2_484` 亲读）；`node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0**（`static_preflight_valid: selected=12/12`）；markers 门=改动集五类标记词（词面运行时组装防自指 · 同 `scripts/i6-239-gates.proof.mjs` §2-7 口径 · 本卷不复抄词面）+ 行首冲突标记 **0 命中**。**本卷 +1 受管件必越 ⇒ 起草 commit 即行使 CAP-SANCTION-2485（cap 2484→2485 恰等零多放）**，四联动点在 §3 逐点登记、随本起草 commit 落位；落卷后复跑 `scanned 2485 = cap 2485` 亲证（§4）。

## §0 认领核对与登记源对账（起草席亲证）

1. **认领唯一性**：`ai-docs/delivery/harness/` 落卷前 `ls | grep errata-session` **零命中**（无同名卷）→ 落卷后唯一同名卷=本卷。
2. **登记源总表（逐条注登记源 · 双审/post-prove 在席记录以协调方台账为准 · 本卷按令转录沿 L-13/fin EX9 转录先例形）**：
   - (a) fin-REQUEST §9 post-prove 记录 **席1 ①+席2 ①** 双席同判（「U5c 引注错置 P2 · QGEN carrier=#110 非 #108」·协调方台账转录）。
   - (b) 本会话 ERRATA 登记（协调方台账·已登记勘误收编；锚勘正以本卷起草席现树亲读复证）。
   - (c) **G7W 席2 P2**（G7W 复验门二 `g7w-qgen-reverify-REQUEST.md` post-prove 席2 登记·协调方台账转录）。
   - (d) **IDU 席2 P2-A/B/C + 席1 P3-a/P3-b**（`iso-dotenv-ui-REQUEST.md` EXEC 后双席登记·协调方台账转录）。
   - (e) **R2 席2 P2-A**（`r2-receipt-gate-REQUEST.md` 双审登记·协调方台账转录）。
   - (f) 协调方采认 **G7W-TAIL-CLOSE 闭合裁定**（tail-close 卷 §1-闭④+`:81` 定谳案措辞+backlog `:807` 闭合注在树）+ **err #196 先例**（err-REQUEST §9 追加条目 9 checklist 行尾翻面注先例形）+ **G7W J2-R2**（qgen-reverify §9-exec 判读分支落字·行内更新建议）。
   - (g) tail-close 卷 §9 pre-exec dual 交接节**悬决项所指**（「闭③ 立项/销案终裁」归协调方悬决面）+ §1-闭③ 不立项建议。
   - (h) fin-REQUEST U8 表 scoringeval 行「**raw log 如需补档另行单件移交**」条款 + 协调方裁断随令（blob 亲证见 §1-h）。
   - (i) 协调方台账本会话 **scoring-eval 重行使 T-3 读数**（ERRATA-SESSION-1105 收编·协调方裁断随令）。
3. **在飞对账（本 turn 亲跑）**：`perf-draft` `9b24a1936` ahead=1（承 2_481·两 policy 热面·并线期 union 届时重算承登）/`pay` `fdaa1ecf0` ahead=1/`scoringeval` `bed65e869` ahead=1/`uc31` `112ac8af0` ahead=1——四支 `git merge-base --is-ancestor <tip> origin/main` **EXIT≠0 亲跑**（全部未并如实采）；**四在飞树零字节零触**（scoringeval 树本刀**只读取 blob `fc861681`**·零写零删零 checkout）；ag20/loadw 分支 ref 已撤如实注（沿 CAP-SANCTION-2484 注记承列）；ag18/cap-2272 ancient 分叉不预采。
4. **lane 铁律**：⛔ 动主仓（主仓仅 worktree add 一次）· ⛔ push/force-push · **Key 值零触**（全程 name-only·零读值零落盘）· 产品码/迁移/runner/既有 proof 零触 · `.tmp` 零引用入卷（任务书显式路径除外）。

## §1 逐条核定表（九条 · 逐条亲读 origin/main 现值 @`fd2b74635` · 禁凭派单简报转述）

| # | 条目 | 核定结论 | 证据（file:line 亲读 · 基线 `fd2b74635`） |
|---|---|---|---|
| a | **fin U5c QGEN carrier 勘正（carrier=#110 非 #108）** | **修**（§2-F1） | `fin-REQUEST.md` §3 U5c 行使文本「QGEN-CRITIQUE-RESILIENCE（PR **#108** `112e6d26f`·帽内换序降格）」亲读在卷；backlog 文件尾落卷同文 `:982` 同引注亲读；**真值亲证**：`qgen-critique-resilience-REQUEST.md:3`/`:205`/`:222` 三处翻面注原文=「PR **#110** merged `26ec18425`（STATUS-RECON 对账·2026-11-03）」；`git log --format='%h %s' -1 112e6d26f` 亲跑=「feat(delivery): F1–F4 + chromium + prove honesty (mysql schema branch) (#108)」系 mysql schema 交付线 commit 非 QGEN EXEC 载体；`git merge-base --is-ancestor 112e6d26f 26ec18425` EXIT=0 亲证 #108 系 #110 merge 谱系先序非载体本身；SUBMIT-FLOW 引注（PR #110 `26ec18425`）与 submit-flow 卷翻面注同值互证不受本勘影响 |
| b | **qgen-reverify `invoke.ts` 锚 `:518`→`:519` 三处（`:86`/`:92`/`:190`）** | **修**（§2-F2） | `g7w-qgen-reverify-REQUEST.md:86`（R-B3 SQL 注「invoke.ts:518 注释原文『INSERT 失败不回滚』」）/`:92`（R-B 判读句「`invoke.ts:518` INSERT 失败不回滚」）/`:190`（§9-r1 r1-③「（`invoke.ts:518` INSERT 失败不回滚 · UC-028 fail-open 旁路设计内）」）三处亲读在卷；`packages/ai-runtime/src/invoke.ts` 现 blob `f6102433` 亲读：`:517`=`/**`·`:518`=JSDoc 块首内容行「UC-028 fail-open 旁路（NHP-028-FAULT-01 …）：trace 是可观测」·**`:519`=「旁路而非业务真相。persistTrace 在自己的 principal 事务内 best-effort 执行，INSERT 失败不回滚」**——「INSERT 失败不回滚」实位 `:519`·`:518` 系 JSDoc 块首 |
| c | **qgen-reverify §9-exec 补「迁移窗前三快照（snap-0000~0002 relation 报错如实不计读数）」口径闭合句** | **修**（§2-F3） | `g7w-qgen-reverify-REQUEST.md:199` 判别读数原值 bullet 亲读：「快照 57 份 · 最后 ok 快照 snap-0055 @2026-11-04T20:07:04.342Z · 逐查询 ok 纪律 5/5 ok · **末份 snap-0056=容器拆除后 connect_error 如实不计读数**」——**窗首端**（迁移窗前三快照 snap-0000~0002 relation 报错如实不计）未登记=快照计读口径闭口残面（G7W 席2 P2） |
| d | **iso-dotenv-ui 三处勘注（EX2 「718 字节」措辞 / EX8① 补行 `.next` 清理 / 杀窗时刻 Z 后缀）** | **修**（§2-F4 三肢） | `iso-dotenv-ui-REQUEST.md:88` EX2「`E2E_PROCESS_OUTPUT_WITHHELD process=worker:stdout` **718 字节 = 诊断 V2 健康 boot 逐字节同值**（chunks=6 系 IO 调度伪差·字节值同判据）」亲读——V2 stdout 原文未落盘（诊断席观测·全文未存档）「逐字节同值」不可主张；`:94` EX8①「（pid 32498·**2026-11-05T02:45:44Z**±·本树 runner 当时未达 build 段…）」亲读——Z 后缀实为本地 UTC+8 记法（真 UTC=2026-11-04T18:45:44Z）·且无「正式 B 臂复跑前清 `apps/web/.next`」登记（EX2 正式读数前协议内清理事实缺登） |
| e | **r2 §1.2 语义注补两臂并列明示** | **修**（§2-F5） | `r2-receipt-gate-REQUEST.md:139` §1.2 语义注亲读：「镜像边界（rev r1 补）：…带形状字段（`estimatedCostCny` number ∧ `actualModel` string）的新簿记行将与读者同口径进入 `calls`（fail-closed 兜底=契约 declared 集查 `:118`-`:125` `model_undeclared` 炸收据翻红·不静默）」——**「形状不合法行剔除」（守卫 `continue`）与「形状合法行 fail-closed（model_undeclared）」两臂未并列明示**（R2 席2 P2-A）；修法双臂原形=`:129`-`:130` 两守卫行亲读 |
| f-1 | **backlog `:110` 行翻面（协调方采认 G7W-TAIL-CLOSE 闭合裁定 · 沿 err #196 先例）** | **修**（§2-F6） | backlog `:110` 行 **P1 OPEN 原文 intact**（行值零触）+ `:807` 闭合勘误注亲读（「行状态零翻转——P1 OPEN 维持 · P1 OPEN→CLOSED 翻转权归协调方裁」+A1-A5 全绿判定+面③ 裁断+定谳案+R7 记账全在卷）；tail-close 卷 `:81` **行内容定谳案措辞全形**亲读；tail-close §9 post-prove 记录「backlog `:110` 行区闭合勘误注在树亲证（面② append 落卷·行原文零字节改）」亲读；err #196 先例=err-REQUEST §9 追加条目 9「checklist `:1660` 两行行尾翻面注（先例 `:1661` CROSS-REPLICA 2026-10-28 协调方随令行使）」·翻面形=行尾/行区 append 翻面注·前值史录在注·原行零洗 |
| f-2 | **backlog `:111` 行内更新采认注（行 OPEN 维持 · G7W J2-R2 归因未闭合如实）** | **修**（§2-F7） | backlog `:111` 行 **P2 OPEN** 原文亲读+`:809`/`:813` 一轮双保留注亲读；qgen-reverify §9-exec 判读分支落字 **J2-R2（复现不成立）**+行内更新建议全文亲读（`:206`）——协调方采认=行内更新采认注 append·零翻面零关闭 |
| g | **面③ sbg 不立项终裁注（G7W tail-close 面③）** | **修**（§2-F8） | tail-close 卷 §1-闭③（`:72`-`:74`）裁定建议=不立项（三点依据）亲读；§9 pre-exec dual 交接节 `:149` 悬决项「…闭③ 立项/销案终裁 · …（均非本卷权）」亲读=登记位所指；backlog `:807` 闭合注内「面③ sbg 微刀裁断（等效闭合注 · 立项权归协调方）…裁定建议=**不立项**」亲读——协调方终裁=不立项（销案）随本刀落字 |
| h | **scoringeval 收据收编（blob `fc861681` → `receipts/scoring-eval-exec/01-scoring-eval-stdout.log`）** | **修**（§2-F9 · 机械行使） | `git cat-file -t fc861681` 亲跑=**blob**；`git ls-tree line/scoring-eval-exec -- ai-docs/delivery/receipts/scoring-eval-exec/` 亲跑=`100644 blob fc861681b8b5646e69662261b75a2f746a2b6025	ai-docs/delivery/receipts/scoring-eval-exec/01-scoring-eval-stdout.log`（**8994 字节**·`git cat-file -s` 亲跑）；`git show fc861681` 首行亲读=`> meetwise@0.1.0 scoring:eval`+worktree 绝对路径词面（scoringeval 树根·**按 PTP_LOCAL_PATH 卫生纪律本卷不复抄本地路径**·读数实质=run 工作目录为 `meetwise-scoringeval` 树·红停 stdout 如实录）；fin-REQUEST U8 表 scoringeval 行「**raw log 如需补档另行单件移交·不重入**」亲读=本项授权条款；主记录已承并（checklist `:4495` screg 段·fin U8 承证）；`.log` ∉TEXT_EXTENSIONS 不计 cap（policy `.mjs:39` 亲读）·收编后该树可删（处置权归协调方·本刀零触） |
| i | **scoring-eval T-3 读数登记（INCONCLUSIVE 注 · checklist scoring-eval/G7 区 append）** | **修**（§2-F10） | checklist `:4493`-`:4503` Line screg 段（scoring-eval/G7 区·现行文件尾段）亲读：`:4501` **STILL OPEN（唯一残面）**=「改期重行使席——真跑质量臂五字段门②红（skip=71/71=100% INCONCLUSIVE·供应商/熔断族归因…）→ 改期重行使（供应商稳定窗口·协调方后派·Ban retry-to-green·Ban 改阈值洗 INCONCLUSIVE）」；`:4495` 授权链行（红停浮出真缺陷+改期重行使登记）亲读——T-3 读数（EXIT=0·跳过率 100%·5 调用后 `model_circuit_open` 供应商当日不稳·当轮无读数不判红·单跑纪律）系该残面的改期重行使读数·缺登记=本项标的 |

> 逐条结论汇总：修=9（a/b/c/d/e/f-1/f-2/g/h/i）；已修复免勘误=0；不适用=0。全部行使=既有面 additive（原文/前值零字节改写）+ 一枚 `.log` 机械收编 + checklist 文件尾 append 一行。

### §1-R1 rev r1 增补核定表（七条 · 2026-11-05 rev r1 席现树亲读 · 登记源=勘定席 U6/U7/U9 独立复验·本席逐锚亲证复证 · 基线=本卷落卷 tip `a39cf7b6e`）

| # | 条目 | 核定结论 | 证据（file:line 亲读 · 基线 `a39cf7b6e`） |
|---|---|---|---|
| j | **extrev-deps-audit 闭卷注（U6 尾 3 draft 之一）** | **修**（§2-F11） | S1/S2 材料面六锚亲证：`.github/workflows/deps-audit.yml` fail-closed（`:4`-`:5`+`:40`-`:42`）·`renovate.json` 在树·next `15.5.28`=`apps/web/package.json:46`·fastify `5.12.5`=`apps/api/package.json:142`+根 overrides `package.json:771`·@xmldom/xmldom `0.8.15`=lockfile `:2397`·multer `2.4.0`=lockfile `:3715`；S3 窄化三件亲证：`packages/domain/src/resume-extract.ts`（218 行）+`resume-extract-worker.ts`（42 行）零 entry/size 帽命中·rev2 A2=`:176` 定值 ≤1000 条/≤64MB·s3-upload-caps 小刀在飞（worktree `meetwise-s3caps`+branch `line/s3caps-draft`·目标面 M 状态+`DOCX_ZIP_MAX_ENTRIES = 1000` 亲读）·OLE2 门=`:85`（docx 形 PK 门）+`:93`（text 形 OLE2 显式拒）·receipts 零 extrev 目录 |
| k | **extrev-score-writer 闭卷注（U6 尾 3 draft 之二）** | **修**（§2-F12） | S1/S2 材料面四锚亲证：`apps/worker/src/score-writer.ts:25`（claim/fence/writeFinal import 行）+`:112`（writeFinalScoreCard 调用行）·`packages/db/src/scoring-wire.ts:38`=`'mock-interview.evaluate.v6'`·`apps/worker/test/interview.proof.ts:396`（去桩 section 行）+`:422`（realLoadSummary）·`deriveScoreCardAssessmentLegacy` 切换=`packages/db/src/growth-generation.ts:46`（`@19ddcbb4 #103` 注）；S3 四件亲证：#41=`ai-docs/architecture/adr/0020-scorecard-authority-and-eligibility.md:8` accepted+`:84`·#42=`packages/db/test/scor-parity.proof.ts` §D（`:435`/`:476` 三方互拍）·#43=同 proof §E（`:567`·0158·23514）·#47=卷 `:48`「下次触该面迁移顺带」·adjudicate 调用点唯一=`scoring-aggregation.ts:71` voiceQuality 分支（卷 `:126` 结构性不可达承登）·receipts 零 extrev-score-writer 目录 |
| l | **money-status-proof 状态对账翻面（U7 勘定面）** | **修**（§2-F13） | §8 三行 `executed:awaiting_post_prove_dual`=`:108`/`:112`/`:114`（全文件恰三处亲证）·§11 权威条款=`:156`-`:160`·修法四件在卷（P6 白名单 `:35`-`:37`/P3-2 `:148`/P3-4 `:150`/P5-1 `:146`）·0149 sha256 亲算=`e7b916d05f4b7072eb5a1d6ca9c788e2fd2d6dbec0086aa3b9911807325947d8`（6022 字节·与卷 `:136`/`:158` 记录恒等）·卷链三 commit `858929635`/`065dacd7c`/`c32d568ca` is-ancestor HEAD 全 EXIT=0·rc #194 MERGED（STATUS-RECON 对账刀）+附记-丙=rc-REQUEST `:36`/`:255`·rc 156 卷对账=rc-REQUEST §1 ①156（`:54`） |
| m | **g7-enoent-fix 归档注（U7 普查面·勘定选项 b）** | **修**（§2-F14） | 目标面全应用亲证：runner `scripts/run-e2e-isolated.mjs` 旧路径 `packages/db/src/report.ts` 零残留+新域路径 `packages/db/src/report/report.ts` 在树（卷载时点 13 处·现树 12 处亲扫·后继 wave 行区重组如实采）·proof `packages/db/test/report-retry.proof.ts:213`/`:224` 新域路径+零旧路径；rc 普查「无状态行 1」正形=rc-REQUEST §0.1-2 六锚全空+fin U7 注在卷尾（`:73`-`:74`）亲读；receipts 零 g7-enoent 目录 |
| n | **AG-36 确认注+AG-32 引路径勘正（U9 面）** | **修**（§2-F15） | issues-final `:462` AG-36 翻面注 done 47→48·open 3→2（余 AG-13 线上数据/AG-32 UNSTUB-VOICE 部署）亲读；main 双锚亲证：`packages/db/package.json:115`-`:116` catalog:langchain+`packages/db/src/checkpoint-schema.ts` 在树+migrate-cli drift 退出 1=`packages/db/src/migrate-cli.ts:19`-`:20`（checkpoint_migrations_version_mismatch）·AG-32 维持 open（`:4447` 承登）；引路径漂亲证=issues-final `:413`「`packages/ai-graphs/src/voice-turn.ts:16`」不存在·实位 `apps/worker/src/voice-turn.ts`（await-answer.ts/voice-adaptive.ts 两锚不漂） |
| o | **proof.mjs `:460` 行内注释 cap 联动数（perf 双审席2 P3-4 承继既旧）** | **已联动免行**（§2-F16 如实登记·零字节改） | 标的现值亲证：本树 `:460`=「第 2486 个注入路径」+`:461`=「`PTP_FILE_LIMIT:2486`」+`:452` loop `2_485`+`:499` `f-2485.md`+`:501` errors `:2486`（cap 2485 现值形恰等）·perf 支 tip `5de306687` 同位行同 2486 形亲证——陈旧 2480 形已被后继 cap wave（2481/2482/2484/2485 各 wave 相邻注释同步条款）等价覆盖·免行 |
| p | **U6/U7 处置登记源注（checklist append 一行）** | **修**（§2-F17） | U6 尾 3 draft=extrev-deps-audit/extrev-score-writer/money-status-proof（fin U6 注承登三卷桶位+rc-REQUEST `:31` 净 draft 名单互证）·U7=g7-enoent-fix 普查正形（fin `:62` 行使文本亲读）·勘定席报告归档 `.tmp` 不入 git（lane 铁律 §0.4 承）·checklist 对应区=文件尾 append 形（F10 同区先例） |

> rev r1 增补结论汇总：修=6（j/k/l/m/n/p）+已联动免行=1（o——勘定标的现值亲证已被后继 cap wave 等价覆盖·如实登记不虚改·沿「已被后继刀等价覆盖」判形）。增补行使面全为既有面文件尾/行区 additive（原文/前值零字节改写）+ F16 免行零字节改。

## §2 行使项（EXEC 期逐字落卷 · 九项全 additive · 原文不洗 · 前值史录保留 · 落点行号系落卷时点值 `fd2b74635` · EXEC 期对届时 tip 重 pin——漂则如实采新值·定性漂移即停）

### F1 · fin-REQUEST U5c QGEN carrier 勘正（登记源=fin §9 post-prove 席1①+席2① · 协调方台账转录）

落点=`ai-docs/delivery/harness/fin-REQUEST.md` §3 节尾（U5c 行使文本 blockquote 之后·`## §4` 节头之前）append 一行（既有字零字节改写）：

> 【勘误注 2026-11-05（ERRATA-SESSION-1105 总刀 · fin post-prove 登记项兑现 · append-only · 上行 U5c 行使文本与 §3 既有字零字节改写）】: 上行 U5c 行使文本及其 backlog 文件尾落卷同文（`gap-bug-backlog.md:982` 落卷时点锚）中「QGEN-CRITIQUE-RESILIENCE（PR **#108** `112e6d26f`·帽内换序降格）」系 **carrier 引注错挂**——真值=**QGEN carrier=PR #110 `26ec18425` 非 #108**（QGEN-CRITIQUE-RESILIENCE 卷内翻面注三处亲读原文「PR #110 merged `26ec18425`（STATUS-RECON 对账·2026-11-03）」；`git log -1 112e6d26f` subject=「feat(delivery): F1–F4 + chromium + prove honesty (mysql schema branch) (#108)」系 mysql schema 交付线 commit 非 QGEN EXEC 载体；`git merge-base --is-ancestor 112e6d26f 26ec18425` EXIT=0=先序非载体）——SUBMIT-FLOW-COMPETENCY-WIRE（PR #110 `26ec18425`·submit 补供）引注不受本勘影响（同卷翻面注同值互证）。carrier 勘正不改 U5c 定性收官实质（两产品语义卷 EXEC 落码+STATUS-RECON `closed` 翻面定性不变·trio live 复验剩余面不变）· backlog `:982` 落卷同文零字节（本注即其勘误承引载体·backlog 侧行使面零触）· 登记源=fin-REQUEST §9 post-prove 记录席1①+席2① 双席同判（协调方台账·本卷转录）。】

### F2 · qgen-reverify `invoke.ts` 锚 `:518`→`:519` 勘正（三处 · 登记源=本会话 ERRATA 登记·协调方台账收编）

落点=`ai-docs/delivery/harness/g7w-qgen-reverify-REQUEST.md` 文件尾 append 一行（沿 fin U5a/U7 file-tail 先例形·卷内既有字零字节改写）：

> 【勘误注 2026-11-05（ERRATA-SESSION-1105 总刀 · append-only · 卷内既有字零字节改写）】: 本卷三处 `invoke.ts:518` 锚勘正 **`:518`→`:519`**——「INSERT 失败不回滚」注释原文实位 `packages/ai-runtime/src/invoke.ts:519`（现树 @`fd2b74635` blob `f6102433` 亲读：`:517`=`/**`·`:518`=JSDoc 块首内容行「UC-028 fail-open 旁路（NHP-028-FAULT-01 · spec e2e-scenarios UC-E2E-028 A1）：trace 是可观测」·`:519`=「旁路而非业务真相。persistTrace 在自己的 principal 事务内 best-effort 执行，INSERT 失败不回滚」）。三处时点行号=①§1.2 白名单 SQL R-B3 注（落卷 `:86`）②§1.2 R-B 判读句（落卷 `:92`）③§9-r1 r1-③（落卷 `:190`）（EXEC 期重 pin）——**锚类勘正非判读变更**：「UC-028 fail-open 旁路设计内 · 小失配如实记账不自动升判读异常/仪器错误」语义零变·blob 现值未漂·R-B3 恒等式判读纪律零变。登记源=本会话 ERRATA 登记（协调方台账收编·锚勘正经本卷起草席现树亲读复证）。】

### F3 · qgen-reverify §9-exec 快照计读口径闭合句（登记源=G7W 席2 P2 · 协调方台账转录）

落点=`ai-docs/delivery/harness/g7w-qgen-reverify-REQUEST.md` §9-exec「判别读数原值」bullet 块之后（值域外读数如实另记 sub-bullet 行之后）append 一行新 bullet（既有字零字节改写）：

- **快照计读口径闭合补句（2026-11-05 · ERRATA-SESSION-1105 总刀 · G7W 席2 P2 登记兑现 · append-only · 上列既有字零字节改写）**：快照计读口径**两端闭合**——窗首三快照 **snap-0000~0002 系迁移窗 relation 报错**（migrations 应用完成前 sidecar 逐查询 error 如实记录·沿「报错≠空读」纪律）·**如实不计读数**（与末份 snap-0056 容器拆除后 connect_error 如实不计同口径对称）——首三份+末一份均系仪器侧事件非读数·有效读数窗=snap-0003~snap-0055（57−3−1=53 份·如实推算）·「快照 57 份+逐查询 ok 纪律 5/5 ok+R-A/R-B/R-C 判读」全部读数维持零变。登记源=G7W 复验门二 post-prove 席2 P2（协调方台账·本卷转录）。

### F4 · iso-dotenv-ui-REQUEST 三处勘注（登记源=IDU 席2 P2-A/B/C + 席1 P3-a/P3-b · 协调方台账转录 · 三肢均 append-only 零字节改写既有字）

落点=§9 EXEC 记录区（EX2/EX8 既有 bullet 之间及其后·顺序=F4-① 挂 EX2 行尾·F4-②/F4-③ 依序追加于 EX8 bullet 之后·EXEC 期按届时 tip 重 pin）：

- **F4-①（EX2 行尾 append · IDU 席2 P2-A）**：
  > 〔勘注 2026-11-05（ERRATA-SESSION-1105 总刀 · IDU 席2 P2-A 登记 · append-only · 上行 EX2 既有字零字节改写）〕: 上行「**718 字节 = 诊断 V2 健康 boot 逐字节同值**」措辞勘正=「**计数同值（V2 stdout 原文未落盘）**」——718=718 系**字节数同值判据**；V2 stdout 全文未存档落盘·「逐字节同值」无对照体不可主张（chunks=6 系 IO 调度伪差·同值判据=字节数+扣留形状）——B 臂读数实质（`worker_exited_before_test` 0 次·worker 存活过启动期·718B 扣留读数原值）零变。
- **F4-②（EX8 后新增 bullet · IDU 席2 P2-B）**：
  - **EX8① 补行（2026-11-05 · ERRATA-SESSION-1105 总刀 · IDU 席2 P2-B 登记 · append-only · 上行 EX8 既有字零字节改写）**：EX8① 误杀事故后续如实补登——**正式 B 臂复跑（EX2）前清 `apps/web/.next`（协议内清理）**（build 产物目录·gitignore 域非 tracked 面·清除系排除误杀残留干扰的协议内步骤·EX2 正式读数在其后行使·EX2 读数实质零变）。
- **F4-③（紧随 F4-② · IDU 席2 P2-C + 席1 P3-a/P3-b）**：
  - **EX8① 时刻勘注（2026-11-05 · ERRATA-SESSION-1105 总刀 · IDU 席2 P2-C + 席1 P3-a/P3-b 登记 · append-only）**：EX8①「2026-11-05T02:45:44Z±」之 **Z 后缀实为本地 UTC+8 记法**——真 UTC=**2026-11-04T18:45:44Z**（本地 2026-11-05 02:45:44+08:00 换算）；事故 log 档名 `b-arm-attempt1-2026-11-05T0245.log` 同为本地记法——时点记法勘正不改事故实质与归属登记（误杀 pid 32498·受害进程归属他树·如实上报维持）。

### F5 · r2-receipt-gate-REQUEST §1.2 语义注两臂并列明示（登记源=R2 席2 P2-A · 协调方台账转录）

落点=`ai-docs/delivery/harness/r2-receipt-gate-REQUEST.md` §1.2 语义注段行尾 append（该段既有字零字节改写）：

> （补句 2026-11-05 · ERRATA-SESSION-1105 总刀 · R2 席2 P2-A 登记兑现 · append-only · 上行零字节改写）——**两臂并列明示**：判定=「**形状不合法行剔除**」（守卫行 `continue` 剔除——`row` 为 `reservation`/`release`·或缺 `estimatedCostCny` number/`actualModel` string 任一形状）与「**形状合法行 fail-closed（model_undeclared）**」（形状过而 declared 集查不过的行照进 `calls`·由契约 declared 集查 `:118`-`:125` `model_undeclared` 炸收据翻红·不静默）**并列成立**——前者剔除非放行·后者 fail-closed 兜底·两臂互不替代（沿 rev r1 P2-5 镜像边界条款承）· 语义零变仅并列结构明示。

### F6 · backlog `:110` GAP-G7W-API-TAIL-DEATH 行翻面（登记源=协调方采认 G7W-TAIL-CLOSE 闭合裁定 + err #196 先例 · 协调方裁断随令）

落点=`ai-docs/delivery/gap-bug-backlog.md` `:807` 闭合勘误注 blockquote 之后新增单行 blockquote（行区 append · 沿 `:805`/`:807` 先例形 · 后行顺延属预期 · `:110` 行原文零字节改写）：

> **2026-11-05 · `:110` GAP-G7W-API-TAIL-DEATH 行翻面注（append-only · 行区落位（`:807` 闭合勘误注之后 · 沿 `:805`/`:807` 先例形）· `:110` 行原文零字节改写 · 沿 err #196 先例行使翻面——协调方采认 G7W-TAIL-CLOSE 闭合裁定（`harness/g7w-tail-close-REQUEST.md` rev r1 · pre-exec dual+post-prove dual BOTH PASS 在卷 · 闭合 EXEC A1-A5 对届时 tip 全绿判定在 `:807` 闭合注）**: 行值 **P1 OPEN→CLOSED**（候选真实缺陷主张撤销 · 有效态翻面）——**前值史录在注**：前值 P1 OPEN（`:110` 行原文 `**OPEN**` 原样零洗 · `:807` 闭合注「行状态零翻转——P1 OPEN 维持」系其时点登记史录 · 本注为后位有效态）。**定谳案措辞（g7w-tail-close 卷 `:81` 全形为准 · 补两处括注）**：「**行内容定谳案措辞（供协调方闭合 EXEC 采或改）**〔括注一：协调方已采认·2026-11-05·本翻面注即采认行使载体·沿 err #196 先例形〕：`:110` 行老红正面内容定谳=journey 尾段死亡 38013ms 簇=C-MO-P3 恒 False 断言（harness 断言语义 bug · 构造算术证明）fail-fast 产生×报告链 3-attempts 设计钟复合形 · 非产品缺陷 · 非环境混杂 · 非间歇挂起 · 已由 C-MO-P3 语义纠两刀（CMOP03-FIX 刀①+G7FIX-2）构造性消除（首次全绿+LIVE in-driver 直读双确认）」——行处置建议=**P1 OPEN→CLOSED（候选真实缺陷主张撤销）**〔括注二：前值 P1 OPEN 史录在注（`:110` 行原文零洗+`:807` 闭合注+本注三处）〕 · 撤销≠翻绿≠trio 翻绿≠`g7SuiteGreen=true`（保持 false） · G7W-era 读数（`×2`/38013ms/35 tick 全窗口）原值记账零冲销史录。Pins 零翻（十一值照抄）· `:111`/`:107`/POST7B/7A-DOWNGRADE/WHG/runner 六域 disjoint 零触 · 翻面行使源=协调方裁断（ERRATA-SESSION-1105 总刀收编·派单随令）· alone≠dual。

### F7 · backlog `:111` GAP-G7W-QGEN-SCHEMA-VALIDATION 行内更新采认注（登记源=G7W J2-R2 + 协调方采认 · 行 OPEN 维持）

落点=backlog `:813` 双保留注 blockquote 之后新增单行 blockquote（行区 append · `:111` 行原文零字节改写）：

> **2026-11-05 · `:111` GAP-G7W-QGEN-SCHEMA-VALIDATION 行内更新采认注（append-only · 行区落位 · `:111` 行原文零字节改写 · 行状态 P2 OPEN 维持零翻转——G7W J2-R2 归因未闭合如实承登 · 行翻面权归协调方）**: 协调方采认复验门二行使刀行内更新建议（`harness/g7w-qgen-reverify-REQUEST.md` §9-exec 判读分支落字 **J2-R2 复现不成立** · 单跑 N=1 样本限）：「OB-3 门两轮已行使 · 钉值口径（dashscope-cn-beijing × qwen-plus）单跑零复现（N=1 样本限·本 run journey 异形如实）· 前轮 2/2 retained · 归因未闭合（候选族并列 · 值域外 external_outcome_unknown ×7 另记）· 如需 N=3 定值复跑=协调方另授权」——**归因未闭合如实**（候选族并列 · Ban 定谳「已修复」/「永不复现」双向维持）· 前轮 2/2 与 G7W-era `×2` retained 零冲销 · trio 1/1/1 零冲销 · 本注系行内更新采认非翻面非关闭（关闭须其自身全链+协调方裁）· Pins 零翻 · `:110`/`:107`/POST7B/7A-DOWNGRADE/WHG/runner 域 disjoint 零触 · 登记源=G7W J2-R2（qgen-reverify §9-exec·协调方采认随令·ERRATA-SESSION-1105 总刀收编）· alone≠dual。

### F8 · 面③ sbg 微刀不立项终裁注（登记源=tail-close §9 悬决项所指 · 协调方终裁随令）

落点=`ai-docs/delivery/harness/g7w-tail-close-REQUEST.md` 文件尾 append 一行（登记位沿本卷 §9 pre-exec dual 交接节「悬决项（归协调方）：…闭③ 立项/销案终裁…」所指悬决面 · 沿 fin U5a/U7 终裁注 file-tail 先例形 · 卷内既有字零字节改写）：

> **2026-11-05 · 面③ sbg 微刀不立项终裁注（append-only · 文件尾落位 · 卷内既有字零字节改写 · 登记位沿本卷 §9 pre-exec dual 交接节「悬决项（归协调方）：…闭③ 立项/销案终裁…」所指悬决面 · 沿 fin U5a/U7 终裁注 file-tail 先例形）**: 协调方终裁=**面③ sbg 微刀不立项（销案）**——采纳 §1-闭③ 裁定建议三点依据全链：①需求面已消解（红路精确断言原文回读判别已由案 A driver 侧 NDJSON 帧通道+加针针③ runner 红路 stderr 尾量侧通道 `run-e2e.mjs:187`-`:190` 两非契约面通道等效满足）②本行甄别力缺项已闭合（闭② A2/A5）③withhold 保全缺省维持（案 B 面① 肢一裁定 · 无需求方契约例外=纯攻击面扩张）——与 backlog `:807` 闭合注「面③ sbg 微刀裁断（等效闭合注 · 立项权归协调方）…裁定建议=不立项」相承兑现·本注=该悬决的终裁落字 · 不立项≠回滚已落通道（案 A 埋点/加针三针留树零触）· checklist 案 B nail 段 STILL OPEN 六项之「面③ sbg 另立登记是否立项归协调方」随本终裁闭合（checklist 侧承引留后继行使·本刀零触 checklist 该段）· 销案权行使源=协调方（ERRATA-SESSION-1105 总刀收编·随令）· Pins 零翻 · alone≠dual。

### F9 · scoringeval 收据收编（登记源=fin U8 表「raw log 如需补档另行单件移交」条款 + 协调方裁断随令 · 机械行使零判断）

落点=`ai-docs/delivery/receipts/scoring-eval-exec/01-scoring-eval-stdout.log` 新件（目录随件新立）。行使命令（EXEC 期逐字执行）：

```
git show fc861681 > ai-docs/delivery/receipts/scoring-eval-exec/01-scoring-eval-stdout.log
```

- blob 全形=`fc861681b8b5646e69662261b75a2f746a2b6025`（**8994 字节**·自 `line/scoring-eval-exec` 树 `git ls-tree` 亲证·`git cat-file -t`=blob 亲证）——对象已在仓对象库·落盘 commit 后 blob 恒等零新对象；**byte-identical 收编零注解混入**（红停 stdout 如实录原样·EXIT/红停面零改写）。
- `.log` ∉TEXT_EXTENSIONS（policy `.mjs:39` 亲读）→ **不计 cap 零步进影响**；主记录已承并（checklist `:4495` screg 段+fin U8 承证）·本件=fin U8 表「raw log 如需补档另行单件移交」条款兑现。
- **「收编后该树可删」登记**：`meetwise-scoringeval` worktree/`line/scoring-eval-exec` 分支处置（撤树留支/归档）权归协调方——本刀零触在飞树（本项行使仅落本卷授权的收据新件·对在飞树零字节）。
- 起草期预核（本席亲跑）：blob 可读·8994 字节·目标路径与源树路径同形亲证（§1-h）。

### F10 · scoring-eval T-3 读数登记 INCONCLUSIVE 注（登记源=协调方台账本会话 scoring-eval 重行使 T-3 · 协调方裁断随令）

落点=`ai-docs/delivery/execution-master-checklist.md` 文件尾 append 一行（`:4503` 之后 · Line screg 段系现行文件尾段=scoring-eval/G7 区 · 沿「落位=文件尾为零位移」先例形 · 既有字零字节改写）：

- **T-3 读数登记（2026-11-05 · ERRATA-SESSION-1105 总刀 · append-only · 上行 STILL OPEN 残面登记零字节改写）**：改期重行使 T-3 读数原值记账=**INCONCLUSIVE 维持**——`scoring:eval` 真跑 **EXIT=0** · **跳过率 100%** · **5 调用后 `model_circuit_open`**（供应商当日不稳·熔断族沿 `:4495` 归因口径）——**当轮无读数不判红**（EXIT=0+全 skip=诚实跳过非绿 · INCONCLUSIVE 不洗不翻）· **单跑纪律**（恰 1 run · Ban retry-to-green · Ban 择优 · Ban 改阈值洗 INCONCLUSIVE）· 改期重行使（供应商稳定窗口）仍归协调方排程 · 上行 STILL OPEN 残面维持 OPEN · 登记源=协调方台账本会话 scoring-eval 重行使 T-3 读数（ERRATA-SESSION-1105 总刀收编·协调方裁断随令）· Pins 零翻 · alone≠dual。

### F11 · extrev-deps-audit-REQUEST 卷尾闭卷注（登记源=勘定席 U6 尾 3 draft 处置建议 · 勘定席独立复验·本席逐锚亲证复证 · 协调方采认随令）

落点=`ai-docs/delivery/harness/extrev-deps-audit-REQUEST.md` 文件尾（fin 台账收官刀 U6 残面登记注之后）append 一行 blockquote（沿 fin U6 注同位先例形·卷内既有字零字节改写）：

> 【闭卷注 2026-11-05（ERRATA-SESSION-1105 总刀 rev r1 · 协调方采认勘定建议 · append-only · 卷内既有字零字节改写 · 前值 fin U6 残面登记注史录保留）】: 本卷闭卷登记——**S1/S2 闭卷**（材料面 main 全在树·rev r1 席逐锚亲证：`.github/workflows/deps-audit.yml` fail-closed 门 `:4`-`:5`/`:40`-`:42` 亲读·`renovate.json` 在树·next `15.5.28`=`apps/web/package.json:46`·fastify `5.12.5`=`apps/api/package.json:142`+根 overrides `package.json:771`·@xmldom/xmldom `0.8.15`=lockfile `:2397`·multer `2.4.0`=lockfile `:3715`）——**S3 残面窄化登记**：#107 四守卫中魔数门已由 #109 全量落树（`packages/domain/src/resume-extract.ts:78`-`:96` 魔数体系亲读）·**zip 条目数+解压总大小两帽未落**（`resume-extract.ts` 全文 218 行+`resume-extract-worker.ts` 42 行 rev r1 席亲扫零 entry/size 帽命中·rev2 A2（`:176`）已定值 **≤1000 条/≤64MB**）→**已另立 s3-upload-caps 小刀承接**（worktree `meetwise-s3caps`·branch `line/s3caps-draft`·目标面 `resume-extract.ts`+`resume-extract.proof.ts` 修改在树 M 状态亲证·`DOCX_ZIP_MAX_ENTRIES=1000` 形亲读·帽值=rev2 A2 承）——**`.doc` 拆分效果等价**（OLE2 经 `:85` 魔数门（声明 docx 形 PK 门）fail-closed 拒·`:93` 声明 text 形 OLE2 显式拒同族门·错误码名不等价（`magic_mismatch` 非拆分形专码））**降 P2 登记**；**收据目录未入仓如实披露**（S1/S2 EXEC 节所引 `receipts/extrev-deps-audit/` 目录主线 `ai-docs/delivery/receipts/` 零命中亲证）。闭卷=残面清零登记·行状态桶位翻面/关账权归协调方·Pins 零动。】

### F12 · extrev-score-writer-REQUEST 卷尾闭卷注（登记源=勘定席 U6 尾 3 draft 处置建议 · 勘定席独立复验·本席逐锚亲证复证 · 协调方采认随令）

落点=`ai-docs/delivery/harness/extrev-score-writer-REQUEST.md` 文件尾（fin U6 残面登记注之后）append 一行 blockquote（卷内既有字零字节改写）：

> 【闭卷注 2026-11-05（ERRATA-SESSION-1105 总刀 rev r1 · 协调方采认勘定建议 · append-only · 卷内既有字零字节改写 · 前值 fin U6 残面登记注史录保留）】: 本卷闭卷登记——**S1/S2 闭卷**（材料面 main 全在树·rev r1 席逐锚亲证：`apps/worker/src/score-writer.ts:25`（claim/fence/writeFinal import 行）+`:112`（`writeFinalScoreCard` 调用行）·`packages/db/src/scoring-wire.ts:38`=`SCORING_PROMPT_POLICY_VERSION 'mock-interview.evaluate.v6'`·`apps/worker/test/interview.proof.ts:396` 去桩 section 行+`:422` `realLoadSummary`·`deriveScoreCardAssessmentLegacy` 切换在树=`packages/db/src/growth-generation.ts:46`（`EXTREV-1 S2 @19ddcbb4 #103 切换承继` 注亲读））——**S3 四件处置**：#41（`ai-docs/architecture/adr/0020-scorecard-authority-and-eligibility.md:8` `status: accepted` 亲读+`:84` 翻面承登）·#42（`packages/db/test/scor-parity.proof.ts` §D 公式值级对拍 `:435` 起·write_final(0103 副本)↔TS↔adjudicate(0109 副本) 三方逐值互拍 `:476` 亲读）·#43（同 proof §E INSERT 守门 `:567` 起·0158 守门白名单外 23514 负测亲读）——**三件已被后继刀等价覆盖**；#47（`assessment_report.dimensions.evidence` 类型统一）**按卷 §2 既有口径归「下次触 assessment_report DDL 面迁移顺带」**（卷 `:48` 亲读·DDL 注释修不新开迁移）——**adjudicateScoreCard 生产零调用维持观察登记**（调用点唯一=`packages/db/src/scoring/scoring-aggregation.ts:71` `writeFinalScoreCard` voiceQuality low/unavailable 分支·seed 过渡窗结构性不可达（本卷 `:126` 承登）·生产零调用维持）；**收据目录未入仓如实披露**（S1/S2 EXEC 节所引 `receipts/extrev-score-writer/` 目录主线零命中亲证）。闭卷=残面清零登记·行状态桶位翻面/关账权归协调方·Pins 零动。】

### F13 · money-status-proof-REQUEST 状态对账翻面注（登记源=协调方采认勘定建议 · 勘定席 byte 级独立复验·本席逐锚复证 · 协调方对账翻面随令 · 沿 rc #194 附记-丙超越裁定+rc 156 卷对账先例）

落点=`ai-docs/delivery/harness/money-status-proof-REQUEST.md` 文件尾（§11 之后）append 一行 blockquote（§8 三行 `:108`/`:112`/`:114` 原文零字节改写·前值史录在注）：

> 【状态对账翻面注 2026-11-05（ERRATA-SESSION-1105 总刀 rev r1 · 协调方对账翻面权行使 · append-only · §8 三行 `:108`/`:112`/`:114` 原文零字节改写 · 前值史录在注）】: §8 三行 `executed:awaiting_post_prove_dual` → **`closed`**（终值=closed）——**前值史录在注**：前值 `executed:awaiting_post_prove_dual`（§8 三行原文零洗·§10「已改回 draft」与 §11「现以 §11 为准」两权条款史录保留·本注为后位有效态）。**翻面依据（协调方采认勘定建议·沿 rc #194 附记-丙超越裁定形+rc 156 卷对账先例）**：byte 级独立复验=证明修法四件（P6 白名单/P3-2/P3-4/P5-1）与卷修法（§1/§9-rev/§10）同构亲证·`packages/db/migrations/0149_money_status_constraints.sql` sha256=`e7b916d05f4b7072eb5a1d6ca9c788e2fd2d6dbec0086aa3b9911807325947d8`（6022 字节）恒等（rev r1 席本树亲算同值）·改史三 commit（`858929635`/`065dacd7c`/`c32d568ca`）`merge-base --is-ancestor` 对 HEAD 三值全 EXIT=0 亲证已并线——**材料面零残唯状态对账残**·§11 权威条款在卷（`:156`-`:160`）·**免再启 post-prove 双审空转**（沿 rc 156 卷对账先例=STATUS-RECON 对账刀 ①156 卷对账行使形·rc-REQUEST §1 亲读）。翻面行使源=协调方裁断（ERRATA-SESSION-1105 总刀 rev r1 收编·随令）· alone≠dual · Pins 零动。】

### F14 · g7-enoent-fix-REQUEST 卷尾归档注（登记源=勘定席 U7 普查处置建议 · 勘定选项 b·勘定席独立复验·本席逐锚亲证复证 · 协调方采认随令）

落点=`ai-docs/delivery/harness/g7-enoent-fix-REQUEST.md` 文件尾（fin U7 普查裁定登记注之后）append 一行 blockquote（沿勘定选项 b·卷内既有字零字节改写·不补状态行）：

> 【归档注 2026-11-05（ERRATA-SESSION-1105 总刀 rev r1 · 协调方采认勘定建议选项 b · append-only · 卷内既有字零字节改写 · 零状态行补登（rc 普查「无状态行 1」正形维持·两读制可复算性））】: 本卷归档登记——**目标面已全应用**（rev r1 席亲扫：runner `scripts/run-e2e-isolated.mjs` 旧路径 `packages/db/src/report.ts` 零残留亲证+新域路径 `packages/db/src/report/report.ts` 在树（卷载落卷时点 13 处·现树 12 处亲扫·后继 wave 行区重组如实采）·proof `packages/db/test/report-retry.proof.ts` 2 处（`:213`/`:224`）新域路径亲读+零旧路径）——**rc 普查「无状态行 1」正形维持不补行**（rc-REQUEST §0.1-2 六锚全空亲证+fin U7 注承登·补行=改卷形动普查基线·两读制可复算性维持）；**收据目录未入仓如实披露**（主线 `ai-docs/delivery/receipts/` 零 g7-enoent 目录亲证）。归档=闭卷登记·处置/翻面权归协调方·Pins 零动。】

### F15 · AG-36 确认注（issues-final · 登记源=勘定席 U9 面处置建议 · 勘定席独立复验·本席逐锚亲证复证 · 无需处置确认+AG-32 引路径勘正随注）

落点=`ai-docs/delivery/ai-capability-review/issues-final.md` 文件尾 append 一行（`:462` AG-36 翻面注记与 `:413` AG-32 file:line 行既有字零字节改写）：

> 【AG-36 确认注 2026-11-05（ERRATA-SESSION-1105 总刀 rev r1 · 协调方采认勘定建议 · append-only · 既有字零字节改写）】: 上行 `:462` AG-36 翻面注记（done 47→48·open 3→2）**确认与 main 双锚一致·无需处置**——双锚亲证（rev r1 席）：①`packages/db/package.json:115`-`:116` `catalog:langchain` 两行+`packages/db/src/checkpoint-schema.ts` 在树·②migrate-cli vendor/0043 drift 自检门退出 1 机制在树（`packages/db/src/migrate-cli.ts:19`-`:20` `checkpoint_migrations_version_mismatch` 退出 1 亲读）——**AG-13/AG-32 维持 open**（外部前置：AG-13 线上分布数据/AG-32 UNSTUB-VOICE 部署·`:462` 承登一致）·**AG-32 ledger 引路径漂随本注勘正**：`:413` file:line 行「`packages/ai-graphs/src/voice-turn.ts:16`」系旧路径——实位 **`apps/worker/src/voice-turn.ts`**（`packages/ai-graphs/src/voice-turn.ts` 不存在亲证·`apps/worker/src/voice-turn.ts` 在树亲读·同行 `await-answer.ts`/`voice-adaptive.ts` 两锚不漂亲证）·AG-32 条目实质（P3·编排运行时·修法/前置）零变仅引路径勘正·登记源=勘定席 U9 面（协调方采认随令）。】

### F16 · proof.mjs `:460` 行内注释 cap 联动数（登记源=perf 双审席2 P3-4 承继既旧 · 勘定席独立复验·本席现树亲证 · 本刀勘误域内）

落点=登记形（**免行**·零字节改）——`scripts/ai-docs/public-text-policy.proof.mjs:460` 行内注释 cap 联动数标的核实登记：

> 【勘误标的核实登记 2026-11-05（ERRATA-SESSION-1105 总刀 rev r1 · perf 双审席2 P3-4「第 2480 个注入路径…PTP_FILE_LIMIT:2480」承继既旧登记兑现 · append-only · 免行零字节改）】: 标的=`proof.mjs:460` 行内注释 cap 联动数（「第 N 个注入路径」+`PTP_FILE_LIMIT:N+1` 形）——**rev r1 席现树亲证=已现值**：本树 `:460`=「第 2486 个注入路径触发早返回」+`:461`=「`PTP_FILE_LIMIT:2486`」+`:452` loop `2_485`+`:499` `f-2485.md`+`:501` errors `:2486`（cap 2485 现值形恰等）·perf 支 tip `5de306687` 同位行同 2486 形亲证——**陈旧 2480 形已被后继 cap wave 等价覆盖**（2481/2482/2484/2485 各 wave「相邻注释两处同步」条款随步进行使+perf 分支并线联动）→ **免行**（零字节改·登记源处置完毕·沿本卷 F12「已被后继刀等价覆盖」同判形）·后继 cap 步进沿 C3「相邻注释同步」条款续行·本登记不构成新增义务。】

### F17 · U6/U7 处置登记源注（checklist 对应区 append 一行 · 登记源=勘定席报告归档（.tmp 不入 git）·协调方采认随令）

落点=`ai-docs/delivery/execution-master-checklist.md` 文件尾（F10 T-3 读数登记行之后·同一文件尾区）append 一行（既有字零字节改写）：

- **U6/U7 处置登记（2026-11-05 · ERRATA-SESSION-1105 总刀 rev r1 · append-only · 既有字零字节改写）**：fin 台账收官刀 U6/U7 处置完成登记——**U6 尾 3 draft**（extrev-deps-audit/extrev-score-writer/money-status-proof）+**U7**（g7-enoent-fix 普查正形）处置兑现=本卷 rev r1 F11（deps-audit 闭卷注）/F12（score-writer 闭卷注）/F13（money-status §8 三行对账翻面 closed）/F14（g7-enoent-fix 归档注·选项 b）·**登记源=勘定席报告归档**（勘定席 U6/U7/U9 独立复验报告归档 `.tmp`·不入 git·本行即其处置登记载体）· 2026-11-05 · Pins 零动 · alone≠dual。

**零改承诺**：fin/qgen-reverify/iso-dotenv-ui/r2-receipt-gate/g7w-tail-close 五卷既有字零字节改写（全部为节尾/行尾/行区/文件尾 append）· backlog `:110`/`:111` 行原文零字节改写（翻面/采认全走行区新 blockquote）· checklist 既有字零字节改写（文件尾 append）· receipts 面仅 F9 一枚新 `.log`·五卷既有收据零触 · 在飞四树零字节 · Key 值零触 · 产品码/迁移/runner/既有 proof 零触 · 行统计数值零改 · pins 零翻。

**零改承诺（rev r1 增补面 · 2026-11-05）**：extrev-deps-audit/extrev-score-writer/money-status-proof/g7-enoent-fix 四卷+issues-final+checklist 六目标既有字零字节改写（全部文件尾/行区 append）· proof.mjs `:460` 免行零字节改（F16·现值亲证已被后继 cap wave 等价覆盖）· money-status §8 三行 `:108`/`:112`/`:114` 原文零字节改写（F13 翻面走卷尾新 blockquote·前值史录在注）· cap 不变（F16 系登记形非新文件·EXEC 期零新增受管件·terminal 仍 2485）· 在飞树零触（s3caps 仅分支/worktree 存在性登记·对 `meetwise-s3caps` 零字节）· Key 值零触 · 产品码/迁移/runner/既有 proof 零触 · pins 零翻 · Status 四处钉 `draft:awaiting_pre_exec_dual` 零翻。

## §3 cap 预登（本卷 REQUEST +1 ⇒ **CAP-SANCTION-2485** · 沿 nk1/flip/sse2/err/l13/fin/r2/idu 预登先例形 · 随届值如实采=唯一豁免项）

| 号 | 文件 | 内容 |
|----|------|------|
| C1 | `ai-docs/delivery/harness/errata-session-1105-REQUEST.md` | 本卷新增受管 1 件（起草 commit 即触 2484→2485）· EXEC 期零新增受管文件（行使面全为既有 .md in-place/行区/文件尾 append + F9 一枚 `.log` ∉TEXT_EXTENSIONS 不计）→ EXEC terminal=**2485 零新增** |
| C2 | `scripts/ai-docs/public-text-policy.mjs` | `const MAX_FILES = 2_484` → **`2_485`**（现 `:306`）+ 链区 **CAP-SANCTION-2485** 注记一行（现 `:305` 上邻 append）· 算术=main 届扫 2484=cap 2484 恰等（基线 docs:check EXIT=0 scanned 2484 本树亲跑）+本卷 REQUEST 1=**2485 恰等零多放** · 协调方派单常设预授权「随届值如实采·恰等步进预登」随令行使 +1 · `MANAGED_ROOTS`/`TEXT_EXTENSIONS`/扫描面零改（语义不变强度不减） |
| C3 | `scripts/ai-docs/public-text-policy.proof.mjs` | 四联动点随起草 commit 落 **2485 形**：`i < 2_485`（现 `:452`）/`scannedFiles, 2_485`（现 `:459`）/'ai-docs/f-2485.md'（现 `:498`）/`${FILE_LIMIT}:2486`（现 `:501`）+ 相邻注释两处（现 `:460`-`:461` 第 2486 个注入路径/`PTP_FILE_LIMIT:2486`）同步 + 链区 **CAP-SANCTION-2485** 注记一行（现 `:497` 之后 append）· PTP 12/12 亲跑（§4）· 四处同一届值禁一处手改 |
| C4 | 收据面 | 门读数 stdout 留痕落 `.log`（∉TEXT_EXTENSIONS 不计）· 本刀起草期唯一收据性产出=F9 预核读数（blob 亲证·入卷登记形）· Ban 落 `.md`/`.txt`/`.json` 收据 |

在飞如实采（本 turn 亲跑）：`perf-draft` `9b24a1936` 承 2_481（ahead=1·两 policy 热面·并线期 union 届时重算承登）/`pay` `fdaa1ecf0`/`scoringeval` `bed65e869`/`uc31` `112ac8af0` 各 ahead=1 两 policy 零触（四支 `merge-base --is-ancestor` EXIT≠0 亲跑）· ag20/loadw ref 已撤如实注 · ag18/cap-2272 ancient 不预采。先手步进 · 计数预算非内容策略 · 越限臂 fabricated 数随 cap 联动同步 · 语义不变强度不减。

**rev r1 增补 cap 对账（2026-11-05）**：F11-F17 行使面全为既有 .md 文件尾/行区 append+F16 免行零字节改 → **零新增受管件·cap 2485 不变**（本卷已计·C1-C4 预登判据维持·EXEC terminal 仍 2485 零新增）· rev r1 落卷 commit 本身恰 1 tracked `.md`（本卷）· 在飞如实采注：`perf-draft` 本 turn 复核 tip 已前进 `5de306687`（ISO-DOTENV-PERF 起草·仍两 policy 热面·并线期 union 届时重算承登）· 其余三支同 `:127` 上文· ag20/loadw 已撤/ag18·cap-2272 ancient 维持。

## §4 门矩阵（起草期本席亲跑 · EXEC 期复跑同表）

1. `node scripts/ai-docs/check-docs.mjs` → 起草前 **EXIT=0 scanned 2484=cap 2484 恰等**（已亲跑）；落卷后 **EXIT=0 scanned 2485=cap 2485 恰等**（§3 联动已先行落位）。
2. `node scripts/ai-docs/public-text-policy.proof.mjs` → **12/12 EXIT=0**（2485 形 · 落位后亲跑）。
3. markers 门 → 改动集（本卷起草 3 tracked）五类标记词（词面运行时组装防自指 · 本卷不复抄词面）+ 行首冲突标记 **0 命中**。
4. 面收敛门 → `git diff --name-status origin/main..HEAD` 恰 **3 tracked**=`A ai-docs/delivery/harness/errata-session-1105-REQUEST.md` + `M scripts/ai-docs/public-text-policy.mjs` + `M scripts/ai-docs/public-text-policy.proof.mjs`；**产品码/迁移/runner/既有 proof/backlog/checklist/五目标卷/在飞四树零命中**（行使面全留 EXEC 期）。
5. EXEC 期（授权后）门：第 1-4 条复跑 + 行使面 diff 复核（五卷/backlog/checklist 各 append 点 numstat 逐行核+F9 `.log` 恰新件 blob 恒等 `fc861681b8b5…`）+ §2 落点行号对届时 tip 重 pin（漂则如实采新值 · 定性漂移即停）。
6. rev r1 增补落卷门（本席亲跑 2026-11-05）：`check-docs.mjs` **EXIT=0 scanned 2485=cap 2485 恰等** · PTP **12/12 EXIT=0**（`static_preflight_valid`）· markers=改动集新增字节五类标记词+行首冲突标记 **0 命中** · 面收敛=rev r1 commit 恰 1 tracked `.md`（本卷）· 六目标卷/issues-final/checklist/proof.mjs 零触（行使面留 EXEC 期）。

## §5 Ban 清单

Ban push/force-push/pull --rebase（git 写只本 worktree 起草 commit）· Ban 动主仓（主仓仅 worktree add 一次已行使）· Ban EXEC（九项行使面全留授权后）· Ban 触在飞树（`meetwise-perf`/`meetwise-pay`/`meetwise-uc31`/`meetwise-scoringeval` 零字节零触 · scoringeval 只读取 blob `fc861681`）· Ban Key 值触（零读值零落盘全程 name-only）· Ban self-approve（pre-exec 双审两独立外席 · alone≠dual）· Ban 翻任一 pin（十一值照抄零翻 · cap 项唯一豁免=随届值如实采）· Ban 洗 append-only 历史注与原文（全部 additive · backlog `:110`/`:111` 行原文零字节改写）· Ban 改行统计数值 · Ban 触产品码/迁移/runner/既有 proof · Ban 回改历史卷行号引用（落点重 pin 走注不洗原文）· Ban 在代码注释写任务号/刀号 · Ban secrets 入树 · Ban 落 `.md`/`.txt`/`.json` 收据（F9 沿 `.log`）· Ban 借本刀宣称任何 pins/hard gates/coveredCount 变化 · Ban retry-to-green · Ban 把 F6/F7 翻面/采认注写成二次翻面（各一次性行使）。

## §6 pins（十一值照抄同族卷 · EXEC/审查不得改口 · 本刀零翻转 · cap 项唯一豁免=随届值如实采）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务 + PostgresSaver + pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = **503** · `g7SuiteGreen=false`（F6 行撤销≠翻绿 · 本注零翻）· `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零模型外呼·零消耗·est live=0）。

**本卷附加钉**：九条核定面逐条亲读（§1 表 · 禁凭派单简报转述）· 行使注全部 additive（原文/前值零字节改写 · 前值史录保留）· F6 翻面/销案权行使源=协调方裁断（沿 err #196 先例形）· 在飞四树+Key 值零触（lane 铁律）· `cap=2485`（起草形恰等 · CAP-SANCTION-2485）· EXEC 期零新增受管件。

## §7 Non-claims

本刀 ≠ `:110`/`:111` 行原文任何字节改写（翻面/采认全走行区新注 · 原文零洗）≠ trio 翻绿 ≠ `g7SuiteGreen` 任一变化 ≠ F4 各勘注改 EX2/EX8 原文（读数实质零变仅措辞/补登/记法勘正）≠ F2 判读变更（锚类勘正）≠ F5 语义变更（两臂并列明示）≠ F10 判红或判绿（INCONCLUSIVE 维持 · 残面 OPEN 维持）≠ F9 收据内容改写（byte-identical 收编）≠ 在飞四树任何处置（删树/归档权归协调方）≠ 产品码/迁移/runner/既有 proof 触碰 ≠ pins/hard gates/coveredCount 任一变化 ≠ cap 策略变化（纯计数预算恰等步进）。drafted ≠ DONE（完成判定走 pre-exec dual + 协调方 EXEC 授权 + EXEC 期落点重 pin + post dual）。

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual`（2026-11-05 起草落卷即停 · pre-exec 双审两独立外席待派 → Dual PASS → 协调方明示 EXEC 授权后始有 EXEC · alone ≠ dual · 状态钉四处：Status 行+本节+§9+卷尾 · 同值）。** EXEC 行使三条款（逐项履行后始得行使）：① pre-exec 双审两独立外席 BOTH PASS 落卷（双审对象=§1 九条逐条证据链对届时 tip 复核+§2 九项行使文本逐字+§1.3 纪律核对）；② 协调方明示 EXEC 授权（行使面=§2 九项·F6 翻面/销案权已由协调方裁断随令预授·EXEC 期落字）；③ 落点行号重 pin 已履行（§2 各落点随届 tip 核对 · 漂则如实采新值 · 定性漂移即停）。

停止条件：`docs:check` scanned > cap（届值）红 → 停；PTP 红 → 停；行使落点行号与届时 tip 不符且无法重 pin → 停如实登记；任一核定证据在届时树不可复现（含 blob `fc861681`/`f6102433` 可解析性、`:110`/`:807` 行区同位、tail-close `:81` 措辞全形同位）→ 停 · 该条退回不适用；需越界（触在飞树/翻 pins/动产品码/洗 append-only 原文/读 Key 值）才能继续 → 停。

## §9 pre-exec dual 交接（预留 · 本节零 SSOT 触碰）

**本卷状态钉（第四处）**：**`draft:awaiting_pre_exec_dual`**（2026-11-05 起草落卷即停 · 与 Status 行/§8/卷尾三处同值 · pre-exec 双审两独立外席待派 · alone ≠ dual · 翻面/关账/销案终裁行使源=协调方）。

- **双审对象四件**：§0 登记源总表与在飞对账 · §1 九条核定表逐条证据链（对届时 tip 复核 · 含 blob/行号/引注亲读复现）· §2 九项行使文本逐字（F6 定谳案措辞对 tail-close `:81` 全形逐字节核+两处括注位核）· §3 四联动点+§4 门矩阵判据。
- **悬决项（归协调方）**：EXEC 排程 · F6 行值翻转落字 · F9 收编后 scoringeval 树处置（撤树/归档）· F10 后继改期重行使排程（供应商稳定窗口）· checklist 案 B 段与 `:1660` 族面③ 承引后继行使（均非本卷权）。
- **本卷落卷后事实基座不受后继裁决影响的部分**：§1 九条亲证读数系读数登记（原值记账零冲销）· F9 blob 亲证系机械事实。

## §9-r1 rev r1 增补注记（U6/U7/U9 采认行使项增补 · 本节零 SSOT 触碰）

**rev r1 增补登记（2026-11-05）**：协调方采认勘定席 U6/U7/U9 勘定建议（勘定席独立复验报告归档 `.tmp`·不入 git）→ 本卷 §2 增补行使项 **F11-F17 七项**（§1-R1 增补核定表七行随增）· 行使面=§2 九项+rev r1 七项=**十六项**（Status 行/§8 既有「九项」字面系起草时点值·史录保留·EXEC 期行使面以本注十六项口径为准）· **F16 勘定标的现值亲证已被后继 cap wave 等价覆盖→免行登记**（唯一非 append 行使项·零字节改）· F13 翻面行使源=协调方对账裁断（沿 rc #194 附记-丙超越裁定+rc 156 卷对账先例）· cap 2485 不变 · STOP/§8/§9/卷尾状态钉 `draft:awaiting_pre_exec_dual` 零翻 · pins 十一值零翻 · pre-exec 双审待派（双审对象随 §1-R1+§2 F11-F17 增补面扩）· alone ≠ dual。

- **双审增补对象（rev r1 面）**：§1-R1 七条核定表逐条证据链对届时 tip 复核 · §2 F11-F17 行使文本逐字（F13 翻面注对 §8 三行/§11 权威条款+rc 先例锚复核·F16 免行判定对 proof.mjs 联动区现值复核）· §3 rev r1 cap 对账行+§4 第 6 条门判据。
- **悬决项（归协调方·rev r1 面新增）**：F11/F12 闭卷注落卷后两卷行状态桶位翻面/关账裁断 · F13 翻面落字 · F14 归档后 g7-enoent-fix 卷处置 · s3-upload-caps 小刀排程（两帽承接近在飞）。
- **本卷落卷后事实基座不受后继裁决影响的部分（rev r1 面）**：§1-R1 七条亲证读数系读数登记（原值记账零冲销）· F13 0149 sha256 恒等亲算+改史三 commit is-ancestor 亲证系机械事实 · F16 现值亲证系机械事实。

---

*ERRATA-SESSION-1105 REQUEST · 2026-11-05 起草 · **`draft:awaiting_pre_exec_dual`**（起草落卷即停 · pre-exec 双审两独立外席待派 · alone≠dual · Dual PASS ≠ 开工）· base `origin/main` @`fd2b74635`（PR #205 `line/g7w-status-pin` 并线点 · fetch EXIT=0 · worktree `meetwise-errata` 亲立 · branch `line/errata-draft` · 建前同名树/分支/卷三查零命中）· 立项出处=协调方派单令「收编本会话全部已登记勘误+协调方裁断」· 九项行使=F1 fin U5c QGEN carrier 勘正（#110 非 #108·fin post-prove 席1①+席2①）+F2 qgen-reverify `invoke.ts` 锚 `:518`→`:519` 三处（`:86`/`:92`/`:190`·INSERT 失败不回滚实位 `:519`·`:518` 系 JSDoc 块首）+F3 qgen-reverify §9-exec 迁移窗前三快照口径闭合句（G7W 席2 P2）+F4 iso-dotenv-ui 三处勘注（EX2 计数同值/EX8① `.next` 协议内清理补行/杀窗 Z 后缀真 UTC=2026-11-04T18:45:44Z·IDU 席2 P2-A/B/C+席1 P3-a/P3-b）+F5 r2 §1.2 两臂并列明示（R2 席2 P2-A）+F6 backlog `:110` 行翻面 P1 OPEN→CLOSED（协调方采认 G7W-TAIL-CLOSE 闭合裁定·沿 err #196 先例·前值史录在注·定谳案措辞 tail-close `:81` 全形补两处括注）+F7 backlog `:111` 行内更新采认注（OPEN 维持·G7W J2-R2 归因未闭合如实）+F8 面③ sbg 不立项终裁注（tail-close §9 悬决项所指）+F9 scoringeval 收据收编（blob `fc861681` byte-identical→`receipts/scoring-eval-exec/01-scoring-eval-stdout.log`·.log 不计 cap·收编后该树可删·fin U8 补档条款）+F10 scoring-eval T-3 读数登记 INCONCLUSIVE 注（checklist scoring-eval/G7 区文件尾 append·当轮无读数不判红·单跑纪律）· CAP-SANCTION-2485 恰等步进预登（2484→2485·四联动点 2_485/f-2485.md/:2486）· 三门起草前亲跑全绿（docs EXIT=0 scanned 2484=cap 2484 恰等/PTP 12/12/markers 0）· 在飞四树+Key 值零触 · 迁移号=零 · est live=0 · actualSpendCny=null · pins 十一值照抄 · markers=0 · 停止条件五类全设 · Ban self-approve · pre-exec dual ≠ 开工 · ⛔push ⛔动主仓 · STOP*

*ERRATA-SESSION-1105 rev r1 · 2026-11-05 增补落卷 · 协调方采认勘定席 U6/U7/U9 勘定建议·七项行使增补落纸 §2（F11 extrev-deps-audit 闭卷注·S1/S2 材料面六锚亲证+S3 两帽窄化移交 s3-upload-caps 小刀+`.doc` 等价降 P2+收据未入仓披露 · F12 extrev-score-writer 闭卷注·S1/S2 四锚亲证+#41/#42/#43 后继刀等价覆盖+#47 归 assessment_report DDL 迁移顺带+adjudicateScoreCard 观察登记 · F13 money-status §8 三行对账翻面→closed·沿 rc #194 附记-丙超越裁定+rc 156 卷对账先例·0149 sha256 恒等亲算·改史三 commit 并线亲证·免 post-prove 双审空转 · F14 g7-enoent-fix 归档注·勘定选项 b·零旧路径残留亲证·不补状态行两读制可复算 · F15 AG-36 确认注·main 双锚一致无需处置+AG-32 引路径勘正 ai-graphs→apps/worker · F16 proof.mjs `:460` cap 联动数免行登记·已被后继 cap wave 等价覆盖现值亲证 · F17 U6 尾 3 draft+U7 处置登记源注 checklist 文件尾 append）· cap 2485 不变 · 三门 rev r1 亲跑全绿（docs EXIT=0 scanned 2485=cap 2485 恰等/PTP 12/12 EXIT=0/markers 0）· 状态钉四处 `draft:awaiting_pre_exec_dual` 零翻 · 行使面=十六项留 EXEC · 在飞树零触（s3caps 仅登记）· est live=0 · actualSpendCny=null · pins 十一值照抄 · ⛔push ⛔动主仓 · alone≠dual · STOP*
