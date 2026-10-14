# G7K-API-REDS REQUEST（产品刀 · 北星关键路 · 三红修法映射固化 + 残余产品面裁决包 · docs-only 零码零迁移）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 已施工 · docs-only 零码零迁移维持 · Ban coding · trio 实跑/live 复验未行使（§9 如实登记） · **⛔push** · Ban 假绿/Ban retry-to-green · Ban 洗绿/Ban 为绿改产品/Ban 为绿改断言 · Ban 改 withhold 机制 · Ban self-approve · alone ≠ dual · 待 post-prove 双审两外席 · 本 commit 不预claim 任何 post-commit EXIT）

**席位**：G7K-API-REDS 产品刀 REQUEST 起草席（协调方指名派单 · 北星四门禁单点关键路刀）。
**基线**：`feat/mysql-schema-skeleton` @ **`f0147886`**（pull 后主线 tip 实测 · 本地与 origin 全等 fetch 亲证 · 2026-10-13 提交链）· worktree **`meetwise-g7k`**（仓根同级 · `git worktree add ../meetwise-g7k -b line/g7k-api-reds feat/mysql-schema-skeleton` 本起草席立 · 建前 worktree list + branch 双查实测无同名树无同名分支）· branch **`line/g7k-api-reds`**。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单令（G7K-API-REDS 产品刀 · 修法=「begin 面 route snapshot 供给补齐 + adaptive_role_route_missing 消费面语义复核 + 三红面逐条修法映射」· §8 裁决项=快照写入时点/失败降级语义/三红是否同刀 · 迁移号按需预期零或 0188）；②`ai-docs/delivery/gap-bug-backlog.md`（blob `1ff80870`）**`:107` GAP-G7K-API-REDS 行 P1 OPEN 原文**（三红=recruiting-bound bind 30s timeout ×2 / uc018-abandon 409≠200 ×2 / iso HTTP api 红面 case 名 withheld）+ 登记链 **`:781`**（G7K trio keyed 收据立卷 · REQUEST `19df4e7f` · 实跑 code `8c6860e3` · trio EXIT 1/1/1）· **`:787`**（F-F 根因定谳=`interview_job.last_error=adaptive_role_route_missing` fail-closed 门 + 通用 begin 面 route snapshot 零写=产品供给面缺口 · 修复路线排序 产品刀＞夹具刀＞opt-out）· **`:788`**（G7S 通用 begin 供给面收口产品刀 **修复落地登记**）· **`:790`**（G7T classify 质量修复 + 红①构成变更）· **`:792`**（G7U 时序面夹具落地 + 残红后移）· **`:794`**（G7W 双甄别 + 双新行立行）· **`:796`**（G7X 根因收敛 + 双刀立项）· **`:798`/`:802`**（QGEN-P2 OB-3 行使）· **`:842`**（G7W-G 残红②判读）· **`:776`**（GAP-PRIV-02 resume 503 臂退役）· **`:826`/`:828`/`:832`**（GAP-CMOP03-POST7B 立行）；③`ai-docs/delivery/execution-master-checklist.md`（blob `57f92642`）nail 节链 `:1250`（G7K）/:1305（F-F）/**`:1315`（G7S）**/:1326（G7T）/:1337（G7U）/:1348（G7W）/:1360（G7V）/:1372（G7X）/:1415（QGEN-P2）/:1429（G7V-FIX）/:1457（CMOP03-FIX 刀①）/:1514（CMOP03-E 刀②）/:1501（G7W-G）/:2099（G7TRIO-2）/:2129（NEGRESFIX）；④收据链 `receipts/archive/2026-09-batch23/receipts/g7-trio-keyed/`（SUMMARY + 3 per-CMD · G7K 三红原文锚）；⑤结构范本 `harness/ag-d-admission-REQUEST.md` §0 锚表形制。

**门预申明（EXEC 期 · 授权后方可行 · 本起草 turn 零执行）**：neg:resume 回归（`apps/api` neg:resume EXIT=0 · 现臂形=OCR 能力门 422 + 简历轨 S1 软删 · 见 §1.4-D6）+ neg:auth 回归（81 断言全绿）+ 新 proof（**本刀 docs-only 无新 proof**——proof 面=§0 锚复核单；若 §8 裁决开码面则按 §2-B 骨架另立）+ **G7K 三红复验路径**（trio 三 CMD 各 ×1 · `pnpm e2e:isolated`/`e2e:ui:isolated`/`verify:e2e-performance` · 须协调方 EXEC 显式授权 + live 预算；CMD1 预期红面须预注册——现树 journey 尾段属 `GAP-CMOP03-POST7B` P1 OPEN 域 · §3 边界）+ typecheck（`turbo typecheck --force` 3/3 权威形 + 根 `pnpm typecheck` EXIT=0）+ docs:check EXIT=0。

---

## §0 现状锚（起草席亲证 · 全部 rg/Read/git ls-tree/merge-base 实测 @`f0147886` · EXEC 立项照本节对届时 tip 再重 pin——基线漂移如实改锚·结论不变则只更行号；**本表已由 EXEC 对并线后 tip `94de2fcb` 重 pin · 4 行 blob 漂移改锚·结论零推翻 · 全账见 §9 工序2**）

### 0.0 防重双对表（本 turn 实测）

- `git worktree list` 建后全表：g7k 名下**恰 1 树**=本树 `meetwise-g7k`（建前零 g7k 名树亲证）；`git branch --list "line/g7k-api-reds"` 恰 1 命中=本席分支。
- `ls ai-docs/delivery/harness/ | grep -x "g7k-api-reds-REQUEST.md"` **零命中**（落卷前无同名卷）；`gap-g7k-api-reds-fix.md`（blob `82b9d1d2`）系 **G7R 旧 REQUEST（env 优先假设版 · 2026-10-07 · base `7b28a492`）**——其 H0（默认 endpoint↔model 配对不一致）已被 F-F 定谳 `:787` 出局（「H0 值面出局：协调方 Key 直探 F-A-1 配对 200 成功 + 错配 401 复现」），本卷非其重写非其 rev，边界见 §3-6。

### 0.1 blob 锚表（`git ls-tree` 亲算 · 8 hex）

