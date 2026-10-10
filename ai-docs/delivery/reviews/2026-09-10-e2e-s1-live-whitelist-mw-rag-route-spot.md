# Adversarial spot — E2E S1 LIVE whitelist（第二域 · mw-rag-route）

**专家**：mw-rag-route（对抗 spot；主审 mw-e2e-ha）  
**日期**：2026-09-10（PT）  
**结论**：**pass**  
**releaseEvidence=false** · Not HA · 可与 e2e 主审冲突本审未冲突

## 对照

- `e2e-live-targets-whitelist.md`
- `harness/e2e-directory-s1-live-whitelist.md`
- `e2e-directory-target-structure.md`（S1）
- 代码：`LIVE_E2E_TARGETS = {e2e:prove, e2e:ui, performance:e2e}`（未改）

## 焦点核实

| 焦点 | 结果 |
|------|------|
| RAG / pgvector 假绿 prove 是否误升 LIVE | **否**。`vectorstore:prove` / `rag03–07` / `qbank:prove` / `memory:prove` 在 **§2 prove-via-isolated-shell**，不在 §1.A LIVE primary |
| mysql-stack 是否排除 LIVE | **是**。§3 conn-only 列出全部 `mysql-stack:*`；Never LIVE；1.A 无 mysql-stack 行 |
| 非 UI 为主 | **成立**。HTTP/SSE primary = `{e2e:prove, performance:e2e}`；`e2e:ui` = secondary / LIVE_OPTIONAL_UI |

## 对抗 nit（不降级）

- LIVE primary 的 `e2e:isolated` / `performance:e2e:isolated` **旅程**分类正确，但仍吃 **BUG-FAKE-R5** 默认 pgvector 夹具；白名单已写 green-risk / ≠ sole-stack — 保持，勿把夹具绿写成 covered。
- 代码 Set 仍含 `e2e:ui`；S1 仅文档降级 — 诚实差已表列，later slice 移出 Set。

## 非宣称

不以本 spot 顶替 e2e 主审；不宣称 runner 已改 / R5 已关 / RAG 已迁。
