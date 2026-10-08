# GODFN-1b — G7 卫兵移组合根 EXEC 刀（按已 nail 设计执行）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `16b40f0d` · 分支 `line/godfn-1b-g7guard` · 蓝本 = **已 nail 设计** `ai-docs/delivery/harness/godfn-decompose.md` @37705a3e（§5.2 1b 清单+§5.2b r4 读者名单补引+§2.2 env 澄清+§7.3 条款）——薄壳零重议。

## 1. 范围（照设计 §5.2 1b 行）
G7 freetier reprove 卫兵从散读点（model-client.ts :220/:347/:376 直读 process.env·context-budget.ts :281）移至组合根（apps/api/src/main.ts:2 + apps/worker/src/main.ts:9 无条件 import 单读点注入）——语义零变（=1 判定钉写设计 §2.2 冻结）·`g7-outbound-interceptor.ts :79` 收注入 env 参数形态保形。

## 2. prove 面（照设计 §5.2）
voice 族 7 键+embedder/reranker 触面 2 键+model-client 族 4 键+context-budget+r4 族 36 键（**抽样条款：抽样面 EXEC 前协调方+双审裁·须含 product-close 与 live-pg 位点**）+e2e trio 三键。§5.2b main.ts 读者名单（r4-eg3-product-evidence 经传递/funnel-batch1-4/r4-pr1b）必看。

## 3. 硬约束
①卫兵语义零变（判定时机/值语义=设计 §2.2 `=1` 钉写）；②§7.3：**1b×1d 同文件两处亲钉（voice.ts/model-client.ts）——本刀先于 1d**·禁与 1d 并行 EXEC；③prove 全键 EXIT=0（attempts 全账非 retry-to-green）；④零迁移/零 SSOT/零 G7 判定面变更；⑤pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）+设计 §4 r1Closed=false；⑥作者 mw-core@meetwise.local；⑦不自批 alone≠dual；⑧est live ≤25/run·链记账·Key name-only。

## 4. 验收
diff 面（仅卫兵移动面文件）+prove 全键 EXIT=0+attempts 台账+收据 `ai-docs/delivery/receipts/godfn-1b/`·push 后 STOP awaiting_post_prove_dual。
