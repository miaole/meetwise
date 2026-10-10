# 审查归档 — UC-E2E-018 HTTP abandon 配额/授权 · mw-privacy-int spot

**日期**：2026-09-10
**结论**：**pass**（**限 HTTP 口配额/授权 spot**）
**releaseEvidence=false** · **仍 partial ≠ covered** · **≠ 0058 fence** · **≠ 产品删除闭环** · 实现方不自审

## 对照
- `harness/uc-e2e-018-user-abandon.md`（含 H* / H-authz）
- `eval/uc-e2e-018-user-abandon.eval.md`
- `apps/api/test/uc-e2e-018-user-abandon-http.proof.ts`
- 矩阵行 `UC-E2E-018`（须保持 **partial**）

## 本机复跑
| CMD | EXIT |
| --- | --- |
| `pnpm uc018:abandon:http:prove` | **0**（36 PASS：H1 额度净变 0；H2 不双退；**H-authz userB→404** / 401 / 终态 409；印 PRIVACY-STUB + FULL-E2E GAP；R5；`release_evidence=false`） |

## 隐私 / 配额 / 授权 spot
| 检查 | 判定 |
| --- | --- |
| HTTP 跨用户 abandon | **成立**：userB→userA **404** `not_found_or_forbidden` |
| 额度诚实 | **成立**：预留后 -1；abandon **净变 0**；二次 noop **不双退** |
| 假绿冒充 covered / full.e2e | **否** — GAP-FULL-E2E/GRAPH/TTL/WAITING-USER 已印；聚焦 HTTP 口 ≠ suite |
| 冒充 0058 / 删除闭环 | **否** — minimal privacy stub pin ≠ 0058；不碰公开 DELETE 放行 |

## 仍 block / 不得宣称
- UC-E2E-018 **covered** / full.e2e 纳入 / UI 放弃
- AiGraphRun safely_terminated / TTL / waiting_user
- 产品隐私删除闭环 / `releaseEvidence=true`

## 一句话
HTTP abandon 跨用户 404 + 额度净变 0 spot **pass**；**仍 partial≠covered**。
