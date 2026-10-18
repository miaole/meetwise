# Harness — **5A UPLOAD-GUARDS**（#108 简历提取硬超时=Promise 竞速不真终止 + #109 上传只信后缀/MIME 无魔数嗅探 · 一卷两题 · REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs-only · 零码面零迁移 · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE /privacy/interview-data/:id = 503 · PERF/LOAD local partial · capacityRepresentative=false · canHonestlyFlip=false
**Date**: 2026-10-16
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`d5141dfc8`**（本席 `git fetch origin` 亲证 tip 恰等派单下界 ≥d5141dfc8 · 本 worktree `line/upload-guards-draft` 同源）
**Knife**: **5A 上传守卫小刀** —— #108 简历提取 8s「硬超时」实为 Promise 竞速假终止（worker_threads terminate 真终止修）+ #109 上传格式判定只信声明 MIME/后缀、零魔数嗅探（恰判定面 + 错误码 + 负例 · DEPS S3 残面承接形判定 §1.2）· 零迁移
**Issue ids**: **#108 + #109**（5A 安全批表件 · LEDGER `:85` 词面「#108/#109 上传守卫（🔒DEPS S3）」· 外部审计总表系 · 本机外部件不入仓 · 邻接登记词面=extrev-deps-audit-REQUEST `:49`/:91）
**SOP**: `ai-docs/delivery/harness/TASK-SOP-v2.md` + NORTH-STAR-EXECUTION-LOOP（REQUEST→pre-exec 双审→EXEC→post-prove 双审→nail）
**Experts**: 预执行双审两独立外席（stubs PENDING · 终派以协调方为准 · Ban self-approve）
**Authority**: meetwise —— 预执行双审 BOTH PASS + 协调方明示授权后方可 EXEC；nail 归 meetwise · 本刀不翻批表 #108/#109 行

---

## §0 立靶（现状亲证 @ `d5141dfc8` · worktree `line/upload-guards-draft` · EXEC 立项照本节对届时 tip 重 pin——结论不变只更行号）

### 0.0 防重+祖先机检（起草席亲跑）

- `ls ai-docs/delivery/harness/ | grep -iE "upload|guard"` → 三命中=e2e-runner-stale-build-guard（e2e runner 域）/secret-checker-nul-guard（secret checker 域）/worker-hang-guard（apps/worker drain-loop watchdog 域·亲读头注判定）——**零同域刀卷占有**，本卷 `upload-guards-REQUEST.md` 系唯一占卷。
- 涉引 hash 对 HEAD `git merge-base --is-ancestor` 亲证全 **EXIT=0**：`ef5ea585a`（销案注记）/`3c4af399c`（audit-106-close nail 入线 tip）/`56680de96`（销案并线 merge）/`d5141dfc8`（本卷基线）。

### 0.1 依据链

- LEDGER `:85` 批表 5A 安全（16）行：「**#108/#109 上传守卫（🔒DEPS S3）**」——两件未收口·锁词面亲证在卷（锁失效判定 §0.5）。
- extrev-deps-audit-REQUEST `:49`：「:53-60 仅有 8s Promise 竞速超时——竞速不终止解析（#108 面·非本刀）」；`:91`：「#108（提取移 worker_threads/超时 terminate 语义/:53 竞速）与 #109（完整魔数体系/图片 MIME 白名单/text 分支 toString）各归其刀」——两题修法处方与边界词面在卷。
- extrev-deps-audit-REQUEST `:78-82` DEPS S3 守卫四件原钉面 + `:82` S3 prove 判据形（既有 prove 零回归+新增负例+边界无侵）——本卷 §1.2 承接形蓝本。
- 产品术语侧既定承诺（防「新加需求」误读）：`ai-docs/product/glossary.md:34`「MIME…上传时用于声明文件类型，**必须再由 magic bytes 复核**」——魔数复核系产品词典既有语义，本刀=兑现非扩权。

### 0.2 #108 锚：竞速点 + 底层调用面（blob 亲算 @ `d5141dfc8`）

**码面**：`packages/domain/src/resume-extract.ts`（末次码触 commit `db0d513fa`·本席 `git hash-object` 工作树 blob `e2bb7783d8a5a0358a003c9315590aa80f247162` 对 `git rev-parse HEAD:` 同路径 **恒等亲证=零漂**）：

