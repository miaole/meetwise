# G7W-TAIL-CONTRACT-RULING REQUEST（G7W 案 B 契约裁定刀 · P1 · docs-only 三面 · 协调方已裁案 B 先行 · `:108` 勘误注记 EXEC 前卷 · `:107` 域零触 · STOP=`executed:awaiting_post_prove_dual`）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席落卷 2026-10-16 · pre-exec 双审会签 PASS（席1 `agent_2a18e53b`+席2 `agent_f8f5264f` · P2×6 随 EXEC 行使）+协调方 EXEC 授权 · merge `0253c595` 并 `origin/feat/mysql-schema-skeleton@7e8ada73` · 面① 三肢裁定落卷 §9-EXEC · 面② `:108` 勘误注落 backlog `:800`（行原文零字节改）· 三门全绿 · post-prove 双审两独立外席待派 · alone ≠ dual · ⛔push · Ban self-approve · est live=0 · `actualSpendCny=null` · 起草期原注=案裁决已落字案 B 先行（案 A 埋点若 B 不足再立）· draft 原文见 git `abd097ad`）

**席位**：G7W-TAIL-DEATH 案 B 契约裁定刀 起草席（协调方派单令 · 承 `line/g7w-tail-diag@7521e57d` 诊断卷两案并陈 · 协调方裁案 B）。
**基线**：`feat/mysql-schema-skeleton` @ **`0ff55592`**（fetch 后亲证 origin tip `origin/feat/mysql-schema-skeleton` = `0ff55592` **恰等派单下界**（≥ 以等号成立）· cap sanction 波 tip · `origin/main`（`c4244470`）系另一 lineage 不含本基线——两线分叉如实登记 · 本卷沿支树谱系承诊断卷形制）· worktree **`meetwise-g7b`**（仓根同级 · `git worktree add ../meetwise-g7b -b line/g7w-tail-contract-ruling` 本起草席立）· branch **`line/g7w-tail-contract-ruling`**。
**立项出处（不自建 SSOT 行——行翻面权沿例归协调方）**：①协调方裁案 B 派单令（案 B 先行=零 live 成本 docs-only 裁断+行勘误 · 案 A 埋点若 B 不足再立 · 裁断形指定=「老红证据不可回读·现树按设计行使·残余定性=契约边界承登」非翻面）；②诊断卷 `line/g7w-tail-diag@7521e57d`（REQUEST blob `790be3dd` · 该支在飞未并 ⛔push · 本卷只读承接零触碰零代推）其 §1-修法修B 三面即本卷三面授权源；③`ai-docs/delivery/gap-bug-backlog.md`（blob `1b8867b4`·915 行）`:108` GAP-G7W-API-TAIL-DEATH 行 P1 OPEN 原文（修复路径「driver 侧结构化失败埋点 或 withhold 契约裁定（二选一归协调方裁）」原文——本卷即「契约裁定」肢的承登行使）+ `:796` G7X 双面收敛注 + `:798` REMAP 行勘误注（append-only 单行 blockquote 先例形=本卷面② 形制源）；④sbg 件② 落盘先例：`line/e2e-runner-stale-build-guard` nail `d186dffc` 在本基线祖先链（`git merge-base --is-ancestor` 承诊断卷同法）· `scripts/run-e2e-ui.mjs` `:109`-`:136` 在树亲证；⑤结构范本 `harness/g7w-tail-diag-REQUEST.md`（姊妹卷 · §0/§1/§1.3/§2/§5/§8 形制承之）。

---

## §0 现状锚（起草席亲证 · 全部 rg/Read/sed/git ls-tree/merge-base/shasum 实测 @`0ff55592` · 后继 pre-exec dual/EXEC 面照本节对届时 tip 再重 pin——blob 漂移如实改锚·结论不变则只更行号；行锚漂移超 ±3 且结论受影响 → §8 停止条件①）

### 0.0 防重双对表（本 turn 实测）

- `git worktree list`：`meetwise-g7b` 名下**恰 1 树**=本树；`git branch --list "line/g7w-tail-contract-ruling"` 恰 1 命中=本席分支 · 零同名。
- `ls ai-docs/delivery/harness/ | grep g7w-tail-contract` 落卷前**零命中**（无同名卷）；`g7w-tail-diag-REQUEST.md` 在本基线树**零命中**（仅存于未并支 `7521e57d` · `git ls-tree HEAD` 亲证）——本卷与诊断卷卷名/分支名不同名、域相承不重叠。

### 0.1 blob 锚表（`git ls-tree` 亲算 · 8 hex · @`0ff55592` 亲读）

