# QUIZDX REQUEST — quiz/diagnosis HTTP 级逐实体 SSE 流证明起草卷（`GAP-SSEPUSH-QUIZ-DX-HTTP` · 总盘 v4 唯一未认领 keyless 小刀 · P2 · QD1–QD4/DX1–DX4 八臂一 proof）（docs-only REQUEST 卷 · 起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草态 · 本卷 1 个新 .md · 零产品码零迁移零依赖 · pre-exec 双审 BOTH PASS + 协调方明示 EXEC 授权前不得落码 · alone≠dual · Ban self-approve · Ban 自翻 `GAP-SSEPUSH-QUIZ-DX-HTTP` 行 · ⛔push ⛔动主仓）。

**席位**：meetwise quiz/diagnosis SSE 起草席（docs-only 起草 · 协调方授权 · 新建 worktree `meetwise-quizdx` · 分支 `line/quizdx-draft`）。
**基线**：`origin/main` @ **`99e4e3f38`**（full `99e4e3f385d7f992a88aad4b3e5f31d1e77ba3d3` · 2026-10-30 · rev r3 回炉时 `git fetch origin` 亲点后 rebase 本支；`53cc4a434→99e4e3f38` diff 恰 **13 件**，全在 UC-003/UC3M 面（`uc3m-REQUEST.md` +1、web OCR/i18n 测试与产品薄缝、coverage/case 矩阵 UC-003 注记、`gap-bug-backlog` +1）+ policy/lint 帽（`public-text-policy.mjs` +1 注记、root `package.json:8` lint 帽 5408→5410），与 §0.1 **UC-010 机制锚零交**）· rev r3 树 `node scripts/ai-docs/check-docs.mjs` 亲跑 **EXIT=0 · scanned 2460**（main 届 2459 + 本卷 1；cap `MAX_FILES=2_461` 余 1；EXEC `+1 proof = 2461` **恰等 cap 余 0** · §2 cap 预算核）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/architecture/current-runtime-truth.md`（`:282` quiz:prove / `:283` diagnosis:prove 均只到「SSE 终态」层）→ `ai-docs/delivery/execution-master-checklist.md`（**`:1660` STILL OPEN 原文** · `:1659` SSE-PUSH Non-claims）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（`:116` UC-E2E-010 行 · `:176`  ledger · `:271` P1-1 · `:313` 证据表）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（§1.1 `:47` NHP-010-FAULT-01 · `:50` NHP-010-ADV-02）→ `ai-docs/delivery/harness/uc-e2e-010-sse-resume.md`（五 case 先例 R1–R4 + R-mid · `:74`）→ `ai-docs/delivery/harness/xrep-REQUEST.md`（`§9-post` 跨副本已 CLOSED 界）→ `ai-docs/delivery/harness/sse-adv-REQUEST.md`（同主体双流隔离先例）→ 机制源 `apps/api/src/modules/quiz/quiz.controller.ts` / `diagnosis.controller.ts` / `interview.controller.ts` / `apps/api/src/modules/interview/interview.service.ts` / `apps/api/src/platform/sse-pump.ts` / `sse-notify.service.ts` / `rate-limit.service.ts` / `last-event-id.ts` / `packages/db/src/interview/interview-event.ts` / `packages/db/sql/20_resume_quiz.sql` / `21_resume_diagnosis.sql` / `packages/db/migrations/0143_sse_push_notify.sql` / `0214_interview_event_statement_notify.sql` / `0062_interview_privacy_event_stream_scope.sql` → 宿主/注册面 `apps/api/src/main.ts` / `apps/api/src/platform/principal.guard.ts` / `apps/api/src/platform/sse-registry.ts` → 注册器 `scripts/run-e2e-isolated.mjs` / `scripts/bounded-command.mjs`（注册五位·**provenance 两 script 前置**·P2⑥）→ 证明先例 `apps/api/test/uc-e2e-010-sse-resume.proof.ts` · `uc-e2e-010-nhp-crossstream.proof.ts` · `sse-push-notify.proof.ts` · `uc-e2e-016-nhp-neg.proof.ts` · `uc-e2e-002-nhp-http-bound.proof.ts` · `validate.ts`（SSE 子集）· `e2e/helpers/sse.ts`。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①`execution-master-checklist.md:1660` **`GAP-SSEPUSH-QUIZ-DX-HTTP`（quiz/diagnosis 共 pump 共表码面单源+类型检查 · HTTP 级逐实体流证明未单列）**；②协调方派单令（总盘 v4 明示唯一未认领 keyless 小刀 · P2）；③同族 STILL OPEN 行 `GAP-SSEPUSH-FULL-E2E`（三流终态段未跑）与 `GAP-SSEPUSH-REG-WINDOW`（initial→waiter 注册 ~ms 窗）本卷零认领；④`GAP-SSEPUSH-CROSS-REPLICA` 已由 xrep 关（本卷零重叠·§0.3）。

---

## 认领核对 · 登记处 fresh 亲点（逐行对 `origin/main` @`99e4e3f38` 亲读 · file:line 逐字 · rev r3 重 pin；`53cc4a434→99e4e3f38` diff 13 件仅触 UC-003/UC3M 面与 policy/lint 帽，UC-010 锚行逐字不变（coverage matrix `:116/:176/:271/:313`、case matrix `:47-:50` 亲点不变），逐条结论不变）

| 登记处 | 对树行使证据（亲读逐字） | 判定 |
|---|---|---|
| checklist `:1660` 主登记 | 「**`GAP-SSEPUSH-QUIZ-DX-HTTP`**（quiz/diagnosis 共 pump 共表码面单源+类型检查 · HTTP 级逐实体流证明未单列）」·同行 `STILL OPEN（行登记 · 均不关闭）` | **开**（亲点维持） |
| checklist `:1659` Non-claims 界 | 「…SSE-PUSH 系…≠ 跨副本 SSE 槽/播（HC-GAP-008 未证）…≠ full e2e 三流绿（未跑）…≠ covered」 | 旁证一致（本卷零认领跨副本/full e2e） |
| coverage matrix `:116` | UC-E2E-010 行为 `partial/partial/partial/blind(case-only)` 四格——四格全为 interview 流证据（NHP-010-ADV-01/ADV-02 case 注记在内），**无 quiz/diagnosis 逐实体流格** | **缺口在格**（本卷只补证据·格值零翻） |
| coverage matrix `:176/:271/:313` | `:176` UC-E2E-010 证据行（`uc010:sse-resume:prove` + R1–R4/R-mid）；`:271` P1-1；`:313` 证据表 `13 PASS`——**全部 interview 流** | 旁证一致 |
| coverage matrix 简报指位 `:306?` | 本 tip `:306` = 证据表「eval harness cite」行（`known RED`），**非 UC-010 锚**；UC-010 真实锚=` :116/:176/:271/:313`。如实登记简报指位漂移（不改锚·只更指位） | 指位勘误 |
| case matrix §1.1 `:47` | NHP-010-FAULT-01「断 SSE→LED / R-mid｜续传成功；无双扣｜partial｜uc010:sse-resume:prove」 | 旁证一致（interview 流） |
| case matrix §1.1 `:50` | NHP-010-ADV-02「同主体双流游标交换…｜零跨流帧交付…｜blind→case-only｜uc010:nhp-crossstream:prove」 | 旁证一致（interview 双流） |
| current-runtime-truth `:282/:283` | `quiz:prove` 22/22、`diagnosis:prove` 35/35 的措辞均只到「SSE 终态」层（终态事件/状态不倒退/RLS），**无 HTTP 级逐实体帧交付证明** | 旁证一致 |

**定性**：机制面已全在树（§0.2 逐处亲点）；所缺=**HTTP 级逐实体流证据形**（quiz 流/诊断流各自的 seq/事件形/续传/终态收口/跨流 key 域隔离）。本刀=证明缺口非机制缺口；若 EXEC 期证机制与 §0.2 不符 → 停止条件「机制不满足」如实升级（产品缺陷 EXIT1 诚实保留 + backlog 登记）。

---

## §0 现状锚（起草席亲读 · file:line + blob 逐条 `git rev-parse HEAD:<path>` 亲算 @`99e4e3f38`（rev r3 重算：38 路径逐件比对，**4 件 blob 随 main 步进**——`public-text-policy.mjs` `43f95af5`→`c633ef6c`、root `package.json` `748fc360`→`a0f7a998`、`e2e-requirement-coverage-matrix.md` `6706ad56`→`1c35605f`、`non-happy-path-perf-load-case-matrix.md` `5dc8d97c`→`51c91f06`；其余 34 件逐字不变；**行锚仅 policy `MAX_FILES` `:281`→`:282`（值 `2_461` 不变）**，另三件行锚 `:116/:176/:271/:313`、`:47-:50`、`:8/:221-222/:253-258` 逐字不变）· **EXEC 立项照本节对届时 tip 再重 pin**——漂移如实改锚 · 结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **16 树**实测——`line/quizdx-draft` 恰 1 命中=本席（`meetwise-quizdx`）；`ls ai-docs/delivery/harness | grep quizdx` 落卷前**零命中** → 落卷后唯一同名卷=本卷。
- **在飞交叠复核（EXEC 立项日必做）**：起草 turn 产品触面=0（docs-only 恰 1 新 .md）；EXEC 期触面=隔离 proof 新文件 1 + root/`apps/api` 两 `package.json` 注册行 + `scripts/run-e2e-isolated.mjs` 注册位三（**新目标登记 additive·§5 carve-out**）+ tracked 收据。届时对各在飞分支 `git log -1 -- <触面文件>` 逐树逐件复核；任一分支顶对任一触面存在 `99e4e3f38` 之后新增提交 → 触停止条件「现场漂移」停手上报。

### 0.0.1 rev r1 回炉修订小节（2026-10-30 · docs-only · 恰 1 tracked 路径=本卷 · 本 commit 适用）

- **§0.0.1.1 r1 复审与裁决**：rev r1 席1 **FAIL P1×3 + P2×15** → 协调方裁决**按处方全采纳**（去重后 18 条落点见 §0.0.1.2）。裁决口径：断言面只改**判定形**（jsonb 键序不可达处改 parsed deep-equal）不改期望语义；IV 线补齐夹具/冲刷/正控（不得只写零字节）；Ban 为 runner additive 注册开 carve-out。
- **§0.0.1.2 修订清单索引（18 条·落点）**：**本 r1 索引为历史记录·已被 §0.0.2.2 与 §1 取代**（引用时以 §1 当前文本为准；本节仅留修订沿革）。①[P1-1] QD1/DX1 jsonb 逐字节 oracle 改形（删「逐帧 `data` 与种子 `JSON.stringify` 逐字节相等」；改**帧包络逐字节 + `data` 解析 deep-equal 种子对象 + `f.data===JSON.stringify(JSON.parse(f.data))` 紧凑性**·PG16 jsonb 键序规范化不可达·沿 crossstream `:164-170` parsed-field 先例）→ **§1 逐帧断言助手/QD1/DX1**；②[P1-2] IV_ISO 夹具与冲刷（`interview` 行 upsert + 本流注入/正控帧冲刷响应头 + 断言 200+自身帧集）→ **§1 夹具合同/QD4/DX4**；③[P1-3] §5 Ban carve-out（runner 仅限 §1 注册面 additive 行·注册面称「新目标登记」）→ **§1 注册面/§5**；④[P2①] quiz-lifecycle 锚 `:43/:73/:74`→`:38/:72/:73` → **§0.1/§0.2-G**；⑤[P2②] case-matrix 锚 `:44/:47/:50`→`:47-:50`（010 组四行）+新 case id `NHP-010-FAULT-02`（非 QZDX）→ **§0.1/§0.4**；⑥[P2③] diff 实测 **1 tracked（REQUEST）非 3 tracked**·不要求 policy 步进·核对面更新 → **§0.0.1.3/§2-5/§9**；⑦[P2④] §4 boot 世界改 `sql/01-22+23_api_gateway+选迁移·零 0214/0062` → **§4**；⑧[P2⑤] 断言预算「≥40」→**「≥52（5+7+6+8+5+7+6+8）」** → **§1 注册面/§2-2**；⑨[P2⑥] provenance 前置 `run-e2e-isolated.mjs`+`bounded-command.mjs`+补 `main.ts`/`principal.guard.ts`/`sse-registry.ts` → **必读清单/§1 注册面④**；⑩[P2⑦] 0214-only 世界 0143 ACL 未重放收据注 → **§1 夹具合同/§3/§4**；⑪[P2⑧] 700ms 建立启发式改「非空 catch-up 帧回执后再注入」（防 REG-WINDOW 假红）→ **QD4/DX4**；⑫[P2⑨] 前臂 hold 显式 await + 跨臂 50-100ms settle → **§1 夹具合同**；⑬[P2⑩] QD2 LED=3 连接 abort/await 序写死 → **QD2/DX2**；⑭[P2⑪] QD3/DX3 插入时点固定 700/1400ms 不依赖观察 + 退化容差臂 `holdMs≥5000` → **QD3/DX3**；⑮[P2⑫] 夹具 DELETE 枚举全 key + 三表 ON CONFLICT DO UPDATE → **§1 夹具合同**；⑯[P2⑬] QD4 删「kind 前缀」改 marker/流标签 + IV 线零 QZ/DX 域帧且零 `: ping` + token 副断言加 IV 正控 → **QD4/DX4**；⑰[P2⑭] §8 REG-WINDOW/仪器误红 bisect 条款（五读数+单次修复重跑+红值留账）→ **§8**；⑱ 本小节。
- **§0.0.1.3 修订面冻结（实测）**：本 rev commit `git diff --name-status` 实测 **1 tracked（`ai-docs/delivery/harness/quizdx-REQUEST.md`）非 3 tracked**（P2③）；两 policy script/`MAX_FILES`/四联动点零触 ⇒ **不要求 policy 步进**（cap 只按本卷 1 件计）；产品码/迁移/既有 proof/runner 源码零触（EXEC 才落注册面 additive 行）；STOP 三处维持 `draft:awaiting_pre_exec_dual`。

### 0.0.2 rev r2 回炉修订小节（2026-10-30 · docs-only · 恰 1 tracked 路径=本卷 · 本 commit 适用）

- **§0.0.2.0 基线/预算升级**：rev r2 前 `git fetch origin` 亲点 `origin/main=53cc4a434`（`1ca3ce1d` 为其祖先）；本支 rebase 到该点（r0/r1 两 docs-only commit 内容零改写，树等价）。树届 `docs:check` 亲跑 **scanned 2459**（含本卷）≤ `MAX_FILES=2_461`（余 2）；EXEC `+1 proof = 2460` 余 1。`public-text-policy.mjs` 的 `MAX_FILES` 行随 main 重排 **`:276`→`:281`**（值仍 `2_461`·blob `05083d8a`→`43f95af5`）。
- **§0.0.2.1 r2 复审与裁决**：席1 **FAIL P1×2 + P2×10**、席2 **FAIL P1×5 + P2×5**（双席互盲同判）→ 协调方裁决**按两席处方合并全采纳**（去重后 13 条落点见 §0.0.2.2）。裁决口径：只改**断言判定形/夹具键域/信号面**，不改期望语义、不触产品码。
- **§0.0.2.2 修订清单索引（13 条·落点）**：
  ①[P1-1 撞键] **QD4/DX4 键域互斥**：DX4 改用 `QZ_ISO_DX`/`DX_ISO_DX`/`IV_ISO_DX`；清场 12 枚全 key 显式枚举；`interview` upsert 覆盖两枚 IV key；`interview_event.owner_user_id` 逐列写死 `'userA'` → **§1 夹具合同/QD4/DX4**（机制根：`packages/db/sql/01_schema.sql:48` `uq_event_seq UNIQUE (stream_key,seq)`；同键同 seq 二次注入必崩，或 LED=max-1 推 catch-up=[2] 使「帧集恰 [1,2]」必红）。
  ②[P1-2 切帧] **assertFrame 改 buffer 切帧**：`rawFrame`=`buffer` 上 `/^id: \d+\nevent: [^\n]+\ndata: .+\n\n/gm` 的 `m[0]`（含尾空行）；删 `rawChunk === …` 三处（r2 前 §1 助手①/QD1/DX1 的包络字节形）；网络 chunk 仅作 `: ping`/到达时刻旁证（沿 `sse-push-notify.proof.ts:152-182` `openSse` 的 `chunks[{t,text}]` 先例；机制根：`sse-pump.ts:130` 每帧一次 `raw.write`，Node/undici 可合并/切分 chunk，`chunk` 边界≠帧边界） → **§1 逐帧助手/QD1/QD2/QD3/DX1/DX2/DX3**。
  ③[P1-3 零 ping] **删 IV 线零 `: ping` 断言**：保留「自身帧集恰 [1,2] + 零他域字节」；活性旁证改读 `waitingCount()`（**总数口径**·健康态前置·`sse-notify.service.ts:212-216`） → **QD4/DX4**（机制根：`sse-notify.service.ts:309-319` 按裸 stream_key 精确分发，他流 notify 到不了本流；退化态 `DEGRADED_POLL_MS=2_000` 必 ping（`sse-pump.ts:208`），`sse-push-notify.proof.ts:296` 注释自认「退化态 2s 必 ping」（rev r3 勘误：原 `:299-300` 实为断言行，注释在 `:296`）。
  ④[P1-4 判别针] **针 JSON 化**：`"marker":"d-iso-`/`"marker":"i-iso-`/`"stream":"DX_ISO"`/`"stream":"IV_ISO"`（QZ 族同形）；禁单引号 `marker:'…'` 形（线上=`{"marker":"d-iso-2"}`，单引号针恒绿空转） → **QD4/DX4**。**收据注**：每线 **marker 族 + stream 族两族针均须逐线断言**并逐条留痕（只断言一族=判别面半覆盖）。
  ⑤[P1-5 hold helper] **改时间戳 reader**：`chunks[{t,text}]`+`ids()`+`frames()`+`until(pred,ms)`+`abort()` 后 `sleep(60)`（沿 `sse-push-notify.proof.ts:152-190`）；QD3/QD4/DX3/DX4 回执门 `await until(() => ids().length >= 1, 1500)` 先于注入 → **§1 夹具合同/QD3/QD4/DX3/DX4**（机制根：r2 前 `holdStream` 只在窗口结束返回，窗口中途给不出「先收正控帧再注入」信号）。
  ⑥[P2①] 删恒真紧凑性 `f.data===JSON.stringify(JSON.parse(f.data))`；如需字节面旁证改 `SELECT payload::text` 回读（注明 `jsonb::text` 含空格不可文本等值） → **§1 逐帧助手**。
  ⑦[P2②] deep-equal 钉 `node:util.isDeepStrictEqual`（禁手写递归·注键序无关） → **§1 逐帧助手**。
  ⑧[P2③] token 载荷钉 `{v:1,streamKey,attemptKey,seq,text}` + 注入前静默 ≥100ms + hold ≥3000ms + 注 delta-only 唤醒 `sse-pump.ts:192` → **QD4/DX4 可选副断言**（**r3 已撤销「可选」钉为强制·见 §0.0.3.2②**）。
  ⑨[P2④] QD4/DX4 钉 `holdMs≥3000` + 断言取**截止快照**（abort 前定格） → **QD4/DX4**。
  ⑩[P2⑤] `sleep(6000)` 改 `Promise.race([whenHealthy(), sleep(8000)])` → **§1 夹具合同**。
  ⑪[P2⑥] §4 依赖补 `_neg-harness.ts:114-142`/`:214-225` privacy stub 面 → **§4**。
  ⑫[P2⑦] §8 五读数补第 6 项 `waitingCount()`（总数口径）+「意外多帧/意外 ping」独立分口 → **§8**。
  ⑬[P2⑧–⑭+席1 P2] QD1/DX1 失败终态改 §3 non-claim；§1 开头明「类型检查子句=引用面不新增证据」；QD2/DX2 hold 300→700ms；QD2/QD3/DX2/DX3 补种子 payload 期望；§2-5 cap 按 rebase 后改算（2459/2460 余 1）；§0.1 `:272`→`:271`；§1 断言预算 52→64 → **§1/§2/§3**（⑬ 无 §8 落点——§8 第六读数落点在 ⑫）。
- **§0.0.2.3 修订面冻结（实测）**：本 rev commit `git diff --name-status` 实测 **1 tracked（本卷）**；两 policy script/`MAX_FILES`/四联动点零触（rebase 带来的 main 差异不计入本 commit 改动面）⇒ 不要求 policy 步进；产品码/迁移/既有 proof/runner 源码零触；STOP 三处维持 `draft:awaiting_pre_exec_dual`。

### 0.0.3 rev r3 回炉修订小节（2026-10-30 · docs-only · 恰 1 tracked 路径=本卷 · 本 commit 适用）

- **§0.0.3.0 基线/预算重 pin**：`git fetch origin` 亲点 `origin/main=99e4e3f38`（`53cc4a434` 为其祖先）；本支 rebase 到该点（r0/r1/r2 三 docs-only commit 内容零改写，树等价）。`53cc4a434→99e4e3f38` diff **13 件**，全在 UC-003/UC3M 面（`uc3m-REQUEST.md` +1、web OCR/i18n 测试与产品薄缝（`apps/web/lib/resume/ocr-preview-ui.ts` + 三测试件）、**`apps/web/package.json`（web lint 帽 605→607）**、coverage/case 矩阵 UC-003 注记、`gap-bug-backlog` +1）+ policy/lint 帽（`public-text-policy.mjs` cap/注记、**`public-text-policy.proof.mjs` CAP-SANCTION 注记**、root `package.json:8` lint 帽 5408→5410），与 §0.1 UC-010 锚**零交**。树届 `docs:check` 亲跑 **scanned 2460**（main 届 2459 + 本卷 1）≤ `MAX_FILES=2_461`（余 1）；EXEC `+1 proof = 2461` **恰等 cap（余 0）**。**lint 帽 `5408`→`5410`**（root `package.json:8`）。**三件漂移锚重算**：coverage matrix `6706ad56`→`1c35605f`、case matrix `5dc8d97c`→`51c91f06`、root `package.json` `748fc360`→`a0f7a998`（行锚 `:116/:176/:271/:313`、`:47-:50`、`:8/:221-222/:253-258` 逐字不变）；另 policy `MAX_FILES` 行 `:281`→`:282`（值 `2_461` 不变·blob `43f95af5`→`c633ef6c`）。
- **§0.0.3.1 r3 复审与裁决**：席1 **PASS** + 席2 **FAIL P1×3 + P2×11**（另席1 P2×8）→ 协调方裁决**按席2 处方全采纳**（合并去重 17 条落点见 §0.0.3.2）。口径：只改**夹具序/断言判定形/锚行/预算算式**，不改期望语义、不触产品码。
- **§0.0.3.2 修订清单索引（17 条·落点）**：
  ①[P1-1 夹具合同顺序] 重排为 **①清场 DELETE(12 key) → ②三表 upsert → ③`interview_event` 种入**，并写明「DELETE 必须先于 INSERT·三表 upsert 只保聚合行幂等」→ **§1 夹具合同**（原序「清场在种入后」按字面会删光种子致八臂全红）。
  ②[P1-2 断言预算矛盾] QD4/DX4 ⑨⑩ 去「可选」钉为强制（⑩ 是 ⑨ 非空转唯一正控）·预算 64 算式（6+9+7+10+6+9+7+10）与 §2-2 主门逐项对齐 → **QD4/DX4/§1 注册面/§2-2**。
  ③[P1-3 provenance] 增列 `apps/api/src/modules/interview/interview.controller.ts` + `interview.service.ts`（IV 线真实依赖·沿 `scripts/run-e2e-isolated.mjs:1945-1946` uc010 先例）→ **§1 注册面④/必读清单**。
  ④[P2 切帧判别力归属] ① 结构面降为**非承重可读性检查**（解析式已保证），承重面=残留等式；八臂帧集断言一律经 `assertFrameSet`，**孤儿 id 门**（buffer 内每个行首 `id:` 均被某帧消费）因是 buffer 级性质，落 `assertFrameSet②`（`assertFrame` 单帧视角不可见全 buffer）→ **§1 助手/QD1–DX4**。
  ⑤[P2 残留等式定态] 单次 `const snap=text()` 定格后全派生；严格等式仅对 `ended` 或**静默 ≥1 帧间隔**快照成立；abort 窗允许尾帧**严格前缀**（+孤儿 id 门）→ **§1 `assertFrameSet`**。
  ⑥[P2 剥离正则帧界] 加 `(?:^|\n\n)event: token_delta\ndata: .+\n\n` 循环至稳定 + 前提「`token_delta` 永不落 `interview_event`」（`apps/worker/src/token-stream.ts:11` 铁律③）→ **§1 `stripNoise`**。
  ⑦[P2 token 正控到达门] ⑩ 前加 `until(() => text().includes('event: token_delta'), 1500)`·token text 钉中性字面量 `'tok-neutral'`·「whenHealthy 超时→§8 环境分口硬停·⑩ 不得静默跳过」→ **QD4⑩/DX4⑩/§1 0214 自装**。
  ⑧[P2 DX payload 对码] `kind:'depth'`→`'completeness'`（`resume-diagnosis.ts:20` 合法枚举）+ `findings:[{id,text}]`→`[{text,refs}]`（`:27`/`contracts:212` `refs` 必填）·title 同步「完整性」→ **DX1/DX2/DX3**。
  ⑨[P2 TextDecoder stream] `new TextDecoder('utf-8')` + `decode(value,{stream:true})` + done 分支 `decode()` flush → **§1 hold 助手**。
  ⑩[P2 until 布尔纳入] 回执门布尔+到达时刻写入 §8 六读数收据③（择此保 64 行为断言面；亦允许 `A('回执门成立(QD3)', gate===true)` 计入预算）→ **§1 回执门/QD3/QD4/DX3/DX4/§8**。
  ⑪[P2 收尾等待门] QD1/DX1/QD3/DX3 统一补 `await until(() => r.ended, 3000)` 前置 → **QD1/DX1/QD3/DX3**。
  ⑫[P2 ended 实时读] 明写 `get ended(){return endedFlag}` 或 done 分支 `self.ended=true` → **§1 hold 助手**。
  ⑬[P2 退化 until 紧口] 活体臂择「`health().healthy===true` 硬前置」（不择 live-tail >2000ms）；退化/超时→§8 环境分口硬停，删「退化容差」放行段 → **QD3/DX3/QD4/DX4/§1 0214 自装**。
  ⑭[P2 cap 重算] `origin/main 99e4e3f38`→rebase **2460**/EXEC **2461 恰等余 0** + lint 帽 **5410** + 三件漂移锚重算注 → **§0.0.3.0/§0.1/§2-1/§2-3/§2-5**。
  ⑮[P2 r1 索引历史注] §0.0.1.2 首句加「本 r1 索引为历史记录·已被 §0.0.2.2 与 §1 取代」→ **§0.0.1.2**。
  ⑯[P3 批] 锚勘误 `sse-notify :212-217`→`:212-216`、`last-event-id :7-18`→`:8-18`、`sse-push-notify.proof :299-300`→`:296`、`apps/api/package.json :73-74`→`:74`；worktree **18 树→16 树**；§0.0.1.2 ⑬ 删「§8」落点（补真实 §1/§2/§3）；DELETE 12 key 加**硬编码观察注** → **§0.0.2.2③/§0.1/§0 0.0/§1 夹具合同**。
  ⑰ 本小节。

### 0.0.4 rev r4 回炉修订小节（2026-10-30 · docs-only · 恰 1 tracked 路径=本卷 · 本 commit 适用）

- **§0.0.4.0 基线/预算**：修订前本支 @ `bf21af456`（r0–r3 docs-only 链）·`origin/main` 仍 `99e4e3f38`（`git rev-parse origin/main` 亲点不变）·`docs:check` 亲跑 **scanned 2460** ≤ `MAX_FILES=2_461`（余 1；EXEC +1 proof=2461 恰等余 0）·lint 帽 `5410`·pins 十一值（§5 补 `r1Closed=false`）。
- **§0.0.4.1 r4 复审与裁决**：r4 双席 **FAIL 互盲同判 P0×1 同根**（stripNoise 前缀锚吃权威帧尾空行 → 残留等式必假红）；席1 **P1×1 + P2×3**、席2 **P1×3 + P2×12** → 协调方裁决**按两席处方合并全采纳**（去重后 **P0×1 + P1×3 + P2×15 = 19 条落点**）。口径：只改**剥离正则/容差判据/注入序/硬停形/读数面/锚行/预算护栏标注**，不改期望语义、不触产品码。
- **§0.0.4.2 修订清单索引（19 条·落点）**：
  ①[P0 stripNoise 去前缀] `s.replace(/event: token_delta\ndata: [^\n]*\n\n/g,'')` 单遍 global；删「循环至稳定/相邻帧漏后一帧」论证（实测循环无效）；禁 `(?:^|\n\n)` 前缀（吃前一权威帧尾空行）→ **§1 `stripNoise`**。
  ②[P1 abort 容差/孤儿门] `cut:'abort'` 孤儿门改「未消费行首 `id:` ≤1 且其后余量不含 `\n\n`（=恰一个在飞帧）」；删「abort 切尾」立论改「**并发在飞写切尾**」（快照在 abort 前）→ **§1 `assertFrameSet②③`**。
  ③[P1 token 注入序主线化] QD4/DX4 时序主线 `gate → 注 2 → until(2) → sleep≥300 → 按线注入 token（各带 streamKey）→ tokGate≤1500 → 补睡至 open≥3000ms → 单次 snap → abort`；⑨ 明写「三线各一次且必在 snap 前」→ **QD4/DX4**。
  ④[P1 §8 hardStop 非零退出] `hardStop(reason)=打印七读数+process.exit(2)`；删「或写成断言计入预算」二择 → **§8/§1 回执门/QD3/QD4/DX3/DX4**（§0.0.3.2⑩ 的二择为历史·已被本节取代）。
  ⑤[P2① assertFrameSet 吃定格串] `assertFrameSet(snap, exp, {cut})`；QD4/DX4 传臂内 `snapQz/snapDx/snapIv`；防二次读活 buffer → **§1/QD1–DX4**。
  ⑥[P2② 读数⑦] §8 增第 7 项 `tokenSubscriberCount()`（`tokenListenDegraded` private 无读口→旁证；不可判停手上报）+ 读数④补注入前静默实测/同刻共醒滞留 → **§8**。
  ⑦[P2③ pins] 补 `r1Closed=false` → 十一值 → **§5**。
  ⑧[P2④ 收据面] 仅 `.log`；禁 `.md`/`.json`（∈`TEXT_EXTENSIONS` 越 cap）；EXEC 前 `git status --short`（含 `--others`）零游离受管件 → **§1 注册面⑥/§2-3/§2-5**。
  ⑨[P2⑤ 夹具连接面] 清场/upsert/种入/回读全走 `h.pool`（`:29-30`）；幂等面=「重跑同一 `boot()` 世界」；夹具自检不计 64 → **§1 夹具合同**。
  ⑩[P2⑥ 预算软口径] 结构面/`pg_trigger`/无订阅零 token 三条标护栏（仍计 64·不剥离重述）→ **§1 断言预算/QD3/DX3**。
  ⑪[P2⑦ token 到达门] 改完整帧 `/event: token_delta\ndata: .+\n\n/` → **QD4⑩/DX4⑩**。
  ⑫[P2⑧ 结构面归属] `assertFrame①` 标非承重护栏；孤儿 id 门落 `assertFrameSet②` → **§1/QD1③/DX1③**。
  ⑬[P2⑨ 锚勘误] `run-e2e-isolated.mjs:1945-1946`、`until :187-194`、`releaseSlot :183-199`、`resume-diagnosis :27-28` → **§1/§0.1/DX1**。
  ⑭[P2⑩ 夹具序 boot()] `boot() → ①清场 → ②upsert → ③种入` → **§1 夹具合同**。
  ⑮[P2⑪ 静默量化] `Date.now()-r.lastAt() >= 250`（`CLOSED_SILENT_MS=250`）→ **§1 `assertFrameSet`**。
  ⑯[P2⑫ QD3/DX3 定点] 逐臂点名 `assertFrameSet(snap, exp, {cut:'closed'})`；`SILENT_MS=200` 钉死（臂内·末 chunk 落定）；QD2/DX2 r1/r2 abort 后 `sleep(60)` 再定格 → **QD2/DX2/QD3/DX3**。
  ⑰[P2⑬ 多线落定] QD4/DX4 abort 后显式轮询 `waitingCount()/tokenSubscriberCount()` 回落基线（或 `sleep(200)`+读数）；失败 `hardStop` → **QD4/DX4 第 9 步**。
  ⑱[P2⑭ 13 件归类] 补 `apps/web/package.json`（web lint 605→607）+ `public-text-policy.proof.mjs`（CAP-SANCTION 注记）→ **§0.0.3.0**。
  ⑲[P2⑮ parseFrames 差异] 本卷 `\n\n`/含尾空行 vs 三先例（`ids()`/`ids+kinds`/`\n$`）；token 计数优先沿 crossstream `^event: token_delta$` 行锚法 → **§1 buffer 切帧**。
- **§0.0.4.3 冲突裁决留痕**：⑮（`>=250`）与 ⑯（`SILENT_MS=200`）分属两判据——250 为 `CLOSED_SILENT_MS`（`assertFrameSet` closed 静默阈值），200 为 QD3/DX3 臂内 `SILENT_MS`（收尾末 chunk 落定等待）；**两常量异名异义、均钉死、互不覆盖**。⑬ 的 `resume-diagnosis :28` 与机制源并读为 `:27-28`（`:27` `DiagnosisFinding{text,refs}`、`:28` `DiagnosisSection.findings`），非改动源。**机制源零冲突**。
- **§0.0.4.4 修订面冻结（实测）**：本 rev commit `git diff --name-status` 实测 **1 tracked（本卷）**；零新增受管件；产品码/迁移/既有 proof/runner 源码零触；STOP 三处维持 `draft:awaiting_pre_exec_dual`。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算 · 8 hex · rev r3/r4 @`99e4e3f38`（r4 零代码面触·blob 不变））

| 文件 | blob | 关键行锚（亲读） |
|---|---|---|
| `apps/api/src/modules/quiz/quiz.controller.ts` | `9b78100d` | `:6` `import { pumpSseEvents }`；`:12` `@Controller('quiz')`；**`:53-71` `@Get(':id/events')` events**（`:56` `slotKey=\`sse:${req.principal}\``；`:57` `acquireSlot(slotKey,5)` 败→429 `too_many_streams` 非 SSE；`:59` `quizzes.events(...)`；`:60` null→404 `not_found_or_forbidden`；**`:61` 终态集合 `quiz_ready｜quiz_unavailable｜error`**；`:62-69` pump；**`:65` `streamKey:id`**；`:67` `fetchMore(lastSeq)` 重调 events；`:70` finally `releaseSlot`） |
| `apps/api/src/modules/diagnosis/diagnosis.controller.ts` | `f2d7ea90` | `:6` 同 import；`:12` `@Controller('diagnosis')`；**`:51-69` `@Get(':id/events')`**（`:54` 同槽键；`:55` cap 5→429；`:57` `diagnoses.events`；`:58` null→404；**`:59` 终态集合 `diagnosis_ready｜diagnosis_unavailable｜error`**；`:60-67` pump；`:63` `streamKey:id`；`:65` `fetchMore`；`:68` finally release） |
| `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae` | **`:257-279` 同形 events（五 case 先例宿主）**：`:261` 槽键；`:262` cap 5→429；`:264` initial；`:265` 404；**`:267` 终态集合 `report_ready｜report_unavailable｜assessment_unavailable｜interview_unavailable｜error`（五 kind·含 session_concluded 明确不在终态）**；`:268-277` pump；**`:271` `streamKey:id`**（rev r2 勘误：原 `:272`）；`:273` `fetchMore`；**`:275-276` `deltaSource` 仅 interview 接线 `subscribeToken(id)`**（quiz/diagnosis 零触=裁决⑤） |
| `apps/api/src/platform/sse-pump.ts` | `b93121dc` | `:5-9` 三控制器零复制粘贴单源声明；`:70-71` `HEALTHY_FALLBACK_MS=30_000` / `DEGRADED_POLL_MS=2_000`；`:83` `pumpSseEvents`；`:87` hijack；`:88` `writeHead(200,text/event-stream)`；**:130 权威帧 `id: ${seq}` + `event: ${kind}` + `data: JSON`**；`:135` 10min deadline；`:169` 先注册 waiter 再 catch-up（D5）；`:173-209` hold 循环（`:174-176` 健康 30s / 退化 2s；`:191` 每轮重注册；`:205` null 收尾；`:207-208` tail emit / `: ping`）；`:213` unregister；`:222` `raw.end()` 单点 |
| `apps/api/src/platform/sse-notify.service.ts` | `a20b0720` | `:28` `SSE_NOTIFY_CHANNEL='interview_event_ch'`；`:197-209` `waitFor(streamKey)` per-key waiter 集；**`:309-319` `onNotification` 载荷=裸 stream_key → `router.get(key)` 同流全醒（回调内零 SQL）**；`:418-431` 降级结构化日志；**:433-483 `establish`（`:444` LISTEN 通道；`:461-469` establish 期恰一次 `pg_trigger` 实证 `interview_event_sse_notify` 在场；缺→`trigger_missing`）**；`:489-492` 进程单例 |
| `apps/api/src/platform/rate-limit.service.ts` | `fce544ff` | `:158-181` `acquireSlot(key,max)`（网关原子占·无 DbService 缝走进程内 Map）；`:183-199` `releaseSlot(key)`（注释 :183 + 函数 :184-199）对称减——三控制器共用 `sse:${principal}` cap=5 语义（本刀不重测·引旁证） |
| `apps/api/src/platform/last-event-id.ts` | `40b12d01` | `:8-18` `parseLastEventId` fail-closed（正则拒 Infinity/小数/科学计数·非法→HTTP 400 `invalid_last_event_id`；rev r3 勘误：原 `:7-18` 含注释行，函数起于 `:8`） |
| `packages/db/migrations/0143_sse_push_notify.sql` | `4d4bf7c4` | `:4-6` 注释明示 **interview/quiz/diagnosis 共表共 channel，stream_key 即 SSE 流 id（案A 统一 channel·零实体分类）**；`:19-29` 逐行通知函数 + `:33-37` 逐行 AFTER INSERT 触发器（历史字节不改） |
| `packages/db/migrations/0214_interview_event_statement_notify.sql` | `d1f36f17` | **`:9-20` `sse_event_notify_after_insert()` 语句级 `pg_notify('interview_event_ch', stream_key)` FROM `SELECT DISTINCT stream_key FROM inserted`**；`:22-27` 同名触发器 `interview_event_sse_notify` 替换 0143 逐行形（健康检查按触发器名，两迁移同名声明） |
| `packages/db/migrations/0062_interview_privacy_event_stream_scope.sql` | `9e5dec05` | `:3-7` 注释明示 **interview_event 是 interview/quiz/diagnosis 三流共享运输**；`:11-51` `interview_event_stream_privacy_active(owner,stream)` 按聚合分流（先 interview 墓碑再 quiz 再 diagnosis）；`:59-62` `p_owner` 策略换为函数式 |
| `packages/db/sql/20_resume_quiz.sql` | `0ae44766` | `:6-18` `resume_quiz(id text PK, owner_user_id, status∈created/generating/ready/failed, questions, report, expires_at, version)`；`:42-53` owner RLS |
| `packages/db/sql/21_resume_diagnosis.sql` | `69f804d8` | `:7-18` `resume_diagnosis` 同形；`:42-53` owner RLS |
| `packages/db/src/interview/interview-event.ts` | `880a1dcb` | `:16-43` `appendEvent`（同 stream advisory 事务锁 + `MAX(seq)+1` 原子分配 + event_key 幂等） |
| `apps/api/src/modules/quiz/quiz.service.ts` | `98edbeb2` | **`:130-139` `events()`：先 `parseLastEventId` → `asPrincipal` 内 `SELECT 1 FROM resume_quiz WHERE id=$1`（0 行→null=404）→ `SELECT seq,kind,payload FROM interview_event WHERE stream_key=$1 AND seq>$2 ORDER BY seq`**（复用 interview_event·stream_key=quizId） |
| `apps/api/src/modules/diagnosis/diagnosis.service.ts` | `2c7c882e` | **`:103-112` `events()` 同形**（先验 `resume_diagnosis` owner，再读 interview_event·stream_key=diagnosisId） |
| `apps/worker/src/quiz-lifecycle.ts` | `c4d568da` | `:38` `appendEvent(...,'progress',{stage:'generating'})`；`:72` 逐题 `question_ready`；`:73` 终态 `quiz_ready{count,report}` |
| `apps/worker/src/diagnosis-lifecycle.ts` | `af715482` | `:43` `progress`；`:76` 逐维 `section_ready{kind,title,score,findings}`；`:77` `rewrite_ready{before,after,refs}`；`:78` 终态 `diagnosis_ready{overall,summary,sectionCount,rewriteCount}` |
| `apps/worker/src/quiz-consumer.ts` | `3858b52a` | `:68` 失败终态 `quiz_unavailable{reason}`；`:95` `worker_died` 臂 |
| `apps/worker/src/diagnosis-consumer.ts` | `e588d72d` | `:66` 失败终态 `diagnosis_unavailable{reason}`；`:93` `worker_died` 臂 |
| `apps/web/lib/stream/quiz-state.ts` | `1aa2af90` | `:10-30` `QuizEvent` 判别联合（`progress` / `question_ready{question,refs}` / `quiz_ready{count,report}` / `quiz_unavailable{reason}` / `error` + TOKSTREAM 三 kind） |
| `apps/web/lib/stream/diagnosis-state.ts` | `5ed244fe` | `:12-26` `DiagnosisEvent` 判别联合（`progress` / `section_ready` / `rewrite_ready` / `diagnosis_ready{overall,summary,sectionCount,rewriteCount}` / `diagnosis_unavailable` / `error`） |
| `apps/api/test/_neg-harness.ts` | `9768b323` | `:50-90` `boot()`（`AUTH_DEV_HEADER=1` · 删 `MODEL_API_KEY`/`MODEL_BASE_URL` · `createApp` · **全量 sql/01-22 + 23_api_gateway + 选迁移**（0037/0038/0039/0046/0178/0172/0173/0167/0168/0169）；零 0214/0062）；`:267-281` 种子（userA/userB + interview 族）；**`:72` 名单含 sql/20、21 但零 quiz/diagnosis 种子行 → 本 proof 自种**；**privacy stub 面 `:114-142`（`interview_privacy_active`/`_read` 双镜像=owner-check-only）+ `:214-225`（`assert_interview_privacy_active` fail-closed）**——本刀 IV 线读写只走 owner 匹配正臂，与 stub 行为一致（§4/P2⑪） |
| `ai-docs/delivery/execution-master-checklist.md` | `2884be76` | `:1660` STILL OPEN 行（原文见 §认领核对）；`:1659` Non-claims |
| `ai-docs/delivery/harness/uc-e2e-010-sse-resume.md` | `200477a7` | `:31-37` R1–R4 + R-mid + R-authz + G-GAP 表；`:74` CMD |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `1c35605f` | `:116` UC-010 四格；`:176` 证据行；`:271` P1-1；`:313` 证据表（rev r3 重 pin：blob 随 main UC-003/UC3M 注记步进，四锚行号逐字不变） |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `51c91f06` | §1.1 `:47-:50`（010 组四行：FAULT-01/NEG-01/ADV-01/ADV-02；rev r3 重 pin：blob 随 main UC-003 注记步进，行锚逐字不变） |
| `apps/api/test/uc-e2e-010-sse-resume.proof.ts` | `680fbd66` | `:185-227` R1–R4；`:232-272` R-mid live hold→LED；`:275-302` R-authz 404；`:305-316` G-GAP |
| `apps/api/test/uc-e2e-010-nhp-crossstream.proof.ts` | `0391ce5e` | `:141-300` B1–B4（同主体两 interview 流·0214 自装+6s 翻面先例） |
| `apps/api/test/sse-cross-replica.proof.ts` | `38f67e16` | `:527-536` 仅以 quiz 流作 XR-4 槽 hold/catch-up 载体（**非逐实体帧交付断言**） |
| `apps/api/test/sse-principal-slot.proof.ts` | `692c4d01` | `:141-185` quiz/diagnosis 路径仅作槽计数 5+1/429 载体 |
| `apps/api/test/uc-e2e-002-nhp-http-bound.proof.ts` | `440c71c6` | `:94-95` `QZ()/DG()` 路径常量（槽计数臂） |
| `apps/api/test/uc-e2e-016-nhp-neg.proof.ts` | `7f094eac` | `:366-372` N8 跨用户 quiz/diagnosis events → 404（拒绝面） |
| `apps/api/test/validate.ts` | `7494a56b` | `:849-861` quiz catch-up SQL 探针 + quiz/diagnosis 非法游标 400（仅 SQL 计数/游标面·零帧断言） |
| `e2e/full.e2e.ts` | `5aaa9097` | `:267-277` quiz/diagnosis 终态经 `pollTerminal` **GET 详情**（非 SSE events） |
| `scripts/run-e2e-isolated.mjs` | `dff85f04` | `:93` `isolatedReceiptSources`；`:2831-3011` 支持目标准入数组；`:3353` `isolatedCommand` 链；`:4308-4314` resource-caps；`:4338-4392` pre-migrate 名单 |
| root `package.json` | `a0f7a998` | `:8` `lint: eslint . --max-warnings 5410`（rev r3 重 pin：`5408`→`5410`）；`:221-222` crossstream 两行；`:253-258` `uc010:sse-resume` / `sse-push:notify` / `sse:xrep` 六行注册位（rev r3 重 pin：仅 `:8` lint 帽值变，三处注册行逐字不变） |
| `apps/api/package.json` | `388a95fa` | `:35` `prove:uc010-sse-resume`；`:74` crossstream 注册位（rev r3 勘误：原 `:73-74` 实为 `:74` 单行） |
| `scripts/ai-docs/public-text-policy.mjs` | `c633ef6c` | **`:282` `MAX_FILES = 2_461`**（rev r3 重 pin：main UC3M 并线后注记行 +1 → 原 `:281` 顺移 `:282`·值不变） |

