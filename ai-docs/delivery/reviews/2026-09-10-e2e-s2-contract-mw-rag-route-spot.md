# Adversarial spot — E2E S2 contract（第二域 · mw-rag-route）

**专家**：mw-rag-route（对抗 spot；主审 mw-e2e-ha）  
**日期**：2026-09-10（PT）  
**结论**：**pass**  
**releaseEvidence=false** · Not HA · 与 S1 whitelist **一致** · 本审未与 e2e 取更严冲突

## 对照

- `harness/e2e-directory-s2-contract.md`
- `testing/conventions/e2e-directory-contract.md`（S2 扩容）
- `delivery/e2e-live-targets-whitelist.md`（S1）
- `scripts/e2e-platform/directory-contract.mjs`（REQUIRED_CONTRACT_DOC_PINS / FUTURE_*）

## 焦点核实

| 焦点 | 结果 |
|------|------|
| R5 / 假绿不得升 LIVE | **通过**。契约钉 BUG-FAKE-R5；prove-shell 含 rag/memory/…；明确 ≠ LIVE covered；禁止域 prove 升格 LIVE |
| mysql-stack 禁 LIVE | **通过**。conn-only = 全部 `mysql-stack:*`；永不 covered；BUG-FAKE-CONN；mjs 禁 LIVE+mysql-stack 并列表述 |
| 与 S1 whitelist 一致 | **通过**。显式 cite `e2e-live-targets-whitelist.md`；三车道对齐 §1/§2/§3 |
| 非 UI 为主 | **通过**。HTTP/SSE primary；UI secondary / LIVE_OPTIONAL_UI |

## nit（不降级）

- LIVE `*:isolated` 包装仍吃默认 pgvector（BUG-FAKE-R5）— 契约已写 green-risk；与 S1 spot 同 nit。
- FUTURE `scripts/isolated/` / `conn-stack/` 仅叙述；目录尚未建（符合 S2 不偷跑 S3/S4）。

## 非宣称

不改 `LIVE_E2E_TARGETS`；不以本 spot 顶替 e2e 主审；不宣称 R5 已关 / RAG 已迁。
