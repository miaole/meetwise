# Slice — DIR-1 · 目录与文件位置重构设计刀（docs-only REQUEST · `draft:awaiting_pre_exec_dual` · **rev2**）

**状态**：`draft:awaiting_pre_exec_dual` · **rev2**（双席 FAIL 合并处方七项修订已并入 · **修完即停 等重审** · 零代码 · Ban self-approve · alone ≠ dual）
**日期**：2026-10-07（rev1）/ 2026-10-07（rev2）· **base tip**（fetch 后实测）：`0fe96fca`（`origin/feat/mysql-schema-skeleton` · docs 基线 · not a prove tip）
**worktree**：`/Users/miaole/Desktop/golucky/meetwise-line-dirstruct`（branch `line/dir-structure`）
**性质**：用户直裁「文件夹和文件位置也很混乱」→ 只读盘点（现状结构图 + 量化混乱清单）+ 目录重构 REQUEST（目标结构规范 + 分批纯移动迁移方案）。实际 `git mv` 属后续每批一刀，本批不开。

---

## 产物（rev1 新增 4 md · rev2 修订同 4 md）

| 角色 | 路径 |
|------|------|
| Harness / REQUEST（含盘点+目标+迁移+Ban+Prove+pins） | `ai-docs/delivery/harness/dir-restructure.md` |
| 本切片索引 | `ai-docs/delivery/dir-restructure.slice.md` |
| REQUEST · e2e-ha | `ai-docs/delivery/reviews/REQUEST-2026-10-07-dir-restructure-mw-e2e-ha.md` |
| REQUEST · model-op | `ai-docs/delivery/reviews/REQUEST-2026-10-07-dir-restructure-mw-model-op.md` |

## rev2 七项处方 ↔ 落点

| # | 处方 | 落点 |
|---|------|------|
| ① | prove 改真实命令面 | harness §4「零行为变更证明（rev2）」：`pnpm exec tsc -p <pkg>/tsconfig.json --noEmit` + 逐包 prove:\* 全绿清单（db 67 script / domain 26 / worker 119 / 根 alias 面）；新增包级 script 须批 REQUEST 显式单列白名单 |
| ② | B6 白名单第四类 + 62 文件扫描 | 通用律 2（四类路径文本）+ §4.2-1（扫描命令钉死；rev2 复扫实测 67/79 含 apps/packages/e2e 串、移动敏感面 37 文件；与协调方 62 的口径差在正则覆盖，以钉死命令实测为准，B6 批落逐文件清单） |
| ③ | mysql-stack 根转发层 = S4 landed | §4.2-2：根 11 文件为 S4 legacy path forwarder（真身在 conn-stack/），B6 原样保留；「并入/删转发」须契约修正案前置另刀 |
| ④ | cost-configure 钉根 + docker/ops 盘点 | R2（worker 根锚点名 `cost-configure.ts` · `docker/compose.prod.yml:231`）+ docker/ops 引用面清单（`:230-231/:240/:269` · `Dockerfile.ha-dual:38` · `worker.env.example:171` · `ops/deploy/*` 入 B6 前置扫） |
| ⑤ | 旗舰行勘误 + 计数实值 | §2.1 n=749/kebab=744；§2.3 旗舰 = `qbank-track-local-retrieval` **两树同名**（db+domain）+ worker **近名** `…-retrieve`；exact 17 组全 db↔domain + 跨树 8 组（补录 scoring-honesty/client）+ 近名族 6 族；db 70 平铺+tenant/；ai-graphs 17；散件 15；helpers 12（11 .ts+1 .mjs） |
| ⑥ | B1 逐文件落位清单 | §4.1：70 平铺全量 → 域文件夹（memory 10/qbank 10/privacy 6/interview 5/model-op 5/retrieval 4/context 4/jobs 4/scoring 3/routing 3/commerce 3=2+payment/…）+ 根锚 5（index/principal/migrate/migrate-cli/isolated-test-target）= **65 mv** |
| ⑦ | r4 债行不关 + 禁 shim + 批前重查 | B3 行 + Ban 9（移动 ≠ 关闭 r4/R4/FUNNEL 债行）+ Ban 10/§4.2-3（B6 预裁定禁新建转发 shim）+ 通用律 0（批前重查 SOP + W 线（w1/w1b/w2）冻结序 + loop 文件冲突面） |

