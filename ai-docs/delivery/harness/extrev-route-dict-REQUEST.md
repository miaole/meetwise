# Harness — **EXTREV-0 · ROUTE-DICT** · #133 候选人简历路由词典收紧 + 样本回归集（docs REQUEST · `draft:awaiting_pre_exec_dual`）

**Status**: `draft:awaiting_pre_exec_dual`（REQUEST 起草席位 mw-routedict-draft · docs-only · 零产品码 · 零 prove run · 零 self-nail）
**Date**: 2026-10-07（起草）
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`5636d58d`** / full `5636d58d7f7080159c227782c73451c6b102292a`（评审基线 `2fab7946` 距主线 4 commit=现状有效 · 行号已亲读复核）
**Line**: **EXTREV-0 / ROUTE-DICT**（外部评审修复战役第 2 刀 · SOP `extreview-fix-campaign-SOP.md:14`）
**Experts（拟 · 预执行双审）**: `mw-rag-route`（route 域主审）+ `mw-e2e-ha`（begin 面/证明诚实副审）——alone ≠ dual · 实现方禁自审自批
**Authority**: meetwise（EXTREV 战役协调方）——本文件是 EXEC REQUEST；dual BOTH PASS + 协调方 AUTHORIZE 前禁 coding/prove
**Knife**: **ROUTE-DICT · #133 词典收紧（泛词去语言叶/上下文化）+ 样本回归集**（恰 1 个产品文件词典面 + 1 个新 proof 文件 + prove 键登记）
**Ban 提要**: Ban 扩权改仲裁语义 · Ban 让用户选择面（产品交互超范围）· Ban #146 限流 · Ban 迁移/DB · Ban 冒用 job 维度 · Ban secrets · alone ≠ dual

---

## §0 立靶（SOP + 总表 #133 + 现状亲验）

### 0.1 依据链

| 依据 | 引文（零改写） | 亲验 |
|---|---|---|
| SOP `extreview-fix-campaign-SOP.md:14` | 「ROUTE-DICT \| #133 词典收紧（泛词去语言叶/上下文化）+样本回归集（#146 归 EXTREV-3C API-HARDEN·roadmap:30）」 | ✅ 读 |
| 总表 `issues-master.md:159`（#133 · P1 · 第0批阻断项） | 「候选人简历路由分类器词典过宽（测试/算法/go/html/css 等泛词各成语言叶），大量正常简历被判歧义，begin 同步 409 candidate_route_undecided \| packages/domain/src/candidate-profile-route.ts:39-52,57-63,98-104；apps/api/src/modules/interview/interview.service.ts:296-301；packages/db/src/candidate-route.ts:64-67 \| 仍存在 \| 已核实（含实跑样本）」 | ✅ 行号复核（见 0.3 漂移注） |
| 评审实跑样本 `findings.md:351`（#133 · 已核实含实跑） | ①`3年Java后端开发，Spring Boot，熟悉MySQL，编写单元测试` → ambiguous（java+`测试`→qa）；②`Python Django engineer, Redis, I like to go hiking` → ambiguous（`\bgo\b` 命中英文单词 go）；③`NestJS + React 全栈, TypeScript` → ambiguous；④`Java developer using Redis` → decided（backend/java）。「同一事务内先 supply 再扣额度，所以不会扣费，但用户无法开面试。」 | ✅ 对齐亲读推演（本席位零 run · 依 SOP 规则 4 由 EXEC prove 实测坐实） |

### 0.2 病灶（亲读 `packages/domain/src/candidate-profile-route.ts`）

- **:39-52 `CANDIDATE_PROFILE_SIGNALS`**——泛词作语言叶独占：
  - `:47` `'backend/go': ['golang', 'go', 'gin']` 含裸 `'go'`；
  - `:49` `'frontend/web'` 含 `'html'`/`'css'`/`'javascript'`（另 `'typescript'` 同病类，见裁定表 #5）；
  - `:50` `'qa/quality_engineering'` 含裸 `'测试'`；
  - `:51` `'ai_ml/applied'` 含裸 `'算法'`。
  后端简历提单测/算法/HTML 即多叶命中 → 假歧义。
