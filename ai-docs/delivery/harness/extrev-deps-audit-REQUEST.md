# Harness — **EXTREV-0 DEPS-AUDIT**（#106 P0 依赖高危+CI 无审计门 / #107 P1 xmldom+解压守卫 · REQUEST · **`awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs-only · 零产品码 · 零 install · 零 run · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD local partial · capacityRepresentative=false · canHonestlyFlip=false
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`5636d58d`** / full `5636d58d7f7080159c227782c73451c6b102292a`（HOTFIX-178 dual-keep 收口后 tip · 本 worktree `line/extrev-deps-aud` 同源）
**Knife**: **EXTREV-0 DEPS-AUDIT** —— 外部评审 #106（P0·生产依赖 critical×3/high×36·CI 无依赖审计）+ #107（P1·mammoth→@xmldom/xmldom@0.8.13 多条 high DoS·无解压体积/条目上限/魔数校验）· 切片式 S1/S2/S3
**Issue ids**: **#106**（P0·第0批阻断项）+ **#107**（P1·第0批阻断项）—— issues-master.md:104 / :182（外部总表 `/Users/miaole/Documents/Meetwise学习与审查/01-成品文档/issues-master.md`）
**SOP**: `ai-docs/delivery/harness/extreview-fix-campaign-SOP.md` EXTREV-0 节（DEPS-AUDIT 行）+ 执行规则 1/2/3/4/5
**Experts**: `mw-e2e-ha`（CI 门/audit EXIT/prove 零回归诚实）+ `mw-privacy-int`（#107 守卫面/上传路径安全语义）—— stubs PENDING · 终派以协调方为准 · Ban self-approve
**Authority**: meetwise — 预执行双审 BOTH PASS 后授权 EXEC（含联网 `pnpm audit` 实跑与定向升级）；nail 归 meetwise · 本刀不翻总表行

---

## §0 立靶（依据 + 现状亲验 @ `5636d58d`）

### 0.1 依据链

- SOP EXTREV-0 批次表：DEPS-AUDIT = #106 升级+CI audit 门 / #107 xmldom+解压守卫（REQUEST 待起草·需联网实跑清单·Ban 顺带升级无关包）。
- 外部总表 #106（issues-master.md:104）：pnpm audit 60 条（critical 3 / high 36）；CI 无任何依赖审计；建议升级 next≥15.5.24、fastify≥5.12.1、proxy-addr≥2.0.8、xmldom 等 + CI 加 `pnpm audit --prod` 门禁与 Dependabot/Renovate。
- 外部总表 #107（issues-master.md:182）：简历 .docx 直达 mammoth→@xmldom/xmldom@0.8.13（多条 high DoS），无解压体积/条目上限与魔数校验；建议随 #106 升级 xmldom/mammoth + 解析前校验 zip 条目数与解压后总大小。
- **SOP 执行规则 4**：#106 核实栏明示「audit 2026-10-09 在旧快照实跑；最新代码 lockfile 零变化，**未重跑需联网**」——评审清单属「未重跑」类，**刀内 prove 必须先实跑坐实再修**。60 条/critical×3/high×36 为评审时点数（advisory 库滚动），当前真实数以 EXEC 实跑导出为准；本文档（docs 阶段）**不实跑**（docs-only），EXEC 义务见 §1 S1 第一步。

### 0.2 lockfile 与声明面现状亲验（起草席逐行亲读 @ `5636d58d`·worktree `line/extrev-deps-aud`）

| 处 | 评审基线 file:line | 现状亲验 | 判定 |
|---|---|---|---|
| pnpm-lock.yaml | :3132 | `next@15.5.19:`（:3132 精确命中） | ✓ 属实 |
| pnpm-lock.yaml | :2567 | `fastify@5.8.5:`（:2567 精确命中） | ✓ 属实 |
| pnpm-lock.yaml | :2216 | `'@xmldom/xmldom@0.8.13':`（:2216 精确命中；:5507 同包 resolution 快照） | ✓ 属实 |
| pnpm-lock.yaml | :3102 | `multer@2.1.1:`（:3102 精确命中；:6650 快照） | ✓ 属实 |
| apps/web/package.json | :36 | 现状 **:37** `"next": "^15.5.0"` | 属实·行号漂 +1（SOP 规则 1 预期内） |
| apps/api/package.json | :70 | 现状 **:73** `"fastify": "5.8.5"`（**精确 pin·无 `^`**） | 属实·行号漂 +3 |
| packages/domain/package.json | :38 | :38 `"mammoth": "^1.12.0"` 精确命中 | ✓ 属实 |

