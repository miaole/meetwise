/**
 * resume-extract 子进程(r5 修订·#108 真终止的进程级形态):pdf/docx CPU 重活搬出宿主进程,
 * 独立 OS 进程承载。宿主以 `--max-old-space-size` 堆帽 + EXTRACT_TIMEOUT_MS 到点 SIGKILL 约束,
 * 超限即杀;子进程 OOM abort(EXIT=134/SIGABRT)只死子进程,宿主收到确定错误码(exit 无结果→
 * child_oom)——修订缘由:worker_threads 的 resourceLimits 只帽 V8 old-gen,worker 内
 * 单次大分配越帽时 V8 FatalProcessOutOfMemory 直接 abort 宿主全进程(复验实测 EXIT=134·10/10),
 * "isolate 只死 worker/宿主存活"前提被证伪,故解析隔离从线程级升级为进程级。
 *
 * r5 增补(post-prove 双席 FAIL 处置·登记源=审查 s3-r4-1/s3-r4-2):
 * - OOM 自保兜底:入口自写 /proc/self/oom_score_adj=1000(非 Linux 静默跳过)——与宿主侧
 *   fork 后同步写入(resume-extract.ts setChildOomScoreAdj)双保险,cgroup OOM killer 不再选宿主;
 * - 清洗与截断下沉:cleanResumeText 在本进程跑(import 单源),清洗后 >textCap(宿主消息携带,
 *   =服务层 MAX_RESUME_TEXT 60000 对齐锚)只回传 textCap+1 字——服务层 >帽→413 判定语义不变,
 *   宿主不收 MB 级文本;pdf 按页提取累计清洗越帽+停止余量即早停(逐页 join 与整篇 getText
 *   逐字节恒等·87 样本 parity 机证);docx 无页粒度,早停由流式声明计量(liar 类)承担;
 * - 机密隔离落地面:宿主 fork 显式传最小 env(NODE_ENV 单变量)+--permission 文件读白名单
 *   (只应用根树)——本进程读 /proc/<父pid>/environ 被拒(ERR_ACCESS_DENIED);
 * - IPC 纪律:结构化消息仅经 process.send;corrupt_ipc 臂(官方测试缝)向 fd 3 直写 8 字节
 *   原始帧,供宿主侧反序列化崩溃守卫(IpcCrashGuard)证明畸形帧不杀宿主;生产消息面零原始写。
 *
 * docx 读面加固(r4·与守卫层双帽互补):mammoth 按关系别名可把同一部件重复解压最多 6 次
 * (footnotes/endnotes/comments/styles/numbering 全指回 document.xml 实测 6 倍·jszip 不缓存),
 * 本适配器按 (部件名, encoding) 记忆化——每部件至多解压/解码一次,别名并发读共享同一结果;
 * 并按 central directory 声明值流式计量,膨胀越声明即中止(jszip 原生只在全量膨胀完才事后核对
 * size mismatch)——谎报声明的 liar zip 在声明值处早停,不再全量膨胀。
 * 错误通道:结构化 process.send{ok:false,code,message}——Error 自定义属性不跨进程边界保证存活,
 * 宿主按 code 重建错误对象(encrypted 码跨进程保真,UC-E2E-015 E1 不静默降级)。
 * loader 链:.ts 经 tsx(--import)/@swc-node/register(--import)由 fork execArgv 继承传播(生产
 * Dockerfile CMD 即后者形),子进程与宿主同版同 loader。
 * 依赖画像纪律(r5 勘正 CJS 叙述,撤 r4「worker 形承 CJS 画像」说法):pdf-parse@2.4.5 在 swc
 * loader 下 ESM 条件解析落 **ESM 构建**(dist/pdf-parse/esm/index.js→pdfjs-dist/legacy/build/pdf.mjs),
 * 经 createRequire 取 require 条件才落 **CJS 构建**(dist/pdf-parse/cjs/index.cjs)——两构建内存
 * 画像差异巨大(8MB 文本充实 PDF:ESM 构建越 320MB 堆帽 abort、CJS 构建峰值 ~171MB·证伪路
 * resolve 钩子+探针实测)。本文件经 createRequire 取 CJS 入口=子进程恒 CJS 画像,帽值 256 的
 * 探针证据链(resume-cap-probe)在该画像下成立;基线 worker 形系 ESM 画像(r4 注记勘正)。
 */