## 盘点要点（rev2 实值 · 详见 harness §1–§2）

- 大平铺：`apps/worker/src` **83** 文件（r4-\* 31 · 散件 15）· `packages/db/src` **70 平铺**+tenant/（memory 10 + qbank 10）· `packages/domain/src` **50**（ctx0x/mem0x 编号前缀 6）· `apps/api/src/platform` 11 · ai-graphs 17（含文件/目录同茎）。
- 跨树同名：exact **17 组全为 db↔domain 成对** + 跨树另 8 组（scoring-honesty · client · voice-stream-preview · public-preview · report · cloud-readiness · cloud-test-serial · adaptive-interview）+ 近名族 6 族（旗舰勘误：`qbank-track-local-retrieval` 两树同名 + worker 近名 `retrieve`）。
- 文件名风格：kebab **744/749**（99.3%，含 .d.ts）· camel 4（React hooks 豁免）· 下划线 1。
- 超长 top5（>800 行，**Ban 拆**，归后续 SPLIT-1）：run-e2e-isolated.mjs 2449 · principal.ts 2077 · e2e-parity-check.mjs 1254 · contracts/index.ts 1243 · interview.service.ts 954。
- scripts/ 根 79 文件（38 一次性 prove + 11 mysql-stack 根转发层[S4 landed · 不动]）vs 8 子目录；根 package.json 248 处 `node scripts/` 引用 + 仓内路径串面（62 文件级前置扫描）。

## 批次计划摘要（每包一刀 · 纯 git mv · 零行为变更 · 真实 prove 面）

| 批 | 范围 | 状态 |
|----|------|------|
| B1 | `packages/db/src` 域文件夹化（**65 mv** · 逐文件清单 §4.1） | 排队 |
| B2 | `packages/domain/src`（~35 mv） | 排队 |
| B3 | `apps/worker/src` + smoke 同名消歧（~70 mv；**排除 checkpoint-principal.ts**；main/cost-configure 钉根；**r4 债行不因移动关闭**） | 排队（隐私主线在飞 · 批前重查） |
| B4 | `apps/api` | **后置**至 SSE-PUSH 线 nail |
| B5 | `packages/ai-runtime` + ai-graphs 同茎 | **后置**至 TOKSTREAM 线 nail |
| B6 | `scripts/` 根归位（~40-50 mv + 248 处 package.json 路径 + 62 文件扫描；**mysql-stack 根转发层保留**；**禁新建 shim**） | 排队（最后） |
| B7 | `_neg-harness.ts` 去前缀（1 rename · glob 探测后定） | 可选微批 |

推荐序 B1→B2→B3→B6→B4→B5→B7；每批 prove = `pnpm exec tsc -p --noEmit` + 逐包 prove:\* 全绿清单 + `git diff --find-renames` 全 R100 + lockfile 零改。

## 非范围（Ban）

本批 mv 任何文件；动文件本体内容（白名单仅四类路径文本：包内 import / 桶 re-export / package.json+workflow 路径 / [B6] scripts 内路径串与 ./lib 相对 import）；与在飞刀撞文件（SSE-PUSH→interview.controller · TOKSTREAM→ai-runtime · 隐私主线→checkpoint-principal.ts）；改共享 SSOT / e2e 契约与 ADR（含 mysql-stack 根转发层）；拆超长文件；新建 shim；关 r4/R4/FUNNEL 债行；secrets；自批；跳过批前 SOP/W2 冻结序重查。

## 硬钉（pins 十值照抄）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · PG-retained · 公开 DELETE /privacy/interview-data/:id = 503 · `g7SuiteGreen=false` · `r1Closed=false`；另 `canHonestlyFlip=false`（UC-018）· `techRoleFailClosedOptOutG7Only=true`。

---

*DIR-1 slice rev2 · 2026-10-07 · docs-only · 修完即停 等重审 · STOP*
