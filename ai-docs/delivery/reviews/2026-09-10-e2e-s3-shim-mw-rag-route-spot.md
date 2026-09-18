# Adversarial spot — E2E S3 shim（第二域 · mw-rag-route）

**专家**：mw-rag-route（对抗 spot；主审 mw-e2e-ha）  
**日期**：2026-09-10（PT）  
**结论**：**conditional**（取更严）  
**releaseEvidence=false** · Not HA · 未把 R5/rag **升 LIVE**；有车道 API 诚实缺口

## 对照

- `harness/e2e-directory-s3-shim.md`
- `scripts/isolated/{run-isolated,targets-live-e2e,targets-domain-prove}.mjs`
- S1 whitelist / S2 contract
- 代码：`LIVE_E2E_TARGETS` 仍三元；无 `scripts/conn-stack/`

## 焦点核实

| 焦点 | 结果 |
|------|------|
| shim 是否把 prove-shell / R5 误升 LIVE | **否**。`LIVE_E2E_PRIMARY`/`LIVE_E2E_TARGET_LIST` 仅 e2e:prove · performance:e2e · e2e:ui；无 vectorstore/rag*/memory |
| mysql-stack 仍 conn-only（≠ LIVE） | **部分**。`isConnOnlyTarget` 正确；**但** `isProveShellTarget('mysql-stack:…') === true`（仅 `!isLive`），可把 conn-only **误标 prove-shell** |
| UI secondary | **通过**。`LIVE_OPTIONAL_UI=['e2e:ui']`；primary 不含 UI；Set 未缩 |

## 条件（关闭 conditional → pass）

1. 修正 `isProveShellTarget`：`!isLiveE2eTarget(t) && !isConnOnlyTarget(t)`（或等价），并加最小静态断言：mysql-stack ∉ prove-shell、∉ LIVE。  
2. 文档一句钉死：调用方不得把 `isProveShellTarget` 绿写成 conn-only covered（在修 API 前亦须）。

## 已通过（不因 conditional 抹掉）

- 薄 forward；`pnpm e2e:isolated` 仍指 legacy runner  
- 未缩小 LIVE Set；未偷跑 S4  
- R5 banner：默认 pgvector ≠ sole-stack（run-isolated 头注释）

## 非宣称

不以 shim 绿宣称 LIVE covered / R5 已关 / RAG 已迁。
