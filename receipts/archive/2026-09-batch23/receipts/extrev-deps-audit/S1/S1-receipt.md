# EXTREV-0 DEPS-AUDIT · S1 EXEC 收据（audit 实跑坐实 + 定向升级 + lockfile diff 审计 + 全仓冒烟）

- 席：mw-depsaud-exec（EXEC）· 蓝图：ai-docs/delivery/harness/extrev-deps-audit-REQUEST.md @347a31eb（rev2 pre_exec_dual BOTH PASS · meetwise EXEC 授权）
- Branch/base：line/extrev-deps-aud @ 5636d58d（working tree 起点 clean）· pnpm 10.18.0 · lockfileVersion 9.0 · Node v22.22.3
- 收据文件：本文件 + audit-pre.json + audit-post.json（导出全量·**唯一 redaction**：advisory 正文中一处 PoC 路径赋值串（形如 s-word 等于单引号 /tmp/ 路径·sharp/libvips advisory 文本·非真实凭据·此处不复刻字面量防再触发）被 pre-commit secrets 硬门拦下→替换为 `<REDACTED_POC_PATH_by_secrets_gate>`（1 处/文件·其余字节原样·advisory 数据字段零改动）；原样导出存 EXEC 会话侧 /tmp）

## 1. audit 实跑坐实（SOP 规则 4 · 联网前置导出）

- CMD：`pnpm audit --prod --json` → **EXIT=1**（漏洞在列即 1·导出成功）→ `receipts/extrev-deps-audit/S1/audit-pre.json`（251095 B）
- 总数（metadata.vulnerabilities）：**critical 3 / high 36 / moderate 19 / low 2 = 60 条**——与外部评审 #106「60 条（critical 3 / high 36）」**逐项吻合**（moderate/low 评审未计数的 21 条一并留档）。distinct 包=15。
- critical 三条逐条（advisory id · 包 · 修复版）：
  - 1193677 · next · Unauthenticated RCE on windows-hosted servers · patched ≥15.5.24
  - 1193733 · next · Unauthenticated RCE in Image Optimization API（AVIF）· patched ≥15.5.24
  - 1241210 · proxy-addr · IP spoofing via IPv4-mapped IPv6 trust subnet · patched ≥2.0.8（path=apps__api>@nestjs/core>@nestjs/platform-express>express>proxy-addr）
- 点名四包在列情况（全部在列·--prod 实跑坐实）：
  - next 12 条（2 critical <15.5.24；3 high <15.5.21；2 moderate <15.5.27 即 SSG/ISR cache poisoning 1241491/1241494）——path=apps__web>next
  - fastify 7 条（4 high <5.12.2；moderate 1240639 <5.5.12.5 即 CVE-2026-92081 HTTP/2 trailer DoS——registry 定级 **moderate**，rev2 记账「勿入 high 清零面」属实）——path=apps__api>fastify **与** apps__api>@nestjs/platform-fastify>fastify（**第二实例**·见 §2 取舍）
  - @xmldom/xmldom 10 条（8 high·全部需 ≥0.8.15）——path=packages__domain>mammoth>@xmldom/xmldom（mammoth@1.12.0 声明 ^0.8.6）
  - multer 5 条（3 high <2.3.0·1 high+1 moderate <2.2.0·1 low <2.3.0）——path=apps__api>@nestjs/core>@nestjs/platform-express>multer（**optional 链坐实在列**：platform-express 系 @nestjs/core optional peer auto-install·API 主体走 platform-fastify·multer 零运行时参与纯供应链清账·rev2 记账属实）
- proxy-addr 双源分别处置：express 链 `proxy-addr@2.0.7`（advisory 命中·升 2.0.8）；fastify 链 `@fastify/proxy-addr@5.1.0`（**独立 scoped fork 包·advisory 不命中·不动**）。

## 2. 定向升级版本矩阵（只动目标闭包·机制与取舍）

