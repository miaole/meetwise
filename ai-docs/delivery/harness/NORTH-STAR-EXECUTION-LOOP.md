# Meetwise 北星 · Harness 执行 Loop（总控 · 其他 AI 按本文执行）

> **给用户的一句话（复制即发）**  
> `严格按 /Users/miaole/Desktop/golucky/meetwise/ai-docs/delivery/harness/NORTH-STAR-EXECUTION-LOOP.md 执行 Meetwise 北星 loop：不到北星不停；一刀一双审；实现不自批；交 tip 给 meetwise 验收。`

**协调 / 验收 bot**：meetwise（只开 dual 闸、验收、授权 nail；不写产品代码除非用户改派）  
**实现默认**：mw-core · 仓库 `miaole/meetwise` · 分支 `feat/mysql-schema-skeleton`  
**本机源**：`/Users/miaole/Desktop/golucky/meetwise`  
**当前 tip（开刀前必 `git fetch` + ff）**：以 `origin/feat/mysql-schema-skeleton` 为准（本文起草时 = **`f3cf84c`**）  
**并发派工补充**：`ai-docs/delivery/PARALLEL-DISPATCH-2026-10-03.md`

---

## 0. 北星（未齐前禁止勾 true / 禁止叙事已达成）

| 北星 | 当前 | 成功标准 |
|------|------|----------|
| **全量 E2E 零遗漏** | 未齐 · 矩阵大量 gap/blind/partial | 矩阵无假绿；NEG+FAULT+BOUND+ADV+PERF+LOAD 有 CMD+EXIT；非仅快乐路径 |
| **生产 100% HA** | **NOT_HA** | 多实例云 + 故障注入 + `ha:probe` 级证据 + 独立审；本地 compose 绿 ≠ HA |
| **0 BUG** | 未证 | P0/假绿/conditional 清零 + 双域审；不得叙事 |
| **G7 验证关** | 门禁已生效 · **套件未绿** | 全本地环境 + 全 case/业务 case 跑通收据；`g7SuiteGreen=false` 直至收据齐 |

**成功唯一标准 = G7 验证关 + 北星证据齐。**  
刀绿 / dual PASS / prove EXIT=0 / 文档钉 **≠** 成功。  
`releaseEvidence` 保持 **false** 直至 G7 全量收据齐。

硬闸全文：`ai-docs/delivery/north-star-hard-gates.md`（G1–G7）  
HA 阶梯：`ai-docs/delivery/north-star-ha.md`  
切片流程：`ai-docs/delivery/impl-review-gate.md`

---

## 1. Pins（每刀文首抄 · 禁止改口除非独立 knife + 双审 + meetwise 授权）

```
haStatus=NOT_HA
releaseEvidence=false
claimProductionHA=false
gR45Closed=true
coveredCount=8
ms3EqualsR4Closed=false
PG-retained（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）
公开 DELETE /privacy/interview-data/:id = 503
```

另钉：`canHonestlyFlip=false`（UC-018）直至独立 covered-lift 刀；UC-018 / UC-052 行多为 **partial** ≠ covered。

---

## 2. 硬规则（违反 = 本刀作废）

1. **不到北星不停** — 禁止在 partial/docs/prove-green 停手宣称完成。
2. **一刀一 REQUEST** — 同线下一刀须等本刀 nail+commit+push。
3. **独立域双审** — 实现方 **禁止自审自批**；关键刀 ≥2 域（见下表）；审查末行严格 `Verdict: PASS` 或 `Verdict: FAIL`。
4. **G3 序** — 需求/矩阵行 → harness/eval → 预执行双审 → 才 coding/prove。
5. **禁假绿** — `partial` / `gap` / `blind` / `conn-only` / `honesty-pin` ≠ `covered`；连通绿 ≠ 业务绿。
6. **禁 secrets** — 不 commit `.env*` / Key / token。
7. **禁 Meridian** — 本仓库仅 Meetwise。
8. **共享 SSOT**（`e2e-requirement-coverage-matrix.md` / `gap-bug-backlog.md` / checklist）**只在 nail 时改**。
9. **作者标记**：`git -c user.name=<agent> -c user.email=<agent>@meetwise.local`。
10. **HA 买云** — **禁止购买**云资源，直到用户在 meetwise chat **明确点头**（D3 报价已钉 ≠ 授权买）。

