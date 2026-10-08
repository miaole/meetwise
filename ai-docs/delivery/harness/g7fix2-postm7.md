# G7FIX-2 — post-M7 窗截获 + :388 孪生同步复合刀

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `1a199e07`（含 G7FIX-1 轮询修复落地）· 分支 `line/g7-postm7` · 立项依据 = G7FIX-1 nail 裁定（臂 2 命中红移 post-M7 窗+席2 新证 :388 孪生未同步）。

## 1. 三件套
1. **post-M7 窗 NDJSON 截获**（现树坐标 :387-:405·席1 勘误为准——非收据误标 :387-:405/:400-:418）：五断言逐断言前插 NDJSON 记录（G7P-4/5 常驻模式·step=assert 名·≤10 行）；甄别五候选（questions/turns、出处审查 :388、finalize outcome、candidates 可信无分、显式重试新 attempt）。
2. **:388 boundLoop 孪生同步**（席2 新证·机制缺陷）：`identities.length === boundLoop.questions` → 同步 1789e321 修法（`questions + clarifications` 或对称比较 question_ready 子集·沿 mainLoop :206 已修形态）——**Ban 为绿改断言**红线：恒 False 由构造算术证明=语义纠非避红（沿 C-MO-P3 刀域裁定）·provenance 反伪造功能零弱化。
3. **sidecar correlation 前缀匹配修复**（硬 pin 二连系统性 fix）：expectedMax 硬 pin → 归一后 startsWith 前缀匹配（G7P-5/G7FIX-1 两刀同坑）。
4. 恰 1 run：`pnpm e2e:isolated`（sidecar v2·est ≤25 含 boundLoop·链账起算）。

## 2. 判读（预注册）
- **:388 修复后绿全程** ⇒ G7 旅程 CMD1 首绿在望 ⇒ trio 全景+`:107` 收口；
- **红于其他候选**（capture 甄别）⇒ 该断言定靶另刀；
- **红仍于此窗且无 capture 异常** ⇒ 如实登记再探。
三向如实禁洗绿禁重跑至绿。

## 3. Ban
零产品码（apps/packages src 零改）·full.e2e.ts 改动仅截获面+:388 孪生+marker（≤15 行）·sidecar 脚本仅 correlation 匹配面·helpers/wrapper/解析器零触碰·禁松 provenance 门（rejectForgedProgressScores/identity 签发零弱化）·Key name-only·est live ≤25 链账·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual。

## 4. 验收
diff 行数亲证+恰 1 run+NDJSON/sidecar 收据+三向判读+收据 `ai-docs/delivery/receipts/g7fix2-postm7/`·node --check（esbuild 真门）·static guards EXIT=0。

## 5. Non-claims
本刀 ≠ G7 收官 ≠ g7SuiteGreen 翻转 ≠ :107 关闭（SSOT 刀归协调方）·若 :388 坐实则 C-MO-P3 收口材料完备。