### 0.2 产品面侦察（两流现形 · 逐处亲点 · 结论=两流均有真 HTTP 级 SSE 端点 → 停止条件「无端点红停」**未命中**）

**A · quiz 流端点（`quiz.controller.ts:53-71`）**：`GET /quiz/:id/events`（`@Controller('quiz')` `:12` + `@Get(':id/events')` `:53`）。领槽先于取数：`slotKey=\`sse:${req.principal}\`` `:56`、`acquireSlot(slotKey,5)` `:57` 败→429 `too_many_streams`（JSON 非 SSE envelope）；取数 `quizzes.events(principal,id,lastEventId)` `:59`，null→404 `not_found_or_forbidden` `:60`；终态集合 `quiz_ready｜quiz_unavailable｜error` `:61`（原值参数化零合并）；泵参 `streamKey:id` `:65`、`fetchMore:(lastSeq)=>quizzes.events(principal,id,String(lastSeq))` `:67`；`finally releaseSlot` `:70`。流内容=interview_event 行，`stream_key=quizId`（service `:131-139`）。

**B · diagnosis 流端点（`diagnosis.controller.ts:51-69`）**：`GET /diagnosis/:id/events`（`:12` + `:51`）。同槽键 `:54`、cap 5→429 `:55`、`diagnoses.events` `:57`、null→404 `:58`、终态集合 `diagnosis_ready｜diagnosis_unavailable｜error` `:59`、`streamKey:id` `:63`、`fetchMore` `:65`、`finally release` `:68`。流内容=interview_event 行，`stream_key=diagnosisId`（service `:104-112`）。