| 处 | 现状亲证 | 判定 |
|---|---|---|
| `:53` | `EXTRACT_TIMEOUT_MS = Number(process.env.RESUME_EXTRACT_TIMEOUT_MS ?? 8000)` | 8s 硬超时声明面 ✓ |
| `:55-60` | `withExtractTimeout(p)`：`setTimeout(() => reject(extract_timeout), 8s)` 对 `p.then/clearTimeout` 竞速——**到点只 reject 外层 promise，对 `p`（真解析）零取消通道**（无 AbortSignal/terminate/destroy 传参） | **竞速不真终止=属实**（假终止面恰在此） |
| `:54` | 注释「异步解析器内部会让出,race 生效」 | 注释级误导承登：「race 生效」仅指调用方 await 解除，解析本体照跑——注释把「caller 解阻塞」混同「解析终止」 |
| `:78-86` pdf 分支 | `new PDFParse({data})` → `withExtractTimeout(parser.getText())`；`finally { await parser.destroy?.().catch(() => {}) }` | **destroy 兜底在 DoS 窗口恒空转**（见下 blob 亲证）——兜底形在、终止力不在 |
| `:88-91` docx 分支 | `withExtractTimeout(mammoth.extractRawText({ buffer }))` | **零终止面**：mammoth@1.12.0 lib 全文 grep `signal/abort/AbortSignal` **零命中亲证**——超时后转换在后台跑完为止，无任何可终止把手 |

**底层调用面 blob 亲算**（`pdf-parse@2.4.5` = `packages/domain/package.json:44` 声明 · `pnpm-lock.yaml:3891` 锁定 · 依赖包 dist 本席亲读）：

- `dist/pdf-parse/esm/PDFParse.js :147-158` `load()`：`const loadingTask = pdfjs.getDocument(...)` 系**函数局部量**，`this.doc` 只在 `await loadingTask.promise` **完成之后**才赋值——加载未完窗内 `loadingTask` 外部不可达。
- 同文件 `:33-38` `destroy()`：`async destroy() { if (this.doc) { await this.doc.destroy(); ... } }`——**`if (this.doc)` 守卫使加载未完窗内 destroy 恒 no-op**。
- 合取结论：炸弹/病态 PDF 的挂起点恰在 `getDocument` 加载解析期 → 8s 竞速到点时 `this.doc === undefined` → 现码 `finally` 的 `parser.destroy?.()` **恰在唯一需要它的窗口内必然空转**，真解析零终止继续占 CPU。全仓 grep `GlobalWorkerOptions/workerPort/setWorker` **零命中亲证**——pdf.js 走 Node 内进程路径，僵尸解析 CPU 落在 API 进程内。
- 后果面：`apps/api/src/modules/resume/resume.service.ts :51-52` 全局解析并发闸 `PARSE_MAX`（默认 6）先取槽 → `:72` `finally` 释放——超时到点槽即放行，**僵尸解析继续在跑而槽计数已归还**：「全站同时最多 6 个在解析」的 F2 纵深不变量与实际在飞 CPU 解耦，爆炸半径钉死语义被架空。错误码面：`extract_timeout` 落 `:70` else 分支 → 422 `parse_failed` 可解释降级（该面完好，本刀不动）。
- 对照面（本仓已有真 abort 先例）：`apps/api/src/modules/interview/interview.controller.ts :65-70` transcribe 面 `AbortController` 接 `req.raw` aborted/close → `asr.transcribe({signal})`——真终止形制在仓有例，resume 文件面独缺。

### 0.3 #109 锚：上传入口全集枚举 + 判定面现状

**上传入口全集**（apps/api 全 controller `@Post` 面普查+contracts base64 DTO 面普查·本席逐面亲读）：

| 入口 | 字节面 | 判定面现状 | 本刀裁定 |
|---|---|---|---|
| `POST /resume`（resume.controller `:16-21`） | 无（纯文本 DTO） | 契约 text ≥20 校验 | 无字节面·出 #109 域 |
| **`POST /resume/file`**（resume.controller `:23-28`） | `UploadResumeFileDto{filename≤255, mimeType≤255, contentBase64≤11.2M}`（contracts `:28-32`）·8MB 解码帽（service `:20`） | 格式判定= `detectResumeFormat(mime, filename)`（resume-extract.ts `:22-33`）**只信声明 MIME+文件名后缀**；buffer 字节仅 `:48-51` `/Encrypt` 加密扫描（内容扫描非格式魔数）·**零魔数嗅探** | **#109 主面** |
| `POST /interview/:id/transcribe`（interview.controller `:57-70`） | `TranscribeDto{audioBase64≤10MB}` · mimeType **闭枚举 7 值**（contracts `:139-141`） | 闭枚举白名单在面·音频字节未嗅探（直达 ASR） | 邻接面·出 #109 域（§3 登记·不入本刀恰判定面） |

