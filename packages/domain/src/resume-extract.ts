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
 * #107 解压守卫:docx 解包前置——zip central directory 手读(零新依赖)核条目数/单条目声明/解压总量
 * 多帽,越帽或结构不可核一律 fail-closed(zip_entry_overflow/zip_uncompressed_overflow/zip_directory_invalid)
 * ——炸弹字节零进程 spawn 零解包,进不了 mammoth→jszip 解压面。
 * #108 解析真终止:pdf/docx 解析搬进独立解析 isolate;8s 到点/外部 abort 即 terminate——
 * 僵尸解析占事件循环/解析槽的面就此闭合(槽位释放=解析真死)。
 * r4 修订(post-prove FAIL 处置):worker_threads 的 resourceLimits 只帽 V8 old-gen 堆,worker 内
 * 单次大分配越帽时 V8 FatalProcessOutOfMemory 直接 abort 宿主全进程(实测 EXIT=134·10/10·复验报告),
 * "isolate 只死 worker/宿主存活"前提被证伪——解析隔离自线程级升级为**独立 OS 子进程**
 * (child_process.fork:--max-old-space-size 堆帽+到点 SIGKILL,超限即杀,子进程 abort 只死子进程,
 * 宿主收到确定错误码);域层并发闸(RESUME_PARSE_CONCURRENCY·默认 2)钉住子进程内存叠加;守卫增
 * 单条目声明帽(mammoth 关系别名读放大 ≤6×+双字节解码 ×2=12×·见守卫节);子进程内 docx 适配器
 * 记忆化+按声明值流式计量(见 resume-extract-child.ts)。resourceLimits 帽不构成容器内存保证
 * (#108 既有申明维持)。
 */
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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
      if (buffer.subarray(0, Math.min(buffer.length, PDF_MAGIC_WINDOW)).toString('latin1').includes('%PDF-')) throw mismatch();
      if (buffer.length >= 4 && buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0) throw mismatch();   // OLE2(.doc 族)
      if (hasKnownImageMagic(buffer)) throw mismatch();
      break;
    default:
      break;   // unsupported 在 detect 处已先行拒绝,不至此
  }
}

// ── #107 解压守卫(docx 解包前置·central directory 手读·零新依赖)────────────────────
// 处方锚(外部评审 #107):docx 此前魔数门后直达 mammoth→jszip 解包面,无条目数/解压总量上限——
// 海量条目或超大解压声明的 zip 炸弹可借合法 PK 头过魔数门后在解压面炸内存。帽值(评审处方预登记):
// 条目数 ≤1000(正常 docx <100 条目含 media 余量·10× 余量)·解压总量 ≤64MB(各条目 central
// directory uncompressedSize 声明合计;12MB 传输信封 bodyLimit × 压缩比合理域)。按声明合计而非
// 真解压累计=守卫在解包前零解压成本定夺;zip64 哨兵 0xFFFFFFFF 声明天然越帽同拒(fail-closed)。
// EOCD 六字段 zip64 哨兵任一命中同拒(0xFFFF/0xFFFFFFFF)——否则 jszip 走 zip64 EOCD 覆写路径,
// 攻击者记录覆写条目数/目录偏移后另读一张目录,守卫声明面失守(主流 Office 产物不含 zip64——强制
// zip64 产物如 Info-ZIP zip -fz 会被拒,系已知误伤面·fail-closed 取舍,r4 勘正)。
const DOCX_ZIP_MAX_ENTRIES = 1000;
const DOCX_ZIP_MAX_UNCOMPRESSED_TOTAL = 64 * 1024 * 1024;
// r4 增单条目声明帽:mammoth 按关系别名可把同一部件重复解压最多 6 次(footnotes/endnotes/comments/
// styles/numbering 全指回 document.xml 实测 6 倍·jszip 不缓存),再乘 TextDecoder 双字节解码 ×2
// =12 倍读放大——单条目声明 ≤10MB 时实读峰值 ≤120MB,远低于子进程堆帽 256MB;≤8MB 传输信封下
// 诚实部件(media 已压缩)恒 <8MB,10MB 帽对真实 docx 零误伤(实测 17 真实件全 ACCEPT)。越帽同归
// zip_uncompressed_overflow。
const DOCX_ZIP_MAX_ENTRY_UNCOMPRESSED = 10 * 1024 * 1024;
const ZIP_EOCD_SIG = 0x06054b50;   // PK\x05\x06
const ZIP_CDH_SIG = 0x02014b50;    // PK\x01\x02
// zip64 哨兵判定(jszip zipEntries.js:190 判定全集):EOCD 六字段(diskNumber/diskWithCentralDirStart/
// centralDirRecordsOnThisDisk/centralDirRecords 各 16 位,centralDirSize/centralDirOffset 各 32 位)任一
// 等于哨兵,jszip 弃 EOCD 声明面改走 zip64 EOCD 覆写路径——以攻击者 zip64 记录覆写条目数/目录大小/
// 目录偏移后另读一张目录,守卫所审目录与 jszip 实读目录就此分叉。哨兵取值:16 位 0xFFFF(=jszip
// MAX_VALUE_16BITS),32 位 0xFFFFFFFF 字形(=jszip MAX_VALUE_32BITS,其 readInt(4) 32 位符号回绕读作
// -1,与无符号 0xFFFFFFFF 字节形恒等)。主流 Office 产物不含 zip64(zip64 为 >4GB/>65535 条目而生)——
// 命中即拒系 fail-closed 取舍,强制 zip64 产物(Info-ZIP zip -fz·jszip 可读 17 条目)会被拒=已知误伤面
// (r4 勘正,撤「零误伤」过度声明)。
const ZIP64_SENTINEL_16 = 0xffff;
const ZIP64_SENTINEL_32 = 0xffffffff;

