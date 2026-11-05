/**
 * resume-extract 子进程(r4 修订·#108 真终止的进程级形态):pdf/docx CPU 重活搬出宿主进程,
 * 独立 OS 进程承载。宿主以 `--max-old-space-size` 堆帽 + EXTRACT_TIMEOUT_MS 到点 SIGKILL 约束,
 * 超限即杀;子进程 OOM abort(EXIT=134/SIGABRT)只死子进程,宿主收到确定错误码(exit 无结果→
 * extract_timeout 级)——修订缘由:worker_threads 的 resourceLimits 只帽 V8 old-gen,worker 内
 * 单次大分配越帽时 V8 FatalProcessOutOfMemory 直接 abort 宿主全进程(复验实测 EXIT=134·10/10),
 * "isolate 只死 worker/宿主存活"前提被证伪,故解析隔离从线程级升级为进程级。
 * docx 读面加固(与守卫层双帽互补):mammoth 按关系别名可把同一部件重复解压最多 6 次
 * (footnotes/endnotes/comments/styles/numbering 全指回 document.xml 实测 6 倍·jszip 不缓存),
 * 本适配器按 (部件名, encoding) 记忆化——每部件至多解压/解码一次,别名并发共享同一结果;
 * 并按 central directory 声明值流式计量,膨胀越声明即中止(jszip 原生只在全量膨胀完才事后核对
 * size mismatch)——谎报声明的 liar zip 在声明值处早停,不再全量膨胀。
 * 错误通道:结构化 process.send{ok:false,code,message}——Error 自定义属性不跨进程边界保证存活,
 * 宿主按 code 重建错误对象(encrypted 码跨进程保真,UC-E2E-015 E1 不静默降级)。
 * loader 链:.ts 经 tsx(--import)/@swc-node/register(--import)由 fork execArgv 继承传播(生产
 * Dockerfile CMD 即后者形),子进程与宿主同版同 loader。
 * 依赖解析纪律:pdf-parse/mammoth 一律经 createRequire 取 **CJS 入口**——pdf-parse 的 ESM 构建
 * (dist/.../esm)与 CJS 构建内存画像差异巨大(8MB 文本充实 PDF 实测 ESM 构建越 320MB 堆帽 abort、
 * CJS 构建峰值 ~171MB·探针亲测),worker 形(静态 import 经 loader CJS interop)承的是 CJS 画像,
 * 帽值 256 的探针证据链只在 CJS 画像下成立——子进程必须同画像,否则帽值下界漂移。
 */
import { createRequire } from 'node:module';

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

function codeFor(e: unknown): string {
  const anyE = e as { code?: string; message?: string };
  if (typeof anyE?.code === 'string' && anyE.code !== '') return anyE.code;   // 显式码保真(zip_uncompressed_overflow 等)
  if (ENCRYPT_HINT.test(String(anyE?.message ?? ''))) return 'encrypted';
  return 'parse_failed';
}

process.on('message', async (m: { kind: 'pdf' | 'docx'; buffer: Buffer }) => {
  try {
    let text = '';
    if (m.kind === 'pdf') {
      const parser = new (getPdfParse().PDFParse)({ data: new Uint8Array(m.buffer) });
      try {
        const r = await parser.getText();
        text = r?.text ?? '';
      } finally {
        await parser.destroy?.().catch(() => {});
      }
    } else {
      text = await extractDocx(Buffer.from(m.buffer));
    }
    // heapUsed 随消息回带:帽值探针(resume-cap-probe)据此与 58-74MB 量基带交叉校验。
    process.send?.({ ok: true, text, heapUsedMb: Math.round((process.memoryUsage().heapUsed / 1048576) * 10) / 10 });
  } catch (e) {
    process.send?.({ ok: false, code: codeFor(e), message: String((e as Error)?.message ?? e) });
  }
});
// 宿主 terminate/崩溃/正常收尸后 IPC 通道关闭 → 子进程自灭,无孤儿窗口。
process.on('disconnect', () => process.exit(0));
