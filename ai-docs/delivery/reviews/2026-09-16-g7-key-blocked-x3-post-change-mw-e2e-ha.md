# 审查归档 — G7-A · Key-blocked×3 **post-change** docs pin · mw-e2e-ha

**日期**：2026-09-16 ~19:51 PT  
**审稿人**：`mw-e2e-ha`（对抗主审；**拒绝自批**；**零 invent Key**；**零 live hard-run**；**未读 `.env*`**）  
**送审**：`REQUEST-2026-09-16-g7-key-blocked-x3-post-change-mw-e2e-ha.md`  
**前序 pre-exec**：`reviews/2026-09-16-g7-key-blocked-x3-mw-e2e-ha.md`（**pass** · 执行前文档闸 only）  
**配对**：`REQUEST-2026-09-16-g7-key-blocked-x3-post-change-mw-rag-route.md`（**须独立写**；冲突取更严；**本审不代签**）  
**结论**：**pass**（见 §0 批准范围硬钉）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ family green** · **≠ suite green** · **≠ SLO/LOAD** · **G6 still OPEN** · **≠ R2/R4 closed**

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **批准范围** | **仅**「docs pin honesty landed」：Key unset 下 3× CMD 仍诚实 **blocked** / `not_run:no_key`；defaults/allowlist **NOT flipped**；**零 live hard-run** |
| **明确不批** | family green · suite green · G6 closed · covered · SLO/LOAD · HA · `releaseEvidence=true` · invent Key · hard-run live · flip allowlist · 代替 `mw-rag-route` |
| 3× CMD Key unset 是否仍 **blocked** | **是**（见 §2 验证方法；禁 rewrite green / skip-as-pass） |
| invent Key / hard-run live / flip allowlist | **未发生**（本审核 + 实现方声明；源码 fail-closed 仍在） |
| G6 / BUG-E2E-ISO | **仍 OPEN**（K3 cite ≠ close G6） |
| Docs pin = family covered / suite green？ | **否** — 仅 honesty |
| PERF/LOAD | **仍 blocked/blind** until Key+authorize |
| 实现方自批 | **无效 / 拒绝** |
| `releaseEvidence` | **false** |
| 阻塞（本域 post-change） | **无** |

---

## 1. 对照路径（已读）

| 角色 | 路径 |
|------|------|
| REQUEST（本域 post-change） | `reviews/REQUEST-2026-09-16-g7-key-blocked-x3-post-change-mw-e2e-ha.md` |
| REQUEST（配对） | `reviews/REQUEST-2026-09-16-g7-key-blocked-x3-post-change-mw-rag-route.md` |
| 前序 pre-exec | `reviews/2026-09-16-g7-key-blocked-x3-mw-e2e-ha.md`（pass · 文档闸） |
| Knife harness | `harness/g7-key-blocked-x3-honesty.md`（`docs_landed / awaiting_post_change_dual` · §6 pins） |
| G6 cross-pin | `harness/g6-e2e-iso-blocked.md` §G7-A（3× blocked retained） |
| Slice | `g7-honesty-knives.slice.md`（A 行 · `not_run:no_key / blocked`） |
| G7 receipt | `receipts/2026-09-16-g7-full-suite-run.md`（3× blocked 原记录） |
| Runners | `scripts/run-e2e.mjs` / `run-e2e-ui.mjs`（`live_provider_key_missing` fail-closed） |
| Package | `package.json`：`e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance` 仍挂（**未见**本刀翻 defaults） |
| 仓库 | `/workspace/meetwise` · HEAD `639134f` |

**Key**：`MODEL_API_KEY` **unset**（仅 env 名探测；**未读** `.env*`；不打印值；**不发明**）。  
**禁令遵守**：本审 **未** hard-run 三项 live/perf；**未** inject fake Key；**未碰** Meridian。

---

## 2. 如何验证「仍 blocked」（**无** invent Key · **无** live hard-run）

本刀 REQUEST：**docs pin only** · **no prove / no live**。本审验证路径如下（**诚实 blocked 证据**，非 suite 绿）：

| # | 验证动作 | 结果 |
|---|----------|------|
| 1 | env 名探测 `MODEL_API_KEY` | **unset**（无 name in env；值未打印） |
| 2 | 读 `harness/g7-key-blocked-x3-honesty.md` §6 docs pin | 3× CMD = **blocked** · `not_run:no_key` · defaults/allowlist **NOT flipped** · G6 still OPEN |
| 3 | 读 `harness/g6-e2e-iso-blocked.md` §G7-A cross-pin | `e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance` = **blocked**（no Key） |
| 4 | 读 G7 receipt + slice A 行 | 3× **blocked** honesty retained；slice = `docs_landed / awaiting_post_change_dual` |
| 5 | 源码 spot：`run-e2e.mjs` L42 · `run-e2e-ui.mjs` L46 | Key 缺 → `throw … live_provider_key_missing`（fail-closed；≠ skip-as-pass） |
| 6 | 交叉：同环境 `pnpm g6-e2e-iso-blocked:prove`（K3 本审复跑） | EXIT=0 且日志 `behavior: run-e2e(.mjs\|-ui) Key unset → non-zero + live_provider_key_missing`；`STATUS=blocked(无 Key)` — **证明 fail-closed 仍在**；**≠** 批准硬跑三项 |
| 7 | `package.json` 包装仍挂三项 | **未**见本刀翻 allowlist / 去掉 Key 门 |

