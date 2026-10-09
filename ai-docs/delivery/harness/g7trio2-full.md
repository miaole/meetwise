# G7TRIO-2 — trio 全景重跑刀（G7 三级间歇红全部修复后三绿判定）

**状态**：`draft_rev2:awaiting_pre_exec_dual`（rev2 席2 FAIL 一行修：增第六向 CMD3 步 1-9 红承接·消判读真空） · base = 主线 `2fab7946`（含 G7FIX-1 轮询+G7FIX-2 孪生同步+G7FIX-4 对称标记+G7FIX-5 臂回改全链修复）· 分支 `line/g7-trio2-full` · 立项依据 = G7FIX-5 nail（CMD1 首次 EXIT=0 全绿）+ G7TRIO 席2 trio 就绪度终评（臂回改=唯一阻塞·已落地）。

## 1. 手段
恰 3 run（每键恰一次·零重跑至绿）：
1. `pnpm e2e:isolated`（CMD1·**预期绿**——G7FIX-5 同 driver 已 EXIT=0/74 断言+G7FIX-4 产品面对称标记+G7FIX-1 route 轮询在树）；
2. `pnpm e2e:ui:isolated`（CMD2·预期绿——G7U 自带轮询·G7V-CALIB 绿先例·G7TRIO 已绿 24 tests 14P/0F/10S）；
3. `pnpm verify:e2e-performance`（CMD3·步 1-9 全绿已证·**步 10 neg:all 已由 NEGCOMM-1 解锁**·步 11-27 含 6 LEGACY/R5 步如实登记）。
每 run sidecar v3 实测臂（correlation 锚 ^0151·沿 G7TRIO 修正形态）。

## 2. 预注册判读
- **三绿（EXIT=0×3）** ⇒ G7 三绿线收官成立 ⇒ `g7SuiteGreen` SSOT 刀（独立 REQUEST·协调方 AUTHORIZE·翻 `g7SuiteGreen=true`）；
- **CMD1 绿+CMD2 绿+CMD3 步 10 绿但步 11-27 有红** ⇒ R5/LEGACY 六步域如实登记（预存红 retained·不阻 CMD3 步 10 解锁判定）；
- **CMD1 红** ⇒ G7FIX-5 单 run 绿限定语兑现风险（间歇面复发）⇒ 如实登记再探；
- **CMD2 红** ⇒ UI 面新问题⇒ 定靶另刀；
- **CMD3 步 10 红** ⇒ NEGCOMM-1 修复面问题⇒ 定靶另刀。
- **CMD3 步 1-9 红**（席2 补·G7Y era CMD3 红于 HTTP 步史证可达）⇒ 新间歇面（非步 10 非 LEGACY 域）⇒ 如实登记·定靶另刀·已绿键读数照常入账。
六向如实禁洗绿禁重跑至绿。

## 3. Ban
零产品码·零脚本改（sidecar v3 原样·correlation ^0151·本刀零迁移）·helpers/wrapper/解析器零触碰·Key name-only·est：CMD1 ≤25+CMD2 ≤30+CMD3 ≤64·链累计 166+119=285…**超硬帽 200**——**协调方裁帽提升至 300**（本刀 REQUEST 前置申请：三绿收官必需全景重跑·增量 119 为终态验证必需成本·非 retry-to-green·每键恰一次）·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual。

## 4. 验收
3 run EXIT 原值+逐键 sidecar 收据+五向判读+skip/marked-red 台账+收据 `ai-docs/delivery/receipts/g7trio2-full/`·node --check（esbuild）·static guards EXIT=0。

## 5. Non-claims
本刀 ≠ g7SuiteGreen 翻转（三绿⇒SSOT 刀另立·协调方 AUTHORIZE）≠ `:107` 关闭 ≠ HA/releaseEvidence 面·CMD3 步 11-27 LEGACY/R5 六步如实登记非本刀域。
