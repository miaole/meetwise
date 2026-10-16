# 审查归档 — G6 e2e:isolated / LIVE family Key-unset blocked honesty · mw-e2e-ha

**日期**：2026-09-10（~05:10 PT）  
**审稿人**：`mw-e2e-ha`（对抗主审工作臂；实现方不自审；不采信送审自报；独立复跑）  
**对象**：`ai-docs/delivery/harness/g6-e2e-iso-blocked.md` · `scripts/g6-e2e-iso-blocked.proof.mjs` · status `r5-retirement-sole-stack-status.md` **P18 / G6** · 矩阵 §4 · inventory · `gap-bug-backlog` BUG-E2E-ISO · 同族 `uc001:live-blocked:prove`  
**结论**：**pass**（**仅** Key-unset family **blocked honesty** 钉 / 工具轨）  
**批准范围**：**仅** G6 **Key-unset → blocked honesty**（同 UC-001 live-blocked 纪律）+ inventory/Key 需求表 + runner `live_provider_key_missing` fail-closed 源码钉 + 有 Key 硬跑 Path 文档 + prove/CMD 接线  
**不批**：**G6 关** / **BUG-E2E-ISO 关** / family **covered** / `e2e:isolated` 绿 / performance=G6 关 / flip default / fixtures retired / HA / `releaseEvidence=true`  
**硬钉**：`releaseEvidence=false` · **Not HA** · **Key unset → blocked honesty** · **≠ family green** · **≠ G6 closed** · **同 UC-001 纪律**  
**禁区**：未碰 Meridian；未读 `.env*`；未硬跑无 Key `e2e:isolated`

旁证（不采信为自批）：`reviews/2026-09-10-g6-e2e-iso-blocked-mw-rag-route.md`

---

## 1. 送审对照（独立复核 · 不采信自报）

| 送审项 | 本审结果 |
|--------|----------|
| `harness/g6-e2e-iso-blocked.md` | **成立**：§0 硬边界；§1 LIVE 三元 Key 表（e2e:prove/e2e:ui 需 Key；performance 不需 ≠ G6 关）；§2 blocked(无 Key)；§3 Path when Key；§5 FORBIDDEN；双域送审包 |
| `scripts/g6-e2e-iso-blocked.proof.mjs` | **成立**：静态钉 + 轻量 spawn `run-e2e.mjs`/`run-e2e-ui.mjs`；HARD 无硬跑 / 不发明 Key / 不读 `.env*`；EXIT 文案钉 ≠ live / ≠ G6 closed |
| `run-e2e.mjs` / `run-e2e-ui.mjs` | **成立**：`tagE2EFailure('provider','live_provider_key_missing')` fail-closed（本审源码行核） |
| `run-performance-e2e.mjs` | **成立**：无 `live_provider_key_missing` 门；诚实 ≠ 关 G6 |
| status P18 / G6 | **P18 Proven** = Key-unset blocked honesty；**G6 仍 OPEN**（§2 GAP 表）；P18 ≠ 关 GAP |
| 矩阵 / inventory / gap | 矩阵 §4 G6 honesty 行；inventory §A Key blocked；BUG-E2E-ISO 引用 prove 且明示 **≠ 本 BUG 已关** |
| `package.json` | `g6-e2e-iso-blocked:prove` / `uc001:live-blocked:prove` / `e2e:isolated` 族包装仍挂 |

---

## 2. Prove（本审独立复跑 · Key unset）

环境：`MODEL_API_KEY` **unset**（仅 `process.env` 探测；**未读** `.env*`）。

| CMD | EXIT | NOTE / 读法 |
|-----|------|-------------|
| `pnpm g6-e2e-iso-blocked:prove` | **0** | `STATUS=blocked(无 Key)`；`EXIT=0 = G6 family blocked honesty / fail-closed · ≠ live E2E · ≠ G6 closed · releaseEvidence=false · Not HA` |
| `pnpm uc001:live-blocked:prove` | **0** | 同族纪律交叉仍绿；`EXIT=0 = blocked honesty · ≠ live E2E · ≠ covered` |
| `pnpm e2e:isolated` / `e2e:ui:isolated` | **未跑** | 硬禁：无 Key 勿假绿 |