| # | 文件 | blob | 关键行锚（@`0ff55592` 亲读） |
|---|------|------|------|
| 1 | `ai-docs/delivery/gap-bug-backlog.md` | `1b8867b4`（与诊断卷 @`12b21412` 恒等·零漂移） | **`:108` 行 P1 OPEN 原文全文 intact**（面② append 对象 · 原文零字节改授权）· `:794` G7W nail 登记 · `:796` G7X 双面收敛注 · `:798` REMAP 行勘误注（**面② 先例形**：append-only 单行 blockquote · 「行原文零字节改写 · 行状态零翻转——P1 OPEN 维持 · 行翻面权沿例归协调方」头式）· 文件 915 行 |
| 2 | `ai-docs/delivery/execution-master-checklist.md` | `ebca921b`（诊断卷锚 `274b5d27` → SCN nail 波 +10 行漂移 · 如实改锚） | `:1383` G7X NAIL 段头（`/`-`:1392` errata 区 · 双面收敛定谳原文 intact）· `:1905` G7FIX-2 NAIL 段头（`/`-`:1914` · **首次全绿 EXIT=0/75 断言**+`:206` 语义纠+两次实发澄清定谳 intact · 行锚较诊断卷 `:1905`-`:1911` +3 内漂移 · 结论零影响）· 文件 3098 行 |
| 3 | `receipts/archive/2026-09-batch23/receipts/g7w-golden-api-discriminator/02-exp2-cmd1-sidecar.md` | `5212c5f4`（与诊断卷恒等） | 老红面原始证据（EXEC `7db84c18`≡origin 孪生 `a4e49b8a` · 38013ms · reviewLedger 恰 2 行零 worker terminal 行 · 精确断言原文不可回读）· 详 §0.2 帧源 D 承接 |
| 4 | `scripts/run-e2e-isolated.mjs` | `0787a7ff`（恒等） | **面① 审查对象·iso wrapper**：`:2861`-`:2887` `runFullE2E`（stdout 仅内存暂存供 `evaluateIsolatedHttpE2E` 固定格式判读 · raw 永不落盘永不回显）· **`:2866` stderr 回调即弃**（「stderr（标准错误）永不转存或回显；错误结果只由退出码和安全回执表达」原文）· `:2873`-`:2875` accept 面仅结构化 token 三行（final summary/review 计数/review codes）· `:2877` failure 面仅 class 一行 · `:2914`-`:2923` 容器失败诊断（docker state/logs 有界捕获→`label_bytes=N` 摘要）· **`:2922` `ISOLATED_POSTGRES_OUTPUT_WITHHELD`** · `:3013`-`:3014` receipt 目录 `0o700` · `:3050`-`:3051` receipt 写盘 `0o600`+wx+rename 原子 · `:3119`/`:3164` reviewLedger 结构化行入 receipt（仅 class/code 对 · 零 raw） |
| 5 | `scripts/run-e2e.mjs` | `94cbd5be`（恒等） | **面① 审查对象·非隔离 wrapper**：`:83`-`:89` `tailAppend` 只计 chunks/bytes 不存内容（注释原文=子进程输出不可信论）· `:90`-`:93` `emitFailureDiagnostics` 仅 `E2E_PROCESS_OUTPUT_WITHHELD process=* chunks=N bytes=N` · `:97`-`:98` `E2E_VERBOSE` 门实时转发不落盘 |
| 6 | `scripts/run-e2e-ui.mjs` | `3ceb6f14` | **sbg 件② 落盘先例（在树）**：`:109`-`:136` web-build 非零退出时扣留输出保留尾缓冲（≤400 行/≤64KiB 先触为准）落 `.tmp/e2e-ui-build-log/<ts>.log`（gitignored · `0o600` · 注释自证沿 `run-e2e-isolated :3050` 先例）+同缓冲 stderr 回放 · 构建成功零写盘 · 落盘失败退回只计数（fail-closed 不降级） |
| 7 | `scripts/e2e-platform/secret-redaction.mjs` | `2e51284c` | `:52`-`:59` RUNNER_WITHHOLD 合同=runner 源**恒含** withheld marker 否则 `child_output_must_be_withheld_as_byte_counts`（fail-closed 机制守卫=契约非君子约定之本证） |
| 8 | `scripts/withheld-output.mjs` | `caefe488` | `:6`-`:9` 摘要只出 `label_bytes=N`（禁 preview/hash/slice） |
| 9 | `e2e/full.e2e.ts` | `4cb481aa`（恒等） | `:206` 现行 provenance 断言（澄清感知 · G7FIX-2 语义纠后形态）· `:201`-`:203` 老面恒 False 断言 era 位（G7X 定谳承认面） |
| 10 | `packages/db/src/report/report.ts` | `c6ccd01c`（恒等） | `:10` `MAX_REPORT_ATTEMPTS = 3`（报告链设计钟现值码锚） |
| 11 | `ai-docs/delivery/harness/g7k-reds-remap-REQUEST.md` | `4c81d7e9`（恒等） | 姊妹卷 · 其 `:798` 注记形制与 §0.2 D2 转录机制源 |
| 12 | `ai-docs/delivery/harness/g7w-tail-diag-REQUEST.md` | `790be3dd` @`7521e57d`（**不在本基线树** · 跨支锚） | 诊断卷=本卷直接前卷（两案并陈+三因子+`.tmp` 六件转录载体 §0.2）· 该支 `⛔push` 在飞 · 本卷零代推零改写 |

