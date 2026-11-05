# Harness — **S3-UPLOAD-CAPS**（extrev-deps-audit S3 残面窄化小刀·#107 解压守卫 docx 解包前置双帽 · REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-11-05 EXEC 行使落卷（nail 期 rebase 并线 CAP-SANCTION-2487 union 承值 2486→2487·届时零码改动沿 IDU 先例·详 §9 EXEC 注记）·前值 **`draft:awaiting_pre_exec_dual`**（起草含码落卷即停·沿 IDU/ISO-DOTENV-PERF 先例 draft 含码·pre-exec 双审两独立外席留协调方派席·alone≠dual·Ban self-approve·行翻面权归协调方·est live=0·`actualSpendCny=null`·markers=0·⛔push ⛔merge 主线 ⛔force push）史录保留·**rev r4 2026-11-06（post-prove FAIL 复验报告裁决=FAIL·P0×1+P1×1+P2×6·本刀系 FAIL 处置修订：别名读放大 P0 宿主 FATAL 关闭+§3 如实改写·详 §9 rev r4 注记）**·**rev r5 2026-11-06（post-prove 双席裁决=双 FAIL·核对路 P1 基线崩溃不可复现+证伪路 P0 512m cgroup OOM 杀宿主 18/18/P1 机密全量可见·本刀系 FAIL 处置修订：宿主 OOM 保护+机密隔离+IPC 安全+错误码区分+并发排队公平+样本入仓·详 §9 rev r5 注记）**·post-prove 双席留协调方派席·alone≠dual·Ban self-approve·翻面权归协调方·est live=0·`actualSpendCny=null`·⛔push ⛔merge 主线 ⛔force push）【状态钉四处：本行+§8+§9+卷尾·同值】
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · `actualSpendCny=null`（十一值照抄同族卷·本刀零翻转）
**Date**: 2026-11-05
**Base / parent tip**: `origin/main` **`fd2b74635`** / full `fd2b74635806057785f22e6f717dbb6d3187df12`（=main HEAD `fd2b74635` #205 g7w-status-pin 并线点·fetch 届值亲证恒等·本 worktree `meetwise-s3caps` branch `line/s3caps-draft` 建前零同名卷/零第二认领三查亲证）
**Knife**: **S3-UPLOAD-CAPS** —— extrev-deps-audit S3 残面窄化：#107 解压守卫处方落地（docx 解包前置·zip central directory 手读零新依赖·条目数/解压总量双帽 fail-closed）+负例两向/恰帽边界/正例旁证 proof 落码+CAP-SANCTION-2485 起草随刀恰等步进
**Issue ids**: **#107**（P1·外部审计总表 issues-master.md:182——resume .docx 无解压体积/条目上限·本刀承其守卫处方；#106 CI audit 门/依赖升级两面归 extrev-deps-audit S1/S2·本刀零触）——守卫帽值口径=extrev-deps-audit-REQUEST.md:176 rev2 A2 预登记值（条目 ≤1000/解压总量 ≤64MB）
**SOP**: `ai-docs/delivery/harness/extreview-fix-campaign-SOP.md` EXTREV-0 节 DEPS-AUDIT 行 S3 残面 + 本仓 AGENTS.md 文档先行/测试先行总原则
**Experts**: pre-exec 双审两独立外席（§0 锚保真+§1 逐字节 spec+§2 断言预算）留协调方派席·stub PENDING·Ban self-approve
**Authority**: meetwise —— 预执行双审 BOTH PASS 后授权 EXEC；nail/翻面/关账权归协调方·本刀不翻总表行

---

## §0 立靶（依据 + 现状亲验 @ `fd2b74635`）

### 0.1 依据链

- 协调方派单令 2026-11-05（S3-UPLOAD-CAPS 起草席·draft 含码·沿 IDU/perf 先例·修法/负测/卷/cap/自验/commit 六步清单随令）。
- extrev-deps-audit-REQUEST.md §1-S3（#107 解析守卫切片）+ rev2 A2（:176）：**「zip 条目数 ≤1000（正常 docx <100 条目含 media 余量）·解压总大小 ≤64MB（12MB bodyLimit × 压缩比合理域）」**——帽值预登记·EXEC/本刀不得改口。
- 外部总表 #107（issues-master.md:182）：简历 .docx 直达 mammoth→jszip 解包面·无解压体积/条目上限（多条 high DoS 面）。

### 0.2 现状亲验表（起草席逐行亲读 @ `fd2b74635`·行号系修前值）

| 处 | 修前 file:line | 现状亲验 | 判定 |
|---|---|---|---|
| packages/domain/src/resume-extract.ts | :34 | `detectResumeFormat` docx 分派（`wordprocessingml`/`msword`/`.docx`/`.doc` 同归 docx 分支） | ✓ 属实 |
| 同上 | :78-99 | `assertMagicMatchesDeclaration` 魔数门：:82 pdf 臂 `%PDF-`·:85 docx 臂 PK`\x03\x04`·:91 text 臂拒 zip 三签·:93 text 臂拒 OLE2 | ✓ 属实 |
| 同上 | :101/:105 | 既有防线：`EXTRACT_TIMEOUT_MS` 8s 提取硬超时 + `RESUME_WORKER_HEAP_CAP_MB` 256MB worker isolate 堆帽（resourceLimits :117） | ✓ 属实 |
| 同上 | :184-187 | docx 分支魔数门后**直达** `runInWorker('docx', buffer)`（:113-155 spawn 形）——worker 内才解包 | ✓ 属实 |
| packages/domain/src/resume-extract-worker.ts | :34 | `mammoth.extractRawText({ buffer: m.buffer })`——解包真身=mammoth 内部 jszip（pnpm-lock.yaml :3382/:7794 `jszip@3.10.1`·mammoth ^1.12.0） | ✓ 属实 |
| rg 亲证 | packages/domain/src 全域 | `entryCount\|uncompressedSize\|FileHeader\|EndOfCentralDirectory` 零命中——**零条目数帽/零解压总量帽**（解压炸弹借合法 PK 头过魔数门后在 jszip 解压面炸内存的面敞开） | ✓ 缺位属实 |
| apps/api/src/main.ts | :158 | `bodyLimit: 12 * 1024 * 1024`（12MiB 传输信封帽·非解压面·帽值域依据引此） | ✓ 属实 |
| apps/api/src/modules/resume/resume.service.ts | :52-75 | 域错误码映射：:63 `encrypted`/:67 `magic_mismatch` 显式 422·:74 **未知码兜底 `parse_failed` 422**（fail-closed——新码域层出码即被可解释拒绝·不裸崩） | ✓ 属实 |
| packages/domain/test/resume-extract.proof.ts | :107-136 | `craftDocx` 手构最小 zip（STORED·CRC32 内联·零新依赖）工具面·A1 真例 :137-144 | ✓ 属实 |
| extrev-deps-audit-REQUEST.md | :176 | rev2 A2 帽值预登记（≤1000/≤64MB） | ✓ 属实 |

### 0.3 残面定性

extrev-deps-audit S1（audit 实跑+定向升级）/S2（CI audit 门+Renovate）两切片已收口（n/rev2 双审收口节在卷）；S3 守卫切片中魔数嗅探已由 #109 波落主线（:78-99 现值），**剩解压双帽一残面**——本刀即此窄化：守卫落码+负例落 proof+cap 步进，零 S1/S2 面（lockfile/CI/workflow/deps 全零触）。

---

## §1 修法（逐字节块·届时行号 @ 本支 `line/s3caps-draft` 落码后亲证）

### 1.1 件① packages/domain/src/resume-extract.ts——文件头注 :11-13 追加 #107 守卫段

```ts
 * #107 解压守卫:docx 解包前置——zip central directory 手读(零新依赖)核条目数/解压总量双帽,
 * 越帽或结构不可核一律 fail-closed(zip_entry_overflow/zip_uncompressed_overflow/zip_directory_invalid)
 * ——炸弹字节零 worker spawn 零解包,进不了 mammoth→jszip 解压面。
```

### 1.2 件② 同文件 :104-168 新增守卫节（帽常量+签名常量+守卫函数·魔数门节后 EXTRACT_TIMEOUT_MS 前插·rev r1 守卫增两行 fail-closed 自洽检·rev r3 增 zip64 哨兵六字段检+注释区余量检·行号系 rev r3 落码后届值亲证·rev r1 行号为届值史录）

- :106-113 处方锚注（#107 处方·帽值两行依据：正常 docx <100 条目含 media 余量·12MB bodyLimit × 压缩比合理域·声明合计守卫=解包前零解压成本定夺·zip64 哨兵 0xFFFFFFFF 天然越帽·rev r3 增 EOCD 六字段哨兵锚注两行）；
- :112-113 帽常量：`const DOCX_ZIP_MAX_ENTRIES = 1000;` / `const DOCX_ZIP_MAX_UNCOMPRESSED_TOTAL = 64 * 1024 * 1024;`
- :114-115 签名常量：`ZIP_EOCD_SIG = 0x06054b50`（PK\x05\x06）/ `ZIP_CDH_SIG = 0x02014b50`（PK\x01\x02）；
- :117-124 rev r3 增 zip64 哨兵常量：`ZIP64_SENTINEL_16 = 0xffff` / `ZIP64_SENTINEL_32 = 0xffffffff`——取值依据=jszip zipEntries.js:190 zip64 判定全集所比常量：MAX_VALUE_16BITS=65535（utils.js:381）/MAX_VALUE_32BITS=**-1**（utils.js:382·其 `readInt(4)` 系 32 位符号回绕算术，0xFFFFFFFF 字节形读作 -1，与无符号 0xFFFFFFFF 字节形恒等）；六字段=diskNumber/diskWithCentralDirStart/centralDirRecordsOnThisDisk/centralDirRecords（各 16 位·EOCD +4/+6/+8/+10）+centralDirSize/centralDirOffset（各 32 位·EOCD +12/+16）；
- :126 `zipGuardErr` 工厂（沿 `mismatch()` :79 同族 Object.assign 形）；
- :128-136 doc 注（读法/三码/fail-closed 语义/前插数据失配同拒如实披露/rev r3 zip64 哨兵+注释区余量两行）；
- :138-168 守卫函数（export·沿 `assertMagicMatchesDeclaration` export 先例·rev r1 增 :159 预走读 EOCD 自洽检+:168 走读后 CD 区耗尽检——**两检所闭=EOCD 声明面谎报类，非整类**：EOCD 六字段任一命中 zip64 哨兵时 jszip 弃声明面走 zip64 EOCD 覆写路径（`readBlockZip64EndOfCentral` 以攻击者 zip64 记录覆写 centralDirRecords/Size/Offset 后按覆写值另读一张目录），声明面自洽检对该类失效——C5 实锤：EOCD+8 recordsOnDisk=0xFFFF（守卫只读 +10/+12/+16·良性 CD 3 条目全自洽）→守卫声明面 PASS→mammoth 全链 ACCEPT 151 条目。rev r3 修法=:147 注释区余量检（声明 commentLen > 缓冲余量即拒·与 jszip readData 读法恒等）+:148-155 哨兵六字段检任一命中即 `zip_directory_invalid`——12MB 信封帽下合法 docx 不可能 zip64（zip64 为 >4GB/>65535 条目而生），拒绝零误伤面·帽值常量/三错误码零变）：

