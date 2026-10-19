/**
 * resume-extract worker(#108 解析真终止):pdf/docx CPU 重活搬进 isolate,宿主 terminate 即真死——
 * 8s 竞速到点后僵尸解析占事件循环/占解析槽的面就此闭合(槽位释放=解析真死,F2 不变量恢复)。
 * 错误通道:结构化 postMessage{ok:false,code,message}——Error 自定义属性(如 .code)不跨线程存活,
 * 宿主按 code 重建错误对象(encrypted 码跨 worker 保真,UC-E2E-015 E1 不静默降级)。
 * 本文件系 .ts:tsx(--require/--import)与 @swc-node/register(--import)两 loader 均经 execArgv
 * 继承传播到 worker(同版实测:tsx≈110ms/swc-node≈265ms 冷启)。
 */
import { parentPort } from 'node:worker_threads';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

const ENCRYPT_HINT = /encrypt|password|PasswordException|No password|need.?password/i;

function codeFor(e: unknown): string {
  const anyE = e as { code?: string; message?: string };
  if (anyE?.code === 'ERR_WORKER_OUT_OF_MEMORY') return 'extract_timeout';
  if (ENCRYPT_HINT.test(String(anyE?.message ?? ''))) return 'encrypted';
  return 'parse_failed';
}

parentPort?.on('message', async (m: { kind: 'pdf' | 'docx'; buffer: Buffer }) => {
  try {
    let text = '';
    if (m.kind === 'pdf') {
      const parser = new PDFParse({ data: new Uint8Array(m.buffer) });
      try {
        const r = await parser.getText();
        text = r?.text ?? '';
      } finally {
        await parser.destroy?.().catch(() => {});
      }
    } else {
      const r = await mammoth.extractRawText({ buffer: m.buffer });
      text = r?.value ?? '';
    }
    // heapUsed 随消息回带:帽值探针(resume-cap-probe)据此与 58-74MB 量基带交叉校验。
    parentPort?.postMessage({ ok: true, text, heapUsedMb: Math.round((process.memoryUsage().heapUsed / 1048576) * 10) / 10 });
  } catch (e) {
    parentPort?.postMessage({ ok: false, code: codeFor(e), message: String((e as Error)?.message ?? e) });
  }
});
