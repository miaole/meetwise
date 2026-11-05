/**
 * 简历多格式提取 + 清洗。真简历是 PDF/Word/图片,不是纯文本——上传前必须提取文本 + 清洗。
 * - PDF:pdf-parse(文本层抽取,独立解析子进程内跑)。加密 PDF 显式 encrypted(不静默成功/不喂 OCR)。
 * - Word(.docx):mammoth(extractRawText,独立解析子进程内跑)。
 * - 图片:需 OCR(qwen-vl,worker 侧多模态)——此处抛 image_needs_ocr,由上层路由到 vision(seam 留)。
 * - 纯文本:直通。
 * 清洗:统一换行 / 去控制字符 / 压缩空白与空行 / trim——脏数据进结构化前先洗(用户问的"数据清洗")。
 *
 * #109 魔数嗅探:分派点最前置(先于加密扫描与任何解析 spawn),声明格式与字节不符 → magic_mismatch
 * fail-closed——垃圾字节/伪造后缀永不进解析器。
 * #107 解压守卫:docx 解包前置——zip central directory 手读(零新依赖)核条目数/单条目声明/解压总量
 * 多帽,越帽或结构不可核一律 fail-closed(zip_entry_overflow/zip_uncompressed_overflow/zip_directory_invalid)
 * ——炸弹字节零进程 spawn 零解包,进不了 mammoth→jszip 解压面。
 * #108 解析真终止:pdf/docx 解析搬进独立解析进程;8s 到点/外部 abort 即 SIGKILL——
 * 僵尸解析占事件循环/解析槽的面就此闭合(槽位释放=解析真死)。
 * r4 修订(post-prove FAIL 处置):worker_threads 的 resourceLimits 只帽 V8 old-gen 堆,worker 内
 * 单次大分配越帽时 V8 FatalProcessOutOfMemory 直接 abort 宿主全进程(实测 EXIT=134·复验报告),
 * "isolate 只死 worker/宿主存活"前提被证伪——解析隔离自线程级升级为**独立 OS 子进程**
 * (child_process.fork:--max-old-space-size 堆帽+到点 SIGKILL,超限即杀,子进程 abort 只死子进程,
 * 宿主收到确定错误码);域层并发闸(RESUME_PARSE_CONCURRENCY)钉住子进程内存叠加;守卫增
 * 单条目声明帽(mammoth 关系别名读放大 ≤6×+双字节解码 ×2=12×·见守卫节);子进程内 docx 适配器
 * 记忆化+按声明值流式计量(见 resume-extract-child.ts)。resourceLimits 帽不构成容器内存保证
 * (#108 既有申明维持)。
 * r5 修订(post-prove 双席 FAIL 处置·2026-11-06·登记源=审查 s3-r4-1(P1 基线崩溃不可复现)+s3-r4-2
 * (P0 cgroup OOM 杀宿主 18/18·P1 机密全量可见·P2 畸形帧杀宿主/IPC 无上限/stdio 无界/错误码混淆/
 * 队列无上限)):
 * ①宿主 OOM 保护:fork 后宿主**同步**写 /proc/<child.pid>/oom_score_adj=1000(非 Linux 静默跳过)——
 *   内核 cgroup OOM killer 按 oom_score 选靶,RSS 最大的宿主(approx 260-300MB)不再成为靶子
 *   (证伪路预演 30/30 宿主存活);子进程入口再自写一次兜底(防宿主写窗与 spawn 间隙)。
 * ②清洗与截断下沉子进程:cleanResumeText 在子进程跑,清洗后 >服务层文本帽(MAX_RESUME_TEXT=60000
 *   对齐锚)只回传帽+1 字——服务层 >帽→413 extracted_too_long 的判定语义逐字节不变;宿主对回传长度
 *   再核一次(>帽+1=子进程协议违约→child_crash),宿主从此不收 MB 级文本(消息大小上界=构造性成立)。
 * ③机密隔离:fork 显式传最小 env(逐变量理由见 CHILD_ENV 注)——子进程不再看到 DATABASE_URL/
 *   AUTH_SECRET/PAY_PROVIDER_SECRET/RESUME_ENC_KEY 等;子进程加 --permission(只允许读应用目录树
 *   与解析所需能力),同 uid 读 /proc/<父pid>/environ 被拒(ERR_ACCESS_DENIED)。
 * ④IPC 安全:stdio 改 ['ignore','ignore','pipe','ipc'],stderr 限量捕获(STDERR_CAPTURE_BYTES
 *   上界,溢出即 resume() 弃流,防 OOM 原生栈刷爆日志);子进程写畸形帧时 Node 以
 *   "Unable to deserialize cloned data" uncaughtException 形式打穿宿主(child.on('error') 拦不住,
 *   证伪路实测 EXIT 1)——进程级 deserialize 崩溃守卫(IpcCrashGuard)捕获后按 child_crash 收场,
 *   宿主不退出;非本类错误保持默认致命语义(print+exit(1),不吞)。
 * ⑤错误码按退出码/信号区分(宿主日志可辨因):SIGABRT/134→child_oom(V8 堆 OOM abort)·
 *   SIGKILL/137→child_oom(内核 cgroup OOM killer——宿主超时 SIGKILL 路径 settle-once 先行,
 *   exit 无结果且带 SIGKILL 只可能是外杀=OOM)·其余非零/无结果→child_crash·spawn 失败
 *   (ENOENT/模块缺失)→child_start_failed·到点/abort→extract_timeout(既有)·域层排队等待越限→
 *   extract_queue_timeout(新,服务层映射既有 server_busy 503 可重试·对外码面零新增)。
 *   服务层未知码→parse_failed 422 兜底不变(对外错误码零新增)。
 * ⑥PDF 按页提取+达帽早停:getInfo().total 定页数,逐页 getText({partial}) 累计——清洗累计 >帽+
 *   停止余量即停(提前停止=合法大文件峰值内存从"全文+全文 DOM"降到"已提取页";逐页 join 与
 *   整篇 getText 输出逐字节恒等,87 样本 parity 机证);docx 无页粒度,早停由既有流式声明计量
 *   (liar 类)承担,文本量上界由子进程清洗截断承担(如实登记,不虚称按页)。
 */