**C · interview 流先例（`interview.controller.ts:257-279`）**：同一 `events` 形态与同一 pump；差异仅三处——终态集合五 kind `:267`、`deltaSource` 仅 interview 接线 `:275-276`、privacy guard 在 service（quiz/diagnosis service 无 privacy 函数调用，只有聚合 owner 存在性检查）。uc010 五 case（R1 全量 catch-up / R2 断线窗续写后 LED 续传 / R3 中位游标 / R4 已追上空 catch-up+ping / R-mid live hold→live-tail→abort→LED）为逐臂形先例；本卷只把同形落到 quiz/diagnosis 两个**实体流**上（非重复 interview）。

**D · 共享 pump 单源（`sse-pump.ts:83-223`）**：三控制器同一 `pumpSseEvents`（`:5-9` 声明三控制器零复制粘贴）。泵内单点：hijack/writeHead `:87-88`、权威帧 `id: seq`+`event: kind`+`data: JSON` `:130`、10min deadline `:135`、**每轮先注册 waiter 再取数（D5）`:169`**、健康 30s 兜底/退化 2s 轮询 `:174-176`、每轮重注册 `:191`、`more===null` 正常收尾 `:205`、空 tail 心跳 `:208`、registry 注销 `:213`、`raw.end()` 单点 `:222`。终态集合由控制器注入（`:54-55`），三处不同零合并——本刀不改产品字节。

