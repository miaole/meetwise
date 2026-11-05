# Harness — **S3-UPLOAD-CAPS**（extrev-deps-audit S3 残面窄化小刀·#107 解压守卫 docx 解包前置双帽 · REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-11-05 EXEC 行使落卷（nail 期 rebase 并线 CAP-SANCTION-2487 union 承值 2486→2487·届时零码改动沿 IDU 先例·详 §9 EXEC 注记）·前值 **`draft:awaiting_pre_exec_dual`**（起草含码落卷即停·沿 IDU/ISO-DOTENV-PERF 先例 draft 含码·pre-exec 双审两独立外席留协调方派席·alone≠dual·Ban self-approve·行翻面权归协调方·est live=0·`actualSpendCny=null`·markers=0·⛔push ⛔merge 主线 ⛔force push）史录保留·post-prove 双席留协调方派席·alone≠dual·Ban self-approve·翻面权归协调方·est live=0·`actualSpendCny=null`·⛔push ⛔merge 主线 ⛔force push）【状态钉四处：本行+§8+§9+卷尾·同值】
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

---

## §3 Non-claims（翻面不洗）

- 本卷 `closed` ≠ 「解压炸弹全谱清零」≠ 「HA」≠ 「生产容量」。守卫核 central directory **声明合计**非流式真解压计量——声明小实际大的 liar zip：jszip 只在全量膨胀后事后检测（size mismatch·膨胀完才拒），真兜底是 #108 isolate（8s 硬超时 terminate、isolate 级 OOM kill·宿主存活）；old-gen 堆帽不辖 ArrayBuffer/RSS，单请求瞬时 RSS 实测可达约 1GB（探针 p5-chain 亲测 755MB/1349MB）·如实登记不扩权（流式计量=§4-1 否决案）。
- 本刀不 claim PDF/图片/text 分支面（#109 已收口面零回归维持）；不动 `.doc` 分派语义（OLE2 已由 :93 magic_mismatch fail-closed）；不动服务层/web 层错误信封与 i18n 键域。
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