import { createRequire } from 'node:module';
import { writeFileSync, writeSync } from 'node:fs';
import { cleanResumeText } from './resume-extract.ts';

// Linux 自保兜底:入口即自写 oom_score_adj=1000(宿主侧 fork 后已同步写一次,此为防写窗异常的
// 第二次写)。非 Linux(/proc 不存在)静默跳过。cgroup OOM killer 按 oom_score 选靶:本进程=靶,
// 宿主(api 进程)不再被选中(证伪路 512m 实测 30/30 宿主存活)。
try { writeFileSync('/proc/self/oom_score_adj', '1000'); } catch { /* 非 Linux:静默跳过 */ }

const ENCRYPT_HINT = /encrypt|password|PasswordException|No password|need.?password/i;

const nodeRequire = createRequire(import.meta.url);
// jszip 从 mammoth 的依赖闭包解析(mammoth 的直接依赖·零新依赖:与 mammoth 同一实例/版本),
// 支撑记忆化流式适配器;mammoth 自带 openArrayBuffer 的 read 每次都走 jszip 全新解压管线。
// 解析器按 kind 惰性加载(pdf 子进程不载 mammoth/jszip 模块图,docx 子进程不载 pdfjs——
// 帽值下界探针(resume-cap-probe)的 pdf 阶梯在子进程形下仍可复现 worker 形的量基带)。
type PdfParseModule = typeof import('pdf-parse');
type MammothModule = { default: typeof import('mammoth'); extractRawText: typeof import('mammoth').extractRawText };
let pdfParseMod: PdfParseModule | null = null;
let mammothMod: MammothModule | null = null;
let jszipCache: { loadAsync(data: Buffer): Promise<ZipHandle> } | null = null;
function getPdfParse(): PdfParseModule {
  if (!pdfParseMod) pdfParseMod = nodeRequire('pdf-parse') as PdfParseModule;
  return pdfParseMod;
}
function getMammoth(): MammothModule {
  if (!mammothMod) mammothMod = nodeRequire('mammoth') as unknown as MammothModule;
  return mammothMod;
}
function getJszip(): { loadAsync(data: Buffer): Promise<ZipHandle> } {
  if (!jszipCache) {
    const mammothEntry = nodeRequire.resolve('mammoth');
    jszipCache = createRequire(mammothEntry)('jszip') as { loadAsync(data: Buffer): Promise<ZipHandle> };
  }
  return jszipCache;
}

type ZipStreamHelper = {
  on(event: 'data', cb: (chunk: Uint8Array) => void): ZipStreamHelper;
  on(event: 'error', cb: (err: Error) => void): ZipStreamHelper;
  on(event: 'end', cb: () => void): ZipStreamHelper;
  resume(): void;
  pause(): void;
};
type ZipEntry = {
  internalStream(type: string): ZipStreamHelper;
  /** loadAsync 后恒为 CompressedObject:uncompressedSize=central directory 声明值。 */
  _data: { uncompressedSize?: number };
};
type ZipHandle = {
  file(name: string): ZipEntry | null;
  file(name: string, data: unknown): void;
  generateAsync(options: { type: 'arraybuffer' }): Promise<ArrayBuffer>;
};

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  let len = 0;
  for (const c of chunks) len += c.length;
  const out = new Uint8Array(len);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