**E · 共享 notify 单源（`sse-notify.service.ts`）**：进程单例 `:489-492`；每进程恰一条专用 LISTEN（`max:1` 池）；`waitFor(streamKey)` per-key waiter `:197-209`；`onNotification` 收裸 stream_key 后 `router.get(key)` 同流全醒 `:309-319`；`establish` 于连接建立期恰一次 `pg_trigger` 实证 `interview_event_sse_notify` 在场 `:461-469`（缺→`trigger_missing` 降级 2s 轮询）。**迁移实况**：0143 逐行触发器（`:24-38`）已被 0214 语句级同名触发器替换（0214 `:22-27`；0143 字节不改·仅历史）；健康检查按触发器名，因此两版本同名声明；**0214 广播面覆盖全部 stream_key（interview/quiz/diagnosis 同表）**，quiz/diagnosis 流无需任何额外通道/分类。

**F · service 层共表（`quiz.service.ts:130-139` / `diagnosis.service.ts:103-112`）**：两 service 均「先 `parseLastEventId` fail-closed（`last-event-id.ts:8-18`）→ `asPrincipal` 内验聚合归属（0 行→null→404）→ 单一谓词 `stream_key=$1 AND seq>$2 ORDER BY seq` 读 `interview_event`」。**流隔离全托 `stream_key` 单谓词**（无第二判别面）；跨 owner 由聚合归属检查 + RLS 双落。

**G · 生产者（事件形权威源）**：quiz 成功链 `progress`(`quiz-lifecycle:38`) → `question_ready`×N(`:72`) → `quiz_ready`(`:73`)；失败链 `quiz_unavailable{reason}`(`quiz-consumer:68/:95`)。diagnosis 成功链 `progress`(`diagnosis-lifecycle:43`) → `section_ready`×N(`:76`) → `rewrite_ready`×N(`:77`) → `diagnosis_ready`(`:78`)；失败链 `diagnosis_unavailable`(`diagnosis-consumer:66/:93`)。前端判别联合 `quiz-state.ts:10-31` / `diagnosis-state.ts:12-27` 与之一一对应（SSE `event` 字段=kind、`id`=seq）。

**H · 逐实体/跨流判定面**：两流 `streamKey=路由 :id`（quizId / diagnosisId）；聚合 id 域互异（`qz*` / 诊断实体 id）；interview 流 id 亦互异。**跨流隔离的判别面=`stream_key` 单谓词 + notify per-key router + pump per-streamKey waiter/registry**——与 uc010 crossstream 的「同聚合双 interview 流」不同面（本刀是**跨聚合 key 域**）。

### 0.3 零重叠核（本刀只补 quiz/diagnosis 两流·逐条划界）

| 既有证据 | 已证面 | 本刀零重叠处理 |
|---|---|---|
| `pnpm sse:xrep:prove`（`GAP-SSEPUSH-CROSS-REPLICA` **CLOSED** · xrep §9-post） | 两 OS 进程跨副本槽/播·interview 流交付+quiz 流仅作 XR-4 槽 hold 载体（`sse-cross-replica.proof.ts:527-536`） | **零重复**：本刀单进程、不证跨副本、不证槽总数；quiz 流在本刀证的是**逐实体帧交付/续传/终态**（xrep 未断言） |
| `pnpm uc010:sse-resume:prove` | interview 流 R1–R4 + R-mid + R-authz（`uc-e2e-010-sse-resume.proof.ts:185-302`） | **零重复**：本刀仅 quiz/diagnosis 两实体流，不重跑 interview 五 case |
| `pnpm uc010:nhp-crossstream:prove` | 同主体两 **interview** 流（S1/S2）游标交换/双持注入/账本零写副作用 | **零重复**：本刀跨 **quiz↔diagnosis↔interview 三聚合 key 域**，且断言帧交付而非对抗游标交换；不冒充 crossstream |
| `pnpm uc002:nhp-http-bound:prove` / `pnpm sse-slot:prove` | `sse:${principal}` cap=5、第 6 条 429、释放可再占（quiz/diagnosis 路径仅作槽计数载体） | **零重复**：本刀不证槽（只沿用既有槽语义；429 面引旁证不重测） |
| `uc-e2e-016-nhp-neg.proof.ts:366-372` | 跨用户 quiz/diagnosis events → 404（拒绝面） | **零重复**：本刀 404 只作每流隔离臂的**副断言**（同主体跨流正臂之外的对照），不单列 404 臂 |
| `api:validate` SSE 子集（`validate.ts:849-861`） | quiz catch-up SQL 命中计数 + quiz/diagnosis 非法游标 400 | **零重复**：本刀不验游标解析（引 `last-event-id:unit:prove` 旁证）、不以 SQL 计数冒充帧交付 |
| `full.e2e.ts:267-277` | quiz/diagnosis 终态经 `pollTerminal` **GET 详情**轮询 | **零重复**：本刀走 SSE events 真 HTTP 流（非 GET 轮询）；Ban 互洗 |
| `sse-push:notify:prove` / `sse-delta-arm.proof.ts` | pump 单元面（fake raw/notify）·token delta 臂 | **零重复**：本刀真 Nest HTTP + 隔离 PG + 真控制器；不注入 fake sink |

### 0.4 认领登记处行登记（行号+行名+现值·亲读逐字）

| 行号 | 行名 | 现值（亲读） | 本刀补 |
|---|---|---|---|
| checklist `:1660` | `GAP-SSEPUSH-QUIZ-DX-HTTP` | STILL OPEN（quiz/diagnosis 共 pump 共表码面单源+类型检查 · HTTP 级逐实体流证明未单列） | 收据供评估·**行翻面权归协调方**（本卷 Ban 自翻） |
| coverage matrix `:116` | UC-E2E-010 四格 | `partial/partial/partial/blind(case-only)`（全 interview 流） | 收据 additive 注记候选·**格值一字不动** |
| case matrix §1.1（010 组 `:47-:50` 四行之后） | — | 无 quiz/diagnosis HTTP 逐实体流行 | **EXEC 拟新增 `NHP-010-FAULT-02`**（列=FAULT·面=api·旗=case-only·锚=`pnpm quizdx:sse-http:prove`；**非 QZDX 命名**·P2②）·插入权/落位以协调方并线席为准 |
| current-runtime-truth `:282/:283` | quiz:prove / diagnosis:prove | 仅「SSE 终态」层措辞 | 零触（不加注·不翻） |

---

## §1 修法（恰 1 具名 proof=`quizdx:sse-http` · QD1–QD4/DX1–DX4 八臂一 proof · 零产品码零迁移零 Key · prove-only）

**修法形状**：新 proof `apps/api/test/quizdx-sse-http.proof.ts`——`boot()` 起真 Nest 栈（隔离 PG + 真 HTTP + `AUTH_DEV_HEADER`），自种 quiz/diagnosis 聚合行与 `interview_event` 账本行（**不经 worker 零模型**），用真 `fetch` 打 `GET /quiz/:id/events` 与 `GET /diagnosis/:id/events`，按 SSE 帧逐条断言。**八臂**：quiz 四臂 QD1–QD4，diagnosis 四臂 DX1–DX4。**零 `apps/*/src` / `packages/*/src` / migrations diff 意向**；隔离真 PG·零 `MODEL_API_KEY`·零外呼·零 worker drain（job 滞队不跑）。**类型检查子句=引用面不新增证据**：`pnpm -C apps/api typecheck` 0 只证明三控制器共用 `pumpSseEvents` 的类型面成立（`sse-pump.ts:83` 单源声明 `:5-9`），**不构成逐实体流交付证据**。

