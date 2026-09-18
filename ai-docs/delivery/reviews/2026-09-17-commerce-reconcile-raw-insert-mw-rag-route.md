# Review — Knife **commerce-reconcile raw INSERT / missing `interviewId`**（pre-exec）· mw-rag-route

**专家**：mw-rag-route  
**日期**：2026-09-17（~00:53 PT；对抗独立审 · **零 coding · 零 prove · 禁自批**）  
**结论**：**pass**（限：pre-exec 文档/REQUEST 门 — 潜伏风险命名诚实 · 未来 seed 须对齐真实 semantic-revision/rule-classify→invite→start · Ban forge · Dual PASS ≠ 授权 coding · **≠ suite/R5/G6/HA · ≠ FUNNEL/R4/题域 closed** · `releaseEvidence=false`）  
**硬钉**：**≠ suite green ≠ R5 ≠ G6 ≠ HA ≠ FUNNEL-01 closed ≠ R4 closed ≠ 题域已隔离 ≠ sole cutover** · **Dual PASS ≠ 授权 coding/prove** · **Ban forge route_decided/rule_decided/interviewId** · **Ban self-approve** · `releaseEvidence=false` · 未读 `.env*` · **零 prove**  
**配对**：mw-e2e-ha · 本审不代签 · 本审不代改 proof / 不实现 fix

覆盖 REQUEST：`REQUEST-2026-09-17-commerce-reconcile-raw-insert-mw-rag-route.md`  
对照：`harness/commerce-reconcile-raw-insert.md` · `commerce-reconcile-raw-insert.slice.md` · `eval/commerce-reconcile-raw-insert.eval.md` · `apps/worker/test/commerce-reconcile.proof.ts:150-154` · adaptive 先例 `harness/adaptive-life-idempotency-ci-fix.md` · R2 P-START（`packages/db/src/recruiter.ts`：无 binding → `interview_ineligible_route`）

**本审动作**：读 harness/slice/eval/REQUEST · 核对 proof B 端 raw `job_posting` INSERT→invite/start→`reserveEntitlement(first.interviewId)` · 核对 P-START fail-closed · RAG/生产路由/qbank/FUNNEL/metadata **正交裁定** · **零** prove 执行 · **零** coding · **未读** `.env*` · **未改** production / proof 源码（仅写本 review）

---

## 0. Verdict table

| Item | Ruling |
|------|--------|
| **Verdict** | **pass**（pre-exec docs/REQUEST 门 only） |
| **Scope** | 潜伏 seed 风险命名 + 未来诚实前置契约；**NOT** fix · **NOT** prove · **NOT** close FUNNEL/R4/题域/suite/R5/G6/HA |
| Implementer self-approve | **rejected** |
| `pnpm -C apps/worker prove:commerce-reconcile` | **`not_run:pre_dual`** · 本审 **未跑** |
| HEAD / SHA | HEAD `0146eaec87adc9ee32fdd17c73139587e12451a3`（短 `0146eae`）· REQUEST 钉 `62bed33`（`62bed3399afddf398981a7bcc1fba1b9fa5d1d70`）= docs 引入提交 · **ancestor of HEAD** · `62bed33..HEAD` 仅无关 CI egress 提交 · **本刀 docs/proof 相对 62bed33 无 drift** |
| RAG / 生产路由 / qbank / FUNNEL / metadata | **正交 = yes**（见 §3） |
| `releaseEvidence` | **false** |
| Blockers（本域 pre-exec） | **none**（文档门够格）；coding/prove **仍禁**直至 dual PASS + **separate authorize** |
| Dual PASS ≠ coding | **硬钉同意** |

---

## 1. REQUEST Q1–Q5（rag-route answers）

