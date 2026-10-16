# GODFN-1d — AppError 统一 EXEC 刀（按已 nail 设计执行）

**状态**：**`exec:awaiting_post_prove_dual`**（EXEC 完成收据 `receipts/godfn-decompose/1d/2026-10-07-exec-receipt.md` · 2026-10-07 · worktree 已 rebase 至含 1c 主线 493fc3b8·REQUEST rev2 落 86627721 · 30 处 catch(:any) 消零·g7 车道字节冻结零 diff · prove §5.4 全键 32 EXIT=0 + 6 base≡red（签名级 IDENTICAL·base≡red 全账·Ban 洗红）· est live 模型调用=0 · 勘误落账：1c EXEC 哈希误引 6f7e13cb 实为 **bbf9a962**·五 catch 现树位 :157/:305/:501+:30/:73 复测守恒） · ~~`draft_rev2:awaiting_pre_exec_dual`~~ · base = **主线 rev2 时点 tip（1a/1b/1c 全落地·§7.3 串行全兑现：1a ab447228→1b 6aa24486→1c 493fc3b8 均主线祖先）**——**worktree 须 rebase/cherry-pick 至含 1c 的主线**（interview.service 五 catch 位现树行号随 1c 拆解漂移·EXEC 期亲测重列）· 分支 `line/godfn-1d-apperror` · 蓝本 = **已 nail 设计** `ai-docs/delivery/harness/godfn-decompose.md` @37705a3e（§5.4 1d 清单+§7.3 同文件条款〔1b 已落·本刀后行合规〕+§2.4 1d-consumers.md EXEC 前置交付物〔已落 `receipts/godfn-decompose/1d-consumers.md`〕）。

## 1. 范围（照设计 §5.4 1d 行）【rev2·席2 FAIL 三处方落实】
AppError/message 轨判定统一至单一错误分类面（设计 §1 #9 形态）——**位点清单按 tip 亲测重列（禁抄设计纪元 :9028eb70 行号·1b/1c 后已漂移）**：
- **g7 车道豁免（席2 处方①·红线裁定）**：`model-client.ts:508/:520`（1b 后现树·设计纪元 :505/:517）两位点**字节冻结**——只许 catch 型 any→unknown 收窄·**保持 message 轨判定原样**（换判定通道须重编 g7_ 族 ~27 抛点撞设计 §2.4 Ban+§3③ 零 G7 判定面——**豁免条款**）；补 §5.2 g7 家族 prove 交叉引用。
- **清单补全（席2 处方②）**：breaker.ts:122（精确等·禁前缀化——保 model_circuit_half_open 不匹配近邻变体 :85）·interview-consumer.ts:83（三属性 reason||code&&status）·payment.ts:76/:119（23505 否定式+savepoint·禁吞 PG 错误身份）·interview.service 五 catch 现树行号·voice.ts :453 **惰性位点**（:454 无条件 throw——等价论证须证惰性保持禁顺手修活）·cloud 双轨。
- **1d-consumers.md 前置交付**（设计 §2.4）：按 tip 亲测行号全列（30 处/18 文件+上述补全点）+13 处 `e?.code` 零行为变负测面+neg:auth/commerce/resume/input/all 五键补入。

## 2. prove 面（照设计 §5.4 1d 行）
interview uc/neg 十键（uc002/uc004/uc011/uc018/uc025+neg:interview）+invoke 触面五键（invoke.ts:200 half-open 判定）+voice 触面七键（voice.ts:453）+cloud 触面五键（cloud-smoke-fc.ts:79/:96·cloud-readiness.ts:281-289）+worker 四 consumer+payment 键——**或 base 同红零回归**（预存红 base≡red 全账·沿设计 §5 门与 E5 惯例·Ban 洗红）。

## 3. 硬约束
①错误分类语义零变（判定结果/映射面等价·仅形态统一）；②§7.3 串行兑现（1b 已落地本刀后行）；③零迁移/零 SSOT/零 G7 判定面（**g7 车道字节冻结豁免**·上）；④pins 十一值照抄设计 §4（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null；⑤作者 mw-core@meetwise.local；⑥不自批 alone≠dual；⑦est live ≤25/run 链记账；⑧Key name-only。

## 4. 验收
1d-consumers.md 行级清单+diff 面清单+prove 全键终态+attempts 台账+收据 `ai-docs/delivery/receipts/godfn-decompose/1d/`·push 后 STOP awaiting_post_prove_dual。
