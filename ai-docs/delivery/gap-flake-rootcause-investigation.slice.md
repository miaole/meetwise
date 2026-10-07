# Slice — **GAP-PRIV-AUTHZ-PROVE-FLAKE · 根因调查刀**（Line FLK · docs REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · backlog `:68` stays OPEN / mitigated-cause-unknown · row 不翻）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · **canHonestlyFlip=false**
**Date**: 2026-10-07
**Base**: `origin/feat/mysql-schema-skeleton` · `50423a6fa6f18d4c9d193611cf84c4702e067208`
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve

## One-line

`GAP-PRIV-AUTHZ-PROVE-FLAKE`（backlog `:68` · P2 · OPEN · mitigated/**cause-unknown**）在 A'' teed attempt-2 `PROCESS_EXIT=0` 补齐证据链后**根因仍未钉死**：冷启 `ECONNREFUSED`（宿主→隔离 PG 发布端口 · 已记录 EXIT=1 ×2）与 warm SQLSTATE `23505 interview_pkey`（固定 id fixture `privacy-authorization.proof.ts:125` 裸 INSERT 无 cleanup · 复用库路径 · EXIT=1 ×1）两类并存未归一；「attempt-2 一次过」≠ 根因消失。本刀（Line FLK）交付**根因调查设计 REQUEST**：两类失败各自的可复现实验（E-COLD-1 发布窗口竞态探针 / E-COLD-2 TOCTOU 间隙容器退场注入 / E-COLD-3 压力放大 / E-WARM-1 同库连跑双跑 / E-WARM-2 预置行单跑 / E-WARM-3 static 边界），每实验 pre-registered 假设+判读标准+判读反例；并诚实比对 S/SS/P 已修缺陷（不同发生点 · perf-load 绿 ≠ 本 gap 冷类被间接修复的证据）。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-flake-rootcause-investigation.md` |
| Dual `mw-privacy-int` | `reviews/REQUEST-2026-10-07-gap-flake-rootcause-mw-privacy-int.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-flake-rootcause-mw-e2e-ha.md` |

## Scope / Not

只做 backlog `gap-bug-backlog.md:68` **GAP-PRIV-AUTHZ-PROVE-FLAKE**（P2 OPEN）的**根因调查设计** REQUEST：调查设计 + 执行契约 + 诚实条款 + 双审 stubs。本 commit **零实验执行、零 prove、零产品/基建/测试码改动**。实验执行须 PRE dual BOTH PASS 后由协调方另行授权。

诚实条款：**`:68` 状态变化只走 nail 阶段**——根因钉死且双审同意，经协调方 nail 方可升级；**Ban 直接关**。绿 ≠ 关；「一次过/未复现」双向都 ≠ 根因结论（只能写「当前树/当前方法未复现 + 样本量」）。设计内红（E-WARM-1 第二遍必 23505）标 `designed-red` 入账，Ban 记为回归、Ban retry 洗绿。

## Ban

Ban coding · Ban prove 执行 · Ban retry-to-green 式重跑 · Ban 把一次过当根因结论 · Ban 关 `:68` / 翻任何 SSOT 行 · Ban 互借 C-PERF-TEARDOWN（`:35`）/ pool-error-listener / docker.sock 族的关闭或根因 · Ban 从 SS 后 perf-load 绿外推本 gap · Ban 修产品/fixture 迁就实验 · Ban forge `PROCESS_EXIT` / 洗红账 / 弃单 · Ban buy cloud · Ban secrets/`.env*` · Ban force-push · Ban push · Ban self-approve（alone ≠ dual）。