import { fork } from 'node:child_process';
import { writeFileSync } from 'node:fs';
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

/** 清洗提取出的原始文本:统一换行、去控制字符、压缩空白/空行、trim。
 *  r5:pdf/docx 分支该函数在**子进程内**跑(resume-extract-child.ts import 本函数)——宿主只收
 *  清洗后 ≤帽+1 字的文本;text 分支仍在宿主进程直跑(无子进程)。清洗只会收缩文本
 *  (每步替换零扩张),故"清洗累计 >帽+余量 ⇒ 全文清洗后必 >帽"的早停判定恒安全。 */
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
// =12 倍读放大——单条目声明 ≤10MB 时实读峰值 ≤120MB,远低于子进程堆帽 256MB。误伤面如实登记
// (r5 采纳核对路 P2-1 勘正):≤8MB 传输信封下,高压缩比诚实条目(未压缩位图/巨 XML 等压缩后 <8MB
// 但声明 >10MB)会被拒——已知 fail-closed 误伤面,取舍=宁可拒件不敞解压面(17 真实件全 ACCEPT 实测
// 未触及)。越帽同归 zip_uncompressed_overflow。
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
 *  等结构不可核形态同归 zip_directory_invalid(fail-closed:"核不了"="拒")。守卫恒先于解析子进程
 *  spawn——越帽字节零解包零进程占用。读法:EOCD 自尾反向扫(注释区 ≤65535+22)·CDH 定长 46
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
/** r5 解析文本帽(对齐锚=服务层 apps/api resume.service MAX_RESUME_TEXT=60000·判定语义不变锚)。
 *  子进程清洗后 >帽只回传帽+1 字(宿主核长≤帽+1);服务层 >帽→413 extracted_too_long 判定与 r4
 *  (全文回传后判长)恒同——唯一外部可见差异=域层不再回传 MB 级全文(宿主内存上界=构造性成立)。 */
