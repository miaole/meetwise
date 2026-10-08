# ANNOT-1 · 02 · blob 链前后全等机检（base `6006d2e8` → EXEC 树）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 机检 1 · 产品面恰一文件变更（`git diff --name-status 6006d2e8 -- apps packages e2e docker scripts` 原值输出）

```
M	apps/web/app/jobs/page.tsx
```

→ 产品面（apps/packages/e2e/docker/scripts 全部 tracked blob）与 base 全等，**唯一例外 = `apps/web/app/jobs/page.tsx`**；`view-model.ts` / `interview-state.ts` / `adaptive-lifecycle.ts` / `commerce.ts` / `recruiter.ts` / spec / proof 族零 diff（Ban 面全数兑现）。

## 机检 2 · page.tsx blob 链（`git rev-parse` / `git hash-object` 原值输出）

```
before: 6912cd61015115cebab94ce43565d2784e21d3d9   (= REQUEST 码面锚 blob · base 6006d2e8)
after:  490f231d148780adf9ba546c5a5d0574207952ef   (= EXEC 改写后)
```

## 机检 3 · 改写幅面（`git diff --stat` 原值输出）

```
 apps/web/app/jobs/page.tsx | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
```

→ 恰 2 行注释 in-place（2→2 零行移位），无第 3 行增删。
