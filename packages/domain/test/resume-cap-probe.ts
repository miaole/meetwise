/**
 * resume-cap-probe(#108 帽值定值探针·EXEC 义务·沿 rev2.2 探针形):
 *  ①构造 8MB 文本充实合法 PDF(手构 xref 零依赖·禁 recovery)→帽值阶梯探针→最小成功帽=定帽下界;
 *  ②与双审实测量基带 58-74MB 交叉校验(成功 heapUsed 低于带下界=fixture 代表性不足→FAIL);
 *  ③terminate 语义臂:短超时+8MB→extract_timeout 且宿主存活(#108 真终止)。
 *  运行:cd packages/domain && node_modules/.bin/tsx test/resume-cap-probe.ts(隔离零外呼)。
 */
import { probeExtractWithCap } from '../src/resume-extract.ts';

const n0 = Date.now();
function craftTextHeavyPdf(targetBytes: number): Buffer {
  const line = (i: number) => `BT /F1 12 Tf 72 742 Td (work experience item ${i}: backend distributed systems rate limiting and idempotency) Tj ET\n`;
  let content = '';
  let i = 0;
  while (content.length < targetBytes - 4096) content += line(i++);
  const objs: string[] = ['', '<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>', `<< /Length ${content.length} >>\nstream\n${content}\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  let out = '%PDF-1.4\n';
  const off: number[] = [0];
  for (let j = 1; j <= 5; j++) { off[j] = out.length; out += `${j} 0 obj\n${objs[j]}\nendobj\n`; }
  const xref = out.length;
  out += 'xref\n0 6\n0000000000 65535 f \n' + off.slice(1).map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  out += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(out, 'latin1');
}

const pdf = craftTextHeavyPdf(8 * 1024 * 1024);
console.log(`[probe] fixture=${(pdf.length / 1048576).toFixed(2)}MB 构造耗时=${Date.now() - n0}ms`);

const BAND_FLOOR_MB = 58;   // 双审席2 实测量基带下界(真 8MB PDF heapUsed 58-74MB)——帽解低于此=系统性误杀面
const LADDER = [64, 96, 128, 192, 256];
let minSucceed: number | null = null;
for (const cap of LADDER) {
  const r = await probeExtractWithCap(pdf, 'pdf', cap, 120000);
  console.log(`[probe] cap=${cap}MB → ok=${r.ok} code=${r.code ?? '-'} heapUsed=${r.heapUsedMb ?? '-'}MB ms=${r.ms}`);
  if (r.ok && r.heapUsedMb != null) {
    if (r.heapUsedMb < BAND_FLOOR_MB) { console.error(`[probe] FAIL:成功 heapUsed ${r.heapUsedMb}MB < 量基带下界 ${BAND_FLOOR_MB}MB——fixture 代表性不足`); process.exit(1); }
    if (minSucceed == null) minSucceed = cap;
  }
}
if (minSucceed == null) { console.error('[probe] FAIL:全阶梯无成功——帽值下界不可定'); process.exit(1); }

// terminate 语义臂:1024MB 帽(排除 OOM 干扰)+500ms 超时 → extract_timeout 且本进程存活可继续执行
const t0 = Date.now();
const killArm = await probeExtractWithCap(pdf, 'pdf', 1024, 500);
const hostAlive = killArm.code === 'extract_timeout' && Date.now() - t0 < 5000;
console.log(`[probe] terminate 臂: code=${killArm.code} ms=${Date.now() - t0} hostAlive=${hostAlive}`);
if (!hostAlive) { console.error('[probe] FAIL:terminate 语义臂未达 extract_timeout 或宿主异常'); process.exit(1); }

const recommend = Math.max(minSucceed, Math.ceil(BAND_FLOOR_MB / 32) * 32);   // 成功下界与量基带取大(32MB 步进)
console.log(`[probe] RESULT: minSucceedCap=${minSucceed}MB · recommend=${recommend}MB · 与 58-74MB 量基带交叉校验通过`);
console.log(`[probe] RESUME_WORKER_HEAP_CAP_MB 建议值=${recommend}(生产默认再由协调方按余量裁量)`);