**明确未做**：`pnpm e2e:isolated` · `pnpm e2e:ui:isolated` · `pnpm verify:e2e-performance` 硬跑；invent / inject Key；读 `.env*`。

### CMD honesty 表（本审裁定）

| CMD | Status | 诚实读法 |
|-----|--------|----------|
| `pnpm e2e:isolated` | **blocked** / `not_run:no_key` | Key unset · ≠ family green · **DO NOT hard-run** · 若硬跑会触 fail-closed / 且夹具默认 pgvector→R5 risk |
| `pnpm e2e:ui:isolated` | **blocked** / `not_run:no_key` | ≠ UI covered · **DO NOT hard-run** |
| `pnpm verify:e2e-performance` | **blocked** / `not_run:no_key` | ≠ SLO · ≠ LOAD · ≠ HA · **DO NOT hard-run** |
| Defaults / allowlist | **NOT flipped** | this knife |

---

## 3. REQUEST 专家问 Q1–Q6（对抗答）

| # | 问 | 本审 |
|---|----|------|
| **Q1** | 3× CMD 在 Key unset 下是否仍诚实 **blocked**（禁 rewrite green / skip-as-pass）？ | **是。** harness §6 + G6 cross-pin + receipt + slice + runner fail-closed 一致；**禁止**升格 green。 |
| **Q2** | 是否确认实现方 **未** invent Key / **未** hard-run live / **未** flip allowlist？ | **确认（就本审可核证据）**：Key unset；三项未 hard-run；package/harness 钉 NOT flipped；源码门仍在。 |
| **Q3** | G6 / BUG-E2E-ISO 是否仍 OPEN（K3 cite ≠ close G6）？ | **是。** backlog/status/harness 均钉 OPEN；K3 cite EXIT=0 **≠** 关 G6（见配对 K3 审）。 |
| **Q4** | Docs pin 是否仅 honesty（≠ family covered / ≠ suite green）？ | **是。** 本 pass 仅 docs pin honesty；**明确不批** covered / suite green。 |
| **Q5** | PERF/LOAD 是否仍 blocked/blind until Key+authorize？ | **是。** harness PERF/LOAD 列 + `verify:e2e-performance` blocked 钉。 |
| **Q6** | 禁 self-approve / `releaseEvidence=true`？ | **同意。** 自批无效；`releaseEvidence=false` · ≠HA。 |

---

## 4. Acceptance B1–B5 / 假绿禁令（post-change）

| ID / 风险 | 裁定 |
|-----------|------|
| **B1** 三项保持 blocked | **钉住** |
| **B2** 禁 invent Key / `.env*` / 无 Key hard-run | **钉住**（本审遵守） |
| **B3** docs pin 仅 dual 后 | **接受落地**（pre-exec dual pass 后 authorize docs pin；本审核落地诚实） |
| **B4** G6 仍 OPEN | **钉住** |
| **B5** 本刀无 prove / 无 live | **钉住**（本审亦无 hard-run 三项） |
| blocked → family / suite green | **拒绝** |
| soft-skip live → EXIT=0 | **拒绝** |
| 本刀关闭 G6 | **拒绝** |
| `releaseEvidence=true` / HA / SLO / LOAD | **拒绝** |
| 本审代替 `mw-rag-route` | **拒绝** |

**提醒（非阻塞）**：即便日后 Key+authorize 硬跑，默认夹具若仍 pgvector-legacy → **R5 green-risk**（≠ sole cutover）— 交叉钉属配对 `mw-rag-route` / MAIN；**本刀不授 live**。

---

## 5. 阻塞栏

| 类 | 项 |
|----|-----|
| **阻塞（本域 post-change）** | **无** |
| **硬非授权 / 提醒** | 本 **pass ≠** live authorize · ≠ family green · ≠ suite green · ≠ G6 closed · ≠ invent Key；**须**配对 `mw-rag-route` 独立 post-change；`releaseEvidence=false` · **≠HA** · **G6 still OPEN** · Key unset → **blocked** |

---

## 6. 签字

**Verdict**：**pass**  
**Scope**：**post-change docs pin honesty only**  
**Blocked evidence**：Key unset 探测 + harness/G6 cross-pin/receipt/slice pins + `run-e2e(.mjs|-ui)` `live_provider_key_missing` fail-closed + K3 prove 行为钉（**未** hard-run 三项）  
**Blockers**：**无**  
**硬确认**：

1. **Key unset → 3× blocked honesty 保持** · 禁 fake green / skip-as-pass  
2. **no invent Key · 未读 `.env*` · no hard-run live** · defaults/allowlist **NOT flipped**  
3. **G6 / BUG-E2E-ISO still OPEN** · K3 cite ≠ close G6  
4. **Docs pin ≠ family covered ≠ suite green ≠ SLO/LOAD ≠ HA**  
5. **releaseEvidence=false · ≠HA · ≠ R2/R4 closed**  
6. **Reject implementer self-pass** · **pair `mw-rag-route` independently**

— `mw-e2e-ha` · 2026-09-16 ~19:51 PT · Meetwise E2E/HA adversarial · releaseEvidence=false · ≠HA · Key unset → blocked · post-change docs pin pass ≠ suite green ≠ live authorize
