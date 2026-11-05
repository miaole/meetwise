#!/usr/bin/env node
/**
 * 简历解析压力样本生成器(r5·零二进制入库:样本按需生成到目标目录,不提交产物)。
 * 生成 /tmp/s3final-probe 与 /tmp/s3r42 两路审查所用的同形触发样本(docx/pdf·纯 Node zlib 手构,
 * 零依赖),供 proof/探针/512m 容器实测复现。命令:
 *
 *   node scripts/resume-crash-samples/gen.mjs <输出目录> [样本名...]
 *   # 不带样本名=生成全部;样本清单与形状见 SAMPLES。
 *
 * 512m 生产容器跑法(docker·生产参数同 compose.prod.yml api 块):
 *   docker build -t meetwise-resume-512m .   # 仓库 Dockerfile 原样
 *   docker run --rm --memory=512m --read-only --tmpfs /tmp:rw,noexec,nosuid,size=64m \
 *     --cap-drop ALL --security-opt no-new-privileges:true \
 *     -v <样本目录>:/fz:ro -w /app/apps/api meetwise-resume-512m \
 *     node --import @swc-node/register/esm-register -e '...extractResumeText...'
 * 详卷 ai-docs/delivery/harness/s3-upload-caps-REQUEST.md §9 rev r5 注记。
 */
import { deflateRawSync, deflateSync, crc32 } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const M = 1024 * 1024;

// ── zip 手构(与 packages/domain/test/resume-extract.proof.ts craftDocx 同形·STORED/DEFLATE 双方法)──
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
  return t;
})();
function crc32Slow(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = (CRC_TABLE[(c ^ b) & 0xff] ?? 0) ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
const crcOf = (buf) => (typeof crc32 === 'function' ? (crc32(buf, 0) >>> 0) : crc32Slow(buf));

function zipBuild(parts, opts = {}) {
  // parts: [{ name, data(Buffer), method(0=STORED|8=DEFLATE), declared?(usize 谎报值·liar/超帽形) }]
  const chunks = [];
  const centrals = [];
  let offset = 0;
  for (const p of parts) {
    const nameB = Buffer.from(p.name, 'utf8');
    const cdata = p.method === 8 ? deflateRawSync(p.data, { level: 9 }) : p.data;
    const declared = p.declared ?? p.data.length;
    const crc = crcOf(p.data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6); lh.writeUInt16LE(p.method, 8);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(cdata.length, 18); lh.writeUInt32LE(declared, 22);
    lh.writeUInt16LE(nameB.length, 26); lh.writeUInt16LE(0, 28);
    chunks.push(lh, nameB, cdata);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(p.method, 10);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(cdata.length, 20); ch.writeUInt32LE(declared, 24);
    ch.writeUInt16LE(nameB.length, 28); ch.writeUInt32LE(offset, 42);
    centrals.push(ch, nameB);
    offset += 30 + nameB.length + cdata.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(parts.length, 8); eocd.writeUInt16LE(parts.length, 10);
  eocd.writeUInt32LE(cd.length, 12); eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, cd, eocd]);
}

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const docXml = (body) => `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="${W}"><w:body>${body}</w:body></w:document>`;
const para = (text) => `<w:p><w:r><w:t>${text}</w:t></w:r></w:p>`;
const CT = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
const ROOT_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
const docRels = (targets) => '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
  + targets.map(([t, tgt], i) => `<Relationship Id="r${t}${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${t}" Target="${tgt}"/>`).join('') + '</Relationships>';
const docx = (parts) => zipBuild(parts, { method: 8 });