const zipGuardErr = (code: string) => Object.assign(new Error(code), { code });

/** docx 解包前置守卫:手读 zip EOCD + central directory 并核多帽——条目数/单条目声明/解压总量
 *  (声明合计)任一越帽即拒(zip_entry_overflow / zip_uncompressed_overflow);EOCD 缺失·CD 签名失配·走读越界
 *  等结构不可核形态同归 zip_directory_invalid(fail-closed:"核不了"="拒")。守卫恒先于解析 worker
 *  spawn——越帽字节零解包零 isolate 占用。读法:EOCD 自尾反向扫(注释区 ≤65535+22)·CDH 定长 46
 *  +name+extra+comment 变长步进·字段全小端;前插数据(self-extracting 形)声明偏移必失配同拒——
 *  Office 工具产 docx 恒为纯 zip 不受影响。
 *  zip64 哨兵六字段(diskNumber/diskWithCentralDirStart/centralDirRecordsOnThisDisk/centralDirRecords
 *  =0xFFFF,centralDirSize/centralDirOffset=0xFFFFFFFF)任一命中即 zip_directory_invalid——否则 jszip
 *  弃声明面走 zip64 EOCD 覆写路径,守卫审的目录不再是 jszip 实读的目录(C5 实锤绕过形)。注释区声明
 *  长度不得越过缓冲余量(与 jszip 读法恒等,消除守卫放行而解析器越界抛错的判定缝)。 */
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
    const declaredEntry = buffer.readUInt32LE(p + 24);   // central directory uncompressedSize 声明值
    if (declaredEntry > DOCX_ZIP_MAX_ENTRY_UNCOMPRESSED) throw zipGuardErr('zip_uncompressed_overflow');   // r4:单条目声明帽(别名读放大界)
    uncompressedTotal += declaredEntry;
    if (uncompressedTotal > DOCX_ZIP_MAX_UNCOMPRESSED_TOTAL) throw zipGuardErr('zip_uncompressed_overflow');
    p += 46 + buffer.readUInt16LE(p + 28) + buffer.readUInt16LE(p + 30) + buffer.readUInt16LE(p + 32);
  }
  if (p !== eocd) throw zipGuardErr('zip_directory_invalid');   // CD 区恰被 totalEntries 条耗尽
}