**主面缺口细目**：`detectResumeFormat` 对「字节真相 vs 声明面」零校验——zip/PDF/图片/任意二进制均可伪称声明格式进入对应解析分支；图片分支更把**未验字节**以 `data:${dto.mimeType||'image/png'}` 直喂付费 OCR 视觉调用（service `:95`）——垃圾字节可白耗按次计费调用。甲改乙不改面：后缀/MIME 双侧 fail-closed（xlsx/pptx/exe 族·neg-resume `:192-197` 臂）已在，但**声明面自洽攻击**（字节真相≠声明格式）全开放。

### 0.4 DEPS S3 四守卫现状 + A1 正例

extrev-deps-audit-REQUEST §1-S3（`:78-80`）四守卫逐件现状（本席对现树亲证）：

| S3 守卫件 | 现状 | 证据 |
|---|---|---|
| ① zip 条目数上限 | **未落** | resume-extract.ts 现树零命中 |
| ② 解压总大小上限 | **未落** | 同上（A2 rev2 调研锚 ≤1000 条/≤64MB 在 REQUEST `:176`） |
| ③ PK\x03\x04 魔数嗅探（docx）+ 顺带 `%PDF-`（pdf 分派处） | **未落** | 同上——恰=本刀 #109 承接半面 |
| ④ `.doc` 显式拒绝（`:29` 拆分 · `legacy_doc_unsupported`） | **未落** | 现树 `:29` `.doc` 仍与 `.docx` 同归 docx 分支落 mammoth 必败路径 |

- **A1 正例已落**（rev2 A1 EXEC 硬义务兑现）：真实 docx 提取正例在卷——`packages/domain/test/resume-extract.proof.ts :62-113` craftDocx 手构最小 OOXML zip（`0x04034b50` 恰偏移 0·CRC32 内联·零新依赖）端到端断言输出（现 prove 25 断言全绿·nail 史录在案）——S3 判据①「正例零回归」基线真实存在非空转。
- S3 四守卫**整组未起**（`S3 未起` 词面两见：extrev REQUEST `:183`/:193）——四件全部保持残面态。

### 0.5 🔒 S3 锁失效判定链（#106 销案核·本席四步亲证）

1. **锁本体**：LEDGER `:85` 5A 批表行「#108/#109 上传守卫（**🔒DEPS S3**）」——两题判定面被锁给 DEPS 战役 S3 切片（锁意图=防双改：extrev REQUEST `:91` 明写 S3 占 `:88-91 前置守卫+.doc 拆分+分派处魔数`、#108/#109 各归其刀）。
2. **S3 从未起跑**：extrev REQUEST `:183`「S2/S3 未起」+`:193`「S3 未起」+checklist `:2183`「STILL OPEN：…S3（#107 守卫四件+A2 上限锚）·#107/#108/#109 系」三处在卷互证。
3. **所系战役线已销案**：#106 供应链审计销案笔收官——LEDGER `:11` 翻面注记（2026-10-16·批表翻面笔随令行使·`AUDIT-106-CLOSE` 销案注记 `ef5ea585a`+nail `3c4af399c` 两面闭合=①audit 数值面 critical=0 ②CI 门面 deps-audit.yml fail-closed 在仓）+checklist「Line audit-106-close nail」段（`:3677`）+LEDGER `:624` 管线行+`ai-docs/delivery/ai-capability-review/issues-final.md:584` 销案注记在卷——**「DEPS S1 战役线收口」措辞即全战役线（含未起的 S3）随之收口**。
4. **残余登记未含该面**：销案 STILL OPEN（checklist `:3682`）残余登记=18 high 定向升级 8 包清单+sprintf-js 挂账+nest12 摘钉三件——**S3/#107 守卫面不在登记**=无在飞占有者、无后继承接指针。

**判定**：🔒DEPS S3 锁失效**成立**（锁所系切片未起 × 所系战役线销案 × 残余登记未含=三条件合取）。本 5A 刀承接其**魔数嗅探半面**（承形判定 §1.2 末条）；LEDGER `:85` 行 🔒 注记更新（解锁/承接落笔）属 SSOT 写面=**归 nail 时点**（硬规则 8·本卷 draft 阶段零触 SSOT）。