11. **最佳实践对表强制** — 所有 coding 刀（REQUEST/EXEC）与 review 刀（预执行/post-prove 双审）必须对 `ai-docs/engineering/NEXT-NODE-BEST-PRACTICES.md`（§A/§B/§C）逐条核对；DB 面加对 postgres 规范（uuidv7 ID/索引/约束/触发器）——违反项要么当刀修掉、要么登记技术债台账，禁 silently 通过。协调方派单 prompt 须注入本条。

### 分域审查员

| 域 | Agent | 审什么 |
|----|-------|--------|
| e2e / HA | mw-e2e-ha | E2E、prove EXIT、HA 证据诚实、禁假绿 |
| privacy | mw-privacy-int | 删除/导出、INT、授权根、DELETE=503 |
| rag / route | mw-rag-route | RAG-FUNNEL、route、题库隔离、TECH_ROLE |
| model-op | mw-model-op | 派发预算、reconciler、Key/live 诚实 |

教育问答（不审不批）→ mw-edu。

---

## 3. 单刀 Loop（每刀必须走完；可多线并行）

```
① 选刀（§4 队列或矩阵下一 gap/blind）
② 开独立 worktree / ff 到 origin tip
③ 写 REQUEST + harness（含命令、期望 EXIT、pins、Ban 列表、NEG/FAULT…或显式 blind）
④ 预执行双审 BOTH Verdict: PASS
⑤ 等 meetwise 授权 coding / prove（standing authorize：预执行双审齐后可执行；仍禁止自 nail）
⑥ 实现（若本刀需要）+ 跑 prove **一次优先**；记录 CMD+EXIT+receipt
⑦ post-prove 双审 BOTH Verdict: PASS
⑧ meetwise 授权 nail → 改 SSOT（诚实）→ commit + push
⑨ 本机 pull --ff-only；回报 meetwise：REQUEST/prove/dual/nail SHA + 命令 + EXIT
⑩ 同线才允许开下一刀；独立域线可并行
```

**并行**：A/B/C 与独立域可同时开；**同线串行**；文件冲突见表。

### 文件冲突（禁同时改）

- B'' / 隐私主链 进行中 → 他线 **禁** 改 `apps/worker/src/checkpoint-principal.ts`
- G7 live / outbound 未关 → 他线 **禁** 抢改同一 outbound 主链
- 矩阵/backlog **仅 nail 改**

---

## 4. 当前队列（起草 @ `f3cf84c` · 已 FINAL 勿重开）

> **剩余北星队列 SSOT（companion）**: [`../REMAINING-NORTH-STAR-QUEUE.md`](../REMAINING-NORTH-STAR-QUEUE.md) — Phase 0–8 denser plan after AO-COND35 · Ban buy cloud · HOLD AN-CIMG-EA · coveredCount=8。 §4 历史「待执行」表仍有效；冲突时以本文件 + backlog/matrix 现态为准（**prefer Phase 0–8 over short Near/Mid/Far draft**）。

### 已 FINAL（不要重复开同刀）

| tip | 内容 |
|-----|------|
| A' `f3cf84c` | flake 诚实收口 · **仍 OPEN** |
| B' `76d2bc3` | UC025 门锁 · ≠接线 |
| C' `0652a08` | UC004 FAULT 仍 gap |
| D' `e0842d0` | flip 禁 · coveredCount=8 |
| D–J | waiting_user / UI / unsealed / HMAC / UC025 honesty / MODEL / HA报价 等已钉（见 PARALLEL-DISPATCH） |

### 待执行（优先 · 可并行）

