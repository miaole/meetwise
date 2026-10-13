# CI-WIRING2 REQUEST（批5 第三刀续 · CI-WIRING 续刀 · 12 件真开放 · 五簇收债刀）

**先盘点后起草**。前刀 CI-WIRING 已 **nailed**（merge 6ca2275b 入主线 `feat/mysql-schema-skeleton`·收窄裁形四件落码：A 簇 typecheck 门+drift 径1+r4 迁移+证明诚实 #147/#113⑤；neg 六步/LINT S3-S5 停报零落码——disposition 全谱见前卷 §9·**禁复用已 nailed 卷及其收据充数**：`ai-docs/delivery/harness/ci-wiring-REQUEST.md` 只读引用）。本刀=12 件真开放新立项，立项依据=前卷 §9 R2 勘误三件：**簇字母错位**（R2 ①② 引用错位·本卷按 §1 原定义校正引用）、**.dockerignore 行漂**（R4 记 :12-13→现树 :16-17）、**零动作清单不完备**（R2 五件外·#155+#176 归置/#226 半/#99/#159/#177 五件无归续刀口径——恰为本卷簇Ⅴ 立项面）。位图行：TASK-SOP-v2:84 5D CI-WIRING 槽位继续消化（LEDGER:87 同槽·批5 残面）·issues-master 更正版 12 件原文逐件誊录判定见 §0.2。

## §0 现状锚（起草席亲读·base `feat/mysql-schema-skeleton` @`626ac3cc`·git log -1 实测 2026-10-13「ci(gitleaks): allowlist receipts/live-rerun-2026-10-11/diag-entitlement-flow.log…」·file:line 亲证·虚构锚=审席 FAIL 回炉·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 前刀 nailed 面盘点（本刀基线·只读）
主线 ci.yml **322 行·87 具名步**（实测）：:98-102 前刀 typecheck gate（:100 `--dry=json`+:101 **选择面断言硬编码三任务** `['//#typecheck','@meetwise/contracts#typecheck','@meetwise/web#typecheck']`+:102 `pnpm turbo typecheck`）；:159-160 MIG 迁移编号唯一性门；:161-162 migrate:prove；:163-166 前刀 drift 门（#175 径1·对账 sql/ 镜像 25 文件）；:167-168 neg:bend；:169-170 dbhy1:prove；:300 api:validate；:302 api:smoke；:310-313 E2E 结构性闸注释原文在；:315-321 CI-WIRING 纪律注记（:318-320 neg 六步停报原文：「neg:commerce/resume/interview/uc033 绿、neg:auth 3/81 与 neg:input 3/135 基线既有确定性红——停止条件上报未接线」）。nightly.yml **65 行**：:40 缺 key `exit 0`（:41 model:smoke 名义硬门）、:49/:57 `continue-on-error: true`、:54/:64 skip-if-absent——#97 面原样。`pnpm turbo typecheck` 本树实跑 **3/3 successful EXIT=0**（复证）；tenant-wiring-e5 EXIT=0、security:prove 绿（:67 反操纵硬条款断言在场）、drift:prove/migrate:prove 在 CI 链。apps/worker/evidence/ **31 件**在·apps/worker/src 下 `r4-*` **0 件**·.dockerignore :16-17（#169 注释+排除行）。

### 0.1 本刀环境面（起草席实跑）
docker 29.1.3；run-e2e-isolated.mjs 独立容器（meetwise-e2e-*·端口随机·`ISOLATED_POSTGRES_OUTPUT_WITHHELD` 语义）实测可跑全套 isolated prove；LIVE_E2E_TARGETS run-e2e-isolated.mjs:**89** `new Set(['e2e:prove','e2e:ui','performance:e2e'])`（:18 注释 UNCHANGED 原样·:2562 assertNoFakeServiceFlags）——neg:*/uc033/recruiter/db-*/tokenstream/sse-push/vector-plane-erasure **均不在 live 集·无 MODEL_API_KEY 可跑**（#114/#226 关键判据沿前刀）。根 package.json 脚本锚：neg:auth :98·neg:commerce :105·neg:resume :111·neg:interview :112·neg:bend :113·neg:input :114·neg:all :116·uc033 :179-180·recruiter:prove :215-216·drift:prove :444·tokenstream:prove :516-517。

