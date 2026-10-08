# Task SOP · 质量优先重构计划（用户直裁 2026-10-08：优化完再搞新需求）

> 规则：本 SOP 生效期间**冻结新功能刀**（在飞功能线收尾到 nail 为止、不再新开）；所有刀走 loop §3 全链（REQUEST→双审→EXEC→post-dual→nail），每刀 prove 必须对表 `NEXT-NODE-BEST-PRACTICES.md`（硬规则 11）。

## Wave 1 · P0 真 bug 与仪器（先行·1-2 天）
1. BUG-E2E-FAILUNIMPORT：full.e2e.ts:205 补 import（CMOP03-F EXEC 后落·独立最小刀）+ e2e tsc --noEmit 门（C2）
2. CMOP03-F finer markers→POST7B 定位→修复刀→trio 再跑→g7SuiteGreen SSOT 刀（三绿收官）
3. SSE-PUSH：2s 轮询→LISTEN/NOTIFY（B6 违规清零）

## Wave 2 · DB P0 债（3-5 天·每刀一行）
4. GAP-DEBT-DB-TRIGFAM：触发器函数族收敛（单一真相源+ALTER 演进）
5. GAP-DEBT-DB-NOFK：interview 复合 FK 渐进补齐（擦除机器减半）
6. GAP-DEBT-DB-SRCBOILER：runAs() 收敛 14 份样板 + 多态 job 表 + withSavepoint
7. GAP-DEBT-BE-R4SCRIPTS：r4-* 7163 行迁出生产包（并入 DIR-1 批次）

## Wave 3 · P1 结构债（并行多刀·5-8 天）
8. DBID-1（uuidv7，REQUEST 已落地待双审）｜TOKSTREAM（token 流式 UX）
9. GAP-DEBT-DB-MONEY3（钱三轨+CHECK）｜GAP-DEBT-DB-HYGIENE（死表/sql/双真相/分区）
10. GAP-DEBT-BE-GODFN（invoke 拆解/G7 卫兵出运行时/AppError 统一）
11. GAP-DEBT-FE-TYPESHARE + GAP-DEBT-TEST-BOILER + DIR-1 目录重构收尾
12. C1 lint 门禁上线（eslint9+tsc CI 含 e2e/）

## Wave 4 · 验收与解冻
13. 全台账行清零复查 → BEST-PRACTICES 表全 ✅ → trio 三绿 → 解冻新需求（INT-TRANSCRIPT-01 等用户闸项仍等用户）

**每刀验收**：prove EXIT=0 收据 + 双域双审 BOTH PASS + 对表勾销对应违规项 + 台账行 CLOSED。解冻条件=Wave 1-3 全 nail 且 P0 清零。