```ts
export function assertDocxZipWithinCaps(buffer: Buffer): void {
  const EOCD_MIN = 22;
  if (buffer.length < EOCD_MIN) throw zipGuardErr('zip_directory_invalid');
  const scanFloor = Math.max(0, buffer.length - EOCD_MIN - 65535);
  let eocd = -1;
  for (let i = buffer.length - EOCD_MIN; i >= scanFloor; i--) {
    if (buffer.readUInt32LE(i) === ZIP_EOCD_SIG) { eocd = i; break; }
  }
  if (eocd < 0) throw zipGuardErr('zip_directory_invalid');
  if (buffer.readUInt16LE(eocd + 20) > buffer.length - eocd - EOCD_MIN) throw zipGuardErr('zip_directory_invalid');   // 注释区声明不越缓冲余量
  if (
    buffer.readUInt16LE(eocd + 4) === ZIP64_SENTINEL_16 ||     // diskNumber
    buffer.readUInt16LE(eocd + 6) === ZIP64_SENTINEL_16 ||     // diskWithCentralDirStart
    buffer.readUInt16LE(eocd + 8) === ZIP64_SENTINEL_16 ||     // centralDirRecordsOnThisDisk
    buffer.readUInt16LE(eocd + 10) === ZIP64_SENTINEL_16 ||    // centralDirRecords
    buffer.readUInt32LE(eocd + 12) === ZIP64_SENTINEL_32 ||    // centralDirSize
    buffer.readUInt32LE(eocd + 16) === ZIP64_SENTINEL_32       // centralDirOffset
  ) throw zipGuardErr('zip_directory_invalid');                 // zip64 覆写路径触发面:命中即拒,守卫审的目录=jszip 实读的目录
  const totalEntries = buffer.readUInt16LE(eocd + 10);
  if (totalEntries > DOCX_ZIP_MAX_ENTRIES) throw zipGuardErr('zip_entry_overflow');
  const cdOffset = buffer.readUInt32LE(eocd + 16);
  if (cdOffset + buffer.readUInt32LE(eocd + 12) !== eocd) throw zipGuardErr('zip_directory_invalid');   // EOCD 自洽:cdOffset+cdSize 恰抵 EOCD
  let p = cdOffset;
  let uncompressedTotal = 0;
  for (let n = 0; n < totalEntries; n++) {
    if (p + 46 > eocd || buffer.readUInt32LE(p) !== ZIP_CDH_SIG) throw zipGuardErr('zip_directory_invalid');
    uncompressedTotal += buffer.readUInt32LE(p + 24);   // central directory uncompressedSize 声明值
    if (uncompressedTotal > DOCX_ZIP_MAX_UNCOMPRESSED_TOTAL) throw zipGuardErr('zip_uncompressed_overflow');
    p += 46 + buffer.readUInt16LE(p + 28) + buffer.readUInt16LE(p + 30) + buffer.readUInt16LE(p + 32);
  }
  if (p !== eocd) throw zipGuardErr('zip_directory_invalid');   // CD 区恰被 totalEntries 条耗尽
}
```

机制要点：EOCD 自尾反向扫（注释区 ≤65535+22 上界）·条目数先核后走读（守卫自体 O(≤1000) 零 DoS 面）·EOCD 自洽双检（rev r1：预走读 `cdOffset+cdSize` 恰抵 EOCD·走读后 CD 区恰被 `totalEntries` 条耗尽——jszip 按签名连续走读不用 EOCD `totalEntries` 定界，谎报 `totalEntries`/双 CD `cdSize` 操纵形守卫声明面 PASS 而 jszip 全链 ACCEPT，两检合用闭**声明面谎报类** fail-closed；该类≠整类——zip64 覆写类由 rev r3 哨兵检另闭，见上）·rev r3：注释区声明 ≤ 缓冲余量（与 jszip readData 越界即抛的读法恒等，消除守卫放行而解析器抛错的判定缝）+zip64 哨兵六字段任一命中即拒（zipEntries.js:190 判定全集——命中任一 jszip 即弃声明面走覆写路径，守卫所审目录与 jszip 实读目录分叉；12MB 信封下合法 docx 不可能 zip64，拒绝零误伤）·CDH 定长 46+name+extra+comment 变长步进·`p+46 > eocd` 先检后读零 OOB·全字段小端·零新依赖（纯 Buffer 读）。

### 1.3 件③ 同文件 :251-255 docx 分支守卫接线（:255 守卫调用·先于 worker spawn·rev r3 行号随守卫重 pin·rev r1 届值 :230-234/:231 史录）

```ts
  if (format === 'docx') {
    assertDocxZipWithinCaps(buffer);   // 解压守卫恒先于 worker spawn:越帽/不可核字节零解包零 isolate 占用
    const raw = await runInWorker('docx', buffer, options?.signal);
    return { text: cleanResumeText(raw), format };
  }
```

### 1.4 件④ packages/domain/test/resume-extract.proof.ts——craftDocx 工具面扩展 + §6b 新臂

- import :7 增 `assertDocxZipWithinCaps`；头注 :3-5 测面行（rev r1 追加 EOCD 谎报自洽检/真实三件同构变体测面行）；
- `craftDocx` :111 签名增 `opts?.centralUncompressedOverride?: (name, actual) => number`（:128 central directory uncompressedSize 声明值覆写·local header 与实体字节保持真实小体=超大声明炸弹形·老调用面零破）；
- :141-146 三真实条目提绑 `realDocxEntries`（A1 断言语义零变）；
- :151-206 §6b 新臂十五断言（基线八断言+rev r1 七增补：自洽检负例四向+真实三件变体三向）（负例两向各 guard 直证+生产缝全链双面·恰帽边界两向·结构不可核·正例旁证·EOCD 字段谎报自洽检·真实三件同构变体两向闭合）：

| # | 断言（届时行·rev r1 重 pin） | 读数 |
|---|---|---|
| 1 | :158 恰 1000 条目 guard 零抛 | 边界上界不误伤 |
| 2 | :159 恰 64MB 声明 guard 零抛 | 边界上界不误伤 |
| 3 | :161 1001 条目 guard → `zip_entry_overflow` | 负例一 guard 面 |
| 4 | :164 1001 条目经 `extractResumeText` 生产缝 → `zip_entry_overflow` | 负例一全链（反事实勘正·rev r1：无守卫时**同构含真实件**的 1001 条目 zip 被 mammoth→jszip 静默吃下——评审席 2026-11-05 亲证 18ms 提取成功；本行基线 fixture 系无 document.xml 简形，无守卫时 mammoth 拒因缺主件非拒因条目数——承重由行 13-15 同构真实件变体升为仓内机证） |
| 5 | :166 64MB+1 声明 guard → `zip_uncompressed_overflow` | 负例二 guard 面 |
| 6 | :169 真 document.xml 条目声明 0xFFFFFFFF（zip64 哨兵形）经生产缝 → `zip_uncompressed_overflow` | 负例二全链 |
| 7 | :173 PK`\x03\x04` 无 central directory 经生产缝 → `zip_directory_invalid` | 结构不可核 fail-closed（"核不了"="拒"） |
| 8 | :180 100 条目真 docx（3 真实件+97 media 形 filler）全链提取输出与 A1 恒等 | 正例旁证防误伤 |
| 9 | :188 谎报 `totalEntries=2`（CD 定界少报·CD 区残余）guard → `zip_directory_invalid` | 自洽检负例·探针1形 guard 面 |
| 10 | :191 谎报 `totalEntries=2` 经生产缝 → `zip_directory_invalid` | 自洽检负例·全链拒（worker 零 spawn） |
| 11 | :192 谎报 `cdSize`（cdOffset+cdSize 失配 EOCD）guard → `zip_directory_invalid` | 自洽检负例·双 CD cdSize 操纵形 guard 面 |
| 12 | :195 谎报 `cdSize` 经生产缝 → `zip_directory_invalid` | 自洽检负例·全链拒（worker 零 spawn） |
| 13 | :200 1001 条目真实三件形（3 真实件+998 media 形 filler）guard → `zip_entry_overflow` | 负例一变体 guard 面 |
| 14 | :203 真实三件 1001 条目经生产缝 → `zip_entry_overflow` | 负例一变体全链（拒因唯一=条目数） |
| 15 | :206 恰 1000 条目同构合法件（3 真实件+997 media 形 filler）全链必通·输出与 A1 恒等 | 负例一变体对向（无守卫反事实仓内机证·两向同 fixture 族闭合） |

- **rev r3 增补十四断言（§6b 15→29·全卷断言 50→64·届时行号 :216-285）**：zip64 哨兵六字段 C5 形负例——fixture 构造器 `craftZip64OverrideDocx`（:216·良性 CD 3 条目声明面全自洽+敌对 CD 151 条目+zip64 EOCD 记录+locator·EOCD 声明面仅单哨兵位命中：+4 diskNumber/+6 diskWithCentralDirStart/+8 centralDirRecordsOnThisDisk/+10 centralDirRecords=0xFFFF·+12 centralDirSize/+16 centralDirOffset=0xFFFFFFFF），六字段 guard 臂+生产缝双断言 `zip_directory_invalid` ×12（:270/:273 循环·worker 零 spawn·修复前该形 guard 声明面 PASS→mammoth 全链 ACCEPT=席2 实锤形）；注释区越界廉价检 guard+生产缝双断言 ×2（:282/:285·realDocx 注释区声明 0xFFFF 越缓冲余量）。正例/恰帽边界 50 基线断言零回归。

### 1.7 rev r4 修法增补（post-prove FAIL 处置·2026-11-06·登记源=复验报告 s3-final.md P0-1/P1-1·行号系 rev r4 落码后届值亲证）

**缺陷复验定谳（本席两树亲跑）**：别名读放大类——62,423B docx、诚实声明 60MB（五部件 styles/numbering/footnotes/endnotes/comments 全指回 word/document.xml，jszip 不缓存+docx-reader `.also` 三路并发重读同一条目）→守卫声明面 PASS→worker 内单次大字符串分配（80-120MB 双字节串）越 resourceLimits 堆帽→V8 `FatalProcessOutOfMemory` 直接 **abort 宿主全进程（EXIT=134/SIGABRT·"Reached heap limit Allocation failed"·本席本支亲复现 1/1）**；基线 `origin/main @92a82a944`（worktree /tmp/s3base detach 亲建·零任何帽）同文件同崩（FATAL+SIGABRT 亲复现 1/1——守卫帽原为削量而设，基线连守卫都没有）。同文件换 trio 三别名位形处崩溃带边缘（40-50MB 声明时 ACCEPT/崩交替，崩带 45-60MB 与复验报告吻合）。**worker_threads resourceLimits 对"单次大分配越堆帽"不构成宿主保护**——#108"只死 worker/宿主存活"前提被推翻，修订=隔离升级。