### 0.2 12 件逐件查重表（issues-master 更正版原文要点+本树实测定谳）
| # | 更正版行·原文要点（修法列） | 本树实测（2026-10-13 起草席实跑/rg） | 判定 |
|---|---|---|---|
| #96 | :167 五包无 typecheck 脚本·CI 无 tsc 门（修法列：各包补脚本+turbo 门+修 strictNullChecks 过期注释） | 拆三半：**typecheck 门零错域半=已落**（0.0 :98-102·本刀基线）；**LINT S3-S5 半=开放**：eslint 薄壳 12 文件在（root+11 workspace·相对路径 re-export `packages/config/eslint.config.base.mjs`·apps/api 壳亲读）·全仓 `"lint"` script **0**（rg 实测）·`max-warnings` **0 痕**·turbo.json :9 `lint:{}` 壳空转（lint-design.md §5 记 :8——+1 漂移登记 0.6）；**五债包 strict 半=开放**：api/worker/db/ai-runtime/domain 五包 `"typecheck"` script **0/5**（rg 实测）·tsc 现测 api **33**（含跨包 domain/ai-runtime 源错误·ai-runtime interview-voice-seams.ts 4 件+domain 若干=清债顺序依赖实证）/domain **27**/db **23**/ai-runtime **21**/worker **TS1005 语法中止计数不可得**（0.3）——对比 tscgate2-fixbatches.md:9 旧基线 128（41/26/26/20/15）演进如实登记 | **开放×2 半**（簇Ⅰ LINT·簇Ⅱ 五债包） |
| #96🔒LINT | LEDGER「S0-S2✅·S3-S5 续」；lint-design.md §1.5：S3=dlx 瞬态 dry-run 全量+四规则真计数+`--max-warnings N` 基线定值（零修复 warn 态）·S4=per-workspace lint script 点亮（≤5 文件/批·两批）·S5=`pnpm turbo lint` 全量绿+收据 | 0.2 #96 行：12 壳在（S2 成）·S3-S5 全未动 | **开放**（簇Ⅰ） |
| #155 | :172 ~12 新 prove 不在 CI/nightly（修法列：逐个评估纳 per-push 或 nightly） | 差集**实测 414 件根 prove 类 script 中 325 件不在 ci.yml**（node 枚举 2026-10-13·issue 时 ~12 演进至 325·非漂移系后续批次新增）；#155 点名家族全在差集：tokenstream:prove :516-517·sse-push:notify:prove :177-178·vector-plane-erasure:prove :416-417·db-id-v7/db-trigfam/db-intfk/db-money3/db-acl/db-acl2 :375-390·recruiter:prove :215-216 | **开放**（簇Ⅴ 归置清单化·裁⑩） |
| #114 | :251 neg:auth/resume/interview/commerce/input+uc033 不在 CI（修法列：复用 api:validate 隔离库方式） | 六件**全不在 ci.yml**（0.0 步清单零命中）·六件+neg:bend 全无 key 可跑（0.1）·**红面实测**：neg:auth **3/90 红**（deactivate 族三件：停用后 DB status=disabled/原令牌应即时失效→401 account_inactive/再登录被拒→401 invalid_credentials·与 :319 注记 3/81 同族·总数 81→90 演进）·neg:input **3/135 红**（inj:sqli-in-status-query-nocrash/inj:xss-in-feedback-comment-nocrash/inj:xss-in-learning-topic-nocrash·同 :319 注记）·neg:interview **1/102 红=新红**（abandon 重复放弃(IV_ABND)→200 alreadyAbandoned+noop 不二次退款·前刀 nail 基线 102 全绿·0.3）·neg:commerce **90 全绿**（nail 84→+6 演进）·neg:resume 91 全绿·uc033 51 全绿·neg:bend **178 全绿**（:168 在 CI） | **开放**（簇Ⅲ·红面 7 件三族先清偿后纳 CI） |
| #175 | :276 drift 逐列/约束比对门被替换消失（修法列：恢复门 或 删 sql/ 镜像+neg 夹具迁移建库） | **径1 已落**：ci.yml :165-166 drift 门+scripts/schema-drift-check.mjs（6592 bytes）+drift:prove package.json:444+packages/db/sql/ **25 文件**真相源保留 | **已落·登记闭合**（本刀零触·drift 门步=Ban 面） |
| #147 | :405 静态门标注+删恒真断言（tenant-wiring-e5 :83） | **已落**：tenant-wiring-e5.proof.ts :83-86 恒真 `A(..., true)` 已改 predicate-backed 真断言（#147 CI-WIRING 注释在·fail-loud）+实跑 EXIT=0 | **已落·登记闭合** |
| #159 | :271 model_first_token 生产无调用方·proof 由 fake 自调（修法列：删或标注未接线+proof 改名 fake-seam） | generation-progress.ts:**88** noteModelFirstToken 定义·调用方**仅** tokenstream-progress.proof.ts :22/:78/:99/:145（生产零调用原样）·**fake-seam 改名零命中·未接线标注零命中** | **开放**（簇Ⅴ 可收小件·裁⑫） |
| #169 | :275 worker/src 31 个 r4-*（7,163 行）迁 evidence·生产镜像不含 | **已落**：apps/worker/src `r4-*`=**0**·apps/worker/evidence/ **31 件**·全仓 r4-* 66（evidence 31+test 侧）·src 生产 import `evidence/` **零命中**·.dockerignore :16-17 排除行+注释在 | **已落·登记闭合** |
| #226 | :451 recruiter:prove+recruiting-bound 不在 per-push/nightly·终态 Promise.any 四结算面（修法列：纳 nightly·钉死单一臂） | recruiter:prove :215-216 **workflows 零命中**·本树实跑**全绿（无 key isolated·收据落 .tmp/isolated-proof-receipts/）**；recruiting-bound.spec.ts **343 行**·`Promise.any` **三处 :141/:289/:315**（前卷记 :137/:285/:311→**+4 漂移**·0.6）·settlementFaces 四臂 **:136-138**（EARLY_STOP_COPY/RELEASED_MSG_PART/REPORT_DOWN_MSG_PART/PRACTICE_FEEDBACK_PART）·不在 LIVE_E2E_TARGETS | **开放半**（簇Ⅳ·钉臂三处+归置宿裁⑨） |
| #176 | :420 uc018 性能 prove 仅 Docker Desktop/macOS 验证（修法列：Linux 拓扑验证+写明网络参数） | scripts/uc018-perf-load-capped-child.mjs :1-25 头注仍 Docker caps 自述（--cpus/--memory+host 网络语义）·uc018:perf-load:prove :145-146 **不在 ci.yml**（CI runner=ubuntu-latest 即 Linux 拓扑） | **开放**（簇Ⅴ·裁⑫） |
| #177 | :421 S2 探针保留+egress 清单登记·门禁按 #178 修 | ai-docs/architecture/ai/provider-egress-inventory.json **:1250/:1765** `source: scripts/tokstream-s2-probe.mjs` 在+JSON.parse OK·#178 已闭 | **残值≈0**（簇Ⅴ 复核收据一行·不单独计件） |
| #99 | :244 测试名实不符·多步假依赖·无组件测试与覆盖率（修法列：三类标签先行） | *.proof.ts **393 件**（issue 时 323→+70 演进）·三类标签机制（静态契约/假依赖/真集成）**rg 零命中**（#147 处局部「静态门」标注除外） | **开放**（簇Ⅴ·裁⑪） |
| #113⑤ | :250 security.proof ⑤ 两条近同义反复（keyed attack 半接 nightly=S7） | **⑤ 已落**：security.proof.ts :55-67 段序钉死结构回放+逐片段零污染（:66）+反操纵硬条款（:67）·security:prove 实跑绿；**keyed attack 半=nightly 零 attack 原样=S7 排除维持** | **⑤ 已落·登记闭合**（keyed 半维持排除·§3） |

