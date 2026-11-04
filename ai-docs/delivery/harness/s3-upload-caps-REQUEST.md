# Harness — **S3-UPLOAD-CAPS**（extrev-deps-audit S3 残面窄化小刀·#107 解压守卫 docx 解包前置双帽 · REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草含码落卷即停·沿 IDU/ISO-DOTENV-PERF 先例 draft 含码·pre-exec 双审两独立外席留协调方派席·alone≠dual·Ban self-approve·行翻面权归协调方·est live=0·`actualSpendCny=null`·markers=0·⛔push ⛔merge 主线 ⛔force push）【状态钉四处：本行+§8+§9+卷尾·同值】
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

### 1.2 件② 同文件 :102-143 新增守卫节（帽常量+签名常量+守卫函数·魔数门节后 EXTRACT_TIMEOUT_MS 前插）

- :102-108 处方锚注（#107 处方·帽值两行依据：正常 docx <100 条目含 media 余量·12MB bodyLimit × 压缩比合理域·声明合计守卫=解包前零解压成本定夺·zip64 哨兵 0xFFFFFFFF 天然越帽）；
- :110-111 帽常量：`const DOCX_ZIP_MAX_ENTRIES = 1000;` / `const DOCX_ZIP_MAX_UNCOMPRESSED_TOTAL = 64 * 1024 * 1024;`
- :113-114 签名常量：`ZIP_EOCD_SIG = 0x06054b50`（PK\x05\x06）/ `ZIP_CDH_SIG = 0x02014b50`（PK\x01\x02）；
- :116 `zipGuardErr` 工厂（沿 `mismatch()` :79 同族 Object.assign 形）；
- :118-123 doc 注（读法/三码/fail-closed 语义/前插数据失配同拒如实披露）；
- :123-143 守卫函数（export·沿 `assertMagicMatchesDeclaration` export 先例）：

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
  const totalEntries = buffer.readUInt16LE(eocd + 10);
  if (totalEntries > DOCX_ZIP_MAX_ENTRIES) throw zipGuardErr('zip_entry_overflow');
  const cdOffset = buffer.readUInt32LE(eocd + 16);
  let p = cdOffset;
  let uncompressedTotal = 0;
  for (let n = 0; n < totalEntries; n++) {
    if (p + 46 > eocd || buffer.readUInt32LE(p) !== ZIP_CDH_SIG) throw zipGuardErr('zip_directory_invalid');
    uncompressedTotal += buffer.readUInt32LE(p + 24);   // central directory uncompressedSize 声明值
    if (uncompressedTotal > DOCX_ZIP_MAX_UNCOMPRESSED_TOTAL) throw zipGuardErr('zip_uncompressed_overflow');
    p += 46 + buffer.readUInt16LE(p + 28) + buffer.readUInt16LE(p + 30) + buffer.readUInt16LE(p + 32);
  }
}
```

机制要点：EOCD 自尾反向扫（注释区 ≤65535+22 上界）·条目数先核后走读（守卫自体 O(≤1000) 零 DoS 面）·CDH 定长 46+name+extra+comment 变长步进·`p+46 > eocd` 先检后读零 OOB·全字段小端·零新依赖（纯 Buffer 读）。

### 1.3 件③ 同文件 :227-231 docx 分支守卫接线（:229 守卫调用·先于 worker spawn）

```ts
  if (format === 'docx') {
    assertDocxZipWithinCaps(buffer);   // 解压守卫恒先于 worker spawn:越帽/不可核字节零解包零 isolate 占用
    const raw = await runInWorker('docx', buffer, options?.signal);
    return { text: cleanResumeText(raw), format };
  }