### 0.2 证据基座承接（D2 机制 · 起草席今日重 pin）

诊断卷 §0.2 六件转录系受管载体（帧源 A consent 探针三 boot / 帧源 B 7a_diag 两 boot 五帧 / 帧源 C 五 machine receipt / 帧源 D 老红归档件）——本卷**逐字承接零改写**（Ban 转录漂移）；原件重 pin 本席今日亲证：`.tmp` 四件 NDJSON/log sha256 前缀 `158fd5a4c1d9`/`793670595204`/`29b6784fb18c`/`219f15081ea6` **与诊断卷记录值四值恒等**（原件在主检出路径 `.tmp/` 下 · 每树各异如实登记）+ 五 receipt `2026-10-15T…{31799,32988,36022,49005,56713}*.json` 在盘亲证 + 老红归档件 blob `5212c5f4` 恒等（§0.1 #3）。D2 条款沿承：原件灭失不废止转录效力——本卷裁决面不依赖原件在盘。

## §1 裁断链（三因子并陈 + 协调方裁断形 + 案 B 三面范围）

1. **三因子并陈（承诊断卷 §1 · 零翻转零改写）**：主读=**修法消除**（老面抛点 `:201`-`:203` 恒 False 算术 · G7X 双面收敛 C-MO-P3 定谳（checklist `:1383`-`:1392`）+ G7FIX-2 `:206` 语义纠落地+首次全绿 EXIT=0/75 断言干预性确认（checklist `:1905`-`:1914`））；次读=**今日样本面前预占**（今日 ×6 run 批判门单发终场早败 · 尾段 in-driver 未达 · 负样本深度限位）；保留=**环境混杂未全排除**（ISO 隔离修复前产物+树/模型漂移未逐项排除）。**两向 Ban 维持**：「永不复现」与「纯间歇挂起」均不定谳（本卷非翻面卷 · 定谳权归协调方）。
2. **协调方裁断形（承登）**：**「老红证据不可回读 · 现树按设计行使 · 残余定性=契约边界承登」非翻面**——老红精确断言原文在 withhold 契约内永久不可回读（38013ms 簇 · reviewLedger 恰 2 行零 worker terminal 行 · 容器即毁）；今日未复现（修法消除主读+面前预占次读）；尾段按设计臂行使零 uncaught throw（探针臂 finalize 200 `assessment_unavailable`/retry 409 per-design · 探针绿≠in-driver 绿 Ban 在案）。
3. **案 B 三面范围（协调方裁案 B 先行）**：面①=deadletter 设计审查（docs-only · 本卷承载 · 本起草席已行使 · 只裁断不实施）；面②=`:108` append 勘误注记（docs-only · EXEC 期落卷 · 授权包络 +2~+8/−0 · est live=0 · 行翻面权仍归协调方）；面③=scoped readback 微刀（**另立登记不并入** · 可选 · §1-修法面③）。
4. **域独立性（沿 `:798` 行 Ban 条款）**：本行与 `:107` REMAP 换形域独立不同根不可互代位 · Ban 洗 `:107` 入本行 · Ban 追认 G7S/G7U 时点内容 · Ban 归因今日批判门红面于本行（域 disjoint）· 与 CMOP03-POST7B/7A-DOWNGRADE/`:109` 域 disjoint。

## §1-修法（案 B 三面 · 面① 本卷落卷 · 面② EXEC 期落卷 · 面③ 另立登记）

### 面① · bare-stdout deadletter 设计审查（docs-only · 审查结论落本卷 · 只裁断不实施）