- **件⑥（新建）packages/domain/src/resume-extract-child.ts（:1-164·解析子进程入口）**：pdf/docx CPU 重活从 worker_threads 搬进**独立 OS 子进程**（child_process.fork）——`--max-old-space-size=${RESUME_WORKER_HEAP_CAP_MB}`+`--max-semi-space-size=32` 双 V8 帽（:227-260 宿主侧 fork execArgv·worker 形 resourceLimits old256/young32/code64 语义镜像）+`EXTRACT_TIMEOUT_MS` 到点宿主 `child.kill('SIGKILL')` 硬超时；子进程 OOM abort（SIGABRT/134）只死子进程，宿主 `exit` 无结果→`extract_timeout` 级确定错误码（:250·零新错误码）；启动失败 ENOENT→`parse_failed`（:245）；error 监听随 fork 同步挂载（#108 纪律保持）；AbortSignal seam settle-once 保持（:236-243）；serialization:'advanced'（Buffer 结构化克隆直传）；`disconnect`→子进程自灭无孤儿（:164）。**依赖解析纪律（:18-58）**：pdf-parse/mammoth 经 `createRequire` 取 **CJS 入口**（pdf-parse ESM 构建与 CJS 构建内存画像差异巨大：8MB 文本充实 PDF 实测 ESM 构建越 320MB 帽 abort、CJS 构建峰值 ~171MB 本席亲测——#108 帽值 256 探针证据链只在 CJS 画像下成立，worker 形静态 import 经 loader interop 即 CJS 画像）；解析器按 kind 惰性加载（pdf 子进程不载 mammoth/jszip 模块图）。**docx 读面加固（:63-118·与守卫层多帽互补）**：①（部件，encoding）记忆化适配器——mammoth `extractRawText({file})` 面（unzip.js openZip 对 options.file 原样放行），每部件至多解压/解码一次，别名并发读共享同一 Promise（别名放大 4-6×归一）；②按 central directory 声明值流式计量（jszip `ZipObject.internalStream('uint8array')` 逐 16KB chunk 累计，越该条目声明值即 `pause()` 中止并拒 `zip_uncompressed_overflow`）——liar（声明小实际大）在声明值处早停，不再全量膨胀后才被 jszip 事后 size mismatch 拒；③jszip 从 mammoth 依赖闭包 createRequire 解析（同实例同版本·零新依赖）。
- **件②增补 同文件 :123-128 守卫增单条目声明帽**：`const DOCX_ZIP_MAX_ENTRY_UNCOMPRESSED = 10 * 1024 * 1024;`——帽值依据=mammoth 别名读放大 ≤6×（五部件全别名实测 6 倍）×TextDecoder 双字节解码 ×2=**12 倍**，单条目声明 ≤10MB → 实读峰值 ≤120MB 远低于子进程堆帽 256MB；≤8MB 传输信封下诚实部件（media 已压缩）恒 <8MB→10MB 帽真实 docx 零误伤（17 真实件全 ACCEPT 亲测）。走读循环 :180-183 单条目声明越帽即 `zip_uncompressed_overflow`（既有错误码零新增）。**总量帽 64MB 维持 A2 预登记值不变**；单条目帽系 A2 口径增补（复验报告修订清单 1b 形·协调方随令授权"按 mammoth 的读放大重新评估单条目声明大小上限和总量上限"行使）。
- **件①增补 同文件 :196-200 域层解析并发闸**：`PARSE_CHILDREN_MAX = Math.max(1, Number(process.env.RESUME_PARSE_CONCURRENCY ?? 2))`——同时存活解析子进程上限默认 2，超额 FIFO 排队（外层服务侧 PARSE_MAX=6 全站闸不变先答，排队深度有界；排队不占自身 8s 解析超时，计时自 spawn 起）；`withParseSlot`（:218-221）包裹 pdf/docx 两分支（:296/:304）——多路并发解析内存叠加被钉死在上限×单子进程有界内存。
- **件②既有一至三帽/六字段哨兵检/两自洽检/注释区余量检（:121-186）零语义改**——r4 只增单条目帽一行，帽值常量/错误码面零变。
- **件④增补 proof 四断言（§6b 29→33·全卷 64→68·届时行号 :294-313）**：①:299 单条目声明 10MB+1 guard→`zip_uncompressed_overflow`；②:302 同 fixture 生产缝→同码（子进程零 spawn 面拒）；③:307-313 关系别名诚实件（footnotes/endnotes/comments 三部件同指 document.xml·复验崩溃形同构而声明诚实）全链提取输出与 A1 恒等（记忆化适配器零误伤）；④craftLiarDocx（:316-334·document.xml 声明 100B/deflate 实体实际膨胀 32MB）经生产缝→`zip_uncompressed_overflow` 且 <4s（:335-339·子进程流式计量早停，修复前 jszip 全量膨胀完才事后核对）。恰帽边界臂「恰 64MB 解压声明」改 7 条目均摊形（:166·单条目 <10MB 帽·帽语义恒等）；:189-193 自洽检注释措辞随 r3 勘正收敛为「声明面谎报类」（P2-3 兑现）。
- **P2-1 措辞勘正（:119-120/:134-137）**：撤「合法 docx 不可能 zip64/命中即拒零误伤面」过度声明→「主流 Office 产物不含 zip64；强制 zip64 产物（实测 Info-ZIP `zip -fz`，jszip 可读 17 条目）会被拒，系已知误伤面·fail-closed 取舍」。
- **#108 遗留表述勘正（:5-21 文件头）**：「isolate 级 OOM 隔离·宿主存活」→r4 段如实登记：worker resourceLimits 只帽 V8 old-gen，单次大分配越帽时宿主全进程 abort（复验实锤）→解析隔离升级进程级；resourceLimits 帽不构成容器内存保证（#108 既有申明维持）。

### 1.8 rev r5 修法增补（post-prove 双席 FAIL 处置·2026-11-06·登记源=两份 r4 审查：`.tmp/reviews/s3-r4-1.md`（核对路·FAIL）+`.tmp/reviews/s3-r4-2.md`（证伪路·FAIL·P0×1+P1×1+P2×11）·行号系 rev r5 落码后届值亲证）

**两路合并结论**：r4-2 P0=生产 `mem_limit: 512m`（`docker/compose.prod.yml:261`）下宿主+子进程同处一个 cgroup，子进程 RSS 只受 V8 堆参数约束，并发 2 重件叠加时内核 OOM killer 选 RSS 最大的进程=宿主（实测 18/18 HOST_EXIT=137·宿主崩溃连带泄漏 PG 解析槽租约 `0189…sql:82-105`）；r4-2 P1=fork 未传 env，子进程可见 DATABASE_URL/AUTH_SECRET/PAY_PROVIDER_SECRET/RESUME_ENC_KEY/RESUME_HASH_SECRET/RAG_REDIS_URL/RAG_QBANK_CACHE_HASH_KEY 七机密名，且清空 env 后仍可读 `/proc/$PPID/environ`；r4-1 P1=r4 立论前提「基线上 42KB 文件 10/10 崩溃」未被独立复现（核对路 0/20·机制句算术不相容），触发样本必须固化可复现；被杀/超时两条生产映射零直接断言（P2-2）。r5 处置六件（服务层对外错误码面零新增）：

- **件⑦（resume-extract.ts 行内改）宿主 OOM 保护**：`setChildOomScoreAdj`（:331）fork 后**同步**写 `/proc/<child.pid>/oom_score_adj=1000`（非 Linux 静默跳过）；子进程入口 `resume-extract-child.ts:44` 再自写一次兜底。证伪路预演 30/30 宿主存活；r5 生产镜像 A/B 实测：修复前同形 3/3 HOST_EXIT=137，修复后 HOST_EXIT=0（详 §9）。
- **件⑧（同文件 :230/:267-283 + child 文件）机密隔离**：fork 显式传最小 env（`childEnv()` :267·逐变量理由在注：NODE_ENV=loader/运行时形态标志·TMPDIR=临时目录锚非机密·此外零变量）；子进程加 `--permission`（`CHILD_PERM_ARGS` :286：`--allow-fs-read=<应用根>/`（目录授权形·尾斜杠递归整树——模块解析需逐级 readdir，实测 `/**` 深链对目录 readdir 拒绝）+allow-addons（swc 原生）+allow-worker+allow-child-process（node 包装器形态兼容面，残余如实登记））。生产镜像验证：子进程 env 名内核视图（`/proc/<pid>/environ`）仅 NODE_CHANNEL_FD/NODE_CHANNEL_SERIALIZATION_MODE/NODE_ENV 三名·七机密名+MODEL_API_KEY **零可见**；同形 permission 子进程读 `/proc/$PPID/environ`=`DENIED:ERR_ACCESS_DENIED`；docx/pdf 正常解析。
- **件⑨（同文件 :296-345）IPC 安全+文本上界**：stdio 改 `['ignore','ignore','pipe','ipc']`（:296），stderr 限量捕获 64KB（:297·溢出 resume() 弃流）；清洗与截断下沉子进程（child 文件 `clampToCap` :202·`cleanResumeText` 单源 import）——清洗后 >服务层帽（`RESUME_PARSE_TEXT_CAP=60_000` :230·对齐锚=服务层 MAX_RESUME_TEXT）只回传帽+1 字，宿主复核长度（:466-471·越帽=协议违约→child_crash），服务层 >帽→413 extracted_too_long 判定语义逐字节不变（87 样本 4 件超帽样本输出=修复前全文的逐字节前缀·sha256 机证）；子进程畸形帧（合法帧长+乱载荷→宿主通道反序列化抛 `Unable to deserialize cloned data` uncaughtException·child.on('error') 拦不住·修复前宿主 EXIT 1）由进程级 IpcCrashGuard（:308-330）捕获→SIGKILL 活跃子进程+child_crash settle，宿主不退出；非本类错误保持 Node 默认致命语义（print+exit(1) 不吞）。单条消息上界=帽+1 字（构造性成立）。
- **件⑩（同文件 :380-475）错误码按退出码/信号区分**：exit 无结果 SIGABRT/134→`child_oom`（V8 堆 OOM abort·:453）；SIGKILL/137→`child_oom`（内核 cgroup OOM killer·:454——宿主超时 SIGKILL 路径 settle-once 先行不落此）；其余无结果→`child_crash`（:456-458）；error ENOENT/模块缺失→`child_start_failed`；到点/abort→`extract_timeout`（既有）；域层排队等待越限→`extract_queue_timeout`（新内部码）。接入日志：域层 `RESUME_CHILD_FAIL code=… stderr=…`（:400-402·stderr 尾部 240 字）+服务层 `RESUME_PARSE_CHILD_FAIL code=…`（resume.service.ts:142·无 PII）。**服务层映射表（对外错误码零新增）**：child_oom/child_crash/child_start_failed→既有未知码兜底 `parse_failed` 422（resume.service.ts:150）；extract_queue_timeout→既有 `server_busy` 503 可重试（:130-132 显式臂）；extract_timeout→`parse_failed` 422（既有）。
- **件⑪（resume.service.ts + resume.controller.ts 行内改）并发与排队**：每用户同时最多 1 个解析（`acquireUserLane` :52·进程内 FIFO·弃权即放行后继）；排队等待上限 `RESUME_PARSE_QUEUE_WAIT_MS`（:26·默认 10s·双层共用同旋钮：服务层 lane+域层 FIFO `PARSE_QUEUE_WAIT_MS` :239）越限→server_busy 503 可重试；客户端断开取消（controller `:29-43`·interview transcribe/speak 同款 AbortSignal 缝形：`req.raw 'aborted'`+`reply.raw 'close'`·finally 摘监听）→排队弃权+`extractResumeText(…,{signal})`→子进程 terminate（settle-once 既有）。域层并发闸默认改 **1**（`PARSE_CHILDREN_MAX ?? 1` :236·512m 下按实测裁定，详 §9 r5 注记预算算式）。
- **件⑫（新建 scripts/resume-crash-samples/gen.mjs + packages/domain/test/resume-512m-dual.proof.ts）可复现样本与 512m 重件 proof**：生成器纯 Node zlib 手构 9 件样本（正常 1MB×2/alias5-9.9MB/deep-xml/liar-32MB/textheavy-8MB/flatebomb/textbomb20/pdf-min·零二进制入库，产物按需生成）；proof 5 断言=512m 生产参数（`--memory=512m --read-only --tmpfs noexec --cap-drop ALL --no-new-privileges --user app`）+真实宿主体量（preload AppModule）双路并发重件→宿主存活+子进程 oom_score_adj=1000·**不进 CI**（跑法见 proof 文件头：`docker build -t meetwise-resume-512m:r5 .`+`pnpm -C packages/domain prove:resume-512m-dual`·colima 须 `RESUME_512M_WORKDIR=<用户主树内绝对路径>` 指 bind mount 共享路径）。
- **件⑬（同文件 :446-452/:492-494 行内改）PDF 按页提取+达帽早停**：子进程 `extractPdf`（child :164）`getInfo().total` 定页数→逐页 `getText({partial:[p]})` 累计——清洗累计 >帽+停止余量（16 字·清洗只收缩⇒判定必拒恒安全）即停；逐页 join 与整篇 getText 输出逐字节恒等（20 样本+87 parity 机证）；页数不可知→整篇兜底。**docx 无页粒度**（mammoth 一次性面），如实登记：docx 早停由既有流式声明计量（liar 类）承担，文本量上界由子进程清洗截断承担——不虚称按页。单页大流（flate 单页炸弹）早停不适用，仍由 8s SIGKILL 收场。
- **件⑭（行内改）子进程去 loader 耦合（顺闭核对路 P2-3）**：execArgv 不再继承宿主 loader 链（:406-410 撤 r4 `[...process.execArgv,…]` 形）——两 .ts 面均可擦除语法，node≥22.18 原生 strip-types 直跑（生产镜像 node 22.23.2 亲验）；①宿主 loader 缺失不再殃及解析；②tsx loader 在 --permission 下对目录做大小写改写读与白名单错位（实测）即消；③子进程恒 **CJS 画像**（createRequire 取 pdf-parse CJS 构建——r4「worker 形承 CJS 画像」说法不实，见 §9 r5 注记勘正），帽值证据链画像归位：8MB 文本充实 PDF heapUsed 232.6MB（r4·swc/ESM 画像）→**91.2MB（r5·CJS 画像）**，帽值阶梯 minSucceed 256MB→**192MB**（帽常量 256 维持·余量变厚），resume-cap-probe 量基带交叉校验通过。
- **P2-1 码注勘正采纳（核对路）**：单条目帽注 (:276-281) 「诚实部件恒 <8MB→10MB 帽零误伤」改为「高压缩比诚实条目（压缩后 <8MB·声明 >10MB）会被拒=已知 fail-closed 误伤面」。
- **proof 增补（resume-extract.proof.ts §r5 五臂 :380-439·68→73 断言）**：①解析中途 abort→SIGKILL 子进程→extract_timeout（宿主存活）；②8s 到点硬超时→SIGKILL→extract_timeout；③deep-xml DOM 形→子进程 V8 OOM abort→child_oom（宿主不连坐）；④畸形帧→IpcCrashGuard→child_crash（宿主存活·probeCorruptIpcFrame 缝 :573 与生产 fork 选项同构）；⑤2000 万字件→子进程清洗截断回传恰 60,001 字（服务层 413 判定语义不变）。