### 0.6 漂移登记（评审基线 `5636d58d` 行号 vs 现树 `d5141dfc8`）

extrev REQUEST §0.5 评审锚 vs 现树：`:29 .doc` **恰等零漂**；`:53-60 竞速窗` **恰等零漂**；`:88-91 docx 分支` 现树 `:88-91` **窗内零漂**（mammoth 调用体 `:89`）。零行级纠偏需求·停止条件（锚漂超注记级）未触发。

---

## §1 修法（逐件 · EXEC 立项重 pin · 零迁移 · 零契约变更）

### 1.1 #108 真终止：worker 级 terminate + AbortSignal seam（resume-extract.ts 面）

1. **机制主刀=worker_threads 硬终止**（沿外部议题处方「提取移 worker_threads/超时 terminate 语义」原意·extrev REQUEST `:91` 词面）：`packages/domain` 内 pdf-parse/mammoth 两解析依赖移入 worker 侧入口；`extractResumeText` 保持现签名（`buffer, mime, filename`·可选第三段扩 `options?: {signal?}` 向后兼容）改宿主侧 wrapper：buffer/mime/filename 结构化克隆进 Worker，宿主以 `EXTRACT_TIMEOUT_MS`（env 语义不变·默认 8000）竞速 worker exit。
2. **到点真终止=`worker.terminate()`**：V8 isolate 整体拆除——pdf/docx 两分支同一终止面零分支差异；terminate 后按现语义 reject `extract_timeout`（错误码零新增·service `:70` 映射链零改）。worker 文件形制（同文件 `isMainThread` 自 fork vs 同包伴生件）由 EXEC 实定落 receipt，**prove 必须含 tsx loader 下 worker 启动实证**（`prove:resume-extract` 经 tsx 运行·worker 继承 loader 链系已知兼容风险点·G2 承接）。
3. **AbortSignal seam**：`options.signal` abort → terminate（caller 断连即真终止·对齐 transcribe controller `:65-70` 既有形）；service 本刀**零改**（可选参缺省不传·行为等价）。
4. **resourceLimits 硬帽**：Worker 构造带 `resourceLimits`（`maxOldGenerationSizeMb` 上限·EXEC 定值并在码注释写死依据）——炸弹文档 OOM 炸 worker 不炸 API 进程（terminate 语义的内存半）。
5. **纵深保留**：worker 内 pdf 分支 `finally destroy()` 原样保留（不依赖·不删）；`:54` 误导注释随修法改写为真终止语义注记。
6. **零迁移零契约**：`packages/db/migrations` 零触；`UploadResumeFileDto`/HTTP 形/错误码面零变；成功路径输出（`{text, format}`）逐字节不变（A1 正例即回归锚）。

### 1.2 #109 魔数嗅探守卫：恰判定面 + 错误码 + 负例

1. **恰判定面**（domain 单源·`extractResumeText` 分派点·S3 原钉「docx/pdf 分派处魔数」承接位；**不放 controller/service**——格式判定单源不动摇）：`detectResumeFormat` 声明判定之后、解析分支之前增 **字节一致性嗅探**（纯字节比对·零新依赖·沿 A1 craftDocx 零依赖纪律）：
   - 声明 `pdf` → 头 1024 字节窗含 `%PDF-`（窗依据=pdf.js 长容差现实+`looksLikeEncryptedPdf` 头窗先例；恰 0 偏严格面由 EXEC 实定落 receipt）；
   - 声明 `docx` → 偏移 0 `PK\x03\x04`（A1 craftDocx `0x04034b50` 恰 0 先例同源）；
   - 声明 `image` → 头魔数白名单恰判 {PNG `\x89PNG\r\n\x1a\n` / JPEG `\xFF\xD8\xFF` / GIF87a·89a / WEBP `RIFF`+`WEBP` / BMP `BM` / TIFF II·MM}——**即 #109「图片 MIME 白名单」面**；不中白名单一律拒（OCR 付费调用前 fail-closed·封 0.3 白耗计费面）；
   - 声明 `text` → 头部命中任一已知二进制魔数（`%PDF-`/`PK`/OLE2 `\xD0\xCF\x11\xE0`/图像族）即拒，否则直通——**即 #109「text 分支 toString」面**；`cleanResumeText` 清洗语义零改。
