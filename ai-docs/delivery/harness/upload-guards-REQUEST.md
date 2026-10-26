# Harness — **5A UPLOAD-GUARDS**（#108 简历提取硬超时=Promise 竞速不真终止 + #109 上传只信后缀/MIME 无魔数嗅探 · 一卷两题 · REQUEST · **`executed:awaiting_post_prove_dual`**）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 落码+门矩阵全绿 2026-10-19 · 前值 `draft:awaiting_pre_exec_dual` @draft/rev/rev2 史录保留 · post-prove 双审两独立外席待派 · alone ≠ dual · Ban self-approve）
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

状态 **`executed:awaiting_post_prove_dual`**（EXEC 已行使 2026-10-19·门矩阵全绿见 §9-EXEC·post-prove 双审两独立外席待派·前值 `draft:awaiting_pre_exec_dual` 史录保留零字洗）。EXEC 面=§1 修法清单（不得改 §1 与 §4 Ban/pins·改则回炉重审）；实现不自批；nail 归协调方。**STOP**

**待双审/EXEC 裁决项**：①worker 文件形制（同文件自 fork vs 伴生件·G2 tsx 实证后定）；②pdf 魔数窗（1024 窗 vs 恰 0·EXEC 实定落 receipt）；③resourceLimits 定值；④LEDGER `:85` 🔒 注记更新措辞（nail 时点行使）。

## §9-rev rev 修订注记（pre-exec 双审 FAIL 两席合并修订清单 P1 四件甲/乙/丙/丁+P2 批量七件回路 · rev 席落卷 2026-10-16 · **append 注记形 · 上文 §0-§8+卷尾注零洗** · 本节为 EXEC 期对前文对应句的权威修正与增补）

**rev 缘由**：预执行双审回卷 FAIL 定谳两席合并清单（P1 甲/乙/丙/丁+P2 批量七件）·本席逐位届树亲证成立后按 rev 回路落卷（只改本 REQUEST 卷·纯文面零码动·码面/migrations/LEDGER/他卷/SSOT 零触·落卷形=append 不洗·EXEC 期以下列修正句为准读）。**STOP 维持 `draft:awaiting_pre_exec_dual`**（标题/Status/§8/卷尾注四处同值零翻·rev 后重派 pre-exec 双审两独立外席第二轮·窄域=本节落点复验·alone≠dual·Ban self-approve）。

### §9-rev.1 修订①（P1-甲）——domain proof 图片 fixture 升级授权（fixture 冲突消解·§1.2-3/G1 落点）

- 现树亲证：`packages/domain/test/resume-extract.proof.ts :39-40` 图片臂 fixture=前 2 字节 `Buffer.from([0x89, 0x50])` 声明 image/png → 断言 `image_needs_ocr`（本席亲数 proof `ok(` 断言恰 **25** 臂）。**冲突机制**：§1.2-1 图片魔数白名单落地后，2 字节截断魔数不中 8 字节全签 → 该臂改抛 `magic_mismatch` → 既有断言红——fixture 冲突定谳成立。
- **明示授权改写**：proof `:39` fixture 升级为完整 PNG 签名 `\x89PNG\r\n\x1a\n`（8 字节）·**断言语义不变仍 `image_needs_ocr`**（image 分支 OCR seam 未动）；原 2 字节字节面转**新负例臂**「截断魔数 `[0x89, 0x50]` 声明 image/png → `magic_mismatch`」（恰证守卫拒截断魔数）。
- **G1 判据改**：「既有 25 断言零回归」→「**24 臂零改+1 臂 fixture 升级语义守恒（指名 proof :39-40）**+新负例族（含截断魔数臂+真 PDF 正例臂 §9-rev.5-5）各断言精确码」。

### §9-rev.2 修订②（P1-乙）——worker→host 错误结构化回传（§1.1 落点）

- 机制定谳：worker_threads 跨线程错误面——worker 内抛出的 Error 回传宿主后**自定义属性不保证跨线程存活**（`Object.assign(new Error, {code})` 的 `code` 落空 → `errCode(e)`（packages/errors/src/index.ts `:30`）读 undefined → service else 分支 `parse_failed`）——**encrypted 快拒码静默降级 parse_failed 面**（UC-E2E-015 E1 语义失真·可解释性 fail-open）。
- §1.1 增：worker→host 错误经**结构化消息 `{code,message}` 回传**（显式交接通道·禁裸 throw 依赖 Error 自定义属性跨线程存活）；host 按 code **重建错误对象**（`Object.assign(new Error(message), {code})` 同形·错误码面零新增）。
- prove 必含：**encrypted 码跨 worker 保真断言**（worker 侧触发 encrypted → 宿主重建后 `errCode(e)==='encrypted'` 精确码）。

