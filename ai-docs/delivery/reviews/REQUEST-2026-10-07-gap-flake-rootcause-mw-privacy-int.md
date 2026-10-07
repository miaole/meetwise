# REQUEST — **GAP-PRIV-AUTHZ-PROVE-FLAKE · 根因调查** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer mw-e2e-ha）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Expert**: `mw-privacy-int`（`pnpm privacy-authorization:prove` 为隐私授权证明链 · `packages/db/test/privacy-authorization.proof.ts` 属隐私根域测试面）
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

## 请审什么（mw-privacy-int 视角）

A'' teed attempt-2 `PROCESS_EXIT=0`（三角一致 · 51 PASS）补齐了证据链，但 `:68` 根因**未钉死**：冷启 `ECONNREFUSED`（宿主→发布端口 · EXIT=1 ×2）与 warm `23505 interview_pkey`（EXIT=1 ×1）两类并存未归一；attempt-2 一次过未复现 ≠ 根因消失。本刀 REQUEST = **根因调查设计**（非 prove 刀 / 非 fix 刀 / 非关闭刀）。请审：

1. **范围成立性**：REQUEST 是否如实限定为「调查设计」——零实验执行、零产品/基建/测试码、零 SSOT 触碰；每实验是否 pre-registered 假设+判读标准+判读反例（harness §3）；Ban retry-to-green 与 Ban「一次过=根因」是否双向写死（harness §0/§5）。
2. **暖类实验越权边界（隐私测试面核心关切）**：E-WARM-1（同库双跑）/ E-WARM-2（预置行）只允许**外部注入**（另起容器 / 数据面 INSERT），**Ban 改 `privacy-authorization.proof.ts` fixture 迁就实验、Ban 改 `packages/db` 任何源码、Ban `principal.ts` / `checkpoint-principal.ts`**；证明链 51 断言语义零触碰；GUC/角色语义（`privacy_issuer` / `app.principal_user` / `asPrivacyWorkerPrincipal`）在实验全程不得被实验操作改变（实验只建连跑树内现状码）。
3. **designed-red 记账**：E-WARM-1 第二遍 23505 为**设计内预期红**，必须标 `designed-red` 入账且红账保留；Ban 记为回归、Ban retry 洗绿、Ban 把设计内红挪用为「产品有 bug」或「prove 不可靠」的叙事；同时 Ban 反向洗为「必然红=已钉死」而不出示三点全等证据（错误消息 / `code:'23505'` / 键值 `…a1` 与 warm-2.log 逐字同形）。
4. **脱敏**：实验 receipt 沿用 WITHHELD 惯例——Ban 连接串/端口之外的凭据、密码、`POSTGRES_PASSWORD`、GUC 值原文入 receipt；state/logs 诊断只留字节带；teed log 落盘前不含连接串。
5. **升级路径唯一性**：`:68` 状态变化**只走 nail 阶段**——根因钉死（受控实验复现）且双审同意，经协调方 nail 方可升级（如 → `cause-pinned`）；**Ban 直接关行**；实验 EXIT=0（绿）不关 gap；「未复现」只可入账为带样本量的观察。
6. **S/SS/P 比对诚实性**：Line P 池 error 监听改变断连呈现方式、不阻止连接期拒绝；Line SS 修复限定 capped-child 容器→宿主路径，宿主 `baseEnv.PGHOST=127.0.0.1` 路径零改动——三族 Ban 互借关闭/根因（harness §2 表）；「冷启类已被 SS 间接修复」必须写为**证据不足、不可判定**，判定权归 E-COLD 实验。
7. **与 Line AH F5 门闸关系**：本 REQUEST 不替代、不放宽 F5（含 prove 目标的执行按 F5 走：`with-docker-session.sh` 先例 · cold/warm 分列预声明 · teed `PROCESS_EXIT` 三角 · N4 关闭门槛语言 · close bar N≥5 consecutive first-runs no retry 维持不动）。

Backlog `gap-bug-backlog.md:68` stays **OPEN**（mitigated/cause-unknown）。coveredCount=8 不含本 flake。UC-052 stays partial。**Ban covered** · **Ban 碰 C-PERF-TEARDOWN（`:35`）/ GAP-RAG / UC-018/052/025 任何行** · **Ban invent「已修复/已钉死/HA」**（NOT_HA 不变）。

本 stub 不授权实验执行 / prove / coding / push。pre-exec dual PASS 后由协调方另行授权；implementer 不自批。Dual PASS ≠ 实验 ≠ prove ≠ nail。

---

*Stub · awaiting expert pre-exec dual · STOP*