| # | 文件 | blob | 关键行锚（@`f0147886` 亲读） |
|---|------|------|------|
| 1 | `packages/db/migrations/0142_candidate_profile_route.sql` | `9dda3a38` | 头注 :1-17（G7S · REQUEST `77989c49` · additive-only · 「begin 事务内…同步落 route decision + snapshot，供给先于扣额/入队；无决策/歧义 → begin 409 candidate_route_undecided」）· `candidate_profile_route_decision` CREATE :25 起 · allocations 恰 1 叶 @10000bps 单值 CHECK（0 或 ≥2 叶 → 未决绝不落行） |
| 2 | `apps/api/src/modules/interview/interview.service.ts` | `17930787` | **G7S begin 供给块 :237-248**（:244 `supplyCandidateProfileRoute(c, owner, id, resumeId)` · :246 `throw … 'candidate_route_undecided' … CONFLICT` · 注释自证「通用面（application_id IS NULL）才供给；recruiter-flow 面由 recruiter 启动事务的 snapshot 供给」「先于扣额/入队（同 asPrincipal 事务…整体回滚零悬账）」「worker fail-closed 门…零改动，缺行/缺叶仍拒」）· EXEC 重 pin：起草锚 `1019c105`/`:237-247` 漂移（B271 扣额注释族插入致块尾 +1 行）· :244/:246 恒等命中 |
| 3 | `apps/worker/src/interview-consumer.ts` | `27ddbcf1` | 检索面双轨 :387-394（:392-393 `getInterviewRouteSnapshotForAdaptiveRole` · :394 `decideRouteSnapshotRetrieve` · 注释「H2 #202(收编)…旧 recruiter snapshot(0104)优先→缺行 fallback candidate_profile_route_snapshot(0142)…门语义零弱化：缺行/缺叶仍 route_snapshot_missing→degraded→deny_external…永不 unscoped」）· 角色门双轨 :507-546（:517 `roleFromRouteSnapshot` · :515-516 死源处置注释 · :524 fail-closed ON 臂同函数 fallback 读 · 「G7S 通用 begin 供给面收口：角色门供给读=旧 recruiter snapshot 优先→fallback 0142」「死源处置(C-MO-S3)：原 roleFromJobRouteMetadata(声明从未赋值)已删除」）· :546 `resolveAdaptiveInterviewRole` 调用 · :229 `markJobFailed`（catch-all）· :282 `retry_exhausted` 臂 · EXEC 重 pin：起草锚 `5ca3bb28` 漂移（主线 AG39 `deriveQbankOwnerScope` owner 派生段插入致角色门区 +7/+8 行）· :392-394/:229/:282 恒等命中·门语义零改动 |
| 4 | `apps/worker/src/adaptive-role-resolve.ts` | `0d3e3062` | `ADAPTIVE_ROLE_ROUTE_MISSING` :16 · 默认 ON 判定 :40-44 · **fail-closed throw :72-76**（:74-76 `throw Object.assign(new Error(ADAPTIVE_ROLE_ROUTE_MISSING),{code})`）· 门语义注释 :55-63（「user input overrides the role VALUE, never the route-ledger existence gate」） |
| 5 | `packages/db/src/routing/candidate-route.ts` | `20fcae6a` | 头注 :1-25（写侧=begin 事务内同步 rule 派生 · 读侧=「旧 recruiter snapshot(0104)优先，缺行才 fallback 新 snapshot表…recruiter-flow 面（唯一生产者 recruiter.ts:428）零回归」· 「门语义零弱化…只解决『供给缺失』，缺行/缺叶仍拒（拒因前移非拒体消失）」） |
| 6 | `packages/db/src/interview/interview-jobs.ts` | `7ebdff1a` | `markJobFailed` :240-241（:241 `UPDATE interview_job SET status='failed', last_error=$4 … error.slice(0, 500)`——F-F era 锚 `:214-217` 漂移后现位）· reaper `reaped:worker_died` :285 / `reaped:retry_exhausted` :294 |
| 7 | `packages/db/src/recruiting/recruiter.ts` | `c3c94bcd` | `snapshotInterviewRoute` **:608**（旧锚 `recruiter.ts:428` 文件迁移后现位）· P-START 真拒启 :576/:590（无 binding → `interview_ineligible_route` fail-closed 不创建 interview）· 绑定只认 route_decided :265 |
| 8 | `apps/worker/src/qbank-retrieve-scope.ts` | `fb46e7ce` | `decideRouteSnapshotRetrieve` :68（G-R2-5 缺行/空 allocations/invalid leaf → 拒 · 永不 unscoped） |
| 9 | `apps/worker/test/role-input.proof.ts` | —（行锚） | :74「U2 用户在场+缺 snapshot 仍 throw adaptive_role_route_missing（门零弱化）」· :211「③c-1 job failed 且 last_error=adaptive_role_route_missing（用户输入未解锁供给存在性门）」 |
| 10 | `apps/worker/test/interview.proof.ts` | —（行锚） | :83-89 S1 fixture 修复注释（「consumer 的角色解析 fail-closed 只认 route snapshot…本 proof 自 R1 后未跟进 0142 供给面，start job 全部 adaptive_role_route_missing 失败（7 项连锁红，pristine base 亲证）」→ :88 `supplyCandidateProfileRoute` 生产同链供给）· :357 报告图家族零卡 fail-closed failed |
| 11 | `apps/worker/test/adaptive-consumer.proof.ts` | —（行锚） | :81-87「生产 begin 在扣额/入队前同事务内经 supplyCandidateProfileRoute 以候选人本人简历 rule…」+ :87 供给行使 |
| 12 | `apps/web/e2e-ui/recruiting-bound.spec.ts` | `2f73a54e` | G7U 轮询步 :155-213（:155「begin 前等异步 classify 的 route 决策到位（『等 route_decided 再 begin』· G7S harness :79 预留口径）」· :201 route_decided observed · :207 cap 超时判定 · :213 超时诚实 FAIL throw）· **bind waitForURL :274**（G7K era `:96` 漂移后现位 · 30s 窗）· EXEC 重 pin：起草锚 `669322a7`/`:149-203`/`:268` 漂移（主线携入他行致 +6/+8）· G7U 夹具机制原文（SELECT-only 白名单/cap 60s/诚实 FAIL 三注释行）逐字在位·零断言改动 |
| 13 | `apps/web/e2e-ui/uc018-abandon.spec.ts` | `0a2e1c1e` | **abandon proxy 200 断言 :141**（「UI abandon proxy → 200」· G7K era `:139` 漂移后现位）· begin 202/200 :122-123 |
| 14 | `e2e/full.e2e.ts` | `4cb481aa` | mainLoop 出处审查断言 **:205-207**（:206 `provenance.identities.length === questions + clarifications`——**CMOP03-FIX 刀① `1789e321` 已落地的澄清感知形**，非 G7X 时代恒 False 的 `=== questions`）· **boundLoop 孪生 :625-626**（`boundLoop.questions + boundLoop.clarifications` · 标签「identities=q+c 孪生同步 1789e321」）· CMOP03-D 埋点位 :609/:620 |
| 15 | `e2e/helpers/interview.ts` | `4aee4a29` | identities 双 kind 计数 :209-210（question_ready+clarification_needed 均计）· questions 仅数 question_ready :295/:314-315 · `rejectForgedProgressScores` :199（反伪造面零触锚） |
| 16 | `apps/api/test/neg-resume.proof.ts` | `be27e63f` | B1 澄清感知后形 :48/:52（`image_ocr_unavailable` 422 形在树）· B2/B3 503 臂已随 GAP-PRIV-02（`:776` · 2026-10-13）退役为 `beginResumeSoftDelete` 替位臂（`privacy.service.ts` import :5/调用 :89）——NEGRESFIX 后该文件又随 S1 软删演进，本刀零触 |
| 17 | `packages/domain/src/candidate-profile-route.ts` | `3b493bbd` | :8「begin 侧 409 `candidate_route_undecided` 路径保留仅作防御」+ v3 降级臂（`packages/domain/test/candidate-profile-route.proof.ts:103`「后端类（全语料）candidate_route_undecided 计数 = 0（v3 降级臂下分类器对非空输入恒 decided）」） |
| 18 | `packages/domain/src/assessment.ts` / `scoring-aggregation.ts` | —（行锚） | `score_aggregate_empty` 源面 :30/:44 / :132/:196（G7X 锚 `worker interview-service.ts:283` 经 CMOP03-E 分支 P 校准+报告链 0178 派发序演进后漂移 · §0.2-D5 · 本刀零触） |
| 19 | `ai-docs/delivery/gap-bug-backlog.md` | `1ff80870` | `:107` 行 P1 OPEN 原文 + `:781`/`:787`/`:788`/`:790`/`:792`/`:794`/`:796`/`:798`/`:802`/`:842`/`:776` 登记链 + `:826`/`:828`/`:832` POST7B 立行 |
| 20 | `ai-docs/delivery/execution-master-checklist.md` | `d6b741e0` | nail 节链 `:1250`/`:1305`/`:1315`/`:1326`/`:1337`/`:1348`/`:1360`/`:1372`/`:1415`/`:1429`/`:1457`/`:1514`/`:1501`/`:2099`/`:2129` + `:1341`/`:1345`/`:1366`（0–2s 未决窗残余=「backlog 立行权归协调方」·至今无行无刀亲证）· EXEC 重 pin：blob `57f92642`→`d6b741e0` 系主线他刀追加节（ag39q nail 等）·十八锚全部零漂移恒等命中 |
| 21 | `harness/g7trio2-full.md` | `172a7ce8` | CMD3 步 10 红 locus=`neg:resume` 12/87（§6 注记 · 图片同意门 ×2 + DELETE/privacy-erasure 族 ×10）+ erratum「已终局 nail 并全链并主线（判决 `93fb9b92`·merge `f3a54577` 2026-10-11）」 |
| 22 | `harness/negresume-driver-fix-REQUEST.md` | `f7de3059` | §0「12/12=driver 期望形状漂移 · 0 产品回归」+ §1 12 条映射 + §4「本刀≠trio 三绿≠`:107` 关闭」；收据 `receipts/archive/2026-09-batch23/receipts/negresume-driver-fix/`（name-list-diff.txt removed=12/added=12 机证） |
| 23 | `harness/gap-g7k-api-reds-fix.md` | `82b9d1d2` | G7R 旧 REQUEST（H0 env 假设版 · 已被 `:787` F-F 出局 · §0.0 边界） |
| 24 | `harness/gap-begin-snapshot-supply-fix.md` | `46393c8f` | :75-82 夹具刀 Ban/排序（「夹具刀不在本刀（仅红①时序面合法）」）· G7U REQUEST `4279595c` 对 :79 预留的闭合登记在 checklist `:1340` |
| 25 | `receipts/archive/2026-09-batch23/receipts/g7-trio-keyed/SUMMARY.md` | —（行锚） | EXIT 表 1/1/1 + 逐 case 红明细（CMD2 recruiting-bound `waitForURL(/\/interview/…)` 30s timeout @`:96` ×2 · CMD2 uc018 abandon Expected 200/Received 409 @`:139` ×2 · CMD1/CMD3 class=api case 名 by-design withheld） |