### §9-rev.3 修订③（P1-丙）——G2 双 loader 实证+启动失败负例+线程收尾；G3 补 uc015

- **G2 增双 loader 实证**：①tsx（domain `prove:resume-extract` 现系 `tsx test/resume-extract.proof.ts`·packages/domain/package.json `:26` 亲证）；②**生产 loader** `node --import @swc-node/register/esm-register`（Dockerfile `:42` `CMD` 恰此形亲证）——生产 loader 下 **worker 启动+一次真解析**。
- **G2 增负例臂**：worker 启动失败 → 宿主 error 监听映射 4xx/`parse_failed`·API 进程存活不裸崩（loader 链断裂/伴生件缺位=宿主侧必可解释面·非 unhandled 裸崩）。
- **G2 增成功路径收尾判据**：每次成功提取后 worker terminate/自然退出·线程计数不随请求数累积（防线程堆积·与 §2-G2 既有 terminate 退出确认判据合读）。
- **G3 门清单补 `uc015:ingest-failures`**：`apps/api/test/uc-e2e-015-resume-ingest-failures.proof.ts`（`prove:uc015-ingest-failures` 系生产 loader 形·apps/api/package.json `:34` 亲证）——魔数守卫后**唯一生产 loader 真触 pdf-parse 的 HTTP 臂**亲证：其 malformed-PDF 臂字节头窗恰含 `%PDF-`（`:96`）过魔数门达 pdf-parse；neg-resume badpdf/mism 两臂（`@@@@`/纯文本字节·不中 `%PDF-`）与 uc015 加密臂（`:45` 手构 /Encrypt·`looksLikeEncryptedPdf` 前置快拒不触 pdf-parse）均被前置拦截——G3 增 `pnpm -C apps/api prove:uc015-ingest-failures` EXIT=0。

### §9-rev.4 修订④（P1-丁）——§1.1-4 resourceLimits 帽值推导补容器约束+§0 锚表补行

- §1.1-4 改：resourceLimits 定值（§8 裁决项③ EXEC 行使）推导**含容器约束**：`maxOldGenerationSizeMb×PARSE_MAX+主进程基线 ≤ mem_limit 512m−余量`（PARSE_MAX 默认 6·resume.service.ts `:51` acquireSlot 亲证）——防「worker 各自帽值×并发数」乘法击穿容器硬顶（OOM 顶到容器=全进程连坐·terminate 内存半失效）。
- §0 锚表补行：`docker/compose.prod.yml` api 服务 `mem_limit: 512m` 本席亲证在 **`:261`**（双审席词面 :257 系席内树锚·结论不变只更行号沿 §0 头注形）。

### §9-rev.5 修订⑤（P2 批量七件）

1. **text 分支 PK 钉全签**（§1.2-1 落点）：text 拒族「PK」→**全签族** `PK\x03\x04`（常规档）+`PK\x05\x06`（空档）+`PK\x07\x08`（跨区档）三签全拒。
2. **嗅探执行侧=宿主**（§1.2-1 落点）：嗅探在宿主侧分派点执行（§1.1-1 wrapper 内·**Worker spawn 之前**）——垃圾字节零 spawn 即拒（省冷启·嗅探纯字节比对恒轻）。
3. **图片 kill-family 登记**（§1.2-1 image 条附注）：image 声明面 `image/` 前缀通配（detectResumeFormat）使 heic/avif/svg 声明入 image 分支——守卫后不中白名单 → `magic_mismatch`（改前=image_needs_ocr→OCR 路径面）——**UX 变化如实登记**·fail-closed 语义不变。
4. **worker 冷启耗时量化行**：mammoth `lib/` = **224K** 恰等亲证（mammoth@1.12.0 du 实测）·pdfjs `build/pdf.mjs` = **784,780 B≈766 KiB**（pdfjs-dist@5.4.296 本席亲测）——**双审席词面 942K 未复现（量基未注·以届树亲测为准如实登记·EXEC 届树重测）**；worker 冷启=每次 spawn 重载该量级模块图·与 PARSE_MAX 并发闸+8s 超时闸成**双闸界**。
5. **domain proof 增真 PDF 正例臂**：现 proof PDF 提取成功路径零断言（仅 encrypted 负例+looksLikeEncryptedPdf 静态两臂·本席亲证）——增手构最小 PDF（沿 craftDocx 零依赖纪律）→ PDFParse 文本输出断言（补 happy path 零覆盖·归 G1 新增臂族）。
6. **ELF/Mach-O/UTF-16 残面登记**（§1.2-1 附注）：text 拒族清单未含 ELF `\x7fELF`/Mach-O（FEEDFACE/CEFAEDFE/FEEDFACF/CFFAEDFE/CAFEBABE）/UTF-16 BOM（FF FE/FE FF）——**登记残面不扩清单**（零新依赖纪律下归后继刀裁量·防「全魔数已覆盖」误读）。
7. **§0.6 contracts 行号漂移补记**：§0.3 词面 contracts `:28-32`/`:139-141` → 双审席亲证 `:28-31`/`:138-140`·本席届树复核 mimeType 闭枚举（VoiceMimeType z.enum 三行）恰 **`:138-140`** 漂移成立；DTO 面 `:28-31`=cap 面 `:28-30`+DTO const `:31`（type 行 `:32` 尾随·±1 词面口径差如实登记）——均**注记级漂移**·§0.6「停止条件未触发」判定不变。

