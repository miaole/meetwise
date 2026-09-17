# Review — G7 Local Full-Suite **Execution Plan**（执行前 · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT；本审只读 · **零 suite run**）  
**结论**：**pass**（限：执行计划文档够格作 **G7 开跑前基线（plan-only）**；**≠ suite green** · **≠ 已授权开跑** · **≠ R2/R4 关** · **≠ wrong_track=0** · **≠ HA / 0 BUG** · **≠ 改 R4 wire**）  
**releaseEvidence=false** · Not HA · 配对 `mw-e2e-ha` · **无** model-op · HEAD `639134f`

覆盖 REQUEST：`REQUEST-2026-09-16-g7-full-suite-plan-mw-rag-route.md`  
对照：`harness/local-full-suite-verification.md` · `g7-full-suite-plan.slice.md` · `eval/g7-full-suite-plan.eval.md` · `north-star-hard-gates.md` G7（policy 已生效 ≠ suite green）

## 专家复核

| # | 问 | 答 |
|---|----|----|
| 1 | R2/R4 CMD 冻结是否处处钉 ≠ closed / ≠ wrong_track=0 / ≠ ADV covered？ | **是**（§2.3 / §4 注释块）。 |
| 2 | sole-stack / R5 / pgvector 假绿禁令是否足够？ | **是**（§1.1–1.3 / §5）。 |
| 3 | NHP Batch1–3 指针是否诚实？ | **是**。B1/B2 = post_prove honesty ≠ covered；B3 = still pre_dual / not_run（RECHECK 措辞闭合 ≠ 已开跑）。 |
| 4 | 是否误把 G7 policy 生效读成 suite 绿或可改 R4 wire？ | **否（未误读）**；硬句 G7 effective ≠ suite green；禁改 Worker/wire。 |
| 5 | HA 段是否 honesty-not-HA？ | **是**；拒 HA 偷渡。 |
| 6 | 实现方是否越权跑 prove / 改 wire / 读 `.env*` / 自批？ | **未见**；本刀 docs+REQUEST only。 |

## 专家回答

| # | 问 | 答 |
|---|----|----|
| 1 | 可作 G7 开跑前基线（plan-only）？ | **可接受**。 |
| 2 | 双审前不得开跑全量；不得借本刀改 R4 wire？ | **同意**。 |
| 3 | dual 后仍须 separate exec authorize + CMD+EXIT；R2/R4 EXIT=0 仍 ≠ closed？ | **同意**。 |
| 4 | 阻塞项？ | **无**文档闸阻塞。 |
| 5 | 须扩/缩 R2/R4 列表或加强 wrong_track ADV deferred？ | **非阻塞 nit**：§4 可显式加一行将来 `r4-wrong-track-adv:prove` = **not_run/deferred**（ADV 另刀；wire≠ADV）；现有 §2.3 文字已够，**不挡本 pass**。 |

## 批准范围

**批**：plan inventory + CMD 冻结 + RAG/R2/R4 诚实钉 + sole-stack/R5/HA 假绿禁令；零 suite run；policy≠green。  

**不批**：suite 开跑、suite green、R2/R4 关、wrong_track=0、ADV covered、HA、0 BUG、`releaseEvidence=true`、改 R4 wire、本 dual 自动 exec authorize。

## 非宣称

禁止：suite green、covered、HA、0 BUG、controlPlaneClosed、R2/R4 closed、路由已生效、wrong_track=0、G7 policy = 已开跑、实现方自批。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g7-full-suite-plan-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-g7-full-suite-plan-mw-rag-route.md`
- HEAD：`639134f`
