/**
 * resume-extract:prove — 简历多格式提取 + 清洗。
 * 测:格式探测(pdf/docx/image/text)· 清洗(控制字符/空白/空行/不间断空格)· 文本直通 · 图片抛 OCR
 *    · 解压守卫多帽负例/恰帽边界/多条目正例旁证(条目数/单条目声明/解压总量·fail-closed 先于子进程 spawn)
 *    · EOCD 字段谎报自洽检负例/真实三件同构变体两向(越帽拒·同构合法件必通)。
 *    · EOCD 六字段 zip64 哨兵负例(C5 覆写形·守卫审的目录=jszip 实读的目录)/注释区越界廉价检。
 *    · rev r4(复验别名读放大类):单条目声明帽负例 guard+生产缝/关系别名诚实件全链提取恒等/
 *      单条目 liar 声明值早停全链拒(子进程流式计量)。
 *    · rev r5(post-prove 双席 FAIL 处置·生产映射直证四臂,闭 r4-1 P2-2 缝):子进程被杀
 *      (abort→SIGKILL→extract_timeout)/8s 到点(extract_timeout)/子进程 OOM(deep-xml DOM 形→
 *      V8 abort→child_oom)/畸形帧(IPC 反序列化崩溃守卫→child_crash)——各断言宿主存活与错误码;
 *      另证清洗截断下沉(20M 字件只回传帽+1 字)。
 */
import { deflateRawSync, deflateSync } from 'node:zlib';
import { detectResumeFormat, cleanResumeText, extractResumeText, looksLikeEncryptedPdf, assertDocxZipWithinCaps, probeCorruptIpcFrame } from '../src/resume-extract.ts';

let n = 0;
const ok = (c: boolean, m: string) => { if (!c) { console.error('✗', m); process.exit(1); } n++; };
// liar 早停时窗上界(诊断性·主判据=错误码):子进程 fork 冷启(tsx loader 实测 ~110-300ms)+早停读面,
// 远低于全量膨胀 32MB+jszip 事后核对的旧路径。
const EXTRACT_LIAR_EARLY_STOP_MS = 4000;