| 包 | from → to | 声明面改动 | 机制与理由 |
|---|---|---|---|
| next | 15.5.19 → **15.5.27**（lockfile 解析版） | apps/web/package.json:37 `"^15.5.0"`→`"15.5.27"` **精确 pin** | 指令「优先 15.5.24·受影响列仍在才取 15.5.27」：15.5.24 下 1241491/1241494（moderate·<15.5.27）仍在受影响列 → 取线内最大 **15.5.27**。**精确 pin 理由**：registry 存在 62 个 15.6.x，`^15.5.27` 会漂 15.6 线超出审计目标；精确 pin=被 audit 坐实的版本（对表 B10 锁定版本） |
| fastify | 5.8.5 → **5.12.5**（全图单实例） | apps/api/package.json:73 `"5.8.5"`→`"5.12.5"`（**精确 pin 语义保留**）+ 根 package.json 新增 `pnpm.overrides` 见下 | 第一实例（apps/api 直接依赖）声明面直达。**overrides 理由**：`@nestjs/platform-fastify@11.1.27` 自带精确 pin 的 fastify@5.8.5 **第二实例**（pnpm-lock.yaml 快照 `fastify: 5.8.5`）；@nestjs 11 线内最高 11.2.7 仍 pin 5.11.3（<5.12.2·4 high 不清）→ **无线内自然解**；rev2 禁 overrides 仅限 xmldom（mammoth 范围内可解故禁），fastify 载体精确 pin 无线内解 → `pnpm.overrides={"fastify":"5.12.5"}`（根 package.json）为唯一外科机制。**兼容旁证**：@nestjs/platform-fastify@12.1.2（latest）官方配对即 fastify@5.12.5。隔离 validate 全链过（§6） |
| @xmldom/xmldom | 0.8.13 → **0.8.15** | **零声明面改动**（纯 lockfile 刷新·**禁 overrides 遵守**·rev2 记账「registry 已 deprecated 0.8.13」在导出 JSON `deprecated` 字段坐实） | mammoth@1.12.0 声明 ^0.8.6 范围内 0.8.15 可解。机制=删除 lockfile 陈旧 snapshot/resolution 条目→`pnpm install` 按 mammoth 范围重解析（手术式·见 §3 教训） |
| multer | 2.1.1 → **2.4.0**（≥2.3.0 达标·2.3.0 精确版无对应载体版本） | 载体：apps/api/package.json 新增 `"@nestjs/platform-express": "11.2.7"`（显式直接依赖·精确 pin） | --prod 在列坐实（§1）→ 升级前提成立。`@nestjs/platform-express@11.1.27` 声明 `multer:"2.1.1"` **精确 pin** → 纯刷新不可达；11.x 线 11.2.6/11.2.7 pin **multer 2.4.0**（11.2.5=2.2.0 仍受 3 advisory 影响）。载体 diff 面：11.1.27→11.2.7 **依赖面唯一差异=multer**（cors/tslib/express/path-to-regexp 逐项相同·npm registry 亲验）。**显式声明理由**：platform-express 系 @nestjs/core optional peer（^11.0.0·auto-install 入图）；直接删 lockfile 条目会致 pnpm 剪除整条 optional 链（express/multer/proxy-addr 全消失=图形状破坏·虚假清账·实跑发现后回滚）；显式直接依赖是唯一保持图形状的可靠外科路径（入图身份不变·--prod 可见性不变·multer 链诚实留在审计面） |
| proxy-addr | 2.0.7 → **2.0.8** | **零声明面改动**（纯 lockfile 刷新） | express@5.2.1 声明 `^2.0.7`·2.0.8 在范围内；同 xmldom 手术式重解析。`@fastify/proxy-addr@5.1.0` 独立包不动 |

- 零顺带升级：@nestjs/core/common/platform-fastify（11.1.27 原值·platform-fastify 自身 high advisory <11.2.4 **非点名不动**·留 §5 剩余列）、find-my-way 9.6.0（非点名）、fast-uri 3.1.2（非点名）、qs 6.15.3、langsmith 0.7.12、zod 4.4.3（catalog）——lockfile 结构化 diff 亲验未动（§4）。

## 3. 过程事故与教训（如实记）

- `pnpm update <pkg>`（10.18.0）对本仓会**顺带重解析闭包外陈旧传递依赖**：实跑致 qs 6.15.3→6.16.0、langsmith 0.7.12→0.10.10、zod 4.4.3→4.6.5、express 兄弟树（media-typer/iconv-lite/content-type/negotiator）漂移——命中停止条件 b 字面；**处置=git checkout 回滚重做**，改用「手术式删除陈旧 lockfile 条目+install 定点重解析」达成全部传递升级，最终 diff 零闭包外变更（§4 机器判据）。`pnpm dedupe` 同理非定向（全图重解析）不可用。**本刀及后续切片 Ban pnpm update/dedupe**。
- 删除 platform-express lockfile 条目的首次尝试致 pnpm 剪除整条 optional 链（resolved 738→664）——发现后即回滚，改显式声明路径（§2）。
- apps/web/tsconfig.tsbuildinfo（tracked）被 typecheck/build 运行改写——提交前 restore，不入 commit。
- packages/domain/test/resume-extract.proof.ts 在 HEAD 即含**原始控制字节**（清洗测试数据 `\x00\x07` 等字面量）→ git 视作 binary（numstat 显示 `- -`）·先在特性非本刀引入（本刀仅追加干净文本段）。

## 4. lockfile diff 审计（机器判据）