- 负例读数：entry-bomb 生产缝=`zip_entry_overflow`·size-bomb 生产缝=`zip_uncompressed_overflow`（0xFFFFFFFF zip64 哨兵形）·无 CD 生产缝=`zip_directory_invalid`·恰帽边界零抛 ×2·100 条目真 docx 正例旁证输出恒等。
- rev r1 负例读数：谎报 `totalEntries=2` 全链拒=`zip_directory_invalid`（:188 guard/:191 生产缝）·谎报 `cdSize` 全链拒=`zip_directory_invalid`（:192 guard/:195 生产缝）·1001 条目真实三件形（3 真实件+998 media 形 filler）guard/生产缝=`zip_entry_overflow`（:200/:203）·恰 1000 条目同构合法件全链必通输出与 A1 恒等（:206·反事实仓内机证）·恰帽边界 fixture 与真 docx 对两自洽检恒真零适配。
- rev r3 负例读数：zip64 哨兵六字段（EOCD+4/+6/+8/+10=0xFFFF·+12/+16=0xFFFFFFFF）C5 形 guard/生产缝全数=`zip_directory_invalid`（:270/:273·六字段循环十二断言）·注释区越界 guard/生产缝=`zip_directory_invalid`（:282/:285）·恰帽边界/正例/既有负例 50 基线断言零回归零适配。
- rev r3 探针读数（`/tmp/s3caps-probe/` 本席修复前后亲跑·修复前基线=席2 实锤在案本席复跑恒等）：**p3b-c5** 修复前 guard=`ok`/jszip `entries=151 hasDocumentXml=true`/chain=`ACCEPT textLen=8` → 修复后 guard=`REJECT:zip_directory_invalid`/chain=`REJECT zip_directory_invalid`（jszip 独立直调仍读 151 条目=库自身无此守卫，生产链拒于守卫层）；**p5-chain liar**（声明 100B 实体 300MB）修复前 guard=`ok`/chain=`REJECT parse_failed "uncompressed data size mismatch"` 694ms/RSS 755MB（300MB 全量膨胀完才被 jszip 事后检测）→ 修复后 guard=`REJECT:zip_directory_invalid`/chain=`REJECT zip_directory_invalid` **0ms**/RSS 374MB（零解包零 worker spawn）；**p5-chain honest**（声明 300MB）修复前 guard=`ok`/chain=`REJECT parse_failed` 989ms/RSS **1349MB**（mammoth 崩前真解压发生=§3 liar 行实测依据）→ 修复后同上 REJECT zip_directory_invalid 0ms/RSS 374MB。
- CAP-SANCTION-2485 落点：policy `MAX_FILES = 2_485`+随刀注记·proof 四联动点 2_485/f-2485.md/:2486+随刀注记·PTP 12/12 全量一次行使即全 proof 邻面·2485/2486 双值全行使绿。
- **rev r1 注记（2026-11-05·登记源=pre-exec dual 席1 P1 双探针实证+P2 清单·探针证词转录）**：守卫帽对 EOCD 字段谎报整类绕过——jszip 按签名连续走读不用 EOCD totalEntries 定界（zipEntries.js:129-139（签名驱动走读）+:141-151（walked>declared 容忍分支·"no error here" 在 :148）；rev 席亲证 jszip@3.10.1 `readCentralDir` 系 `while (readAndCheckSignature(CENTRAL_FILE_HEADER))` 按签名连续走读、walked>declared 落入 "no error here" 容忍分支，机制属实）：谎报 `totalEntries=2`+附加 100,002 条 CDH → 守卫 PASS→mammoth 全链 ACCEPT（席1 亲证 297ms 提取成功）；双 CD `cdSize` 操纵同类。修法=守卫两行 fail-closed 自洽检（预走读 `cdOffset+buffer.readUInt32LE(eocd+12) !== eocd`→`zip_directory_invalid` 落码 :135·走读循环后 `p !== eocd`→`zip_directory_invalid` 落码 :144）——两检合用闭探针 1/2 及「良性 CD 填满至 EOCD+敌对 CD 异域」变体；帽值常量/三错误码零变；恰帽边界 fixture 与真 docx 两检恒真（既有负例零触自洽检零适配，proof 亲证）。同席 P2 勘正随刀：§1.2 三处预测行号勘正（签名常量 :112-113/工厂 :115/doc 注 :117-122）+新两行落码后全部行号重 pin（§1.2/§1.3/§1.4/§2）·§1.4 表行 4+§2-1 反事实句勘正（18ms 亲证+简形拒因缺主件如实披露）·建议采纳：负例 fixture 补真实三件变体断言（1001=3 真实件+998 media 形 filler 越帽拒+恰 1000 同构合法件全链必通两向同 fixture 族闭合·反事实承重升为仓内机证）。状态保持 `draft:awaiting_pre_exec_dual`（待 dual r2）。
- **rev r2 注记（2026-11-05·登记源=pre-exec dual r2 席1 FAIL 报告·typecheck 三点对照：main 绿/draft 红 4/单行修绿+50 断言绿）**：proof :141 `realDocxEntries` 类型 `Array<[string, string]>` → `[[string, string], [string, string], [string, string]]` 单行定长标注——闭 :168 TS2532（noUncheckedIndexedAccess 索引）+:176 ×3 TS2322（三元组展开）共 4 红·断言语义零变（50 断言复跑全绿）·typecheck 纳入门矩阵（§2-11）。随刀 P2 引用勘正：rev r1 注记 jszip 走读行号 `zipEntries.js:216-236` 系 extraBytes/前插数据容忍块（"we keep it" 在 :236）配对错位→勘正为 `zipEntries.js:129-139`（签名驱动走读）+`:141-151`（walked>declared 容忍分支·"no error here" 在 :148）·rev r2 席亲读 jszip@3.10.1 zipEntries.js 吻合。状态保持 `draft:awaiting_pre_exec_dual`（待 dual r2 会签复验）。
- **rev r3 注记（2026-11-05·登记源=post-prove 席2 FAIL 实锤（C5 双探针 ACCEPT 亲证）+rev r3 席亲读 jszip@3.10.1 zipEntries.js/utils.js/DataReader.js）**：rev r1「两检合用闭 EOCD 字段谎报**整类**绕过」系过度声明·如实勘正=**两检所闭系声明面谎报类（jszip 按声明面目录走读的形）·zip64 覆写类不在其内**——EOCD 六字段（diskNumber/diskWithCentralDirStart/centralDirRecordsOnThisDisk/centralDirRecords 各 16 位 +4/+6/+8/+10·centralDirSize/centralDirOffset 各 32 位 +12/+16）任一等于哨兵（0xFFFF/0xFFFFFFFF 字形；jszip `MAX_VALUE_16BITS`=65535 utils.js:381·`MAX_VALUE_32BITS`=**-1** utils.js:382 系 `readInt(4)` 32 位符号回绕读作 -1·字节形恒等）即触发 jszip zip64 路径（zipEntries.js:190 判定全集——**该六字段即全部触发字段，无第七个**）：`readBlockZip64EndOfCentral` 以 zip64 EOCD 记录覆写全部六字段后按覆写值另读目录——守卫声明面所审目录与 jszip 实读目录分叉，声明面自洽检对该类失效。席2 C5 实锤：EOCD+8 recordsOnDisk=0xFFFF（守卫只读 +10/+12/+16·良性 CD 3 条目 12B 全自洽）→守卫 PASS→jszip 实读敌对 CD 151 条目→mammoth 全链 ACCEPT；p5-chain 同形 300MB 真解压发生（liar 形 RSS 755MB 膨胀完才被 jszip size mismatch 事后拒·honest 形 RSS 1349MB mammoth 崩前真解压——§3 liar 行随之如实改写）。修法（守卫 +9 行·帽值常量/三错误码零变）：:147 注释区余量检（`commentLen > 缓冲余量` 即拒——与 jszip readData checkOffset 读法恒等，闭 P2-4「守卫放行而 jszip 抛错」判定缝）+:148-155 哨兵六字段检任一命中 `zip_directory_invalid`（哨兵检置于条目帽/自洽检之前——`centralDirRecords`=0xFFFF 形由 rev 前的 `zip_entry_overflow`（65535>1000）改归 `zip_directory_invalid`，触发面单一码面）——12MB 信封帽下合法 docx 不可能 zip64（zip64 为 >4GB/>65535 条目而生），拒绝零误伤面；既有正例/恰帽边界/既有负例 50 断言零适配零回归（proof 亲证）。proof 增十四断言（§6b 15→29·全卷 50→64·§1.4/§2-12 随登）。残余判定缝如实登记（零动作）：EOCD 签名落守卫反向扫窗之外最后 21 字节（jszip lastIndexOfSignature 搜索全域至 len-4）或 local header 声明偏移指向截断区时 jszip 仍可先抛——该形守卫亦可拒或服务层未知码→`parse_failed` 422 兜底，fail-closed 不敞口，留观察。探针修复前后读数见上 rev r3 探针读数行。状态保持 `executed:awaiting_post_prove_dual`（rev r3 待 post-prove 复审）。
- **EXEC 注记（2026-11-05·登记源=pre-exec dual r2 会签 BOTH PASS+协调方 EXEC 授权随令·沿 IDU/ISO-DOTENV-PERF draft 含码先例「届时零码改动」）**：`git fetch origin` EXIT=0 届值如实采 origin/main `92a82a944`=#209 perf-status-pin 已并（main 届扫 2486=cap 2486 恰等=CAP-SANCTION-2486 ISO-DOTENV-PERF EXEC nail 期承值）→ nail 期 rebase 并线：两 policy 脚本共 4 处冲突块（policy 注记/cap 区+proof loop 区+proof atCap 数值区+proof 注记/overCap 区）dual-keep 双留（main 侧 CAP-SANCTION-2485 ERRATA+2481 ISO 起草+2485 ISO EXEC+2486 ISO PERF 链注史录全保留+本支 CAP-SANCTION-2485 起草注并留·号随 merge-tree 重排·沿 CAP-SANCTION-2486 PERF nail 并线 dual-keep 先例形）+新增 **CAP-SANCTION-2487** union 注（cap 2486→2487 恰等零多放·四联动点 2_487/f-2487.md/:2488·union 算式=main 届扫 2486+本卷 1=2487·合并树 docs:check EXIT=0 scanned 2487 恰等亲跑=机证·本支预登 2485 系并线前预登史录保留零洗·在飞 pay `fdaa1ecf0`/uc31 `112ac8af0` 各 ahead=1 两 policy 零触承 2486 届枚举如实列·scoringeval 树撤+分支删/ag20+loadw ref 已撤如实注/ancient 分叉不预采）·rebase 后三 commit（`464ca30ca`/`c8904a3d0`/`16bbd8555`）对原支三 commit（`3842a2f2a`/`d77f66f3b`/`96ad5d679`）patch 亲比逐字节同（非 policy 面三 commit 全同+policy 面仅 dual-keep/union 注及数值行恰等改差异）=落点 pin 零漂移零重 pin（守卫 :135/:144/接线 :231/proof :141 亲读吻合）·代码面零新触（packages/ 零字节差）·EXEC 终验读数见上表 EXEC 行·状态转 `executed:awaiting_post_prove_dual`（post-prove 双席留协调方派席）。
- **状态钉 · `draft:awaiting_pre_exec_dual`**（2026-11-05 起草落卷即停·前值无·首钉·详 §8·状态钉四处 Status/§8/本节/卷尾 同值）。
- **状态钉 · `executed:awaiting_post_prove_dual`**（2026-11-05 EXEC 行使落卷翻面·前值 `draft:awaiting_pre_exec_dual` 史录保留在上一钉·详 §8 EXEC 翻面·状态钉四处 Status/§8/本节/卷尾 同值）。

