# REQUEST — **C-PERF-TEARDOWN CONDITION residual** · post-prove · mw-e2e-ha（stub · `draft:awaiting_post_prove`）

**Status**: **PENDING** / `draft:awaiting_post_prove`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer · Ban self-nail）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD local partial · capacityRepresentative=false · canHonestlyFlip=false
**Expert**: `mw-e2e-ha`
**Knife**: `harness/c-perf-teardown-condition-residual.md` · slice `c-perf-teardown-condition-residual.slice.md`
**Receipt**: `ai-docs/delivery/receipts/2026-10-06-c-perf-teardown-condition-residual.md`
**REQUEST pre**: `b4a2a01` · PRE: mw-rag-route `9e2f001`（C1–C8）· mw-e2e-ha `f215438`
**Prove base SHA**: `350f7a482bd85ccd05c41c62edfd98996f9a9506` · code-eq `cce33ba9359ee040cf7cffa661cbb2477a1ed694`
**Date**: 2026-10-06
**Line**: **AE**
**Outcome claimed by implementer**: **R-A** · host class Linux-native-Docker-Engine · formal EXIT **0/0/0** · class none/none/none · **CONDITION stays OPEN**

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| C-PERF-TEARDOWN（backlog `:35`） | **CONDITION OPEN**（Ban close · 3×EXIT0 ≠ 关闭） |
| attempt1 @ `b29c191` | **EXIT=1 retained**（Ban wash） |
| Branch B | **Ban**（零改 capped-child / run-e2e-isolated / isolated-test-target / 拓扑） |
| coveredCount | **8** |

## 请审什么（mw-e2e-ha · post-prove）

1. **C1 探针**: 同镜像 `node:20-bookworm` + `--network host` + 同发布 PG 端口；宿主正控 PASS 后容器 TCP+SELECT1 PASS → R-A 判定是否成立；Host-side fail 未误标 R-B。
2. **C2 纪律**: N=3 预声明早于 attempt1；分类表 (a)(b)(c)(d) 预先写死；EXIT 0/0/0 全录 · Ban retry-to-green · Ban 只留绿 · 3×EXIT0 **不**关 CONDITION · 未复现 attempt1 **不**关。
3. **签名分界**: attempt1 mid-prove crash vs `44154aa` startup ECONNREFUSED vs 本机 EXIT0 —— 三类并存的读法是否诚实；Ban 用本机绿洗 attempt1。
4. **C3/C4**: 零产品/脚本突变（设计选择）· 证据层 = 本机 docker 真 PG · Ban 云分支。
5. **C6 host-class**: Linux Engine ≠ Desktop；矩阵解释 Line S 0/0/0 与 `44154aa` 1/1/1 并存 = 解释 ≠ 根因证实。
6. **C7/C8**: 收据日期钉 2026-10-06 · SSOT `:35`/checklist/矩阵零触碰 · Ban 互借 AH flake / C-IMAGE-DIGEST。
7. **边界**: PASS ≠ close ≠ nail ≠ HA ≠ capacity ≠ covered flip · alone ≠ dual · Ban self-nail · Ban 碰 AD/AF/AG/AH。

C-PERF-TEARDOWN stays **CONDITION OPEN**. attempt1 @ `b29c191` **EXIT=1 retained**.

---

*Stub · awaiting expert post-prove dual · STOP*