2. **错误码**：`magic_mismatch`（fail-closed 恒拒·不猜测真格式不放行）。HTTP 面=service `uploadFile` catch 增一分支 → 422 `{error:'magic_mismatch', hint:文件内容与声明格式不符}`（对齐 `encrypted`/`unsupported_file_format` 先例 `:59-65` 形）·controller 零改·错误信封零重构·contracts DTO 零改。
3. **负例（prove 新增断言族·craftDocx 工具面共用）**：zip 字节声明 pdf→拒；真 PDF 字节声明 docx→拒；垃圾字节声明 image/png→拒（且 OCR 路径不入）；PDF 字节声明 text/plain→拒；各断言 `magic_mismatch` 精确错误码（domain proof EXIT 0·沿 S3 判据②形）。
4. **既有臂零回归亲证**：`apps/api/test/neg-resume.proof.ts :184`/:188 `badpdf`/`mism` 两臂系 `inRange(400,499)` 容差形——`magic_mismatch`（422）**零改即绿**；错误码语义升级（parse_failed→magic_mismatch）系修法兑现面非回归·如实登记。
5. **DEPS S3 残面承接形判定**：本刀**只承接**上表 ③魔数嗅探半面（恰=#109 判定面）；S3 ①zip 条目上限 ②解压总大小上限（A2 调研锚 ≤1000 条/≤64MB 随残面带）④`.doc` 显式拆分（`legacy_doc_unsupported`）**不承接**——维持 DEPS S3 残面登记归后继刀（附如实注：③落地后「.doc 伪称 .docx」已被 PK 检查快拒，④残余仅为声明 `.doc` 的 UX 语义面非安全面）。本判定落卷后，后继并线刀/nail 时点在 LEDGER `:85` 行内注记「🔒DEPS S3→已承接（5A upload-guards·残面①②④仍开放）」。

### 1.3 否决（预否决面·防 EXEC 回摆）

- **否决 A（#108）仅强化 pdf.js destroy/AbortSignal 不上 worker**：blob 亲证 destroy 在加载未完窗恒 no-op（§0.2）+mammoth 零 abort 面——信号面单刀覆盖不了 docx 分支与恰系 DoS 窗的加载窗，假终止不除。
- **否决 B（#108）worker 池化复用**：池化与 terminate 语义互斥（终止即毁·重建代价转嫁池管理）；并发半径已由 `PARSE_MAX` 全局闸钉住，池化纯增状态面。
- **否决 C（#108）调大超时/排队熔断替代真终止**：治标不改「僵尸在跑」本体；8s 值系安全审计 F2 定值不动。
- **否决 D（#109）嗅探放 controller/service 层**：格式判定单源在 domain（S3 原钉面同此）；双层判定造双真相。
- **否决 E（#109）承接 S3 全部四守卫或引入三方 file-type 依赖**：前者越恰判定面（#109=魔数嗅探·①②④ 残面维持登记）；后者违零新依赖纪律（A1 先例）。

## §2 门矩阵（EXEC 断言 · 断言力≥3）

| # | 门 | 判据 |
|---|---|---|
| G1 | 主门（#109） | `pnpm -C packages/domain prove:resume-extract` EXIT=0——既有 25 断言（含 A1 正例）零回归+新负例族各断言 `magic_mismatch` 精确码 |
| G2 | 主门（#108） | 新 prove 臂：`RESUME_EXTRACT_TIMEOUT_MS` 注入小值+病态文档（构造挂起面）→ `extract_timeout` 按时抛出且 **worker 线程退出确认**（terminate 返回/threads 计数回落判据·EXEC 实定落 receipt）+tsx loader 下 worker 启动实证 EXIT=0 |
| G3 | 邻面零回归 | `pnpm -C apps/api neg:resume` EXIT=0（既有臂零改即绿·`:184`/:188 容差形亲证 §1.2-4）+ `pnpm -C apps/api prove:resume-reference-http` EXIT=0 |
| G4 | 全仓静态门 | `pnpm typecheck` 8/8 EXIT=0；lint 按 lint-cap-step-242 sanction 帽（root 5242/api 1423·domain 115 等）届值实测≤帽·超帽红停走 sanction 步进先例 |
| G5 | 卫生门 | 本刀改动集 markers 五类标记词 0/0+全树行首冲突标记严格形零命中 |
| G6 | docs 门 | `pnpm docs:check` EXIT=0·managed 届值≤cap **2264**（cap-sanction-2264 nail·起草时点实测 2258 本席亲跑在案·本卷落卷 +1·EXEC 时点按届时实跑如实记） |
| G7 | 面纪律门 | `git diff <base> -- packages/db/migrations` 空=0 行；`git diff --numstat` 恰本刀面（预期 ≤6 tracked=resume-extract.ts+worker 件+domain proof+neg-resume proof 增臂+service 最小面+本卷已不计）·零 lockfile 变更（零新依赖否决 E 兑现面） |
| G8 | est live=0 | prove 全静态/本地·零模型真实外呼·零生产操作·零 secrets（收据逐门登记） |