/** 单部件流式读:累计膨胀字节 > 该条目 central directory 声明值即暂停流并拒(zip_uncompressed_overflow)
 *  ——liar(声明小实际大)在声明值处早停,不再全量膨胀后才被 jszip 事后核对拒。 */
async function readPartOnce(zip: ZipHandle, name: string, encoding?: string): Promise<string | Uint8Array> {
  const entry = zip.file(name);
  if (!entry) throw new Error(`part not found: ${name}`);
  const declared = entry._data?.uncompressedSize;
  if (typeof declared !== 'number' || !Number.isFinite(declared)) {
    throw Object.assign(new Error(`zip_entry_declared_unknown:${name}`), { code: 'parse_failed' });
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  await new Promise<void>((resolve, reject) => {
    const helper = entry.internalStream('uint8array');
    const fail = (e: Error) => { helper.pause(); reject(e); };
    helper.on('data', (chunk) => {
      total += chunk.length;
      if (total > declared) {
        chunks.length = 0;
        fail(Object.assign(new Error(`zip_inflate_over_declared:${name}:${declared}`), { code: 'zip_uncompressed_overflow' }));
        return;
      }
      chunks.push(chunk);
    });
    helper.on('error', fail);
    helper.on('end', () => resolve());
    helper.resume();
  });
  const bytes = concatBytes(chunks);
  if (encoding === 'base64') return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');
  if (encoding) return new TextDecoder(encoding).decode(bytes);
  return bytes;
}

/** docx 适配器:mammoth `extractRawText({ file })` 面(unzip.js openZip 对 options.file 原样放行),
 *  read 按 (部件, encoding) 记忆化——mammoth 关系别名(五部件同指 document.xml)并发读共享同一
 *  解压/解码结果,实读 ≤ 声明合计。 */
async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = getMammoth();
  const mammothApi = mammoth.extractRawText ?? mammoth.default.extractRawText;
  const jszip = getJszip();
  const zip = await jszip.loadAsync(buffer);
  const cache = new Map<string, Promise<string | Uint8Array>>();
  const docxFile = {
    exists: (name: string) => zip.file(name) !== null,
    read: (name: string, encoding?: string): Promise<string | Uint8Array> => {
      const key = `${name}\u0000${encoding ?? ''}`;
      let p = cache.get(key);
      if (!p) { p = readPartOnce(zip, name, encoding); cache.set(key, p); }
      return p;
    },
    write: (name: string, contents: unknown) => { zip.file(name, contents); },
    toArrayBuffer: () => zip.generateAsync({ type: 'arraybuffer' }),
  };
  const r = await mammothApi({ file: docxFile } as unknown as Parameters<typeof mammothApi>[0]);
  return r?.value ?? '';
}

/** r5 PDF 按页提取+达帽早停:getInfo().total 定页数 → 逐页 getText({partial:[p]}) 累计——
 *  清洗累计 > textCap+停止余量即停(清洗只收缩 ⇒ 全文清洗必 >帽=判定必拒,提前停止安全;
 *  停止余量 16 字覆盖分页边界 \n 压缩合并效应)。未达帽=全页提取,逐页 join 与整篇 getText
 *  输出逐字节恒等(87 样本 parity 机证);页数不可知(total 非正数)或 pdf-parse 旧版无 getInfo
 *  → 整篇 getText 兜底(r4 形)。提前停止=合法大文件峰值从"全文 DOM+全文串"降到"已提取页"。
 *  (textCap=MAX_SAFE(帽值探针)时早停条件恒不触发=全文画像保真。) */