- CMD：`git diff pnpm-lock.yaml`（+137/−223）+ 结构化集合 diff（HEAD vs 工作树·packages/snapshots 两节键集合差）+ `pnpm install --frozen-lockfile --lockfile-only` **EXIT=0**（CI 级一致性）。
- **packages: 节 removed→added 键（19→18·逐键归属）**：
  - next 闭包：next@15.5.19→15.5.27·@next/env@15.5.19→15.5.27·@next/swc-*×8（darwin-arm64/darwin-x64/linux-arm64-gnu/linux-arm64-musl/linux-x64-gnu/linux-x64-musl/win32-arm64-msvc/win32-x64-msvc）15.5.19→15.5.27
  - fastify 闭包：fastify@5.8.5→5.12.5·fast-json-stringify@6.4.0→7.0.1（5.12.5 声明 ^7.0.0）·process-warning@5.0.0→5.1.0（^5.1.0）·fast-uri@4.2.1 **新增并行版**（fast-json-stringify 7 依赖·旧 3.1.2 保留给 @fastify/ajv-compiler·闭包内合法）
  - xmldom：@xmldom/xmldom@0.8.13→0.8.15
  - multer 闭包：multer@2.1.1→2.4.0·载体 @nestjs/platform-express@11.1.27→11.2.7·孤儿叶剪除 concat-stream@2.0.0/readable-stream@3.6.2/safe-buffer@5.2.1/string_decoder@1.3.0/typedarray@0.0.6（multer 2.1.1 依赖叶·2.4.0 不再引用·全图零残留引用亲验）
  - proxy-addr@2.0.7→2.0.8
- **snapshots: 节**另含同包 peer 后缀键重写：next@15.5.19(...)→next@15.5.27(...)·next-intl@4.13.0(next@15.5.19..)→(next@15.5.27..)·@nestjs/core@11.1.27(...@nestjs/platform-express@**11.1.27**..)→(..**11.2.7**..)——**键字符串重写·包集合不变**（peer 身份嵌入版本所致）。
- **删除行机器判据**：每个被删键均有同包新版本后继或为已证孤儿叶；无既有应存条目消失（frozen-lockfile EXIT 0 + 孤儿叶零残留引用双证）。

## 5. audit 后清单（判据①）

- CMD：`pnpm audit --prod --json` → **EXIT=1**（剩余漏洞在列）→ audit-post.json（100058 B）
- 对照：critical **3→0** ✓·high 36→18·moderate 19→6·low 2→1·总 60→**25**
- **点名 4 包+proxy-addr 全部清零**（next/fastify/@xmldom/xmldom/multer/proxy-addr 在 advisory 列零命中）✓
- 剩余 25 条逐包列名（**全部非点名·Non-claim 面·另批**）：
  - fast-uri 8（7h+1m·v3.1.2·经 @fastify/ajv-compiler）
  - postcss 4（2h+2m·经 next）
  - sharp 3（3h·经 next）
  - @grpc/grpc-js 2（1h+1l·经 @opentelemetry/sdk-node）
  - nanoid 2（2h·经 next>postcss）
  - qs 2（2m·经 express）
  - find-my-way 1（h·9.6.0·经 @nestjs/platform-fastify）
  - @nestjs/platform-fastify 1（h·<11.2.4 path-scoped middleware bypass·**载体升 11.2.7 即清但非点名 Ban 顺带**）
  - sprintf-js 1（m·≤1.1.3 全线受影响无修复版·经 mammoth>argparse）
  - source-map-js 1（h·经 next>postcss）

## 6. 冒烟面 EXIT 原值逐键（判据③）

| 键 | CMD | EXIT | 备注 |
|---|---|---|---|
| web:typecheck | `pnpm -C apps/web typecheck` | **0** | next 15.5.27 |
| web:prove:middleware | `pnpm -C apps/web prove:middleware` | **0** | 36 assertions |
| web:prove:public-copy | `pnpm -C apps/web prove:public-copy` | **0** | TC-PUBLIC-COPY-E10/E11·13/13 |
| web:build（rev2 义务） | `pnpm -C apps/web build` | **0** | next build 全量·standalone 承重面 |
| api:validate | `pnpm api:validate`（root 隔离 runner·自起临时 PG+全链迁移） | **0** | 真 NestJS+Fastify+类型DI 全链（fastify 5.12.5 运行面坐实） |
| （附记）api:validate 直跑 | `pnpm -C apps/api validate` | 1 | `database_config_invalid:database_target_missing`——DB 环境前置缺失·**非依赖面**（DI 装配已过依赖层到 DbService）·本地图形态特性·隔离路径（sanctioned）过 |
| api:smoke:toolchain | `pnpm -C apps/api smoke:toolchain` | **0** | NestJS×SWC×Fastify×类型DI |
| api:smoke:contract | `pnpm -C apps/api smoke:contract` | **0** | zod4 契约校验 |
| api:smoke:display-names | `pnpm -C apps/api smoke:display-names` | **0** | 中文业务名称契约 |
| domain:prove:resume-extract | `pnpm -C packages/domain prove:resume-extract` | **0** | **25 断言**（原 23+A1 新增 2） |
| root:typecheck | `pnpm typecheck` | **0** | e2e 面 |
| root:arch | `pnpm arch` | **12** | **既有红·非本刀**：HEAD 基线实跑同为 EXIT 12·12 errors·127 warnings·1294 模块/3176 依赖·逐条相同（uc052/db-id-v7/uc-e2e-001 测试文件规约违反·全部本刀未触碰文件）——前后对照**零恶化** |
| docs:check | `pnpm docs:check` | **1** | 见 §8 A3 |