### 0.2 漂移登记（派单前提 → 现树实测 · **D1 即现场漂移命中 · 本卷即漂移登记载体** · EXEC 重 pin 时同协议处理）

- **D1（核心 · 现场漂移命中）**：派单前提「`adaptive_role_route_missing` fail-closed 门 + 通用 begin 面 route snapshot 零写——**修复未落地**」系 **F-F 时代（`:787` · 2026-10-07）定谳快照**。现树实证该修复**已落地并收官**：G7S 产品刀全链（REQUEST `77989c49` → pre-dual BOTH PASS `d43787e0`+`83b90a3d` → EXEC 实现 `fd569a60` 恰 7 files +366/−9 → trio 收据 `a5ef4280` → post-dual BOTH PASS `d00be55c`+`3e471d62` → **nail** checklist `:1315`）——落地面=0142 迁移（锚 §0.1-1）+ begin 同步供给（§0.1-2）+ worker 角色门 fallback 读（§0.1-3 后半）+ 检索面双轨（§0.1-3 前半 · 即派单令所称「AG-40 已修的双轨 fallback」，AG-40=`634eb645` · `merge-base --is-ancestor` 亲证在树）+ 死源 `roleFromJobRouteMetadata` 删除（§0.1-3 注释自证）· 且 **`:788` 原文**「`adaptive_role_route_missing` 全 trio+diag run 零命中」「uc018 abandon 面 409 双 project 转绿」「G7W 甄别刀 sidecar 定谳 supply chain CLEAN（`interview_job` 6 行全 done · attempts=1 · last_error 全 NULL）」。**本刀执行清单因此收窄为映射固化+裁决包（§1-修法）——重新实现供给面=重复刀 =Ban（§5）。**
- **D2（红① 链）**：G7T（classify 质量 p.v1→p.v2 · 恰 3 files `c670bf15` · nail `:1326`）+ G7U（spec 夹具轮询 `dbed8a6f` +72/−0 · nail `:1337`）落地——e2e 面红①清除（双 project route_decided ≈4s → begin 全过 → 面试页到达）。残红后移：旅程自适应早停面 ×2 → G7V EXEC（分支 A 定谳=码面语义一致 · spec 多臂校准 `92f70db7` 落码）+ G7V-FIX（第三臂文案 → CLOSED(fixed) `:1429`）+ G7V-CALIB（CLOSED(fixed) `:1484`）；golden 冷启 ×1 → G7W 甄别 suspended + G7W-G 复现臂未复现（`:842` · stays suspended/OPEN）。
- **D3（红③ 链）**：G7X 双面收敛（`:796` · nail `:1372`）→ ①断言面：CMOP03-FIX 刀①（`1789e321` · nail `:1457`）已落地——mainLoop `:205-207` + boundLoop `:625-626` 双位澄清感知形（§0.1-14 亲读），G7FIX-1 双审所指 boundLoop 未同步缺陷现树已消除；②报告钟面：CMOP03-E 刀②（nail `:1514`）分支 P 校准零码改文档化落地 CLOSED under branch P，D 假说 OPEN 转用户裁决队列。残红③现存后继=**`GAP-CMOP03-POST7B` `:832` P1 OPEN**（journey 尾段 · 死亡窗 ∈(:256,:356] · 鉴别刀 CMOP03-D REQUEST `cmop03-post7b-discriminator.md` blob `0dfd91e4` 仍 `draft:awaiting_pre_exec_dual` 未 EXEC）——`:828` 明文「不并入 `:107`」。
- **D4（neg:resume 12 FAIL 链）**：G7TRIO-2（nail `:2099` · CMD1/CMD2 绿 · CMD3 EXIT=1 红 locus=`neg:resume` 12/87）→ NEGRESFIX（nail `:2129` · run1 neg:resume 87/87 全绿 · diff 恰 12 条 · run2 五段 81/84/87/97/120 全绿 · **0 产品回归**）——该 12 红已闭，非 `:107` 面（NEGRESFIX §4 自证）。其后再演进：GAP-PRIV-02（`:776` · 2026-10-13）resume 503 过期臂退役为软删替位臂（§0.1-16）。
- **D5（锚行号漂移 · 亲证在案）**：markJobFailed `:214-217`→**`:240-241`**；uc018 断言 `:139`→**`:141`**；bind waitForURL `:96`→**`:268`**；`recruiter.ts:428` snapshot 生产者→**`recruiting/recruiter.ts:608`**（文件迁移）；full.e2e 断言 `:201-203`→**`:205-207`+`:625-626`**（已修复形）；`score_aggregate_empty` `worker interview-service.ts:283`→**domain `assessment.ts:30/:44`+`scoring-aggregation.ts:132/:196`**（§0.1-18）。
- **D6（trio 现态）**：G7TRIO-2 终局（`93fb9b92` 判决 · `f3a54577` 并线 2026-10-11）=**CMD1=0/CMD2=0/CMD3=1**（CMD3 红=neg:resume·已由 D4 闭）；G7TRIO-2 erratum 明文其状态行陈旧。`:107` stays P1 OPEN（「关闭须其自身修复刀全链」G7X 节自证）；本 tip 内**无** post-NEGRESFIX trio 全绿复跑登记——三红复验路径（§0 门预申明）即此缺口的合法闭合路径，须协调方 EXEC 授权。