### 0.3 传递链亲验（谁拉入了 @xmldom/xmldom 与 multer）

- pnpm-lock.yaml:6257-6259：`mammoth@1.12.0` → `'@xmldom/xmldom': 0.8.13`（mammoth 声明面 `^0.8.6`·npm 最新 mammoth@1.13.0 仍 `^0.8.6` → 0.8.x 线内可解，不必 override——EXEC 实定）。
- pnpm-lock.yaml:4373-4378：`@nestjs/platform-express@11.1.27` → `multer: 2.1.1`（platform-express 为 @nestjs/core optionalDependencies 链；API 主体走 @nestjs/platform-fastify——multer 是否入 `--prod` 图由 EXEC `pnpm audit --prod` 实跑定，不预断）。

### 0.4 CI 无审计门亲验

`.github/workflows/`（ci.yml/deploy.yml/governance-history.yml/ha-probe-multi.yml/nightly.yml/pages.yml/release.yml）逐 grep：**零** `pnpm audit`/`npm audit` 步；ci.yml 步面= gitleaks→install→docs:check→各 prove→arch→容器构建→db 冒烟。`.github/` 无 dependabot.yml、无 renovate 配置。→ #106「CI 无任何依赖审计」**属实**。

### 0.5 #107 守卫缺失面亲读（packages/domain/src/resume-extract.ts）

- **:88-91**（:89 精确命中评审）：`docx` 分支 `await withExtractTimeout(mammoth.extractRawText({ buffer }))` —— 前置**零** zip 条目数/解压总大小/魔数校验，字节直达 mammoth。
- **:29**：`m.includes('msword') || f.endsWith('.docx') || f.endsWith('.doc')` —— `.doc`（旧格式·非 zip）与 `.docx` 同归 `docx` 分支 → `.doc` 必在 mammoth 失败且错误不明确（#107「拒绝 .doc 明确错误」面）。
- **:53-60**：仅有 8s Promise 竞速超时（`EXTRACT_TIMEOUT_MS` 默认 8000）——竞速不终止解析（#108 面·**非本刀**）。
- apps/api/src/modules/resume/resume.controller.ts **:23-28** 精确命中：`@Post('file')` `uploadFile` 薄适配层（新错误码若需透传仅此处+service 最小面）。

### 0.6 基线态披露（防归罪错位）

`pnpm docs:check` @ `5636d58d` 本 worktree 实跑 **EXIT=1**（`public_text_policy:PTP_FILE_LIMIT:4103`>2048 上限）——**既有红·先于本刀存在**。EXEC prove 采**前后对照**判据（本刀不得使其恶化），禁静默改绿/禁归罪本刀。

---

## §1 范围（切片式 · S1/S2/S3 各自独立 prove 判据 · 可独立裁决 PASS/FAIL）

### S1 —— audit 实跑坐实 + 定向升级 + lockfile diff 审计 + 全仓冒烟（#106 主面）

1. **EXEC 第一步（坐实义务·SOP 规则 4）**：联网实跑 `pnpm audit --prod --json` 导出**当前真实清单**存 receipt（与评审 60 条逐条对照·增/减登记；critical 逐条列名包+advisory）。
2. **定向升级（仅坐实清单+评审点名面）**：`next`（apps/web/package.json:37·目标 ≥advisory 修复版·调研值 ≥15.5.24，Ban 跨大版本跳 16）；`fastify`（apps/api/package.json:73·现精确 pin 5.8.5 → 目标 ≥5.12.5·调研值见 §3 表；改声明或升 pin 由 EXEC 定并记 receipt）；`@xmldom/xmldom`（mammoth 链·0.8.x 线内 ≥0.8.15·锁文件级刷新或 overrides 由 EXEC 实定）；`multer`/`proxy-addr` 等 transitive **仅当实跑 `--prod` 清单仍在列**才随列升级。
3. `pnpm install`（pnpm@10.18.0·lockfileVersion 9.0）→ **lockfile diff 审计**：只许目标包+其传递闭包变更；任何非 advisory 相关行变更=违例（见 §5 Ban）。
4. 全仓 prove 冒烟零回归（§4 表）。