### 1.5 件⑤ CAP-SANCTION-2485 起草随刀恰等步进（两 policy 脚本·预登随令）

- **union 算式**：main 届扫 **2484**（worktree docs:check EXIT=0 scanned 2484 起草前亲跑·=cap 2484 恰等=CAP-SANCTION-2484 G7W 尾障承值）+ 本卷 `harness/s3-upload-caps-REQUEST.md` 受管 1 件 = **2485 恰等零多放**·起草 commit 即触（本卷起草含码：resume-extract 两件系既有 tracked 行内改零增计）·EXEC 期=既有件行内改+收据 `.log`（∉TEXT_EXTENSIONS 不计）零新受管文件→terminal 2485 零新增。
- **在飞如实采按届枚举**（merge-base/触面亲跑亲证）：errata `a39cf7b6e`（base=main tip `fd2b7463` 亲证·两 policy 触面·承 **CAP-SANCTION-2485 同号**）+perf `5de306687`（base=main tip 亲证·两 policy 触面·rebase 后承 **CAP-SANCTION-2485 同号**）——两支同号在飞系 **CAP-SANCTION-2480 三支同号（FIN/R2/ISO）dual-keep 先例形**：号随 merge-tree 重排·并线期 union 沿常设预授权「cap 以合并树实测恰等步进免再询」届时取大重算承登·pay `fdaa1ecf0`/uc31 `112ac8af0`/scoringeval `bed65e869` 各 ahead=1 两 policy 零触·ag18/cap-2272/campaign-state ancient 分叉不预采（沿 L-13 注记先例）。
- **四联动点**（proof 文件链区·loop/atCap/overCap 三处）：`i < 2_485`·`atCap.scannedFiles, 2_485`·`'ai-docs/f-2485.md'`·`FILE_LIMIT:2486` 恰等改+两脚本随刀注记各一条（policy 链区注记置 MAX_FILES 前·proof 注记置 overCap 前·沿 2484 注记先例形·append 置新不洗旧）。

### 1.6 语义申明

- 新错误码三枚 `zip_entry_overflow`/`zip_uncompressed_overflow`/`zip_directory_invalid` 沿既有 snake_case 命名族（`magic_mismatch`/`extract_timeout`/`parse_failed`/`encrypted`/`unsupported_file_format`/`image_needs_ocr`）。
- 服务层 :74 未知码→`parse_failed` 422 兜底**零触**（新码域层出码即被可解释 fail-closed 拒绝·不裸崩）；web hint i18n 键域映射不在本刀清单（§4-4 否决案）。
- 零新依赖（守卫纯 Buffer 手读·proof 沿 craftDocx 既有零依赖工具面）·零 lockfile 零迁移零 CI/workflow 面·est live=0（纯离线·零外呼零容器零 DB 零 Key 加载）。

---

## §2 验收（门矩阵·EXEC 席/审查席亲跑口径）

1. **负例一（条目数越帽）**：craftDocx 造 1001 条目 fixture → guard 臂+`extractResumeText` 生产缝双断言 `zip_entry_overflow`（:161/:164）。无守卫反事实（勘正·rev r1）：**同构含真实件**的 1001 条目 zip 无守卫时被 mammoth→jszip 静默吃下（评审席 2026-11-05 亲证 18ms 提取成功）；本项基线 fixture 系无 document.xml 简形——无守卫时 mammoth 拒因缺主件非拒因条目数（如实披露）——同构真实件承重面由 §2-10 升为仓内机证，断言承重非同义反复。
2. **负例二（超大解压声明）**：64MB+1 声明 + 真 document.xml 条目 0xFFFFFFFF（zip64 哨兵）声明两 fixture → guard 臂+生产缝双断言 `zip_uncompressed_overflow`（:166/:169）。
3. **结构不可核**：PK`\x03\x04` 头无 central directory → `zip_directory_invalid`（:173·fail-closed"核不了=拒"面）。
4. **恰帽边界**：恰 1000 条目/恰 64MB 声明零抛（:158/:159·上界不误伤·帽值语义=≤ 恰等通过·真 docx 与恰帽 fixture 对 rev r1 两自洽检恒真）。
5. **正例旁证（防误伤）**：100 条目真 docx 全链提取输出与 A1 恒等（:180）+A1 三条目真例既有断言保持（:148-149）——守卫对合法多 media 文档零误伤。
6. **现有 proof 全绿**：`pnpm -C packages/domain prove:resume-extract` 全量 EXIT=0（修前 35 断言基线在案→落码后 43 断言→rev r1 增自洽检负例四断言+真实三件变体三断言→**50 断言**）。
7. **三门**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 scanned **2485=cap 2485 恰等**；`node scripts/ai-docs/public-text-policy.proof.mjs` **12/12** EXIT=0；markers 改动集冲突标记扫描 **0**。
8. **node --check**：两 policy `.mjs` 脚本 EXIT=0；`.ts` 面语法门由 tsx proof 行使（tsx 编译即全量语法核）。
9. **自洽检负例（EOCD 字段谎报类·rev r1）**：谎报 `totalEntries=2`（CD 定界少报·CD 区残余）guard+生产缝双断言 `zip_directory_invalid`（:188/:191）；谎报 `cdSize`（cdOffset+cdSize 失配 EOCD·双 CD 操纵形）guard+生产缝双断言 `zip_directory_invalid`（:192/:195）——两检合用闭探针 1/2 及「良性 CD 填满至 EOCD+敌对 CD 异域」变体。
10. **真实三件同构变体两向同 fixture 族闭合（rev r1）**：1001=3 真实件+998 media 形 filler guard+生产缝双断言 `zip_entry_overflow`（:200/:203）；恰 1000 条目同构合法件（3 真实件+997 media 形 filler）全链必通且输出与 A1 恒等（:206）——同构合法件无守卫必通=反事实仓内机证（拒因唯一=条目数非结构）。
11. **typecheck（rev r2 纳入门矩阵）**：`pnpm -C packages/domain typecheck` EXIT=0——刀1 遗留 4 红·rev r2 清零（proof :141 `realDocxEntries` 单行改三元组定长标注，闭 :168 TS2532+:176 ×3 TS2322 noUncheckedIndexedAccess 红·断言语义零变）。
12. **zip64 覆写类负例+注释区判定缝廉价检（rev r3 纳入门矩阵）**：EOCD 六字段哨兵（+4 diskNumber/+6 diskWithCentralDirStart/+8 centralDirRecordsOnThisDisk/+10 centralDirRecords=0xFFFF·+12 centralDirSize/+16 centralDirOffset=0xFFFFFFFF——jszip zipEntries.js:190 zip64 判定全集）C5 形 fixture guard 臂+生产缝各断言 `zip_directory_invalid`（:270/:273·worker 零 spawn·修复前 guard 声明面 PASS→mammoth 全链 ACCEPT 151 条目=席2 实锤形）；注释区声明越缓冲余量 guard+生产缝双断言 `zip_directory_invalid`（:282/:285·闭「守卫放行而 jszip 抛错」判定缝）。恰帽边界/正例/既有负例零回归（50 基线断言全数维持=64 断言全绿）。
14. **宿主保护/机密隔离/IPC 安全/映射区分/排队公平/可复现样本（rev r5 纳入门矩阵·post-prove 双席 FAIL 处置）**：proof 73 断言全绿（68 基线零回归+r5 五臂：被杀/超时/OOM/畸形帧/截断各一·四臂断言宿主存活与错误码）；512m 双路重件 proof 5 断言（需 docker·不进 CI·卷内写明跑法）宿主存活+oom_score_adj=1000；服务层对外错误码零新增（新内部码按 §1.8-件⑩映射表落既有可解释拒绝/server_busy 503）；87 样本 parity：81 逐字节一致+4 超帽件=逐字节前缀（sha256 机证）+2 设计内差异（deep-xml 码精度 extract_timeout→child_oom·textbomb extract_timeout→截断成功·均为宿主存活的确定性改善）；neg:resume 91 全绿。
13. **别名读放大类关闭+进程级隔离（rev r4 纳入门矩阵·post-prove FAIL 处置）**：单条目声明帽（10MB）guard 臂+生产缝双断言 `zip_uncompressed_overflow`（:299/:302）；关系别名诚实件全链提取输出与 A1 恒等（:313·记忆化适配器零误伤）；单条目 liar（声明 100B·实际 32MB）生产缝 `zip_uncompressed_overflow` 早停 <4s（:339·流式计量）；恰 64MB 边界臂改 7 条目均摊形零抛（:166·帽语义恒等）。外延读数（探针亲测）：崩溃探针 10/10 宿主存活确定码；6 路并发宿主峰值 RSS 有界；17 真实 docx 逐字恒等；68 断言全绿（详 §9 rev r4 读数行）。