**读码记录（§0.1 #4-#8 五文件亲读 · `0ff55592`）**：iso wrapper（`run-e2e-isolated.mjs` `0787a7ff`）=stdout 仅内存暂存供固定格式判读、raw 零落盘零回显、stderr 回调即弃（`:2866` 原文）、输出面仅三类结构化 token（accept 三行/failure 一行/receipt 结构化字段）、容器诊断降为 `label_bytes=N` 摘要（`:2922`）、receipt 结构化字段入 `.tmp` `0o600` 原子写（`:3013`-`:3051`）；非隔离 wrapper（`run-e2e.mjs` `94cbd5be`）=`tailAppend` 计数不存内容（`:83`-`:89`）+失败仅打字节摘要（`:92`）+`E2E_VERBOSE` 实时门不落盘（`:97`-`:98`）。**契约守卫=fail-closed 机制强制非君子约定**：`secret-redaction.mjs` `:52`-`:59` 源级恒含 marker 硬检查（违者 `child_output_must_be_withheld_as_byte_counts`）+`withheld-output.mjs` `:6`-`:9` 摘要只出字节数禁 preview/hash/slice。**sbg 件② 先例对照**（`run-e2e-ui.mjs` `3ceb6f14` `:109`-`:136` · sbg nail `d186dffc` 在祖先链）：扣留缺省不变+非零退出旁路落盘（尾上限 ≤400 行/≤64KiB · gitignored · `0o600` · 成功零写盘 · 写盘失败退回只计数）——先例证明「扣留合同全保留+失败旁路落盘」两不相破。

**面① 裁定（三肢 · 裁断不实施）**：
1. **withhold 保全肢=适切 · 维持缺省**：G7W 类长跑 iso 面（真模型 · 不可信子进程输出=答案/prompt/token/provider 回显）的三威胁（反伪造/防 case 名回读/防密钥入 CI 日志）均长期在场，该设计有源级 fail-closed 守卫——撤除面大、伪造面关闭，对长跑面**适切性成立，保全为缺省裁定**。
2. **诊断盲区肢=真实但有界 · 已有补偿通道**：verbatim 断言原文永久不可回读系真实盲区（=本行甄别的根限位 · G7W-era 即登记「精确断言原文不可回读」）；但结构化 deadletter 面（`E2E_FAILURE_CLASS`/reviewLedger class+code 行/字节计数/receipt 结构化字段）已承载**类级归因**——老 reviewLedger 恰 2 行零 worker terminal 行本身即 withhold 契约内的定谳性读数（死亡早于 worker 终态面）；G7W 行甄别力缺项已由 G7X 双面收敛+G7FIX-2 干预确认+今日按设计臂行使链补足（诊断卷 §1）——**盲区不阻断本行勘误（面②），只阻断「回读直证」式收口**。
3. **sbg 先例推广肢=技术上可推广 · 须走面③ · 不随本卷 · 不作为缺省**：先例与 withhold 合同相容（withheld marker 与字节计数面照旧保留 · 失败-only · fail-closed 退回）；G7W 长跑面落盘边际价值高于 web-build 面（est live≈7/run 且非确定性 vs 构建重跑廉价 · 失败现场随容器即毁不可重放）——**动机成立**；但推广到 CMD1 iso HTTP E2E 面=withhold 契约变更而非仪器修补，须面③ 独立微刀全授权链，本卷零实施零并入。

### 面② · `:108` append 勘误注记草案（EXEC 期落卷 · 授权包络 +2~+8/−0 · 原文零字节改 · est live=0 · 行翻面/关闭宣称权仍归协调方）

注记全文草案如次（沿 `:798` REMAP 勘误注先例形 · 单行 blockquote append 于 `:108` 行附近 · 行首日期 EXEC 期按落字日 re-pin · 落卷 +N 以 numstat 实测为准 · 授权帽 +8/−0 · 先例系单行注 · 1~2 行均在包络内）：

> **2026-10-16 · G7W-TAIL-CONTRACT-RULING 行勘误注（append-only · `:108` GAP-G7W-API-TAIL-DEATH 行 · 本行原文零字节改写 · 行状态零翻转——P1 OPEN 维持 · 行翻面权沿例归协调方）**: 案 B 契约裁定刀（协调方裁案 B 先行 · 承 `line/g7w-tail-diag@7521e57d` 两案并陈 · 卷 `harness/g7w-tail-contract-ruling-REQUEST.md` §1-修法）——**老红证据 withhold 永久不可回读·现树按设计行使未复现·残余定性=契约边界承登·P1 行状态沿例归协调方裁·非翻面**。依据链（非回读直证 · 如实登记）：诊断卷 §1 三因子（主读修法消除=`:201`-`:203` 恒 False 断言 G7X 双面收敛 C-MO-P3 定谳+G7FIX-2 `:206` 语义纠落地+首次全绿干预确认；次读面前预占=今日 ×6 run 批判门早败尾段未达；边界环境混杂保留=两向 Ban 维持——「永不复现」与「纯间歇挂起」均不定谳）+ 尾段直连探针按设计臂行使零 uncaught throw（finalize 200 `assessment_unavailable`/retry 409 · 探针绿≠in-driver 绿 Ban 承认在案）+ 老 reviewLedger 恰 2 行零 worker terminal 行=withhold 契约内类级定谳读数（38013ms 簇 · 容器即毁）；行修复路径原文「driver 侧结构化失败埋点 或 withhold 契约裁定（二选一）」之「契约裁定」肢由本注承登行使，「埋点」肢=案 A 独立域**不因本注灭失**；面① 裁定=withhold 保全适切维持缺省 · 盲区有界由归因链补偿 · sbg 落盘先例推广须面③ 独立微刀；Ban 洗 `:107` 入本行 · Ban 追认 G7S/G7U 时点内容（容器即毁不可回溯）· 行关闭仍须其自身全链+协调方裁.