## §1 三红逐条修法映射（派单令第 3 项 · 每红=「G7K 现象 → 定谳根因 → 修法 → 落地锚 → 残余与归属」）

### 1.1 红① recruiting-bound bind 30s timeout ×2

- **G7K 现象**：SUMMARY 锚 §0.1-25（chromium+mobile ×2 · `waitForURL(/\/interview\/…)` 30s timeout · 「开始面试」visible 已过）。
- **定谳**：非单根——F-F 定 H1-a 路由链后，G7T sidecar 定谳 classify 输出质量面（RC-1a 单叶死路：validator 恒等矛盾 → `validation_rejected` sticky → binding 零落 → start 409 `interview_ineligible_route` → server action throw → 错误边界 → URL 永不跳转）+ 时序面（consumer 5000ms 轮询+模型延迟 ≈5s ≥ spec publish→begin 步进 · 0–2s 竞差先 begin 后 decided）。
- **修法与落地**：①质量面=G7T prompt p.v2（消单叶死路 · 零 validator 改动 · sealed 同步）；②时序面=G7U 路线甲 spec 夹具轮询（`recruiting-bound.spec.ts:149-203` · cap 60s 超时诚实 FAIL · 零断言改动零产品码）——协调方路线裁决（路线甲批准+路线乙范围裁仅 bound 面 · C-MO-U1~U5 休眠随卷）。**两刀均已 nail（`:1326`/`:1337`）。**
- **残余（本刀核心裁决面）**：**真实用户 0–2s 未决窗口仍 409 `interview_ineligible_route` fail-closed**（`:792`/checklist `:1341` 原文「夹具对齐 ≠ 产品修复…产品面残余处置权归协调方」；`:1345`/`:1366` STILL OPEN「backlog 立行权归协调方」——**至今无行无刀，起草席 rg 全文亲证该残余未被任何后继登记认领**）→ 裁决项②「快照写入时点」三案并陈（§8）。

### 1.2 红② uc018-abandon abandon proxy 409≠200 ×2

- **G7K 现象**：SUMMARY 锚 §0.1-25（×2 · create+begin 已过 · 1.6s/2.5s 极速红 · toast `interview_not_active`）。
- **定谳**：通用 begin 面 route snapshot 零写 → worker start job fail-closed 角色门秒级 throw `adaptive_role_route_missing` → `markJobFailed` last_error ≤500 持久化 → interview `failed` → abandon 撞终态 409（G7R REQUEST 磁盘工件亲证 + F-F 四查询互证定谳为产品供给面缺口）。
- **修法与落地**：**G7S 产品刀**（=派单令「begin 面 route snapshot 供给补齐」的本体）——0142 additive-only 新结构 + begin 事务同步供给（先于扣额/入队 · 未决 409 `candidate_rule_undecided`→`candidate_route_undecided` fail-closed 镜像 recruiter 面）+ 角色门 fallback 读（旧 0104 优先零回归）+ 死源删除；门 blob 零改动。**已 nail + live 复证（`:788`）**；G7W sidecar 二次独立验证 supply chain CLEAN（§0.2-D1）。现树锚=§0.1-1/2/3/4/5/9/10/11。
- **残余**：uc018 断言现位 `:141`（200 断言在树）；G7TRIO-2 时代 CMD2 已绿（14P/0F/10S 基线同形）。**红②无残余产品面**——本刀零触（§5 Ban 重实现）。

### 1.3 红③ iso HTTP api 红面（CMD1+CMD3 同源 · case 名 withheld）

- **G7K 现象**：class=api · case 名 by-design withheld（wrapper stderr 契约 `run-e2e-isolated.mjs:2084-2098` · Ban 改 withhold）。
- **定谳**（G7W 甄别 + G7X 收敛）：supply chain CLEAN → ①断言面=出处审查断言在澄清轮下恒 False（identities 双 kind 计 5 vs questions 单 kind 计 3）；②报告钟=ai_report 舱壁 3-attempts 烧尽（`score_aggregate_empty` · 弱输入 practice 零可计分卡 · 设计终态 quarantined+report_unavailable · 「时钟非抛点」）。
- **修法与落地**：①CMOP03-FIX 刀①（`1789e321` · nail `:1457` · 恒 False 消除 · 反伪造面零弱化 · 现树 :205-207/:625-626 双位亲证）；②CMOP03-E 刀②（nail `:1514` · 分支 P 校准零码改文档化落地 CLOSED under branch P · D 假说 OPEN 转用户裁决队列）。**均已 nail。**
- **残余**：`GAP-CMOP03-POST7B` `:832` P1 OPEN（post-7b 新面 · 鉴别刀 REQUEST 已立未 EXEC · `:828` 不并入 `:107`）——归 CMOP03-D 域，本刀零触（§3-1）。红③对 `:107` 的直接面**已闭合于 CMOP03-FIX/CMOP03-E**；`:107` 行翻转仍归协调方（trio 复跑复核保留）。

### 1.4 neg:resume 12 FAIL 逐条锚（派单令指定 · 归属=G7TRIO-2/NEGRESFIX 域 · 非本刀修复面）

12/12=driver 期望形状漂移 · 0 产品回归（NEGRESFIX §0 定谳 + checklist `:2129` nail · probe 12 行分类表 1:1 对应）——B1 图片同意门 ×2（:47/:48 现状 403/consent_required → 实际门序=OCR 能力门 422 `image_ocr_unavailable` 先答）· B2 DELETE /resume/:id 族 ×6（:226/:227/:230/:238/:240/:241 现状 404/200/幂等 404 → 对齐恒 503 fail-closed `resume_erasure_migration_in_progress`）· B3 DELETE /privacy/resume-data 族 ×4（:283/:284/:285-286/:287-288 现状 200+三字段 → 对齐 503 + 「行数不变」式断言）。改写映射 12 条全录于 `receipts/archive/2026-09-batch23/receipts/negresume-driver-fix/name-list-diff.txt`（removed=12/added=12 机证）。**其后又演进**：resume 503 墙退役（GAP-PRIV-02 `:776` · S1 软删 `beginResumeSoftDelete` 替位臂 · §0.1-16）——本刀对该域零触（§3-2），neg:resume 回归门以**现臂形**行使（§0 门预申明）。

### 1.5 adaptive_role_route_missing 消费面语义复核结论（派单令第 2 项 · 零码复核 · 锚全 §0.1）

