# GODFN-1c — interview.service 拆解 EXEC 刀（按已 nail 设计执行）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `16b40f0d` · 分支 `line/godfn-1c-interview-svc` · 蓝本 = **已 nail 设计** `ai-docs/delivery/harness/godfn-decompose.md` @37705a3e（§5.3 1c 清单·roster 六守卫 :103/:118/:129/:156/:164/:178 零触碰）。

## 1. 范围（照设计 §5.3 1c 行）
拆解 apps/api/src/modules/interview/interview.service.ts 巨类/巨函数——roster 六守卫语义零弱化（publicPreview 面/answerLedger/privacy guard 全保形）·prove 面按 §5.3：interview uc/neg 十键（uc002/uc004/uc011/uc018/uc025+neg:interview）+worker 四 consumer 键+payment 键。

## 2. 硬约束
①纯机械拆解语义等价（守卫/事务边界/RLS 上下文零变更）；②prove 十+键全绿（attempts 全账非 retry-to-green）；③零迁移/零 SSOT/零 G7 面；④pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）；⑤作者 mw-core@meetwise.local；⑥不自批 alone≠dual；⑦est：prove 本地+触面 live ≤25/run；⑧Key name-only。

## 3. 验收
diff 面清单+prove 全键 EXIT=0 收据+attempts 台账+收据 `ai-docs/delivery/receipts/godfn-1c/`·push 后 STOP awaiting_post_prove_dual。
