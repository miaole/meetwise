# HA-6 Companion 处置登记档（W2 限流 ×N + W3 PgBouncer 裁决 · EXEC 落卷）

**Status**: `exec:awaiting_post_prove_dual`（EXEC 席落卷 · Ban self-approve · 待 post-prove 双审）
**Date**: 2026-10-11
**REQUEST**: `ai-docs/delivery/harness/ha-6-companion-REQUEST.md`（@`8ba93f0b` 落卷 · pre-exec 双审 BOTH PASS · 协调方派单即 §8 开工授权）
**机读卷**: `receipts/ha-6/resource-budget.json`（C2）· `receipts/ha-6/rate-limit-census.json`（C3 census）· `receipts/ha-6/proof.*`（收据）
**pins**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · 零翻转

---

## 一、W2 处置：限流 ×N 稀释=预览尺度接受（R-23 主体 · 零码零基建）

**裁定**：接受 ×2 稀释并落档。13 流继承核对表逐流全等兑现于 `receipts/ha-6/rate-limit-census.json`（HA-1 R4 disposition「届时按本表逐流继承核对」由本刀兑现）；漂移精确口径=**「6 流 7 对 5 组」**（6 漂移涉流 × 7 旧行号→新行号对 × 5 分组），6 处零漂常量同表在卷。

**接受理由三条**（REQUEST §1-W2 原口径）：

1. **有界面**：×2 后逐流绝对值仍有界（6 / 20 / 120 / 10 burst 等），LB 轮询均摊下 2× 为上界非叠加放大。
2. **成本面**：Redis 共享桶须新增 Redis 面与 fail-open/closed 裁决+密钥授权——`apps/api/package.json` 今日零 redis 依赖（proof A4 机检零命中），违反 EXTREV-7 与 LEDGER:137「右列不加厚」。
3. **同理有界**：SSE 槽 5→10、parse 槽 6→12、吊销窗 ≤60s 最终一致（principal.guard.ts:14-15 seam 句在卷）。

**登记不实施（三面）**：

- **Redis 共享桶**：归 S15/波2 云侧需 Redis 面时另刀（TASK-SOP:86 波2 口径）；`rate-limit.service.ts:4` seam 注释维持原样零改（proof A5 治理面零 diff 佐证）。
- **principal 状态缓存吊销窗**：单实例 evict 即时 → 多实例最坏 ≤60s 最终一致+缓存重填 TOCTOU 窗——零改·登记维持（码面注释已自证 seam）。
- **叙事红线**（§5）：「接受 ×N」≠ 限流已多实例安全 / 已 Redis 化 / 全局精确上限已恢复——处置=登记，seam 波2 在卷。

## 二、W3 裁决：PgBouncer=预览尺度不加（R-21 · 零码零基建）

**裁定**：不加。四理由（REQUEST §0.3/§1-W3 原口径）：

1. **预算面**：W1 一行 env 帽后稳态 76 ≤ 97（PG16 镜像默认 100−3 保留），PgBouncer 要解决的问题已被更简手段解决（简化优先）。
2. **技术面**：sse-listen（sse-notify.service.ts:151）与 job-wakeup（worker main.ts:661）两条 LISTEN 专用连接与 transaction-pooling 语义不兼容（LISTEN/NOTIFY 须会话粘性；session 模式不省连接）→ 引入即须 LISTEN 旁路=复杂化。
3. **拓扑面**：新增单点服务=给 HA 拓扑添 SPOF。
4. **秩序面**：TASK-SOP:86 明载 PgBouncer=波2（需云+S9 先决）。

**波2 重裁留位**：本裁定=预览尺度预填入继承面，**非永久封死**——波2 云侧时按实况重裁。随卷负断言：全仓 docker/scripts/packages/apps 四面 "pgbouncer" 零命中（proof A4·脚本自排除自身文件）。

## 三、W1 落卷摘要（R-20 本体）

- C1：`docker/compose.ha.yml` 锚块 `x-ha-cloud-runtime-env` 恰增一行 `PGPOOL_MAX: "12"`（P=12 双审终裁·越界 [10,15] 即修法漂移；其余键零增零删零改）；七 service 四消费点（:157/:184/:211/:275）锚机制传播由 A2 断言。
- 预算三账（帧位逐账标注·席2 注记 4）：现状帧六池 **124**（超售 27）→ 帽后帧 **6P+4=76**、余 **21** → 共址 worst-case **148**（惰性条件池注记 main.ts:496-501 / privacy-worker-runtime.ts:21-25 在卷，不得隐去）；migrate 瞬态现状帧 ≤20 / 帽后帧 ≤12 双帧都标。
- S15 前置行：生产应用/翻转前须亲证生产 PG `max_connections` ≥ 97 或按实值重算本表（镜像默认 100 与 superuser_reserved=3 均系 PG 公开默认值非仓内锚）。