- **抛出面**：`adaptive-role-resolve.ts:72-76`（blob `0d3e3062` · 默认 ON · user input 只覆写 role 值不解锁供给存在性门）——**blob 与 F-F era 零改动**（`:788`「门 adaptive-role-resolve.ts blob `80abbb80` 零改动」与本卷 `0d3e3062` 现值为该钉的演进后值 · 门语义注释 :55-63 逐字维持 fail-closed）。
- **消费面**：`interview-consumer.ts:546` resolveAdaptiveInterviewRole（角色门双轨读 :507-546）→ throw 经 :229 catch-all → `markJobFailed` `interview-jobs.ts:240-241` last_error ≤500 持久化——消费链完整在证。
- **供给面**：begin 同步供给（§0.1-2）+ 双轨 fallback 读（检索面 :387-397 · 角色门 :507-546）+ 检索门 `decideRouteSnapshotRetrieve`（:68 · 缺行/缺叶仍拒永不 unscoped）。
- **门零弱化正钉测试**：`role-input.proof.ts:74/:211`（用户在场+缺 snapshot 仍 throw · job failed 且 last_error=该码）——供给补齐与门语义并存（「拒因前移非拒体消失」candidate-route.ts 头注自证）。
- **复核结论（登记性 · 非新定谳）**：抛出/消费/持久化/供给/正钉五点链齐，无未接线点、无死源残留（C-MO-S3 删除已兑现）；`adaptive_role_route_missing` 自 G7S 后全 trio+diag run 零命中（`:788`）。**本复核零码零改**——若双审在复核中发现链上新缺口，按停止条件②停手上报。

### 1-修法（本刀执行面 · docs-only 三件 · 若裁决开码面则码面归后继刀）

- **修① 三红映射固化**：本卷 §1 即交付物——EXEC/nail 阶段由协调方决定是否以登记注形式落入 backlog/checklist（**行翻面权归协调方 · 本刀 Ban 直改 SSOT**）。
- **修② 残余产品面裁决包**：红①残余「真实用户 0–2s 未决窗口 409」三案并陈交 §8 裁决项②——**案甲（推荐）**：维持 begin 同步 fail-closed 409 现语义 + 用户层等待/重试引导（C 端文案/轮询提示面·独立小刀）——门语义零弱化零放宽·Ban 为绿改产品；**案乙**：begin 内同步等待窗口（受控轮询 route_decided 至 cap 后 409——改动 begin 事务时序·须评估请求悬挂/额度预留次序·C-MO-S4 事务序契约复核）；**案丙**：消费时序语义变更（worker 侧对未决 route 的延迟消费/重排——触 requeue 白名单族·须新 REQUEST 全链）。**三案均不改 0142 供给面本体。**
- **修③ 失败降级语义复核登记**：`candidate_route_undecided` 409 前移语义（§0.1-2/17）+ `route_unresolved` sticky 族 fail-closed（recruiter 面 :576/:590）现树自洽——维持现状为推荐（裁决项③）；变更即归后继产品刀（新 REQUEST 全链·非本刀域）。

## §2 验收（docs-only 形 · 每条可独立判定）

- **A（本刀）**：①本卷落卷=恰 1 新 .md（`harness/g7k-api-reds-REQUEST.md`）·`git diff --numstat` 恰 1 文件零删改他卷；②`node scripts/ai-docs/check-docs.mjs` **EXIT=0**（基线 2049 scanned ≤ cap 2064 · 落卷后 2050 实测口径）；③`turbo typecheck --force` 3/3 + 根 `pnpm typecheck` EXIT=0（零码刀·为门预申明兑现而跑）；④markers 五类亲跑零新增（command/回执随交付报告）；⑤§0 锚复核单：EXEC 立项时对届时 tip 重 pin——blob 漂移如实改锚·结论不变只更行号（沿 ag-d 卷 §0 协议）。
- **B（预登记 · 仅当 §8 裁决开码面后继刀时引用·非本刀验收）**：0–2s 未决窗若采案甲→C 端引导面断言（等待文案+重试路径·spec 零弱化）；案乙→begin 等待窗断言（cap 内 decided 全过/cap 后 409 形·额度预留次序断言零悬账）；案丙→consumer 延迟消费断言（requeue 白名单只增不减·retry_exhausted 兜底）。neg:resume（现臂形 EXIT=0）+ neg:auth（81 绿）回归门随任一码面后继刀同行。G7K 三红复验=trio 三 CMD 各 ×1（协调方授权+预算·CMD1 预期红面预注册=POST7B 域除外条款显式入卷）。

## §3 范围外（边界清单 · 越界即 FAIL）

1. **`GAP-CMOP03-POST7B` `:832` P1 OPEN + CMOP03-D 鉴别刀**（journey 尾段 · `:828` 不并入 `:107`）——本刀零触零归因。
2. **`GAP-G7W-API-TAIL-DEATH` `:108` / `GAP-G7W-QGEN-SCHEMA-VALIDATION` `:109` 两姊妹行**——域 disjoint（`:107` 行原文自证）；本刀只读引用零触碰。
3. **NEGRESFIX / neg:resume 断言本体**——已 nail 域（`:2129`）；neg:resume 仅作回归门行使，零改写。
4. **G7V 簇**（early-stop 校准/G7V-FIX/G7V-CALIB 已 CLOSED 族）与 **G7W-G**（golden suspended）——已收口/挂起域零触。
5. **0142 供给面与角色门本体**——已 nail 产品面（§0.2-D1）；**Ban 重实现/Ban 调整门语义/Ban 改 blob `0d3e3062` 语义面**；后继码面（若 §8 开）只可新增引导/等待/消费时序结构，不可改 0142 既有表/约束/门。
6. **G7R 旧 REQUEST（`gap-g7k-api-reds-fix.md`）**——历史卷零改写；其 F-B/F-C/F-F 方案条目已被 F-F 定谳与 G7T/G7U 落地 supersede，本卷不继承其 prove 计划。
7. **共享 SSOT**（backlog/checklist/LEDGER/矩阵/coverage）只读引用零改——`:107` 行与全部行统计零翻转（翻面权归协调方 nail）。
8. **历史迁移零字节**（0001-0184 全冻结代·含两 `0143` 重号既有事实如实登记不回填）+ `sql/` 影子面零改；本刀零迁移零占号。

## §4 依赖与迁移号

**依赖**：零新依赖——三红映射的承重锚全部已在树（§0.1）；无同文件并发登记他刀（本刀唯一产出=本卷）。**迁移号结论=零**（派单令「预期零或 0188」之**预期零成立**）：0142 已在树（§0.1-1）· 本刀 docs-only；现树迁移实存 max=**0184**（0182/0183 缺号如实登记不回填 · 5B-MIG 拟占 0188 起 · 若 §8 裁决开码面且后继刀需迁移，按链纪律取 ≥0185 空闲号并在其 REQUEST §0.3 登记与 5B-MIG 的协调规则——**本卷不预占任何号**）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写操作只在本 worktree 一次 docs commit）；Ban coding（本刀零产品码/零脚本/零 spec/零夹具/零迁移）；Ban prove 执行/trio 实跑/live 调用/Key 加载（本 turn）；Ban self-approve（pre-exec dual=mw-e2e-ha+mw-model-op 两独立外席 · alone≠dual）；Ban retry-to-green/Ban 洗绿/Ban flake 记法/Ban 只留绿 attempt；Ban 为绿改产品/Ban 为绿改断言/Ban 改 withhold 机制（`run-e2e-isolated.mjs:2084-2098` 冻结）；Ban 重实现 G7S 已落地供给面（§0.2-D1）/Ban 角色门与检索门语义弱化（`adaptive-role-resolve.ts` 语义面 + `decideRouteSnapshotRetrieve` 永不 unscoped）；Ban 触 §3 全部域；Ban 直改共享 SSOT（行翻面权归协调方）；Ban 触其他工作树（在飞机）；Ban Key 物料（`.env*`/值/fingerprint 入树入据）；Ban 伪造已读/已验来源；Ban 预占迁移号。