**S1 prove 判据**：① 前后两份 audit receipt（升级后 `pnpm audit --prod` **critical=0** 且评审点名 4 包的 high 清零；剩余 high/medium/low 逐条列名留档=Non-claim 面）；② lockfile diff 审计记录（只含目标闭包）；③ §4 冒烟面全 EXIT 0（docs:check 前后对照不恶化）。

### S2 —— CI audit 门禁 + 依赖更新自动化（#106 CI 面）

1. `.github/workflows/` 加 `pnpm audit --prod --audit-level=critical` 门（**critical>0 = red**；high 不挡门——与 §7 Non-claims 一致）。
2. 新建 `.github/dependabot.yml`（或 renovate 配置——二选一，EXEC 定并在 receipt 记取舍理由；npm ecosystem·周频·分组最小化）。

**S2 prove 判据**：① 门禁**负例**——临时工作区回退 `next@15.5.19` 后本地跑同命令 **EXIT≠0**（证门禁真会红·**不 push**·不留分支）；② 正例——S1 完成态同命令 EXIT=0；③ workflow YAML 语法校验过（actionlint 有则用）；④ dependabot 配置 schema 校验过。**不动 ci.yml 既有其他步骤**（CI-WIRING 交叠见 §2）。

### S3 —— #107 解析守卫（resume-extract.ts 面）

1. `docx` 分支前置守卫（:88-91 面扩展·在 mammoth 之前）：**zip 条目数上限** + **解压总大小上限**（条目 uncompressed 声明求和或流式累计·上限常量默认值 EXEC 定并注释写死依据）+ **PK\x03\x04 魔数嗅探**（非 zip → 明确错误码·如 `corrupt_docx`）。
2. **`.doc` 显式拒绝**：:29 的 `.doc` 与 `.docx` 拆分——`.doc` 给明确错误码（如 `legacy_doc_unsupported`），不再落 mammoth 必败路径；错误码透传最小面（controller :23-28/service/contracts 局部登记·**不重构错误信封**——#88 归 API-HARDEN）。
3. PDF 面 `%PDF-` 魔数嗅探仅顺带于格式分派处（同函数·不扩权）。

**S3 prove 判据**：① 既有 `pnpm -C packages/domain prove:resume-extract` 零回归（正例：正常 docx/pdf/text 提取输出不变）；② 新增负例 prove：多条目 zip/超大解压声明/坏魔数/`.doc` 各断言对应错误码（EXIT 0 且断言真）；③ 与 #108（worker_threads/竞速语义）、#109（完整魔数体系/图片 MIME 白名单/text toString）边界无侵（§2）。

---

## §2 非范围（防双改/防扩权 · SOP 规则 2/3）

- **非 CVE/advisory 相关包零顺带升级**（含 lockfile 无关行·禁借机 `pnpm update -r`）。
- **零产品行为改**：升级后 API 兼容冒烟即止；正例提取输出不变（S3 判据①）；禁借升级重构。
- **Ban 生产镜像变更**：`Dockerfile`/`docker/` 不动（依赖升级经 lockfile 生效，镜像面另刀）。
- **#108**（提取移 worker_threads/超时 terminate 语义/:53 竞速）与 **#109**（完整魔数体系/图片 MIME 白名单/text 分支 toString）各归其刀——本刀 S3 仅 :88-91 前置守卫 + :29 `.doc` 拆分 + docx/pdf 分派处魔数，**不碰** :53 超时语义、不建图片白名单、不改 text 分支。
- **CI-WIRING 刀交叠**（SOP 规则 3·先立项归 CI-WIRING）：#96 typecheck 全包门/#155 新 prove 纳 CI/#98 E2E nightly/#114 neg CI/#175 drift——本刀 S2 **只加** audit 门+Dependabot，ci.yml 既有步骤零改。
- high×36 中非点名包的批量升级、剩余 medium/low —— 另批（Dependabot 渐进收）。
- 矩阵/backlog/checklist SSOT **仅 nail 时改**（硬规则 8）；总表 #106/#107 行状态翻转归协调方。

---

## §3 改动清单（预期文件面 · docs 阶段零写入）

