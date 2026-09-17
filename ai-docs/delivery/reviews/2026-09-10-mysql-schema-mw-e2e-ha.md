# 审查归档 — MySQL schema 骨架 · mw-e2e-ha

**日期**：2026-09-10（PT）  
**结论**：**conditional**  
**releaseEvidence=false** · Not HA · 本绿 ≠ 已迁 / ≠ cutover

## Prove
| CMD | EXIT |
|-----|------|
| `pnpm mysql-schema:skeleton:prove` | **0** |
| compose mysql :33069 healthy | 是 |
| host SELECT 1 / SHOW TABLES | 0；表：`job_queue`, `mw_schema_migrations`, `owner_principal` |

## 文件门
- `packages/db-mysql` + harness `mysql-schema.skeleton.md` + `0001_skeleton.sql` 在
- 无 DROP/TRUNCATE；PG migrations 仍在；`principal.ts` 无 diff 仍含 RLS

## conditional 原因
- 同工作区 `packages/db` 有 **additive 旁路**（tenant 导出 / Redis wakeup）——「零碰 packages/db」不成立
- 「未弱化 RLS」抽查 **成立**

## 建议 / 门禁
- 空 volume 冷启动再证 migrate
- **勿**把 tenant prove 并入本绿解读
- 旁路变更与 Not HA 须在归档写明（本文）

## Harness
`ai-docs/delivery/harness/mysql-schema.skeleton.md`
