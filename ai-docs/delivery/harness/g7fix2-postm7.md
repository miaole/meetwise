# G7FIX-2 — post-M7 窗截获 + :388 孪生同步复合刀

**状态**：`exec:awaiting_post_prove_dual`（EXEC 已落·run 恰 1 次 EXIT=0 全程绿·三向判读命中臂 1·收据 `ai-docs/delivery/receipts/g7fix2-postm7/`·post-prove 双审归协调方·Ban self-approve）· base = 主线 `1a199e07`（含 G7FIX-1 轮询修复落地）· 分支 `line/g7-postm7` · 立项依据 = G7FIX-1 nail 裁定（臂 2 命中红移 post-M7 窗+席2 新证 :388 孪生未同步）。

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

## 6. EXEC 记录（2026-10-08 · 单 attempt · 如实）

- **Coding 面**：`e2e/full.e2e.ts` numstat **+8/−2（churn 10 ≤ 15）**=6 净插入（1 marker+5 NDJSON 截获）+2 原位改（:388 断言行+label）· 零产品码·零 helpers/wrapper/守卫触碰 · esbuild transform + node --check(transformed) + static guards 三门 EXIT=0（G7P-5 erratum-1 真门兑现）· 守卫插曲：a4 截获行初置 `if` 内破 `scoreless_bound_null_score` 钉形态 → 移至 `if` 前（语义等价·守卫零触碰）复检全绿后开跑。
- **判读 run 恰 1 次**：`pnpm e2e:isolated` **EXIT=0** · WALL=76s · outcome=passed · 75 断言 · 19 review codes 末位 M7 · 容器 `meetwise-e2e-82186-1791486296707` 随 run 拆除零残留 · sourceDigests `e2e/full.e2e.ts`=`sha256:c74cecd3…` 与工作区亲证一致。
- **NDJSON 8 行（bootId=82674）**：五断言窗逐面读数全绿——`postm7_a2_provenance` identities=4 vs questions=2+clarifications=2（席2 算术在 vivo·旧形态 4===2 恒 False 构造级证明在卷·boundLoop 本 run 实发 2 澄清恰解释缺陷偶发性）· :400 可信无分 score=null 零 0 分伪造 · :405 重试新 attempt。无窗内红·无窗前红·无 thrown 行。
- **sidecar v3**（修复版新工件·g7fix1 收据零改）：correlation **match=true 家族首次**（152 + `/^0151(_|$)/` 锚定前缀 + 剥 `.sql` 归一·G7FIX-1 自弃同值 `0151_pgp_sym_encrypt_grant` 修复定谳）· 58 poll 全 ok · N=21（16 succeeded+5 failed）≤25·链账 0+0+14+21=35 ≤ 帽 200。
- **三向判读：命中臂 1（:388 修复后绿全程）**——trio 全景与 `:107` 收口材料裁权归协调方（非自批）。席2 advisory 落字：else 面 :407-:408 显式分支本 run 未执行（scorelessBound=true 路径·该面零处置留另刀域）；窗前红具名条款未触发（零窗前红）。
- 裸 stdout 死信四证：wrapper 19 行零 `[g7fix2]` marker（NDJSON 面唯一可靠截获面·判别数据全量自 NDJSON 归档·无判读损失）。
- pins 十值照抄：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null。Key name-only · `.env*` ABSENT。
