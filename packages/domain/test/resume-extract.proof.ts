/**
 * resume-extract:prove — 简历多格式提取 + 清洗。
 * 测:格式探测(pdf/docx/image/text)· 清洗(控制字符/空白/空行/不间断空格)· 文本直通 · 图片抛 OCR。
 */
import { detectResumeFormat, cleanResumeText, extractResumeText, looksLikeEncryptedPdf } from '../src/resume-extract.ts';

let n = 0;
const ok = (c: boolean, m: string) => { if (!c) { console.error('✗', m); process.exit(1); } n++; };

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
/** 最小 zip(STORED)：local header + central directory + EOCD——足够 jszip/mammoth 读取。 */
function craftDocx(entries: Array<[name: string, content: string]>): Buffer {
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
    ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(data.length, 24);
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
const realDocx = craftDocx([
  ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
  ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
  ['word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>张三 · 后端工程师</w:t></w:r></w:p><w:p><w:r><w:t>五年 Node/Go 分布式经验</w:t></w:r></w:p></w:body></w:document>'],
]);
const rDocx = await extractResumeText(realDocx, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'resume-real.docx');
ok(rDocx.format === 'docx', 'A1: 真实 docx → format=docx');
ok(rDocx.text === '张三 · 后端工程师\n\n五年 Node/Go 分布式经验', 'A1: 真实 docx 端到端提取输出断言(mammoth+xmldom0.8.15)');

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

console.log(`✓ resume-extract:prove 全部通过(${n} 断言)`);