- **:54 `normalize` + :57-63 `signalMatches`**——ASCII token 用 `\b` 词边界（已防 `google` 误中，但裸 `go` 仍中 "go hiking" 类英文普通动词）；CJK token 用大小写敏感 `includes` 子串（裸 `测试`/`算法` 即中「单元测试」「基础算法」）。**匹配机制本身不在病灶内（不改）。**
- **:95-104 仲裁**——恰 1 叶 → 该叶；`backend/general` + 唯一 1 个 specific 叶 → 取 specific 叶（`:100-102`）；0 叶 → `no_signal_hit`；其余（≥2 specific 叶）→ `ambiguous_language_evidence`。
- **begin 409 面**：`apps/api/src/modules/interview/interview.service.ts:297-301`（undecided → 同步 409 `candidate_route_undecided`，同事务回滚零扣费）；db 供给链 `packages/db/src/candidate-route.ts:64-67`（`classifyCandidateProfileByRule` 唯一调用方）。
- **policy 版本冻结条款**：`candidate-profile-route.ts:23-24`「改词典/优先序 = 改路由语义，必须升版本」→ 本刀**必须**升 `CANDIDATE_ROUTE_POLICY_VERSION`。0142 迁移 `policy_version` 仅长度 CHECK（`0142_candidate_profile_route.sql:33` `char_length BETWEEN 1 AND 64`）→ 升版**零迁移**。既有 v1 决策行不受影响（幂等复用回读旧行，不重算）。

### 0.3 行号漂移注（SOP 规则 1）

总表引 `interview.service.ts:296-301`——实树供给块 `:297-301`、409 throw `:300`（`:296` 是注释行，漂 ±1 不改判定）。`candidate-route.ts:64-67`、`candidate-profile-route.ts:39-52/:57-63/:98-104` 均精确命中。

---

## §1 范围（恰 1 产品文件词典面 + 1 新 proof 文件 + prove 键登记）

### 1.1 泛词处置 · 逐词裁定表（起草席亲读词典 + 调用面后裁定 · 双审可修订）

原则：**弱证据/歧义证据词不作语言叶**——语言叶（nodejs/java/go/python/frontend/qa/ai_ml）只收「语言/岗位自述级强证据」；弱证据归 `backend/general` 共享桶（机制上 general 永不产生歧义：`general`+唯一 specific 叶 → 取 specific 叶 `:100-102`；general 单独命中 → decided `backend/general` `:99`）。

| # | 词 | 现居（file:line） | 病灶 | **裁定** | 改后归属 |
|---|---|---|---|---|---|
| 1 | `go` | `backend/go` `:47` | `\bgo\b` 命中英文普通动词（评审样本②亲证） | **移除裸词**。上下文化新增（CJK 混合 token 走大小写敏感 `includes` 分支 → 双大小写 × 带空格/不带空格显式列举）：`go语言`/`Go语言`/`go 语言`/`Go 语言`/`go开发`/`Go开发`/`go 开发`/`Go 开发`/`go工程师`/`Go工程师`/`go后端`/`Go后端`；保留 `golang`/`gin` | `backend/go` |
| 2 | `html` | `frontend/web` `:49` | 泛词：后端/AI/QA 简历普遍提及 → 假性 frontend 叶 | **移出 `frontend/web`，迁入 `backend/general`**（共享/降级桶语义） | `backend/general` |
| 3 | `css` | `frontend/web` `:49` | 同 `html` | 同 `html` | `backend/general` |
| 4 | `javascript` | `frontend/web` `:49` | 跨栈词：Node 后端简历必写 JS → nodejs+frontend 假歧义 | 同 `html` | `backend/general` |
| 5 | `typescript` | `frontend/web` `:49` | 与 `javascript` 同病类（NestJS/Node TS 后端简历）；**超出任务点名清单，起草席按「亲读词典」授权补入，双审可裁掉（裁掉需在 EXEC 修订记录注明）** | 同 `html` | `backend/general` |
| 6 | `测试` | `qa/quality_engineering` `:50` | CJK 子串：后端「单元测试/接口测试」即中（评审样本①亲证） | **移除裸词**。收窄新增：`测试开发`/`测试工程师`/`软件测试`；保留 `自动化测试`/`qa`/`质量工程`/`sdet` | `qa/quality_engineering` |
| 7 | `算法` | `ai_ml/applied` `:51` | CJK 子串：任何工程师「基础算法/数据结构」即中 | **移除裸词**。收窄新增：`算法工程师`/`算法专家`/`机器学习算法`；`推荐算法`/`搜索算法` **不收**（后端推荐/搜索系统工程师真实存在=歧义中间带，宁 no_signal 不误判） | `ai_ml/applied` |
| 8 | `qa` | `qa/quality_engineering` `:50` | 评审列名但无实跑假阳样本；`\bqa\b` 无常见英文裸词歧义 | **保留**（登记观察项） | 不变 |
| 9 | `rag` | `ai_ml/applied` `:51` | 评审列名；`\brag\b` 简历语境几乎唯一（词边界已防子串） | **保留**（登记观察项） | 不变 |