// 1. 格式探测(按 mime + 文件名)
ok(detectResumeFormat('application/pdf', 'cv.pdf') === 'pdf', 'pdf by mime');
ok(detectResumeFormat('', 'resume.PDF') === 'pdf', 'pdf by ext(大小写)');
ok(detectResumeFormat('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'a.docx') === 'docx', 'docx by mime');
ok(detectResumeFormat('', 'my-resume.docx') === 'docx', 'docx by ext');
ok(detectResumeFormat('image/png', 'scan.png') === 'image', 'image by mime');
ok(detectResumeFormat('', 'photo.JPEG') === 'image', 'image by ext');
ok(detectResumeFormat('text/plain', 'r.txt') === 'text', 'text 显式允许');
ok(detectResumeFormat('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'budget.xlsx') === 'unsupported', 'xlsx 必须走专用表格摄取器，不能 UTF-8 兜底');
ok(detectResumeFormat('application/pdf', 'deck.pptx') === 'unsupported', '文件名声明 PPTX 即使 MIME 伪称 PDF 也 fail-closed');
ok(detectResumeFormat('video/mp4', 'meeting.mp4') === 'unsupported', '视频必须走转写/时间轴摄取器，不能文本兜底');
ok(detectResumeFormat('application/octet-stream', 'payload.bin') === 'unsupported', '未知二进制 fail-closed');

// 2. 清洗:控制字符 / 多余空白 / 空行 / 不间断空格( )/ CRLF
const dirty = 'Java\u0000\x07 工程师\r\n\r\n\r\n负责 限流   与\t\t分布式锁  \n   \n经历';
const cleaned = cleanResumeText(dirty);
ok(!/[\x00-\x08]/.test(cleaned), '清洗:去掉控制字符');
ok(!cleaned.includes(' '), '清洗:不间断空格→普通空格');
ok(!/\n{3,}/.test(cleaned), '清洗:压缩 3+ 空行为最多 1 空行');
ok(!/[ \t]{2,}/.test(cleaned), '清洗:压缩连续空白');
ok(!/[ \t]\n/.test(cleaned), '清洗:去行尾空白');
ok(cleaned.startsWith('Java') && cleaned.endsWith('经历'), '清洗:首尾 trim + 内容保留');

// 3. 文本直通(extractResumeText 走 text 分支 + 清洗)
const r1 = await extractResumeText(Buffer.from('后端\r\n\r\n\r\n三年经验'), 'text/plain', 'r.txt');
ok(r1.format === 'text' && r1.text === '后端\n\n三年经验', '文本直通 + 清洗');

// 4. 图片 → 抛 image_needs_ocr(上层路由到 vision)——#109 fixture 升级:完整 PNG 签名过嗅探门(断言语义守恒)
let threw = '';
try { await extractResumeText(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'image/png', 'x.png'); } catch (e: any) { threw = e?.code; }
ok(threw === 'image_needs_ocr', '图片 → 抛 image_needs_ocr(seam 留给 qwen-vl OCR)');

// 4b. #109 魔数守卫:声明 vs 字节不符 → magic_mismatch(fail-closed·嗅探先于加密扫描与解析)
const codeOf = (e: unknown): string => (e as { code?: string })?.code ?? '';
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
let trunc = '';
try { await extractResumeText(Buffer.from([0x89, 0x50]), 'image/png', 'trunc.png'); } catch (e) { trunc = codeOf(e); }
ok(trunc === 'magic_mismatch', '#109: 截断 PNG 魔数(2/8 字节) → magic_mismatch');
let emptyZip = '';
try { await extractResumeText(Buffer.from('PK\x05\x06' + '\0'.repeat(18)), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'a.docx'); } catch (e) { emptyZip = codeOf(e); }
ok(emptyZip === 'magic_mismatch', '#109: 空 zip 头(PK\\x05\\x06) 声明 docx → magic_mismatch');
let spanHdr = '';
try { await extractResumeText(Buffer.from('PK\x07\x08abcdefgh'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'a.docx'); } catch (e) { spanHdr = codeOf(e); }
ok(spanHdr === 'magic_mismatch', '#109: span 标记头(PK\\x07\\x08) 声明 docx → magic_mismatch');
let zipAsText = '';
try { await extractResumeText(Buffer.from('PK\x03\x04zipbytes'), 'text/plain', 'r.txt'); } catch (e) { zipAsText = codeOf(e); }
ok(zipAsText === 'magic_mismatch', '#109: zip 头声明纯文本 → magic_mismatch(text 分支拒 PK 三签)');
let pdfAsText = '';
try { await extractResumeText(Buffer.from('%PDF-1.4 trailing'), 'text/plain', 'r.txt'); } catch (e) { pdfAsText = codeOf(e); }
ok(pdfAsText === 'magic_mismatch', '#109: PDF 字节声明纯文本 → magic_mismatch');
let oleAsText = '';
try { await extractResumeText(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), 'text/plain', 'r.txt'); } catch (e) { oleAsText = codeOf(e); }
ok(oleAsText === 'magic_mismatch', '#109: OLE2 头声明纯文本 → magic_mismatch(.doc 族残面收口)');
let pngAsText = '';
try { await extractResumeText(PNG_SIG, 'text/plain', 'r.txt'); } catch (e) { pngAsText = codeOf(e); }
ok(pngAsText === 'magic_mismatch', '#109: 图像字节声明纯文本 → magic_mismatch');
let pk56Text = '';
try { await extractResumeText(Buffer.from('PK\x05\x06' + '\0'.repeat(18)), 'text/plain', 'r.txt'); } catch (e) { pk56Text = codeOf(e); }
ok(pk56Text === 'magic_mismatch', '#109: 空 zip 头声明纯文本 → magic_mismatch');
let pk78Text = '';
try { await extractResumeText(Buffer.from('PK\x07\x08abcdefgh'), 'text/plain', 'r.txt'); } catch (e) { pk78Text = codeOf(e); }
ok(pk78Text === 'magic_mismatch', '#109: span 头声明纯文本 → magic_mismatch');

let unsupported = '';
try { await extractResumeText(Buffer.from('PK\\x03\\x04'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'budget.xlsx'); } catch (e: any) { unsupported = e?.code; }
ok(unsupported === 'unsupported_file_format', '未接线 Excel 产生显式 quarantine 信号，绝不作为乱码文本入库');


// 5. UC-E2E-015 E1：加密 PDF 探测 + extract 抛 encrypted
const encPdf = Buffer.from([
  '%PDF-1.4',
  '1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj',
  'trailer<< /Root 1 0 R /Encrypt 4 0 R >>',
  '%%EOF',
  '',
].join('\n'), 'utf8');
ok(looksLikeEncryptedPdf(encPdf) === true, 'looksLikeEncryptedPdf 命中 /Encrypt');
ok(looksLikeEncryptedPdf(Buffer.from('%PDF-1.4 no dict')) === false, '无 Encrypt 字典不误报');
let encCode = '';
try { await extractResumeText(encPdf, 'application/pdf', 'locked.pdf'); } catch (e: any) { encCode = e?.code; }
ok(encCode === 'encrypted', '加密 PDF → 抛 encrypted（UC-E2E-015 E1）');


// 6. A1(rev2 硬义务)：真实 docx 提取正例 —— 手构最小 OOXML zip(STORED 零压缩·CRC32 内联·零新依赖)，
//    经 mammoth→@xmldom/xmldom 端到端提取并断言输出(兼证 xmldom 0.8.15 升级链)；
//    S3 负例(多条目 zip/超大解压声明/坏魔数)的 zip 构造工具面与本节共用 craftDocx。
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
  return t;
})();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = (CRC_TABLE[(c ^ b) & 0xff] ?? 0) ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
/** 最小 zip(STORED)：local header + central directory + EOCD——足够 jszip/mammoth 读取。
 *  opts.centralUncompressedOverride：仅覆写 central directory uncompressedSize 声明值(解压守卫
 *  负例专用——超大声明炸弹形·local header 与实体字节保持真实小体)。 */
function craftDocx(entries: Array<[name: string, content: string]>, opts?: { centralUncompressedOverride?: (name: string, actual: number) => number }): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const [name, content] of entries) {
    const nameB = Buffer.from(name, 'utf8');
    const data = Buffer.from(content, 'utf8');
    const crc = crc32(data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6); lh.writeUInt16LE(0, 8);
    lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0x2100, 12); lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(nameB.length, 26); lh.writeUInt16LE(0, 28);
    locals.push(lh, nameB, data);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0, 8);
    ch.writeUInt16LE(0, 10); ch.writeUInt16LE(0, 12); ch.writeUInt16LE(0x2100, 14); ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(opts?.centralUncompressedOverride?.(name, data.length) ?? data.length, 24);
    ch.writeUInt16LE(nameB.length, 28); ch.writeUInt16LE(0, 30); ch.writeUInt16LE(0, 32);
    ch.writeUInt16LE(0, 34); ch.writeUInt16LE(0, 36); ch.writeUInt32LE(0, 38); ch.writeUInt32LE(offset, 42);
    centrals.push(ch, nameB);
    offset += 30 + nameB.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8); eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cd.length, 12); eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, eocd]);
}
const realDocxEntries: [[string, string], [string, string], [string, string]] = [
  ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
  ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
  ['word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>张三 · 后端工程师</w:t></w:r></w:p><w:p><w:r><w:t>五年 Node/Go 分布式经验</w:t></w:r></w:p></w:body></w:document>'],
];
const realDocx = craftDocx(realDocxEntries);
const rDocx = await extractResumeText(realDocx, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'resume-real.docx');
ok(rDocx.format === 'docx', 'A1: 真实 docx → format=docx');
ok(rDocx.text === '张三 · 后端工程师\n\n五年 Node/Go 分布式经验', 'A1: 真实 docx 端到端提取输出断言(mammoth+xmldom0.8.15)');

