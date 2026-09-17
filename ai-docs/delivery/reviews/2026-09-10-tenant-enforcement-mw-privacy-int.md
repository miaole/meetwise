# 审查归档 — tenant 强制雏形 · mw-privacy-int

**日期**：2026-09-10（PT）  
**切片**：`packages/db/src/tenant/` + `tenant-enforcement:prove`  
**专家**：mw-privacy-int  
**结论**：**conditional**  
**releaseEvidence=false** · Not HA · 不宣称 controlPlaneClosed · 不放开 DELETE

## Prove 证据
| CMD | EXIT |
|-----|------|
| `pnpm --filter @meetwise/db tenant-enforcement:prove` | **0** |
| `git diff HEAD -- packages/db/src/principal.ts` | 空 |
| `packages/db/migrations` 脏 | 无 |

## 允许
- 合入本 **additive** 原型 + prove（实现方 **不自批切流**）。

## 仍挡 / 条件（切流门）
1. **切流 / 放弃 RLS 仍 block** — 本 prove ≠ issuer/lease GUC/FORCE 等价；ADR 隐私清单 prove 未绿不得 cutover。
2. **禁止**把 helpers 接到会去掉 `set_config` / 绕开 `asPrincipal` 的生产路径；接线 PR 须另审。
3. 「MySQL+Qdrant+Redis sole stack」= **架构**唯一真相，**≠ 运行时授权根已迁**；运行时仍须 PG RLS 为真相直至 prove+专家审。

## 非阻塞
- optional PG 无库 skip 可接受；本切片未改 migrations。

## Harness
见 `ai-docs/delivery/harness/tenant-enforcement.prototype.md`。