**观察项不动清单**（登记不改，防单刀扩权）：`spring`（英文简历季节词 "Spring 2024" 低频风险）、`express`/`angular`/`tornado`（英文普通词低频风险）、`前端`/`后端开发` 等 general 桶词（general 证据结构上不产生歧义）。

**裁定代价面（诚实登记）**：a) 纯 `html/css` 切图类简历从 `frontend/web` 改判 `backend/general`（样本 S15 断言新去向）；b) 裸 `Go`/`测试`/`算法` 无上下文证据的简历可能落入 `no_signal_hit` 409（宁拒不误判——409 拒因清晰可改简历重提，错叶路由不可见更难救）；c) 真全栈简历仍 409（见 1.3 冻结面）。

### 1.2 样本回归集（16 条 ≥ 12 · 新 proof 文件内 · 每条断言 `decided`+叶 或 `undecided`+reason）

| # | 简历文本（代表性） | 现状（v1 词典·亲读推演） | 期望（v2 词典） | 断言面 |
|---|---|---|---|---|
| S01 | `3年Java后端开发，Spring Boot，熟悉MySQL，编写单元测试`（评审①） | undecided·ambiguous | **decided `backend/java`** | 修复面 |
| S02 | `Python Django engineer, Redis, I like to go hiking`（评审②） | undecided·ambiguous（`\bgo\b`） | **decided `backend/python`** | 修复面 |
| S03 | `NestJS + React 全栈, TypeScript`（评审③） | undecided·ambiguous | **仍 undecided·`ambiguous_language_evidence`** | **冻结守护**（真歧义不放宽） |
| S04 | `Java developer using Redis`（评审④） | decided `backend/java` | decided `backend/java` | 既有正确面守护 |
| S05 | `前端开发工程师，React，HTML/CSS，JavaScript` | decided `frontend/web` | decided `frontend/web` | 守护（泛词迁 general 后前端面不回归） |
| S06 | `Java 后端工程师，负责管理系统开发，页面用 HTML/CSS/JS` | undecided·ambiguous | **decided `backend/java`** | 修复面（#133 核心） |
| S07 | `5年 Go 语言开发，gin 框架，高并发微服务` | decided `backend/go`（经裸 `go`） | decided `backend/go`（经 `Go 语言` 新 token） | **迁移守护**（裸词移除后上下文 token 接管同叶） |
| S08 | `Golang 后端，分布式系统，熟悉基础算法与数据结构` | undecided·ambiguous（`算法` 子串） | **decided `backend/go`** | 修复面 |
| S09 | `测试开发工程师，Selenium，自动化测试` | decided `qa/quality_engineering` | decided `qa/quality_engineering` | 守护（qa 收窄后真 QA 简历不回归） |
| S10 | `Python 后端，FastAPI，负责接口测试与运维` | undecided·ambiguous（`接口测试` 子串） | **decided `backend/python`** | 修复面 |
| S11 | `算法工程师，机器学习，推荐系统` | decided `ai_ml/applied` | decided `ai_ml/applied`（经 `算法工程师` 职位词） | 迁移守护 |
| S12 | `机器学习工程师，PyTorch，会写简单 html 报表页` | undecided·ambiguous（`html`） | **decided `ai_ml/applied`** | 修复面 |
| S13 | `Node.js 后端开发，JavaScript，Express` | undecided·ambiguous（`javascript`） | **decided `backend/nodejs`** | 修复面（任务点名 javascript） |
| S14 | `测试工程师，懂 MySQL 与接口自动化` | decided `qa`（general+1 specific 仲裁） | decided `qa/quality_engineering` | 守护（`:100-102` 既有仲裁正确面） |
| S15 | `熟练 HTML CSS 页面制作，切图` | decided `frontend/web` | **decided `backend/general`** | **裁定代价面**（诚实断言叶变更去向） |
| S16 | `产品经理，负责需求文档` | undecided·`no_signal_hit` | 仍 undecided·`no_signal_hit` | 409 面守护（零信号仍拒·零 API 行为改） |

