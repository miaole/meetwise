# Harness — tenant 强制雏形（additive）

**releaseEvidence=false** · **Not HA** · 不宣称 controlPlaneClosed · **本绿 ≠ 已迁 / ≠ cutover**  
**硬约束**：不删/不弱化 RLS、`principal.ts` `set_config`、FORCE policies。应用层 tenant ≠ RLS。

## 前置
- 仓库 checkout；`pnpm` 可用
- 不要求 MySQL/Qdrant；不要求隐私 prove 已绿

## 命令与期望 EXIT
| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm --filter @meetwise/db tenant-enforcement:prove` | **0** | missing/blank owner fail-closed；mismatch throw；静态钉 `asPrincipal`+`set_config` 仍在 |

## 非目标
- 不切流、不放弃 RLS 真相、不宣称授权根已迁 MySQL

## 审查
- 专家：`mw-privacy-int`；结论须另文落入 `ai-docs/delivery/reviews/`（禁止只留聊天）
