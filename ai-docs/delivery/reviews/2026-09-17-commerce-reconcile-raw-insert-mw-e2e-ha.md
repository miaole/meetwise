# 审查归档 — Knife **commerce-reconcile raw INSERT / missing `interviewId`** · 执行前文档闸 · mw-e2e-ha

**日期**：2026-09-17 ~00:53 PT  
**审稿人**：`mw-e2e-ha`（对抗独立审 · 执行前文档闸；**实现方自批无效 / 拒绝**；本审 **零 prove · 零 coding · 零 suite · 零 HA**）  
**送审**：`reviews/REQUEST-2026-09-17-commerce-reconcile-raw-insert-mw-e2e-ha.md`  
**对照（全文只读）**：
- `harness/commerce-reconcile-raw-insert.md`（本刀 canonical harness · latent-risk contract）
- `commerce-reconcile-raw-insert.slice.md`
- `eval/commerce-reconcile-raw-insert.eval.md`
- `apps/worker/test/commerce-reconcile.proof.ts:150-154`（只读 spot-check）
- `harness/adaptive-life-idempotency-ci-fix.md`（同形先例 · **pattern sibling · 非自动套用**）
- `reviews/2026-09-17-adaptive-life-idempotency-ci-fix-post-prove-mw-e2e-ha.md`（先例根因读法对照）
**配对**：`REQUEST-2026-09-17-commerce-reconcile-raw-insert-mw-rag-route.md`（**须独立签**；冲突取更严；**本审不代签 / 不等待**）  
**结论**：**pass**（**仅** 执行前文档闸）  
**批准范围**：**仅**同意本刀 harness/slice/eval/双 REQUEST 够格定义 **latent raw-INSERT / missing-`interviewId` 风险**（M1–M6 · E1–E6 draft）；同意硬钉 **`releaseEvidence=false` · ≠ suite green · ≠ R5 · ≠ G6 · ≠ HA**；同意 **Ban forge** · **Ban self-approve**；同意 planned CMD **`not_run:pre_dual`**；同意本 pass **≠** coding/prove authorize（须 **separate authorize**）  
**不批**：fix 已授权 · 本审 = coding/prove authorize · Dual PASS = 已授权 coding · 当前 `commerce-reconcile` proof EXIT=0 · suite green · R5 · G6 · HA · `releaseEvidence=true` · forge `route_decided`/`rule_decided`/`interviewId` · 实现方自批 · 本审内跑 prove · 自动套用 adaptive-life 补丁到本 proof  
**硬钉**：`releaseEvidence=false` · **≠HA** · **≠ suite green** · **≠ R5** · **≠ G6** · **本审零 prove · 零 coding** · **拒绝自批** · **须配对 `mw-rag-route` 独立** · **Dual PASS ≠ coding authorize**

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | **执行前文档闸 only** — NOT coding · NOT prove · NOT fix · NOT EXIT=0 claim · NOT HA · NOT suite green · NOT R5/G6 |
| 实现方自批 / REQUEST 预写 | **无效 / 拒绝**；本审独立裁定 |
| Knife / CMD | **`REQUEST-ready / not_run:pre_dual`**；planned `pnpm -C apps/worker prove:commerce-reconcile` **未跑** |
| 风险类 | **同意** = adaptive-life 同形：raw `job_posting` INSERT → 缺 semantic/classify → start 可能无 `interviewId` → reserve → `idempotency_key` NOT NULL 路径 |
| 双审通过 = 已授权 coding/prove？ | **否** — Dual PASS **≠** authorize；须 **separate authorize** |
| 未来 EXIT=0 = suite / R5 / G6 / HA / releaseEvidence？ | **否** |
| `releaseEvidence` | **false** |
| HA | **≠HA** |
| 阻塞（本域文档闸） | **无阻塞**（见 §4；配对域独立；coding 仍 gated） |

---

## 1. SHA / HEAD（简述）