const EXTRACT_TIMEOUT_MS = Number(process.env.RESUME_EXTRACT_TIMEOUT_MS ?? 8000);   // 提取硬超时(界定解压炸弹/病态文档的 hang;安全审计 F2)。到点 SIGKILL 子进程,抛 extract_timeout,上层降级为可解释错误。
/** 解析子进程堆帽(r4:--max-old-space-size 硬帽·进程级 OOM 隔离——子进程 abort 只死子进程,宿主收
 *  确定错误码;worker_threads resourceLimits 的"宿主存活"前提已被复验证伪,见文件头 r4 修订段)。
 *  帽值承 resume-cap-probe 实测探针定值(8MB 文本充实合法 PDF 阶梯:64/96/192 OOM·256 成功·heapUsed
 *  232.6MB;与双审量基带 58-74MB 交叉校验通过=非低定)——禁用并发乘法公式定帽(堆帽不辖 RSS/ArrayBuffer,
 *  已被实测证伪)。env 名承 #108 既有 RESUME_WORKER_HEAP_CAP_MB(部署环境兼容,语义=解析子进程堆帽)。 */
const RESUME_WORKER_HEAP_CAP_MB = Number(process.env.RESUME_WORKER_HEAP_CAP_MB ?? 256);
/** r4 域层解析并发闸:同时存活的解析子进程上限(默认 2)——把"多路并发解析内存叠加"钉死在上限×
 *  单子进程有界内存,避免 6 路(PARSE_MAX)并发各自膨胀叠加耗尽容器。超额请求 FIFO 排队而非拒绝
 *  (外层服务侧 PARSE_MAX 闸先行兜底,排队深度有界);排队不占自身 8s 解析超时(到点计时自 spawn 起)。 */
const PARSE_CHILDREN_MAX = Math.max(1, Number(process.env.RESUME_PARSE_CONCURRENCY ?? 2));
const CHILD_ENTRY = fileURLToPath(new URL('./resume-extract-child.ts', import.meta.url));

const timeoutErr = () => Object.assign(new Error('extract_timeout'), { code: 'extract_timeout' });
const parseFailedErr = () => Object.assign(new Error('parse_failed'), { code: 'parse_failed' });

// 域层 FIFO 并发闸(零依赖信号量):acquire 满 → 入队等待;release → 队首唤醒。单线程事件循环内
// 状态推进原子,无锁面。
let parseChildrenActive = 0;
const parseSlotWaiters: Array<() => void> = [];
async function acquireParseSlot(): Promise<void> {
  if (parseChildrenActive < PARSE_CHILDREN_MAX) { parseChildrenActive += 1; return; }
  await new Promise<void>((wake) => parseSlotWaiters.push(wake));
  parseChildrenActive += 1;
}
function releaseParseSlot(): void {
  parseChildrenActive -= 1;
  parseSlotWaiters.shift()?.();
}
async function withParseSlot<T>(task: () => Promise<T>): Promise<T> {
  await acquireParseSlot();
  try { return await task(); } finally { releaseParseSlot(); }
}

/** r4 子进程运行形:fork 即同步挂 error/exit 监听(子进程 error 无监听=宿主 uncaughtException 裸崩)。
 *  事件→宿主错误映射:结构化 message{code} 按 code 重建原码(encrypted 保真)/exit 无结果(含子进程
 *  OOM abort SIGABRT/134——只收尸不连坐)或超时/abort→SIGKILL+extract_timeout 级/启动失败(ENOENT)→
 *  parse_failed。execArgv 承 process.execArgv(loader 链 tsx/@swc-node 传播)+堆帽 V8 flag。 */
