/**
 * 简历多格式提取 + 清洗。真简历是 PDF/Word/图片,不是纯文本——上传前必须提取文本 + 清洗。
 * - PDF:pdf-parse(文本层抽取,worker isolate 内跑)。加密 PDF 显式 encrypted(不静默成功/不喂 OCR)。
 * - Word(.docx):mammoth(extractRawText,worker isolate 内跑)。
 * - 图片:需 OCR(qwen-vl,worker 侧多模态)——此处抛 image_needs_ocr,由上层路由到 vision(seam 留)。
 * - 纯文本:直通。
 * 清洗:统一换行 / 去控制字符 / 压缩空白与空行 / trim——脏数据进结构化前先洗(用户问的"数据清洗")。
 *
 * #109 魔数嗅探:分派点最前置(先于加密扫描与任何解析 spawn),声明格式与字节不符 → magic_mismatch
 * fail-closed——垃圾字节/伪造后缀永不进解析器。
 * #108 解析真终止:pdf/docx 解析搬进 worker isolate(worker_threads),8s 到点/外部 abort 即 terminate——
 * 僵尸解析占事件循环/解析槽的面就此闭合(槽位释放=解析真死)。isolate 级 OOM 隔离
 * (ERR_WORKER_OUT_OF_MEMORY 只死 worker)+heap 卫生;resourceLimits 帽不构成容器内存保证。
 */
import { Worker } from 'node:worker_threads';

/** `unsupported` 绝不是文本兜底：未知二进制若被 `Buffer.toString('utf8')` 处理，会同时造成
 * 解析垃圾、潜在注入载体和错误的“已摄取”成功态。全格式 RAG 要通过专用沙箱 adapter 接入，
 * 不能借简历 endpoint 的 text 分支偷渡。 */
export type ResumeFileFormat = 'pdf' | 'docx' | 'text' | 'image' | 'unsupported';

const UNSUPPORTED_EXT = /\.(?:xlsx|xls|xlsm|xlsb|pptx|ppt|ppsx|odp|csv|tsv|mp4|mov|m4v|avi|mkv|webm|mp3|wav|m4a|ogg|zip|rar|7z|gz|tar|exe|dmg|apk)$/i;
const UNSUPPORTED_MIME = /(?:spreadsheet|excel|presentation|powerpoint|opendocument|video\/|audio\/|application\/(?:zip|x-rar|x-7z|x-msdownload|vnd\.android))/i;
const TEXT_EXT = /\.(?:txt|md|markdown|rtf)$/i;
const ENCRYPT_HINT = /encrypt|password|PasswordException|No password|need.?password/i;

export function detectResumeFormat(mime: string, filename: string): ResumeFileFormat {
  const m = (mime || '').toLowerCase();
  const f = (filename || '').toLowerCase();
  // 文件名/MIME 任一侧声明为高风险/未实现二进制，都拒绝。特别是 `cv.xlsx` 伪称
  // `application/pdf` 的场景，不能优先信 MIME 后把工作簿交给 PDF/text parser。
  if (UNSUPPORTED_EXT.test(f) || UNSUPPORTED_MIME.test(m)) return 'unsupported';
  if (m.includes('pdf') || f.endsWith('.pdf')) return 'pdf';
  if (m.includes('wordprocessingml') || m.includes('msword') || f.endsWith('.docx') || f.endsWith('.doc')) return 'docx';
  if (m.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|tiff?)$/.test(f)) return 'image';
  if (m.startsWith('text/') || TEXT_EXT.test(f)) return 'text';
  return 'unsupported';
}

/** 清洗提取出的原始文本:统一换行、去控制字符、压缩空白/空行、trim。 */
export function cleanResumeText(raw: string): string {
  return (raw || '')
    .replace(/\r\n?/g, '\n')                                              // 统一换行
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')       // 去控制字符(保留 \t=09 \n=0A)
    .replace(/\u00A0/g, ' ')                                              // 不间断空格 → 普通空格
    .replace(/[ \t]+/g, ' ')                                              // 压缩水平空白
    .replace(/[ \t]+\n/g, '\n')                                           // 去行尾空白
    .replace(/\n{3,}/g, '\n\n')                                           // 压缩多余空行
    .trim();
}

/** UC-E2E-015 E1：加密 PDF 快拒（/Encrypt 字典或解析器 password 类错误）。 */
export function looksLikeEncryptedPdf(buffer: Buffer): boolean {
  const head = buffer.subarray(0, Math.min(buffer.length, 512 * 1024)).toString('latin1');
  return /\/Encrypt\b/.test(head);
}

