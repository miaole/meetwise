# ANNOT-1 · 00 · 前后注释 diff（改写前 verbatim → 改写后 verbatim）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 改写前（base `6006d2e8` · blob `6912cd61015115cebab94ce43565d2784e21d3d9` · jobs/page.tsx:110-111）

```tsx
            // `assessment_unavailable` 是无可信分数且已退款的可恢复终态；重试必须显式由
            // 用户发起，服务端会创建新的 attempt，不会复活或覆盖旧会话。
```

## 改写后（EXEC · blob `490f231d148780adf9ba546c5a5d0574207952ef` · jobs/page.tsx:110-111 · 恰按 REQUEST §3 处方）

```tsx
            // `assessment_unavailable` 是无可信分数的可恢复终态；额度处理以结算事件为准：
            // evaluation_unscored=预留已释放，no_eligible_scored_answer=已扣费结算（不释放）。重试必须显式由用户发起，服务端会创建新的 attempt，不会复活或覆盖旧会话。
```

## unified diff（`git diff 6006d2e8 -- apps/web/app/jobs/page.tsx` 原值）

```diff
diff --git a/apps/web/app/jobs/page.tsx b/apps/web/app/jobs/page.tsx
index 6912cd61..490f231d 100644
--- a/apps/web/app/jobs/page.tsx
+++ b/apps/web/app/jobs/page.tsx
@@ -107,8 +107,8 @@ export default async function JobsPage({ searchParams }: { searchParams: Promise
           ) : appsWin.shown.map((app) => {
             const st = STATUS_LABEL[app.status] ?? { text: '状态未知', variant: 'outline' as const };
             const invited = app.status === 'invited';
-            // `assessment_unavailable` 是无可信分数且已退款的可恢复终态；重试必须显式由
-            // 用户发起，服务端会创建新的 attempt，不会复活或覆盖旧会话。
+            // `assessment_unavailable` 是无可信分数的可恢复终态；额度处理以结算事件为准：
+            // evaluation_unscored=预留已释放，no_eligible_scored_answer=已扣费结算（不释放）。重试必须显式由用户发起，服务端会创建新的 attempt，不会复活或覆盖旧会话。
             const startable = app.status === 'invited' || app.status === 'in_progress' || app.status === 'assessment_unavailable';
             // 申请 score 即使历史非空也不得渲染：校准 hold 下它不是可比较评分。
             const showScore = applicationScoreVisible(app.score);
```

零行移位（2→2 · hunk 上下文行号 107 起未位移）· `:27` STATUS_LABEL 与 `:112` `startable` 及全部渲染字符串零触碰（diff 仅 2+/2- 注释行）。