function runInChild(kind: 'pdf' | 'docx', buffer: Buffer, signal?: AbortSignal): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (signal?.aborted) { reject(timeoutErr()); return; }   // 排队期间已 abort:不 spawn
    let settled = false;
    let child: ReturnType<typeof fork> | null = null;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      child?.kill('SIGKILL');   // 超限即杀:超时/OOM/竞态余留一杀到底,无僵尸窗口
      child = null;
      fn();
    };
    const timer = setTimeout(() => settle(() => reject(timeoutErr())), EXTRACT_TIMEOUT_MS);
    const onAbort = () => settle(() => reject(timeoutErr()));
    signal?.addEventListener('abort', onAbort, { once: true });
    try {
      child = fork(CHILD_ENTRY, {
        serialization: 'advanced',   // Buffer 结构化克隆直传,免 JSON 序列化开销
        execArgv: [...process.execArgv, `--max-old-space-size=${RESUME_WORKER_HEAP_CAP_MB}`, '--max-semi-space-size=32'],   // old-gen 帽+young 半空间帽(承 worker 形 resourceLimits maxYoung 32 语义·两帽合计才是 V8 预算)
      });
    } catch { settle(() => reject(parseFailedErr())); return; }
    child.on('message', (m: { ok?: boolean; text?: string; code?: string; message?: string }) => {
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
    child.on('error', (e: NodeJS.ErrnoException) => {
      settle(() => {
        if (String(e?.message ?? '').includes('ENOENT') || String(e?.message ?? '').includes('Cannot find module')) {
          reject(parseFailedErr());
          return;
        }
        reject(timeoutErr());
      });
    });
    child.on('exit', () => settle(() => reject(timeoutErr())));   // exit 无结果(含子进程 OOM abort·只死子进程)→超时级降级
    child.send({ kind, buffer });
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
      text = await withParseSlot(() => runInChild('pdf', buffer, options?.signal));   // #108:独立子进程内真解析,到点 SIGKILL 真死
    } catch (e) {
      mapPdfExtractError(e);
    }
    return { text: cleanResumeText(text), format };
  }
  if (format === 'docx') {
    assertDocxZipWithinCaps(buffer);   // 解压守卫恒先于子进程 spawn:越帽/不可核字节零解包零进程占用
    const raw = await withParseSlot(() => runInChild('docx', buffer, options?.signal));
    return { text: cleanResumeText(raw), format };
  }
  if (format === 'image') {
    throw Object.assign(new Error('image_needs_ocr'), { code: 'image_needs_ocr' });   // 上层路由到 qwen-vl OCR
  }
  return { text: cleanResumeText(buffer.toString('utf8')), format: 'text' };
}

/** 测试缝(帽值探针专用·沿 __resetAiCostExhaustedCacheForTest 官方缝先例):以指定堆帽+超时跑一次
 *  子进程解析,回传 {ok,text,code,heapUsedMb,ms}——resume-cap-probe 据此定帽并与 58-74MB 量基带交叉校验。
 *  生产路径零引用(不占解析并发闸·探针自持进程)。 */
export async function probeExtractWithCap(buffer: Buffer, format: 'pdf' | 'docx', capMb: number, timeoutMs: number): Promise<{ ok: boolean; text?: string; code?: string; heapUsedMb?: number; ms: number }> {
  const t0 = Date.now();
  return new Promise((resolve) => {
    let settled = false;
    let child: ReturnType<typeof fork> | null = null;
    const done = (r: { ok: boolean; text?: string; code?: string; heapUsedMb?: number }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child?.kill('SIGKILL');
      resolve({ ...r, ms: Date.now() - t0 });
    };
    const timer = setTimeout(() => done({ ok: false, code: 'extract_timeout' }), timeoutMs);
    try {
      child = fork(CHILD_ENTRY, { serialization: 'advanced', execArgv: [...process.execArgv, `--max-old-space-size=${capMb}`, '--max-semi-space-size=32'] });
    } catch { done({ ok: false, code: 'worker_error' }); return; }
    child.on('message', (m: { ok?: boolean; text?: string; code?: string; message?: string; heapUsedMb?: number }) => {
      if (m?.ok) done({ ok: true, text: m.text, heapUsedMb: m.heapUsedMb });
      else done({ ok: false, code: String(m?.code ?? 'parse_failed') });
    });
    child.on('error', () => done({ ok: false, code: 'worker_error' }));
    child.on('exit', (code, sig) => done({ ok: false, code: sig === 'SIGABRT' || code === 134 ? 'oom' : 'exit_no_result' }));   // 子进程 OOM abort=SIGABRT/134→oom
    child.send({ kind: format, buffer });
  });
}