### 面③ · scoped deadletter-readback 契约微刀（另立登记 · 不并入本卷）

若协调方裁需 scoped readback 契约例外（红-only 预注册 · fail-closed 缺省不变 · `0600`/gitignored `.tmp` · 尾上限 · 沿 `run-e2e-isolated.mjs:3013`-`:3051`+sbg 件② 同形）→ 独立微刀 `run-e2e-isolated.mjs`（ISO-DOTENV 形制 · +3~+10/−1 · 确认 run 如需 est live≈7）——**须独立新 REQUEST+pre-exec dual+协调方授权，本卷零代立零预支**（§1.3-1 同款适用于其 live 成本前置核）。

**量级总览**：本卷（面① 审查卷）=docs-only 恰 1 新 .md；面②=docs-only +2~+8/−0（est live=0）；面③=另立（+3~+10/−1 · est live≈7 如需确认 run）；案 A=不并本卷（§1.3-1）。

## §1.3 否决清单（veto · 双审/裁决/EXEC 违反任一即 FAIL）

1. **Ban 案 A 并行本卷**：案 A（driver 结构化埋点刀）est live≈7 且其 live 成本前置未核（判别 run 可达性受 `:107` 域批判门终场预占——诊断卷 §1-修法修A 前置依赖原文）——本卷 docs-only est live=0，案 A 并行使本卷预算与边界双失真 → **Ban 本卷并案并行**；案 A 须自立 REQUEST 全链（协调方若后裁并案亦以各自独立卷分账）。
2. **Ban 直接翻面**：老红证据 withhold 契约内永久不可回读=回读直证永不可得——行翻面/关闭宣称无直证基础 → **Ban 本卷直接翻面 `:108`**；行状态沿例归协调方裁（勘误注记≠翻面 · 面② 头式「行状态零翻转」原文即 Ban 项）。
3. **Ban 触 `:108` 行原文任何字节**（append 注记形不洗原文 · 承 REMAP §1.3 同款）· Ban 删行洗史 · **Ban 洗 `:107` 入本行 / Ban 追认 G7S/G7U 时点内容 / Ban 就地定谳断言内容**（`:108` 行 Ban 条款逐字承）· Ban 归因今日批判门红面于本行。
4. **Ban 以探针臂绿代 in-driver 绿** · Ban retry-to-green/Ban 只留绿 attempt · **Ban 两向单因定谳**（「永不复现」与「纯间歇挂起」均超本卷授权）· **Ban self-approve**（pre-exec dual 归协调方派两独立外席 · alone ≠ dual）· **Ban 转录漂移**（§0.2 六件承接零改写）。

## §2 门矩阵（docs-only 起草卷形 · 每条可独立判定 · 本席落卷期全跑）

| # | 门 | 命令/判据 | 判定 |
|---|-----|-----------|------|
| 1 | docs:check | `node scripts/ai-docs/check-docs.mjs` | **EXIT=0**（起草基线亲跑：2165 managed ≤ cap 2184（`public-text-policy.mjs:98` MAX_FILES=2_184 亲证）· 落卷后预期 2166 ≤ 2184 · 本卷系唯一新增受管件） |
| 2 | markers 五类 | 改动集 grep（词族=`scripts/i6-239-gates.proof.mjs:151-163` 运行时组装四词+冲突标记对 · **词面本卷不复抄防自匹配**） | **零新增命中**（改动集恰 1 .md） |
| 3 | diff 面 | `git diff --numstat HEAD~1 HEAD`（落卷后） | **恰 1 tracked 新件=本卷 .md · +N/−0 纯新增 · 零他 tracked 路径零删改**（SSOT 原文零触机检：backlog/checklist 对 HEAD 零 delta） |

docs-only 边界：本刀零产品码零 spec 零夹具零迁移零占号零锁文件；typecheck/lint/证明体等重门**不在本刀矩阵**（零码刀 · 沿诊断卷/REMAP 姊妹卷 docs-only 形制）。EXEC 面（后继工序·非本卷）门=本矩阵三条 + diff 面改判「恰 2 tracked .md=本卷已并链+backlog append +N/−0 · backlog 对其前 commit 恰 append 零洗改」。

## §3 范围外（边界清单 · 越界即 FAIL）

