# 审查 — Meetwise HA track skeleton · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗主审；实现方不自审；不采信自报；独立复跑）  
**日期**：2026-09-10（PT）  
**切片**：HA track **骨架 only**（harness + `scripts/ha/*` + `compose.ha-dual.skeleton.yml` + pnpm aliases）  
**Harness**：`ai-docs/delivery/harness/ha-track.skeleton.md`  
**对照**：`ai-docs/delivery/north-star-ha.md` 证据阶梯 **C/D**（今日 **prove 未开**）  
**releaseEvidence=false** · **Not HA** · **骨架绿 ≠ 生产 HA** · **骨架绿 ≠ multi-instance / fault-inject 已证** · **连通绿/目录绿/partial ≠ HA** · **禁止 HA 绿叙事**

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（诚实 Not HA；无 `releaseEvidence=true`；无生产 HA / multi-AZ failover 已验叙事） |
| 是否批准 **仅骨架登记** | **是**（登记 harness + skeleton prove/probe + optional dual compose 草稿） |
| 是否批阶 C/D prove 绿 | **否** |
| 是否批生产 HA / 可用性已证 | **否** |
| 是否批 `releaseEvidence=true` | **否**（强制 false） |
| 进入真 `ha:probe` / fault-inject prove | **本域不自动开工**；须另开 harness + 授权 + 真实收据 + 独立审 |

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| — | **阻塞** | （无）本切片未发现把骨架绿偷升为 HA / `releaseEvidence=true` / multi-AZ failover 已验的成立阻塞 | **无阻塞** |
| B1 | **立场钉（非缺陷）** | `ha-track:skeleton:prove` / `ha:probe:skeleton` EXIT=0 **仅**表示骨架文件与诚实钉存在；**不得**记为生产 HA、阶 C/D 已绿、multi-instance 已证、fault-inject 已证、可用性已证 | **强制遵守** |
| B2 | **立场钉（非缺陷）** | `--require-evidence` 无双实例+kill+shared 收据时必须 **EXIT≠0** fail-closed；即便未来出现本地双 `/livez`，receipt 仍须 `haStatus: NOT_HA` · `releaseEvidence: false` · `claimProductionHA: false` | **已核验成立** |
| O1 | **反对 / nit（不降级）** | 默认 `ha:probe:skeleton` receipt 内多步 `FAIL`（livez A/B、evidence dir、evidence bar）但进程 **EXIT=0** + `result: SKELETON`。诚实，但易被外行读成「探针失败却绿」。 | **不降级**；harness 已写明默认骨架 EXIT=0 含义；建议协调层对外摘要只用 `haStatus/releaseEvidence/result`，勿只报 EXIT |
| O2 | **反对 / nit（不降级）** | `docker compose … config` 默认 profile 下渲染 `services: {}`（`api-a`/`api-b` 在 `profiles: ["ha-dual-future"]`）。静校 EXIT=0 ≠ 拓扑可起。 | **不降级**；与「非生产 / 真跑需另文授权」一致；禁把 config 绿写成双实例已起 |

**冲突取更严**：若他域把 O1/O2 升为 conditional，以更严为准。本域因文档钉与 receipt 字段诚实，维持 **pass**。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称 | 独立结果 |
|------|----------|
| `harness/ha-track.skeleton.md` | **成立**。文首钉 `releaseEvidence=false` / Not HA / 本绿≠生产 HA；阶 C/D 标「规划 / 未开」；成功标准明确「阶 C/D 未开」「生产 HA 禁止宣称」 |
| `scripts/ha/*` | **成立**。`ha-track.skeleton.proof.mjs`（静态存在性+诚实钉）；`probe.skeleton.mjs`（默认 NOT_HA；`--require-evidence` fail-closed）；`README.md` Not HA |
| `docker/compose.ha-dual.skeleton.yml` | **成立**。头注释 SKELETON / Not HA / 非生产拓扑；`api-a`/`api-b` + `ha-dual-future` profile；占位镜像 `skeleton-not-for-prod` |
| `pnpm ha-track:skeleton:prove` EXIT=0 | **成立**（见 CMD 表；`package.json` 映射 `node scripts/ha/ha-track.skeleton.proof.mjs`；本审以 node 等价复跑） |
| `pnpm ha:probe:skeleton` EXIT=0（NOT_HA） | **成立**。receipt：`result: SKELETON` · `haStatus: NOT_HA` · `releaseEvidence: false` · `claimProductionHA: false` |
| `--require-evidence` EXIT=1 fail-closed | **成立**。receipt：`result: FAIL` · `haStatus: NOT_HA` · `requireEvidence: true` · `EXIT=1` |