---

## §3 Non-claims（翻面不洗·rev r4 如实改写 2026-11-06·前值史录见 §9 rev r4 注记）

- 本卷 `closed` ≠ 「解压炸弹全谱清零」≠ 「HA」≠ 「生产容量」。**rev r4 前值 §3 首条关于 #108「isolate 级 OOM kill·宿主存活」的兜底表述已被复验推翻**（worker 单次大分配越堆帽→V8 FatalProcessOutOfMemory→**宿主全进程 abort·EXIT=134·两树亲复现**），r4 处置=解析隔离升级为独立 OS 子进程（fork·`--max-old-space-size=256`+`--max-semi-space-size=32`·到点 SIGKILL·子进程 abort 只死子进程），宿主存活自 r4 起由**进程边界**承立而非 resourceLimits。**残余如实登记（r4 实测）**：①liar 形修复后不再全量膨胀——7.47MB 级平凡 liar（声明 100B·实际 4GB）r4 后 307ms 早停确定拒（修复前 8s 内 worker 留存约 4.4GB ArrayBuffer·heapUsed 60MB·old-gen 帽不辖；macOS RSS 因内存压缩低报不可作量基·Linux 容器 RSS 接近实存·×PARSE_MAX=6 聚合曾达 ~26GB 量级）；②6 路并发（3 诚实 9MB 别名件+3 枚 4GB liar）r4 后宿主峰值 RSS **183MB**（进程树含 tsx 工具链 ~602MB）·全数确定码收场 1.1s——「内存有界」claim 以此为界，不 claim 容器 512m 预算内的容量保证（mem_limit 顶到 cgroup OOM killer 的面仍归容量裁量）；③子进程堆帽余量偏薄：8MB 合法 PDF 子进程形 minSucceed=256MB（heapUsed 254.4MB 亲测·worker 形同日 235.3MB）——更重合法件 OOM→`extract_timeout` 422 可解释降级（确定性 degrade·宿主无恙·#108 既有取舍维持）；④守卫仍核**声明面**（流式真解压计量不入守卫层·§4-1 否决案维持——r4 的流式计量在子进程消费层，mammoth 适配器内，非守卫层）；⑤**EOCD 尾随缝（P2-6 登记）**：EOCD 签名后尾随 >65,535B 时守卫反向扫窗找不到 EOCD 拒、jszip（全域反扫）可收——守卫拒/解析器收分叉的误伤边（docx 罕见·fail-closed 不敞口·留观察）；⑥哨兵承重集（P2-5 登记）：+4/+6/+8 承重（删任一 C5 复绕），+10 只承重于错误码统一（删后归 `zip_entry_overflow`），+12/+16 由 `:175` 自洽检覆盖属纵深防御（proof :270/:273 循环断言对其变异不敏感·零改码）。
- **rev r5 如实改写（2026-11-06·前值史录保留在上一行注）**：r4「宿主存活自进程边界承立」在**生产 512m 限额下不成立**——进程边界只隔离崩溃,不隔离 cgroup 内存预算:宿主+双子进程 RSS 叠加越 mem_limit 时内核 OOM killer 仍选宿主（证伪路 18/18 HOST_EXIT=137 实测·本席 r4 镜像同形复测 3/3=137）。r5 后「宿主存活」由 **oom_score_adj=1000（OOM killer 弃宿主选子进程）+子进程内清洗截断（宿主不收 MB 级文本）**承立,512m 生产参数实测：双路重件宿主存活、正常件 N=1 12/12·N=2 24/24 全成功宿主 RSS ≤257MB；合法重件（8MB 文本 PDF）512m 下子进程被内核杀→child_oom→422 确定性降级（宿主无恙·N=1 3/3·N=2 6/6 同）。**「内存有界」以预算算式为界**：宿主（约 240-300MB）+(N+1)×单子进程峰值 ≤ mem_limit——512m 只容 N=1（默认并发已改 1）；N=2 需 mem_limit ≥1.5g（预算算式与建议值详 §9 r5 注记·**本刀不动 compose mem_limit**=部署资源决定）。6 路并发 183MB 峰值读数系无内存限额 mac 实测,不代表生产容量,作废以 §9 r5 生产实测替立。
- 本刀不 claim PDF/图片/text 分支面（#109 已收口面零回归维持）；不动 `.doc` 分派语义（OLE2 已由 magic 门 magic_mismatch fail-closed）；不动服务层/web 层错误信封与 i18n 键域。
- coveredCount=8 零翻转·EXIT0=case≠covered·Pins 十一值零翻转。

## §4 修法否决案

1. **流式真解压计量**（inflate 流累计替声明合计）：需引入解压实现或复用 jszip=把炸弹字节交回解压面·违本刀"解包前定夺"形状·否决。
2. **越帽跳条目续读**（try-continue fail-open）：炸弹部分条目仍进解压面·违 fail-closed 纪律·否决（越帽=全文件拒）。
3. **帽值上浮**（条目 10k/总量 256MB 等）：超 rev2 A2 预登记口径·本席无权改口·否决（帽值依据已注 :102-108）。
4. **服务层/web 层新码 hint 全链映射**（resume.service 显式臂+ocr-preview-ui zh/en 键）：派单清单外·域层出码+422 兜底已 fail-closed·如实记录不动手·留协调方裁量。

## §8 停止条件 + STOP

- **停止条件（命中即停手上报）**：file:line 与实际代码不符·机制不满足预期（守卫误伤真 docx/负例不红）·验收红且口径内修不了·需越界（动在飞五树 errata/perf/pay/uc31/scoringeval、碰 Key 值、跑 E2E live、push/merge 主线）才能继续。
- **STOP · `draft:awaiting_pre_exec_dual`**（2026-11-05 起草含码落卷即停·沿 IDU/ISO-DOTENV-PERF draft 含码先例形·pre-exec 双审两独立外席留协调方派席·alone≠dual·Ban self-approve·行翻面权归协调方·est live=0·`actualSpendCny=null`·markers=0·⛔push ⛔merge 主线 ⛔force push·状态钉=Status/本节/§9/卷尾 四处同值）。
- **EXEC 翻面 · `executed:awaiting_post_prove_dual`**（2026-11-05 EXEC 行使落卷·前值 STOP 上行史录保留·行使前提已满足=pre-exec dual r1 FAIL→rev r1→dual r2 席1 FAIL→rev r2→dual r2 两独立外席会签 BOTH PASS+协调方明示 EXEC 授权随令·nail 期 rebase 并线 CAP-SANCTION-2487 union 承值 2486→2487·届时零码改动沿 IDU 先例·详 §9 EXEC 注记·post-prove 双席留协调方派席·状态钉=Status/本节/§9/卷尾 四处同值）。
- **rev r5 状态维持 · `executed:awaiting_post_prove_dual`**（2026-11-06 post-prove 双席裁决双 FAIL→本刀 FAIL 处置修订落卷：宿主 OOM 保护+机密隔离+IPC 安全+错误码区分+并发排队公平+样本入仓+512m 生产实测落卷·前值 rev r4/EXEC 史录保留·修订缘由/处置详 §9 rev r5 注记·post-prove 复审待重派·状态钉=Status/本节/§9/卷尾 四处同值）。
- **rev r4 状态维持 · `executed:awaiting_post_prove_dual`**（2026-11-06 post-prove 复验报告 FAIL→本刀 FAIL 处置修订落卷：别名读放大 P0 关闭+§3 如实改写+门矩阵全绿·前值 EXEC 史录保留·修订缘由/处置详见 §9 rev r4 注记·post-prove 复审待重派·状态钉=Status/本节/§9/卷尾 四处同值）。

## §9 门读数（起草席亲跑·EXIT 原值在案）