1. `:108` 行本体改写与行翻面/关闭宣称——裁定与翻面权归协调方（§1.3-2/3 · 面② 仅 append 注记草案）。
2. withhold 契约码面全家（`run-e2e-isolated.mjs`/`run-e2e.mjs`/`run-e2e-ui.mjs`/`secret-redaction.mjs`/`withheld-output.mjs`）——本卷只读审查引用零触碰（面③ 另立 · 案 B 裁断不实施）。
3. 案 A 域（`e2e/full.e2e.ts` 埋点面）与 `:107` 行域、`:109` 行域、CMOP03-POST7B/7A-DOWNGRADE 域——只读引用零归因零改写零代立。
4. 诊断卷支 `line/g7w-tail-diag`（在飞 ⛔push）与前刀支 `line/g7w-tail-death`（未并 · 终态 documented-inconclusive）——零代推零改写零复活（承卷引用而已）。
5. 产品码/迁移（链顶 0204 冻结）+ 共享 SSOT 其余全部行/行统计/LEDGER/矩阵——只读零触。

## §4 依赖与迁移号

零新依赖——承重锚全部已在树/在卷/在 `.tmp` 重 pin（§0）。**迁移号=零**（docs-only · 现树 max=0204 · 不预占任何号）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写操作只在本 worktree 一次 docs commit）；Ban coding（零产品码/零脚本/零 spec/零夹具/零迁移）；Ban self-approve（pre-exec dual 归协调方派两独立外席 · alone≠dual）；Ban 案 A 并行本卷（§1.3-1）；Ban 直接翻面（§1.3-2）；Ban 直改 `:108` 行原文任何字节；Ban 删除行（洗史 Ban）；Ban 洗 `:107` 入本行/Ban 追认 G7S/G7U 时点内容/Ban 就地定谳断言内容（`:108` Ban 条款承）；Ban 以探针臂绿代 in-driver 绿；Ban 两向单因定谳；Ban 转录漂移（§0.2 承接零改写）；Ban retry-to-green/Ban 只留绿 attempt；Ban 触 §3 全部域；Ban Key 物料（`.env*`/值/fingerprint 入树入据 · `.tmp` 引用 name-only/字段级）；Ban 预占迁移号。

**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零调用零消耗）。

## §6 est live=0

本卷零模型真实外呼零 DB 连接零容器：起草 turn 全只读（rg/Read/sed/git/`.tmp` 件 shasum）；落卷期门行使面=docs:check+markers+git diff（全本地零外呼）；面② 落卷 est live=0（纯 append）；面③/案 A 之确认/判别 run est 各随其 REQUEST（本卷不预支预算）。`actualSpendCny=null`。

## §7 markers=0（卫生声明）

本刀改动集恰 1 .md，五类标记词起草席亲跑 grep 零新增（命令与回执随交付报告；五类标记词不在卷内复抄，避免自匹配——沿诊断卷/REMAP 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 停止条件

**STOP · `executed:awaiting_post_prove_dual`（EXEC 席 2026-10-16 终态翻转 · 原 `draft:awaiting_pre_exec_dual` · 实测翻面四处=卷头标题行+本 Status 行+§8+卷尾，较起草自述「三处」多标题行一处·如实登记 §9-EXEC⑨）· 起草席写完即停零码动条款已行使完毕。** 开工三条款：①本卷 pre-exec 双审 BOTH PASS（双审对象=面① 读码裁定三肢+面② 注记草案逐字+§0 锚保真+§1 裁断链 · 两独立外席 · alone ≠ dual）；②协调方 EXEC 授权（面② 落卷时 `:108` append 日期按落字日 re-pin · +N 以 numstat 实测）；③post 双审+行状态归协调方裁。三者全属后继工序 · 本卷不含 EXEC。

**停止条件（四类 · 命中即停手上报）**：
1. **现场漂移**：pre-exec/EXEC 面对届时 tip 重 pin——`:108` 行被翻面/他刀插入注记、`:798` 先例形被改写、或 §0 锚漂移超 ±3 且结论受影响 → 停手上报（不得就地改裁断实质）。
2. **机制不满足**：若新读数推翻裁断链任一承重环（如 G7FIX-2 首次全绿被复跑推翻、今日探针按设计臂被重裁、或 withhold 守卫面被他刀改动）→ 停手上报回炉（不得就地改定性）。
3. **越界需要**：执行中若需触 §3 任何域（`:108` 原文/withhold 码面/案 A 域/前刀支/产品码）→ 停手上报。
4. **验收红不可修**：docs:check/markers/diff 面任一门红且无法在本刀范围内归因修复 → 停手上报（Ban 为绿放宽门）。

---

## §9 pre-exec dual 交接（预留 · 本节零 SSOT 触碰）