**夹具合同（EXEC 落码顺序钉死：`boot()` → ① 清场 → ② 三表 upsert → ③ `interview_event` 种入——顺序即合同，禁调换）**：
- ⓪ **连接面（r4·`h.pool`）**：`boot()` 必须先于 ①（`apps/api/test/_neg-harness.ts:50`；表/函数/角色就位）；**清场/upsert/种入/回读一律走 `h.pool`**（`:29-30` `Harness.pool` = 隔离库属主连接），禁另开 `new Pool`/`app.get(DbService)` 连接或会话变量注入。**幂等面**：合同只承诺「重跑同一 `boot()` 世界」幂等（`boot()` 重建 schema，`interview_event` 由 ① 清场、聚合行由 ② upsert）；跨 boot 世界（换迁移集/换库）不承诺。
- ① **清场（P2⑫·必须先于任何 INSERT）**：`DELETE FROM interview_event WHERE stream_key IN ($1,…,$12)`——**12 枚全 key 显式枚举**：QZ_CATCH/QZ_LED/QZ_LIVE/QZ_ISO/QZ_ISO_DX/DX_CATCH/DX_LED/DX_LIVE/DX_ISO/DX_ISO_DX/IV_ISO/IV_ISO_DX；Ban 前缀/`LIKE` 模式。**DELETE 必须先于种入**（r2 原序「upsert→种入→清场」按字面执行会把刚种入的行整批删光 ⇒ 八臂 catch-up 全空、八臂全红）；**三表 upsert 只保聚合行幂等，不清 `interview_event`**。**硬编码观察注**：12 枚为显式硬编码枚举（可读/可审计优先于模式化）；新增或改名臂必须同步本表——漏更=清场漏 key → 残行使帧集多帧必红。
- ② **① 清场后**：`userA` 持 QZ/DX/IV 夹具、`userB` 零权限；**三表 upsert 直插**（P2⑫）：`INSERT INTO resume_quiz(id,owner_user_id,status) VALUES ($1,'userA','generating') ON CONFLICT (id) DO UPDATE SET owner_user_id=EXCLUDED.owner_user_id, status=EXCLUDED.status`、`resume_diagnosis` 同形；**`interview` 同形 upsert 覆盖 `IV_ISO` 与 `IV_ISO_DX` 两枚**（`INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active') ON CONFLICT (id) DO UPDATE SET owner_user_id=EXCLUDED.owner_user_id, status=EXCLUDED.status`；interview `events()` 先 `SELECT 1 FROM interview WHERE id=$1`，缺行=404 而非 200）。status 语义无关，只作归属存在行。聚合行枚举：`resume_quiz` = QZ_CATCH/QZ_LED/QZ_LIVE/QZ_ISO/**QZ_ISO_DX**；`resume_diagnosis` = DX_CATCH/DX_LED/DX_LIVE/DX_ISO/**DX_ISO_DX**；`interview` = IV_ISO/**IV_ISO_DX**。
- ③ `interview_event` 逐行 `(owner_user_id,stream_key,seq,kind,payload)` 种入（**必须在①清场之后**），**`owner_user_id` 逐列写死 `'userA'`**（禁依赖 DEFAULT/会话变量/隐式注入）；每臂独立 stream_key，臂间零共用。
- **夹具自检（r4·不计 64）**：③ 种入后逐 key 回读 `COUNT(*)`/`MAX(seq)` 与 12 枚 key 清单及各臂期望帧数比对；任一不符 → `hardStop('夹具自检')`。自检断言**不进**八臂 64 条预算（只作夹具前置门）。
- **QD4/DX4 键域互斥（P1-1）**：QD4 独占 `QZ_ISO`/`DX_ISO`/`IV_ISO`，DX4 独占 `QZ_ISO_DX`/`DX_ISO_DX`/`IV_ISO_DX`。**两臂禁共用任何 stream_key**——否则第二臂对同 key 二次注入 `seq=2` 撞 `uq_event_seq (stream_key,seq)`（`packages/db/sql/01_schema.sql:48`）必崩；若改以 `LED=max-1` 避撞，则 catch-up 退化为 `[2]`，使「帧集恰 `[1,2]`」必红。两臂各自仍三线并发（**臂内**三线同 seq 不同 key，合法）。
- **0214 自装**：`readFileSync` 真迁移字节执行（沿 crossstream B3 先例·`uc-e2e-010-nhp-crossstream.proof.ts` 同形）；`pg_trigger` 实证 `interview_event_sse_notify` 在场；随后 **`await Promise.race([getSseNotify().whenHealthy(), sleep(8000)])`（P2⑤·替代固定 `sleep(6000)`）**——健康翻面即进；**超时（race 非 whenHealthy 胜出）→ 打印 `health()` 原值后走 §8 `hardStop('env分口(notify-warmup)')`**（活体臂硬前置 `health().healthy===true`，P2 退化紧口择「健康硬前置」；禁把退化 2s 兜底当容差放行、禁把超时改判红、禁静默跳过 ⑩）。仅 QD3/DX3 活体臂与 QD4/DX4 跨流臂需要；QD1/QD2/DX1/DX2 不依赖 notify（catch-up/LED 全走 `seq>lastSeq` 取数）。
- **0214-only 世界授权面收据注（P2⑦）**：本世界仅装 0214，**0143 的 ACL 行未重放**（`0143_sse_push_notify.sql:31` `REVOKE ALL ON FUNCTION sse_event_notify_after_insert() FROM PUBLIC, app_role`）；`CREATE OR REPLACE` 不改 ACL ⇒ 0214-only 世界函数 ACL=默认 PUBLIC EXECUTE，与「0143→0214」生产链不同。本 proof 只证触发器行为面，**不证授权面**；读数原值入收据（Ban 借本收据宣 ACL/迁移链 posture covered）。
- **跨臂纪律（P2⑨）**：每臂 hold **显式 `await`**（禁悬空 promise）；跨臂 `sleep(50-100)` 待 abort 断连的 `releaseSlot`/waiter 注销落定（防臂间 429/串帧）。**多线臂（QD4/DX4）另按臂内第 9 步显式轮询 `waitingCount()`/`tokenSubscriberCount()` 回落基线**（或 `sleep(200)`+读数）；落定失败 → `hardStop('env分口(<臂>-settle)')`。活体臂另遵 §8 七读数分口。
- **hold 助手（P1-5·时间戳 reader·沿 `sse-push-notify.proof.ts:152-194` `openSse`/`until` 先例）**：本地实现 `openSse({path, led?, maxMs})` → `{ status, headers, chunks: Array<{t:number,text:string}>, text(), ids(), frames(), get ended(), lastAt(), abort() }`：
  - `fetch` + `AbortController`；`const dec = new TextDecoder('utf-8')`；后台 `reader.read()` 循环推 `{t:Date.now(), text}`——**流式解码（P2）**：`done===false` 时 `dec.decode(value, { stream: true })`（多字节字符跨 chunk 不截断）；`done===true` 分支 `dec.decode()` 无参 **flush 残余**。网络 chunk 只作到达时刻/`: ping` 旁证，**不作帧边界**；`status`/`content-type` 在响应头到达时取。
  - `text()` = chunks 拼接 buffer；`ids()` = buffer 上 `/^id: (\d+)$/gm`（行首锚定，与 `: ping`/`data:` 内数字无涉）；`frames()` = 下文 `parseFrames(buffer)`；`lastAt()` = 末 chunk 到达时刻（静默间隔判定用）。
  - `ended` **实时读**（P2）：返回对象显式 `get ended() { return endedFlag; }`，或 done 分支 `self.ended = true`——禁「闭包变量置真但对象上不可读」；`abort()` = `clearTimeout` + `ac.abort()` + **`await sleep(60)`**（等断连传播与 `releaseSlot`/waiter 注销落定）。
  - `until(pred, ms, step=25)` 轮询助手（同先例 `sse-push-notify.proof.ts:187-194`）。**回执门**：任何「先注入」的臂必须先 `await until(() => ids().length >= 1, 1500)`（或 `ids().includes(期望 catch-up id)`）——`LED=max` 的空 catch-up 不冲刷响应头、`fetch` 不 resolve，窗口中途无法注入（P1-5）。**回执门布尔处置（r4 钉死·撤二择）**：gate 布尔原值 + 到达时刻写入 §8 读数③；**false 一律 `hardStop('env分口(<臂>)')`**（§8：打印七读数 + `process.exit(2)`）；**禁**把 gate 写成断言计入 64 预算作为替代路径（原「二择一」撤销），禁静默跳过后续臂。
- **buffer 切帧（P1-2·帧边界=协议边界，非网络 chunk 边界）**：`parseFrames(buf)` = `[...buf.matchAll(/^id: (\d+)\nevent: ([^\n]+)\ndata: (.+)\n\n/gm)].map(m => ({ id:+m[1], kind:m[2], data:m[3], raw:m[0] }))`（`raw`=**含尾部空行的整帧字节**）。`sse-pump.ts:130` 每帧恰一次 `raw.write`，Node/undici 可把多帧合并进一个 chunk、也可把一帧切进多个 chunk ⇒ **network chunk 与帧无一一对应**；**删** r2 前 `rawChunk === \`id: …\`` 三处形断言（包络/逐帧/正文），必假红且退化为无判别力的解析保真核。
- **`parseFrames` 与三先例语义差异（r4）**：本卷以 `\n\n` 收尾且 `raw` **保留尾空行**（残留等式/孤儿门需要整帧字节）；三先例不同——`sse-push-notify.proof.ts:182` 仅 `ids()`（`^id: (\d+)$`）、`uc-e2e-010-sse-resume.proof.ts:116-117` 仅 `ids()/kinds()` 分正则、`uc-e2e-010-nhp-crossstream.proof.ts:94-95` 的 `parseFrames` 以 `\n$` 收尾（**不消费**尾空行）。**token 帧（无 id）不入本卷 `parseFrames`**；其计数**优先沿 crossstream 行锚计法** `(buf.match(/^event: token_delta$/gm) ?? []).length`（`uc-e2e-010-nhp-crossstream.proof.ts:229`），到达门另用完整帧正则（QD4/DX4 ⑩）。
- **逐帧断言 `assertFrame(f, exp)`**：①**结构/可读性面（非承重·护栏·P2/⑧）**：`f.raw.split('\n')` 恰 `['id: N','event: K','data: D','','']`（单 `\n` 分隔、恰一尾空行、零 `\r`、零多余行——对**实际字节**断言，非重建等值）。切帧已由 `parseFrames` 正则本身保证（解析式先验），故此面只作**可读性/回归护栏，不承担判别力**；**判别力归 `assertFrameSet` 的残留等式**；**buffer 级「孤儿 id」门见 `assertFrameSet②`**（单帧视角不可见全 buffer）。②`f.id===exp.id && f.kind===exp.kind`；③`isDeepStrictEqual(JSON.parse(f.data), exp.payload)`（`node:util` 内建·**键序无关**；PG16 `payload` 列 `jsonb` 键序经存取必规范化 ⇒ 禁 `f.data===JSON.stringify(seed)` 字节等值，沿 crossstream `:164-169` parsed-field 先例）。
- **帧集断言 `assertFrameSet(snap, exp[], { cut })`（八臂唯一入口·r4 改吃已定格字符串）**：**调用方先单次定格** `const snap = r.text()`，此后 `frames()`/`ids()`/残留等式**全部由 `snap` 派生**；**断言器只吃 `snap` 与 `exp`，内部零读活 buffer、零读 reader**（防两条断言之间 buffer 继续增长致等式漂移；QD4/DX4 传臂内 `snap`）。`cut` 由调用方定：`r.ended===true || Date.now()-r.lastAt() >= CLOSED_SILENT_MS` → `'closed'`，否则 `'abort'`（`CLOSED_SILENT_MS = 250`·≥1 帧最小间隔量化）；**QD4/DX4 显式传 `'abort'`**（连仍开、快照先于 abort；即使静默已足也保留在飞写前缀容差），**QD2/DX2 r1/r2 显式传 `'closed'`**（abort 前已 700ms 静默）。①`parseFrames(snap)` 的 id/kind 序恰 `exp` 且条数相等；②**孤儿 id 门**：`snap` 内每个行首 `^id: \d+$` 必须被某帧 `raw` 消费——`cut==='closed'` 时未消费数必须 `===0`；`cut==='abort'` 时**未消费行首 `id:` ≤1 且其后余量不含 `\n\n`（=恰一个在飞帧）**（防「解析漏抓整帧」被前缀容差掩盖）；③**帧间零残留（承重面）**：`const residual = frames.map(f=>f.raw).join('')`，`const stripped = stripNoise(snap)`：
  - `stripNoise(s)` **帧界剥离（r4 去前缀锚·单遍）**：`s.replace(/event: token_delta\ndata: [^\n]*\n\n/g, '')` **单遍 global 替换**（**禁** `(?:^|\n\n)` 前缀——该前缀会吃掉前一权威帧的尾空行 `\n\n`，使残留等式必假红；**禁**「循环至稳定」——实测循环无效：无前缀锚的单遍 global 已覆盖相邻 token 帧）+ 删全部 `: ping\n\n`。**前提**：`token_delta` 永不落 `interview_event`（`apps/worker/src/token-stream.ts:11` 铁律③「仅传输态·Ban 落 interview_event」）⇒ token 帧只能是无 id 旁路帧，剥它不改权威帧集。
  - **成立条件**：`cut==='closed'`（`r.ended===true` 自然收尾，或快照处于**静默 ≥1 帧间隔**——`Date.now()-r.lastAt() >= CLOSED_SILENT_MS`（250），无半帧在飞）→ 严格等式 `residual === stripped`；`cut==='abort'`（QD4/DX4 截止快照）→ 允许 `stripped.startsWith(residual)`（**并发在飞写切尾**：快照取在 `abort()` 之前，abort 不可能切到快照；唯一截断源=快照瞬间仍有一次权威帧写未完整到达客户端），**且孤儿 id 门仍强制**——完整帧一条都不许丢，只允许末帧是**严格前缀**。
- **八臂帧集断言一律经 `assertFrameSet(snap, exp, {cut})`**（QD1/QD2/QD3/QD4/DX1/DX2/DX3/DX4），禁在臂内另写临时解析或逐帧拼串比对；**传参一律臂内已定格 `snap`**（禁把活 reader 传入致二次读 buffer）。
- **删恒真紧凑性断言（P2①）**：`f.data === JSON.stringify(JSON.parse(f.data))` 在线上恒真（`sse-pump.ts:130` 的 `data` 即 `JSON.stringify` 产物），零判别力 ⇒ **删除**。如需 payload 字节面旁证，改 DB `SELECT seq,kind,payload::text … ORDER BY seq` 回读作语义对照——**注 `jsonb::text` 含空格（`{"a": 1}`），不可与线上 compact 文本等值**，只可 `JSON.parse` 后 deep-equal。
- **帧契约常量**（与产品同形·零新契约）：`id: <seq>\nevent: <kind>\ndata: <compact JSON>\n\n`（`sse-pump.ts:130`）；无 `id` 帧不存在于本刀两流（`token_delta` 仅 interview delta 臂·`sse-pump.ts:159-166` 无 id 形）。

### QD1 · quiz 全量 catch-up 逐实体帧（R1 同形）
种 `QZ_CATCH`：`1 progress{stage:'generating'}` → `2 question_ready{question:'Q1',refs:['r1']}` → `3 question_ready{question:'Q2',refs:['r2']}` → `4 quiz_ready{count:2,report:{score:80,grounded:2,summary:'s'}}`。`GET /quiz/QZ_CATCH/events` 无 LED；`r=openSse(...)` 后**统一收尾等待门 `await until(() => r.ended, 3000)`（P2）**再定格 `const snap=r.text()`（**单次定格·此后全部从 `snap` 派生**）。断言（计 6 条）：①**200 + text/event-stream**；②`assertFrameSet(snap, exp, {cut:'closed'})` 帧集 id/kind 序恰 `[1,2,3,4]`（承重）；③逐帧结构面（`id/event/data` 三段 + 恰一尾空行；**非承重·护栏**）；④逐帧 `isDeepStrictEqual` 种子 payload（承重）；⑤帧集残留等式/孤儿 id 门（同一 `snap`·`assertFrameSet②③` 兑现）；⑥**终态后流自然收尾（`ended===true`·非 abort）且零 `token_delta`**（`(snap.match(/^event: token_delta$/gm) ?? []).length === 0`）。**失败终态 `quiz_unavailable` 不在本臂在证**（§3 non-claim；生产者 `quiz-consumer.ts:68/:95`）。

### QD2 · quiz 断线窗续写 + Last-Event-ID 续传 + 终态收口（R2/R3 同形）
种 `QZ_LED`：`1 progress{stage:'generating'}` `2 question_ready{question:'Q1',refs:['r1']}` `3 question_ready{question:'Q2',refs:['r2']}`。**连接 abort/await 序写死（P2⑩·r4 补定格点）**：①`r1=openSse(LED=1)` → `await until(() => r1.ids().join(',')==='2,3', 1500)`（回执门）→ `await sleep(700)` → `await r1.abort()`（**abort/await 落定后才进下一步**；`abort()` 内含 `sleep(60)`；**abort 后定格 `const snap1=r1.text()`**）；②断线窗 INSERT `4 question_ready{question:'Q3',refs:['r3']}` `5 question_ready{question:'Q4',refs:['r4']}`；③`r2=openSse(LED=3)` → `until(ids==='4,5', 1500)` → `sleep(700)` → `abort()`（**该连接落定后**才允许下一步·防 `6` 被第二连接吃掉/游标错位；**abort 后定格 `const snap2=r2.text()`**）；④INSERT `6 quiz_ready{count:4,report:{score:90,grounded:4,summary:'s2'}}`；⑤`r3=openSse(LED=5)` → `await until(() => r3.ended, 3000)` → `const snap3=r3.text()`。断言（计 9 条）：①首连 200 + `text/event-stream`；②首连帧集恰 `[2,3]`（无 1）；③首连逐帧 deep-equal 种子；④二连帧集恰 `[4,5]`（无 ≤3 重放）；⑤二连逐帧 deep-equal；⑥三连帧集恰 `[6]`；⑦三连**自然收尾**（`ended`）；⑧副断言 `userB GET /quiz/QZ_LED/events → 404`；⑨全程零 `token_delta` + 三窗逐臂 `assertFrameSet(snap1/snap2/snap3, exp, {cut:'closed'})`（单次定格残留等式+孤儿 id 门；r1/r2 在 abort 后定格，700ms 静默 > `CLOSED_SILENT_MS=250` ⇒ closed 成立）。

### QD3 · quiz live hold → live-tail → 终态（R-mid 同形）
种 `QZ_LIVE`：`1 progress{stage:'generating'}` `2 question_ready{question:'Q1',refs:['r1']}`（非终态）。**活体臂健康硬前置（P2 退化紧口：择「`health().healthy` 硬前置」，不择「live-tail 等待 >2000ms」）**：`const h=getSseNotify().health(); if (!h.healthy) → hardStop('env分口(QD3-health)')`（§8 打印七读数+`process.exit(2)`；禁把退化 2s 兜底当容差放行）。`r=openSse(LED=1)` → **回执门** `const gate = await until(() => r.ids().join(',')==='2', 1500)`（catch-up 非空恰 `[2]`=响应头已冲刷 + `waitFor` 先注册后重放的物证·防 REG-WINDOW 假红·P2⑧/P1-5；**gate 布尔+到达时刻写 §8 读数③，false → `hardStop('env分口(QD3-gate)')`、禁静默跳过**）；**时点以 hold 起点为基准**：`+700ms` 单语句 INSERT `3 question_ready{question:'Q2',refs:['r2']}`（0214 语句级触发器恰一 notify(QZ_LIVE)）、`+1400ms` INSERT `4 quiz_ready{count:2,report:{score:88,grounded:2,summary:'s'}}`；回执若已晚于某时点则**立即注入**（不等待观察，P2⑪）；`holdMs≥3000`（P2④）。**收尾等待门（P2）`await until(() => r.ended, 3000)` → `await sleep(SILENT_MS=200)`（臂内钉死·末 chunk 落定）→ `const snap=r.text()`**，随后**逐臂点名 `assertFrameSet(snap, exp, {cut:'closed'})`**。断言（计 7 条）：①200 + `text/event-stream`；②catch-up 恰 `[2]`；③live 恰 `[3,4]`；④全序 `[2,3,4]` 无重放/无重复（`assertFrameSet` 承重）；⑤逐帧 deep-equal（承重）+ 结构面（非承重·护栏）；⑥`pg_trigger` 物证（护栏·安装面旁证）；⑦终态后自然收尾（`ended`）且零 `token_delta`。**退化口径（r3 收紧）**：健康未翻面 → §8 环境分口 `hardStop`；不再设「退化容差」放行路径，也不把超时改断言。

### QD4 · quiz 跨流 key 域隔离 + 跨 owner 拒绝（key 域正臂）
三线并发（**QD4 独占键 `QZ_ISO`/`DX_ISO`/`IV_ISO`·与 DX4 键域零共用**·P1-1）：各线 LED 缺省（=0）⇒ catch-up 恰 `[1]` 非空正控：
- `QZ_ISO`（`resume_quiz` upsert）：种 `1 progress{stream:'QZ_ISO',marker:'q-iso-1'}`
- `DX_ISO`（`resume_diagnosis` upsert）：种 `1 progress{stream:'DX_ISO',marker:'d-iso-1'}`
- `IV_ISO`（`interview` upsert·见夹具合同）：种 `1 progress{stream:'IV_ISO',marker:'i-iso-1'}`

三线并发 `openSse`（`qz`/`dx`/`iv`）后按**主线时序**推进（严格顺序·禁跳步）：**gate → 注 2 → until(2) → sleep≥300（TCP settle）→ 按线注入 token（载荷带各自 streamKey）→ await tokGate≤1500 → 补睡至 open 起算 ≥3000ms → 单次 snap 定格 → abort**。
1. **gate**：`const [gq,gd,gi] = await Promise.all([until(() => qz.ids().length >= 1, 1500), until(() => dx.ids().length >= 1, 1500), until(() => iv.ids().length >= 1, 1500)])`——**gate 三元布尔+到达时刻写 §8 读数③**；任一 false → `hardStop('env分口(QD4-gate)')`，禁静默跳过；健康硬前置 `getSseNotify().health().healthy===true`（false → `hardStop('env分口(QD4-health)')`·P2 退化紧口）+ 活性旁证 `waitingCount() >= 3`（**总数口径、不证 per-key 归属**`sse-notify.service.ts:212-216`·P1-3）。
2. **注 2**：**分语句**注入各线本流新行（三线**故意同 kind**，判别面只能是 payload marker/流标签；各单语句单 key，语句级触发器每 key 恰一 notify）：`2 question_ready{stream:'QZ_ISO',marker:'q-iso-2'}` / `{stream:'DX_ISO',marker:'d-iso-2'}` / `{stream:'IV_ISO',marker:'i-iso-2'}`。
3. **until(2)**：各线 `await until(() => ids().includes(2), 1500)`（三线均须 true；false → `hardStop('env分口(QD4-live)')`）。
4. **sleep≥300（TCP settle）**：`await sleep(300)`，让各线权威帧 2 完整落地、TCP 写/读边界稳定（仍在 `holdMs≥3000` 窗内）。
5. **按线注入 token（载荷带各自 streamKey）**：QZ/DX/IV **三线各恰一次** `SELECT pg_notify('interview_token_ch', $1)`，载荷分别为 `{v:1,streamKey:'QZ_ISO',attemptKey:'att-q',seq:2,text:'tok-neutral'}` / `{v:1,streamKey:'DX_ISO',attemptKey:'att-d',seq:2,text:'tok-neutral'}` / `{v:1,streamKey:'IV_ISO',attemptKey:'att-i',seq:2,text:'tok-neutral'}`（**三线各一次且必在 snap 前**——防「未注入恒绿空转」；QZ/DX 线无 `deltaSource` 接线 ⇒ 零帧；IV 线 `subscribeToken` 接线 ⇒ 恰一帧）。
6. **await tokGate≤1500**：`const tokGate = await until(() => /event: token_delta\ndata: .+\n\n/.test(iv.text()), 1500)`（**完整帧到达门**·⑦；false → `hardStop('env分口(QD4-token)')`，⑩ 不得静默跳过）；gate 布尔+到达时刻入 §8 读数③。
7. **补睡至 open 起算 ≥3000ms**：`const remain = 3000 - (Date.now() - openedAt); if (remain > 0) await sleep(remain)`（`openedAt`=三线 `openSse` 起算点）。
8. **单次 snap 定格**：`const snapQz=qz.text(), snapDx=dx.text(), snapIv=iv.text()`（三条各自**单次定格**；`frames()`/域针/残留等式全部从 `snap*` 派生；**快照在 abort 前，abort 不可能切到快照**；尾帧前缀容差只针对快照瞬间的**并发在飞写切尾**）。
9. **abort + 落定**：`await Promise.all([qz.abort(), dx.abort(), iv.abort()])`（各自内含 `clearTimeout`+`ac.abort()`+`sleep(60)`）；随后**显式轮询槽释放落定** `await until(() => getSseNotify().waitingCount() === w0 && getSseNotify().tokenSubscriberCount() === 0, 2000)`（`w0`=臂前 `openSse` 前基线）；未落定 → `await sleep(200)` 并记录 `{waitingCount, tokenSubscriberCount}` 读数，仍超基线 → `hardStop('env分口(QD4-settle)')`（防下一臂 429/串帧）。
10. **QD4 全部帧集断言经 `assertFrameSet(snap, exp, {cut:'abort'})`**（尾帧严格前缀容差+孤儿 id 门）。

断言（QD4 计 10 条）：
① QZ 线 200 + `text/event-stream`；
② QZ 线帧集 `assertFrameSet(snapQz, expQz, {cut:'abort'})` 恰 `[1,2]` 且逐帧 `payload.stream==='QZ_ISO'` + 本流 marker（`q-iso-1`/`q-iso-2`）；
③ QZ 线零 DX/IV 域针——**JSON 形态**：`"marker":"d-iso-`、`"marker":"i-iso-`、`"stream":"DX_ISO"`、`"stream":"IV_ISO"` 全族零出现（P1-4·禁单引号 `marker:'…'` 形）；
④ DX 线 200 + `assertFrameSet(snapDx, expDx, {cut:'abort'})` 帧集恰 `[1,2]` + 本流 marker；
⑤ DX 线零 QZ/IV 域针：`"marker":"q-iso-`、`"marker":"i-iso-`、`"stream":"QZ_ISO"`、`"stream":"IV_ISO"`；
⑥ IV 线 200 + `assertFrameSet(snapIv, expIv, {cut:'abort'})` 自身帧集恰 `[1,2]`（catch-up 正控 `1` + 本流注入 `2`）——**不得只写「零他域」而无自身帧断言**；
⑦ IV 线零 QZ/DX 域针（**不写零 `: ping`**——P1-3：ping 是健康/退化节奏面，退化 2s 必 ping ⇒ 必假红；判别面只留帧集+域针）；
⑧ `userB` 对 `QZ_ISO`/`DX_ISO` 各 → 404；
⑨ **token 无订阅强制副断言（P2：撤销原「可选」——⑩ 是 ⑨ 非空转的唯一正控，两条同为强制并计入 10 条预算）**：**第 5 步已对 QZ/DX/IV 三线各恰一次注入**（载荷带各自 streamKey、注入必在 `snap` 前）；QZ/DX 线 `token_delta` **零出现**——计数沿 crossstream 行锚法 `(snap.match(/^event: token_delta$/gm) ?? []).length === 0`（两控制器零 `deltaSource` 接线·`sse-pump.ts:62-67`/`interview.controller.ts:275-276`）；
⑩ **IV 线同一注入出恰一帧 `event: token_delta` 正控**：**完整帧到达门（⑦）**`const tokGate = await until(() => /event: token_delta\ndata: .+\n\n/.test(iv.text()), 1500)`——false（含 `whenHealthy` 超时后注入静默）→ `hardStop('env分口(QD4-token)')`，⑩ 不得静默跳过；gate 布尔+到达时刻入 §8 读数③。断言恰一帧（`(snapIv.match(/^event: token_delta$/gm) ?? []).length === 1`）且 `data` 解析 `{attemptKey, seq, text==='tok-neutral'}`（wire 形=`{"attemptKey","seq","text"}`·`v/streamKey` 由 pump 剥·`sse-pump.ts:159-166`；delta-only 唤醒免 fetchMore=`sse-pump.ts:192`）——证注入有效、QZ/DX 零出现非注入失效。**与 crossstream B3（interview 双流互偷）正交**，只证「无订阅」不冒充其面。

### DX1 · diagnosis 全量 catch-up 逐实体帧（R1 同形）
种 `DX_CATCH`：`1 progress{stage:'generating'}` → `2 section_ready{kind:'structure',title:'结构',score:70,findings:[{text:'t1',refs:['r1']}]}` → `3 section_ready{kind:'completeness',title:'完整性',score:68,findings:[{text:'t2',refs:['r2']}]}` → `4 rewrite_ready{before:'b',after:'a',refs:['r']}` → `5 diagnosis_ready{overall:78,summary:'s',sectionCount:2,rewriteCount:1}`。**载荷对码（P2）**：`kind` 合法枚举=`['structure','completeness','highlight','risk','match']`（`packages/ai-graphs/src/resume-diagnosis.ts:20`）；finding 形 `{text, refs}` 且 **`refs` 必填**（`:27-28`：`:27` `DiagnosisFinding{text,refs}` + `:28` `DiagnosisSection.findings` · `packages/contracts/src/index.ts:212` `refs: z.array(z.string())`）——r2 的 `kind:'depth'` 与 `{id,text}` 均为**非法载荷**（宿主不会产出，属夹具自造非法形，须改）。`GET /diagnosis/DX_CATCH/events`；`r=openSse(...)` 后**统一收尾等待门 `await until(() => r.ended, 3000)`（P2）**再定格 `const snap=r.text()`。断言（计 6 条）：①**200 + text/event-stream**；②`assertFrameSet(snap, exp, {cut:'closed'})` 帧集 id/kind 序恰 `[1..5]`（承重）；③逐帧结构面（**非承重·护栏**）；④逐帧 `isDeepStrictEqual` 种子 payload（承重）；⑤帧集残留等式/孤儿 id 门（同一 `snap`·`assertFrameSet②③` 兑现）；⑥终态后自然收尾（`ended`）且零 `token_delta`（crossstream 行锚计数）。**失败终态 `diagnosis_unavailable` 不在本臂在证**（§3 non-claim；生产者 `diagnosis-consumer.ts:66/:93`）。

### DX2 · diagnosis 断线窗续写 + LED 续传 + 终态收口
种 `DX_LED`：`1 progress{stage:'generating'}` `2 section_ready{kind:'structure',title:'结构',score:70,findings:[{text:'t1',refs:['r1']}]}`；**序同 QD2 写死（P2⑩·700ms 修订值·r4 补定格点）**：①`r1=openSse(LED=1)` → `until(ids==='2',1500)` → `sleep(700)` → `abort()`（内含 `sleep(60)`；**abort 后定格 `const snap1=r1.text()`**）；②INSERT `3 section_ready{kind:'completeness',title:'完整性',score:68,findings:[{text:'t2',refs:['r2']}]}` `4 rewrite_ready{before:'b',after:'a',refs:['r']}`；③`r2=openSse(LED=2)` → `until(ids==='3,4',1500)` → `sleep(700)` → `abort()`（**abort 后定格 `const snap2=r2.text()`**）；④INSERT `5 diagnosis_ready{overall:80,summary:'s2',sectionCount:2,rewriteCount:1}`；⑤`r3=openSse(LED=4)` → `await until(() => r3.ended, 3000)`（收尾等待门）→ `const snap3=r3.text()`。断言（计 9 条）：①首连 200 + `text/event-stream`；②首连帧集恰 `[2]`；③首连逐帧 deep-equal；④二连帧集恰 `[3,4]`（无 ≤2 重放）；⑤二连逐帧 deep-equal；⑥三连帧集恰 `[5]`；⑦三连自然收尾（`ended`）；⑧副断言 `userB → 404`；⑨全程零 `token_delta` + 三窗逐臂 `assertFrameSet(snap1/snap2/snap3, exp, {cut:'closed'})`（残留等式+孤儿 id 门；r1/r2 在 abort 后定格、700ms 静默 > `CLOSED_SILENT_MS=250` ⇒ closed 成立）。

### DX3 · diagnosis live hold → live-tail → 终态
种 `DX_LIVE`：`1 progress{stage:'generating'}` `2 section_ready{kind:'structure',title:'结构',score:70,findings:[{text:'t1',refs:['r1']}]}`（非终态）。**活体臂健康硬前置（P2 退化紧口·同 QD3）**：`health().healthy===true`，false → `hardStop('env分口(DX3-health)')`（§8 打印七读数+`process.exit(2)`）。`r=openSse(LED=1)` → **回执门** `const gate = await until(() => r.ids().join(',')==='2', 1500)`（响应头冲刷+注册物证·P2⑧/P1-5；gate 布尔+到达时刻入 §8 读数③，false → `hardStop('env分口(DX3-gate)')`）；**时点固定不依赖观察（P2⑪）**：hold 起算 `+700ms` INSERT `3 section_ready{kind:'completeness',title:'完整性',score:68,findings:[{text:'t2',refs:['r2']}]}`、`+1400ms` INSERT `4 diagnosis_ready{overall:80,summary:'s',sectionCount:2,rewriteCount:1}`；`holdMs≥3000`（P2④）。**收尾等待门 `await until(() => r.ended, 3000)`（P2）→ `await sleep(SILENT_MS=200)`（臂内钉死·末 chunk 落定）→ `const snap=r.text()`**，随后**逐臂点名 `assertFrameSet(snap, exp, {cut:'closed'})`**。断言（计 7 条）：①200 + `text/event-stream`；②catch-up 恰 `[2]`；③live 恰 `[3,4]`；④全序 `[2,3,4]` 无重复（`assertFrameSet` 承重）；⑤逐帧 deep-equal（承重）+ 结构面（非承重·护栏）；⑥`pg_trigger` 物证（护栏·安装面旁证）；⑦自然收尾（`ended`）且零 `token_delta`（crossstream 行锚计数）。

### DX4 · diagnosis 跨流 key 域隔离 + 跨 owner 拒绝（对称正臂）
镜像 QD4（DX 线为主体；**独占键 `QZ_ISO_DX`/`DX_ISO_DX`/`IV_ISO_DX`·与 QD4 键域零共用**·P1-1）：三线各 LED 缺省非空 catch-up 正控（种子：`1 progress{stream:'QZ_ISO_DX',marker:'q-iso-1'}` / `{stream:'DX_ISO_DX',marker:'d-iso-1'}` / `{stream:'IV_ISO_DX',marker:'i-iso-1'}`）。**主线时序同 QD4（严格顺序·禁跳步）**：**gate → 注 2 → until(2) → sleep≥300（TCP settle）→ 按线注入 token（载荷带各自 streamKey）→ await tokGate≤1500 → 补睡至 open 起算 ≥3000ms → 单次 snap 定格 → abort**：
1. **gate**：三线 `Promise.all` 回执门（`ids().length>=1`）+ 健康硬前置 `health().healthy===true`（false → `hardStop('env分口(DX4-health)')`）+ `waitingCount()>=3` 旁证（总数口径）；gate 布尔/到达时刻入 §8 读数③，任一 false → `hardStop('env分口(DX4-gate)')`。
2. **注 2**：分语句注入 `2 question_ready{stream:'QZ_ISO_DX',marker:'q-iso-2'}` / `{stream:'DX_ISO_DX',marker:'d-iso-2'}` / `{stream:'IV_ISO_DX',marker:'i-iso-2'}`（三线同 kind）。
3. **until(2)**：三线均 `ids().includes(2)`；false → `hardStop('env分口(DX4-live)')`。
4. **sleep(300)**（TCP settle；仍在 `holdMs≥3000` 窗内）。
5. **按线注入 token**：三线各恰一次，载荷 `{v:1,streamKey:'QZ_ISO_DX',attemptKey:'att-q',seq:2,text:'tok-neutral'}` / `{v:1,streamKey:'DX_ISO_DX',attemptKey:'att-d',seq:2,text:'tok-neutral'}` / `{v:1,streamKey:'IV_ISO_DX',attemptKey:'att-i',seq:2,text:'tok-neutral'}`（**三线各一次且必在 snap 前**——防未注入恒绿空转）。
6. **await tokGate≤1500**：`/event: token_delta\ndata: .+\n\n/.test(iv.text())`；false → `hardStop('env分口(DX4-token)')`。
7. **补睡至 open 起算 ≥3000ms**：`remain = 3000 - (Date.now()-openedAt); if (remain>0) await sleep(remain)`。
8. **单次定格** `snapQz/snapDx/snapIv`（abort 前；abort 不可能切到快照）。
9. **abort + 落定**：`Promise.all([qz.abort(),dx.abort(),iv.abort()])` → `until(waitingCount()===w0 && tokenSubscriberCount()===0, 2000)`；未落定 → `sleep(200)`+读数，仍超基线 → `hardStop('env分口(DX4-settle)')`。
10. **全部帧集断言 `assertFrameSet(snap*, exp*, {cut:'abort'})`**。

断言（计 10 条）：①DX 线 200；②`assertFrameSet(snapDx, expDx, {cut:'abort'})` 帧集恰 `[1,2]`+本流 marker/流标签在证；③零 QZ/IV 域针（`"marker":"q-iso-`、`"marker":"i-iso-`、`"stream":"QZ_ISO_DX"`、`"stream":"IV_ISO_DX"`）；④QZ 线 200；⑤`assertFrameSet(snapQz, expQz, {cut:'abort'})` 帧集恰 `[1,2]`·零 DX/IV 域针（`"marker":"d-iso-`、`"marker":"i-iso-`、`"stream":"DX_ISO_DX"`、`"stream":"IV_ISO_DX"`）；⑥IV 线 200；⑦`assertFrameSet(snapIv, expIv, {cut:'abort'})` 帧集恰 `[1,2]`·零 QZ/DX 域针（`"marker":"q-iso-`、`"marker":"d-iso-`、`"stream":"QZ_ISO_DX"`、`"stream":"DX_ISO_DX"`；**不写零 ping**）；⑧`userB` 对 `DX_ISO_DX`/`QZ_ISO_DX` → 404；⑨QZ/DX 线 token 无订阅零 `token_delta`（**强制·同 QD4⑨**；第 5 步三线各一次注入、必在 `snap` 前；载荷 `text:'tok-neutral'`；计数沿 crossstream 行锚法 `(snap.match(/^event: token_delta$/gm) ?? []).length === 0`）；⑩IV_ISO_DX 线 `token_delta` 正控恰一帧（**完整帧到达门** `/event: token_delta\ndata: .+\n\n/`；false → `hardStop('env分口(DX4-token)')`，不得静默跳过；载荷/静默/hold/`text==='tok-neutral'` 同 QD4⑨⑩；计数 `(snapIv.match(/^event: token_delta$/gm) ?? []).length === 1`）。

**注册面（EXEC 期·五处 + 两 N/A 承登·「新目标登记」additive）**：①新 proof 文件；②root `package.json` 两行（`quizdx:sse-http:prove` → `node scripts/run-e2e-isolated.mjs quizdx:sse-http:prove:raw`；`:raw` → `pnpm -C apps/api prove:quizdx-sse-http`）；③`apps/api/package.json` 一行（`prove:quizdx-sse-http`）；④runner `isolatedReceiptSources`（`:93` 区）新增一 entry——**provenance 前置 `scripts/run-e2e-isolated.mjs` + `scripts/bounded-command.mjs`**（P2⑥），补 `apps/api/src/main.ts` / `apps/api/src/platform/principal.guard.ts` / `apps/api/src/platform/sse-registry.ts`，再列 proof + `_neg-harness.ts` + `apps/api/src/modules/quiz/quiz.controller.ts` + `quiz.service.ts` + `diagnosis.controller.ts` + `diagnosis.service.ts` + **`apps/api/src/modules/interview/interview.controller.ts` + `apps/api/src/modules/interview/interview.service.ts`**（**P1/P2 补两件**：IV 线真实依赖——`events()` 链与 `subscribeToken` 在 `interview.service.ts`，`deltaSource` 接线在 `interview.controller.ts:275-276`；沿 `scripts/run-e2e-isolated.mjs:1945-1946` uc010 provenance 先例）+ `sse-pump.ts` + `sse-notify.service.ts` + `rate-limit.service.ts` + `last-event-id.ts` + `packages/db/src/interview/interview-event.ts` + `packages/db/sql/01_schema.sql`/`20_resume_quiz.sql`/`21_resume_diagnosis.sql` + `packages/db/migrations/0214_interview_event_statement_notify.sql`；⑤runner 支持目标准入数组（`:2831-3011` 区）与 `isolatedCommand` 链（`:3353` 区）；⑥tracked 收据 `ai-docs/delivery/receipts/quizdx-sse-http/`（**仅 `.log`**·`∉TEXT_EXTENSIONS`；**禁 `.md`/`.json`**——二者 ∈ `TEXT_EXTENSIONS`（`scripts/ai-docs/public-text-policy.mjs:39`），落盘即计受管件使 EXEC 2461 越 cap）；**EXEC 落收据前亲跑 `git status --short`**（默认含 `--others` untracked 口径）**零游离受管件**——除本刀预期新 proof/收据 `.log` 外零 untracked；任何游离 `.md`/`.json` 先清场再落收据。**「新目标登记」界（P1-3）**：上述 runner/两 `package.json` 改动**仅限本目标 additive 行**——新增 entry/分支/注册行，**零改既有目标语义、断言、源清单、准入判据**；此面不落入 §5 Ban 的「改既有 proof/仪器」定义（§5 carve-out）。**N/A 承登**：pre-migrate 名单（`:4338-4392`）**不入**——boot() virgin 世界（uc010 家族 / xrep 先例同形：pre-migrate 先行装迁移链会撞 0058 definer 面；本 proof 零 0058 依赖，但世界选择沿 uc010 家族）；resource-caps（`:4308-4314`）**不适用**（非 PERF/LOAD）。**断言预算**：八臂 **≥64 条（QD1 6 / QD2 9 / QD3 7 / QD4 10 / DX1 6 / DX2 9 / DX3 7 / DX4 10·r4 口径）**——**QD4/DX4 的 ⑨⑩ 均为强制断言（撤销 r2「可选」措辞；⑩ 是 ⑨ 非空转的唯一正控）**，64 = 6+9+7+10+6+9+7+10 **逐项等于 §2-2 主门算式**；**回执门/token 到达门布尔不入断言条**：原值+到达时刻入 §8 七读数收据③，false 一律 `hardStop`（§8：打印七读数 + `process.exit(2)`；禁静默跳过）；EXEC 实跑原值入收据，未跑即未跑如实登记。**预算软口径三条（r4·标护栏）**：①逐帧结构面（`assertFrame①`）——解析式已先验，仅可读性/回归护栏；②`pg_trigger` 物证——安装面旁证，不证交付；③无订阅线零 `token_delta`——负控副断言（判别力由第 5 步三线各一次注入 + IV 正控 ⑩ 支撑）。**主承重=帧集 id/kind 序 + payload deep-equal + 残留等式/孤儿门**；三护栏项仍计入 64 条（标护栏·不剥离重述）。

### §1.3 否决表（落选项诚实留痕）

- **否决①：复用 uc010 proof 参数化到 quiz/diagnosis**——终态集合不同（三 kind vs 五 kind）、interview service 有 privacy guard 而 quiz/diagnosis 无、delta 臂仅 interview；参数化会把「逐实体」揉成「一个泛化流」，违反 `GAP-SSEPUSH-QUIZ-DX-HTTP` 的「单列」要求。
- **否决②：直驱 `pumpSseEvents` 单元面**——`sse-push-notify.proof.ts`/`sse-delta-arm.proof.ts` 已证 pump 单元面；缺口是 **HTTP 级**（真控制器+真槽+真路由+真 SSE 头），单元面不能冒充。
- **否决③：把 quiz/diagnosis 并入 crossstream proof**——crossstream 是「同主体两 interview 流对抗游标交换」，格旗/case 行/世界均为独立；并入会破坏一 case 一收据并模糊交叉面，且触发其既有断言面改动（Ban）。

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门本 commit 适用 + EXEC 预基面届时重 pin）

1. **起草/修订门（本 commit 已亲跑·EXIT 原值见 §9 收据表）**：`node scripts/ai-docs/check-docs.mjs` → **0**（scanned **2460** · cap `2_461` 余 1）；`pnpm public-text-policy:prove` → **0**（12/12）；markers 五类标记词 + 行首冲突标记改动集 grep → **0 命中**（词面运行时组装·不改写卷内防自指）。
2. **EXEC 主门**：`pnpm quizdx:sse-http:prove` **EXIT=0**（八臂 **≥64 断言（6+9+7+10+6+9+7+10）·QD4/DX4 ⑨⑩ 强制**；隔离 PG 真 HTTP；attempts 台账如实·零 retry-to-green）。**EXIT0 = case 证据 ≠ covered ≠ 翻行**。
3. **EXEC 静态门**：`pnpm -C apps/api typecheck` 0（**引用面**：三控制器共用 pump 类型成立·不新增逐实体流证据）；新 proof eslint 0 warning（lint 帽 `--max-warnings 5410` 零新增·root `package.json:8` r3 重 pin）；`pnpm quizdx:sse-http:prove:raw` 经 runner 三层壳（isolated → raw → package）EXIT=0；**EXEC 落收据前 `git status --short`（含 `--others` untracked 口径）零游离受管件**（除预期新 proof/`.log` 收据）。
4. **邻面不回退（引旁证·不重测槽/游标）**：`pnpm uc010:sse-resume:prove`、`pnpm sse-push:notify:prove`、`pnpm sse:xrep:prove`、`pnpm sse-slot:prove` 各 EXIT=0（若 EXEC 期环境允许；如实登记未跑即未跑）。
5. **cap 预算核（r3/r4 后改算）**：`origin/main` @`99e4e3f38` 届树 + 本卷 **= 2460**（`docs:check` 亲跑）；rev r3/r4 同卷再改（`git diff --name-status` 实测 **1 tracked**·零新增受管件）→ 仍 **2460**；EXEC **+1 proof = 2461 = `MAX_FILES=2_461` 恰等（余 0）**；收据**仅 `.log`** 非受管扩展名不计（`.md`/`.json` ∈ `TEXT_EXTENSIONS` ⇒ 计受管件、必越 cap·Ban）；**零 cap 步进、零 policy 面触、零四联动点改**（P2③）。若 EXEC 期实测越限 → 停止条件「验收红不可修」停手上报（Ban 就地改 cap）。
6. **门面纪律**：`docs:check` > cap、PTP 红、markers 命中、lint 超帽、邻套件新红且根因不在本刀 → 停（§8）。

---

## §3 范围外（越界即 FAIL）

- 不跑/不声称 `full.e2e`、`e2e:isolated` 三流终态段（`GAP-SSEPUSH-FULL-E2E` 保持 OPEN）。
- 不证 `GAP-SSEPUSH-REG-WINDOW`（initial 取数→waiter 注册 ~ms 窗·兜底收 ≤30s 非丢失）。
- 不证跨副本（xrep 已 CLOSED·本刀单进程）。
- 不证槽容量/释放（`sse-slot:prove`/uc002 既有面）。
- 不证 30s 生产兜底原值（`GAP-SSEPUSH-PROD-30S` 保持 OPEN）；活体臂只证 hold 窗内交付，不把读数冒充 30s 生产证据。
- 不证 privacy fence 0062 真迁移面（harness 未载 0062·本刀走 boot 世界，跨 owner 404 只由聚合归属 + harness owner RLS 承担；Ban 借本收据宣 0062/隐私围栏 covered）。
- 不证 0143/0214 授权面（ACL）：0214-only 世界 0143 `REVOKE` 未重放，本刀只证触发器行为面（§1 收据注·Ban 借本收据宣 ACL/迁移链 posture covered）。
- 不改产品码/迁移/共享 SSOT/coveredCount；不翻 checklist `:1660` 行、不翻 coverage matrix 格、不翻 case 行旗（EXEC 只加 additive case 行候选，落位/翻面权归协调方）。
- **不证失败终态**（`quiz_unavailable`/`diagnosis_unavailable`）：QD1/DX1 只走成功终态链；失败终态的事件形引生产者源（`quiz-consumer.ts:68/:95`、`diagnosis-consumer.ts:66/:93`）**未落断言**——Ban 借本收据宣失败终态交付 covered。
- **不证 `: ping`/心跳面**：r2 已删 IV 线「零 ping」断言（ping 随健康/退化节奏变化：退化 2s 必 ping、健康 30s 兜底，`sse-pump.ts:208`）；本刀不证心跳 cadence，也不把「窗内未见 ping」当交付证据。
- 不证模型输出质量/worker 编排（本刀零 worker 零模型）。

---

## §4 依赖

- 隔离 PG：`scripts/run-e2e-isolated.mjs`（Docker disposable PG）+ `_neg-harness.ts` boot 世界（**sql/01-22 + 23_api_gateway + 选迁移**（0037/0038/0039/0046/0178/0172/0173/0167/0168/0169）；**零 0214/0062 装载** → proof 自装 0214；0143 ACL 未重放收据注见 §1/§3·P2④/P2⑦）。
- **privacy stub 面（P2⑥）**：harness `:114-142` 装 `interview_privacy_active` / `interview_privacy_active_read` 双镜像（SECURITY DEFINER·只做 owner 匹配，真相=0058/0076 迁移链）、`:214-225` 装 `assert_interview_privacy_active`（fail-closed 同码）。本刀 IV 线只走 `userA` owner 匹配正臂，与 stub 行为一致；**跨 owner 404 由聚合归属检查 + harness owner RLS 承担**，不冒充 0062 隐私围栏（§3 同界）。
- 真 HTTP：`createApp()`（`apps/api/src/main.ts`）+ `AUTH_DEV_HEADER=1`（harness `:51-57`）+ `principal.guard.ts`（principal 注入）+ `sse-registry.ts`（HA-2 注册/注销同点）。
- 零外部依赖、零新 npm 包、零 Key、零 secret。

---

## §5 Ban 列表 + pins

- **Ban**：碰 `apps/*/src`/`packages/*/src`/migrations（产品字节）；改既有 proof/仪器；改 `sse-pump.ts`/`sse-notify.service.ts`/控制器；新增迁移/通道/表；翻 covered/格值/行旗；自翻 `GAP-SSEPUSH-QUIZ-DX-HTTP`；把 EXIT0 写 covered/full e2e/HA/容量/SLO；retry-to-green；断言迁就；自审 self-approve；push/force-push/动主仓；live 模型；secrets/.env；借本收据与 xrep/crossstream/uc010/uc002 互洗。
- **Ban carve-out（P1-3·「新目标登记」）**：§1 注册面中的 runner/两 `package.json` 改动**仅限本目标 additive 行**——`isolatedReceiptSources` 新增 `quizdx:sse-http:prove` 一 entry、支持目标准入数组加一行、`isolatedCommand` 链加一分支、root/`apps/api` 各加注册行；**零改既有目标语义/断言/源清单/准入判据**。此面称「**新目标登记**」，**不落入本节 Ban 的「改既有 proof/仪器」定义**；除此之外 runner 任何字节改动仍 Ban。
- **Pins（十一值照抄·零翻转）**：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained` · 公开 `DELETE=503` · `g7SuiteGreen=false` · **`r1Closed=false`** · `actualSpendCny=null`. Do not write covered.

---

## §6 est live=0（起草 turn · EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗。EXEC 期：隔离 PG + 同机真 HTTP + boot() 删 `MODEL_API_KEY`/`MODEL_BASE_URL`（`_neg-harness.ts:61-62`）+ 零 worker/drain + 零外呼 → est live=**0**。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md · 起草/rev r1–r4 turn）**五类标记词 + 行首冲突标记 grep 零命中**（起草席亲跑·词面按 `scripts/i6-239-gates.proof.mjs:154-163` 运行时组装口径·不复抄卷内防自匹配·回执随 EXEC 收据留痕）。EXEC 期改动集=proof+双 package.json+runner（可执行面）·同口径复跑。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual`**（三处钉=文首 Status/本节/卷尾同值）· alone≠dual · Dual PASS ≠ 开工（PASS 只过审；开工须协调方明示授权）。**开工三条款**：①pre-exec 双审两外席 BOTH PASS 落卷；②协调方明示 EXEC 授权；③EXEC 立项未改 §1 修法面/§5 Ban/pins/§1.3 否决 · 立项时照 §0 协议对届时 tip 全量重 pin。

**`hardStop(reason)` 统一形（r4 钉死·撤二择）**：`console.error('HARDSTOP ' + reason)` → 打印 §8 全量读数（七项）→ `process.exit(2)`（**非零**；环境/仪器分口 EXIT2 与产品真红 EXIT1 分口）。健康/回执门/token 到达门/夹具自检/settle 分口一律走此单点；**禁**把分口改写成 `A()` 断言计入 64 预算（原「或写成断言」二择撤销），禁静默跳过/继续后续臂。

- **现场漂移**：届时 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（两控制器 events 形态变 · pump 帧形/终态注入变 · notify 通道或 0214 触发器更名 · 两 service events 谓词变 · runner 注册区被在飞刀改写）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期新臂收据与 §0.2/§1 期望不符（如 quiz 流出现 diagnosis 域帧=真泄漏 · 终态后流不自然收尾 · LED 重放 ≤N · 跨 owner 200）→ 根因诊断被证伪 → **产品真红** → 停·EXIT1 诚实保留 + backlog 登记如实升级协调方（Ban 就地改诊断/凑绿）。
- **越界需要**：修法诉求超出 §1 恰 1 proof 八臂面（需触产品码/迁移/0062 世界/既有 proof 家族/covered 翻面/共享 SSOT/cap 步进）→ 停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check>2_461 / PTP 红 / markers 命中 / 邻套件新红 / typecheck / lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。
- **REG-WINDOW/仪器误红 bisect（P2⑭·活体臂强制分口）**：活体臂红（live 帧未在 `holdMs` 窗内到达 / `status===0` / `fetch` 未 resolve）**先分口再判红**，七读数原值入收据：①`getSseNotify().health()`（healthy/通道）；②`pg_trigger` 物证（`interview_event_sse_notify` 在场）；③**正控 catch-up 帧到达时刻 + 回执门/token 到达门布尔原值**（gq/gd/gi/gate/tokGate；证明 `waitFor` 已注册·`sse-pump.ts:169-170`；布尔 false=分口依据非断言红）；④注入时刻 + 注入前后 `MAX(seq)` 账本读数（行是否真落）+ **注入前静默实测** `Date.now()-r.lastAt()`（应 ≥ `CLOSED_SILENT_MS`）+ **同刻共醒滞留**（多线背靠背注入时各线首帧 `lastAt` 与注入时刻差、线间到达时刻差 ms）；⑤hold 读数（`holdMs`/abort 时刻/帧到达时刻）；⑥**`waitingCount()`（总数口径；健康态前置）**；⑦**`tokenSubscriberCount()`**（IV 线在持 ≥1、QZ/DX 0、注销后 0；`tokenListenDegraded` 为 private `sse-notify.service.ts:153` **无公开读口·不可直读**——以本项旁证；若仍不可判（token 通道降级 vs 订阅缺失不可分）→ **停手上报**，禁猜）。判据：③缺失或晚于注入 → **REG-WINDOW/仪器误红**（非产品红）；①/② 不健康 → 环境/退化分口（`hardStop`·不判产品红）；④行在账而⑤窗外仍无帧 → **机制红**（走「机制不满足」·EXIT1 诚实保留）。**独立分口（r2 新增）**：**意外多帧**（帧数>期望/重复 seq）→ 先分清「跨流泄漏（机制红）」vs「同帧重复（泵/夹具）」；**意外 `: ping`** → 归健康/退化节奏分口（**非产品红**，不据此判隔离失败）。**单次修复重跑**：仅允许一次修复（夹具/时序，**不改断言谓词**）后重跑；**红值留账**（七读数原值入收据/attempts），Ban retry-to-green、Ban 删红账。
- **红停特条（派单前置）**：若两流中任一**无 HTTP 级 SSE 端点** → 如实红停上报，**不得**降级为单元面/GET 轮询冒充。**本起草 turn 已亲点：两流均有真端点（§0.2-A/B）→ 特条未命中。**

## §9 状态

**`draft:awaiting_pre_exec_dual`** · 2026-10-30 起草落卷（rev r4 基线 `origin/main` @`99e4e3f38` · 分支 `line/quizdx-draft` · worktree `meetwise-quizdx` · 本支 docs-only 提交 r0/r1/r2/r3/r4 五件）· 本卷 1 个 .md · **rev r1/r2/r3/r4 同卷修订（零新增受管件）** · 零产品码零迁移零依赖 · 零 push 零主仓。

**起草/修订门亲跑收据（EXIT 原值 · 本 turn）**：

| 门 | 命令 | EXIT | 读数 |
|---|---|---|---|
| docs:check | `node scripts/ai-docs/check-docs.mjs` | **0** | `80 required files verified; public text policy scanned 2460 managed worktree files`（rev r3/r4 基线 `99e4e3f38`：main 届树 2459 + 本卷 1；cap 2_461 余 1 · EXEC +1 proof=2461 恰等余 0） |
| PTP | `pnpm public-text-policy:prove` | **0** | `static_preflight_valid: selected=12/12; releaseEvidence=false` |
| markers | 五类标记词+行首冲突标记改动集 grep（词面运行时组装） | **0** | changeSet=本卷 1 件 · 零命中 |

**rev r1 回炉（2026-10-30）**：`git diff --name-status` 实测 **1 tracked（本卷）非 3 tracked**（P2③）·docs-only·零 policy 步进·STOP 三处维持 `draft:awaiting_pre_exec_dual`；修订 18 条落点见 §0.0.1.2。

**rev r2 回炉（2026-10-30 · 历史·已被 r3 取代）**：双席 FAIL 互盲同判（席1 P1×2+P2×10 / 席2 P1×5+P2×5）→ 裁决按两席处方合并全采纳（去重 13 条·落点见 §0.0.2.2）。**核心五处**：①QD4/DX4 键域互斥（12 key 枚举·`uq_event_seq` 撞键消因）②`assertFrame` 改 buffer 切帧（删 `rawChunk===` 三处·网络 chunk 仅作旁证）③删 IV 线零 `: ping`（改帧集/域针+`waitingCount` 旁证）④判别针 JSON 化（`"marker":"d-iso-`/`"stream":"DX_ISO"` 形）⑤hold helper 改时间戳 reader（`chunks[{t,text}]`+`ids()`+`until()`+`abort()`+`sleep(60)`·回执门先于注入）。**基线（届值）**：fetch 亲点 `origin/main=53cc4a434` → rebase（r0/r1 内容零改写）·`docs:check` scanned 2459 ≤ 2_461（EXEC 2460 余 1）·断言预算 ≥64（6+9+7+10+6+9+7+10）。

**rev r3 回炉（2026-10-30 · 历史·已被 r4 取代）**：席1 **PASS** + 席2 **FAIL P1×3 + P2×11**（另席1 P2×8）→ 裁决按席2 处方全采纳（合并去重 17 条·落点见 §0.0.3.2）。**核心五处**：①夹具合同重排 **清场→三表 upsert→种入**（DELETE 先于 INSERT；upsert 只保聚合行幂等）；②QD4/DX4 ⑨⑩ 去「可选」钉强制（64 算式与主门对齐）；③provenance 补 `interview.controller.ts`+`interview.service.ts`；④`assertFrame`/`assertFrameSet` 判别力归属重写（结构面非承重·残留等式单次定格·abort 窗严格前缀·孤儿 id 门·token 帧界剥离循环）；⑤DX 载荷对码（`kind:'completeness'` + `findings:{text,refs}`）+ token 到达门/健康硬前置/收尾等待门/TextDecoder 流式解码。**基线**：fetch 亲点 `origin/main=99e4e3f38` → rebase（r0/r1/r2 内容零改写）·`docs:check` scanned **2460**（EXEC +1=2461 恰等 cap 余 0）·lint 帽 **5410**·断言预算 **64**（6+9+7+10+6+9+7+10）。`git diff --name-status` 实测 **1 tracked（本卷）**·STOP 三处维持 `draft:awaiting_pre_exec_dual`。

**rev r4 回炉（2026-10-30 · 本 commit）**：r4 双席 **FAIL 互盲同判 P0×1 同根**（stripNoise `(?:^|\n\n)` 前缀锚吃权威帧尾空行 → 残留等式必假红）+ 席1 P1×1/P2×3 + 席2 P1×3/P2×12 → 裁决按两席处方合并全采纳（去重 **P0×1 + P1×3 + P2×15 = 19 条**·落点见 §0.0.4.2）。**核心五处**：①stripNoise 去前缀锚改单遍 `event: token_delta\ndata: [^\n]*\n\n`（删循环论证）；②abort 孤儿门改「未消费 `id:` ≤1 且余量无 `\n\n`」+ 截断源改「并发在飞写切尾」（快照在 abort 前）；③QD4/DX4 token 注入序主线化（gate→注2→until2→sleep300→三线各一次注入→tokGate 完整帧→补睡≥3000→snap→abort）；④§8 `hardStop` 钉非零退出（打印七读数+`exit(2)`）+ 撤「或写成断言」二择；⑤`assertFrameSet(snap,…)` 吃定格串/读数⑦/`h.pool` 夹具面/`.log` 收据/十一 pins/锚勘误四处。**基线**：`origin/main=99e4e3f38` 不变·`docs:check` scanned **2460**（EXEC +1=2461 恰等 cap）·断言预算 **64**（6+9+7+10+6+9+7+10）·`git diff --name-status` 实测 **1 tracked（本卷）**·STOP 三处维持 `draft:awaiting_pre_exec_dual`。

**待办（EXEC 立项前）**：pre-exec 双审（两外席 BOTH PASS）→ 协调方 EXEC 授权 → 届时 tip 全量重 pin → 落 proof 八臂 + 五处注册 + 收据 → 主门 EXIT 原值入 §9-EXEC（占位：本节后续追加 · 本卷不改写）。
