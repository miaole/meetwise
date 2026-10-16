# 审查 — Meetwise HA multi-instance track · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗主审；实现方不自审；不采信自报；独立复跑）  
**日期**：2026-09-10（PT）  
**切片**：HA multi-instance **工具轨 / stub·骨架 beyond skeleton**（非生产 HA）  
**Harness**：`ai-docs/delivery/harness/ha-track.multi-instance.md`  
**对照**：`ai-docs/delivery/north-star-ha.md` 证据阶梯 **C/D**（今日 **prove 未绿**；C3 shared=GAP；D 未开）  
**硬钉**：`releaseEvidence=false` · **Not HA** · **stub dual ≠ Nest 双实例 ≠ 生产 HA** · **本绿 ≠ 生产 HA** · **禁止升阶 HA / releaseEvidence=true**

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（诚实 Not HA；无 `releaseEvidence=true`；无 Nest 双实例 / 生产 HA / failover 已验叙事） |
| 是否批准 **仅 stub/工具轨登记** | **是**（登记 multi harness + bring-up/probe/fault stubs + `ha-track:multi:prove`） |
| 是否批阶 C/D prove 绿 | **否** |
| 是否批真 Nest `api-a`/`api-b` 双实例已证 | **否**（仅 `STUB_LIVEZ_ONLY` / `api-*-stub`） |
| 是否批生产 HA / 可用性已证 / failover 已验 | **否** |
| 是否批 `releaseEvidence=true` | **否**（强制 false） |
| 进入真 dual Nest + shared-state + CI 阶 D | **本域不自动开工**；须另开授权 + 真收据 + 独立审 |

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| — | **阻塞** | （无）本切片未发现把 stub dual / multi.proof EXIT=0 / DUAL_STUB_FAULT_PARTIAL 偷升为 Nest 双实例、生产 HA、或 `releaseEvidence=true` 的成立阻塞 | **无阻塞** |
| B1 | **立场钉（非缺陷）** | `ha-track:multi:prove` / 默认 bring-up / stub probe EXIT=0 **仅**表示工具轨文件、诚实 GAP、或 stub C2/C4 机械可跑；**不得**记为生产 HA、阶 C/D 已绿、Nest 双实例已证、shared-state 已证、failover 已验 | **强制遵守** |
| B2 | **立场钉（非缺陷）** | `--require-instances`（无真双实例）与 `--require-evidence`（缺 dual+kill+**real shared**）必须 **EXIT=1** fail-closed；即便 stub dual+fault 全绿，receipt 仍须 `haStatus: NOT_HA` · `releaseEvidence: false` · `sharedState: GAP` / `sharedOk=false` | **已核验成立** |
| B3 | **立场钉（非缺陷）** | `dual-livez-stub` / `id=api-a-stub|api-b-stub` **≠** Nest API；`STUB_FAULT_PARTIAL` / A-down+B-up on stub **≠** 生产 failover；C3 shared 今日 **GAP**（`shared-state.GAP.json`） | **强制遵守** |
| O1 | **反对 / nit（不降级）** | 默认 `ha:probe:multi` 在无 dual 时多步 `FAIL`（livez A/B、evidence bar）但进程 **EXIT=0** + `result: MULTI_TRACK_GAP`。诚实，易被外行读成「探针失败却绿」。 | **不降级**；harness 已钉含义；对外摘要须用 `haStatus/releaseEvidence/result`，勿只报 EXIT |
| O2 | **反对 / nit（不降级）** | stub instanceId 用 `api-a-stub` / `api-b-stub` 命名，略像服务名；但 mode=`STUB_LIVEZ_ONLY` 与 harness「≠ Nest」钉齐全。 | **不降级**；禁把 stub id 写成 Nest 双实例已起 |

**冲突取更严**：若他域把 O1/O2 升为 conditional，以更严为准。本域因文档钉、receipt 硬编码 `NOT_HA`/`releaseEvidence: false`、require-* 真 fail-closed，维持 **pass**。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称 | 独立结果 |
|------|----------|
| `harness/ha-track.multi-instance.md` | **成立**。文首钉 `releaseEvidence=false` / Not HA / stub≠Nest≠生产 HA；阶 C2 stub 可跑、C3 GAP、C4 stub 部分、D 未开；成功标准明确阶 C/D 未开、生产 HA 禁止宣称 |
| `scripts/ha/bring-up-dual.mjs` 等 | **成立**。头注释 + receipt 硬编码 `haStatus: NOT_HA` · `releaseEvidence: false` · `claimProductionHA: false` |
| `multi.proof` EXIT=0 | **成立**（见 CMD 表） |
| bring-up 默认 PREREQ_GAP EXIT=0 | **成立**。`result: PREREQ_GAP` · 缺镜像 + 未授权 |
| `--require-instances` EXIT=1 fail-closed | **成立** |
| `--require-evidence` EXIT=1 fail-closed | **成立**（含 stub 路径跑过后仍 EXIT=1，因 shared GAP） |
| stub probe EXIT=0 且 NOT_HA | **成立**。`result: DUAL_STUB_FAULT_PARTIAL` · `haStatus: NOT_HA` |
| sharedState GAP | **成立**。fault receipt `sharedState: GAP`；证据文件 `shared-state.GAP.json`；probe `sharedOk=false` |

### 头注释抽查

| 文件 | 诚实钉 |
|------|--------|
| `ha-track.multi.proof.mjs` | static only；不启实例；`releaseEvidence=false` · Not HA · stub≠生产 HA |
| `bring-up-dual.mjs` | 默认 PREREQ_GAP EXIT=0；`--require-instances` → EXIT=1；`--stub` = C2 only |
| `dual-livez-stub.mjs` | `STUB_LIVEZ_ONLY` ≠ real Nest API ≠ production HA |
| `fault-inject.stub.mjs` | stub kill ≠ 生产 failover；`sharedState: GAP`；NEVER HA / releaseEvidence=true |
| `probe.multi.mjs` | ALWAYS NOT_HA / releaseEvidence=false；`--require-evidence` fail-closed |

