# REQUEST — G4 production scoped retrieve（partial P-WIRE）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-10（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R4 已关** · **≠ 题域已隔离** · **≠ covered** · **≠ HA**

## 对照

- 同 `REQUEST-g4-production-scoped-retrieve-mw-rag-route.md`
- `harness/r5-retirement-sole-stack-status.md` G4（仍 NOT closed 挡切流）

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm g4-production-scoped-retrieve:prove` | **0** |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm conn-stack:r4-domain-isolation:prove` | **0** |

## 请专家回答

1. 本切片是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true`？  
2. partial scoped retrieve 绿是否被文档明确标红为 **≠ 题域已隔离 / ≠ wrong_track=0**？  
3. sole allowlist 是否因本切片扩面？（期望：**否**）  
4. 与 G4 并列门（挡切题库/向量）表述是否仍一致（R4 NOT closed）？

## 非宣称（实现方自认）

- 不宣称 covered / HA / sole cutover / flip default  
- 不宣称 R4/G4 关闭  
- 本 REQUEST **不是** pass 结论
