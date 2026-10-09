# G7TRIO-2 — trio 全景重跑刀（G7 三级间歇红全部修复后三绿判定）

**状态**：`exec:awaiting_post_prove_dual`（EXEC 已落 mw-core · 恰 3 run attempts 1,1,1 · EXIT 原值 **CMD1=0 / CMD2=0 / CMD3=1**＝2 绿/1 红·非三绿候选·六向判读命中**第五向（CMD3 步 10 红）**·红 locus=`neg:resume` 12/87（consume 族 12/12 全 PASS·NEGCOMM-1 靶兑现·locus 移位）·步 11-27 not_run·收据 `ai-docs/delivery/receipts/g7trio2-full/00-exec-receipt.md`·post-prove 双审归协调方派·下方 §1-§5 蓝本原文零改写·EXEC 注记见文末 §6） · base = 主线 `2fab7946`（含 G7FIX-1 轮询+G7FIX-2 孪生同步+G7FIX-4 对称标记+G7FIX-5 臂回改全链修复）· 分支 `line/g7-trio2-full` · 立项依据 = G7FIX-5 nail（CMD1 首次 EXIT=0 全绿）+ G7TRIO 席2 trio 就绪度终评（臂回改=唯一阻塞·已落地）。

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

## 6. EXEC 注记（本刀落卷 · 上文 §1-§5 蓝本原文零改写 · append-only）

- **注记（锚 §2 六向 + §1 CMD3 行）**：EXEC HEAD=`c76cad4b`（=REQUEST rev2 亲证）· 恰 3 run attempts 1,1,1 · EXIT 原值 **0/0/1** · 六向落桶=**第五向（CMD3 步 10 红）**——但红 locus 与 G7TRIO era 移位：NEGCOMM-1 解锁靶 **consume 族本 run 12/12 全 PASS**（neg:commerce 84 条全绿），步 10 实红于 **`neg:resume` 12/87**（图片同意门 ×2 + DELETE/privacy-erasure 族 ×10·与 pins「公开 DELETE=503 fail-closed」可能存在契约形状分歧·定谳归协调方）· 步 11-27 not_run（LEGACY/R5 六步零行使 retained）· CMD1/CMD2 各自绿（75 断言四元组兑现 / 14P-0F-10S 基线同形）· 链累计 166+88=254 ≤ 裁帽 300 · sidecar v3 原样 correlation ^0151 match · `g7SuiteGreen=false` 零翻转 · §2 第二向/第三向/第四向/第六向均未命中如实记 · 详证 `ai-docs/delivery/receipts/g7trio2-full/00-exec-receipt.md` · `exec:awaiting_post_prove_dual` · Ban self-approve · 席 mw-core。