---

*S3-UPLOAD-CAPS REQUEST · 2026-11-05 起草含码落卷 · **`draft:awaiting_pre_exec_dual`**（pre-exec 双审两独立外席留协调方派席·alone≠dual·Ban self-approve·翻面权归协调方·est live=0·actualSpendCny=null·markers=0）· base `origin/main` @`fd2b74635`（#205 并线点·fetch 届值恒等亲证·worktree `meetwise-s3caps` branch `line/s3caps-draft` 亲立·建前零同名卷三查亲证）· 立项出处=协调方派单令 2026-11-05 + extrev-deps-audit-REQUEST.md §1-S3/rev2 A2 :176 帽值预登记 + 外部总表 #107 · 修法=resume-extract 解包前置守卫（EOCD/central directory 手读零新依赖·条目 ≤1000/解压总量 ≤64MB·三新码 fail-closed）+docx 分支 :229 接线+proof §6b 八断言（负例两向/恰帽边界/结构不可核/正例旁证）〔rev r1：守卫增两行 EOCD 自洽检（:135 预走读 cdOffset+cdSize 恰抵 EOCD/:144 走读后 CD 区恰耗尽·闭 EOCD 字段谎报整类绕过）·接线重 pin :231·proof §6b 增至十五断言（+自洽检负例四+真实三件同构变体三·反事实仓内机证）〕〔rev r3 2026-11-05（登记源=post-prove 席2 FAIL 实锤·详 §9 rev r3 注记）：EOCD zip64 哨兵六字段检+注释区余量检落码（守卫 :147/:148-155·闭 zip64 覆写类+P2-4 判定缝）·rev r1「闭整类绕过」如实勘正=两检所闭系声明面谎报类，zip64 覆写类由 rev r3 另闭·接线重 pin :255·proof §6b 增至二十九断言（全卷 64）〕· CAP-SANCTION-2485 起草随刀恰等步进预登（main 届扫 2484+本卷 1=2485 恰等零多放·errata/perf 同号在飞沿 2480 三支同号 dual-keep 先例形·union 并线期届时取大重算承登）· 三门 docs 2485=cap 恰等/PTP 12/12/markers 0 亲跑在卷·proof 43 断言全绿〔rev r1 50 断言全绿·三门 rev r1 复跑同值〕 · rev r1 2026-11-05 落卷（登记源=pre-exec dual 席1 P1 双探针+P2 清单·详 §9 rev r1 注记·状态保持 `draft:awaiting_pre_exec_dual` 待 dual r2） · ⛔push ⛔merge主线 ⛔force push ⛔动在飞五树 ⛔Key 值零触 · 落卷即停*【EXEC 翻面 2026-11-05（S3-UPLOAD-CAPS 总刀 EXEC · pre-exec dual r1 FAIL→rev r1→dual r2 席1 FAIL→rev r2→dual r2 两独立外席会签 BOTH PASS+协调方明示 EXEC 授权随令 · append-only · 前值史录在注）: 本行前值 `draft:awaiting_pre_exec_dual` 史录保留 · 有效态转 `executed:awaiting_post_prove_dual`（Status 行/§8/§9/卷尾四处同值 · nail 期 rebase 并线 CAP-SANCTION-2487 union 承值 2486→2487 · 届时零码改动沿 IDU 先例 · 详 §9 EXEC 注记）】*
