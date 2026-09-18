# 审查归档 — UC-E2E-001 live-blocked 诚实钉 · mw-e2e-ha

**日期**：2026-09-10（~02:22 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审；覆盖实现方声称，**非自审**）  
**对象**：`scripts/uc-e2e-001-live-blocked.proof.mjs` · `scripts/eval-uc-e2e-001-002-cite.proof.mjs` · harness §1a/§1b · 矩阵强化  
**结论**：**pass**（诚实性 / live-blocked 登记成立）  
**releaseEvidence=false** · **Not HA** · **≠ live E2E covered** · **≠ UC-E2E-001 covered** · **本绿 ≠ e2e:isolated 绿**

---

## Prove（本审复跑）

| CMD | 环境 | EXIT | 读法 |
|-----|------|------|------|
| `pnpm uc001:live-blocked:prove` | `MODEL_API_KEY` **unset**（仅 env 名探测；**未读** `.env*`） | **0** | 诚实钉 blocked(无 Key)+runner fail-closed；**≠** green live |
| `pnpm eval-uc-e2e-001-002-cite:prove` | 同上 | **0** | 静态 cite；001 partial/blocked + R5；002 partial；**≠** live E2E |
| `pnpm e2e:isolated` | Key unset | **未跑 / blocked** | 硬禁：无 Key 勿假绿 live；本审未硬跑 |

**Key 探测**：`MODEL_API_KEY=unset`（`unset MODEL_API_KEY` 后 shell 探测；证明脚本亦打印 `probe … unset`）。

**源码 fail-closed 抽检**（非仅 regex 自称）：
- `scripts/run-e2e.mjs:42` → `throw tagE2EFailure('provider', 'live_provider_key_missing')`
- `scripts/run-e2e-ui.mjs:46` → 同上
- 头注释钉「不会降级成假绿」

---

## 对抗：EXIT=0 是否冒充 live E2E 绿 / covered？

| 攻击面 | 裁定 |
|--------|------|
| `uc001:live-blocked:prove` EXIT=0 = live E2E 绿？ | **否** — 脚本 NOTE + harness §1a 明示 EXIT=0=钉 blocked，≠ green live |
| EXIT=0 = UC-E2E-001 **covered**？ | **否** — harness/eval/matrix 均禁 **covered**；矩阵行仍 **partial** / **blocked**(无 Key) |
| EXIT=0 = skip-as-pass / 无 Key 跳过当 pass？ | **否** — 本 prove 不跑 live；runner 无 Key 即 throw（非 skip） |
| cite EXIT=0 冒充 `e2e:isolated` 绿？ | **否** — cite 仅静态 harness/eval/矩阵诚实语 |
| 矩阵 §4「UC-E2E-001 live」写成 covered？ | **否** — 记录 **blocked**；live-blocked honesty 行钉 ≠ green live |
| releaseEvidence / HA？ | **否** — 全文 false / Not HA；本审不背书 |

**对抗结论**：两 prove EXIT=0 **不**构成 live covered；诚实钉语义成立。若有人把本绿写成 live covered / HA / releaseEvidence=true → **假绿，阻塞上抬**。

---

## 矩阵 / blocked 裁定

| ID / 面 | 本审裁定 | 允许？ |
|---------|----------|--------|
| UC-E2E-001 矩阵行 | **partial** / **blocked**(无 Key)；fixture=pgvector → **green-risk / R5** | **是** — 保持；**禁止**升 covered |
| UC-E2E-001 live（§4） | **blocked**（无 Key；未跑） | **是** |
| UC-E2E-001 live-blocked honesty | EXIT=0 = 钉 blocked+fail-closed | **是** — 仅诚实登记 |
| 抬 covered 北星 | Key 到位后 `pnpm e2e:isolated` → `e2e/full.e2e.ts`（仍须 R5；≠ sole-stack migrated） | 路径正确；**非本切片已绿** |
| harness §1a / §1b | blocked(无 Key) 专节 + 抬 covered 缺项表 | **对齐** |

---

## 阻塞栏（必填）

| # | 阻塞项 | 状态 | 说明 |
|---|--------|------|------|
| B1 | 无 `MODEL_API_KEY` → live `e2e:isolated` / `e2e:ui:isolated` | **阻塞中** | 禁止硬跑冒充绿；runner fail-closed |
| B2 | 把 `uc001:live-blocked:prove` / cite EXIT=0 写成 live E2E 绿或 UC-001 **covered** | **硬禁（上抬阻塞）** | 违者 = 假绿 |
| B3 | 矩阵升格 `covered` / `releaseEvidence=true` / 宣称 HA | **硬禁** | 本切片 releaseEvidence=false · Not HA |
| B4 | 即使 Key 到位且 `e2e:isolated` 绿 | **仍阻塞发布级 covered** | 须标 R5 green-risk；sole-stack 未迁前 ≠ 发布 covered |
| B5 | 实现方自审当 HA | **不适用本审** | 本文件为独立 mw-e2e-ha；实现方不自审 |

**未阻塞（允许登记）**：矩阵保持 **partial**/blocked；诚实钉 prove 绿；cite 绿。

---

## 硬钉勾选

- [x] 无 Key 勿假绿 live  
- [x] EXIT=0 ≠ live E2E 绿 / ≠ covered  
- [x] harness §1a blocked + §1b 抬 covered = Key→`e2e:isolated`/`full.e2e`  
- [x] 矩阵强化未假升 covered；releaseEvidence=false  
- [x] 未跑 `e2e:isolated`；未读 `.env*`；未碰 Meridian  

---

## 结论与建议

- **pass** — live-blocked 诚实钉与 cite 声称成立；**不背书** 黄金路径 live 已通。  
- **允许** 矩阵 **partial** / **blocked**(无 Key)。  
- **抬 covered** 仅当：Key 到位 → `pnpm e2e:isolated` 真绿 → 仍标 R5；sole-stack 迁完前勿发布级 covered。  
- 对照：`harness/uc-e2e-001-golden-path.eval.md` · `eval/uc-e2e-001-golden-path.eval.md` · 矩阵 UC-E2E-001 / §4 live + live-blocked honesty 行 · 旁证 spot `…-meetwise-honesty-spot.md`（非本 HA 替代）。