// 6b. S3 解压守卫(解包前置双帽:条目数 ≤1000·解压总量声明合计 ≤64MB)负例/边界/正例旁证——
//     负例两向(条目数越帽/超大解压声明)经 extractResumeText 生产缝全链 fail-closed(先于 worker
//     spawn);恰帽边界 guard 级直证上界零误伤;多条目真 docx 正例旁证防误伤合法多 media 文档。
const guardCodeOf = (fn: () => unknown): string => { try { fn(); return ''; } catch (e) { return codeOf(e); } };
const fillerEntries = (count: number, prefix = 'w/f'): Array<[string, string]> =>
  Array.from({ length: count }, (_, i) => [`${prefix}-${String(i).padStart(4, '0')}.xml`, '<x/>']);
// 恰帽边界(guard 级·零解包零子进程):恰 1000 条目·恰 64MB 声明(r4:7 条目均摊,均 <单条目帽) → 零抛。
ok(guardCodeOf(() => assertDocxZipWithinCaps(craftDocx([['a.xml', '<a/>'], ...fillerEntries(999)]))) === '', '守卫边界:恰 1000 条目 → 零抛(上界不误伤)');
ok(guardCodeOf(() => assertDocxZipWithinCaps(craftDocx([['a.xml', '<a/>'], ...fillerEntries(6)], { centralUncompressedOverride: () => Math.floor(64 * 1024 * 1024 / 7) }))) === '', '守卫边界:恰 64MB 解压声明(7 条目均摊·单条目 <10MB 帽) → 零抛(上界不误伤)');
// 负例一:条目数越帽(1001 条目)→ zip_entry_overflow(guard 直证 + 生产缝全链)。
ok(guardCodeOf(() => assertDocxZipWithinCaps(craftDocx([['a.xml', '<a/>'], ...fillerEntries(1000)]))) === 'zip_entry_overflow', '守卫:1001 条目 → zip_entry_overflow');
let entryBomb = '';
try { await extractResumeText(craftDocx([['a.xml', '<a/>'], ...fillerEntries(1000)]), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'bomb-entries.docx'); } catch (e) { entryBomb = codeOf(e); }
ok(entryBomb === 'zip_entry_overflow', '负例一:条目数越帽 docx 经生产缝 → zip_entry_overflow(子进程零 spawn 面拒)');
// 负例二:超大解压声明(真 document.xml 条目声明 0xFFFFFFFF=zip64 哨兵形·实体字节极小)→ zip_uncompressed_overflow。
ok(guardCodeOf(() => assertDocxZipWithinCaps(craftDocx([['a.xml', '<a/>']], { centralUncompressedOverride: () => 64 * 1024 * 1024 + 1 }))) === 'zip_uncompressed_overflow', '守卫:64MB+1 声明 → zip_uncompressed_overflow');
let sizeBomb = '';
try { await extractResumeText(craftDocx([['word/document.xml', realDocxEntries[2][1]]], { centralUncompressedOverride: () => 0xFFFFFFFF }), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'bomb-size.docx'); } catch (e) { sizeBomb = codeOf(e); }
ok(sizeBomb === 'zip_uncompressed_overflow', '负例二:超大解压声明 docx 经生产缝 → zip_uncompressed_overflow(zip64 哨兵声明同拒)');
// 结构不可核(PK 头过魔数门但 central directory 缺失)→ zip_directory_invalid(fail-closed:"核不了"="拒")。
let noEocd = '';
try { await extractResumeText(Buffer.from('PK\x03\x04garbage-no-central-directory-anywhere'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'trunc.docx'); } catch (e) { noEocd = codeOf(e); }
ok(noEocd === 'zip_directory_invalid', '结构不可核:PK 头无 central directory → zip_directory_invalid');
// 正例旁证(防误伤):100 条目真 docx(3 真实件+97 media 形 filler)守卫零误伤·全链提取输出与 A1 恒等。
const wideDocx = craftDocx([
  realDocxEntries[0], realDocxEntries[1], realDocxEntries[2],
  ...fillerEntries(97, 'word/media/img'),
]);
const rWide = await extractResumeText(wideDocx, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'resume-wide.docx');
ok(rWide.format === 'docx' && rWide.text === '张三 · 后端工程师\n\n五年 Node/Go 分布式经验', '正例旁证:100 条目真 docx 守卫零误伤·端到端提取输出恒等');
// 自洽检负例(EOCD 字段谎报探针复刻):谎报 totalEntries(定界少报)则走读早停 CD 区残余 → zip_directory_invalid;
// 谎报 cdSize(cdOffset+cdSize 失配 EOCD)走读前即拒——两检所闭=声明面谎报类 fail-closed
// (zip64 覆写类由上方六字段哨兵检另闭,rev r3 勘正)。
const eocdFieldPatch = (buf: Buffer, field: 'totalEntries' | 'cdSize', val: number): Buffer => {
  const b = Buffer.from(buf);   // 深拷贝:不动 realDocx 原 fixture 字节
  if (field === 'totalEntries') b.writeUInt16LE(val, b.length - 22 + 10); else b.writeUInt32LE(val, b.length - 22 + 12);
  return b;
};
ok(guardCodeOf(() => assertDocxZipWithinCaps(eocdFieldPatch(realDocx, 'totalEntries', 2))) === 'zip_directory_invalid', '守卫自洽检:谎报 totalEntries=2(CD 定界少报·CD 区残余) → zip_directory_invalid');
let lieEntries = '';
try { await extractResumeText(eocdFieldPatch(realDocx, 'totalEntries', 2), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'lie-entries.docx'); } catch (e) { lieEntries = codeOf(e); }
ok(lieEntries === 'zip_directory_invalid', '自洽检负例:谎报 totalEntries 经生产缝 → zip_directory_invalid(全链拒·子进程零 spawn)');
ok(guardCodeOf(() => assertDocxZipWithinCaps(eocdFieldPatch(realDocx, 'cdSize', 1))) === 'zip_directory_invalid', '守卫自洽检:谎报 cdSize(cdOffset+cdSize 失配 EOCD) → zip_directory_invalid');
let lieCdSize = '';
try { await extractResumeText(eocdFieldPatch(realDocx, 'cdSize', 1), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'lie-cdsize.docx'); } catch (e) { lieCdSize = codeOf(e); }
ok(lieCdSize === 'zip_directory_invalid', '自洽检负例:谎报 cdSize 经生产缝 → zip_directory_invalid(全链拒·子进程零 spawn)');
// 真实三件同构变体两向同 fixture 族闭合:1001=3 真实件+998 media 形 filler 越帽拒;恰 1000 同构合法件
// 全链必通且输出与 A1 恒等——证拒因唯一=条目数非结构(无守卫反事实=同构含真实件 zip 被 mammoth→jszip
// 静默吃下,本对向即其仓内机证)。
const realBomb = craftDocx([...realDocxEntries, ...fillerEntries(998, 'word/media/img')]);
ok(guardCodeOf(() => assertDocxZipWithinCaps(realBomb)) === 'zip_entry_overflow', '守卫:1001 条目真实三件形(3 真实件+998 media 形 filler) → zip_entry_overflow');
let realBombSeam = '';
try { await extractResumeText(realBomb, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'bomb-entries-real.docx'); } catch (e) { realBombSeam = codeOf(e); }
ok(realBombSeam === 'zip_entry_overflow', '负例一变体:真实三件 1001 条目经生产缝 → zip_entry_overflow(拒因唯一=条目数)');
const realWide1000 = craftDocx([...realDocxEntries, ...fillerEntries(997, 'word/media/img')]);
const rRealWide = await extractResumeText(realWide1000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'resume-real-1000.docx');
ok(rRealWide.format === 'docx' && rRealWide.text === '张三 · 后端工程师\n\n五年 Node/Go 分布式经验', '负例一变体对向:恰 1000 条目同构合法件全链必通·输出与 A1 恒等(反事实仓内机证)');
// rev r3 负例(zip64 覆写类):EOCD 六字段任一命中 zip64 哨兵(diskNumber/diskWithCentralDirStart/
// centralDirRecordsOnThisDisk/centralDirRecords=0xFFFF·centralDirSize/centralDirOffset=0xFFFFFFFF 字形
// ——jszip zipEntries.js:190 zip64 判定全集,MAX_VALUE_16BITS=65535/MAX_VALUE_32BITS=-1 即同字形)
// → jszip 弃 EOCD 声明面走 zip64 EOCD 覆写路径:以 zip64 记录覆写条目数/目录大小/目录偏移后另读一张
// 目录——守卫只审声明面目录则与 jszip 实读目录分叉。fixture=C5 探针形:守卫可见良性 CD(3 条目·
// cdOffset+cdSize 恰抵 EOCD·恰被 3 条目耗尽)+敌对 CD(151 条目)+zip64 EOCD 记录+locator,EOCD 声明面
// 全自洽仅单哨兵位命中——修复前守卫声明面 PASS、mammoth 全链 ACCEPT 151 条目(席2 实锤),修复后
// 守卫哨兵位即拒 zip_directory_invalid(guard 直证 + 生产缝全链·子进程零 spawn)。
function craftZip64OverrideDocx(sentinelOffset: 4 | 6 | 8 | 10 | 12 | 16): Buffer {
  const hostile: Array<[string, string]> = [['word/document.xml', realDocxEntries[2][1]], ...Array.from({ length: 150 }, (_, i) => [`h/f${String(i).padStart(3, '0')}.xml`, `<x n="${i}"/>`] as [string, string])];
  const locals: Buffer[] = [];
  const hostileCd: Buffer[] = [];
  let cursor = 0;
  for (const [name, content] of hostile) {
    const nameB = Buffer.from(name, 'utf8');
    const data = Buffer.from(content, 'utf8');
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6);
    lh.writeUInt32LE(crc32(data), 14); lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(nameB.length, 26); lh.writeUInt16LE(0, 28);
    locals.push(lh, nameB, data);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x2100, 14);
    ch.writeUInt32LE(crc32(data), 16); ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(nameB.length, 28); ch.writeUInt32LE(cursor, 42);
    hostileCd.push(ch, nameB);
    cursor += 30 + nameB.length + data.length;
  }
  const yStart = cursor;
  const z64Pos = yStart + hostileCd.reduce((s, b) => s + b.length, 0);
  const benignCdParts: Buffer[] = [];
  for (const [name, content] of [['a.xml', '<a/>'], ['b.xml', '<b/>'], ['c.xml', '<c/>']] as Array<[string, string]>) {
    const nameB = Buffer.from(name, 'utf8');
    const data = Buffer.from(content, 'utf8');
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x2100, 14);
    ch.writeUInt32LE(crc32(data), 16); ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(nameB.length, 28); ch.writeUInt32LE(0, 42);
    benignCdParts.push(ch, nameB);
  }
  const benignCd = Buffer.concat(benignCdParts);
  const xStart = z64Pos + 76;   // zip64 EOCD 记录(56B)+zip64 locator(20B)
  const ePos = xStart + benignCd.length;
  const z64 = Buffer.alloc(56);
  z64.writeUInt32LE(0x06064b50, 0); z64.writeBigUInt64LE(44n, 4);   // 声明 size 44 → 扩展区循环 0
  z64.writeBigUInt64LE(BigInt(hostile.length), 24); z64.writeBigUInt64LE(BigInt(hostile.length), 32);   // 覆写后条目数=151
  z64.writeBigUInt64LE(BigInt(ePos - yStart - 76), 40); z64.writeBigUInt64LE(BigInt(yStart), 48);       // 覆写后目录大小/偏移(extraBytes=0 对齐)
  const loc = Buffer.alloc(20);
  loc.writeUInt32LE(0x07064b50, 0); loc.writeBigUInt64LE(BigInt(z64Pos), 8); loc.writeUInt32LE(1, 16);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(3, 10); eocd.writeUInt32LE(benignCd.length, 12); eocd.writeUInt32LE(xStart, 16); eocd.writeUInt16LE(0, 20);   // 声明面:良性 CD 全自洽
  if (sentinelOffset === 12 || sentinelOffset === 16) eocd.writeUInt32LE(0xffffffff, sentinelOffset);
  else eocd.writeUInt16LE(0xffff, sentinelOffset);
  return Buffer.concat([...locals, ...hostileCd, z64, loc, benignCd, eocd]);
}
const ZIP64_SENTINEL_FIELDS: Array<[string, 4 | 6 | 8 | 10 | 12 | 16]> = [
  ['diskNumber', 4], ['diskWithCentralDirStart', 6], ['centralDirRecordsOnThisDisk', 8],
  ['centralDirRecords', 10], ['centralDirSize', 12], ['centralDirOffset', 16],
];
for (const [field, off] of ZIP64_SENTINEL_FIELDS) {
  const buf = craftZip64OverrideDocx(off);
  ok(guardCodeOf(() => assertDocxZipWithinCaps(buf)) === 'zip_directory_invalid', `守卫 zip64 哨兵:EOCD+${off} ${field}=哨兵(C5 形) → zip_directory_invalid`);
  let z64Seam = '';
  try { await extractResumeText(buf, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', `z64-${off}.docx`); } catch (e) { z64Seam = codeOf(e); }
  ok(z64Seam === 'zip_directory_invalid', `zip64 哨兵负例:EOCD+${off} ${field} 经生产缝 → zip_directory_invalid(子进程零 spawn)`);
}
// rev r3 廉价检(判定缝):EOCD 注释区声明长度不得越过缓冲余量——否则守卫放行而 jszip readData
// 越界抛错,守卫 ACCEPT 判定与解析器实际行为分叉。守卫注释区核验与 jszip 读法恒等,越界形 guard 即拒。
const commentLenOverride = (buf: Buffer, val: number): Buffer => {
  const b = Buffer.from(buf);   // 深拷贝:不动 realDocx 原 fixture 字节
  b.writeUInt16LE(val, b.length - 22 + 20);
  return b;
};
ok(guardCodeOf(() => assertDocxZipWithinCaps(commentLenOverride(realDocx, 0xffff))) === 'zip_directory_invalid', '守卫廉价检:EOCD 注释区声明越过缓冲余量 → zip_directory_invalid');
let cmtSeam = '';
try { await extractResumeText(commentLenOverride(realDocx, 0xffff), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'lie-comment.docx'); } catch (e) { cmtSeam = codeOf(e); }
ok(cmtSeam === 'zip_directory_invalid', '廉价检负例:注释区越界形经生产缝 → zip_directory_invalid(子进程零 spawn)');

// rev r4 负例(post-prove FAIL 复验报告别名读放大类):mammoth 关系别名可把同一部件重复解压最多 6 次
// (jszip 不缓存),乘双字节解码 ×2=12 倍读放大——守卫增单条目声明帽 10MB,越帽即拒(解包前定夺,
// 子进程零 spawn);同帽下子进程内适配器按 (部件,encoding) 记忆化+按声明值流式计量(liar 早停)。
// 单条目声明帽(guard 直证 + 生产缝全链·修复前 guard 声明面 PASS→worker 内三路并发解码同一大条目
// →V8 单次大分配越堆帽 FatalProcessOutOfMemory→宿主进程 abort EXIT=134 复验实锤,详卷 §9 rev r4 注记)。
ok(guardCodeOf(() => assertDocxZipWithinCaps(craftDocx([['a.xml', '<a/>']], { centralUncompressedOverride: () => 10 * 1024 * 1024 + 1 }))) === 'zip_uncompressed_overflow', '守卫 rev r4:单条目声明越 10MB 帽 → zip_uncompressed_overflow');
let entrySizeBomb = '';
try { await extractResumeText(craftDocx([['word/document.xml', realDocxEntries[2][1]]], { centralUncompressedOverride: () => 10 * 1024 * 1024 + 1 }), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'bomb-entry-size.docx'); } catch (e) { entrySizeBomb = codeOf(e); }
ok(entrySizeBomb === 'zip_uncompressed_overflow', 'rev r4:单条目声明越帽经生产缝 → zip_uncompressed_overflow(子进程零 spawn 面拒)');
// 正例旁证(防误伤):关系别名件(footnotes/endnotes/comments 同指 word/document.xml·复验崩溃形同构但
// 声明诚实)全链必通且输出与 A1 恒等——记忆化适配器把别名并发读收敛为单次解压/解码,诚实件零误伤。
const aliasRels = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
  + ['footnotes', 'endnotes', 'comments'].map((t, i) => `<Relationship Id="r${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${t}" Target="document.xml"/>`).join('') + '</Relationships>';
const aliasDocx = craftDocx([
  realDocxEntries[0],
  realDocxEntries[1],
  ['word/_rels/document.xml.rels', aliasRels],
  realDocxEntries[2],
]);
const rAlias = await extractResumeText(aliasDocx, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'resume-alias.docx');
ok(rAlias.format === 'docx' && rAlias.text === '张三 · 后端工程师\n\n五年 Node/Go 分布式经验', 'rev r4:关系别名件(三部件同指 document.xml·声明诚实)全链提取输出恒等(记忆化适配器零误伤)');
// 负例(liar 早停·子进程流式计量):document.xml 声明 100B·deflate 实体实际膨胀 512KB——修复前 jszip
// 全量膨胀完才事后核对 size mismatch(实测 8s 内 worker 留存数 GB ArrayBuffer);修复后子进程适配器
// 累计膨胀字节越声明值即中止,生产缝确定性 zip_uncompressed_overflow 且远早于全量膨胀。
function craftLiarDocx(): Buffer {
  const stream = deflateRawSync(Buffer.alloc(32 * 1024 * 1024, 0x41), { level: 9 });
  const crc = crc32(Buffer.alloc(32 * 1024 * 1024, 0x41));
  const declared = 100;
  const nameB = Buffer.from('word/document.xml');
  const lh = Buffer.alloc(30);
  lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6); lh.writeUInt16LE(8, 8);   // method 8=deflate
  lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(stream.length, 18); lh.writeUInt32LE(declared, 22);
  lh.writeUInt16LE(nameB.length, 26); lh.writeUInt16LE(0, 28);
  const ch = Buffer.alloc(46);
  ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0, 8); ch.writeUInt16LE(8, 10);   // method 8=deflate
  ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(stream.length, 20); ch.writeUInt32LE(declared, 24);
  ch.writeUInt16LE(nameB.length, 28); ch.writeUInt32LE(0, 42);
  const cd = Buffer.concat([ch, nameB]);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(1, 8); eocd.writeUInt16LE(1, 10); eocd.writeUInt32LE(cd.length, 12); eocd.writeUInt32LE(30 + nameB.length + stream.length, 16);
  return Buffer.concat([lh, nameB, stream, cd, eocd]);
}
let liarCode = '';
const liarT0 = Date.now();
try { await extractResumeText(craftLiarDocx(), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'liar-entry.docx'); } catch (e) { liarCode = codeOf(e); }
const liarMs = Date.now() - liarT0;
ok(liarCode === 'zip_uncompressed_overflow' && liarMs < EXTRACT_LIAR_EARLY_STOP_MS, `rev r4:单条目 liar(声明 100B·实际 32MB)经生产缝 → zip_uncompressed_overflow(子进程流式计量早停·${liarMs}ms 远早于全量膨胀)`);