| 门 | 命令 | 读数 |
|---|---|---|
| 基线（修前） | `pnpm -C packages/domain prove:resume-extract` | EXIT=0·35 断言全绿 |
| 基线（修前） | `node scripts/ai-docs/check-docs.mjs` | EXIT=0·scanned 2484=cap 2484 恰等 |
| 基线（修前） | `node scripts/ai-docs/public-text-policy.proof.mjs` | EXIT=0·`selected=12/12` |
| 落码后 | `pnpm -C packages/domain prove:resume-extract` | EXIT=0·**43 断言全绿**（35+8 新臂） |
| 落码后 | `node scripts/ai-docs/check-docs.mjs` | EXIT=0·scanned **2485=cap 2485 恰等** |
| 落码后 | `node scripts/ai-docs/public-text-policy.proof.mjs` | EXIT=0·**12/12** |
| 落码后 | markers 改动集冲突标记扫描 | **0** 命中 |
| 落码后 | `node --check` 两 policy 脚本 | EXIT=0 ×2 |
| rev r1 | `pnpm -C packages/domain prove:resume-extract` | EXIT=0·**50 断言全绿**（43+7：自洽检负例四+真实三件变体三） |
| rev r1 | `node scripts/ai-docs/check-docs.mjs` | EXIT=0·scanned **2485=cap 2485 恰等**（rev 三件均既有 tracked 行内改零增计） |
| rev r1 | `node scripts/ai-docs/public-text-policy.proof.mjs` | EXIT=0·**12/12** |
| rev r1 | markers 改动集冲突标记扫描 | **0** 命中 |
| rev r1 | `node --check` 两 policy 脚本 | EXIT=0 ×2 |
| EXEC（rebase 并线后终验） | `pnpm -C packages/domain prove:resume-extract` | EXIT=0·**50 断言全绿** |
| EXEC（rebase 并线后终验） | `pnpm -C packages/domain typecheck` | EXIT=0 |
| EXEC（rebase 并线后终验） | `node scripts/ai-docs/check-docs.mjs` | EXIT=0·scanned **2487=cap 2487 恰等**（CAP-SANCTION-2487 union 承值 2486→2487·合并树亲跑=union 算式机证） |
| EXEC（rebase 并线后终验） | `node scripts/ai-docs/public-text-policy.proof.mjs` | EXIT=0·**12/12** |
| EXEC（rebase 并线后终验） | markers 改动集五类标记词+行首冲突标记（i6-239 §2-7 运行时组装口径·词面不入卷） | **0** 命中 |
| EXEC（rebase 并线后终验） | `node --check` 两 policy 脚本 | EXIT=0 ×2 |
| rev r3 | `pnpm -C packages/domain prove:resume-extract` | EXIT=0·**64 断言全绿**（50 基线零回归+14 新增：zip64 哨兵六字段 guard+生产缝十二·注释区越界廉价检二） |
| rev r3 | `pnpm -C packages/domain typecheck` | EXIT=0 |
| rev r3 | `node scripts/ai-docs/check-docs.mjs` | EXIT=0·scanned **2487=cap 2487 恰等**（rev 三件均既有 tracked 行内改零增计） |
| rev r3 | `node scripts/ai-docs/public-text-policy.proof.mjs` | EXIT=0·**12/12** |
| rev r3 | markers 改动集五类标记词+行首冲突标记（i6-239 §2-7 运行时组装口径·词面不入卷） | **0** 命中 |
| rev r4 | `pnpm -C packages/domain prove:resume-extract` | EXIT=0·**68 断言全绿**（64 基线零回归+4 新增：单条目帽 guard+生产缝二·别名诚实件全链一·liar 早停全链一） |
| rev r4 | `pnpm -C packages/domain prove:resume-cap-probe` | EXIT=0·阶梯 64/96/128/192 oom·**256 成功**（子进程形 heapUsed 254.4MB·minSucceed=256MB·worker 形同日对照 235.3MB·量基带交叉校验通过） |
| rev r4 | `pnpm -C packages/domain typecheck` | EXIT=0 |
| rev r4 | `pnpm -C packages/domain lint` | EXIT=0·0 error·**115 warning=基线 115 恰等零增**（r4 新增命名面 1 告已修） |
| rev r4 | `pnpm -C apps/api neg:resume`（root run-e2e-isolated 隔离 PG 形） | EXIT=0·**91 条全绿** |
| rev r4 | `pnpm arch` | EXIT=0·0 error·**8 warning=基线 8 恰等**（1189 modules·deps 3768 vs 基线 3766·+2 系子进程接线边零违规） |
| rev r4 | `node scripts/provider-egress-inventory.mjs` | EXIT=0·adapters=5/operations=10/registered_consumer_source_pairs=55（与在案同值） |
| rev r4 | `node scripts/ai-docs/check-docs.mjs` | EXIT=0·scanned **2487=cap 2487 恰等**（r4 净增零：worker 件删−1+child 件新增+1·两 policy 脚本零步进） |
| rev r4 | `node scripts/ai-docs/public-text-policy.proof.mjs` | EXIT=0·**12/12** |
| rev r4 | markers 改动集（r4 五文件）五类标记词+行首冲突标记 | **0** 命中 |
| rev r4 | `node --check` 三 policy 脚本（check-docs/ptp proof/policy） | EXIT=0 ×3 |
| rev r5 | `pnpm -C packages/domain prove:resume-extract` | EXIT=0·**73 断言全绿**（68 基线零回归+5 新臂：被杀/超时/OOM/畸形帧/截断） |
| rev r5 | `pnpm -C packages/domain prove:resume-512m-dual`（需 docker·不进 CI·512m 生产参数） | EXIT=0·**5 断言全绿**（宿主存活 HOST_EXIT=0+双路重件确定结果+oom_score_adj=1000） |
| rev r5 | `pnpm neg:resume`（root isolated PG） | EXIT=0·**91 条全绿** |
| rev r5 | `pnpm -C packages/domain prove:resume-cap-probe` | EXIT=0·阶梯 64/96/128 oom·**192 起成功**（heapUsed 91.2MB·minSucceed 192MB=帽余量变厚·量基带交叉校验通过） |
| rev r5 | `pnpm -C packages/domain typecheck` | EXIT=0 |
| rev r5 | `pnpm -C apps/api typecheck` | EXIT=0 |
| rev r5 | markers 改动集（r5 十一件）五类标记词+行首冲突标记 | **0** 命中 |
| rev r5 | `node --check` 三 policy 脚本（check-docs/ptp proof/policy） | EXIT=0 ×3 |
| rev r5 | `pnpm -C packages/domain lint` | EXIT=0·0 error·**115 warning=基线 115 恰等零增** |
| rev r5 | `pnpm arch` | EXIT=0·0 error·**8 warning=基线 8 恰等**（1190 modules·deps 3776 vs r4 3768·+8 系 gen.mjs+512m proof 模块边零违规） |
| rev r5 | `node scripts/provider-egress-inventory.mjs` | EXIT=0·adapters=5/operations=10/registered_consumer_source_pairs=55（与在案同值） |
| rev r5 | `node scripts/ai-docs/check-docs.mjs` | EXIT=0·scanned **2489=cap 2489 恰等**（r5 净增 2 受管件：gen.mjs+512m-dual proof·cap 2487→2489 恰等步进） |
| rev r5 | `node scripts/ai-docs/public-text-policy.proof.mjs` | EXIT=0·**12/12** |
| rev r5 | markers 改动集五类标记词+行首冲突标记 | **0** 命中 |