另加**机制守护断言**（非样本）：i) `google`/`github` 不命中 `backend/go`（词边界机制回归守护）；ii) `javascript` 不因 `java` 命中 `backend/java`（既有 `\b` 守护）；iii) 仲裁三规则不变（恰 1 叶 / general+1 specific / ≥2 specific 仍 ambiguous）；iv) `CANDIDATE_ROUTE_POLICY_VERSION === 'candidate-route-2026-10-frozen:v2'`。

### 1.3 关键设计判断 · 歧义降级策略（读 `:54-104` 现有仲裁后裁定）

**裁定：词典面降级（泛词迁 `backend/general` 桶），仲裁逻辑 `:95-104` 零改动。**

- **为什么够用**：现有机制已完整表达「降级 general 而非 409」——泛词归 general 桶后，(a) 后端+html 类简历命中 {语言叶, general} → `:100-102` 取语言叶 decided；(b) 仅泛词简历命中 {general} → `:99` decided `backend/general`；(c) general 证据**结构上不可能**制造 ≥2 specific 叶歧义。降级在数据（词典）层完成，不需要新代码路径。
- **为什么不「按命中数最高叶」**：逐叶计数+取最大是 job 面 `job-route-classifier.ts` 的 count/校准机制族；candidate 面 G7S 冻结语义**刻意无此机制**（文件头 `:13-14`「优先序冻结（语言专精证据 > 通用后端栈证据；≥2 语言叶并存 = 歧义未决，绝不多桶推断）」）。引入计数仲裁 = 发明新机制 + 改冻结优先序 + 语义等价于多桶推断——三重违反任务禁令与 G7S 冻结条款。
- **冻结面（Ban 放宽）**：≥2 **强**语言叶并存（如 S03 真全栈 NestJS+React）仍 `ambiguous_language_evidence` → 409。这是 G7S/沿 job 侧「全栈绝不扩散」的冻结纪律，本刀只消灭**弱词假歧义**，不裁决真歧义。「歧义时降级为 general **或让用户选择**」（总表建议后半句）是仲裁/交互语义变更 → 归另刀（见 §2）。
- **policy 版本**：改词典=改路由语义 → `CANDIDATE_ROUTE_POLICY_VERSION` `'candidate-route-2026-10-frozen:v1'` → `'candidate-route-2026-10-frozen:v2'`（`:23-24` 冻结条款要求；0142 仅长度 CHECK，零迁移；`decision_hash` 含 policyVersion → v2 决策行身份自然区分）。

---

## §2 非范围（Ban 扩权）

- **#146 begin 限流 + 路由判定结果缓存** → EXTREV-3C API-HARDEN（roadmap:30 · SOP rev2 已移出本刀）。
- **零 API 行为改**：`interview.service.ts` 409 面零触碰——仍 409 仅当真歧义（≥2 强语言叶）/`no_signal_hit`/`profile_*`；错误码/reason 结构不变。
- **零仲裁逻辑改 / 零新机制**：`signalMatches`（`:57-63`）、`normalize`（`:54`）、`classifyCandidateProfileByRule` 仲裁分支（`:95-104`）零改动。
- **零迁移 / 零 DB**：0142 两表零触碰；既有 v1 决策/snapshot 行零改写（幂等复用回读，不按新词典重算已 begin 的 interview——防二次扣费面）。
- **「让用户选择 route」交互面 / 真歧义降级仲裁**：产品语义变更，归另刀（若立项须引本 REQUEST §1.3）。
- **job 面词典**（`job-route-classifier.ts` `RULE_SIGNALS`）：岗位语义 ≠ 能力语义（G7S Ban 冒用条款），零触碰。
- **worker 角色门 / 检索面**：`adaptive-role-resolve` fail-closed 门、`getInterviewRouteSnapshotForAdaptiveRole` 读侧零改动。
- **新 prove 键纳 CI/nightly** → EXTREV-2 CI-WIRING（#155 面）。
- **词典观察项**（`spring`/`express`/`angular`/`tornado`/`推荐算法` 收词等）：本刀不裁，登记 §1.1 观察清单待后续同域刀。
- **UC-018/UC-052/矩阵行**：本刀非 covered-lift，零 SSOT flip。