| 文件 | 切片 | 改动（目标版本=**「≥advisory 修复版·EXEC 实定」**·附 docs 阶段联网调研值） |
|---|---|---|
| apps/web/package.json:37 | S1 | `next` → ≥15.5.24（调研：2026-08-25 安全版·两条 critical 未认证 RCE——图片优化 AVIF RCE + Windows 宿主 RCE·15.5 Maintenance LTS 修复版即 15.5.24·线内已至 15.5.27） |
| apps/api/package.json:73 | S1 | `fastify` 5.8.5 → ≥5.12.5（调研：评审建议 ≥5.12.1 之后新出 GHSA-4mh8-r7rc-xpvc/CVE-2026-92081·HTTP/2 trailer 未处理异常 DoS·修复 5.12.5=npm latest） |
| pnpm-lock.yaml | S1 | @xmldom/xmldom 0.8.13 → **≥0.8.15**（mammoth@1.12.0 `^0.8.6` 范围内：GHSA-w2rr-34g9-rvrj/CVE-2026-83605+83607 修复 0.8.14；CVE-2026-83608 ≤0.8.14 受影响修复 0.8.15 → 0.8.x 线内最小修复版 **0.8.15**）；multer 2.1.1 → **≥2.3.0**（GHSA-wc9g-mqfw-jrwm/CVE-2026-77078·high DoS crafted multipart field names·2026-08-31 Express 安全版·2.2.0 仍在受影响列·npm latest 2.4.0）——两者均以 EXEC 实跑 `--prod` 在列为前提；proxy-addr ≥2.0.8（#106 附带·express 链·同前提） |
| packages/domain/src/resume-extract.ts | S3 | :88-91 前置守卫 + :29 `.doc` 拆分 + 分派处 PK/%PDF 魔数（亲读现状见 §0.5） |
| apps/api/src/modules/resume/resume.controller.ts:23-28（+service 最小面） | S3 | 仅新错误码透传；packages/contracts 仅局部错误码登记（不重构信封） |
| .github/workflows/（ci.yml 加步或新 workflow） | S2 | `pnpm audit --prod --audit-level=critical` 门 |
| .github/dependabot.yml（新建） | S2 | npm ecosystem 周频（或 renovate·二选一） |
| ai-docs/delivery/receipts/extrev-deps-audit/ | S1/S2/S3 | EXEC 落 CMD+EXIT+前后清单+diff 审计 |

---

## §4 prove（EXEC 契约 · 每切片独立判据 · prove 一次优先 · CMD+EXIT 记 receipt）

| 面 | 命令 | 期望 | 切片 |
|---|---|---|---|
| audit 前清单 | `pnpm audit --prod --json` | 导出 receipt（坐实义务第一步） | S1 |
| audit 后清单 | `pnpm audit --prod` | **critical=0**·点名 4 包 high 清零·剩余列名 | S1 |
| lockfile diff | `git diff pnpm-lock.yaml` 审计 | 只含目标包+传递闭包 | S1 |
| web | `pnpm -C apps/web typecheck` / `prove:middleware` / `prove:public-copy`（+ `build` 若 EXEC 判需真编译面） | EXIT 0 | S1 |
| api | `pnpm -C apps/api validate` / `smoke:toolchain` / `smoke:contract` / `smoke:display-names` | EXIT 0 | S1 |
| domain | `pnpm -C packages/domain prove:resume-extract` | EXIT 0（S3 后含新负例断言） | S1/S3 |
| root | `pnpm typecheck` / `pnpm arch` | EXIT 0 | S1 |
| docs | `pnpm docs:check` | **前后对照**不恶化（基线红 PTP_FILE_LIMIT:4103·§0.6 披露） | S1 |
| 门禁负例 | 临时回退 next@15.5.19 跑同 audit 命令 | EXIT≠0（不 push） | S2 |
| 门禁正例+配置 | audit 步 EXIT 0 + workflow/dependabot 校验 | 过 | S2 |

硬规则 11：EXEC 与双审对 `ai-docs/engineering/NEXT-NODE-BEST-PRACTICES.md` §A/§B/§C 逐条核对（升级面涉 §A Next.js/§B NestJS）；违反项当刀修或登记技术债，禁 silently 通过。

---

## §5 Ban