**行为抽检**（prove 内 spawn；无 isolated docker）：`run-e2e.mjs` / `run-e2e-ui.mjs` Key unset → 非 0 + `live_provider_key_missing`（本审复跑 prove 内 PASS）。

---

## 3. 对抗：prove 绿是否偷写成 G6 关 / family green / covered？

| 攻击面 | 裁定 |
|--------|------|
| g6 prove EXIT=0 = `e2e:isolated` 绿？ | **否** — NOTE + harness §2/§5 明示 EXIT=0=钉 blocked |
| EXIT=0 = G6 / BUG-E2E-ISO **已关**？ | **否** — status G6 仍 OPEN；P18 列「≠ G6 关」；gap 行明示 ≠ BUG 已关 |
| performance 无 Key 可跑 = G6 关？ | **否** — harness 硬钉 performance ≠ G6 关 |
| UC-001 live-blocked 绿 = 全族 covered？ | **否** — 同族纪律 ≠ 外推 covered；FORBIDDEN 显式禁 |
| releaseEvidence / HA？ | **否** — 全文 `releaseEvidence=false` / Not HA；G7 仍开 |
| 缩 LIVE Set？ | **否** — 仍三元；缩 Set 须 dual approval（本切片未缩） |
| 草稿/送审自批偷升？ | **本审独立覆盖**；不以草稿为自批依据 |

**假绿风险（残余 · 非本切片缺陷）**：下游摘要若只报「g6 prove EXIT=0」而不带 NOTE，外行可能误读为 family 绿 / G6 关 → **立场钉强制**：对外须带 `blocked(无 Key)` / `G6 still OPEN` / `releaseEvidence=false`。

---

## 4. 阻塞栏（关 G6 · 本审不关）

| # | 项 | 状态 |
|---|----|------|
| B1 | 无 `MODEL_API_KEY` → LIVE HTTP/UI 硬跑 | **阻塞中**（blocked honesty；本切片正确登记） |
| B2 | 把 g6 prove EXIT=0 写成 family 绿 / G6 关 / covered | **硬禁**（文档+prove NOTE 已钉；摘要纪律） |
| B3 | sole-stack 上整套 e2e:isolated / LIVE / perf 复跑收据 | **仍缺**（关 G6 条件） |
| B4 | Key 到位后分家族硬跑收据 + inventory 复审 | **仍缺** |
| B5 | 默认仍 pgvector-legacy / R5（G1–G3） | **仍开**（与 Key 正交） |
| B6 | `releaseEvidence=true` / HA | **硬禁** |

本切片 **无**「把 blocked honesty 偷写成 G6 关」的成立缺陷 → 不降级；关 G6 的阻塞栏仍全部有效。

---

## 5. 硬钉勾选

- [x] `releaseEvidence=false` · **Not HA**
- [x] Key unset → **blocked honesty**（同 UC-001 纪律）
- [x] EXIT=0 ≠ family 绿 / ≠ G6 关 / ≠ BUG-E2E-ISO 关 / ≠ covered
- [x] Inventory：e2e:prove·e2e:ui 需 Key；performance 不需 Key ≠ 关 G6
- [x] Path when Key：`e2e:isolated` / `e2e:ui:isolated` / `performance:e2e:isolated` 已文档
- [x] fail-closed：`live_provider_key_missing`（HTTP+UI）
- [x] 未跑无 Key `e2e:isolated`；未读 `.env*`；未碰 Meridian；≠ flip default
- [x] 批准范围仅 honesty 钉/工具轨；**不批 G6 关**

---

## 6. 结论

- **pass** — G6 **Key-unset blocked honesty** 钉与工具轨成立；独立复跑两 CMD EXIT=0；对抗未发现把 prove 绿偷写成 G6 关 / family green / covered 的文案或 status 漂移。  
- **G6 / BUG-E2E-ISO 仍 OPEN（GAP）**。  
- **批准范围**：仅 Key-blocked honesty 钉/工具轨（含 inventory、fail-closed、Path when Key、prove 接线）。  
- **不批**：G6 关、BUG-E2E-ISO 关、e2e:isolated family 绿、covered、HA、`releaseEvidence=true`。  
- 抬关 G6 仅当：Key 到位 → 分家族硬跑收据 → sole 整套复跑 → inventory 复审（另开送审）。