- 负例读数：entry-bomb 生产缝=`zip_entry_overflow`·size-bomb 生产缝=`zip_uncompressed_overflow`（0xFFFFFFFF zip64 哨兵形）·无 CD 生产缝=`zip_directory_invalid`·恰帽边界零抛 ×2·100 条目真 docx 正例旁证输出恒等。
- rev r1 负例读数：谎报 `totalEntries=2` 全链拒=`zip_directory_invalid`（:188 guard/:191 生产缝）·谎报 `cdSize` 全链拒=`zip_directory_invalid`（:192 guard/:195 生产缝）·1001 条目真实三件形（3 真实件+998 media 形 filler）guard/生产缝=`zip_entry_overflow`（:200/:203）·恰 1000 条目同构合法件全链必通输出与 A1 恒等（:206·反事实仓内机证）·恰帽边界 fixture 与真 docx 对两自洽检恒真零适配。
- rev r3 负例读数：zip64 哨兵六字段（EOCD+4/+6/+8/+10=0xFFFF·+12/+16=0xFFFFFFFF）C5 形 guard/生产缝全数=`zip_directory_invalid`（:270/:273·六字段循环十二断言）·注释区越界 guard/生产缝=`zip_directory_invalid`（:282/:285）·恰帽边界/正例/既有负例 50 基线断言零回归零适配。
- rev r3 探针读数（`/tmp/s3caps-probe/` 本席修复前后亲跑·修复前基线=席2 实锤在案本席复跑恒等）：**p3b-c5** 修复前 guard=`ok`/jszip `entries=151 hasDocumentXml=true`/chain=`ACCEPT textLen=8` → 修复后 guard=`REJECT:zip_directory_invalid`/chain=`REJECT zip_directory_invalid`（jszip 独立直调仍读 151 条目=库自身无此守卫，生产链拒于守卫层）；**p5-chain liar**（声明 100B 实体 300MB）修复前 guard=`ok`/chain=`REJECT parse_failed "uncompressed data size mismatch"` 694ms/RSS 755MB（300MB 全量膨胀完才被 jszip 事后检测）→ 修复后 guard=`REJECT:zip_directory_invalid`/chain=`REJECT zip_directory_invalid` **0ms**/RSS 374MB（零解包零 worker spawn）；**p5-chain honest**（声明 300MB）修复前 guard=`ok`/chain=`REJECT parse_failed` 989ms/RSS **1349MB**（mammoth 崩前真解压发生=§3 liar 行实测依据）→ 修复后同上 REJECT zip_directory_invalid 0ms/RSS 374MB。
- CAP-SANCTION-2485 落点：policy `MAX_FILES = 2_485`+随刀注记·proof 四联动点 2_485/f-2485.md/:2486+随刀注记·PTP 12/12 全量一次行使即全 proof 邻面·2485/2486 双值全行使绿。
- **rev r1 注记（2026-11-05·登记源=pre-exec dual 席1 P1 双探针实证+P2 清单·探针证词转录）**：守卫帽对 EOCD 字段谎报整类绕过——jszip 按签名连续走读不用 EOCD totalEntries 定界（zipEntries.js:129-139（签名驱动走读）+:141-151（walked>declared 容忍分支·"no error here" 在 :148）；rev 席亲证 jszip@3.10.1 `readCentralDir` 系 `while (readAndCheckSignature(CENTRAL_FILE_HEADER))` 按签名连续走读、walked>declared 落入 "no error here" 容忍分支，机制属实）：谎报 `totalEntries=2`+附加 100,002 条 CDH → 守卫 PASS→mammoth 全链 ACCEPT（席1 亲证 297ms 提取成功）；双 CD `cdSize` 操纵同类。修法=守卫两行 fail-closed 自洽检（预走读 `cdOffset+buffer.readUInt32LE(eocd+12) !== eocd`→`zip_directory_invalid` 落码 :135·走读循环后 `p !== eocd`→`zip_directory_invalid` 落码 :144）——两检合用闭探针 1/2 及「良性 CD 填满至 EOCD+敌对 CD 异域」变体；帽值常量/三错误码零变；恰帽边界 fixture 与真 docx 两检恒真（既有负例零触自洽检零适配，proof 亲证）。同席 P2 勘正随刀：§1.2 三处预测行号勘正（签名常量 :112-113/工厂 :115/doc 注 :117-122）+新两行落码后全部行号重 pin（§1.2/§1.3/§1.4/§2）·§1.4 表行 4+§2-1 反事实句勘正（18ms 亲证+简形拒因缺主件如实披露）·建议采纳：负例 fixture 补真实三件变体断言（1001=3 真实件+998 media 形 filler 越帽拒+恰 1000 同构合法件全链必通两向同 fixture 族闭合·反事实承重升为仓内机证）。状态保持 `draft:awaiting_pre_exec_dual`（待 dual r2）。
- **rev r2 注记（2026-11-05·登记源=pre-exec dual r2 席1 FAIL 报告·typecheck 三点对照：main 绿/draft 红 4/单行修绿+50 断言绿）**：proof :141 `realDocxEntries` 类型 `Array<[string, string]>` → `[[string, string], [string, string], [string, string]]` 单行定长标注——闭 :168 TS2532（noUncheckedIndexedAccess 索引）+:176 ×3 TS2322（三元组展开）共 4 红·断言语义零变（50 断言复跑全绿）·typecheck 纳入门矩阵（§2-11）。随刀 P2 引用勘正：rev r1 注记 jszip 走读行号 `zipEntries.js:216-236` 系 extraBytes/前插数据容忍块（"we keep it" 在 :236）配对错位→勘正为 `zipEntries.js:129-139`（签名驱动走读）+`:141-151`（walked>declared 容忍分支·"no error here" 在 :148）·rev r2 席亲读 jszip@3.10.1 zipEntries.js 吻合。状态保持 `draft:awaiting_pre_exec_dual`（待 dual r2 会签复验）。
- **rev r3 注记（2026-11-05·登记源=post-prove 席2 FAIL 实锤（C5 双探针 ACCEPT 亲证）+rev r3 席亲读 jszip@3.10.1 zipEntries.js/utils.js/DataReader.js）**：rev r1「两检合用闭 EOCD 字段谎报**整类**绕过」系过度声明·如实勘正=**两检所闭系声明面谎报类（jszip 按声明面目录走读的形）·zip64 覆写类不在其内**——EOCD 六字段（diskNumber/diskWithCentralDirStart/centralDirRecordsOnThisDisk/centralDirRecords 各 16 位 +4/+6/+8/+10·centralDirSize/centralDirOffset 各 32 位 +12/+16）任一等于哨兵（0xFFFF/0xFFFFFFFF 字形；jszip `MAX_VALUE_16BITS`=65535 utils.js:381·`MAX_VALUE_32BITS`=**-1** utils.js:382 系 `readInt(4)` 32 位符号回绕读作 -1·字节形恒等）即触发 jszip zip64 路径（zipEntries.js:190 判定全集——**该六字段即全部触发字段，无第七个**）：`readBlockZip64EndOfCentral` 以 zip64 EOCD 记录覆写全部六字段后按覆写值另读目录——守卫声明面所审目录与 jszip 实读目录分叉，声明面自洽检对该类失效。席2 C5 实锤：EOCD+8 recordsOnDisk=0xFFFF（守卫只读 +10/+12/+16·良性 CD 3 条目 12B 全自洽）→守卫 PASS→jszip 实读敌对 CD 151 条目→mammoth 全链 ACCEPT；p5-chain 同形 300MB 真解压发生（liar 形 RSS 755MB 膨胀完才被 jszip size mismatch 事后拒·honest 形 RSS 1349MB mammoth 崩前真解压——§3 liar 行随之如实改写）。修法（守卫 +9 行·帽值常量/三错误码零变）：:147 注释区余量检（`commentLen > 缓冲余量` 即拒——与 jszip readData checkOffset 读法恒等，闭 P2-4「守卫放行而 jszip 抛错」判定缝）+:148-155 哨兵六字段检任一命中 `zip_directory_invalid`（哨兵检置于条目帽/自洽检之前——`centralDirRecords`=0xFFFF 形由 rev 前的 `zip_entry_overflow`（65535>1000）改归 `zip_directory_invalid`，触发面单一码面）——12MB 信封帽下合法 docx 不可能 zip64（zip64 为 >4GB/>65535 条目而生），拒绝零误伤面；既有正例/恰帽边界/既有负例 50 断言零适配零回归（proof 亲证）。proof 增十四断言（§6b 15→29·全卷 50→64·§1.4/§2-12 随登）。残余判定缝如实登记（零动作）：EOCD 签名落守卫反向扫窗之外最后 21 字节（jszip lastIndexOfSignature 搜索全域至 len-4）或 local header 声明偏移指向截断区时 jszip 仍可先抛——该形守卫亦可拒或服务层未知码→`parse_failed` 422 兜底，fail-closed 不敞口，留观察。探针修复前后读数见上 rev r3 探针读数行。状态保持 `executed:awaiting_post_prove_dual`（rev r3 待 post-prove 复审）。
- **EXEC 注记（2026-11-05·登记源=pre-exec dual r2 会签 BOTH PASS+协调方 EXEC 授权随令·沿 IDU/ISO-DOTENV-PERF draft 含码先例「届时零码改动」）**：`git fetch origin` EXIT=0 届值如实采 origin/main `92a82a944`=#209 perf-status-pin 已并（main 届扫 2486=cap 2486 恰等=CAP-SANCTION-2486 ISO-DOTENV-PERF EXEC nail 期承值）→ nail 期 rebase 并线：两 policy 脚本共 4 处冲突块（policy 注记/cap 区+proof loop 区+proof atCap 数值区+proof 注记/overCap 区）dual-keep 双留（main 侧 CAP-SANCTION-2485 ERRATA+2481 ISO 起草+2485 ISO EXEC+2486 ISO PERF 链注史录全保留+本支 CAP-SANCTION-2485 起草注并留·号随 merge-tree 重排·沿 CAP-SANCTION-2486 PERF nail 并线 dual-keep 先例形）+新增 **CAP-SANCTION-2487** union 注（cap 2486→2487 恰等零多放·四联动点 2_487/f-2487.md/:2488·union 算式=main 届扫 2486+本卷 1=2487·合并树 docs:check EXIT=0 scanned 2487 恰等亲跑=机证·本支预登 2485 系并线前预登史录保留零洗·在飞 pay `fdaa1ecf0`/uc31 `112ac8af0` 各 ahead=1 两 policy 零触承 2486 届枚举如实列·scoringeval 树撤+分支删/ag20+loadw ref 已撤如实注/ancient 分叉不预采）·rebase 后三 commit（`464ca30ca`/`c8904a3d0`/`16bbd8555`）对原支三 commit（`3842a2f2a`/`d77f66f3b`/`96ad5d679`）patch 亲比逐字节同（非 policy 面三 commit 全同+policy 面仅 dual-keep/union 注及数值行恰等改差异）=落点 pin 零漂移零重 pin（守卫 :135/:144/接线 :231/proof :141 亲读吻合）·代码面零新触（packages/ 零字节差）·EXEC 终验读数见上表 EXEC 行·状态转 `executed:awaiting_post_prove_dual`（post-prove 双席留协调方派席）。
- **rev r5 注记（2026-11-06·登记源=两份 r4 审查双 FAIL：`.tmp/reviews/s3-r4-1.md`（核对路·P1 基线崩溃不可复现 0/20+P2×5）+`.tmp/reviews/s3-r4-2.md`（证伪路·P0×1 cgroup OOM 杀宿主+P1×1 机密全量可见+P2×11）·本刀系 post-prove FAIL 处置修订）**：
  - **撤回/勘正（核证伪两路合并）**：①r4 §1.7/§3/§9-r4「62,423B 诚实声明 60MB→10/10 宿主 FATAL EXIT=134·两树亲复现·基线同崩 1/1」系**不可复验的加载承重证据**——核对路独立复跑 0/20（6 种尺寸/形状匹配 fixture 20 次·基线 `92a82a944` 与 pre-r4 `0e73cd25f`）·最重 CJK 形在基线上 worker OOM 受控 8/8；「单次大字符串分配 80-120MB 双字节串越堆帽」与 60MB 声明算术不相容（V8 串字节数 ≤UTF-8 源字节）——该类触发样本（别名诚实声明大条目）现固化为仓内生成器 `scripts/resume-crash-samples/gen.mjs` 的 alias5-9.9mb/deep-xml 形，复现命令与环境随 proof 文件头/本注记，不再引用已作废的 10/10 读数。②r4「worker 形承 CJS 画像」（child 文件头与卷 §1.7）**不实**——swc loader 下 worker/ESM import 落 **ESM 构建**（pdfjs legacy .mjs），createRequire 才落 CJS；r5 子进程去 loader+恒 createRequire=CJS 画像坐实（8MB 件 heapUsed 232.6MB→91.2MB·minSucceed 256→192·帽常量 256 维持）。③「6 路并发宿主峰值 RSS 183MB/内存有界」系无限额 mac 读数，不代表生产容量——§3 r5 段已如实改写。
  - **512m 生产实测（生产镜像 meetwise-resume-512m:r5=仓库 Dockerfile·FROM 同 digest 换 daocloud 镜像源·node v22.23.2·2 vCPU·生产安全参数 --read-only/tmpfs noexec/cap-drop ALL/no-new-privileges/--user app·AppModule preload=真实宿主体量近似）**：预修 A/B（r4 镜像 `s3r42-meetwise-backend:3acd05d71`·同两件 9.9MB 声明别名 docx 并发·RESUME_PARSE_CONCURRENCY=2）＝**3/3 HOST_EXIT=137**（内核 OOM killer 杀宿主·复验证伪路 18/18 复现）；修复后同形＝HOST_EXIT=0·两路均确定收场·子进程 oom_score_adj 全=1000·宿主 RSS 峰值 237MB。正常简历（1MB 文本 docx/pdf·512m）N=1：**12/12 成功**·p50 666ms/p95 723ms·宿主 RSS 254MB；N=2：**24/24 成功**·p50 693ms/p95 812ms·宿主 RSS 257MB。合法重件（8MB 文本充实 PDF·512m）N=1：3/3 `child_oom`（子进程被内核杀·宿主无恙·确定性 422 降级）；N=2：6/6 同·宿主 RSS 323MB（逼近 512·佐证 N=1 默认）。**默认并发裁定=1**（`RESUME_PARSE_CONCURRENCY ?? 1`）：512m 下预算只容 1 子进程；N≥2 属部署资源决定，建议 mem_limit ≥1.5g 后以 env=2 开启。
  - **mem_limit 预算算式（本刀不改 compose·部署资源决定）**：`宿主常驻 RSS + (N+1) × 单子进程峰值 ≤ mem_limit`。实测点：宿主（AppModule preload 后）240-300MB；单子进程峰值——正常简历件 ≤180MB（r4-2 VmHWM 基线）、8MB 文本件约 414MB（CJS 画像·V8 堆帽 256 不辖 ArrayBuffer/flate 面，证据仍以 r4-2 口径为准）、deep-xml DOM 形撞堆帽即被 V8 abort。512m 代入：N=1 时 300+180≈480 ≤512 勉强成立（重件仍 child_oom 3/3=确定性降级）；N=2 时 300+2×180≈660 >512 必越。**建议值：N=2 ⇒ mem_limit ≥1.5g（300+3×400≈1.5g 边界）；独立解析容器（api 与解析分池）为长期形**。512m 下合法大 PDF 实际表现：≤9.9MB 声明 docx 全成功（截断回传）；8MB 文本 PDF 一律 child_oom 422 可解释拒绝（用户改传小件或粘贴文本）；扫描件/加密件既有路径不变。
  - **机密隔离生产镜像验证**：子进程 env 内核视图（`/proc/<pid>/environ`·宿主侧读·权威）仅 NODE_CHANNEL_FD/NODE_CHANNEL_SERIALIZATION_MODE/NODE_ENV 三名——DATABASE_URL/AUTH_SECRET/PAY_PROVIDER_SECRET/RESUME_ENC_KEY/RESUME_HASH_SECRET/RAG_REDIS_URL/RAG_QBANK_CACHE_HASH_KEY+MODEL_API_KEY **零可见**（哨兵值 env 注入实测）；同形 permission 子进程读 `/proc/$PPID/environ`＝`DENIED:ERR_ACCESS_DENIED`；`/proc/$PPID/mem` 本就 EACCES（ptrace_scope，r4-2 实测维持）。残余面如实登记：permission 形含 `--allow-child-process`（node 包装器/loader 兼容面·被入侵解析库理论可 spawn 但其 env 已最小化）；fd 不外泄（子进程仅 IPC socket·r4-2 实测维持）。中长期建议=解析独立容器+断网。
  - **IPC/畸形帧/stdio**：畸形帧（合法帧长+乱载荷）宿主通道反序列化抛 `Unable to deserialize cloned data` uncaughtException——修复前宿主 EXIT 1（r4-2 实测复现·本席 mac+生产镜像均复现），修复后 IpcCrashGuard 捕获→child_crash+宿主存活（mac probe 生产镜像 ipc.json=child_crash/HOST_EXIT=0 双验证）；单条消息上界=帽+1 字（构造性·宿主复核违约即 child_crash）；stderr 限量 64KB 溢出弃流（OOM 原生栈不再刷屏/无界驻留）。守卫只闭 deserialize 类，不做全局兜底；并发 ≤2 时 guard 以「最近注册 run」为 victim（受误杀 run 由其 exit 事件 settle-once 各自收场·不串扰）。
  - **冷启动成本与延迟（生产镜像 2 vCPU·512m·10 次×2 件）**：docx（tables）p50 469→**154ms**/p95 486→**166ms**；pdf（4 页 guide）p50 583→**287ms**/p95 594→**297ms**——r4 每次 fork 冷启≈0.4-0.45s CPU（r4-2 P2-9 登记）在 r5 因**子进程去 loader（原生 strip-types 直跑）**基本消除，反而较 r4 大幅下降（r4-2 登记 pdf p95 +13%/mac swc +39% 的退化一并翻转）；mac tsx 域层口径：docx p50 持平·pdf p95 与 r4 同量级（parity 87 件亲跑耗时同量级）。帽值阶梯重测：minSucceed 256→192MB（heapUsed 91.2MB·CJS 画像）。
  - **PG 解析槽 fail-open 登记（r4-2 P2 采纳·本刀部分缓解释）**：PG 不可达时 `gateway_slot_lease` fail-open 放行（rate-limit.service.ts 既有降级形·槽位是资源保护非安全边界）——r5 前后果=全站 PARSE_MAX 失效+宿主崩溃时租约泄漏累积（12min 内堵满全站）；r5 后实际子进程并发由**域层进程内闸**（默认 1·零 PG 依赖）钉死、排队有 10s 等待上限、每用户 1 lane 进程内生效——fail-open 面收窄为「全站并发上限暂时失真」，不再有宿主崩溃租约泄漏面（子进程 OOM 只败单件）。建议（登记不入本刀）：槽 lease 表占用监控告警+PG 恢复期 lease 收割。
  - **87 样本 parity（r4 HEAD `3acd05d71` detach 检出 vs r5 工作树·同 driver 同 fixture 集·mac node22 原生 strip 双树一致跑法）**：81/87 输出逐字节一致（ok/len/sha256）；4 件超服务层帽（68,660/1,068,099/1,154,031/10,380,703 字）r5 输出=修复前全文的**逐字节前缀 60,001 字**（sha256 前缀机证·服务层 413 判定语义不变）；2 件设计内确定性改善：deep-xml.docx `extract_timeout`→`child_oom`（错误码精度·宿主两树均存活）、textbomb20.pdf r4 `extract_timeout`（20M 字提取越 8s）→r5 按页早停成功回传 60,001 字。样本构成：17 mammoth docx+45 系统 PDF+8 指南 PDF+7 生成件+10 附加系统 PDF。
  - **cap/受管面**：r5 净增受管 2 件（`scripts/resume-crash-samples/gen.mjs`+`packages/domain/test/resume-512m-dual.proof.ts`）→ union 算式=届扫 2487+2=**2489**·CAP-SANCTION-2489 恰等步进（四联动点 2_489/f-2489.md/:2490·链注随刀·PTP 12/12 亲跑）；其余改动均既有 tracked 行内改零增计（resume-extract.ts/resume-extract-child.ts/resume-extract.proof.ts/resume.service.ts/resume.controller.ts/packages/domain/package.json/本卷 REQUEST）。est live=0·markers 0·⛔push 落卷即停。状态保持 `executed:awaiting_post_prove_dual`（rev r5 待 post-prove 复审重派）。