---

## §3 改动清单（EXEC 时 file:line · 现树基线 `5636d58d`）

| # | 文件 | 位置 | 改动 |
|---|---|---|---|
| 1 | `packages/domain/src/candidate-profile-route.ts` | `:24` | `CANDIDATE_ROUTE_POLICY_VERSION` v1 → **v2**（冻结条款 `:23`） |
| 2 | 同上 | `:40-44` | `backend/general` 数组追加 `'html','css','javascript','typescript'` |
| 3 | 同上 | `:47` | `backend/go` 移除裸 `'go'`，追加 §1.1 #1 上下文 token 12 个（双大小写×空格变体） |
| 4 | 同上 | `:49` | `frontend/web` 移除 `'html','css','javascript','typescript'`（余 `前端/frontend/react/vue/angular/小程序`） |
| 5 | 同上 | `:50` | `qa/quality_engineering` 移除裸 `'测试'`，追加 `'测试开发','测试工程师','软件测试'` |
| 6 | 同上 | `:51` | `ai_ml/applied` 移除裸 `'算法'`，追加 `'算法工程师','算法专家','机器学习算法'` |
| 7 | 同上 | `:33-38` | 词典 docstring 同步（泛词归 general 共享桶 + 上下文化语义说明）——仅注释 |
| 8 | `packages/domain/test/candidate-profile-route.proof.ts` | 新文件 | §1.2 16 样本 + §1.2 机制守护 i–iv（形制照抄 `test/input-routing.proof.ts`：`A()` 断言 + fail 计数 + EXIT） |
| 9 | `packages/domain/package.json` | `scripts` | 追加 `"prove:candidate-route": "tsx test/candidate-profile-route.proof.ts"` |
| 10 | 根 `package.json` | `scripts` | 追加 `"candidate-route:prove": "pnpm -C packages/domain prove:candidate-route"` |

#2-#6 即「恰 1 产品文件词典面」；#8-#10 为配套 proof 接线（纯 script 行，非产品码）。

---

## §4 prove（EXEC 授权后 · 本 REQUEST 零 prove）

- **主 prove**：`pnpm candidate-route:prove`（= `tsx test/candidate-profile-route.proof.ts` · 纯域 · 零 DB 零模型零 IO 零网络）→ 期望 **EXIT=0**，全断言 PASS（含 4 条评审实跑样本对齐坐实——SOP 规则 4）。
- **route 相关既有键全跑零回归**（词典面共用分类法/begin 链）：
  - `pnpm job-route-classify-binding:prove`（job 面·共用 `TAXONOMY_V1_LEAVES`·守护本刀未越界改 job 面）
  - `pnpm neg:interview` / `pnpm neg:commerce`（预种子 route 行→幂等复用面·词典无关·守护 409 映射不变）
  - `pnpm turn-idempotency:prove` / `pnpm resume-reference:http:prove`（begin 链回归）
  - `pnpm r2-p-api-route-classify:prove`（route 面 API 回归）
- **已知前置状态（诚实登记 · 非本刀所致）**：`uc001:nhp-bound:prove` 的 begin 夹具无 `resume_blob`（`uc-e2e-001-nhp-bound.proof.ts:175` 仅种 resume 行）→ G7S（`939f1b44` · 2026-10-08）后该 proof 首次 begin 走 `profile_unavailable` 409 路径、与词典无关（分类器未触达）。EXEC 时先记录其现状 EXIT；若 red 且根因=缺 blob 夹具 → 登记残留归 G7S 后继刀，**本刀禁顺手修**（Ban 扩权）。
- **EXIT0 ≠** 路由准确率保证 · ≠ 覆盖全部简历形态 · ≠ CI 已纳入 · ≠ #133 关闭叙事可免（关单走协调方）。
- **EXIT1 = 诚实保留**；Ban retry-to-green。

---

## §5 Ban 列表