### 对抗：是否把 stub dual 写成 Nest 双实例 / 生产 HA；require-* 是否真 fail-closed

| 检查 | 结果 |
|------|------|
| 交付物是否出现 `releaseEvidence=true`（非「禁止勾」语境） | **未发现**；receipt / printReceipt 硬编码 `false` |
| 是否宣称 Nest 双实例已证 / 生产 HA / HA green / failover 已验 | **未发现**；反面禁令齐全（harness/README/脚本头） |
| stub id / mode 是否冒充 Nest | **否**：`mode: STUB_LIVEZ_ONLY`；`id=api-a-stub` / `api-b-stub` / `api-b-stub-survivor` |
| `--require-instances` 无真双实例 | **EXIT=1**（独立复跑；receipt `requireInstances: true` · `result: PREREQ_GAP`） |
| `--require-evidence` 无齐套（含 real shared） | **EXIT=1**；即便 `--with-bring-up-stub --with-fault-inject` 后仍 EXIT=1（`sharedOk=false` / `shared-state.GAP.json`） |
| north-star 阶 C/D | harness 诚实：C3 GAP；D 未开；保持 NOT_HA |

---

## CMD + EXIT 全表（本审复跑 · PT 2026-09-10）

| CMD | EXIT | 关键 receipt 字段 | 解读 |
|-----|------|----------------|------|
| `node scripts/ha/ha-track.multi.proof.mjs`（≡ `pnpm ha-track:multi:prove`） | **0** | `haStatus: NOT_HA` · `releaseEvidence: false` · `claimProductionHA: false` | 交付物+诚实钉；**≠ HA** |
| `node scripts/ha/bring-up-dual.mjs`（≡ `pnpm ha:dual:bring-up`） | **0** | `result: PREREQ_GAP` · `haStatus: NOT_HA` · `releaseEvidence: false` · `mode: ASSESS` | 缺 backend 镜像 + 未授权；诚实 GAP |
| `node scripts/ha/bring-up-dual.mjs --require-instances` | **1** | 同上 + `requireInstances: true` · CMD 行 `EXIT=1` | **fail-closed** |
| `node scripts/ha/bring-up-dual.mjs --stub`（≡ `pnpm ha:dual:stub`） | **0** | `result: DUAL_STUB_UP` · `mode: STUB_LIVEZ_ONLY` · `haStatus: NOT_HA` · `releaseEvidence: false` | C2 stub only；**≠ Nest** |
| `node scripts/ha/probe.multi.mjs`（≡ `pnpm ha:probe:multi`） | **0** | `result: MULTI_TRACK_GAP` · `haStatus: NOT_HA` · `releaseEvidence: false` · ladder `C3_shared=GAP` | 无 dual 时仍 NOT_HA |
| `node scripts/ha/probe.multi.mjs --require-evidence` | **1** | `result: FAIL` · `haStatus: NOT_HA` · `requireEvidence: true` · `releaseEvidence: false` | **fail-closed** |
| `node scripts/ha/probe.multi.mjs --with-bring-up-stub --with-fault-inject` | **0** | `result: DUAL_STUB_FAULT_PARTIAL` · `haStatus: NOT_HA` · `releaseEvidence: false` · evidence bar FAIL（shared） | stub C2+C4 部分；**shared=GAP**；**Not HA** |
| `node scripts/ha/probe.multi.mjs --with-bring-up-stub --with-fault-inject --require-evidence` | **1** | `result: FAIL` · `haStatus: NOT_HA` · `requireEvidence: true` · `sharedOk=false` | stub 全绿仍因 shared GAP **fail-closed** |
| `node scripts/ha/fault-inject.stub.mjs`（dual stub 已起后） | **0** | `result: STUB_FAULT_PARTIAL` · `faultInject: STUB_A_DOWN_B_UP` · `sharedState: GAP` · `haStatus: NOT_HA` · `releaseEvidence: false` | stub kill 机械；**≠ 生产 failover** |
| 真 Nest dual / shared A→B / CI 阶 D / `releaseEvidence=true` | **N/A** | — | **未开**；禁止计入本切片 |

证据文件（独立观测）：`kill-A.receipt.json`（`haStatus: NOT_HA`）、`B-still-serving.receipt.json`、`shared-state.GAP.json`（`status: GAP` · `reason: STUB_LIVEZ_ONLY has no shared DB/session path`）。

---

## 非宣称（硬禁）

- **不批** 生产 HA / HA green / 可用性已证 / multi-AZ / 生产 failover 已验  
- **不批** 真 Nest `api-a`/`api-b` 双实例已证（stub `/livez` ≠ Nest）  
- **不批** C3 shared-state 已证 / 阶 C/D prove 绿  
- **不批** `releaseEvidence=true` / controlPlaneClosed  
- **不以** multi.proof EXIT=0、PREREQ_GAP EXIT=0、DUAL_STUB_* EXIT=0、A-down+B-up stub 冒充生产 HA  

---

## 批准范围

**批准仅 stub/工具轨登记**：允许在北星/目录中登记 HA multi-instance harness 与今日可跑命令（`ha-track:multi:prove` · `ha:dual:bring-up` · `ha:dual:stub` · `ha:probe:multi` · `ha:fault-inject:stub`）；**明确未批准**任何 HA 证据升阶或 `releaseEvidence=true`。

---

## reviews 路径

`ai-docs/delivery/reviews/2026-09-10-ha-multi-instance-mw-e2e-ha.md`