## 四、B1 裁撤登记（协调方裁定）

**沙箱 PG 活体连接数探针（REQUEST §4-B1）裁撤，不实现，无需 `MEETWISE_HA6_PROOF_AUTHORIZED`**。理由（席2 审面+协调方裁定）：

1. 沙箱 PG（tmpfs 一次性 `pgvector/pgvector:pg16`）`max_connections` 走镜像默认 100，与生产云参数不同值——活体读数**不可外推**到生产预算面；
2. 静态断言已闭合三风险面：A1 算术（6P+4 公式+越界漂移门）、A2 config 锚传播（四 service 环境实渲染）、A4 负断言（不引入面）；
3. est live=0 全保（零容器默认路径·零生产操作）。

## 五、席1 三注记随落（disposition 登记 · 不回改 REQUEST 卷）

| # | 注记 | 收口 |
|---|---|---|
| **D1** | REQUEST「全 19 个 compose 文件」标签口径：实为 **16 顶层 compose yml**（`docker/*.yml`）+ **3 monitoring yml**（`docker/monitoring/{alert.rules,alertmanager,prometheus}.yml`），19=递归总数。负断言面（max_connections/pgbouncer）按递归全 19 计，不受标签口径影响 | 本节登记 |
| **D2** | REQUEST §1-W1「锚块 :51-70」引用位：`x-ha-cloud-runtime-env` 实跨 **:51-112**（C1 落点在块内 :56 前后）；四消费点 :157/:184/:211/:275 不变 | 本节登记 |
| **D3** | REQUEST 散文「锚漂移 5 处 / 5 锚」计数：按 C3 精确口径收口为 **「6 流 7 对 5 组」**（5=分组数非流数）；13 流值全等零漂不变 | census JSON `driftFraming` 字段 + 本节 |

**EXEC 落卷实测随录（非 REQUEST 漂移·如实记账）**：A2 stub 计数——两文件 `:?` 必填变量并集 **85 distinct**（245 处引用）+ `MEETWISE_HA_WEB_B_HOST_PORT` 显式旋钮 1 枚 = **86 stub**（协调方派单口径 86 由此闭合；proof 按动态枚举实现，计数为读数非判据）。C2 文件名沿派单 `resource-budget.json`（REQUEST §3-C2 原拟名 `connection-budget.json`），形制即 ha-1 同名先例。

## 六、Non-claims

本档 ≠ HA ≠ haStatus 翻转 ≠ HA 簇收口 ≠ 限流已共享化 ≠ PgBouncer 就绪或封死 ≠ RDS/云侧就绪（S15 前置在卷非已证）≠ 预算账 ≤97 = 生产容量绿（sizing≠capacity）。prove EXIT=0 ≠ DONE（claimDone=false · 完成判定走双审+nail）。

## 七、席2 四登记项随 nail 落（post-prove 验收席勘误 · append-only · 不回改 REQUEST/disposition 前卷）

| # | 登记项 | 说明 |
|---|---|---|
| **①** | §三 四消费点引位 `:157/:184/:211/:275` 系 REQUEST 帧位（C1 插行前）；C1 落行后实值 **`:158/:185/:212/:276`**（恰 +1 漂移） | A1/A2 机检断言按落行后实值覆盖 |
| **②** | D2「锚块 `:51-112`」系插入前帧；C1 插行后 `x-ha-cloud-runtime-env` 锚块实至 **`:113`**（次锚 `:115`） | 锚机制传播不受帧位漂移影响·A2 config 渲染实证 |
| **③** | C2 文件名 `resource-budget.json` 偏离 REQUEST §3 拟名 `connection-budget.json` | 已披露在卷（§五 EXEC 落卷实测随录·形制沿 ha-1 同名先例）·不回改 REQUEST |
| **④** | A3 flow 配对按**索引**非按 flow 名：recruiter/SSE 两对值两两相同，行序互换不触发值断言 | 改进建议（按名配对）登记为后刀候选——**非门**·本刀 prove 断言力经席2 变异模拟证实 |
