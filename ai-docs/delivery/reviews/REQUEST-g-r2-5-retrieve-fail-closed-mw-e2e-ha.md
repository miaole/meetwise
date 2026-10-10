# REQUEST — G-R2-5 Worker retrieve missing snapshot fail-closed → mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **≠ covered** · **≠ HA** · **≠ R2/R4 closed**

## 对照

- `ai-docs/delivery/harness/r2-classify-job-route-status.md`（G-R2-5）
- `ai-docs/delivery/harness/r4-domain-isolation.md` / `r4-domain-isolation-status.md`
- `apps/worker/test/g-r2-5-retrieve-fail-closed.proof.ts`

## 请专家复跑

| CMD | 期望 EXIT |
|---|---:|
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** |
| `pnpm g4-production-scoped-retrieve:prove` | **0** |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |

## 请专家回答

1. 证明是否只覆盖可执行 unit/static retrieve-side fail-closed，而不是完整 E2E、HA 或 production coverage？
2. 缺 snapshot 是否明确变成 observable degraded denial，而非 unscoped query？
3. 是否保持 `releaseEvidence=false`、Not HA、sole allowlist 不扩、R2/R4 NOT closed？
4. 是否确认 P-START 是独立刀，本变更没有修改 start/refuse behavior？

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass 结论；专家未审前不得合入/自批。
- 不宣称 covered / HA / `releaseEvidence=true` / sole cutover。
- 不宣称 R2 fully closed、R4 closed、题域已隔离或 wrong_track=0。
- 不切 qbank/向量真相；不 flip default；不开 DELETE。