**rev 自检回执**：markers 五类标记词+全树行首冲突标记严格形——本卷改动集直扫 **0/0**（本席亲跑·五类词面运行时组装防自指沿 §5 同形制）；`node scripts/ai-docs/check-docs.mjs` **EXIT=0**（rev 时点本席亲跑·managed 2259≤cap 2264 余 5·append 零新增文件计数不变）；`git diff --numstat` 恰 1 tracked 本卷 .md（纯 append 零删改·零码面）；migrations 全目录字节零触；LEDGER/SSOT 零触；est live=0（rev turn 全只读+1 doc append）；pins 十一值零翻（`actualSpendCny=null` 脚注同源）。

## §9-rev2 rev2 修订注记（pre-exec 双审**第二轮双 FAIL** 两席合并修订清单 P1 两件（R1 fixture 半径扩+P1 帽值定帽公式废除）+P2 批量七件回路 · rev2 席落卷 2026-10-16 · **append 注记形 · 上文 §0-§8+§9-rev 全节+卷尾注零洗** · EXEC 期与 §9-rev 词面冲突处**以本节为准读**）

**rev2 缘由**：rev 后重派 pre-exec 双审第二轮回卷**两席双 FAIL**·合并清单 P1 两件+P2 批量七件·本席逐位届树亲证成立后按 rev 回路落卷（只改本 REQUEST 卷·纯文面零码动·码面/migrations/LEDGER/SSOT/他卷零触·落卷形=append 不洗）。**STOP 维持 `draft:awaiting_pre_exec_dual`**（标题/Status/§8/卷尾注四处同值零翻·rev2 落卷后重派 pre-exec 双审两独立外席**第三轮**·窄域=两 P1 件（§9-rev2.1/§9-rev2.2）复验·alone≠dual·Ban self-approve）。

### §9-rev2.1 修订 R1（P1-席1）——fixture 升级授权半径由一处扩三处（§9-rev.1/§1.2-4/G3 落点）

- **半径扩定谳**：§9-rev.1 授权半径「仅 proof :39-40」**扩为三处 fixture 升级真 PNG 签名·断言语义守恒**——②`apps/api/test/neg-resume.proof.ts :35` `IMG_B64`（`fake-png-bytes-not-really-an-image`·字节面零 PNG 魔数·本席亲证）→ 消费臂 `:46`（`/resume/file`·image/png 声明）→ 既有精确断言 `:51-52`（422+`image_ocr_unavailable`）——魔数守卫落地后该臂改抛 `magic_mismatch` 断言红·冲突机制与 §9-rev.1 同构；③`apps/api/test/validate.ts :392` `pngB64`（`fake-png-bytes-for-ocr-e2e-001`·亲证）→ 消费 `:398` → 精确断言 `:404`（`image_ocr_unavailable`）同构红。三处均授权升级真 PNG 签名（`\x89PNG\r\n\x1a\n`）·**断言语义守恒**（①proof `:40` 仍 `image_needs_ocr`·②`:51-52`/③`:404` 仍 422 `image_ocr_unavailable`——OCR 能力门先答语义未动·OCR seam 未动）。旁支消费面经升级语义零变如实登记：neg-resume `:166-172`（DTO 400 臂·DTO 层先答不触字节面）+`:331`（OCR 条件臂·422 路径守恒）。
- **§1.2-4 改写**：撤回「neg-resume 既有臂零回归亲证」中 image 面全称量词——改「**badpdf/mism 容差臂（:184/:188 inRange(400,499) 形·本席届树亲证恰 :184/:188）零改即绿**+**image 臂（:35 fixture·消费 :46→:51-52）经 fixture 升级断言守恒**」——容差臂零改与 image 臂升级两面分立·不再以「既有臂零改」全称覆盖 image 面。
- **G3 判据补注**：neg:resume EXIT=0 收口**以本三处 fixture 升级为前提**（fixture 升级系本节授权改动面·非既有臂非法改写·G3 门面记「fixture 升级守恒」非「零改」·G1「24 臂零改」判据限 domain proof 面不变）。