// ── PDF 手构(合法 xref·禁 recovery·与 resume-cap-probe craftTextHeavyPdf 同族)──
// 全程 Buffer.concat 拼 Buffer——二进制流(FLATE)不得进模板串(Buffer 模板串化=按 utf8 损坏)。
function pdfBuild(objs) {
  const out = [Buffer.from('%PDF-1.4\n', 'latin1')];
  const off = [0];
  let len = out[0].length;
  for (let i = 1; i <= objs.length; i++) {
    off[i] = len;
    const body = Buffer.isBuffer(objs[i - 1]) ? objs[i - 1] : Buffer.from(objs[i - 1], 'latin1');
    const chunk = Buffer.concat([Buffer.from(`${i} 0 obj\n`, 'latin1'), body, Buffer.from('\nendobj\n', 'latin1')]);
    out.push(chunk);
    len += chunk.length;
  }
  const xref = len;
  const xrefHead = Buffer.from(`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`, 'latin1');
  const entries = off.slice(1).map((o) => Buffer.from(`${String(o).padStart(10, '0')} 00000 n \n`, 'latin1'));
  const trailer = Buffer.from(`trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`, 'latin1');
  return Buffer.concat([...out, xrefHead, ...entries, trailer]);
}
const pdfFont = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
/** 单内容流 + nPages 页(全部指向同一 /Contents 4 0 R·含 /Resources 字体)。contentObj 可为串(纯文本流)或 Buffer(FLATE 二进制流)。 */
function pdfDoc(contentObj, nPages = 1) {
  const streamBody = Buffer.isBuffer(contentObj) ? contentObj : pdfStream(Buffer.from(contentObj, 'latin1'));
  const kids = Array.from({ length: nPages }, (_, i) => `${5 + i} 0 R`).join(' ');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${kids}] /Count ${nPages} >>`,
    pdfFont,
    streamBody,
    ...Array.from({ length: nPages }, () => '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 3 0 R >> >> >>'),
  ];
  return pdfBuild(objs);
}
const pdfOnePage = (content) => pdfDoc(content);   // content=完整内容流串('BT ... ET');文本转义由调用方负责
const pdfStream = (data, flate = false) => {
  const dict = flate ? '/Filter /FlateDecode ' : '';
  return Buffer.concat([
    Buffer.from(`<< /Length ${data.length} ${dict}>>\nstream\n`, 'latin1'),
    data,
    Buffer.from('\nendstream', 'latin1'),
  ]);
};

// ── 样本清单(name → [字节, 形状说明])──
// 正常简历(1–2MB)两件:并发/成功率/延迟实测用(r5 卷 §9 N=1/N=2 实测载重)。
// docx 正常件=提取后约 1MB 文本(压缩后文件小系 XML/文本高压缩比·真实 docx 文件大头是 media,
// 与解析载重无关);pdf 正常件=约 1.5MB 文件。二者均远低于帽(守卫 10MB/64MB·服务层 8MB)。
const normalText = (() => {
  const parts = [];
  let n = 0;
  let len = 0;
  while (len < 1 * M) { const s = `张三 · 后端工程师 · 项目 ${n}:高并发简历解析与限流、分布式锁、幂等设计经验(第 ${n} 段)`; parts.push(s); len += s.length; n++; }
  return parts.join('\n');
})();
const normalPdfLines = () => {
  let s = ''; let i = 0;
  while (s.length < 1.5 * M) s += `BT /F1 12 Tf 72 ${742 - (i % 700)} Td (work experience item ${i}: backend distributed systems rate limiting and idempotency) Tj ET\n`, i++;
  return s;
};
const SAMPLES = {
  // 正常件(pdf/docx 各 1–2MB·合法·并发实测载重)
  'normal-1mb.docx': () => docx([
    { name: '[Content_Types].xml', data: Buffer.from(CT), method: 8 },
    { name: '_rels/.rels', data: Buffer.from(ROOT_RELS), method: 8 },
    { name: 'word/document.xml', data: Buffer.from(docXml(para(normalText)), 'utf8'), method: 8 },
  ]),
  'normal-1mb.pdf': () => pdfOnePage(normalPdfLines()),
  // 大诚实件(docx 9.9MB 声明·五关系别名同指 document.xml——r4 审查崩溃形同构·记忆化适配器收敛)
  'alias5-9.9mb.docx': () => {
    const body = para('\u4e2d' + 'A'.repeat(9.9 * M - 200));
    return docx([
      { name: '[Content_Types].xml', data: Buffer.from(CT), method: 8 },
      { name: '_rels/.rels', data: Buffer.from(ROOT_RELS), method: 8 },
      { name: 'word/document.xml', data: Buffer.from(docXml(body), 'utf8'), method: 8 },
      { name: 'word/_rels/document.xml.rels', data: Buffer.from(docRels([['footnotes', 'document.xml'], ['endnotes', 'document.xml'], ['comments', 'document.xml'], ['styles', 'document.xml'], ['numbering', 'document.xml']])), method: 8 },
    ]);
  },
  // DOM 形炸弹(16KB 文件·深嵌套 XML——子进程 V8 堆 OOM abort→child_oom 的确定性触发形)
  'deep-xml.docx': () => docx([
    { name: '[Content_Types].xml', data: Buffer.from(CT), method: 8 },
    { name: '_rels/.rels', data: Buffer.from(ROOT_RELS), method: 8 },
    { name: 'word/document.xml', data: Buffer.from('<x:a xmlns:x="u">'.repeat(300000) + '</x:a>'.repeat(300000), 'utf8'), method: 8 },
  ]),
  // liar(声明 100B·实际膨胀 32MB——子进程流式声明值计量早停→zip_uncompressed_overflow)
  'liar-32mb.docx': () => {
    const real = Buffer.alloc(32 * M, 0x41);
    return zipBuild([
      { name: '[Content_Types].xml', data: Buffer.from(CT), method: 8 },
      { name: '_rels/.rels', data: Buffer.from(ROOT_RELS), method: 8 },
      { name: 'word/document.xml', data: real, method: 8, declared: 100 },
    ]);
  },
  // 8MB 文本充实 PDF(cap-probe 同形·512m 下重件代表)
  'textheavy-8mb.pdf': () => {
    let content = ''; let i = 0;
    while (content.length < 8 * M - 4096) content += `BT /F1 12 Tf 72 742 Td (work experience item ${i}: backend distributed systems rate limiting and idempotency) Tj ET\n`, i++;
    return pdfOnePage(content);
  },
  // flate 炸弹(约 1.5MB 文件·解压 1.5GB 空白——全量膨胀 hang→extract_timeout 的重件)
  'flatebomb.pdf': () => {
    const blob = Buffer.alloc(1536 * M, 0x20);
    return pdfDoc(pdfStream(deflateSync(blob, { level: 9 }), true));
  },
  // 文本炸弹(30KB 文件·20 页共享单内容流·约 2000 万字提取——清洗截断下沉的形状:子进程只回传帽+1 字)
  'textbomb20.pdf': () => {
    const body = [];
    const s = 'A'.repeat(99) + ' ';
    for (let k = 0; k < 10000; k++) body.push(`BT /F1 1 Tf 0 ${k % 700} Td (${s}) Tj ET\n`);
    return pdfDoc(pdfStream(deflateSync(Buffer.from(body.join(''), 'latin1'), { level: 9 }), true), 20);
  },
  // 最小合法 PDF(健康对照)
  'pdf-min.pdf': () => pdfOnePage('BT /F1 12 Tf 72 712 Td (Three Years Backend Engineer Order Systems) Tj ET'),
};

const outDir = resolve(process.argv[2] ?? 'tmp-resume-crash-samples');
const only = process.argv.slice(3);
mkdirSync(outDir, { recursive: true });
for (const [name, gen] of Object.entries(SAMPLES)) {
  if (only.length > 0 && !only.includes(name)) continue;
  const t0 = Date.now();
  const buf = gen();
  const p = join(outDir, name);
  writeFileSync(p, buf);
  console.log(`${name}\t${buf.length}B\tsha256=${createHash('sha256').update(buf).digest('hex').slice(0, 16)}\t${Date.now() - t0}ms`);
}
console.log(`[gen] 输出目录 ${outDir}(${Object.keys(only.length > 0 ? only : SAMPLES).length} 件·零二进制入库,产物不入 git)`);