// ── #109 魔数嗅探(声明 vs 字节 fail-closed)────────────────────────────────
const PDF_MAGIC_WINDOW = 1024;
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function hasKnownImageMagic(b: Buffer): boolean {
  if (b.length >= 8 && b.subarray(0, 8).equals(PNG_SIG)) return true;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return true;   // JPEG
  if (b.length >= 6 && (b.subarray(0, 6).toString('latin1') === 'GIF87a' || b.subarray(0, 6).toString('latin1') === 'GIF89a')) return true;
  if (b.length >= 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return true;
  if (b.length >= 2 && b[0] === 0x42 && b[1] === 0x4d) return true;                     // BMP
  if (b.length >= 4 && ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0x00) || (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0x00 && b[3] === 0x2a))) return true; // TIFF II/MM
  return false;
}

function isZipLocalHeader(b: Buffer): boolean {
  return b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07) && (b[3] === 0x04 || b[3] === 0x06 || b[3] === 0x08);
}

/** #109:声明格式 vs 实际字节(magic bytes)核验,不符即 magic_mismatch(fail-closed,先于一切解析)。
 *  text 分支同样拒 zip 三签——防伪称纯文本偷渡压缩体。 */
export function assertMagicMatchesDeclaration(buffer: Buffer, format: ResumeFileFormat): void {
  const mismatch = () => Object.assign(new Error('magic_mismatch'), { code: 'magic_mismatch' });
  switch (format) {
    case 'pdf':
      if (!buffer.subarray(0, Math.min(buffer.length, PDF_MAGIC_WINDOW)).toString('latin1').includes('%PDF-')) throw mismatch();
      break;
    case 'docx':
      if (!(buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04)) throw mismatch();
      break;
    case 'image':
      if (!hasKnownImageMagic(buffer)) throw mismatch();
      break;
    case 'text':
      if (isZipLocalHeader(buffer)) throw mismatch();
      break;
    default:
      break;   // unsupported 在 detect 处已先行拒绝,不至此
  }
}

const EXTRACT_TIMEOUT_MS = Number(process.env.RESUME_EXTRACT_TIMEOUT_MS ?? 8000);   // 提取硬超时(界定解压炸弹/病态文档的 hang;安全审计 F2)。到点抛 extract_timeout,上层降级为可解释错误。
/** #108 worker isolate 堆帽:isolate 级 OOM 隔离(ERR_WORKER_OUT_OF_MEMORY 只死 worker,宿主存活)+heap 卫生。
 *  帽值由 resume-cap-probe 实测探针定值(8MB 文本充实合法 PDF 阶梯:64/96/192 OOM·256 成功·heapUsed 232.6MB;
 *  与双审量基带 58-74MB 交叉校验通过=非低定)——禁用并发乘法公式定帽(old-gen 帽不辖 RSS/ArrayBuffer,已被实测证伪)。 */
const RESUME_WORKER_HEAP_CAP_MB = Number(process.env.RESUME_WORKER_HEAP_CAP_MB ?? 256);
const WORKER_URL = new URL('./resume-extract-worker.ts', import.meta.url);

const timeoutErr = () => Object.assign(new Error('extract_timeout'), { code: 'extract_timeout' });

/** #108 worker 运行形:spawn 即同步挂 error/exit 监听(worker error 无监听=宿主 uncaughtException 裸崩)。
 *  事件→宿主错误映射:结构化 message{code} 按 code 重建原码(encrypted 保真)/OOM 或 exit 无结果→
 *  extract_timeout 级/启动失败(ENOENT)→parse_failed。signal(abort)→terminate+extract_timeout,幂等 settle-once。 */
function runInWorker(kind: 'pdf' | 'docx', buffer: Buffer, signal?: AbortSignal): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let settled = false;
    const w = new Worker(WORKER_URL, {
      resourceLimits: { maxOldGenerationSizeMb: RESUME_WORKER_HEAP_CAP_MB, maxYoungGenerationSizeMb: 32, codeRangeSizeMb: 64 },
    });
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      void w.terminate().catch(() => {});
      fn();
    };
    const timer = setTimeout(() => settle(() => reject(timeoutErr())), EXTRACT_TIMEOUT_MS);
    const onAbort = () => settle(() => reject(timeoutErr()));
    signal?.addEventListener('abort', onAbort, { once: true });
    w.on('message', (m: { ok?: boolean; text?: string; code?: string; message?: string }) => {
      if (m?.ok) {
        settle(() => resolve(String(m.text ?? '')));
        return;
      }
      settle(() => {
        const er = new Error(String(m?.message ?? 'parse_failed'));
        (er as unknown as { code: string }).code = String(m?.code ?? 'parse_failed');
        reject(er);
      });
    });
    w.on('error', (e: NodeJS.ErrnoException) => {
      settle(() => {
        if (e?.code === 'ERR_WORKER_OUT_OF_MEMORY') { reject(timeoutErr()); return; }   // isolate OOM→超时级降级,宿主存活
        if (String(e?.message ?? '').includes('ENOENT') || String(e?.message ?? '').includes('Cannot find module')) {
          const er = Object.assign(new Error('parse_failed'), { code: 'parse_failed' });
          reject(er);
          return;
        }
        reject(timeoutErr());
      });
    });
    w.on('exit', () => settle(() => reject(timeoutErr())));   // exit 无结果(含 OOM 静默退出)→超时级降级
    w.postMessage({ kind, buffer });
  });
}