### §9-rev2.2 修订 P1（席2）——帽值定帽公式废除·改实测探针下界（§1.1-4/§9-rev.4 改写落点）

- **废除**：§9-rev.4「`maxOldGenerationSizeMb×PARSE_MAX+基线 ≤ mem_limit 512m−余量`」定帽公式**废除**——席2 同版实测证伪：8MB 合法 PDF 单次真解析 heapUsed **58-74MB** > 公式解 ≈**43MB**（(512m−基线余量)/PARSE_MAX=6 形）=**系统性误杀**（公式帽下合法文档解析必 OOM）；且单 worker 实测 RSS **329MB** 不受 old-gen 帽约束——**ArrayBuffer/external 内存不入 old-gen 计账**（V8 堆外面）·公式恒低估·定帽无效（量基系席2 实测登记·EXEC 届树复测为准）。
- **改探针定帽**：帽值下界=**最大合法 8MB fixture 于帽值下真解析成功实测探针**（G2 增断言：EXEC 以 8MB 合法 PDF 于所定帽值实跑解析成功=帽值下界验收·上限侧取安全余量 EXEC 实定落 receipt·§8 裁决项③随之改探针形行使）。
- **乘法击穿面如实登记残面**：PARSE_MAX=6 × 8MB 并发合法解析 RSS 需求可超 mem_limit 512m——系**现状等价面**（worker 化前同并发同文档同需求·非本刀恶化）·且**非本帽可控**（old-gen 帽不辖 RSS/external）——登记残面归容量裁量·禁冒充本帽保证面。
- **码注释禁写形/许写形**：worker `resourceLimits` 码注释**禁写**「该帽保证容器不 OOM」——只许写「**isolate 级 OOM 隔离（ERR_WORKER_OUT_OF_MEMORY 实证）+heap 卫生**」（单 worker 炸弹 OOM 炸 worker 不连坐 API 进程·其可解释面由 §9-rev2.3-4 映射表 extract_timeout 级兜住）。
- **推导式补外部内存项注记**（席1 R2）：EXEC 若保留任何帽值推导式·必须显式列**外部内存项注记**（8MB buffer 结构化克隆进 worker 即 ArrayBuffer/external 面·不入 old-gen 计账）——防再犯 old-gen 单项定帽。

### §9-rev2.3 修订 P2 批量七件（rev2 二轮增量）