- Ban coding / prove 执行 / self-nail / self-approve（until 预执行 dual BOTH PASS + 协调方 AUTHORIZE）
- Ban 改仲裁逻辑 `:95-104` / `signalMatches` / `normalize`（禁发明新机制·禁引入计数仲裁·禁多桶推断）
- Ban 改 API 409 面（错误码/reason/HTTP 语义）/ Ban 「让用户选择」交互面
- Ban 迁移 / DB / 0142 两表 / 既有 v1 决策行重算或改写
- Ban 冒用 job 维度（`job_route_decision`/`job_semantic_revision`）/ Ban 触 `job-route-classifier.ts` 词典
- Ban #146 限流/缓存（归 API-HARDEN）/ Ban CI 接线（归 CI-WIRING）
- Ban 顺手修 `uc001:nhp-bound` 夹具 / Ban 顺手裁观察项收词
- Ban secrets / `.env*` / Ban live / Ban MODEL_API_KEY / Ban force-push / Ban Meridian / Ban MySQL/Qdrant 切流叙事 / Ban 买云

## §6 Pins（十一值 · 照抄 · 禁改口）

```
haStatus=NOT_HA
releaseEvidence=false
claimProductionHA=false
gR45Closed=true
coveredCount=8
ms3EqualsR4Closed=false
PG-retained（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）
公开 DELETE /privacy/interview-data/:id = 503
canHonestlyFlip=false
UC-018/UC-052 partial ≠ covered
g7SuiteGreen=false
```

另钉（本刀语境）：`candidateRoutePolicy=2026-10-frozen:v1→v2（本刀改路由语义·升版强制）` · `fullstackAmbiguous409=frozen-by-design（真歧义 409 冻结面·本刀不放宽）` · `routeAccuracyGuarantee=false（词典收紧≠路由准确率保证）`。

## §7 Non-claims

词典收紧 ≠ 路由准确率保证 · ≠ 覆盖全部简历形态 · ≠ 真歧义（全栈）简历可用 · ≠ 让用户选择面 · ≠ #146 限流/缓存 · ≠ begin API 行为改（仍 409 仅当真歧义/零信号/profile 面）· ≠ CI 纳入 · ≠ job 面词典收紧 · ≠ covered / SSOT flip · ≠ nail · ≠ HA · ≠ `releaseEvidence=true` · 本 REQUEST 是 docs 草案非执行收据 · alone ≠ dual · Dual PASS ≠ coding authorized · 样本现状列为亲读推演（零 run），以 EXEC prove 实测为准。

## §8 形制与生命周期

- 本刀走北星 loop §3 单刀流程：本 REQUEST（③）→ 预执行双审 `mw-rag-route` + `mw-e2e-ha` BOTH Verdict: PASS（④）→ 协调方 AUTHORIZE（⑤）→ 实现+prove 一次优先（⑥）→ post-prove 双审（⑦）→ 协调方授权 nail + push（⑧）。
- 收尾回报格式照 NORTH-STAR §5（LINE=EXTREV-0/ROUTE-DICT · REQUEST_SHA=本 commit · PROVE_CMD/EXIT/RECEIPT · DUAL · NAIL_SHA · SSOT_DELTA · STILL_OPEN · PINS_OK）。
- nail 时才允许改共享 SSOT（SOP `extreview-fix-campaign-SOP.md:14` ROUTE-DICT 状态行、矩阵/backlog 如涉）——本 REQUEST 不预写。

---

*Harness · EXTREV-0 ROUTE-DICT · #133 词典收紧+样本回归集 · 2026-10-07 · draft:awaiting_pre_exec_dual · mw-routedict-draft · docs-only 零产品码零 run · Ban 改仲裁语义 · 真歧义 409 冻结面不放宽 · 词典收紧≠路由准确率保证 · alone ≠ dual · STOP*


## rev2 双审收口（2026-10-09 · 席1 PASS+席2 PASS·四登记项转为 EXEC 义务）