| # | Q | Answer |
|---|---|--------|
| **1** | raw INSERT 是否绕过路由前置并在 commerce reserve 前制造 missing-`interviewId` 路径？ | **同意**。`:150` raw `INSERT INTO job_posting(...)` 不经 `createJob`→semantic revision→`classifyJobRoute`；invite/start 后无 `route_decided` binding 时 P-START 返回 `interview_ineligible_route`（**无** `interviewId`）；`:154` `reserveEntitlement(..., first.interviewId, ...)` 即把缺失标识送入权益路径——与 adaptive-life B 端旧形同构。 |
| **2** | 未来是否必须真实 rule classification，禁 forge `route_decided`/`rule_decided`？ | **同意（硬钉）**。未来 seed = 真实 create/semantic-revision/rule-classify → invite → start；**Ban** 直接 INSERT `route_decided`/`rule_decided`、伪造 decision、伪造 interview ID。 |
| **3** | reserve 是否须门控于 start 返回的真实非空 `interviewId`？ | **同意**。缺 ID / `interview_ineligible_route` = fail-closed 前置失败，**不是** nullable 成功；仅在断言真实非空 `interviewId` 后才可 `reserveEntitlement`。 |
| **4** | 计划 CMD 是否恰为 `pnpm -C apps/worker prove:commerce-reconcile`，且仍 **not run**？ | **同意**。CMD 与 proof 头注释一致；状态 **`not_run:pre_dual`**；本审 **零 prove**；Dual PASS **≠** 自动授权跑 prove / coding。 |
| **5** | 是否保留 `releaseEvidence=false` · ≠ suite green · ≠ HA · Ban forge · Ban self-approve？ | **同意（硬钉）**。全部保留；另钉 **≠ R5/G6 · ≠ FUNNEL/R4/题域 closed**。 |

---

## 2. 源锚核对（只读 · 未改）

| Anchor | 观察 |
|--------|------|
| `commerce-reconcile.proof.ts:150` | `INSERT INTO job_posting(id,owner_user_id,title,competencies,status) ...` — **raw fixture**，无 semantic revision / classify |
| `:152-153` | `inviteCandidate` → `startApplicationInterview` |
| `:154` | `reserveEntitlement(c, owner, first.interviewId, 'mock_interview', 1.0)` — 依赖 `first.interviewId` 存在 |
| P-START（`recruiter.ts`） | 无 `application_route_binding` → `{ status: 'interview_ineligible_route' }` · **不创建** interview · fail-closed |
| Adaptive 先例 | 同形 raw INSERT → ineligible → 空 ID reserve；已在 adaptive-life 刀以真实 classify 对齐（本刀仍为 commerce-reconcile 潜伏文档门） |

**本审未**声称当前 proof EXIT=0 / 绿；**未**跑 prove；**未**改 proof。

---

## 3. RAG / 生产路由 / qbank / FUNNEL / metadata（正交裁定）

| Point | Ruling |
|-------|--------|
| **触碰面** | **proof B-side seed 诚实性**（commerce-reconcile 测试边界的 R2 前置缺口命名） |
| **生产路由** | **未改** · **本刀 prep 亦不授权改** `classifyJobRoute` / job-route-decision / P-START 生产实现 |
| **Forge?** | 文档契约 **Ban forge**；本审同意：未来实现不得用假 `route_decided`/`rule_decided`/假 ID 换绿 |
| **qbank 隔离 / R4** | **正交** — 无 qbank corpus / track-local / wrong-track / domain isolation 变更 |
| **FUNNEL** | **正交** — 本刀 **≠** RAG-FUNNEL-01/03 产品关闸；仅复用既有 fail-closed 语义作风险读法 |
| **sole / R5 / G6** | **正交** — 无 sole allowlist / pgvector-legacy / e2e-iso 变更 |
| **metadata / P-META** | **正交** — 无 MetadataReviewReceipt / facets / serving wire |
| **诚实读法** | 文档门同意潜伏风险 **≠** 路由产品关 · **≠** FUNNEL/R4/题域 closed · **≠** suite/HA |
| **RAG-orthogonality** | **yes** |