const RESUME_PARSE_TEXT_CAP = 60_000;
/** r5 域层解析并发闸:同时存活的解析子进程上限——把"多路并发解析内存叠加"钉死在上限×单子进程
 *  有界内存,避免 6 路(PARSE_MAX)并发各自膨胀叠加耗尽容器。超额请求 FIFO 排队而非拒绝(外层
 *  服务侧 PARSE_MAX 闸先行兜底,排队深度有界);排队不占自身 8s 解析超时(到点计时自 spawn 起)。
 *  默认值=512m 生产限额下实测裁定(r5 卷 §9:N=2 时两路重件叠加逼近 mem_limit,合法件成功率与
 *  宿主余量权衡后取 1;512m 下宿主 + 单子进程峰值 ≤ mem_limit 预算算式见卷)。 */
const PARSE_CHILDREN_MAX = Math.max(1, Number(process.env.RESUME_PARSE_CONCURRENCY ?? 1));
/** r5 域层排队等待上限:域层 FIFO 内等待超此值即 extract_queue_timeout(服务层映射既有 server_busy
 *  503 可重试)。与外层每用户排队(服务层)共用同一 env 单旋钮,双层等待合计 ≤2×WAIT。 */
const PARSE_QUEUE_WAIT_MS = Math.max(0, Number(process.env.RESUME_PARSE_QUEUE_WAIT_MS ?? 10_000));
const CHILD_ENTRY = fileURLToPath(new URL('./resume-extract-child.ts', import.meta.url));
/** r5 机密隔离:子进程可读的应用根=本文件上三级(dir=packages/domain/src → 仓根/镜像 /app)。
 *  生产镜像 WORKDIR=/app(COPY packages ./packages)与仓内 worktree 同构,二者皆为解析器模块图
 *  (入口 .ts+node_modules+loader)所在树。 */
const CHILD_APP_ROOT_RAW = fileURLToPath(new URL('../../../', import.meta.url));
const CHILD_APP_ROOT = CHILD_APP_ROOT_RAW.length > 1 && CHILD_APP_ROOT_RAW.endsWith('/') ? CHILD_APP_ROOT_RAW.slice(0, -1) : CHILD_APP_ROOT_RAW;

const timeoutErr = () => Object.assign(new Error('extract_timeout'), { code: 'extract_timeout' });
const queueTimeoutErr = () => Object.assign(new Error('extract_queue_timeout'), { code: 'extract_queue_timeout' });
const childOomErr = () => Object.assign(new Error('child_oom'), { code: 'child_oom' });
const childCrashErr = () => Object.assign(new Error('child_crash'), { code: 'child_crash' });
const childStartFailedErr = () => Object.assign(new Error('child_start_failed'), { code: 'child_start_failed' });

// ── r5 机密隔离:fork 最小 env 白名单(逐变量理由)──────────────────────────
// 子进程只承解析职责(收 buffer·吐文本),零 DB/零外呼/零鉴权——一个 env 变量都给不给,给哪个,
// 逐个写明;不传 process.env 全量(r4 复审实证:全量继承=DATABASE_URL/AUTH_SECRET/PAY_PROVIDER_SECRET/
// RESUME_ENC_KEY/RESUME_HASH_SECRET/RAG_REDIS_URL/RAG_QBANK_CACHE_HASH_KEY 七机密名全量可见)。
// - NODE_ENV:loader/运行时形态标志(@swc-node register/若干库按 production 判定行为差异);
//   不传会让子进程与宿主运行形态漂移。
// - TMPDIR:临时目录锚(tsx loader 编译缓存目录落点;OS 默认路径,非机密)。子进程 env 缺它时
//   tsx 落 /tmp(macOS 符号链接 /private/tmp)与 allow-fs-write 白名单错位致启动即拒(实测);
//   传入后缓存目录与授权模式同锚。生产镜像/compose 不设 TMPDIR→变量缺席,零写盘面保持。
//   除此外子进程代码与两条解析链(pdf-parse/mammoth→jszip)均不读 env。堆帽/超时经 execArgv
//   flags 与消息(textCap)显式传,不走 env——env 面保持最小。
// - 剩余残余面如实登记:同 uid 进程本可读 /proc/<父pid>/environ——由子进程 --permission 文件读
//   白名单拒绝(CHILD_PERM_ARGS,证伪路预演+生产镜像验证 ERR_ACCESS_DENIED);--permission 沙箱
//   形态=进程级纵深,非安全边界声明(同 root/同 cgroup 逃逸面不在此模型内)。
function childEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  if (process.env.NODE_ENV !== undefined) env.NODE_ENV = process.env.NODE_ENV;
  if (process.env.TMPDIR !== undefined) env.TMPDIR = process.env.TMPDIR;
  return env;
}