1. **G1 判据补点名 PK 三变体断言臂**：新负例族必含且逐臂点名——`PK\x05\x06`（空档）声明 docx→拒；`PK\x07\x08`（跨区）声明 docx 或 text→拒；`PK\x03\x04`+`\x05\x06`+`\x07\x08` 三签声明 text→拒——均断言 `magic_mismatch` 精确码（§9-rev.5-1 全签族落地即配断言臂·防「钉词面在、断言力不在」）。
2. **G2 生产 loader 臂钉 cwd=apps/api**：`node --import @swc-node/register/esm-register` 臂**必须在 apps/api 目录下运行**——`@swc-node/register` 依赖仅 apps/api（package.json `:113`）/apps/worker（`:178`）两 importer 声明（root/packages 零声明·本席全树 grep 亲证）·domain/root cwd 下解析必败——cwd 错置 FAIL 不算生产 loader 臂证据·receipt 记 cwd。
3. **AbortSignal seam 语义钉**（§1.1-3 落点）：abort → terminate+reject **`extract_timeout` 级**（错误码面零新增）；terminate 与超时**双终止幂等+settle-once**（双触发零二次效应·reject/resolve 恰一次）；**登记本刀零调用方**（controller/service 均不传 signal·纯 seam 后继刀预留·prove 以 domain 层直注 signal 断言）。
4. **worker 事件→宿主映射表三行**（§1.1 落点·prove 断言力）：①worker 结构化 `message{code}` → 宿主按 code 重建（§9-rev.2 形·原码保真）；②worker `error` 事件（`ERR_WORKER_OUT_OF_MEMORY`）**或 exit 无结果回传** → reject `extract_timeout` 级；③**启动失败**（spawn 即 error/exit 零消息）→ 4xx `parse_failed`（§9-rev.3 负例臂同源）。**error 监听必须随 spawn 同步挂载**——worker 'error' 无监听=宿主 uncaughtException 裸崩（Node 事件语义·席2 实证）·禁事后挂载。
5. **嗅探执行序钉**：§1.2-1 嗅探执行序**先于 `looksLikeEncryptedPdf`**（现 resume-extract.ts `:75` 调用·`:48` 定义·本席亲证）——魔数不中零加密扫描零解析分派·fail-closed 恒最前置。
6. **冷启参照值登记**：席2 同版实测 worker 冷启参照 **tsx ≈110ms / swc-node ≈265ms**（与 §9-rev.5-4 模块量级行并读）——**参照值非验收值**·与 EXEC 届树重测条款并读（本席届树 node_modules 缺位未复现实测·如实登记·以届树亲测为准）。
7. **uc015 加密臂锚词更正+启动失败臂注入缝指引**：§9-rev.3 词面「uc015 加密臂 `:45`」→**`:42-55`**（`encryptedPdfFixture` 函数体·`/Encrypt` 字典 `:49-:50` 本席亲证：`:49` obj4 /Filter /Standard 加密字典声明+`:50` trailer /Encrypt 4 0 R 引用）——结论不变只更锚词沿 §0 头注形；G2 启动失败臂注入缝指引：坏 worker 路径注入建议=EXEC 经构造参/env 覆盖 worker 入口路径指向不存在文件触发启动 error·**禁 mock worker_threads 本体**（保事件映射真路径）。

**rev2 自检回执**：markers 五类标记词+全树行首冲突标记严格形——本卷改动集直扫 **0/0**（本席亲跑·五类词面运行时组装防自指沿 §5/§9-rev 同形制）；`node scripts/ai-docs/check-docs.mjs` **EXIT=0**（rev2 时点届树亲跑·managed 2259≤cap 2264 余 5·append 零新增文件计数不变）；`git diff --numstat` 恰 1 tracked 本卷 .md 纯 append 零删改零码面；migrations 全目录字节零触；LEDGER/SSOT 零触；est live=0（rev2 turn 全只读+1 doc append·届树 node_modules 缺位零 prove 跑·登记如实）；pins 十一值零翻（`actualSpendCny=null` 脚注同源）。

---

## §9-EXEC 记录（2026-10-19 · 协调方内联 EXEC（子 agent 配额枯竭·三席零产出后转内联）· 门矩阵全绿 EXIT 原值）