| 项 | 值 |
|----|-----|
| 声称 SHA（REQUEST 锚定 docs 提交） | `62bed3399afddf398981a7bcc1fba1b9fa5d1d70`（短 **`62bed33`**）· `docs(delivery): request commerce reconcile seed review` |
| 本审 box HEAD | `0146eaec87adc9ee32fdd17c73139587e12451a3`（短 **`0146eae`**）· `fix(ci): register F6 MODEL_API_KEY egress references` |
| 关系 | `62bed33` **是** HEAD 祖先（docs 刀已入历史；HEAD 已前移到无关 CI egress 钉） |
| 读法 | HEAD ≠ claimed docs SHA **不**阻塞本执行前文档闸；本审 **未** 因 HEAD 前移宣称 proof 已绿 / 已修 |

---

## 2. 已读 / 对照（只读 · 零 prove · 零 coding）

| 角色 | 路径 | 观察 |
|------|------|------|
| REQUEST（本域） | `reviews/REQUEST-2026-09-17-commerce-reconcile-raw-insert-mw-e2e-ha.md` | Q1–Q5 清晰；硬钉完整；禁自批；`not_run:pre_dual`；零 coding |
| Harness | `harness/commerce-reconcile-raw-insert.md` | §1–§6：latent 声明 · future shape · M1–M6 · frozen CMD · Ban forge |
| Slice | `commerce-reconcile-raw-insert.slice.md` | products 齐；硬钉齐；one-line scope = docs only |
| Eval | `eval/commerce-reconcile-raw-insert.eval.md` | E1–E6 · fake-green checklist · CMD `not_run:pre_dual` |
| Source spot-check | `apps/worker/test/commerce-reconcile.proof.ts:150-154` | **确认** raw INSERT → invite → start → `reserveEntitlement(..., first.interviewId, ...)`；**无** `createJob` / semantic revision / `classifyJobRoute` |
| Adaptive precedent | `harness/adaptive-life-idempotency-ci-fix.md` | `post_prove_dual_pass` 先例 · **同形 sibling · 非自动套用到本 proof** |
| Pair REQUEST | `REQUEST-…-mw-rag-route.md` | 已备；本审 **不代签** |

### 2.1 源码 spot-check（只读 · 对抗）

```text
:150  INSERT INTO job_posting(...)           ← raw fixture seed（绕过 createJob / semantic / classify）
:151  INSERT INTO resume(...)
:152  inviteCandidate(...)
:153  startApplicationInterview(...) → first
:154  reserveEntitlement(..., first.interviewId, 'mock_interview', 1.0)
```

只读交叉（`packages/db/src/recruiter.ts`）：无 `route_decided` binding → `startApplicationInterview` 返回 `{ status: 'interview_ineligible_route' }`（**无** `interviewId`）。  
只读交叉（`packages/db/src/commerce.ts`）：已有 `idempotency_key_required` 守卫（adaptive-life 修法遗留）——**不**等于本 proof seed 已修；守卫 = fail-fast，**根因仍在 seed 前置缺失**。

→ **latent path 成立**：raw INSERT 可致 start 无 ID → reserve 吃 undefined → 撞 NOT NULL / 或被守卫拒（仍非绿路径）。

---

## 3. REQUEST Q1–Q5（对抗答）

| # | 问题 | 本审答 | 对抗要点 |
|---|------|--------|----------|
| **Q1** | `:150-154` 是否暴露 raw-INSERT / missing-`interviewId` latent path？ | **是（agree）** | spot-check 确认：无 classify/semantic；start 缺 binding → `interview_ineligible_route` 无 ID；`:154` 仍把 `first.interviewId` 送入 reserve |
| **Q2** | 未来前置应为真实 semantic revision + rule classification + invite/start，而非直接 decision-row INSERT？ | **是（agree · Ban forge）** | 与 adaptive-life 修法同形：`createJob` → semantic → `classifyJobRoute`（rule）→ assert `route_decided`/`rule_decided` → 再 start；**禁止**直接 INSERT `route_decided`/`rule_decided` |
| **Q3** | `reserveEntitlement` 是否仅在非空真实 `interviewId` 断言后可达？ | **是（硬钉）** | missing ID = fail-closed 前置失败，**不是** nullable success；未来实现须 assert 非空真实 ID 后再 reserve |
| **Q4** | 本 REQUEST = `REQUEST-ready / not_run:pre_dual` · docs only · 无 coding/prove 授权？ | **同意** | 本审确认：**零 coding · 零 prove**；CMD frozen **未跑**；本 pass **≠** authorize；须 dual + **separate authorize** 后才可动代码 |
| **Q5** | 保留 `releaseEvidence=false` · ≠ suite green · ≠ HA · Ban forge · Ban self-approve？ | **同意（硬钉）** | 另钉：**≠ R5 · ≠ G6**；实现方自批 **拒绝**；pair `mw-rag-route` **须独立** |