/** r5 子进程 --permission 白名单(只在显式列出的能力面放开,其余默认拒绝):
 *  - allow-fs-read=<应用根>/**:入口 .ts/解析器模块图(mammoth/pdf-parse/jszip/pdfjs-dist 均
 *    在根内 node_modules)/loader(swc/tsx)自身——解析所需读面;白名单外(/proc/<父>/environ、
 *    源码树外的任意文件)一律 ERR_ACCESS_DENIED。
 *  - allow-addons:@swc/core 原生 .node 加载(loader 形态必需;mammoth/pdf-parse 纯 JS 不加载
 *    原生模块)。
 *  - allow-worker:pdfjs fake-worker 面预留(实测生产镜像验证所需,同证伪路预演配置)。
 *  - allow-child-process:node 包装器形态(dev 机 hermes shim 自 spawn 真 node 二进制)需要;
 *    生产 swc 形态实测零 spawn——保留此授权系形态兼容面,残余面=被入侵解析库理论可 spawn,
 *    但其 env 已最小化(无机密),纵深不因之破。
 *  r5 子进程 execArgv 不继承宿主 loader 链(原生 strip-types 直跑·r4-1 P2-3 耦合面关闭)——
 *  故无 tsx/swc 编译缓存读写授权面(零写盘形态保持,证伪路生产镜像实测)。 */
const CHILD_PERM_ARGS = [
  '--permission',
  `--allow-fs-read=${CHILD_APP_ROOT}/`,   // 目录授权形(尾斜杠=递归整树·模块解析需逐级 readdir/读祖先 package.json,实测 /** 深链对目录 readdir 拒绝)
  '--allow-addons',
  '--allow-worker',
  '--allow-child-process',
];

/** r5 子进程 stdio:stdin/stdout 丢弃,stderr 管道限量捕获——OOM abort 的 V8 原生栈/解析器告警
 *  不再直灌宿主 stdout(刷屏),也不再无界驻留(溢出即 resume() 弃流)。 */
const CHILD_STDIO: Array<'ignore' | 'pipe' | 'ipc'> = ['ignore', 'ignore', 'pipe', 'ipc'];
const STDERR_CAPTURE_BYTES = 64 * 1024;   // 失败诊断尾部捕获上界;溢出即弃流防无界驻留