- **状态钉 · `draft:awaiting_pre_exec_dual`**（2026-11-05 起草落卷即停·前值无·首钉·详 §8·状态钉四处 Status/§8/本节/卷尾 同值）。
- **状态钉 · `executed:awaiting_post_prove_dual`**（2026-11-05 EXEC 行使落卷翻面·前值 `draft:awaiting_pre_exec_dual` 史录保留在上一钉·详 §8 EXEC 翻面·状态钉四处 Status/§8/本节/卷尾 同值）。
- **rev r4 注记（2026-11-06·登记源=**post-prove 复验报告 FAIL**（meetwise 主树 `.tmp/reviews/s3-final.md`·P0×1 别名读放大宿主 FATAL+P1×1 §3 宿主存活失实+liar 量级低估 4 倍+P2×6）·本刀系 post-prove FAIL 处置修订）**：复验 P0 定谳（本席两树亲复现）：mammoth→jszip 按关系别名把同一条目重复解压 4-6 次（docx-reader `.also` 并发+readXmlFileWithBody 重读·jszip `CompressedObject.getContentWorker` 每读新建解压管线不缓存），62,423B 诚实声明 60MB docx 过守卫（声明合计 ≤64MB 帽内）→worker 内三路并发解码同一条目→单次大字符串分配（80-120MB 双字节串）越 resourceLimits 堆帽→V8 FatalProcessOutOfMemory **abort 宿主全进程 EXIT=134**——worker_threads 的 `ERR_WORKER_OUT_OF_MEMORY` 映射（:211-213 旧值）根本没机会执行，#108「isolate 只死 worker/宿主存活」前提被实测推翻。处置（§1.7 四件）：①解析隔离线程级→**进程级**（resume-extract-child.ts 新建·fork+双 V8 帽+SIGKILL 硬超时·宿主收确定错误码·零新错误码——exit 无结果/OOM abort→`extract_timeout` 级·解析器拒→原码透传·服务层 `parse_failed` 422 兜底不变）；②域层解析并发闸 `RESUME_PARSE_CONCURRENCY ?? 2` FIFO（PARSE_MAX=6 服务闸不变）；③守卫增单条目声明帽 10MB（A2 口径增补·协调方随令授权行使·总量 64MB 维持·复验修订清单 1a 记忆化+1b 单条目帽合取采行）；④子进程内 mammoth 适配器记忆化+按声明值流式计量（消费层·非守卫层·§4-1 否决案不触）。P1-1 处置：§3 首条如实改写（宿主存活说法删除·liar 量级 4.4GB/8s+×6 聚合如实登记·详 §3）。P2 清单处置：P2-3 proof 措辞已收敛（:189-193）；P2-1 三处「零误伤」撤改（码注 :119-120/:134-137+本卷 §1.7）；P2-4 行号钉漂移勘正：§1.3 标题旧钉 `:251-255` 系 r3 届值误钉（实 `:254-258`），r4 落码后接线重 pin=**:302-305**（:303 守卫调用·:304 runInChild）；§1.2 子区间 r4 届值=帽常量 :121-128/哨兵常量 :139-140/工厂 :142/守卫函数 :154-186（走读自洽 :175/CD 耗尽 :186/单条目帽 :181）；P2-5 哨兵承重集+P2-6 扫窗误伤边随 §3 登记。**r4 探针读数（`/tmp/s3fix-probe/` 本席亲跑·复验旧探针 `/tmp/s3final-probe/` 复用）**：修复前**本支**（@`0e73cd25f`）mr-chain 60MB 全别名=guard PASS→**FATAL "Reached heap limit"→SIGABRT 宿主死**（崩带 45-60MB 声明·40/50MB trio 位形崩带边缘 ACCEPT/崩交替与报告吻合）；修复前**基线** `origin/main @92a82a944`（`git worktree add --detach /tmp/s3base origin/main` 亲建·用后移除·零任何帽）同文件同样 FATAL+SIGABRT（1/1·守卫帽原为削量设计，基线连守卫皆无故同崩）；修复后：崩溃探针 10/10=guard `zip_uncompressed_overflow` 0-1ms 宿主全存活；单条目帽内别名件（9MB 声明·五别名）子进程记忆化全链 ACCEPT（单次解压）；平凡 liar 声明 100B/实际 4GB→`zip_uncompressed_overflow` **307ms 早停**（修复前 8s 超时+worker 内留存约 4.4GB·复验席同枚实测 4443MB ArrayBuffer@7.76s）；6 路并发（3 诚实 9MB 别名+3 枚 4GB liar）全数确定码 1.1-1.2s 收场、宿主峰值 RSS **183MB**（进程树含 tsx 工具链 ~602MB·修复前单枚 4GB liar 即 8s 留存 4.4GB、×PARSE_MAX=6 聚合 ~26GB 量级）；17 真实 docx（mammoth test-data）两树（基线/r4）逐条 sha256 **恒等 17/17**；普通 docx 解析耗时（同机 17 件×7 次同 mammoth@1.12.0）：基线 p50=281ms/p95=311ms → r4 子进程形 p50=282ms/p95=342ms（p50 持平·p95 +31ms≈10%·冷启首轮实测 p50=556ms 含 tsx 首编译；生产 swc loader 冷启参照 #108 实测 ≈265ms）；帽值阶梯：子进程形 minSucceed=256MB（heapUsed 254.4MB·余量较 worker 形 235.3MB 变薄·更重合法件 OOM→extract_timeout 422 确定性降级=#108 既有取舍）。**policy/cap 零步进**：r4 改动集净增受管 0（resume-extract-worker.ts 删 −1+resume-extract-child.ts 增 +1+三既有件行内改）→check-docs 实扫 2487=cap 2487 恰等亲跑机证（两 policy 脚本四联动点零触·沿「既有件行内改零增计」先例）。est live=0·markers 0·⛔push 落卷即停。状态保持 `executed:awaiting_post_prove_dual`（rev r4 待 post-prove 复审重派）。

---

*S3-UPLOAD-CAPS REQUEST · 2026-11-05 起草含码落卷 · **`draft:awaiting_pre_exec_dual`**（pre-exec 双审两独立外席留协调方派席·alone≠dual·Ban self-approve·翻面权归协调方·est live=0·actualSpendCny=null·markers=0）· base `origin/main` @`fd2b74635`（#205 并线点·fetch 届值恒等亲证·worktree `meetwise-s3caps` branch `line/s3caps-draft` 亲立·建前零同名卷三查亲证）· 立项出处=协调方派单令 2026-11-05 + extrev-deps-audit-REQUEST.md §1-S3/rev2 A2 :176 帽值预登记 + 外部总表 #107 · 修法=resume-extract 解包前置守卫（EOCD/central directory 手读零新依赖·条目 ≤1000/解压总量 ≤64MB·三新码 fail-closed）+docx 分支 :229 接线+proof §6b 八断言（负例两向/恰帽边界/结构不可核/正例旁证）〔rev r1：守卫增两行 EOCD 自洽检（:135 预走读 cdOffset+cdSize 恰抵 EOCD/:144 走读后 CD 区恰耗尽·闭 EOCD 字段谎报整类绕过）·接线重 pin :231·proof §6b 增至十五断言（+自洽检负例四+真实三件同构变体三·反事实仓内机证）〕〔rev r3 2026-11-05（登记源=post-prove 席2 FAIL 实锤·详 §9 rev r3 注记）：EOCD zip64 哨兵六字段检+注释区余量检落码（守卫 :147/:148-155·闭 zip64 覆写类+P2-4 判定缝）·rev r1「闭整类绕过」如实勘正=两检所闭系声明面谎报类，zip64 覆写类由 rev r3 另闭·接线重 pin :255·proof §6b 增至二十九断言（全卷 64）〕· CAP-SANCTION-2485 起草随刀恰等步进预登（main 届扫 2484+本卷 1=2485 恰等零多放·errata/perf 同号在飞沿 2480 三支同号 dual-keep 先例形·union 并线期届时取大重算承登）· 三门 docs 2485=cap 恰等/PTP 12/12/markers 0 亲跑在卷·proof 43 断言全绿〔rev r1 50 断言全绿·三门 rev r1 复跑同值〕 · rev r1 2026-11-05 落卷（登记源=pre-exec dual 席1 P1 双探针+P2 清单·详 §9 rev r1 注记·状态保持 `draft:awaiting_pre_exec_dual` 待 dual r2） · ⛔push ⛔merge主线 ⛔force push ⛔动在飞五树 ⛔Key 值零触 · 落卷即停*【rev r4 2026-11-06（post-prove 复验报告 FAIL 处置修订 · append-only · 前值史录在注）: 复验定谳别名读放大类=worker 单次大分配越堆帽→宿主全进程 FATAL abort（EXIT=134 两树亲复现·基线 origin/main 92a82a944 同崩）——修法四件=解析隔离升级独立 OS 子进程（resume-extract-child.ts·fork·--max-old-space-size=256+--max-semi-space-size=32·到点 SIGKILL·子进程 abort 只死子进程宿主收确定码）+域层解析并发闸 RESUME_PARSE_CONCURRENCY 默认 2+守卫增单条目声明帽 10MB（A2 增补·总量 64MB 维持）+子进程内 mammoth 适配器记忆化+按声明值流式计量（零新依赖零新错误码·服务层零触）·proof 增四断言 64→68 全绿·门矩阵全绿（typecheck 0·lint 115=基线·neg:resume 91·arch 8=基线·egress EXIT=0·docs 2487=cap 恰等净增零·PTP 12/12·markers 0）·17 真实 docx 两树 sha256 恒等·liar 307ms 早停（前 8s/4.4GB）·6 路并发宿主峰值 RSS 183MB（前 ~26GB 量级）·耗时 p50 持平 p95 +31ms·§3 如实改写（宿主存活旧说删除·详 §3/§9 rev r4 注记）·有效态维持 `executed:awaiting_post_prove_dual`（Status 行/§8/§9/卷尾四处同值 · post-prove 复审待重派）】*