- **Ban 全量升级**（`pnpm update -r`/借机大版本跳 next 16/借机重构）· **Ban 顺带升级非 advisory 包**
- **Ban `--force` / `pnpm audit --fix` 盲跑**（audit --fix 属全量面·升级逐包定向+diff 审计）
- **Ban 忽略 peer 冲突强行装**（peer/unmet 冲突=**停手上报**·禁任何 strict 放水开关）
- **Ban 生产镜像变更**（Dockerfile/docker/ 不动）· Ban 改 ci.yml 既有步骤（CI-WIRING 面）
- **Key name-only** · Ban secrets / `.env*` · Ban buy cloud · Ban Meridian · Ban force-push
- Ban self-approve / self-nail（alone ≠ dual）· Ban 翻总表 #106/#107 行状态（nail 归协调方）· Ban 矩阵/backlog SSOT 手术（nail 时才动）

---

## §6 Pins（十一值 · 照抄 NORTH-STAR-EXECUTION-LOOP §1 · 禁改口）

```
haStatus=NOT_HA
releaseEvidence=false
claimProductionHA=false
gR45Closed=true
coveredCount=8
ms3EqualsR4Closed=false
PG-retained（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）
公开 DELETE /privacy/interview-data/:id = 503
PERF/LOAD = local partial
capacityRepresentative=false
canHonestlyFlip=false
```

---

## §7 Non-claims

本文档=REQUEST 草案（docs-only·**未实跑 audit·未 install·未 run**——EXEC 义务坐实）· **升级 ≠ 漏洞清零**（剩余 medium/low 及非点名 high 另批·audit 绿 ≠ 供应链安全完璧·advisory 库滚动）· S3 守卫 ≠ 完整沙箱隔离（#108 另刀）· ≠ #106/#107 总表行 CLOSED · ≠ CI 全门体系（CI-WIRING 另刀）· 非 HA · 非 covered flip · 非 releaseEvidence · 非 nail · alone ≠ dual · PASS ≠ 关行 ≠ HA

---

## §8 STOP

状态 **`awaiting_pre_exec_dual`**：`mw-e2e-ha` + `mw-privacy-int` 预执行双审 BOTH `Verdict: PASS` + meetwise 授权后方可进 EXEC（含联网 audit 实跑）；实现不自批；nail 归 meetwise。**STOP**

*Harness · EXTREV-0 DEPS-AUDIT · 2026-10-07 · draft:awaiting_pre_exec_dual · base 5636d58d · #106/#107 · 切片 S1/S2/S3 · docs-only · Ban 顺带升级 · alone≠dual · STOP*

## rev2 双审收口（2026-10-09 · 席1 PASS+席2 PASS·三处方级+四记账级 advisory 转为 EXEC 义务）

- **A1（EXEC 硬义务）**：既有 resume-extract.proof 零真实 docx/pdf 提取正例——S1/S3 判据①的「零回归」若仅跑既有 prove 即空转；EXEC 必须新增最小真实 docx 提取正例（S3 负例 zip 构造工具面共用）并断言输出。
- **A2（EXEC 硬义务）**：守卫上限值锚——zip 条目数 ≤1000（正常 docx <100 条目含 media 余量）·解压总大小 ≤64MB（12MB bodyLimit × 压缩比合理域），实定后 receipt 记取值依据+正常 docx 正例旁证防误伤。
- **A3（EXEC 硬义务）**：docs:check 前锚以 EXEC 起点 commit 实跑值为准（本 REQUEST 自身已 +1 至 4104·预期值）——操作化=EXIT 持恒 1 且错误码集合不变；禁静默改绿。
- 记账级：fastify CVE-2026-92081 记 moderate 勿入 high 清零面·本 API 未启 http2 减害事实入 receipt；multer 零运行时参与（FastifyAdapter+base64 上传）纯供应链清账；xmldom 0.8.13 registry 已 deprecated·升级走纯 lockfile 刷新**禁 overrides**；Renovate 优先于 Dependabot（pnpm 双层 catalog 原生解析）；audit 步建议独立 workflow 文件物理零触 ci.yml；next 升级后加跑 pnpm -C apps/web build（standalone 打包承重面）；proxy-addr 两包不同源勿混记。
- Status: `draft_rev2:pre_exec_dual_PASS`（双席 BOTH PASS·EXEC 授权·S1 起跑）。