// ── r5 IPC 反序列化崩溃守卫(IpcCrashGuard)────────────────────────────────
// 机制(Node 行为实测·证伪路复现):子进程向 IPC fd 直写原始字节(畸形帧)时,宿主通道反序列化
// 在内部回调抛 "Unable to deserialize cloned data"——以 **uncaughtException** 形式打穿宿主,
// child.on('error')/on('exit') 均拦截不到,宿主直接 EXIT 1。守卫=进程级 uncaughtException 过滤:
// 命中该错误串且存在活跃解析运行 → kill 活跃子进程+按 child_crash 收场(宿主不退出);无活跃运行
// 或已被 settle → 吞掉(通道已死,子进程由 SIGKILL/断连自灭收尾)。**非本类错误保持 Node 默认
// 致命语义**(print+exit(1))——守卫只闭畸形帧这一类,不做全局兜底。懒安装:首次 runInChild 时
// 挂载(子进程 import 本模块不会安装——子进程零 runInChild 调用)。
let ipcGuardInstalled = false;
let activeIpcRun: { kill: () => void; onCrash?: () => void } | null = null;
function installIpcCrashGuard(): void {
  if (ipcGuardInstalled) return;
  ipcGuardInstalled = true;
  process.on('uncaughtException', (e: Error) => {
    if (String(e?.message ?? '').includes('Unable to deserialize cloned data')) {
      const victim = activeIpcRun;
      activeIpcRun = null;
      victim?.kill();   // 通道已破:SIGKILL 活跃子进程,exit(无结果)事件 settle-once 收场
      victim?.onCrash?.();   // 受害 run 直接按 child_crash settle(exit 竞速前先行·幂等)
      console.warn(`RESUME_IPC_MALFORMED_FRAME ${victim ? 'child_crash_settled' : 'no_active_run'}(宿主存活)`);
      return;   // 宿主不退出
    }
    // 非守卫目标:保持 Node 默认致命语义(print+exit 1),不吞不扩权。
    console.error(e);
    process.exit(1);
  });
}

/** Linux 宿主侧 OOM 保护:fork 后**同步**写子进程 oom_score_adj=1000——cgroup OOM killer 按
 *  oom_score 选靶,宿主(api 进程 RSS 260-300MB)不再与子进程竞争成靶(证伪路 512m 实测:无此行
 *  18/18 宿主被杀 HOST_EXIT=137;有此行+子进程内截断 30/30 存活)。非 Linux(/proc 不存在)静默
 *  跳过。子进程入口自写一次兜底(resume-extract-child.ts),防宿主写窗异常。 */
function setChildOomScoreAdj(pid: number): void {
  try { writeFileSync(`/proc/${pid}/oom_score_adj`, '1000'); } catch { /* 非 Linux/权限面:静默跳过 */ }
}

// 域层 FIFO 并发闸(零依赖信号量):acquire 满 → 入队等待;release → 队首唤醒。单线程事件循环内
// 状态推进原子,无锁面。r5:排队等待越 PARSE_QUEUE_WAIT_MS 即 extract_queue_timeout(可重试 503),
// 不再无上限滞留;等待计时含 abort(signal 已断即弃权,不占队)。
let parseChildrenActive = 0;
const parseSlotWaiters: Array<{ wake: () => void; timer: NodeJS.Timeout }> = [];
async function acquireParseSlot(signal?: AbortSignal): Promise<void> {
  if (parseChildrenActive < PARSE_CHILDREN_MAX) { parseChildrenActive += 1; return; }
  await new Promise<void>((wake, reject) => {
    const entry = { wake, timer: undefined as unknown as NodeJS.Timeout };
    entry.timer = setTimeout(() => {
      const i = parseSlotWaiters.indexOf(entry);
      if (i >= 0) parseSlotWaiters.splice(i, 1);
      reject(queueTimeoutErr());
    }, PARSE_QUEUE_WAIT_MS);
    const onAbort = () => {
      const i = parseSlotWaiters.indexOf(entry);
      if (i >= 0) parseSlotWaiters.splice(i, 1);
      clearTimeout(entry.timer);
      reject(timeoutErr());
    };
    if (signal?.aborted) { onAbort(); return; }
    signal?.addEventListener('abort', onAbort, { once: true });
    parseSlotWaiters.push(entry);
  }).finally(() => { /* reject 路径 timer 已清 */ });
  parseChildrenActive += 1;
}
function releaseParseSlot(): void {
  parseChildrenActive -= 1;
  const next = parseSlotWaiters.shift();
  if (next) { clearTimeout(next.timer); next.wake(); }
}
async function withParseSlot<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  await acquireParseSlot(signal);
  try { return await task(); } finally { releaseParseSlot(); }
}