function mapPdfExtractError(e: unknown): never {
  const msg = String((e as { message?: string })?.message ?? e ?? '');
  if (ENCRYPT_HINT.test(msg)) {
    throw Object.assign(new Error('encrypted'), { code: 'encrypted' });
  }
  throw e;
}

/** 从文件字节提取并清洗简历文本。返回 {text, format}。图片 → 抛 image_needs_ocr。
 *  options.signal(#108 AbortSignal seam·预留):abort → terminate+extract_timeout(与超时双终止幂等 settle-once)。
 *  当前零调用方(纯 seam),后续 OCR/批量管线可接。 */
export async function extractResumeText(buffer: Buffer, mime: string, filename: string, options?: { signal?: AbortSignal }): Promise<{ text: string; format: ResumeFileFormat }> {
  const format = detectResumeFormat(mime, filename);
  if (format === 'unsupported') throw Object.assign(new Error('unsupported_file_format'), { code: 'unsupported_file_format' });
  assertMagicMatchesDeclaration(buffer, format);   // #109:嗅探恒最前置——先于加密扫描与任何解析 spawn
  if (format === 'pdf') {
    if (looksLikeEncryptedPdf(buffer)) {
      throw Object.assign(new Error('encrypted'), { code: 'encrypted' });
    }
    let text: string;
    try {
      text = await runInWorker('pdf', buffer, options?.signal);   // #108:worker isolate 内真解析,到点 terminate 真死
    } catch (e) {
      mapPdfExtractError(e);
    }
    return { text: cleanResumeText(text), format };
  }
  if (format === 'docx') {
    const raw = await runInWorker('docx', buffer, options?.signal);
    return { text: cleanResumeText(raw), format };
  }
  if (format === 'image') {
    throw Object.assign(new Error('image_needs_ocr'), { code: 'image_needs_ocr' });   // 上层路由到 qwen-vl OCR
  }
  return { text: cleanResumeText(buffer.toString('utf8')), format: 'text' };
}

/** 测试缝(帽值探针专用·沿 __resetAiCostExhaustedCacheForTest 官方缝先例):以指定 heap 帽+超时跑一次
 *  worker 解析,回传 {ok,text,code,heapUsedMb,ms}——resume-cap-probe 据此定帽并与 58-74MB 量基带交叉校验。
 *  生产路径零引用。 */
export async function probeExtractWithCap(buffer: Buffer, format: 'pdf' | 'docx', capMb: number, timeoutMs: number): Promise<{ ok: boolean; text?: string; code?: string; heapUsedMb?: number; ms: number }> {
  const t0 = Date.now();
  return new Promise((resolve) => {
    let settled = false;
    const w = new Worker(WORKER_URL, { resourceLimits: { maxOldGenerationSizeMb: capMb, maxYoungGenerationSizeMb: 32, codeRangeSizeMb: 64 } });
    const done = (r: { ok: boolean; text?: string; code?: string; heapUsedMb?: number }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void w.terminate().catch(() => {});
      resolve({ ...r, ms: Date.now() - t0 });
    };
    const timer = setTimeout(() => done({ ok: false, code: 'extract_timeout' }), timeoutMs);
    w.on('message', (m: { ok?: boolean; text?: string; code?: string; message?: string; heapUsedMb?: number }) => {
      if (m?.ok) done({ ok: true, text: m.text, heapUsedMb: m.heapUsedMb });
      else done({ ok: false, code: String(m?.code ?? 'parse_failed') });
    });
    w.on('error', (e: NodeJS.ErrnoException) => done({ ok: false, code: e?.code === 'ERR_WORKER_OUT_OF_MEMORY' ? 'oom' : 'worker_error' }));
    w.on('exit', () => done({ ok: false, code: 'exit_no_result' }));
    w.postMessage({ kind: format, buffer });
  });
}
