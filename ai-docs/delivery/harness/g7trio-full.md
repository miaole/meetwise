# G7TRIO — trio 全景再跑刀（G7 修复后三绿判定）

**状态**：`exec:awaiting_post_prove_dual`（EXEC 已落 · REQUEST `692e8286` 授权 · 三 CMD 各恰 1 run·EXIT 原值 1/0/1＝1 绿/2 红·非三绿候选·收据 `ai-docs/delivery/receipts/g7trio-full/00-exec-receipt.md`·post-prove 双审归协调方派）· base = 主线 `933a48ef` · 分支 `line/g7-trio-full` · 立项依据 = G7FIX-2 nail 裁定（CMD1 主旅程 HTTP 面首次全绿+席2 trio 向成立·预算 ~154<200 帽）。

## 1. 手段
恰 3 run（每键恰一次·零重跑至绿）：
1. `pnpm e2e:isolated`（CMD1·预期绿——G7FIX-2 同 driver 已 EXIT=0/75 断言现形）；
2. `pnpm e2e:ui:isolated`（CMD2·UI 面·G7U 自带轮询·G7V-CALIB 绿先例·历史红=web build 相位——GODFN-1b 后 web 构建面核）；
3. `pnpm verify:e2e-performance`（CMD3·HTTP 步继承 full.e2e.ts 绿+性能套件段）。
每 run sidecar v3 实测臂（correlation 锚定 /^0152(_|$)/ 若新迁移落·沿 G7FIX-2 修复形态）。

## 2. 预注册判读
- **三绿** ⇒ G7 三绿线收官成立 ⇒ `g7SuiteGreen` SSOT 刀（收官翻转·独立 REQUEST 全链·协调方 AUTHORIZE）；
- **CMD1 绿+CMD2/3 红** ⇒ 红因分层（UI 构建面/性能套件面）⇒ 各自定靶刀；
- **CMD1 红** ⇒ G7FIX-2 绿不可复现 ⇒ 如实登记（单 run 限定语兑现风险）⇒ 再探。
三向如实禁洗绿禁重跑至绿。

## 3. Ban
零产品码·零脚本改（sidecar v3 复用 G7FIX-2 版·仅 correlation 预算值随迁移面更新）·helpers/wrapper/解析器零触碰·Key name-only·est：CMD1 ≤25+CMD2 ≤30+CMD3 ≤64 追加·链累计 ~154<200 硬帽·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual。

## 4. 验收
3 run EXIT 原值+逐键 sidecar 收据+三向判读+收据 `ai-docs/delivery/receipts/g7trio-full/`·node --check（esbuild）·static guards EXIT=0。

## 5. Non-claims
本刀 ≠ g7SuiteGreen 翻转（三绿⇒SSOT 刀另立）≠ `:107` 关闭（SSOT 刀裁定）≠ HA/releaseEvidence 任何面·CMD1 单键绿（G7FIX-2）与本刀全景绿系两独立面。

## 6. EXEC 措辞注记（协调方授权两处 · 上文 §1-§5 原文零改写 · append-only）

- **注记①（锚 §1 CMD2 行「历史红=web build 相位——GODFN-1b 后 web 构建面核」）**：历史红措辞校准——G7 系 trio 历史红的实际红因为 **db gate/test failed**（G7Y era CMD3 套件红于 HTTP full E2E 步 class=api·web build 该 era 绿 27056ms；web build 相位红仅 GODFN-1b era 在卷）；本刀实跑本 HEAD 下 web build 两 run 皆绿（CMD2 现场 build + CMD3 步 1 EXIT=0）·「web 构建面核」未兑现为红面·历史红零冲销 retained。
- **注记②（锚 §2 臂 2「红因分层（UI 构建面/性能套件面）」）**：分层靶面按 EXEC 校准细化为**构建相位 / R5-legacy / 测试相位三靶**——本刀实跑落定：构建相位绿（CMD2 build + CMD3 步 1 EXIT=0）· R5-legacy 靶 not_run 零行使（CMD3 步 14/19-23 未达）· 实际红面=测试相位（CMD1 独跑 `class=api` journey 前段 + CMD3 步 10 `neg:all` consume 族 7 FAIL）。「历史红=web build」的既有措辞不再指向本刀任何实跑红面。