```

### 1.4 件④ packages/domain/test/resume-extract.proof.ts——craftDocx 工具面扩展 + §6b 新臂

- import :5 增 `assertDocxZipWithinCaps`；头注 :3-4 测面行追加守卫段；
- `craftDocx` :110 签名增 `opts?.centralUncompressedOverride?: (name, actual) => number`（:127 central directory uncompressedSize 声明值覆写·local header 与实体字节保持真实小体=超大声明炸弹形·老调用面零破）；
- :140-145 三真实条目提绑 `realDocxEntries`（A1 断言语义零变）；
- :150-179 §6b 新臂八断言（负例两向各 guard 直证+生产缝全链双面·恰帽边界两向·结构不可核·正例旁证）：

| # | 断言（届时行） | 读数 |
|---|---|---|
| 1 | :157 恰 1000 条目 guard 零抛 | 边界上界不误伤 |
| 2 | :158 恰 64MB 声明 guard 零抛 | 边界上界不误伤 |
| 3 | :160 1001 条目 guard → `zip_entry_overflow` | 负例一 guard 面 |
| 4 | :163 1001 条目经 `extractResumeText` 生产缝 → `zip_entry_overflow` | 负例一全链（无守卫时该 fixture 会被 mammoth 静默吃下=断言承重） |
| 5 | :165 64MB+1 声明 guard → `zip_uncompressed_overflow` | 负例二 guard 面 |
| 6 | :168 真 document.xml 条目声明 0xFFFFFFFF（zip64 哨兵形）经生产缝 → `zip_uncompressed_overflow` | 负例二全链 |
| 7 | :172 PK`\x03\x04` 无 central directory 经生产缝 → `zip_directory_invalid` | 结构不可核 fail-closed（"核不了"="拒"） |
| 8 | :179 100 条目真 docx（3 真实件+97 media 形 filler）全链提取输出与 A1 恒等 | 正例旁证防误伤 |

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

1. **负例一（条目数越帽）**：craftDocx 造 1001 条目 fixture → guard 臂+`extractResumeText` 生产缝双断言 `zip_entry_overflow`（:160/:163）。无守卫反事实：该 fixture 会被 mammoth→jszip 静默吃下（返回成功文本）——断言承重非同义反复。
2. **负例二（超大解压声明）**：64MB+1 声明 + 真 document.xml 条目 0xFFFFFFFF（zip64 哨兵）声明两 fixture → guard 臂+生产缝双断言 `zip_uncompressed_overflow`（:165/:168）。
3. **结构不可核**：PK`\x03\x04` 头无 central directory → `zip_directory_invalid`（:172·fail-closed"核不了=拒"面）。
4. **恰帽边界**：恰 1000 条目/恰 64MB 声明零抛（:157/:158·上界不误伤·帽值语义=≤ 恰等通过）。
5. **正例旁证（防误伤）**：100 条目真 docx 全链提取输出与 A1 恒等（:179）+A1 三条目真例既有断言保持（:143-144）——守卫对合法多 media 文档零误伤。
6. **现有 proof 全绿**：`pnpm -C packages/domain prove:resume-extract` 全量 EXIT=0（修前 35 断言基线在案→落码后 43 断言）。
7. **三门**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 且 scanned **2485=cap 2485 恰等**；`node scripts/ai-docs/public-text-policy.proof.mjs` **12/12** EXIT=0；markers 改动集冲突标记扫描 **0**。
8. **node --check**：两 policy `.mjs` 脚本 EXIT=0；`.ts` 面语法门由 tsx proof 行使（tsx 编译即全量语法核）。

---

## §3 Non-claims（翻面不洗）

- 本卷 `closed` ≠ 「解压炸弹全谱清零」≠ 「HA」≠ 「生产容量」。守卫核 central directory **声明合计**非流式真解压计量——声明小实际大的 liar zip 面由 jszip 读取行为承接·如实登记不扩权（流式计量=§4-1 否决案）。
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

- 负例读数：entry-bomb 生产缝=`zip_entry_overflow`·size-bomb 生产缝=`zip_uncompressed_overflow`（0xFFFFFFFF zip64 哨兵形）·无 CD 生产缝=`zip_directory_invalid`·恰帽边界零抛 ×2·100 条目真 docx 正例旁证输出恒等。
- CAP-SANCTION-2485 落点：policy `MAX_FILES = 2_485`+随刀注记·proof 四联动点 2_485/f-2485.md/:2486+随刀注记·PTP 12/12 全量一次行使即全 proof 邻面·2485/2486 双值全行使绿。
- **状态钉 · `draft:awaiting_pre_exec_dual`**（2026-11-05 起草落卷即停·前值无·首钉·详 §8·状态钉四处 Status/§8/本节/卷尾 同值）。

---

*S3-UPLOAD-CAPS REQUEST · 2026-11-05 起草含码落卷 · **`draft:awaiting_pre_exec_dual`**（pre-exec 双审两独立外席留协调方派席·alone≠dual·Ban self-approve·翻面权归协调方·est live=0·actualSpendCny=null·markers=0）· base `origin/main` @`fd2b74635`（#205 并线点·fetch 届值恒等亲证·worktree `meetwise-s3caps` branch `line/s3caps-draft` 亲立·建前零同名卷三查亲证）· 立项出处=协调方派单令 2026-11-05 + extrev-deps-audit-REQUEST.md §1-S3/rev2 A2 :176 帽值预登记 + 外部总表 #107 · 修法=resume-extract 解包前置守卫（EOCD/central directory 手读零新依赖·条目 ≤1000/解压总量 ≤64MB·三新码 fail-closed）+docx 分支 :229 接线+proof §6b 八断言（负例两向/恰帽边界/结构不可核/正例旁证）· CAP-SANCTION-2485 起草随刀恰等步进预登（main 届扫 2484+本卷 1=2485 恰等零多放·errata/perf 同号在飞沿 2480 三支同号 dual-keep 先例形·union 并线期届时取大重算承登）· 三门 docs 2485=cap 恰等/PTP 12/12/markers 0 亲跑在卷·proof 43 断言全绿 · ⛔push ⛔merge主线 ⛔force push ⛔动在飞五树 ⛔Key 值零触 · 落卷即停*
