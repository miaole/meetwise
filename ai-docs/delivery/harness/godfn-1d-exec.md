# GODFN-1d — AppError 统一 EXEC 刀（按已 nail 设计执行）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `6aa24486`（含 1a/1b 落地·§7.3 串行前半已兑现）· 分支 `line/godfn-1d-apperror` · 蓝本 = **已 nail 设计** `ai-docs/delivery/harness/godfn-decompose.md` @37705a3e（§5.4 1d 清单+§7.3 同文件条款〔1b 已落·本刀后行合规〕+§2.4 1d-consumers.md EXEC 前置交付物）。

## 1. 范围（照设计 §5.4 1d 行）
AppError/message 轨判定统一：voice.ts :453（asr_malformed）·model-client.ts :517（startsWith('g7_')）·model-client.ts :505（第二 g7_ 位点·GODFN 设计定稿 nail 登记）·interview.service.ts 5 处 catch(:any)（:184/:346/:484/:540/:591）·cloud-smoke-fc.ts :79/:96（cloud_smoke_fc_）·cloud-readiness.ts :281-289（message 轨+code 轨双轨收敛目标）等设计列明位点——统一至单一错误分类面（设计 §1 #9 形态）。**EXEC 前置交付**：`1d-consumers.md` 行级清单（设计 §2.4 钉·含席1 GODFN nail 登记 model-client.ts:505）。

## 2. prove 面（照设计 §5.4 1d 行）
interview uc/neg 十键（uc002/uc004/uc011/uc018/uc025+neg:interview）+invoke 触面五键（invoke.ts:200 half-open 判定）+voice 触面七键（voice.ts:453）+cloud 触面五键（cloud-smoke-fc.ts:79/:96·cloud-readiness.ts:281-289）+worker 四 consumer+payment 键——**或 base 同红零回归**（预存红 base≡red 全账·沿设计 §5 门与 E5 惯例·Ban 洗红）。

## 3. 硬约束
①错误分类语义零变（判定结果/映射面等价·仅形态统一）；②§7.3 串行兑现（1b 已落地本刀后行）；③零迁移/零 SSOT/零 G7 判定面；④pins 十一值照抄设计 §4（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null；⑤作者 mw-core@meetwise.local；⑥不自批 alone≠dual；⑦est live ≤25/run 链记账；⑧Key name-only。

## 4. 验收
1d-consumers.md 行级清单+diff 面清单+prove 全键终态+attempts 台账+收据 `ai-docs/delivery/receipts/godfn-decompose/1d/`·push 后 STOP awaiting_post_prove_dual。