**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零调用零消耗）。

## §6 est live=0

本刀零模型真实外呼零 DB 连接零容器：起草 turn 全只读（rg/Read/git ls-tree）；EXEC 期（若授权）门行使面=neg:resume/neg:auth（离线本地 API·零真实模型外呼）+ typecheck + docs:check + markers（全本地）；trio 复验须协调方显式 EXEC 授权并按 G7K 口径另计预算（est-not-counter · 非本刀 est 域）。`actualSpendCny=null`。

## §7 markers=0（卫生声明）

本刀改动集恰 1 .md，五类标记词起草席亲跑 grep 零新增（命令与回执随交付报告；五类标记词不在卷内复抄，避免自匹配——沿 ag-d/G7R 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 裁决项 + 停止条件

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动。开工三条款：①预执行双审两外席 BOTH PASS 落卷；②协调方明示授权（本卷非授权本身）；③EXEC 立项不得改 §1-修法与 §5 Ban/pins（改则回炉重审；立项照 §0 逐条重 pin）。**Dual PASS ≠ 开工。**

**待双审/协调方裁决项（五项）**：
- **①三红是否同刀（推荐=否·已分叉）**：红①=G7T+G7U 已落地（残余=0–2s 未决窗·归本刀裁决项②）；红②=G7S 已落地无残余；红③=CMOP03-FIX+CMOP03-E 已落地（残余=POST7B 归 CMOP03-D 域）。`:107` 行翻转（CLOSED（fixed）拆分记法/残余拆行）归协调方 nail。
- **②快照写入时点（红①残余 · 三案并陈 · 推荐案甲）**：§1-修法②案甲（维持 fail-closed + C 端等待/重试引导·门零弱化）/案乙（begin 受控等待窗·事务时序契约复核）/案丙（消费时序语义变更·requeue 族）。裁决后码面走独立 REQUEST 全链（本刀不 coding）。
- **③失败降级语义（推荐=维持现状）**：`candidate_route_undecided` 409 前移 + sticky `route_unresolved`/`interview_ineligible_route` fail-closed 维持；变更归后继产品刀。
- **④派单前提漂移处置**：§0.2-D1（修复已落地）与本刀 scope 收口（映射固化+裁决包）的确认——若协调方裁定仍须原 scope 重做，须给出 G7S 落地面不适用的新事实（现树无此事实·起草席亲证），否则按本卷 scope 续行。
- **⑤迁移号确认**：零迁移零占号（§4）；后继码面需迁移时 ≥0185 认领 + 与 5B-MIG（拟占 0188 起）协调规则入其卷 §0.3。

**停止条件（四类 · 命中即停手上报）**：
1. **现场漂移**：**起草时已命中并登记**（§0.2-D1~D6）——续行以裁决项④确认为门；EXEC 立项时对届时 tip 重 pin，blob 变或行号漂移超 ±3 且结论受影响 → 停手上报。
2. **机制不满足**：§1.5 复核若发现消费链新缺口/§0 锚复核若推翻「G7S 已落地」结论 → 停手上报（不得就地改修法）。
3. **越界需要**：执行中若需触 §3 任何域（POST7B/TAIL-DEATH/QGEN-P2/NEGRESFIX/G7V 簇/0142 本体/SSOT 行翻面）→ 停手上报。
4. **验收红不可修**：docs:check/typecheck/markers 任一门红且无法在本刀范围内归因修复 → 停手上报（Ban 为绿放宽门）。

## §9 EXEC 记录（2026-10-14 · 施工席随翻落卷 · ⛔push 维持 · 待 post-prove 双审两外席 · alone ≠ dual · 本节零 SSOT 触碰 · 行翻面权归协调方）

- **授权链**：起草 `f7dcdbbd` → 协调方口径「REQUEST rev2 落卷 + pre-exec 双审 BOTH PASS」（如实登记：rev2/双审落卷提交在本仓全部 git ref 内不可见——`git log --all -- <本卷>` 唯一提交=`f7dcdbbd`，`--grep g7k-api-reds` 全 ref 无 rev2/审席命中——本席以协调方明示 EXEC 开工令为 §8 开工条款①②依据并在此留痕，裁决权归协调方）→ 协调方 EXEC 派单令（并线+门矩阵全跑+本节落卷+STOP 翻面）。**§1-修法/§5 Ban/pins 零改**（§8-③ 冻结条款遵守）。
- **工序1 并线**：`git fetch` 后 `git merge --no-ff feat/mysql-schema-skeleton` → **merge `94de2fcb`**（双亲 `f7dcdbbd`+`55584f1f` · 主线 tip 与 `origin/feat/mysql-schema-skeleton` 全等亲证 · 主线链 201 头 0201 · cap 2104 · 批表 190/271）。`git merge-tree --write-tree` 预演 EXIT=0 + 实 merge auto-merge **零冲突**——本支线净增恰 1 .md 且主线零同名文件，协调方四项并集解惯例（cap 取大/lint 预算并集/run-e2e-isolated 名单并集/注册行并集）本轮**零触发**：cap=2104、root/api lint 预算 5200/1421、预迁移名单、注册行全取主线现值零丢。⛔ pull --rebase 未用（沿 AG-24 初笔 erratum 教训）。
- **工序2 §0 锚重 pin（对 `94de2fcb` · 上表已就地改锚 · post 双审勘误后如实口径）**：25 行核对如实口径=blob 25/25+行锚类行全中+两行锚勘误随 post 双审 E-1/E-2（见卷尾处置摘要）——**16 行 hex 恒等+5 行锚行恒等（hex 共 20 行其中 4 漂移）**：#1/#4-#8/#13-#17/#19/#21-#24 十六 hex 全同 + 行锚类全中（#9 `:74`/`:211` · #10 `:83-89`/`:88`/`:357` · #11 `:81-87`/`:87` · #18 `:30`/`:44`/`:132`/`:196` 四行 · #20 十八锚零漂移 · #25 EXIT 1/1/1 + `:96`/`:139` 恒等）。**4 行 blob 漂移如实改锚**：#2 `1019c105`→`17930787`（块 :237-247 零行漂 · :244/:246 恒等 · blob 漂移实因限流闸 async 化原地改——numstat +10/−10 零插入·「B271 插入 +1」不成立）；#3 `5ca3bb28`→`27ddbcf1`（检索双轨 :392-393/:394 恒等 · 角色门 :500-522→**:507-546**（声明 :510→**:517**=+7·起草锚 :509 自身偏 1 · 死源处置 :515-516 · 调用 :539→**:546**）· :229/:282 恒等 · 主线 AG39 `deriveQbankOwnerScope` owner 派生段插入携入·G7S 门语义零改动）；#12 `669322a7`→`2f73a54e`（轮询步 :149-203→**:155-213**（注释 :155/observed :201/cap :207/诚实 FAIL :213）· bind waitForURL :268→**:274** · G7U 夹具 SELECT-only 白名单与 cap 60s 注释逐字在位）· **增注（post 双审）**：锚窗外主线携入断言收紧两处——settlementFaces 四臂 race→单臂 `waitForExpectedTerminal` 钉死（helper :141-147·调用位 :295）+ 扣费臂三路 race→单臂 `NO_REPORT_ON_CHARGED` 钉死（:324）· blob `2f73a54e` 与主线 tip `55584f1f` 全等亲证=主线携入非本刀产出·后继 trio 复验按收紧形行使；#20 `57f92642`→`d6b741e0`（主线他刀追加节携入·锚零漂移）。**结论零推翻**：四漂移行机制原文逐字在位，最大行漂 +7 虽超 ±3 但结论不受影响（起草锚 #3「:509」自身偏 1·实位 :510→:517=+7 · §8 停止条件①「且结论受影响」双条件不满足）→ 按 §0 协议「只更行号」续行未停手；§0.2-D1~D6 六漂移结论对 `94de2fcb` 复证零变化。
- **工序3 门矩阵（并线后树 · 本 §9 落卷树亲跑 · 全表）**：
  | 门 | 命令 | attempt | EXIT | 读数与判定 |
  | --- | --- | --- | --- | --- |
  | `turbo typecheck --force` | `pnpm turbo typecheck --force` | 1 | **0** | **8/8 successful**（0 cached）——起草基线「3/3 权威形」系旧形，主线已演进 8 包，随并线如实更新口径 |
  | 根 typecheck | `pnpm typecheck` | 1 | **0** | `tsc -p tsconfig.e2e.json` |
  | docs:check | `node scripts/ai-docs/check-docs.mjs` | 1 | **0** | 80 required files verified · public text policy scanned **2100** managed worktree files ≤ cap **2104** |
  | markers 五类 | 改动集精 grep（五类词面运行时组装·不在卷内复抄沿 §7 形制） | 1 | grep **1**=零命中 | 本卷全文件扫描 **0 hits**；merge 引入行 novel=0 树级亲证——四词面 tree count `94de2fcb` vs 主线 tip `55584f1f` delta 全 0（30/30·16/16·21/21·7/7·conflict 类 0 新增）·对旧支线基线 +5 系主线既有内容原样携入非本席产出 |
  | api lint | `pnpm -C apps/api lint` | 1 | 1（**承登**） | **1431**>预算 1421——与主线既登「api 1431>1421 AUTHZ 基线」**恒等**·零新增·本刀零码 |
  | root lint | `pnpm lint` | 1 | 1（**承登**） | **5212**>预算 5200——与主线既登「root 5212>5200 AUTHZ 基线」**恒等**·零新增 |
  | sse-push | `pnpm sse-push:notify:prove` | 1 | 1（**承登**） | **2/35 失败**（红点=P-2a 约束②结构化降级日志 + P-2d 约束②收据·与主线承登口径同形）——`git merge-base --is-ancestor line/ssepush-notify 主线` 亲证**未并线** → 协调方条件句「若修复已并线则应为 35/35」不触发，预期 2/35 成立 |
  - 环境处置（非产品红·沿 CMOP03-F 收据同款先例）：新 worktree node_modules 缺失 → 首轮 typecheck/lint 门 `Command not found/ELIFECYCLE` 环境红 → `pnpm install --frozen-lockfile` EXIT=0（5.5s · 零 lockfile 改动）后各门首 attempt 即上表值。
  - **未行使门如实登记**：neg:resume/neg:auth 回归门（§2-B 归码面后继刀同行·协调方本轮矩阵未点名）；G7K 三红复验 trio 三 CMD 各 ×1（§0 门预申明须协调方显式授权+live 预算·本轮未授——est live=0 维持）。