---

## 4. 风险同意 / Blockers

### 4.1 风险同意？

**同意（agree）** — 与 adaptive-life B-side 同形：

| 环节 | adaptive-life（已修先例） | commerce-reconcile（本刀 latent） |
|------|---------------------------|-----------------------------------|
| Seed | 旧：raw `job_posting` INSERT | **仍**：`:150` raw INSERT |
| 前置 | 曾缺 semantic/classify | **仍缺** |
| Start | 曾 → `interview_ineligible_route` 无 ID | 同形可达 |
| Reserve | 曾 → `idempotency_key` NULL 撞 NOT NULL | `:154` 同形暴露 |
| 读法 | post_prove dual 已闭该刀 | **本刀仅 docs 识别；未修 · 未 prove** |

**非自动套用**：先例证形状与修法方向，**不**授权把 adaptive-life patch 机械拷入本 proof；须本刀 dual + separate authorize 后另开实现。

### 4.2 Blockers（相对本 scope：执行前文档闸）

**无阻塞**（文档闸本身）。

非 blocker / 范围外硬提醒（**不**抬级 · **不**当本 pass 开 coding）：

1. **Coding / prove 仍 gated** — Dual PASS ≠ authorize；须 **separate authorize**
2. **Pair `mw-rag-route` 须独立结论** — 本审不代签；冲突取更严
3. **Ban forge** — 未来实现不得直插 decision 行或伪造 `interviewId`
4. **CMD `pnpm -C apps/worker prove:commerce-reconcile`** — 保持 **`not_run:pre_dual`**；本审未跑
5. **`idempotency_key_required` 守卫存在 ≠ seed 已修** — 勿假绿宣称
6. **≠ suite green · ≠ R5 · ≠ G6 · ≠ HA · releaseEvidence=false**

---

## 5. 对抗：假绿 / 偷关 / 冒充

| 假绿手法 | 本审裁定 |
|----------|----------|
| 把本 pass 写成「已授权修 commerce-reconcile proof」 | **拒绝** — Dual PASS ≠ coding authorize |
| 把 adaptive-life `post_prove_dual_pass` 写成「本 proof 已绿 / 已修」 | **拒绝** — sibling pattern only |
| 把 `idempotency_key_required` 守卫写成「raw INSERT 风险已消」 | **拒绝** — 守卫 ≠ seed 前置修复 |
| 宣称当前 `prove:commerce-reconcile` EXIT=0 | **拒绝** — **not_run**；本审零 prove |
| 把未来局部绿写成 suite / R5 / G6 / HA / releaseEvidence | **拒绝** |
| 实现方自批 / 本审代签 rag-route | **拒绝** |
| 伪造 `route_decided` / `interviewId` 以推进 proof | **Ban forge** |

---

## 6. 本审执行边界确认

| 钉 | 本审 |
|----|------|
| 零 coding | ✓ 未改任何源码 / proof / migration |
| 零 prove | ✓ 未跑 `prove:commerce-reconcile` 或任何 suite |
| `releaseEvidence=false` | ✓ |
| ≠HA | ✓ |
| ≠ suite green · ≠ R5 · ≠ G6 | ✓ |
| 未读 `.env*` / 未 invent key | ✓ |
| 拒自批 | ✓ |
| 仅 Meetwise `/workspace/meetwise` | ✓ · Never Meridian |

---

## Sign-off

**Verdict**: `pass`  
**Scope**: 执行前文档闸 only  
**Risk**: **agree**（raw INSERT / missing `interviewId` · same-class as adaptive-life · not auto-applied）  
**Blockers (docs gate)**: **无**  
**Coding/prove authorize**: **否**（Dual PASS ≠ authorize · needs separate authorize）  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠R5** · **≠G6**  
**Pair**: `mw-rag-route` 须独立 · 本审不代签  

Signed: **mw-e2e-ha** · 2026-09-17 ~00:53 PT