- **D1（席1 P1+席2 合流·EXEC 必做）**：go 上下文 token 追加 GO 全大写变体——GO语言/GO 语言/GO开发/GO 开发/GO工程师/GO后端（机制依据：includes 分支大小写敏感 vs ASCII 分支 i-flag 的不对称·ENUM 枚举是 Ban 改 signalMatches 下唯一闭合手段）；§1.2 加 1 条 GO 形态守护样本。
- **D2（观察项登记）**：「测开」补入观察项（漏收实词·方向保守）；「自动化」裸词以「有意排除」名义入观察项（防后续刀误补）；英文 "Go developer" 形态不收（假阳回归）。
- **D3（冗余注记）**：「机器学习算法」token 冗余（必中「机器学习」子串）——留删随意，EXEC 记录注明。
- **D4（代价面补句）**：代价面 a) 措辞扩「纯 html/css/javascript/typescript 弱前端证据类简历→backend/general」叶变更（与 S15 同类）。
- **P3 关单叙事（席1）**：#133 关单须区分「假歧义已修（弱词污染类）/真歧义 409 冻结待后继『用户选择』刀」——不得称全栈简历已可用。
- Status: `draft_rev2:pre_exec_dual_PASS`（双席 BOTH PASS·EXEC 授权·蓝本=本 rev2）。

## rev3 409 政策改向（2026-10-10 · 产品审计 #133 验收口径并入·协调方裁定审计胜）

**变化**：本刀 rev2 曾裁定「真歧义 409 冻结（G7S 条款）·待后继用户选择刀」；产品审计 #133 验收与 fix-roadmap 第 0 批 #133 行明确要求：**歧义与 0 叶命中都降级为默认路由（backend/general），不 409**；样本验收升级为 ≥30 份 fixture（Node+TS/Java+测试/Python+算法/Go+gin/纯前端/纯QA/纯算法各 3+「后端+自动化测试」反例），断言后端类样本 candidate_route_undecided 计数=0 且反例不落 qa。

- **R3-1（仲裁改动·解除 G7S 冻结）**：:95-104 仲裁增加降级臂——`{≥2 specific}` 真歧义→decided backend/general（不再 409）；`{}` 零命中→decided backend/general（维持 :99 既有面）。「绝不多桶推断」冻结条款由 G7S 立法改为：**在多桶不可判定时选最大覆盖面桶（general）并携带 degraded 信号**（policy_version v3 强制升版——:23-24 冻结条款按「用户决策凌驾」路径解除，erratum 登记 G7S 语义变更归协调方卷）。
- **R3-2（#270 反例）**：「后端+自动化测试」不落 qa——测试词已收窄（rev2 已定）+反例样本断言（「自动化测试」单叶 qa、「后端+自动化测试」双叶降级 general 而非 qa——注意：若后端叶（如 java）在场则取 specific 后端叶；两者都无后端叶时 general 胜出 qa——样本断言写死该优先序）。
- **R3-3（409 退役面）**：interview.service.ts:299-300 candidate_route_undecided throw 路径保留代码（防御性）但 v3 词典+仲裁下结构性不可达（supply 必返 decided）；UI 无需改（409 不再发生）——#250/#251 的 409 文案面归 W1 照做（其他 409 原因仍在：binding_conflict 等）。
- **R3-4（样本集）**：≥30 份 fixture 落 packages/domain/test/fixtures/candidate-route-samples/（审计验收原文）；§1.2 的 16 份扩充至 30+。
- **R3-5（审议记录）**：G7S「绝不多桶推断」立法本意=防错路由；审计裁定「409 拒绝启动比泛化路由伤害更大」（用户旅程第 4 断点）——协调方裁定采纳；先前「待后继用户选择刀」条款作废（后继 UI 刀 #259 仍立项但非门槛）。
- Status: `draft_rev3:pre_exec_dual_PASS_plus_policy_redirect`（EXEC 授权·蓝本=本 rev3；rev2 的 D1-D4 登记项照旧）。

## EXEC 收口（2026-10-10 · 席 mw-routedict-exec · #133 ROUTE-DICT 刀落地）