- **双审对象四件**：面① 读码记录与三肢裁定（§1-修法面① · 对照 §0.1 #4-#8 五文件届时 blob 复核）· 面② 注记草案逐字（核心句「老红证据 withhold 永久不可回读·现树按设计行使未复现·残余定性=契约边界承登·P1 行状态沿例归协调方裁·非翻面」零改写授权）· §0 锚保真（含 checklist `ebca921b` +3 行漂移登记）· §1 裁断链与两向 Ban。
- **悬决项（归协调方）**：面② EXEC 排程 · 面③ 是否立项 · 案 A 是否后续并裁（三枝互斥或并裁均由协调方定 · 本卷零代裁）。
- **本卷落卷后事实基座不受后继裁决影响的部分**：§0 全节读数+§0.2 重 pin 值系读数登记（原值记账零冲销）。

### §9-EXEC EXEC 席执行记录（docs-only 面①+面② · 2026-10-16 EXEC 席落卷 · append 保史 · §0-§8 上文零字洗改——STOP 翻面系状态字段行使非洗改 · 席位=协调方派单 EXEC 席）

- **① 授权链**：起草 `abd097ad`（STOP=`draft:awaiting_pre_exec_dual`）→ pre-exec 双审会签 **PASS**（两独立外席 · 席1 `agent_2a18e53b`+席2 `agent_f8f5264f` · P2×6 随卷）→ 协调方 EXEC 授权（P2×6 随 EXEC 行使）→ 本席 EXEC 落卷。alone ≠ dual 全程未犯 · Ban self-approve 未犯。
- **② 序1 并线**：`git fetch`+`git merge --no-ff origin/feat/mysql-schema-skeleton`——fetch 后 origin tip=`7e8ada73`（dbacl2-ci-wire nail · 派单下界「届时 tip≥dcw nail 波 tip」以等号成立）→ **merge=`0253c595`**（ort 零冲突 · 12 files +1058/−17 · 冲突沿并集解预置未触发 · ⛔pull --rebase 未用）。
- **③ §0 全量重 pin（P2-F · 对 merge 后树 `0253c595` 亲证）**：§0.1 十二锚——#3-#12 十件 blob 恒等（`5212c5f4`/`0787a7ff`/`94cbd5be`/`3ceb6f14`/`2e51284c`/`caefe488`/`4cb481aa`/`c6ccd01c`/`4c81d7e9`/诊断卷 `790be3dd`@`7521e57d` 跨支恒等）；#1 backlog `1b8867b4`→`2ff5d685`（915→917 行 · +2 系 dcw 波 DBACL2-CI-WIRE L-06 收口注 `:910` 起 append · **`:107`/`:108`/`:109` 行与 `:794`/`:796`/`:798`/`:800` 链锚零漂亲证——协调方预证兑现）；#2 checklist `ebca921b`→`368f1b8f`（3098→3129 行 · +31 系 qgen/rkw/dbacl2 三 nail 段 · `:1383` G7X/`:1905` G7FIX-2 段头零漂亲证）——两 blob 漂移均系他刀 append 所致、本卷结论零影响。§0.2 四 sha256 前缀 `158fd5a4c1d9`/`793670595204`/`29b6784fb18c`/`219f15081ea6` 对主检出 `.tmp` 原件重算四值恒等+五 receipt `2026-10-15T…{31799,32988,36022,49005,56713}*.json` 在盘亲证。停止条件① 未触发。
- **④ P2×6 行使落点**：**P2-D** 注记落位=`:798` 注记链块内「`:798` 注后」（现 backlog `:800` · 单行 blockquote+前后空行沿 `:798` REMAP 先例物理形态 · **`:108`/`:109` 表格行间零插入**）；**P2-A** 注记「原文」引文逐字补齐为「driver 侧结构化失败埋点 或 withhold 契约裁定（二选一归协调方裁）」（对 `:108` 行现值亲读核一 · 未取去标签臂）；**P2-B** 注记 `:201`-`:203` 处补括注「（现树断言体=:205-:207）」（`full.e2e.ts` `4cb481aa` blob 恒等下亲读 ：205-:207=provenance 断言体三行）；**P2-C** sbg 件② 块引锚 `:109`-`:136` 改 **`:108`-`:138`**（`run-e2e-ui.mjs` `3ceb6f14` blob 恒等下亲读：件② 注释头 :108 起 · writeBuildLog 收 `};` :138 止）；**P2-E** 停泊支触面交叠登记（见⑥）；**P2-F**=③ 全量重 pin。
- **⑤ 面① 三肢裁定转录（落卷 · 裁断不实施 · 零码触）**：肢一=**withhold 保全适切维持缺省**（三威胁长期在场+源级 fail-closed 守卫 `secret-redaction.mjs:52-59`+摘要只出字节数 `withheld-output.mjs:6-9`）；肢二=**诊断盲区真实但有界·已有补偿通道**（iso wrapper `0787a7ff` `:2866` stderr 即弃/`:2922` WITHHELD/`:3013`-`:3051` receipt `0o600` 原子写；非隔离 wrapper `94cbd5be` `:83`-`:89` tailAppend 计数不存内容——结构化 deadletter 面已承载类级归因 · 盲区不阻断面② 勘误、只阻断「回读直证」式收口）；肢三=**sbg 先例技术上可推广须走面③ · 不随本卷不作缺省**（`run-e2e-ui.mjs` `3ceb6f14` `:108`-`:138` · sbg nail `d186dffc` 在祖先链）。§1-修法面① 读码记录全文承本转录，blob 恒等故行锚零漂（P2-C 块引锚除外）。
- **⑥ P2-E 停泊支触面交叠登记**：`line/g7w-tail-death`（tip `266367af` · 在飞 ⛔push 未并）其 backlog 触面 hunks 实测三处=`:105`-`:111`（`:108` 行区改写）+`:795`-`:802`+文件尾 `:891`-`:913`——本刀注记物理落 `:800` 纯 append（与其 hunks 零字节交叠）而域上同属 `:108` 行面，与该支 `:105`-`:111` 触面**交叠如实登记**；该支若后续并线，须对本注锚与本卷锚表重核（本卷零代推零改写维持）。
- **⑦ 面② 落卷实绩**：注记全文=§1-修法草案逐字+P2-A+P2-B（程序化转录自本卷草案行防手抄漂移 · §1-修法草案行保持起草期原貌不洗）· append backlog +2/−0（1 注行+1 空行 · 现 `:800`）· **`:108` 行原文零字节改写（diff −0 行亲证）· 行状态零翻转 P1 OPEN 维持 · 行翻面/关闭宣称权归协调方** · 行首日期按落字日 re-pin=2026-10-16（与起草值恒等）。
- **⑧ 门矩阵三项（本席亲跑）**：docs:check **EXIT=0 `2170`≤cap `2184`**（`public-text-policy.mjs` MAX_FILES=2_184 · 余量 14）；markers 五类改动集新增行零命中（词族运行时组装四词+冲突标记对 · 卷内不复抄防自匹配）；diff **恰 2 tracked .md**=backlog +2/−0 纯 append+本卷 +17/−4（−4 系 STOP 四处状态字段翻面 · backlog 对 merge 后基线恰 append 零洗改）。
- **⑨ 偏离清单（理想零 · 实二 · 均不改裁断实质）**：(a) STOP 翻面实测**四处**（卷头标题行+Status 行+§8+卷尾）较卷面自述「三处」多标题行一处——标题行亦载 STOP 值，不翻则残留死值（qgen 卷 §9-POST P3-A 同类 cosmetic 教训）· 一并翻转如实登记；(b) P2-B 括注除 backlog 注记外亦施于本 §9-⑤/④ 转录（同锚引文多落点同值防口径分叉）。
- **⑩ STOP 终态**：**`executed:awaiting_post_prove_dual`**（四处实测一致）——post-prove 双审两独立外席待派 · alone ≠ dual · 本席 ⛔push ⛔merge 主线 ⛔force push 未用 · est live=0 · `actualSpendCny=null`。

