# REQUEST — G7-A · Key-blocked×3 **post-change** docs pin → mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16 ~19:50 PT  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ family green** · **≠ suite green** · **≠ SLO/LOAD**  
**配对**：`REQUEST-2026-09-16-g7-key-blocked-x3-post-change-mw-rag-route.md`  
**硬闸**：pre-exec dual **pass** · meetwise authorize **docs pin only**  
**前序**：`2026-09-16-g7-key-blocked-x3-mw-e2e-ha.md`（pass）  
**本刀**：**docs pin landed**；**零 live hard-run**；**无 invent Key**

---

## 对照

| 文件 | 角色 |
|------|------|
| `harness/g7-key-blocked-x3-honesty.md` | `docs_landed / awaiting_post_change_dual` |
| `harness/g6-e2e-iso-blocked.md` | G7-A cross-pin |
| G7 receipt | 3× blocked retained |

---

## CMD honesty（实现方 · 2026-09-16 ~19:50 PT · **no prove / no live**）

| CMD | Status | 诚实读法 |
|-----|--------|----------|
| `pnpm e2e:isolated` | **blocked** / `not_run:no_key` | Key unset · ≠ family green · **DO NOT hard-run** |
| `pnpm e2e:ui:isolated` | **blocked** / `not_run:no_key` | ≠ UI covered |
| `pnpm verify:e2e-performance` | **blocked** / `not_run:no_key` | ≠ SLO · ≠ LOAD · ≠ HA |
| Defaults / allowlist | **NOT flipped** | this knife |

`MODEL_API_KEY` probe：**/unset**（env name only；不读 `.env*`；不打印值；不发明）

---

## 请专家回答（Q1–Q6）

1. 3× CMD 在 Key unset 下是否仍诚实 **blocked**（禁 rewrite green / skip-as-pass）？  
2. 是否确认实现方 **未** invent Key / **未** hard-run live / **未** flip allowlist？  
3. G6 / BUG-E2E-ISO 是否仍 OPEN（K3 cite ≠ close G6）？  
4. Docs pin 是否仅 honesty（≠ family covered / ≠ suite green）？  
5. PERF/LOAD 是否仍 blocked/blind until Key+authorize？  
6. 禁 self-approve / `releaseEvidence=true`？

请写入 `reviews/2026-09-16-g7-key-blocked-x3-post-change-mw-e2e-ha.md`。**禁止**实现方代写 pass。

---

*REQUEST · mw-e2e-ha · G7-A post-change · 2026-09-16 ~19:50 PT · releaseEvidence=false · ≠HA · Key unset → blocked*
