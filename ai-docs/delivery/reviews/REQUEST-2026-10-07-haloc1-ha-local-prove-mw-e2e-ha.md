# REQUEST — **HALOC-1 · HA 阶 C 本地模拟 prove 全链绿刀**（本地多实例+故障注入 · C3/C3b/C4/probe 级四面齐套 · ≠ 阶 C 绿 ≠ 生产 HA）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins（十值照抄）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-e2e-ha`
**Knife**: `harness/ha-local-prove.md` · slice `ha-local-prove.slice.md`
**上游现状**: `north-star-ha.md:42` —— 阶 C 骨架已落但 **阶 C prove 未绿**（各路径只到「可跑/骨架」态；2026-09-23 三刀系旧 tip 分刀局部收据，无单 tip 全链齐套）· 用户直裁「HA 那个可以本地模拟好的」
**Base tip**: `9028eb70`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **HALOC-1**

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false**（retained · trio OPEN 独立核算） |
| `actualSpendCny` | **null**（沿 I 线 · Ban invented spend） |
| 阶 C/D | **prove 未绿**（本刀目标=**本地**全链绿 · ≠ 阶 C 绿 · nail 阶段前 SSOT 行不翻） |

## 请审什么（mw-e2e-ha · prove 全链纪律 / EXIT 契约 / fail-closed 门 / 诚实边界）

Line HALOC-1 · **HA 阶 C 本地模拟 prove 全链绿刀**（docs REQUEST）。请审：

1. **四面齐套与执行序（harness §1/§2）**：C3 shared（A1–A3 → `SHARED_OK` + A-write/B-read 收据）/ C4 fault-inject（B1–B2 → `COMPOSE_FAULT_SHARED_PARTIAL` + kill-A/B-still-serving/survivor 收据）/ C3b nest-pg（C1–C5 → `NEST_SESSION_LOCAL_OK` + `nest-session.OK.json`）/ ha:probe 级（D1–D3）；**拓扑互斥**处理（C3 与 C3b 共用 compose project `meetwise-ha-dual` → P→A→B→teardown→C→D 串行）是否闭合；wiring 引用（`package.json` `ha:dual:compose-shared`/`ha:prove:shared`/`ha:prepare:nest-pg`/`ha:dual:compose-pg`/`ha:prove:nest-session`/`ha:fault-inject`/`ha:probe:multi`）与 `scripts/ha/README.md`/`ha-track.multi-instance.md` 口径一致性。
2. **EXIT 契约与负检门（harness §2 汇总契约）**：正检全 0 + 负检 N1–N3 与 D3 恰 1 = 「本地全链绿」成立口径；**N3 窗口约束**（`--require-session` 负检必须先于 C3 正检/干净 evidence dir，否则 OK 收据复用转 0）是否如实钉；**D3 `--require-evidence` 恒 EXIT=1 = fail-closed 诚实钉**（拒生产 HA），Ban 绕过 Ban 改语义 Ban 把红写成失败。
3. **授权变量注入纪律（harness §3）**：四枚（DUAL/SHARED/NEST_PG/FAULT）**只经进程 env · 逐 CMD 前缀 · 协调方 EXEC 授权显式开闸** · 不写 `.env*` · 不入 git · 收据 name-only set/unset · 负检不带授权；授权链（pre-exec dual BOTH PASS → 协调方 EXEC → 实跑）边界是否闭合（双审 PASS ≠ EXEC 授权 · agent 不自开）。
4. **诚实边界写死（harness §6）**：本地绿 ≠ 阶 C 绿 ≠ 生产 HA；`haStatus=NOT_HA`/`releaseEvidence=false`/`claimProductionHA=false` 全程原样；`haStatus` 翻转归生产多实例证据（**买云后另刀**）；产物上限 = 「HA 阶 C 本地证据包」+ 矩阵 HA 行本地子面**建议**（`e2e-requirement-coverage-matrix.md:15` 本刀不落行 · nail 阶段协调方裁量）——是否足以阻断升格叙事。
5. **收据七要素与证据包（harness §6.2）**：CMD 原文+EXIT 原值+时间戳+实跑 SHA+worktree/branch+env 探针（授权变量 name-only + `.env*` ABSENT presence）+关键输出；`.tmp/ha-evidence/` JSON 脱敏副本 + `SUMMARY.md`；历史收据（2026-09-23 三刀）零改写。
6. **Ban 清单（harness §5）**：Ban 买云叙事 · Ban 翻转 · Ban 生产部署面（compose.prod 零触碰 · 本地 compose 禁合入生产 · CI `ha-probe-multi.yml` 零改零触发 · D2b artifact 维持已录不重跑）· Ban secrets · Ban coding（红了如实登记另刀，Ban 就地改脚本追绿）· Ban假绿/retry-to-green/flake 记法（每 CMD 恰一次 attempt）· Ban SSOT/矩阵行翻转。
7. **预算面（harness §4）**：est 0 live 模型调用 / 0 Key 加载（实测口径依据 = 2026-09-23 收据形态 + 源码无模型调用面）；`actualSpendCny=null`；est 0 ≠ 已实测。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit · 零实跑零 docker 零 live 零 Key 加载 · 本 commit 不预claim 任何 post-commit EXIT。

阶 C/D **STILL NOT GREEN**（本刀目标为本地全链绿 ≠ 阶 C 绿）。`haStatus=NOT_HA` · `releaseEvidence=false`。本地 fault-inject ≠ 生产 failover · `nestSessionOk` 本地 ≠ 阶 C。

本 stub 不授权 coding / prove 执行 / docker 操作 / live / push；pre-exec dual PASS 后由协调方 EXEC 授权（含四枚授权变量开闸权）；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

*REQUEST stub · HALOC-1 · HA 阶 C 本地模拟 prove 全链绿刀 · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · STOP*