### 头注释抽查

| 文件 | 诚实钉 |
|------|--------|
| `ha-track.skeleton.proof.mjs` | static only；永不 claim HA；`releaseEvidence=false` · Not HA |
| `probe.skeleton.mjs` | 默认 NOT_HA；`--require-evidence` 无证据 → EXIT=1；evidence 路径仍 `releaseEvidence=false` / `claimProductionHA=false` |
| `compose.ha-dual.skeleton.yml` | SKELETON ONLY；Not HA；静校 ≠ 实例已起 ≠ HA |

### 对抗：是否偷偷写 HA 已证 / releaseEvidence=true / 多 AZ failover 已验

| 检查 | 结果 |
|------|------|
| 交付物是否出现 `releaseEvidence=true`（非「禁止勾」语境） | **未发现**（harness/README/compose/脚本均钉 false；receipt 硬编码 `releaseEvidence: false`） |
| 是否宣称生产 HA / HA green / 可用性已证 | **未发现**；反面禁令齐全 |
| 是否宣称 multi-AZ / failover 已验 | **未发现**（无 multi-AZ 已验措辞；fault-inject 仅规划占位） |
| north-star 阶 C/D | **诚实**：C「骨架已落 · prove 未开」；D「探针骨架 · 真 probe+CI+独立审未开」 |
| 探针在无实例时是否仍可能 PASS 为 HA | **否**：无证据 → `NOT_HA`；即便 `realMultiEvidence` 分支也只给 `LOCAL_EVIDENCE_PARTIAL` + 仍 `NOT_HA`，且 `--require-evidence` 时 EXIT=1 |

---

## CMD + EXIT 全表（本审复跑 · PT 2026-09-10）

| CMD | EXIT | 解读 |
|-----|------|------|
| `node scripts/ha/ha-track.skeleton.proof.mjs`（≡ `pnpm ha-track:skeleton:prove`） | **0** | 交付物存在 + 诚实钉；输出 `haStatus: NOT_HA` · `releaseEvidence: false` · `claimProductionHA: false`；**≠ 生产 HA** |
| `node scripts/ha/probe.skeleton.mjs`（≡ `pnpm ha:probe:skeleton`） | **0** | receipt `result: SKELETON` · `haStatus: NOT_HA` · `releaseEvidence: false`；livez A/B ECONNREFUSED（预期骨架环境）；**≠ HA** |
| `node scripts/ha/probe.skeleton.mjs --require-evidence`（≡ `pnpm ha:probe:skeleton -- --require-evidence`） | **1** | fail-closed；`result: FAIL` · `haStatus: NOT_HA` · `requireEvidence: true` |
| `docker compose -f docker/compose.ha-dual.skeleton.yml config` | **0** | YAML 静校；默认 profile 下 `services: {}`；**≠ 实例已起** · **≠ HA** |
| 真 `pnpm ha:probe` / kill-A / shared-state / CI 阶 D | **N/A** | **未开**；禁止计入本切片 |

Prove 摘要钉（独立观测）：全部 PASS 行 + `note: skeleton files only; multi-instance + fault-inject prove NOT run`。

---

## 非宣称（硬禁）

- **不批** 生产 HA / HA green / 可用性已证 / multi-AZ failover 已验  
- **不批** `releaseEvidence=true` / controlPlaneClosed  
- **不以** 骨架 EXIT=0、compose config 绿、单/双 `/livez`、目录绿、partial 冒充阶 C/D 或生产 HA  
- **不**把本审当作真 dual-instance fault-inject prove 的开工令  

---

## 批准范围

**批准仅骨架登记**：允许在北星/目录中登记 HA track skeleton 入口与今日可跑命令；**明确未批准**任何 HA 证据升阶。

---

## reviews 路径

`ai-docs/delivery/reviews/2026-09-10-ha-track-skeleton-mw-e2e-ha.md`