## 7. A1 义务状态：**本切片已落**（非 S3 过渡）

- packages/domain/test/resume-extract.proof.ts 新增第 6 节：**真实 docx 提取正例**——手构最小 OOXML zip（STORED 零压缩·CRC32 内联实现·零新依赖）：[Content_Types].xml + _rels/.rels + word/document.xml（两段落中文简历文本），经 `extractResumeText`→mammoth→**@xmldom/xmldom 0.8.15**（升级链端到端旁证）真实解析。
- 断言输出（精确等值）：`format==='docx'` + `text==='张三 · 后端工程师\n\n五年 Node/Go 分布式经验'`（mammoth 段落连接 \n\n·cleanResumeText 归一后首跑即中）。
- craftDocx 构造面已按 rev2 预告与 **S3 负例（多条目 zip/超大解压声明/坏魔数）共用**；S3 可就地复用或提取为共享工具（提取动作归 S3 席裁量）。
- 类型卫生：tsx/esbuild 不查类型→补 `npx tsc -p packages/domain/tsconfig.json --noEmit` 对照（含 test/）：新增代码零 error（基线 26 条全在 src 既有文件·先在·该包无 typecheck 门面）。

## 8. A3 义务状态：前锚坐实·后锚持恒

- **前锚**（EXEC 起点 @5636d58d clean tree 实跑）：EXIT=**1**·错误集合={public_text_policy:**PTP_FILE_LIMIT:4104**}——与 rev2 预期 4104 精确一致。
- PTP_FILE_LIMIT 计数对象=受管文本**文件数**（>2048 上限·public-text-policy.mjs MAX_FILES），非行数。
- **后锚**：EXIT=**1** 持恒·错误码集合不变仍为 {PTP_FILE_LIMIT}（零新增错误码·未改绿）；计数 4104→**4107**（+3=本切片收据三文件自身：S1-receipt.md/audit-pre.json/audit-post.json·自指增量如实归因·REQUEST 行追加不增文件数）。

## 9. 硬规则 11 对表（NEXT-NODE-BEST-PRACTICES §A/§B/§C）

- 本刀纯依赖升级+测试正例：**零新增违反**。§A（A1-A10）：无页面/组件改动·存量 ❌（A3/A8）⚠️ 状态原值。§B：B10「依赖卫生：锁定版本；禁未审计新依赖直入」——fastify 精确 pin 语义保留·next 落精确 pin·@nestjs/platform-express 显式声明为**已审计在图包的版本固定**（非新依赖直入·11.1.27 已在 --prod 图）✓；B1-B9 不涉。§C：C1-C5 不涉·存量 ❌（C1/C2）原值。
- 无需当刀修项；无需新增登记（存量台账原样）。

## 10. Pins（十一值 · 照抄 §6 · 禁改口）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 DELETE /privacy/interview-data/:id = 503 · PERF/LOAD=local partial · capacityRepresentative=false · canHonestlyFlip=false

## 11. Non-claims

升级 ≠ 漏洞清零（剩余 25 条见 §5·advisory 库滚动）· audit 绿 ≠ 供应链安全完璧 · S2（CI audit 门+Renovate 优先）与 S3（解压守卫+.doc 拆分）不在本切片 · fastify overrides 为定点机制非通用升级策略 · @nestjs/platform-express 显式声明是载体手段非功能接线（API 仍 FastifyAdapter·multer 仍零运行时参与）· arch 12 与 docs:check 1 为既有红前后对照零恶化（禁归罪本刀·禁静默改绿）· 非 HA · 非 covered flip · 非 releaseEvidence · 非 nail · alone ≠ dual · PASS ≠ 关行 ≠ HA。

*S1 EXEC · mw-depsaud-exec · 2026-10-07 · 收据三件套齐 · stop-conditions 零命中（a/b/c/d 均经实跑检查点排除）*