async function extractPdf(buffer: Buffer, textCap: number): Promise<string> {
  const parser = new (getPdfParse().PDFParse)({ data: new Uint8Array(buffer) });
  try {
    let total = 0;
    let infoOk = false;
    try {
      const info = await parser.getInfo();
      total = Number(info?.total ?? 0);
      infoOk = Number.isFinite(total) && total >= 1;
    } catch { infoOk = false; }
    if (!infoOk) {
      const r = await parser.getText();
      return r?.text ?? '';
    }
    const parts: string[] = [];
    let rawAcc = 0;
    for (let p = 1; p <= total; p++) {
      const r = await parser.getText({ partial: [p] });
      const pageText = typeof r?.text === 'string' ? r.text : (r?.pages?.find((x) => x.num === p)?.text ?? '');
      parts.push(pageText);
      rawAcc += pageText.length;
      if (rawAcc > textCap && cleanResumeText(parts.join('')).length > textCap + 16) break;   // 达帽早停(清洗只收缩⇒判定必拒·16 字=分页边界压缩合并安全余量)
    }
    return parts.join('');
  } finally {
    await parser.destroy?.().catch(() => {});
  }
}

function codeFor(e: unknown): string {
  const anyE = e as { code?: string; message?: string };
  if (typeof anyE?.code === 'string' && anyE.code !== '') return anyE.code;   // 显式码保真(zip_uncompressed_overflow 等)
  if (ENCRYPT_HINT.test(String(anyE?.message ?? ''))) return 'encrypted';
  return 'parse_failed';
}

/** r5 清洗+截断下沉:清洗后 >textCap 只回传 textCap+1 字(宿主复核长度≤textCap+1;服务层
 *  >textCap→413 extracted_too_long 判定语义与全文回传形恒同)。 */
function clampToCap(cleaned: string, textCap: number): string {
  return cleaned.length > textCap ? cleaned.slice(0, textCap + 1) : cleaned;
}

process.on('message', async (m: { kind: 'pdf' | 'docx' | 'corrupt_ipc'; buffer: Buffer; textCap: number }) => {
  // 测试缝(官方缝先例·生产消息面零触):向 IPC fd 3 直写 8 字节原始畸形帧——宿主通道反序列化
  // 抛 "Unable to deserialize cloned data" uncaughtException,IpcCrashGuard 捕获后按 child_crash
  // 收场(宿主不退出)。proof 断言「畸形帧→宿主存活+child_crash」全链走生产 fork 选项。
  if (m?.kind === 'corrupt_ipc') {
  // IPC 帧=4 字节大端长度前缀+载荷(Node 内部帧形·实测):载荷乱字节才构成「完整帧但反序列化失败」,
  // 裸写乱字节只会被当作巨长度前缀静默等待(实测不触发)。宿主侧由此收 uncaughtException
  // "Unable to deserialize cloned data"→IpcCrashGuard 按 child_crash 收场(宿主不退出)。
    try {
      const frame = Buffer.alloc(4 + 8);
      frame.writeUInt32BE(8, 0);
      Buffer.alloc(8, 0xa5).copy(frame, 4);
      writeSync(3, frame);
    } catch { /* fd 3 不可写:静默(宿主侧 probe 超时收场) */ }
    return;   // 不 exit:留活体供宿主 SIGKILL 收尸
  }
  const textCap = Number(m?.textCap ?? Number.MAX_SAFE_INTEGER);
  try {
    let text = '';
    if (m.kind === 'pdf') {
      text = await extractPdf(Buffer.from(m.buffer), textCap);
    } else {
      text = await extractDocx(Buffer.from(m.buffer));
    }
    const cleaned = clampToCap(cleanResumeText(text), textCap);
    // heapUsed 随消息回带:帽值探针(resume-cap-probe)据此与 58-74MB 量基带交叉校验。
    process.send?.({ ok: true, text: cleaned, heapUsedMb: Math.round((process.memoryUsage().heapUsed / 1048576) * 10) / 10 });
  } catch (e) {
    process.send?.({ ok: false, code: codeFor(e), message: String((e as Error)?.message ?? e) });
  }
});
// 宿主 terminate/崩溃/正常收尸后 IPC 通道关闭 → 子进程自灭,无孤儿窗口。
process.on('disconnect', () => process.exit(0));