### 0.3 主线演进新红面登记（本刀基线实跑·2026-10-13）
① **neg:interview 1/102 新红**：`FAIL abandon 重复放弃(IV_ABND)→200 alreadyAbandoned + noop（不二次退款）`——前刀 nail 基线（前卷 §9 复验⑩）102 全绿·ci.yml :319 注记亦记绿·**复跑钉死非抖动**（两次独立实跑同 1/102）——嫌疑引入域=bill/entpay 退款邻域（meetwise-bill*/line/batch1-residual 在飞·0.4）·溯源=裁⑥。② **worker 语法破面**：`pnpm -C apps/worker exec tsc -p tsconfig.json --noEmit` → `src/qbank-release-sweep.ts(79,91): error TS1005: ')' expected.`（恰 1 错·asQbankControlExecutor( 调用缺一右括号·全包语义检查中止=worker true 错数不可得）——引入=b20ee350（qbank-control-sec 刀·其卷「typecheck 3/3」系零错域选择面未含 worker 之盲区实证=**#96 五债包无门的直接代价**）·生产进口=apps/worker/src/main.ts（worker proofs 不 boot main 故 prove 链未炸·亲证）；**簇Ⅱ 首批第 0 步=语法破面修复（解锁全包计数）**。③ 计数演进三处（neg:auth 81→90·neg:commerce 84→90·proof 存量 323→393）全归后续主线刀·非本刀面·如实登记。

### 0.4 近期刀顺带面查重（逐件判）
① **前刀 CI-WIRING**（nailed·@`6ca2275b` merge）：本刀=其停报面+无归面续刀·前卷只读禁复用·typecheck gate/drift 门两步=前刀自有步（簇Ⅱ 触 :101 断言面=Ban 例外·裁②）。② **MIG-RUNNER**（@`685498f1` 并主线）：唯一性步 :159-160 零触。③ **authz-harden**（5A 并主线@`5cb78dab`·**meetwise-authz 树 74374a01 在飞**）：authz5a 族 prove 不在 CI（差集内·裁⑩ 面内）·**deactivate 族红面修复与在飞 authz 域邻接——派单前主会核查交叠**（§4）。④ **bill1-4/entpay（在飞）**：abandon 红面邻域嫌疑·0.3-①。⑤ **qbank-control-sec**（@`b20ee350` 并主线）：worker TS1000x 破面引入者·0.3-②·修复归簇Ⅱ。⑥ **TSCGATE-2/c12**（exec 双卷）：零错域先行先例·本刀簇Ⅱ=五债包收尾·同源不冲突。⑦ 其余在飞树（ag19/ag24/ag37-39/aga-agf/blite/cost1-3/e2sc/i263/i6/parity2/qsec/ttlwire/5e 等 worktree list 实测 30 树）与本刀五簇域零交初判·EXEC 立项时以当时 tip 重查。

### 0.5 依赖与闸
**被谁闸**：S7（TASK-SOP:96 CI MODEL_API_KEY 决策·起草时点未见决议卷）——keyed 四件（#98/#240/#97/#113-keyed attack 半）**维持排除·登记不预支**（§3）。前刀 nailed=typecheck 门/drift 门基线已绿（0.0）·#178 已闭=前置全释放。批5 序内本刀与 MIG/AUTHZ 落地面零同文件冲突（ci.yml 同文件=前刀/MIG 已定分·本刀新增步只增·唯一既有步触碰=裁② Ban 例外）。**闸谁**：neg 六步纳 CI 后=红面清偿成为合并闸前提（簇Ⅲ 完成前六步不得先行接入致 per-push 恒红·裁⑦ 序）；#155 归置表=后继批新 prove 归宿先例。

### 0.6 漂移登记（前卷锚→本树实测·如实全登）
① recruiting-bound.spec.ts Promise.any :137/:285/:311→**:141/:289/:315**（+4 整体漂移·settlementFaces :136-138 亲证）·文件 311→343 行。② turbo.json `"lint":{}` lint-design.md §5 记 :8→现 **:9**（turbo.json :4 `//#typecheck`·:7 `typecheck` 恒等）。③ .dockerignore 前卷 R4 记 :12-13→现 **:16-17**（P2 勘2 落地）。④ neg:auth 总数 81→90·neg:commerce 84→90·neg:interview 102 绿→**1/102 红**（0.3）。⑤ issues-master 更正版行号全抽样复核吻合（#96 :167/#98 :168/#155 :172/#97 :243/#99 :244/#113 :250/#114 :251/#159 :271/#169 :275/#175 :276/#240 :315/#147 :405/#176 :420/#177 :421/#226 :451·**后席必引更正版·禁引旧版**）。⑥ 前卷 §0 锚 ci.yml 297/299/322 行系基线演进（297=前刀基线→299=MIG 并入→**322=现主线终形**）·本卷全锚按 322 形。⑦ 红面数字口径=**以 EXEC 立项日实跑为准·本卷 2026-10-13 实测为参照**——偏差超 ±20% 或红面族数变化=偏差熔断·停手上报重 pin。

## §1 修法（五簇·只增不改建·ci.yml 既有步骤零改语义·**唯一 Ban 例外=簇Ⅱ 前刀自有 typecheck gate 断言面扩容（裁②）**·EXEC 立项重 pin）
- **簇Ⅰ·LINT S3-S5 点亮（#96-LINT 残半·沿 lint-design.md §1.5 零偏离）**：S3 `pnpm dlx` 瞬态 dry-run 全量+四规则真计数钉死+`--max-warnings N` 基线定值（零修复·warn 态·N=裁③·用后 `git diff --exit-code package.json pnpm-lock.yaml` 亲证义务沿 lint-design §2）；S4 per-workspace `"lint"` script 点亮（12 壳已全·≤5 文件/批分批形=裁④）；S5 `pnpm turbo lint` 全量绿+收据进 ci.yml（typecheck gate :98-102 邻位·**纯新增步**）。format-only diff 若行使须独立 commit 另行授权。
- **簇Ⅱ·五债包 typecheck 清债（#96-五包 strict 残半）**：第 0 步=worker 语法破面修复（0.3-②·qbank-release-sweep.ts:79 缺右括号·**最小修复禁顺手重构**）；随后五包（api/worker/db/ai-runtime/domain）各补 `"typecheck"` script+tsc 清债（顺序与批粒度=裁①·≤5 文件/批沿 tscgate2 先例·落窄类型禁 `any`→`unknown` 假清零沿 lint-design 纪律）；每包点亮后 turbo typecheck 选择面随扩·终态 `--dry=json` 选择面=零错域三任务+五债包八任务（ci.yml :101 断言面扩容=**Ban 例外·裁② 形**·前刀自有步）；strictNullChecks 过期注释修正（#96 修法列尾句·packages/config/tsconfig/nest.json `_note` 面）随本簇。
- **簇Ⅲ·neg 红面清偿+六步纳 per-push（#114）**：红面 7 件三族（deactivate×3·inj×3·abandon×1）逐族定修向（行为修复 vs 断言修正·裁⑤·触产品码限红面文件名单内·fail-closed 越界即停）·neg:interview 新红溯源先登（裁⑥）；七 neg 面全绿后 ci.yml verify DB-up 段（:168 neg:bend 紧邻位）**纯新增**六步：neg:auth/neg:commerce/neg:resume/neg:interview/neg:input+uc033:cross-user-authz:prove（api:validate :300 同 runner 同隔离库先例·无 key·归置 per-push 负例门=合并闸语义不作 nightly 软化·纳入口径=裁⑦）。
- **簇Ⅳ·#226 钉臂+归置**：recruiting-bound.spec.ts :141/:289/:315 `Promise.any` 三处→**钉死单一臂**（期望臂=裁⑧·须与 B 端产品口径对齐·断言只增强不削弱）；recruiter:prove（实测绿）+recruiting-bound 归置宿=nightly vs per-push（裁⑨·宿面接线**纯新增步**）。
- **簇Ⅴ·归置清单化（#155+#176+#99+#159+#177·前卷 R2 勘3 无归面收编）**：①#155 归置清单文件：325 差集逐名三态（per-push/nightly/零动作登记）·裁度权=裁⑩·点名件（tokenstream/sse-push/vector-plane-erasure/db-* 六族等）若裁入 CI=宿面纯新增步；②#176：uc018 Linux 拓扑验证路径=裁⑫（nightly 步行使 vs 头注网络参数补写+CI 纳入登记）；③#99 三类标签机制形=裁⑪；④#159：generation-progress noteModelFirstToken 未接线标注+tokenstream-progress.proof.ts fake-seam 改名（形=裁⑫·改名不削断言）；⑤#177：egress 登记完整性复核收据一行（0.2 残值≈0 已复证·EXEC 复跑留痕即闭）。
- **已落四件（#175/#147/#169/#113⑤）零修法·只登记**（0.2）·其门面（drift :165-166/dbhy1 :169-170/security:prove/tenant-wiring-e5 链）=Ban 面。

## §2 验收断言候选（pre-exec 双审核对单基面·断言力≥3）
1. **簇Ⅰ lint**：`pnpm turbo lint` EXIT=0+全 workspace `"lint"` script rg 计数=点亮面定值+四规则计数与 `--max-warnings N` 入收据+dlx 后 `git diff --exit-code package.json pnpm-lock.yaml` 零 diff。
2. **簇Ⅱ 五包点亮**：五 package.json 各含 `"typecheck"`（rg 实证）+`pnpm turbo typecheck` EXIT=0+`turbo run typecheck --dry=json` 选择面=零错域三任务+五债包（:101 断言随裁② 扩容形）+五包 `tsc -p tsconfig.json --noEmit` 各自 `grep -c "error TS"`=**0**。
3. **簇Ⅱ 破面闭合**：worker tsc 复跑零 `TS1005`（语义检查完整跑通·错数从「语法中止」变「实测计数」再清零·轨迹留收据）。
4. **簇Ⅲ 六步绿+纳 CI**：六步本地实跑全 EXIT=0（无 key isolated）+ci.yml :168 邻位六步在位（rg 计 neg 面合计 7 步）+既有 :152/:168 步零改+植入负样本本地负测 EXIT≠0（不落卷不留痕）。
5. **簇Ⅳ 钉臂**：`rg -c "Promise.any" apps/web/e2e-ui/recruiting-bound.spec.ts`=**0**+单臂断言新锚行号在卷+归置步在宿 workflow（rg 命中）。
6. **簇Ⅴ 清单**：归置清单文件在且覆盖 325 差集逐名三态（count 对账）+点名件实入 CI 者 rg 命中+#159 标注/改名 rg 实证+#177 收据行在。
7. **只增不减**：ci.yml diff 对基线 `626ac3cc`=纯新增行+**唯一例外**=:101 断言面扩容（裁② 授权形·diff 中如实行数）+纯注释增补；nightly.yml **65 行逐字节不动**（keyed 三步 :40-65 零触）。
8. **已落四件回归**：收尾复跑 tenant-wiring-e5/security:prove/drift:prove/migrate:prove 四门全 EXIT=0（本刀基线不退化）。

## §3 范围外（越界即 FAIL）
① **S7 keyed 件显式排除**：#98/#240（主链 E2E nightly+云资源）·#97（缺 key fail 化+eval 阈值硬门）·#113 keyed 半（adaptive-attack 接 nightly）——**登记不预支**·S7 未决前任何 secret 引用新增=停手上报。② deps-audit.yml/deploy.yml/pages.yml/release.yml/governance-history.yml/ha-probe-multi.yml 六件 workflow 零触。③ MIG 唯一性步（:159-160）·drift 门步（:163-166）·dbhy1 步（:169-170）零触。④ e2e driver/helper 零触（#226 限 recruiting-bound.spec.ts 断言面·settlementFaces 函数体若臂裁需触及=裁⑧ 授权面内·不得改 helper）。⑤ 迁移面零触（migrations/ 零新增零改·簇Ⅲ 修向若需迁移=停手上报）。⑥ secrets 名值零配置零读取新增。⑦ pins 十一值零翻（含 g7SuiteGreen=false——keyed 面排除故 G7 套件绿不被本刀主张）。⑧ 前刀 nailed 卷及其收据只读·禁复用禁改写。

## §4 依赖（闸谁/被谁闸）
**被闸**：S7（CI MODEL_API_KEY·§3-① 唯一用户硬闸）；在飞域交叠：meetwise-authz（deactivate 族邻域·0.4-③）与 bill/entpay（abandon 族邻域·0.4-④）——**派单前主会核查在飞树域·交叠即协调方定序**。**闸**：簇Ⅲ 六步纳 CI 后 neg 红面=合并闸前提（后刀新红即阻断·裁⑦ 序明示）；#155 归置表=5C 四子刀等后继批 prove 归宿先例；簇Ⅱ 五包点亮=后续全仓 strict 单一基线。

## §5 Ban 列表 + pins（沿 ci-wiring 前卷 §5 同源逐字誊 + 本刀面增补）

**Ban 列表**（同源逐字誊 + 本刀增补）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触 `crag.ts` 决策逻辑与 RAG 面产品码（本刀零相关）；Ban 动 embedding 计算面；Ban 迁移越权（本刀零新迁移·migrations/ 零新增零改动）；Ban 触其他工作树；Ban 伪造已问/已验来源；Ban 改 ci.yml 既有步骤语义/顺序/删除（只增不改建·**唯一例外=簇Ⅱ :101 断言面扩容·裁② 授权形·如实行数入卷**；:56-65/:78-81/:129-134/:159-162/:163-166/:169-170/:300-302/:310-321 零触）；Ban 触 nightly.yml 全文件（65 行逐字节·keyed 三步与 secrets 引用零触）；Ban 触 deps-audit.yml/deploy.yml 等 §3-② 六件 workflow；Ban secrets 新增配置（S7 未决·发现需要即停手上报）；Ban 弱化既有 prove 断言（簇Ⅳ 钉臂=四臂收单臂·收拢方向=**增强**·收拢后新断言必须严于 Promise.any 任一单臂通过语义·反例即红）；Ban fail-open（新门缺件必须 fail-loud）；Ban 洗基线计数（ci.yml 步数只增不减如实宣布·87 步基线）；Ban 生产库直连操作（prove 全隔离 fixture 库）；**本刀增补**：Ban 复用前刀 nailed 卷收据充数（前卷只读引用）；Ban 顺手重构（簇Ⅱ 破面修复限最小括号修复·禁同文件风格化改动）；Ban 红面修向越族（簇Ⅲ 触产品码限三红族文件名单·名单外停手上报）；Ban dlx 残留（S3 行使后 package.json/pnpm-lock.yaml 零 diff 亲证义务）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀全门=静态/隔离库机械断言·零模型外呼·零 secrets 消耗）

## §6 est live=0

本刀零模型真实外呼：全部新增门=lint/typecheck 静态门+隔离库机械断言（api:validate/neg:* 先例·0.1 判据·全不在 LIVE_E2E_TARGETS）·#176 若行使 Linux 拓扑=CI runner 机械跑 uc018:perf-load（现状无 key 路径·若实测遇 key 依赖=停报归 S7）·零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐步登记零外呼口径）。keyed 面（§3-①）全排除故 est live 恒 0。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ci-wiring2-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿前刀/§7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md·同前刀律）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。**CI 自证特殊性**：本刀验收执行面=CI 自身运行（per-push verify 即簇Ⅰ/Ⅱ/Ⅲ 门的自证场）——EXEC 期本地实跑为先行证·合并后 CI 首绿为终证·两者歧义时以 CI 运行为准（歧义=停报·禁本地洗绿）。

**待双审/EXEC 裁决项（十二）**：①簇Ⅱ 清债顺序与批粒度（破面修复=第 0 步定案；跨包序 domain/ai-runtime 先行（api 计数含其源错误·0.2）vs 按包并行；≤5 文件/批）；②簇Ⅱ 门扩容形（:101 断言面一次扩八任务 vs 随清债逐包渐进·**Ban 例外唯一授权点**）；③簇Ⅰ S3 `--max-warnings N` 基线值（dlx dry-run 点亮日实测钉死·禁伪称预估）；④簇Ⅰ S4 分批形（12 壳一次全量 vs lint-design §1.5 两批 ≤5 文件/批）；⑤簇Ⅲ 红面修向逐族定（deactivate×3/inj×3/abandon×1 各自「行为修复 vs 断言修正」·触产品码限红面文件名单）；⑥簇Ⅲ neg:interview 新红溯源（bill/entpay 邻域引入刀归属核查先登·随⑤ 修向）；⑦簇Ⅲ 六步纳 per-push 时机（七面全绿一次纳 vs 绿面先纳红面后补）；⑧簇Ⅳ 期望臂（settlementFaces 四臂 :136-138 钉哪臂·须与 B 端产品口径对齐）；⑨簇Ⅳ 归置宿（recruiter:prove+recruiting-bound 纳 nightly vs per-push·时长实测定）；⑩簇Ⅴ #155 裁度权（325 差集逐名三态 EXEC 定 vs 只清单化+点名件入 CI·点名候选=tokenstream/sse-push/vector-plane-erasure/db-* 六族）；⑪#99 三类标签形（文件头注 vs 目录约定 vs 清单文件·393 存量标注粒度）；⑫#159 改名形+#176 宿（proof 文件改名 vs 段名/头注标注；uc018=nightly 步行使 Linux 拓扑 vs 头注网络参数补写+CI 纳入登记）。

---

## §9 前刀卷 disposition 引用（只读·禁复用）与 P2 三勘误落地对照

前卷 `ci-wiring-REQUEST.md` §9（nail disposition·append-only）**只读引用**：并线事实（322 行三步共存）/R1 请示未获答=停报处理律（**本刀 EXEC 援引同款**）/R2 收窄形五件零动作登记/R3 pristine failLines 口径/R4 镜像门静态在位核/席2 四条（EXEMPTIONS 休眠·簇E 结构性证明·停报四件复证·MIG 并线预判）/nail 复验全谱十项——全为**前刀既成事实**·本刀零改写零复用充数。**P2 三勘误落地对照**：勘1 簇字母错位（R2 ①「簇B neg:*」应为簇C·R2 ②「簇D LINT」应为簇B）→本卷引用处全按前卷 §1 原定义校正（0.0/0.2）；勘2 .dockerignore 行漂（R4 :12-13）→本树实测 :16-17（0.6-③）；勘3 零动作清单不完备（#155+#176 归置/#226 半/#99/#159/#177 无归续刀口径）→**恰为本卷簇Ⅴ 立项面**（§1 簇Ⅴ）。**R2 前刀五件与本刀十二件交集判定**：neg 六步→簇Ⅲ 收编；LINT S3-S5→簇Ⅰ 收编；五债包 typecheck→簇Ⅱ 收编；S7 keyed 四件→维持排除（§3-①）；r4 prove 链绿承诺降格→随 #169 已落自动闭（0.2）——**前刀停报面全数有归·零悬空**。

---

*CI-WIRING2 REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`626ac3cc`（git log -1 实测·开工前主仓 pull「Already up to date」亲证）· 分支 `line/ci-wiring2` · 工作树 `meetwise-ciw2`（git worktree add 本起草席立·建前 worktree list 实查分支不存在）· 蓝本=前刀 ci-wiring-REQUEST 形制（§0-§9 全·Ban/pins 同源誊录）+issues-master 更正版 12 件（:167/:172/:244/:250/:251/:271/:275/:276/:315/:405/:420/:421/:451 逐件誊录判定）· 防重：前卷 §9 R2 勘3 五件无归面=本卷立项·已落四件（#175/#147/#169/#113⑤）逐件实跑/rg 复证闭合·S7 keyed 四件维持排除 · §0 六节全实测锚（ci.yml 322 行 87 步/nightly 65 行/红面 7 件三族实跑/worker TS1005 破面/325 差集枚举/Promise.any :141/:289/:315）· §1 五簇Ⅰ-Ⅴ+已落四件零修法 · §2 八条断言 · §8 十二裁决项 · 恰 1 .md 零码动 · est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual · CI 自证特殊性：本刀交付后由 CI 自身运行验证*