/** r5 子进程运行形:fork 即同步挂 error/exit 监听(子进程 error 无监听=宿主 uncaughtException 裸崩)。
 *  事件→宿主错误映射(r5 按退出码/信号区分,宿主日志可辨因):
 *  - 结构化 message{code,text}:text 长度 >帽+1=子进程协议违约→child_crash;code 重建原码(encrypted 保真);
 *  - exit 无结果:SIGABRT/134→child_oom(V8 堆 OOM abort·只死子进程);SIGKILL/137→child_oom
 *    (内核 cgroup OOM killer——宿主自身超时 SIGKILL 路径 settle-once 先行,不落此处);其余→child_crash;
 *  - error 事件:ENOENT/模块缺失→child_start_failed;其余→child_crash;
 *  - 到点 timer/外部 abort→SIGKILL+extract_timeout(既有)。
 *  execArgv 承 process.execArgv(loader 链 tsx/@swc-node 传播)+堆帽 V8 flag+--permission 白名单;
 *  env=最小白名单(CHILD_ENV·机密隔离);fork 后同步写 oom_score_adj;stderr 限量捕获。 */
function runInChild(kind: 'pdf' | 'docx', buffer: Buffer, signal?: AbortSignal): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (signal?.aborted) { reject(timeoutErr()); return; }   // 排队期间已 abort:不 spawn
    let settled = false;
    let child: ReturnType<typeof fork> | null = null;
    let stderrTail = '';
    let stderrBytes = 0;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      if (activeIpcRun && child) activeIpcRun = null;
      child?.kill('SIGKILL');   // 超限即杀:超时/OOM/竞态余留一杀到底,无僵尸窗口
      child = null;
      fn();
    };
    const timer = setTimeout(() => settle(() => reject(timeoutErr())), EXTRACT_TIMEOUT_MS);
    const onAbort = () => settle(() => reject(timeoutErr()));
    signal?.addEventListener('abort', onAbort, { once: true });
    installIpcCrashGuard();   // r5:首次解析前挂载反序列化崩溃守卫(畸形帧→child_crash 而非宿主退出)
    const failWithLog = (code: string) => {
      console.warn(`RESUME_CHILD_FAIL code=${code} kind=${kind} stderr=${JSON.stringify(stderrTail.slice(-240))}`);
    };
    try {
      child = fork(CHILD_ENTRY, {
        serialization: 'advanced',   // Buffer 结构化克隆直传,免 JSON 序列化开销
        // r5:子进程 execArgv 不再继承宿主 loader 链(撤 r4 [...process.execArgv, ...] 形)——
        // 本仓两 .ts 面均为可擦除语法,node>=22.18 原生 strip-types 直跑(生产镜像 node 22.23.2 亲验);
        // ①闭 r4-1 P2-3 部署耦合面(宿主 loader 缺失即解析全静默 422);②tsx loader 在 --permission
        // 下对目录做大小写改写读,与读白名单错位即拒(实测),去 loader 即消。
        execArgv: [`--max-old-space-size=${RESUME_WORKER_HEAP_CAP_MB}`, '--max-semi-space-size=32', ...CHILD_PERM_ARGS],   // old-gen 帽+young 半空间帽(承 worker 形 resourceLimits maxYoung 32 语义·两帽合计才是 V8 预算)+r5 permission 沙箱
        env: childEnv(),   // r5 机密隔离:最小 env 白名单(拒绝 DATABASE_URL/AUTH_SECRET 等 7 机密名)
        stdio: CHILD_STDIO,   // r5:stderr 限量捕获,stdout/stdin 丢弃
      });
    } catch { settle(() => { failWithLog('child_start_failed'); reject(childStartFailedErr()); }); return; }
    if (child.pid != null) setChildOomScoreAdj(child.pid);   // r5 宿主 OOM 保护:OOM killer 弃宿主选子进程(fork 失败 pid 缺席=start_failed 已收场)
    child.stderr?.on('data', (d: Buffer | string) => {
      if (stderrBytes >= STDERR_CAPTURE_BYTES) { child?.stderr?.resume(); return; }   // 溢出即弃流(防无界驻留)
      stderrBytes += (typeof d === 'string' ? Buffer.byteLength(d) : d.length);
      if (stderrBytes <= STDERR_CAPTURE_BYTES) stderrTail += d.toString();
      else child?.stderr?.resume();
    });
    child.on('message', (m: { ok?: boolean; text?: string; code?: string; message?: string }) => {
      if (m?.ok) {
        const text = typeof m.text === 'string' ? m.text : '';
        // r5 宿主侧长度复核(单条消息上界=帽+1·构造性成立):子进程协议违约(越帽/非串)→child_crash
        if (text.length > RESUME_PARSE_TEXT_CAP + 1) {
          settle(() => { failWithLog('child_crash'); reject(childCrashErr()); });
          return;
        }
        settle(() => resolve(text));
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
          failWithLog('child_start_failed');
          reject(childStartFailedErr());
          return;
        }
        failWithLog('child_crash');
        reject(childCrashErr());
      });
    });
    child.on('exit', (code: number | null, sig: NodeJS.Signals | null) => {
      settle(() => {
        if (sig === 'SIGABRT' || code === 134) { failWithLog('child_oom'); reject(childOomErr()); return; }          // V8 堆 OOM abort(只死子进程)
        if (sig === 'SIGKILL' || code === 137) { failWithLog('child_oom'); reject(childOomErr()); return; }          // 内核 cgroup OOM killer 选靶子进程
        failWithLog('child_crash');
        reject(childCrashErr());   // 其余退出无结果(含 0/1)=协议异常收场
      });
    });
    activeIpcRun = {
      kill: () => { try { child?.kill('SIGKILL'); } catch { /* 已退 */ } },
      onCrash: () => settle(() => { failWithLog('child_crash'); reject(childCrashErr()); }),
    };
    child.send({ kind, buffer, textCap: RESUME_PARSE_TEXT_CAP });
  });
}

