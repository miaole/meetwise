# Review — R1 tech-role fail-closed 评测集（GAP-RAG-01）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（评测集 / harness 合同）  
**releaseEvidence=false** · Not HA · **pass ≠ R1 已关** · **本绿 ≠ 已迁**

## 对照

- `ai-docs/delivery/harness/r1-tech-role-fail-closed.md`
- `ai-docs/delivery/eval/r1-tech-role-fail-closed.eval.md`
- `ai-docs/delivery/m4-rag-hard-gates.md` §R1 / GAP-RAG-01
- `ai-docs/delivery/gap-bug-backlog.md` GAP-RAG-01

## CMD / EXIT（专家复跑）

| CMD | EXIT |
|-----|------|
| `pnpm r1-tech-role-fail-closed:prove` | **0** |
| `pnpm mysql-stack:m4-rag:prove` | **0** |

## 硬钉核实

| 钉 | 结果 |
|----|------|
| R1 未关 / pass ≠ R1 已关 | 通过（harness/eval/prove/m4 均钉） |
| flag-off 仍 legacy「技术岗」 | 通过（E3；resolver 默认） |
| R2 生产接线未做 / 不宣称 | 通过 |
| R4 题域隔离 NOT closed | 通过（评测零 isolation 断言） |
| 本绿 ≠ 已迁；releaseEvidence=false | 通过 |

## 专家问答

1. **E1–E9 是否足够验收「静默硬编码收口 + flag-on fail-closed 合同」？** 是。覆盖 flag、legacy、fail-closed throw、deps 禁旁路、route 源接受、静态去注入、文档非宣称。
2. **假绿标红是否够用？** 够用。已覆盖 prove→R1关、main无字面量→通用就绪、snapshot 只读→R2、leaf→R4、m4-rag绿→切流。可选后续加「flag-on 组合根 / quarantine E2E」条目，**不阻塞**本评测集 pass。
3. **不宣称 R1 已关前提下，是否允许保留现有实现并继续等 R2？** 允许。实现收口 + 默认 legacy 是合理过渡；关闸仍依赖 R2 接线 + flag-on 组合根证据。

## 非宣称

- 不宣称 R1 / R2 / R4 已关  
- 不宣称生产已开 `MEETWISE_TECH_ROLE_FAIL_CLOSED`  
- 不切 qbank / 向量真相  

## 阻塞切流（非阻塞本评测集）

R1 仍开（legacy 默认）· R2 未接线 · R4 NOT closed · 无 flag-on 组合根 / quarantine E2E
