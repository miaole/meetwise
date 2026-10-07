# REQUEST — **GAP-PRIV-AUTHZ-PROVE-FLAKE · 根因调查** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer mw-privacy-int）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Expert**: `mw-e2e-ha`（harness/容器/Docker 层与 attempt 纪律归口 · `scripts/run-e2e-isolated.mjs` 执行链）
**Knife**: `harness/gap-flake-rootcause-investigation.md` · slice `gap-flake-rootcause-investigation.slice.md`
**Parent tip**: `50423a6f`（full `50423a6fa6f18d4c9d193611cf84c4702e067208` · origin/feat/mysql-schema-skeleton · fetch 后逐字一致）
**Date**: 2026-10-07

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
| `canHonestlyFlip` | **false** |
| backlog `:68` | **OPEN** · mitigated/cause-unknown（stays） |

## 请审什么（mw-e2e-ha 视角）

`:68` 两类失败（冷 `ECONNREFUSED` / 暖 `23505`）至今 cause-unknown；树内 mitigation（`waitForPostgres` 三连探针 + post-migrate re-attest + pre-prove Running check，`scripts/run-e2e-isolated.mjs:2146-2173/2319/2326-2330`）上树后零新复现，但 TOCTOU 间隙与发布窗口仍在。本刀 REQUEST = **根因调查设计**。请审：

1. **冷类实验有效性**：E-COLD-1（`docker port` 返回后 ≤100ms ×100 探针 · ≥5 fresh 实例）能否覆盖「发布窗口竞态」假设；E-COLD-2（完整冷启序列后 pre-prove 与 prove spawn 之间注入 `docker stop`/`kill`/无注入对照）与历史退场的**等价性与局限**是否如实标注；判读标准（`Error: connect ECONNREFUSED 127.0.0.1:<port>` + `code:'ECONNREFUSED'` 与 cold-5.log L18/L24 逐字同形 + WITHHELD 字节带分桶）是否可机检；`state_bytes` 29 vs 226 保持「未解释观测」不得擅自归因。
2. **attempt 纪律**：全实验全 attempt 入账（含红/弃）· EXIT+UTC 时戳+容器名/端口+machine receipt 哈希；含 prove 目标的执行（E-WARM-1）teed `PROCESS_EXIT` 行三角一致；**Ban 弃单 · Ban retry-to-green · Ban 洗账 · Ban forge `PROCESS_EXIT`**；非预期红不触发自动重跑。
3. **隔离惯例不变**：实验容器沿用 `--rm -d` · `meetwise-e2e-<pid>-<ts>` 唯一名 · `-p 127.0.0.1::5432` 动态端口 · 零共享卷 · 用后即毁；**Ban 触碰开发库/开发容器**；G3（sole stack 禁 docker-run pgvector）语义不得被实验绕过；R5-MARKED-RED banner 不作 stack truth。
4. **S/SS/P 比对与互借禁令**：三族发生点分立（宿主→发布端口 / capped-child 容器→宿主 / 运行中断连呈现）Ban 互借关闭/根因；SS 后 perf-load attempts 2/3/4 EXIT=0 零 `ECONNREFUSED`（receipt `2026-10-07-gap-perf-container-reachability-fix-prove.md`）+ `ce31d7f2` 6 组 run 只能作为「另一路径健康」引用，**Ban 外推为本 gap 冷类已修复**；「未复现 ≠ 已修复」双向写死是否成立。
5. **实验触碰面**：Ban 改 `scripts/run-e2e-isolated.mjs` / `packages/db` / `apps/` / fixture——实验全部走外部注入（docker 操作 / 数据面预插行 / 独立探针脚本不入产品树）；探针脚本落点与生命周期请在审时裁定（建议 `.tmp` 或实验 receipt 内嵌，Ban 入 `scripts/` 产品面）。
6. **诚实条款完整性**：`:68` 只走 nail 阶段升级（钉死 + 双审同意 + 协调方 nail）；Ban 直接关；绿 ≠ 关；「一次过/未复现」≠ 根因结论；Line AH F5 门闸（`with-docker-session.sh` · cold/warm 分列预声明 · teed 三角 · close bar N≥5 consecutive first-runs no retry）不替代不放宽。

Backlog `gap-bug-backlog.md:68` stays **OPEN**（mitigated/cause-unknown）。**Ban 关 C-PERF-TEARDOWN（`:35`）/ GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER / Line U docker.sock 族** · **Ban 碰 UC-018/052/025 任何行** · **Ban invent「已修复/HA」**（NOT_HA 不变）。

本 stub 不授权实验执行 / prove / coding / push。pre-exec dual PASS 后由协调方另行授权；implementer 不自批。Dual PASS ≠ 实验 ≠ prove ≠ nail。

---

*Stub · awaiting expert pre-exec dual · STOP*