function mapPdfExtractError(e: unknown): never {
  const msg = String((e as { message?: string })?.message ?? e ?? '');
  if (ENCRYPT_HINT.test(msg)) {
    throw Object.assign(new Error('encrypted'), { code: 'encrypted' });
  }
  throw e;
}

/** 从文件字节提取并清洗简历文本。返回 {text,format}。图片 → 抛 image_needs_ocr。
 *  options.signal(#108 AbortSignal seam·r5 服务层已接线):abort → 排队弃权/terminate+extract_timeout
 *  (与超时双终止幂等 settle-once)。r5:pdf/docx 清洗与截断在子进程完成(宿主只收 ≤帽+1 字并复核长度),
 *  text 分支清洗仍在宿主。 */
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
      text = await withParseSlot(() => runInChild('pdf', buffer, options?.signal), options?.signal);   // #108:独立子进程内真解析,到点 SIGKILL 真死
    } catch (e) {
      mapPdfExtractError(e);
    }
    return { text, format };
  }
  if (format === 'docx') {
    assertDocxZipWithinCaps(buffer);   // 解压守卫恒先于子进程 spawn:越帽/不可核字节零解包零进程占用
    const text = await withParseSlot(() => runInChild('docx', buffer, options?.signal), options?.signal);
    return { text, format };
  }
  if (format === 'image') {
    throw Object.assign(new Error('image_needs_ocr'), { code: 'image_needs_ocr' });   // 上层路由到 qwen-vl OCR
  }
  return { text: cleanResumeText(buffer.toString('utf8')), format: 'text' };
}