## §3 非范围（防双改/防扩权）

1. **transcribe 音频面零触**（`POST /interview/:id/transcribe`·闭枚举白名单已在·字节嗅探如立项系独立刀·§0.3 邻接面登记）；`POST /resume` 纯文本面零触。
2. **S3 残面①②④零触**（§1.2-5 判定·登记归后继）；`.doc` 分派语义零改。
3. **超时值/限流值零改**（`EXTRACT_TIMEOUT_MS` 默认·`PARSE_MAX`·`MAX_RESUME_BYTES`·`MAX_RESUME_TEXT` 全不动）。
4. **OCR 计费链零触**（`reserveEntitlement`/`confirmConsumption`/工件面·仅上游多一道魔数快拒）。
5. **SSOT 零触**（LEDGER/checklist 批表行·含 `:85` 🔒 注记更新=nail 时点面·硬规则 8）；⛔push ⛔merge 主线 ⛔force push。
6. 错误信封零重构（沿 S3 表「仅新错误码透传」纪律）。

## §4 Ban + pins

**Ban**：Ban push/force push/pull --rebase；Ban 自批（双审须独立外席）；Ban retry-to-green/masking；Ban 翻 pins（十一值·`actualSpendCny=null` 不翻）；Ban 新依赖/lockfile 变更（否决 E）；Ban 迁移越权；Ban 触 transcribe/S3 残面①②④/超时限流常量（§3）；Ban SSOT 手术（nail 时点才动）；Ban 写未亲证结论（涉引 hash 须 merge-base 亲证后落笔）；Ban secrets/`.env*`（Key name-only）；Ban buy cloud。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · PERF/LOAD local partial · capacityRepresentative=false · canHonestlyFlip=false · 脚注 `actualSpendCny=null`。

## §5 est live=0 + markers 声明

本卷 docs-only：全部断言=静态源亲读+git 亲证（§0 全表·blob 亲算含 pdf-parse/mammoth dist 依赖件）·零模型外呼·零生产操作·零 secrets·零消耗。本卷改动集（起草阶段恰 1 新增 .md=本卷）五类标记词零命中（词面运行时组装防自指·沿 5e-cleanup-sweep 卷 §7 同形制）。

## §8 STOP

状态 **`draft:awaiting_pre_exec_dual`**：预执行双审两独立外席 BOTH `Verdict: PASS` 落卷 + **协调方明示授权**后方可进 EXEC（落码面=§1 修法清单·不得改 §1 与 §4 Ban/pins·改则回炉重审）；实现不自批；nail 归 meetwise。**STOP**

**待双审/EXEC 裁决项**：①worker 文件形制（同文件自 fork vs 伴生件·G2 tsx 实证后定）；②pdf 魔数窗（1024 窗 vs 恰 0·EXEC 实定落 receipt）；③resourceLimits 定值；④LEDGER `:85` 🔒 注记更新措辞（nail 时点行使）。

---

*5A-UPLOAD-GUARDS REQUEST · 2026-10-16 起草落卷 · **STOP=`draft:awaiting_pre_exec_dual`** · base `origin/feat/mysql-schema-skeleton` @`d5141dfc8`（fetch 恰等亲证）· 分支 `line/upload-guards-draft` · 工作树 `meetwise-5ag` · 一卷两题：#108 竞速假终止（worker terminate 真终止·AbortSignal seam·resourceLimits 帽·零迁移）+ #109 魔数嗅探（恰判定面=domain 分派点·`magic_mismatch` fail-closed·负例族·DEPS S3 残面承接=仅③半面·①②④ 维持登记）· 🔒DEPS S3 锁失效四步判定链在卷（§0.5·#106 销案 `ef5ea585a`+nail `3c4af399c` 祖先亲证 EXIT=0）· 上传入口全集三面枚举（§0.3）· 门矩阵 G1-G8 · est live=0 · pins 十一值照抄零翻 · markers=0 · ⛔push ⛔merge主线 ⛔force push · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*