| 线 | 题目 | 实现 | 双审 | 硬 Ban |
|----|------|------|------|--------|
| **A''** | teed `pnpm privacy-authorization:prove`；log 须含可引用 `PROCESS_EXIT=` | mw-core | privacy-int + e2e-ha | 禁改 attempt-1；禁 retry；绿≠关 flake；禁碰 principal |
| **B''** | UC-025 begin **真** quiz + stale reject | mw-core | rag-route + e2e-ha | 禁布尔洗绿；真接线前 NEG 仍可 EXIT1；Ban covered |
| **C''** | UC-004 FAULT 真证据 | mw-core | rag-route + e2e-ha | career-path EXIT0 ≠ 关 A3 |
| **K** | 下一 NHP（**非** 018/052/025/004） | mw-core | e2e-ha + rag（或 privacy） | 一刀一行 |
| **L** | G7 trio / Disclosure-1 / TECH_ROLE 诚实 | mw-core | model-op + e2e-ha | 默认禁 live；`g7SuiteGreen=false` |
| **M** | C-IMAGE-DIGEST / C-PERF-TEARDOWN CONDITION | mw-core | e2e-ha + rag | 禁 UC-018 covered flip |
| **N** | ISO banner ↔ PG-retained 对齐 | mw-core | e2e-ha + privacy | ≠ cutover |
| **J+** | HA 云买 | — | — | **冻结直到用户点头** |

详细 prompt：`PARALLEL-DISPATCH-2026-10-03.md`。

### 北星大背锅（队列之后仍要循环直到关）

1. 矩阵每一行 UC：gap/blind → 有 harness → 有 prove → dual → 诚实状态（covered 极严）
2. INT-TRANSCRIPT / 外部 sink / 公开 DELETE 仍 503 直至另授权
3. P0-CB + SCOR（产品）诚实推进
4. MODEL-OP / wakeup 诚实（PG LISTEN 保留；Redis 另评）
5. G7 全量本地 suite 真跑收据
6. HA 阶 C/D 生产级证据（需用户授权买云）
7. `gap-bug-backlog.md` 全部 P0 假绿/conditional 清零

选下一刀算法：

```
读 gap-bug-backlog.md + e2e-requirement-coverage-matrix.md + non-happy-path-perf-load-case-matrix.md
→ 优先 P0 OPEN / 矩阵 gap|blind
→ 跳过已 FINAL 同题
→ 跳过与进行中线文件冲突的刀
→ 开 §3 loop
```

---

## 5. 回报格式（给 meetwise 验收 · 缺一不验）

```
LINE: A''|B''|…
REQUEST_SHA: …
PRE_DUAL: privacy|rag|model + e2e → PASS|FAIL @sha
PROVE_CMD: …
PROVE_EXIT: …
RECEIPT: path…
POST_DUAL: … PASS|FAIL @sha
NAIL_SHA: … (pushed)
SSOT_DELTA: 改了哪些行（诚实；未改写 pins）
STILL_OPEN: …
PINS_OK: yes
```

---

## 6. 用户一句话模板（按角色）

**实现（mw-core / 任意实现 AI）**

```
严格按 ai-docs/delivery/harness/NORTH-STAR-EXECUTION-LOOP.md 执行；从 §4 待执行队列表头开始（A''→B''→…）；一刀走完 §3 loop；不到北星不停；双审与 nail 交 meetwise。
```

**审查（mw-e2e-ha / mw-privacy-int / mw-rag-route / mw-model-op）**

```
严格按 NORTH-STAR-EXECUTION-LOOP.md §2–§3：只审不改产品；对照 REQUEST tip；末行 Verdict: PASS|FAIL；禁自批；pins 不得被实现方改口。
```

**只跑某一线**

```
严格按 NORTH-STAR-EXECUTION-LOOP.md 只做 Line A''（或 B''/C''/K/L）；其他线不动。
```

---

## 7. 停手条件（仅此可停「北星 loop」）

同时满足才允许停止持续开刀：

1. G7 全量本地 suite 有完整 CMD+EXIT 收据且独立双审同意套件结论（仍可能 `releaseEvidence=false` 若 HA 未齐）
2. 矩阵无未解释的 gap/blind 假绿；P0 backlog 清零或仅剩用户明示延期项
3. HA：若宣称生产 HA，须阶 C/D 云证据 + 用户授权买云后的独立审；否则保持 NOT_HA 且不得宣称
4. 用户明示「停」或「只做 X」

否则：**继续 §3 loop。**

---

*Harness SSOT · NORTH-STAR-EXECUTION-LOOP · 起草 2026-10-03 · tip f3cf84c · releaseEvidence=false · NOT_HA*