// 7. #108/#109 伴生:真实 PDF 提取正例——手构合法 xref(禁依赖 pdf.js recovery 模式)·pdf-parse 端到端
//    经 worker isolate(#108)全链提取并断言非空文本输出(补 worker+pdf-parse happy path 零覆盖面)。
function craftMinimalPdf(text: string): Buffer {
  const esc = text.replace(/([\\()])/g, '\\$1');
  const content = `BT /F1 14 Tf 72 720 Td (${esc}) Tj ET`;
  const objs: string[] = ['', '<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>', `<< /Length ${content.length} >>\nstream\n${content}\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  let out = '%PDF-1.4\n';
  const off: number[] = [0];
  for (let i = 1; i <= 5; i++) { off[i] = out.length; out += `${i} 0 obj\n${objs[i]}\nendobj\n`; }
  const xref = out.length;
  out += 'xref\n0 6\n0000000000 65535 f \n' + off.slice(1).map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  out += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(out, 'latin1');
}
const rPdf = await extractResumeText(craftMinimalPdf('Three Years Backend Engineer Order Systems'), 'application/pdf', 'probe-min.pdf');
ok(rPdf.format === 'pdf' && rPdf.text.trim().length > 0 && rPdf.text.includes('Backend'), '真 PDF 正例:合法 xref 手构 → worker 端到端提取非空文本(#108 worker+pdf-parse happy path)');

// ── rev r5 生产映射直证四臂(错误码按退出码/信号区分·各臂断言宿主存活——断言继续执行到卷尾即活体)──
// r4-1 P2-2 缝闭合:runInChild 被杀/超时/OOM/畸形帧四条生产映射此前仅探针缝间接覆盖,本节四臂全部
// 走生产缝 extractResumeText/probeCorruptIpcFrame(fork 选项与生产 runInChild 同构)。
function craftManyPagesPdf(nPages: number): Buffer {
  const kids = Array.from({ length: nPages }, (_, i) => `${5 + i} 0 R`).join(' ');
  const content = Buffer.from('BT /F1 12 Tf 72 712 Td (x) Tj ET\n', 'latin1');
  const objs: string[] = ['', '<< /Type /Catalog /Pages 2 0 R >>', `<< /Type /Pages /Kids [${kids}] /Count ${nPages} >>`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${content.length} >>\nstream\n${content.toString('latin1')}\nendstream`];
  for (let i = 0; i < nPages; i++) objs.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 3 0 R >> >> >>');
  let out = '%PDF-1.4\n';
  const off: number[] = [0];
  for (let j = 1; j < objs.length; j++) { off[j] = out.length; out += `${j} 0 obj\n${objs[j]}\nendobj\n`; }
  const xref = out.length;
  out += `xref\n0 ${objs.length - 1}\n0000000000 65535 f \n` + off.slice(1).map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  out += `trailer\n<< /Size ${objs.length - 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(out, 'latin1');
}
// 臂①(被杀=abort→SIGKILL·信号路径):多页慢件解析中外部 abort→宿主 SIGKILL 子进程→extract_timeout,
// 子进程被收尸无僵尸、宿主存活(后续断言继续执行即活体)。
const manyPages = craftManyPagesPdf(50000);
{
  const ac = new AbortController();
  const t0 = Date.now();
  setTimeout(() => ac.abort(), 1000);
  let abortCode = '';
  try { await extractResumeText(manyPages, 'application/pdf', 'many-pages-abort.pdf', { signal: ac.signal }); } catch (e) { abortCode = codeOf(e); }
  ok(abortCode === 'extract_timeout' && Date.now() - t0 < 5000, `rev r5 臂①:解析中途 abort→宿主 SIGKILL 子进程→extract_timeout(${Date.now() - t0}ms·宿主存活)`);
}
// 臂②(8s 到点硬超时·timer 路径):同慢件不 abort→EXTRACT_TIMEOUT_MS 到点 SIGKILL→extract_timeout。
{
  const t0 = Date.now();
  let timeoutCode = '';
  try { await extractResumeText(manyPages, 'application/pdf', 'many-pages-timeout.pdf'); } catch (e) { timeoutCode = codeOf(e); }
  ok(timeoutCode === 'extract_timeout' && Date.now() - t0 >= 7000, `rev r5 臂②:8s 到点硬超时→SIGKILL 子进程→extract_timeout(${Date.now() - t0}ms·宿主存活)`);
}
// 臂③(子进程 OOM·SIGABRT/134 信号路径):deep-xml DOM 形(16KB 诚实声明·过守卫)在子进程内撑爆
// 256MB 堆帽→V8 FatalProcessOutOfMemory abort→宿主收 exit(134/SIGABRT)→child_oom(宿主不连坐)。
{
  const deepXml = Buffer.from('<x:a xmlns:x="u">'.repeat(300000) + '</x:a>'.repeat(300000), 'utf8');
  const deepZip = craftDocx([
    realDocxEntries[0], realDocxEntries[1],
    ['word/document.xml', deepXml.toString('latin1')],
  ]);
  const t0 = Date.now();
  let oomCode = '';
  try { await extractResumeText(deepZip, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'deep-xml.docx'); } catch (e) { oomCode = codeOf(e); }
  ok(oomCode === 'child_oom' && Date.now() - t0 < 8000, `rev r5 臂③:deep-xml DOM 炸弹→子进程 V8 堆 OOM abort→child_oom(${Date.now() - t0}ms·宿主不连坐存活)`);
}
// 臂④(畸形帧·IPC 反序列化崩溃守卫):子进程向 IPC fd 写合法帧长+乱载荷→宿主通道反序列化抛
// "Unable to deserialize cloned data"(uncaughtException·child.on('error') 拦不住)→IpcCrashGuard
// 捕获→SIGKILL 活跃子进程+child_crash settle——宿主不退出(修复前实测宿主 EXIT 1)。
{
  const r = await probeCorruptIpcFrame(15000);
  ok(r.code === 'child_crash' && r.hostAlive === true, 'rev r5 臂④:子进程畸形帧→IpcCrashGuard 捕获→child_crash(宿主存活不退出)');
}
// 臂⑤(清洗截断下沉·语义不变):20 页共享内容流 2000 万字件→子进程清洗后 >服务层帽只回传帽+1 字
// (服务层 >帽→413 extracted_too_long 判定恒同;宿主不收 MB 级文本=消息大小上界构造性成立)。
function craftTextbombPdf(): Buffer {
  const lines: string[] = [];
  const s = 'A'.repeat(99) + ' ';
  for (let k = 0; k < 10000; k++) lines.push(`BT /F1 1 Tf 0 ${k % 700} Td (${s}) Tj ET\n`);
  const content = deflateSync(Buffer.from(lines.join(''), 'latin1'), { level: 9 });
  const kids = Array.from({ length: 20 }, (_, i) => `${5 + i} 0 R`).join(' ');
  const objs: string[] = ['', '<< /Type /Catalog /Pages 2 0 R >>', `<< /Type /Pages /Kids [${kids}] /Count 20 >>`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${content.length} /Filter /FlateDecode >>\nstream\n${content.toString('latin1')}\nendstream`];
  for (let i = 0; i < 20; i++) objs.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 3 0 R >> >> >>');
  let out = '%PDF-1.4\n';
  const off: number[] = [0];
  for (let j = 1; j < objs.length; j++) { off[j] = out.length; out += `${j} 0 obj\n${objs[j]}\nendobj\n`; }
  const xref = out.length;
  out += `xref\n0 ${objs.length - 1}\n0000000000 65535 f \n` + off.slice(1).map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  out += `trailer\n<< /Size ${objs.length - 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(out, 'latin1');
}
{
  const t0 = Date.now();
  const tb = await extractResumeText(craftTextbombPdf(), 'application/pdf', 'textbomb20.pdf');
  ok(tb.text.length === 60_001, `rev r5 臂⑤:2000 万字件→子进程清洗截断只回传帽+1 字(${tb.text.length}=60000+1·${Date.now() - t0}ms·服务层 413 判定语义不变)`);
}

console.log(`✓ resume-extract:prove 全部通过(${n} 断言)`);