---

*G7W-TAIL-CONTRACT-RULING REQUEST · 2026-10-16 起草 · **`executed:awaiting_post_prove_dual`**（EXEC 席 2026-10-16 终态翻转 · 原 `draft:awaiting_pre_exec_dual`）· ⛔push ⛔merge 主线 · alone ≠ dual · base `feat/mysql-schema-skeleton` @`0ff55592`（=fetch 后 origin/支树 tip 恰等派单下界 · origin/main 另 lineage 分叉如实登记）· worktree `meetwise-g7b` · branch `line/g7w-tail-contract-ruling`（建前零同名树/同名分支/同名卷三查亲证）· 立项出处=协调方裁案 B 派单令+诊断卷 `line/g7w-tail-diag@7521e57d`（`790be3dd`）修B 三面+backlog `:108`/`:794`/`:796`/`:798`+sbg nail `d186dffc` 件② 先例（在树 `3ceb6f14`）· 裁断形=「老红证据不可回读·现树按设计行使·残余定性=契约边界承登」非翻面 · 三因子并陈+两向 Ban 零翻转 · 面①=withhold 保全适切维持/盲区有界归因链补偿/sbg 先例可推广须走面③ · 面②=append 勘误注草案 +2~+8/−0（est live=0）· 面③=另立登记不并入（+3~+10/−1）· 门矩阵=docs:check 2165≤2184+markers+diff 恰 1（docs-only）· 迁移号=零 · est live=0 · pins 十一值照抄 · markers=0 · 停止条件四类全设 · Ban self-approve · pre-exec dual ≠ 开工 · STOP*