- **Status**: `exec_done:prove_green_6keys_4green_2_preexisting_red_registered`（本行为 append-only 状态行；蓝本=rev3）。
- **改动面**：`packages/domain/src/candidate-profile-route.ts`（词典 v3+降级臂+docstring）· `packages/domain/src/index.ts`（+1 type export 行）· `packages/domain/test/candidate-profile-route.proof.ts`（新 proof）· `packages/domain/test/fixtures/candidate-route-samples/`（42 fixtures）· `packages/domain/package.json`+根 `package.json`（各 +1 script 行）。零迁移零 DB 文件零 `interview.service.ts` 触碰（R3-3 409 防御面原样）。
- **词典 EXEC 记录**：§1.1 全表落地；go 上下文 token 18 个（§1.1 12 + rev2 D1 GO 大写 6）；D3 裁定 `'机器学习算法'` **保留**（冗余——必中 `'机器学习'` 子串——按 §3 #6 原样收词，注释已登记）；D2 观察项（测开/自动化裸词/英文 "Go developer"）登记于词典 docstring，未收词。
- **R3-1 落地**：`:103-104` 两臂改为 `{}` 零命中→decided `backend/general`+degraded`no_signal_hit`；`{≥2 specific}`→decided `backend/general`+degraded`ambiguous_language_evidence`；`:95-102` 恰 1 叶/general+唯一 specific 两规则零改动；`profile_empty` 唯一剩余 undecided（db 侧 profile_unavailable→409 防御面保留）。`no_signal_hit`/`ambiguous_language_evidence` 未决拒因退役（仅存 `degradedFrom` 对账信号）。policy v1→**v3**。
- **R3-2 断言序裁定（诚实登记）**：rev3 括注「若后端叶在场则取 specific 后端叶」按 R3-1 全称规则（{≥2 specific}→general 无例外）解释为 `general+唯一 specific`（无 qa 在场）既有 `:100-102` 提升面；反例 fixture 写死：`{java|nodejs|go, qa}` 双 specific→degraded general 不落 qa（ce1-ce3/j3）；`{frontend, qa}` 无后端叶→general 胜出 qa（ce4）；「自动化测试」单叶→qa（g6+q 类）。
- **§1.2 rev3 改向行**：S03（真全栈）与 S16（零信号）由 v2 期望「409 未决守护」改写为「decided backend/general+degraded」——依 R3-1/R3-5 审计裁定（409 拒绝启动伤害更大），proof 表内注明。
- **prove 收据**：`candidate-route:prove` **EXIT=0**（75 断言全 PASS·fixture 42 份）。既有键：`job-route-classify-binding:prove` **EXIT=0** · `neg:interview` **EXIT=0**（97 条全绿）· `neg:commerce` **EXIT=0**（84 条全绿）· `r2-p-api-route-classify:prove` **EXIT=0** · `turn-idempotency:prove` **EXIT=1** 与 `resume-reference:http:prove` **EXIT=1** ——**基线预存红（非本刀回归）**：根因=隔离 e2e PG 容器缺 `assert_interview_privacy_active()`（42883·migrations 0059/0062/0096 未入隔离容器·rebase 后基线 runner 漂移）；已在未改动基线 commit `28c24e6a` 对照复跑坐实同 signature（3 FAIL/5 FAIL 全同）。登记残留归基线/runner 后继刀，本刀未触碰（Ban 顺手修）。
- **uc001:nhp-bound:prove 现状登记（§4 预告项）**：**EXIT=1**（非本刀键）——begin 409 `candidate_route_undecided`/`profile_unavailable`（夹具无 resume_blob，分类器未触达）；同时坐实 R3-3 防御 409 面仍有效。残留归 G7S 后继刀。
- **停止条件核查**：实树锚漂——无（rev3 锚 `deacfd49` 内容完整，rebase 后同内容 hash=`28c24e6a`；指定路径工作树缺失系环境态，按原路径+原分支重建后推进）；证明键冲突——无（`candidate-route:prove` 根/domain 均无既有键）；需触范围外——无（db/api/迁移/job 面词典零触碰）。
- ** Pins**：§6 十一值照抄不变 + `candidateRoutePolicy=2026-10-frozen:v1→v3（本刀改路由语义·升版强制）` · `fullstackAmbiguous409=retired-by-user-decision（真歧义降级 general·R3-5 作废「待用户选择刀」门槛，#259 非门槛）` · `routeAccuracyGuarantee=false`。
- **Non-claims**：词典收紧 ≠ 路由准确率保证 · EXIT0 ≠ 全简历形态覆盖 · ≠ CI 纳入（归 CI-WIRING）· 409 退役面 = 结构性不可达而非代码删除（防御路径保留）· #133 关单叙事须区分「假歧义已修 + 真歧义降级 general（#270 反例不落 qa）」· alone ≠ dual。