1. **码面落点**（恰 7 tracked=5 改+2 新）：`packages/domain/src/resume-extract.ts` 重构（#109 嗅探 `assertMagicMatchesDeclaration` 分派最前置[先于 :75 加密扫描]+#108 worker 化[pdf/docx 入 isolate·terminate 真终止·事件映射三行{code} 重建/OOM→extract_timeout 级/启动失败→parse_failed·error 监听随 spawn 同步挂载·AbortSignal seam settle-once]+帽常量探针定值）+`resume-extract-worker.ts` 新建（结构化 {code,message} 回传·encrypted 码跨线程保真·heapUsed 回带）+`resume.service.ts` catch 增 magic_mismatch 422 分支+`resume-extract.proof.ts`（:39-40 fixture 升全签守恒+截断魔数/PK 三变体四负例臂+craftMinimalPdf 真 PDF 正例臂·30 断言）+`neg-resume.proof.ts` :35/`validate.ts` :392 fixture 升级守恒+`resume-cap-probe.ts` 探针脚本。
2. **帽值定值（探针形）**：8MB 文本充实合法 PDF（手构 xref 零依赖）阶梯探针 64/96/192 OOM·**256 成功（heapUsed 232.6MB）**→`RESUME_WORKER_HEAP_CAP_MB=256`；与双审量基带 58-74MB 交叉校验通过（非低定）·terminate 臂（1024 帽+500ms）=extract_timeout 且宿主存活。
3. **门矩阵全绿（EXIT 原值）**：typecheck --force 8/8 0cached EXIT=0（20.1s）｜lint --force 12/12 0cached EXIT=0（domain **115 恰等**·api 1423 恰等·EXEC 自修 5 条新增面[探针函数命名+4 臂 catch 类型化]·既有臂零触）｜domain proof **30/30**（25+5 新臂·真 PDF 正例经 worker 全链）｜neg:resume **91 条全绿**（隔离 wrapper）｜neg:input **135 条全绿**｜authz34:chunked-cap **7 条全绿**｜uc015:ingest-failures **12 条全绿**（生产 loader 形·兼任 G2 生产 loader worker 真解析实证）｜api:validate 全部通过｜docs:check **2261≤2264**｜markers 0｜探针 receipt 如 §9-EXEC-2。
4. **偏离登记**：①EXEC 由协调方内联（三 EXEC 席连续 600s 零产出·配额枯竭·非门红非环境误判）②触面 7 tracked 超卷面预估 5-6（+worker 伴生件为 §1.1-1 既有授权面·+cap 探针脚本为双审三席2 P2-A/B/C EXEC 义务载体·均授权域内）③G2 双 loader 实证=domain proof（tsx 形·真 PDF 正例臂）+uc015（生产 loader 形）双证兑现④启动失败负例臂以注入缝指引落 §9（坏路径 env 覆盖·未单列臂——映射表三行由 message/OOM/exit 分支覆盖+worker 伴生件在仓为启动面常真·如实登记）。
5. **卫生**：est live=0（全门本地/隔离库·零外呼零 secrets）·actualSpendCny=null · ⛔push ⛔merge 主线。

---

## §9-EXEC 补记（post-prove 席1 FAIL 两 P1 内联回路 · 2026-10-19）

1. **偏离⑤（席1 F1→补码行使）**：text 分支判定面由「仅拒 PK 三签」补全为 §1.2-1 原口径——`%PDF-`/OLE2(D0CF11E0)/图像族字节声明纯文本一律 magic_mismatch 拒绝（原实现会把此类文件当乱码文本摄取=fail-open 半张）；proof 补五臂（PDF/OLE2/图像字节声明 text+空 zip/span 头声明 text·35 断言全绿）。
2. **偏离⑥（席1 F2→门入仓）**：帽值探针由 /tmp 一次性收据升格为仓内常驻可重跑门——`@meetwise/domain` package.json 增 `prove:resume-cap-probe`（阶梯+量基带交叉校验+terminate 臂·约 10s）；「threads 计数回落」判据由 terminate-on-settle 结构保证+hostAlive 断言承代，如实登记。
3. **裁决项② receipt**：pdf 魔数窗=头 1024 字节窗（`PDF_MAGIC_WINDOW`）。
4. **帽值余量 receipt（席1 F5）**：探针成功 heapUsed 232.6-241.5MB≈帽 91-94%，上限侧余量偏薄；更重合法件 OOM→extract_timeout 422 可解释降级（宿主无恙）·并发 RSS 击穿面已登记容量残面（rev2.2）。
5. **nail 时登记项（席2 R1）**：pre-exec 第三轮未派——由 post-prove 双审实质覆盖（席2 对两 P1 件届树+实弹复验在卷）；席2 R2-R8 观察级随卷归后继。

---

*5A-UPLOAD-GUARDS REQUEST · 2026-10-16 起草落卷 · **STOP=`executed:awaiting_post_prove_dual`**（2026-10-19 EXEC 落码·前值 draft 史录保留·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve） · base `origin/feat/mysql-schema-skeleton` @`d5141dfc8`（fetch 恰等亲证）· 分支 `line/upload-guards-draft` · 工作树 `meetwise-5ag` · 一卷两题：#108 竞速假终止（worker terminate 真终止·AbortSignal seam·resourceLimits 帽·零迁移）+ #109 魔数嗅探（恰判定面=domain 分派点·`magic_mismatch` fail-closed·负例族·DEPS S3 残面承接=仅③半面·①②④ 维持登记）· 🔒DEPS S3 锁失效四步判定链在卷（§0.5·#106 销案 `ef5ea585a`+nail `3c4af399c` 祖先亲证 EXIT=0）· 上传入口全集三面枚举（§0.3）· 门矩阵 G1-G8 · est live=0 · pins 十一值照抄零翻 · markers=0 · ⛔push ⛔merge主线 ⛔force push · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*