- **est live=0 复核**：本 EXEC 零模型真实外呼零 Key 加载（sse-push/neg 面由 harness 构造保证零外呼——`_neg-harness.ts` boot() 显式 delete 模型 Key/URL env 亲读；门矩阵全表无任一真实模型调用）· 零生产操作（sse-push 走 isolated runner 自建一次性容器+nonce 闸 · `E2E_TEST_TARGET_TOKEN` 系隔离闸非 Key 物料）· `actualSpendCny=null` 维持。
- **STOP 翻面**：`draft:awaiting_pre_exec_dual` → **`executed:awaiting_post_prove_dual`**（本 commit 兑现 · 待协调方派 post-prove 双审两外席）。**Ban self-approve · alone ≠ dual**：本席零自批零 nail——三红映射登记注落位与 `:107` 行翻转仍归协调方（§1-修法① · 行翻面权归协调方）。
- **pins 十一值零翻转核对**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · `actualSpendCny=null` —— 十一值照抄零翻转 · 共享 SSOT（backlog/checklist/LEDGER/矩阵/coverage）零触碰（§3-7 守约）。
- **偏离任务书清单（四项 · 均登记性非实质）**：① rev2+pre-exec 双审落卷 git ref 不可见（授权链节如实留痕·以协调方令为据）；② typecheck 权威形 3/3→8/8 系主线演进随并线携入（非本刀决策）；③ 协调方四项并集解冲突惯例零触发（merge 预演+实跑双零冲突·惯例未动用）；④ `pnpm install --frozen-lockfile` 环境处置一次（新 worktree 环境面·非 retry-to-green——非产品红且先例在案）。

---

*G7K-API-REDS REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · ⛔push · base `feat/mysql-schema-skeleton` @`f0147886`（pull 后主线 tip·本地与 origin 全等亲证）· worktree `meetwise-g7k` · branch `line/g7k-api-reds`（建前双查无同名）· 立项出处=协调方派单令+backlog `:107` 行与 `:781`-`:842` 登记链+checklist `:1250`-`:2129` nail 节链+G7K trio keyed 收据（归档位 `receipts/archive/2026-09-batch23/receipts/g7-trio-keyed/`）· §0 锚 25 表行+6 漂移条全 rg/Read/ls-tree/merge-base 亲证 · **核心现场事实：派单前提「修复未落地」已被 `:788` G7S 产品刀 nail 推翻**——供给面（0142+begin 同步供给+双轨 fallback+死源删除）已落地并 live 复证，`adaptive_role_route_missing` 全 trio+diag run 零命中 · 三红映射：红①=G7T+G7U 落地（残余 0–2s 未决窗 409·无行无刀·裁决项②三案并陈推荐案甲门零弱化）·红②=G7S 落地无残余·红③=CMOP03-FIX（:205-207/:625-626 澄清感知双位）+CMOP03-E（分支 P CLOSED·D 假说转用户裁决队列）落地（残余 POST7B 归 CMOP03-D·不并入 `:107`）· neg:resume 12 FAIL=G7TRIO-2/NEGRESFIX 域（12 条映射在卷·0 产品回归·其后 503 臂随 GAP-PRIV-02 退役）· 消费面复核五点链齐零缺口登记性结论 · 迁移号=零（0142 已在·实存 max 0184·0182/0183 缺号不回填·5B-MIG 拟占 0188 起·不预占）· est live=0 · pins 十一值照抄零翻转 · markers=0（亲跑随交付报告）· 门预申明=neg:resume+neg:auth 回归+新 proof（docs-only 无·码面后继刀另立）+G7K 三红复验路径（trio ×1 各·协调方授权+CMD1 预期红面预注册）+typecheck+docs:check · 停止条件四类全设（现场漂移起草时已命中=§0.2-D1 载体）· Ban self-approve · alone ≠ dual · Dual PASS ≠ 开工 · STOP*