---

## 4. Fake-green bans（this review）

- Ban：本 pre-exec pass → coding/prove 已授权 / knife product-done  
- Ban：Dual PASS → 自动授权 coding（须 **separate authorize**）  
- Ban：命名潜伏风险 → 当前 `commerce-reconcile` proof 已绿 / EXIT=0  
- Ban：未来本地 EXIT=0 → suite green / HA / R5/G6 closed  
- Ban：未来 rule-classify seed PASS → FUNNEL-01 closed / R4 closed / 题域已隔离 / sole cutover  
- Ban：forge `route_decided`/`rule_decided`/假 interviewId 合法化  
- Ban：实现方 REQUEST = expert pass · self-approve  
- Ban：读 `.env*` / invent Live Key / `releaseEvidence=true`  
- Ban：单域 pass = dual-complete without pair

---

## 5. Approve / do-not-approve

**Approve（限）**：pre-exec 文档/REQUEST 门诚实够格 — raw INSERT 潜伏绕过路由前置 + missing-`interviewId` 路径已正确命名；未来契约要求真实 semantic-revision/rule-classify→invite→start→断言非空 interviewId 再 reserve；Ban forge；CMD 冻结且 **`not_run:pre_dual`**；`releaseEvidence=false`；RAG/生产路由/qbank/FUNNEL/metadata **正交=yes**；Dual PASS **≠** 授权 coding；本审 **零 prove**。

**Do not approve**：coding · prove 执行 · fix 实现 · suite/R5/G6/HA green · FUNNEL/R4/题域 closed · sole cutover · `releaseEvidence=true` · forge 合法化 · self-approve · 本 dual 自动 authorize coding/prove · 当前 proof EXIT=0 宣称。

---

## 6. 仍开 / 阻塞

| 类 | 项 |
|----|-----|
| **本域 pre-exec 文档门** | **无阻塞** → pass（docs only） |
| **coding / prove** | **仍禁** — 待 dual PASS + **separate authorize**；CMD 仍 `not_run:pre_dual` |
| **suite / G6 / R5 / HA / product** | **仍开**（本刀不关） |
| **仍开 siblings** | FUNNEL · R4/题域隔离 · sole ≠ retired · R5 pgvector-legacy · G6 · ≠ RAG migrated |
| **配对** | mw-e2e-ha 独立；本审不代签 |

---

## 7. 非宣称 / 收据

**禁止宣称**：suite green · R5/G6/HA closed · FUNNEL/R4/题域 closed · 本 prep 已 coding/prove · Dual PASS=coding authorize · 当前 proof 绿 · forge 合法 · self-approve · `releaseEvidence=true`

| 字段 | 值 |
|------|-----|
| 专家 | `mw-rag-route` |
| 覆盖 REQUEST | `REQUEST-2026-09-17-commerce-reconcile-raw-insert-mw-rag-route.md` |
| 本 review | `ai-docs/delivery/reviews/2026-09-17-commerce-reconcile-raw-insert-mw-rag-route.md` |
| HEAD | `0146eaec87adc9ee32fdd17c73139587e12451a3`（`0146eae`） |
| REQUEST SHA | `62bed33`（ancestor；本刀无 drift） |
| Verdict | **pass**（pre-exec docs gate only） |
| RAG-orthogonality | **yes** |
| Blockers | **none**（本域）；coding/prove 仍禁 |
| Prove | **zero**（未跑 `pnpm -C apps/worker prove:commerce-reconcile`） |
| releaseEvidence | **false** |

---

*Review · mw-rag-route · commerce-reconcile raw INSERT / missing interviewId · pre-exec · 2026-09-17 ~00:53 PT · pass（docs gate only）· RAG-orthogonal=yes · Dual PASS ≠ coding · releaseEvidence=false · ≠ suite/R5/G6/HA · ≠ FUNNEL/R4/题域 · Ban forge · zero prove · Ban self-approve*
