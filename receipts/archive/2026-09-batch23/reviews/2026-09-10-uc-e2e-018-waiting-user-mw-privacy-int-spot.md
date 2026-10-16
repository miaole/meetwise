# 审查归档 — UC-E2E-018 waiting_user CAS · mw-privacy-int spot

**日期**：2026-09-10
**结论**：**pass**（**限 waiting_user CAS 扩面 spot**）
**releaseEvidence=false** · **仍 partial ≠ covered** · 实现方不自审

## 对照
- CAS：`packages/db/src/commerce.ts` `abandonInterviewAndRelease` → `status IN (created,active,waiting_user)` **且** `owner_user_id=$2`
- `apps/api/test/uc-e2e-018-user-abandon-http.proof.ts`（H-waiting-user + H-authz）
- `packages/db/test/uc-e2e-018-user-abandon.proof.ts`（A-waiting-user）
- harness：§1b#4 waiting_user **CLOSED**；GRAPH/TTL/FULL-E2E 仍缺

## 本机复跑
| CMD | EXIT |
| --- | --- |
| `pnpm uc018:abandon:http:prove` | **0**（46 PASS；含 H-waiting-user 额度净变 0 + begin 409；H-authz userB→404） |
| `pnpm uc018:abandon:prove` | **0**（含 A-waiting-user 净变 0 + ∉ in-progress） |

## 假绿 / 越权 spot
| 检查 | 判定 |
| --- | --- |
| CAS 扩面偷掉 owner 过滤 | **否** — UPDATE 仍 `owner_user_id=$2` + `assertPrincipal` |
| 跨用户越权 | **未见假绿** — H-authz userB→userA **404**（同 abandon 口；waiting_user 行同服务层） |
| 额度双退 / 假闭环 | **否** — waiting_user 路径净变 0；二次逻辑仍在 H2 |
| 升 covered | **禁止** — GRAPH/TTL/FULL-E2E 仍 PIN；waiting_user 关 ≠ UC covered |

## 非阻塞
- H-authz 样例行是 `created` 非 `waiting_user`；同 route+owner CAS，风险低；若补一行 waiting_user 越权 404 更完整。

## 仍 block
- UC-E2E-018 **covered** / full.e2e / UI / AiGraphRun / TTL
- 产品删除闭环 / `releaseEvidence=true`

## 一句话
waiting_user CAS 扩面 **pass**；未放开越权；**仍 partial**。