/** 测试缝(帽值探针专用·沿 __resetAiCostExhaustedCacheForTest 官方缝先例):以指定堆帽+超时跑一次
 *  子进程解析,回传 {ok,text,code,heapUsedMb,ms}——resume-cap-probe 据此定帽并与 58-74MB 量基带交叉校验。
 *  生产路径零引用(不占解析并发闸·探针自持进程)。r5:与生产形同 fork 选项(env 白名单/permission/
 *  stdio/oom_score_adj),textCap=MAX_SAFE(探针语义=全文回传测堆,不受服务层截断影响)。 */
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
      child = fork(CHILD_ENTRY, {
        serialization: 'advanced',
        execArgv: [`--max-old-space-size=${capMb}`, '--max-semi-space-size=32', ...CHILD_PERM_ARGS],   // r5:同生产形,不继承宿主 loader(原生 strip-types 直跑)
        env: childEnv(),
        stdio: CHILD_STDIO,
      });
    } catch { done({ ok: false, code: 'worker_error' }); return; }
    if (child.pid != null) setChildOomScoreAdj(child.pid);
    child.stderr?.resume();   // 探针不消费 stderr:直接弃流防背压
    child.on('message', (m: { ok?: boolean; text?: string; code?: string; message?: string; heapUsedMb?: number }) => {
      if (m?.ok) done({ ok: true, text: m.text, heapUsedMb: m.heapUsedMb });
      else done({ ok: false, code: String(m?.code ?? 'parse_failed') });
    });
    child.on('error', () => done({ ok: false, code: 'worker_error' }));
    child.on('exit', (code, sig) => done({ ok: false, code: sig === 'SIGABRT' || code === 134 || sig === 'SIGKILL' || code === 137 ? 'oom' : 'exit_no_result' }));   // 子进程 OOM abort=SIGABRT/134(内核杀=SIGKILL/137)→oom
    child.send({ kind: format, buffer, textCap: Number.MAX_SAFE_INTEGER });   // 探针=全文回传(不截断,堆画像保真)
  });
}

/** 测试缝(r5·畸形帧守卫官方缝先例同 probeExtractWithCap):fork 与生产 runInChild 同构(同 env
 *  白名单/permission/stdio/oom_score_adj),向子进程发 corrupt_ipc 指令——子进程向 IPC fd 直写
 *  8 字节原始畸形帧,宿主 deserialize 抛 "Unable to deserialize cloned data" uncaughtException,
 *  IpcCrashGuard 捕获后按 child_crash settle(宿主不退出)。回传 {code,hostAlive} 供 proof 断言
 *  「畸形帧→宿主存活+child_crash」。生产路径零引用。 */
export function probeCorruptIpcFrame(timeoutMs: number): Promise<{ code: string; hostAlive: true }> {
  return new Promise((resolve) => {
    installIpcCrashGuard();
    let settled = false;
    let child: ReturnType<typeof fork> | null = null;
    const done = (code: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child?.kill('SIGKILL');
      resolve({ code, hostAlive: true });
    };
    const timer = setTimeout(() => done('probe_timeout'), timeoutMs);
    try {
      child = fork(CHILD_ENTRY, {
        serialization: 'advanced',
        execArgv: [`--max-old-space-size=${RESUME_WORKER_HEAP_CAP_MB}`, '--max-semi-space-size=32', ...CHILD_PERM_ARGS],   // r5:同生产形,不继承宿主 loader
        env: childEnv(),
        stdio: CHILD_STDIO,
      });
    } catch { done('child_start_failed'); return; }
    if (child.pid != null) setChildOomScoreAdj(child.pid);
    child.stderr?.resume();
    activeIpcRun = {
      kill: () => { try { child?.kill('SIGKILL'); } catch { /* 已退 */ } },
      onCrash: () => done('child_crash'),
    };
    child.on('message', () => done('unexpected_message'));
    child.on('error', () => { /* 畸形帧路径 error 不触发;真触发=非守卫错误,交 guard/exit */ });
    child.on('exit', () => { /* guard 先 settle child_crash;若 guard 未拦(宿主本会 EXIT)则此处不会执行——proof 以"宿主还活着"为前提 */ done('exit_no_result'); });
    child.send({ kind: 'corrupt_ipc', buffer: Buffer.alloc(0), textCap: 0 });
  });
}
