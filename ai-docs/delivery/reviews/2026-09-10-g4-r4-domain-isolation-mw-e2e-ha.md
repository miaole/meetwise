# 审查归档 — G4 / R4 domain isolation 诚实钉 · mw-e2e-ha

**日期**：2026-09-10（PT；本审独立复跑 ~03:59 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审；**不采信实现方自报**；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-r4-domain-isolation-mw-e2e-ha.md`  
**结论**：**pass**（仅 domain isolation **prove / 工具轨登记**）  
**批准范围**：**仅** R4/G4 **诚实钉** harness+status+eval+静态 prove 轨（`mysql-stack`/`conn-stack` `r4-domain-isolation:prove`）+ 库存/假绿标红/PREREQ 登记  
**不批**：**R4 关闭** / **G4 关闭** / 题域已隔离 / 生产 scoped retrieve / wrong_track=0 生产读面 / covered / HA / `releaseEvidence=true` / sole cutover / flip default / 切 qbank·向量真相  
**硬钉**：`releaseEvidence=false` · **Not HA** · **EXIT=0 ≠ R4 closed** · **本绿 ≠ 题域已隔离** · **rag04 绿 ≠ 生产隔离** · **production `localRetrieve` 仍无 scope**

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| harness `r4-domain-isolation.md` | **存在**；明文钉 题域隔离 NOT closed / pass ≠ R4 / releaseEvidence=false / Not HA / Worker `localRetrieve` 无 scope / rag04 ≠ 生产 |
| status `r4-domain-isolation-status.md` | **存在**；Proven = 诚实钉 only；GAP G-R4-1…6 仍开；**不**宣称 R4 关 |
| eval `r4-domain-isolation.eval.md` | **存在**；条目↔prove 全标「关闭 R4？=否」；假绿勾选清单齐全 |
| prove body `scripts/conn-stack/mysql-stack.r4-domain-isolation.proof.mjs` | **静态 only**（conn-only / NEVER LIVE / NEVER covered）；E1–E10；NOTE 自钉 R4 NOT closed |
| S4 forwarder `scripts/mysql-stack.r4-domain-isolation.proof.mjs` | 仅 re-export conn-stack body |
| `r5-retirement-sole-stack-status.md` G4 | **仍 GAP**：R4 题域隔离 NOT closed；**prove 绿 ≠ 关**；并行门挡切题库/向量 |
| GAP-RAG-04 / m4 §R4 | 仍钉 NOT closed + 指向本 harness |
| REQUEST 自承「非宣称 / 非 pass」 | **属实**；本审独立签核，**非**实现方自批 |

---

## 2. Prove（本审独立复跑 · CMD+EXIT）

| CMD | EXIT | 摘要 |
|-----|------|------|
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | E1–E10 全 PASS；收尾 NOTE：`honesty pins only; R4 NOT closed; releaseEvidence=false; Not HA` |
| `pnpm conn-stack:r4-domain-isolation:prove` | **0** | 同 body；同上 |
| `pnpm mysql-stack:m4-rag:prove` | **0** | 硬门仍含「题域隔离 NOT closed」；不切向量/qbank；≠ RAG/题域切流 |

**硬读法**：**EXIT=0 只证明诚实钉可执行**；**不得**写成 R4/G4 已关、生产已隔离、covered、HA、`releaseEvidence=true`。

---

## 3. 生产路径独立核验：`localRetrieve` scope 状态

**裁定：production `localRetrieve` 仍无 scope（GAP 仍在 · 未修复）。**

| 检查 | 独立结果 |
|------|----------|
| 路径 | `apps/worker/src/main.ts` ≈ L495–519：`localRetrieve: async (owner, q) => … cachedQbankSearch(pool, owner, {…})` |
| 传入键 | `query` / `k` / `embedderVersion` / `qbankRecipeId` / `retrievalMode` / `cache` / `embed` / `ttlSeconds` / `waitMs` / `leaseSeconds` — **无 `scope:`** |
| `dispatchTrackLocalRetrieval` | `apps/worker/src/` **无引用**（rg 零命中）；`main.ts` 亦不含该符号 |
| 合同 seam | `packages/db/src/qbank-track-local-retrieval.ts` **仍导出** `dispatchTrackLocalRetrieval`（prove-shell / 合同）；**≠** Worker 接线 |
| API 能力 | `cachedQbankSearch` **支持可选** `scope?: QbankServingScopeInput`（`qbank-retrieval-cache.ts`）；生产调用**未传** → 无 track 硬过滤 |
| R2 PREREQ | `apps/api/src` + `apps/worker/src`（非 proof/test）**无** `classifyJobRoute(` 调用 |

→ 与 harness P-WIRE / status G-R4-1 / GAP-RAG-04 **一致**：**钉 GAP ≠ 已修复**。合同层有 scope，**生产读面未消费**。

---

## 4. 对抗：假绿面

| 风险说法 | 裁定 |
|---------|------|
| `r4-domain-isolation:prove` EXIT=0 = **R4 已关 / 题域已隔离** | **假绿** — EXIT=0 = 文档+静态 GAP 钉；status/harness/NOTE 均否定关闭 |
| `rag04-track-local:prove` 绿 = **生产隔离** | **假绿** — prove-shell + PG 夹具；属 **R5 假绿族**；harness §1.1 / E5 已标红；本切片**未**把它当关闭证据 |
| `m4-rag:prove` 绿 = RAG/题域切流 | **假绿**（BUG-FAKE-CONN）— 本审复跑仍钉 NOT closed / 不切路径 |
| `snapshotInterviewRoute` / bind 写面存在 = R2 已接线 / 可关 R4 | **假绿** — apps 无 `classifyJobRoute(`；检索仍无 scope |
| role 参数化 / R1 flag = 题域隔离 | **假绿** — role 字符串 ≠ track 硬过滤（R1 ≠ R4） |
| Metadata 01A / funnel 合同 = 可关 R4 | **假绿** — 缺独立 `MetadataReviewReceipt` serving（P-META） |
| 本绿 = covered / HA / `releaseEvidence=true` / sole cutover | **假绿** — 全程钉 false / Not HA；prove 自标 NEVER covered |
| sole allowlist 因本切片扩面 | **未发生** — `SOLE_WIRING_ALLOWLIST` 仍恰 5（wiring/ping/qdrant-backed/vectorstore-adapter/vectorstore-qdrant）；**无** r4 |

**假绿风险（残留）**：**中** — 证明轨与 harness/status **自身诚实**；主要风险在**叙事外推**（把静态诚实钉绿口头升成「R4/G4 关 / 生产已 scoped」）。**只要遵守批准范围（仅 prove/工具轨登记）即可控**。  
**禁止假绿 / 假 covered / 假 HA / `releaseEvidence=true`。**

---

## 5. REQUEST 四问（mw-e2e-ha）

| # | 问题 | 本审回答 |
|---|------|----------|
| 1 | 本切片是否错误冒充完整 E2E / covered / HA？ | **否**。prove/docs 自钉 conn-only · NEVER LIVE · NEVER covered · Not HA · releaseEvidence=false；未检出冒充完整 E2E |
| 2 | `rag04-track-local:prove` 库存读法（prove-shell + R5 假绿族 ≠ 生产隔离）是否够清楚？ | **够清楚**。harness §1.1/E5、status P3、eval 假绿勾选、prove E5 均显式标红 |
| 3 | sole allowlist 不因本切片扩面 — 是否同意？ | **同意**。独立核验 allowlist 仍恰 5；R4 不进 allowlist |
| 4 | 与 G4（r5 status）并列门表述是否一致（R4 NOT closed 挡切题库/向量）？ | **一致**。r5 status G4、m4 §R4、GAP-RAG-04、本 harness 同钉 NOT closed + 并行门 |

---

## 6. 阻塞栏（关 R4 / G4 前 · 本审不关）

| 阻塞项 | 现状 | 关闭条件（**未宣称达成**） |
|--------|------|---------------------------|
| **G-R4-1 生产无 scope** | `localRetrieve`→`cachedQbankSearch` **无 scope**；无 `dispatchTrackLocalRetrieval` | Worker（或等价）经 track-local / scoped search；scope 来自 snapshot leaf |
| **G-R4-2 wrong_track=0** | 未在生产读面证明 | 伪造/缺失 metadata、未知分类、并发改岗、旧 checkpoint、cache 回放均零跨域 |
| **P-R1** | R1 仍开（legacy 技术岗默认） | GAP-RAG-01 / m4 §R1 |
| **P-R2** | apps 无 `classifyJobRoute(` | 分类→bind→snapshot→Worker 消费 |
| **P-META** | RAG-FUNNEL-01 / MetadataReviewReceipt serving 未关 | 01A ≠ 01 |
| **G-R4-6 / R5** | rag04 等仍绑 pgvector 假绿夹具 | Qdrant/sole 夹具或显式标红退役后再作迁栈证据 |
| **切题库/向量 / sole / HA** | 被 G4 并列门挡住 | R4 + 并列门关闭且双域审；**禁止**本绿勾 releaseEvidence |

**本切片不因上述阻塞而 block「诚实钉/prove 轨登记」**；上述仅 **阻塞宣称 R4/G4 关 / 生产已隔离 / covered / HA**。

---

## 7. 硬钉勾选

- [x] `releaseEvidence=false` · **Not HA**
- [x] **EXIT=0 ≠ R4 closed** · **本绿 ≠ 题域已隔离**
- [x] **production `localRetrieve` 仍无 scope**（源码独立核验）
- [x] **不**调用 `dispatchTrackLocalRetrieval`（生产）
- [x] rag04 库存标 **≠ 生产 / R5 假绿族**
- [x] sole allowlist **未**因本切片扩面
- [x] 未宣称 covered / HA / `releaseEvidence=true` / sole cutover / flip default
- [x] 批准范围仅 prove/工具轨；**不批 R4/G4 关闭**
- [x] 未与 G1 PREP 等并行审混写「关闸」结论

---

## 8. 结论与建议

- **裁定：pass**（G4/R4 **domain isolation 诚实钉 / prove 工具轨 only**）
- **批准范围**：登记 `harness/r4-domain-isolation.md` + status + eval + `pnpm mysql-stack:r4-domain-isolation:prove` / `conn-stack:…` 静态轨 + GAP-RAG-04/m4/r5-G4 指针一致；假绿标红与 PREREQ 清单入库
- **明确不批**：关 R4、关 G4、宣称题域已隔离、宣称生产 scoped、wrong_track=0 生产证据、covered、HA、`releaseEvidence=true`、扩 sole allowlist、切 qbank/向量默认
- **下一刀（另切片）**：生产接线 `localRetrieve`→`dispatchTrackLocalRetrieval` / `cachedQbankSearch(..., scope)` + R1/R2/Metadata PREREQ 齐后，再开 **wrong_track=0 生产读面** 送双域审；**本 pass 不得引用为 R4 关闭批准**

对照：`ai-docs/delivery/harness/r4-domain-isolation.md` · `r4-domain-isolation-status.md` · `eval/r4-domain-isolation.eval.md` · `scripts/conn-stack/mysql-stack.r4-domain-isolation.proof.mjs` · `apps/worker/src/main.ts`（localRetrieve）· `packages/db/src/qbank-track-local-retrieval.ts` · `harness/r5-retirement-sole-stack-status.md` G4 · `m4-rag-hard-gates.md` §R4 · GAP-RAG-04 · `reviews/REQUEST-r4-domain-isolation-mw-e2e-ha.md`