*EXEC（2026-10-14 · 施工席随翻 · ⛔push 维持 · STOP=`executed:awaiting_post_prove_dual` · 待 post-prove 双审两外席 · alone ≠ dual）——**并线**：`94de2fcb`（`git merge --no-ff feat/mysql-schema-skeleton` @`55584f1f` · merge-tree 预演+实跑双零冲突 · 四并集解惯例零触发 · ⛔pull --rebase 未用）→**施工**：docs-only 维持（§0 锚 25 行对 `94de2fcb` 重 pin 就地改锚 4 行·结论零推翻·20 行恒等+行锚类全中）+本节 §9 落卷 · 零产品码零 spec 零夹具零迁移零占号。**门矩阵**（并线后树亲跑全表见 §9）：turbo typecheck --force 8/8 EXIT=0+根 typecheck EXIT=0+docs:check EXIT=0（≤cap 2104）+markers 五类零新增；承登红三条与主线现值恒等零新增=api lint 1431>1421+root 5212>5200（既登 AUTHZ 基线）+sse-push 2/35（P-2a 约束②/P-2d 约束②·`line/ssepush-notify` 未并线 merge-base 亲证·协调方条件句不触发）；未行使门如实登记=neg:resume/neg:auth（§2-B 归码面后继刀）+trio 三红复验（须协调方显式授权·未授）。est live=0 · pins 十一值零翻转 · 零 SSOT 触碰 · Ban self-approve · §1-修法/§5 Ban/pins 零改 · 偏离四项登记性见 §9。*

*post 双审勘误处置摘要（2026-10-14 · 落卷席 · docs-only 恰 1 .md=本卷 · ⛔push 维持 · alone ≠ dual · 零产品码零 spec 零夹具零迁移零 SSOT 触碰 · 行翻面权归协调方）——两审席会签清单八项全落、每项先亲证后落笔：**E-1** §0.1-#1 行锚 `candidate_profile_route_decision` CREATE :31→**:25**（0142 blob `9dda3a38` 恒等下亲证 CREATE 实位 :25·头注 :1-17 与单值 CHECK 锚不受影响零改）；**E-2** §0.1-#7+§0.2-D5 `snapshotInterviewRoute` :322→**:608**（recruiter.ts blob `c3c94bcd` 恒等下亲证 :608=startApplicationInterview 内唯一生产调用点·:322 系 finalizeApplication assertPrincipal 误植）；**E-3** §9 工序2 总括句「25 行全 git ls-tree+rg/sed 亲证」收窄如实口径=blob 25/25+行锚类行全中+两行锚勘误随 E-1/E-2（25 行=20 hex 行+5 行锚行亲数·hex 20 行对 f7dcdbbd→94de2fcb 全 ls-tree 复核 16 同 4 漂）；**E-4**（cosmetic）§1.5 内联旧行号 :539/:500-522 同步 :546/:507-546；**席1-P2①** §9 工序2 #2 归因勘误（亲证 numstat +10/−10 全原地改·块 :237-247 零行漂·「B271 插入 +1」不成立）；**席1-P2②** §9 最大行漂 +8→**+7**（亲证起草锚 #3「:509」自身偏 1·声明实位 :510→:517=+7）；**席1-P2③** 恒等行计数改「16 行 hex 恒等+5 行锚行恒等（hex 共 20 行其中 4 漂移）」（原「20 行 blob 恒等·八 hex」计数失实）；**席1-P2④** §9 工序2 #12 增注锚窗外主线携入断言收紧两处（settlementFaces 四臂 race→单臂 `waitForExpectedTerminal` 钉死·扣费臂三路 race→单臂 `NO_REPORT_ON_CHARGED` 钉死·blob `2f73a54e` 与主线 tip `55584f1f` 全等亲证·后继 trio 复验按收紧形行使）。自检：docs:check EXIT=0（scanned 2100≤cap 2104·零新文件）+markers 五类零命中。登记性观察（非八项·不动手·留协调方裁决）：①§0.1-#2 表行「块 :237-248」「B271 扣额注释族插入致块尾 +1 行」旧表述仍在——亲证块实位 :237-247 零行漂·与工序2 #2 勘误后口径不一致·表行改写不在八项清单故未动；②§1.5 检索面「:387-397」与 §0.1-#3「:387-394」区间端值不一致（新树 :395 起为 AG39 注释段）·未列入八项故未动。· Ban self-approve · STOP*

*并线预备附记（2026-10-14 · nail 预备席 · docs-only 恰 1 .md=本卷 · ⛔push 维持 · alone ≠ dual · 零产品码零 spec 零夹具零迁移零 SSOT 触碰 · 行翻面权归协调方）——**并线**：`git fetch` 后 `git merge --no-ff feat/mysql-schema-skeleton` → **merge `bb5cb024`**（双亲 `2ca5a613`+`3dc286a4` · 主线 tip 与 `origin/feat/mysql-schema-skeleton` 全等亲证 `3dc286a4` · merge-base `55584f1f` · merge-tree `--write-tree` 预演 EXIT=0 + 实跑 auto-merge **零冲突** → 协调方 union 并集解惯例（cap 取大/注册行并集）本轮**零触发**·零解需登记 · ⛔pull --rebase 未用）· 并线后主线口径=cap **2112**·sse-push 门主线已翻面绿·批表 **190/271** 维持。**门矩阵（并线后树 `bb5cb024` 本席亲跑全表）**：①`pnpm turbo typecheck --force` EXIT=0 **8/8**（0 cached）；②`pnpm docs:check` EXIT=0 **2107 ≤ cap 2112**（余 5 贴边·80 required files verified）；③`pnpm turbo lint --force` EXIT=0 **12/12**·三值恰等贴线 **web 601 / root 5224 / api 1421** 全 0 errors——旧承登红「api 1431>1421+root 5212>5200」已随主线 `8b577e8b` 预算翻面消偿（预算现值 601/5224/1421·apps/web/package.json+public-text-policy.mjs:60 亲证）·非本席动作·如实登记口径变化；④`pnpm sse-push:notify:prove` EXIT=0 **35 PASS/0 FAIL**（主线 `3dc286a4` 翻面绿·并线树复证·旧 2/35 承登红随 `line/ssepush-notify` 并线终止）；⑤markers 五类（TODO/FIXME/XXX/HACK/冲突标记·词面运行时组装）merge 引入 38 文件改动集直扫：**净新增含词行恰 1 行=主线携入门矩阵记载行本身（词面自指·零真标记零冲突残留）**·其余命中（`>>>>>>>`/XXX 引用 :2114/:2275/:2297/:2299/:2308）两侧恒等既有文档引用行非合并引入 → **五类零新增成立**。**下波 pusher 收尾清单**：⑴ push 行使权在主会话/协调方（本席 ⛔push 铁律·本 commit 仅落工作区）；⑵ 卷 Status 翻面与 backlog `:107` 行翻转归协调方（既登不变·本附记不预 claim）；⑶ cap 2112 现值 2107 余 5 贴边——push 前若再有 docs 增量须先核 docs:check ≤2112；⑷ lint 三值恰等贴线——push 前任何警告增量须先消偿再行；⑸ sse-push 门已绿 35/35·交割单承登口径随主线 `3dc286a4` 翻面更新；⑹ post-prove 双审两外席待派（`executed:awaiting_post_prove_dual` 维持）；⑺ trio 三红复验仍未行使（须协调方显式授权+live 预算·est live=0 维持·`actualSpendCny=null`）。· Ban self-approve · STOP*
