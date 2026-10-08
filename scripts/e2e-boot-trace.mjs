#!/usr/bin/env node
/**
 * G7P-2 装载钩子（wrapper code 截获刀）— NODE_OPTIONS `--import` 注入（追加不覆盖）。
 *
 * 三时间戳（REQUEST rev2 @064fc37e 唯一蓝本）：
 *   T1 tsx child process start  = 本钩子在 tsx 链进程内的首次求值（≈进程启动+node 引导开销）
 *   T2 full.e2e.ts entry onLoad = module hooks `load` 链上首次见到 URL 以 /e2e/full.e2e.ts 结尾
 *                                 （ESM 语义：entry onLoad 先于其静态 import 解析——T2≠依赖解析完成）
 *   T3 首测试行                  = 进程 stdout 首个以 ✓/✗ 起始的断言行被写出（首测试行完成的可观测面）
 *
 * 纪律：
 *   - 逐戳 appendFileSync 即时落盘（SIGKILL 安全非缓冲）至 `.tmp/e2e-boot-trace.json`（NDJSON 行流；
 *     文件名照蓝本，内容为换行分隔 JSON 对象——逐戳追加与跨线程并写的必然形态）。
 *   - 每行内嵌 run 身份：pid + ppid + 进程启动时刻（bootId=启动时刻.pid）+ argv 尾段（路径only·零 env 值）。
 *   - 钩子全程自守 try/catch：自守失败静默（不得制造新红；缺戳由四向判读以向 0 面如实处置）。
 *   - 本钩子零 stdout/stderr 写出（不混 stdout E2E_ 收据面；stderr 份在 isolated 链为死信——文件份为准）。
 *   - 终端异常捕获：uncaughtExceptionMonitor 零语义扰动记录（monitor 后默认崩溃照常——退出码/原生打印
 *     不变；冒烟已证 rethrow 形态会把 EXIT 1→7 违反原语义，弃用）·unhandledRejection 默认 throw 模式
 *     升级为 uncaught exception ⇒ 同 monitor 面覆盖；stderr.write 包裹分类 ERR_*
 *     （ERR_MODULE_NOT_FOUND/ERR_UNSUPPORTED_DIR_IMPORT/编译类）；hooks 链 resolve/load 失败原码捕获后
 *     原样 rethrow（装载类异常码的文件份权威来源）。
 *   - run 前 unlink 陈旧文件由外部 orchestrate 负责（钩子只追加·绝不 unlink/截断——tsx cli 父进程与
 *     entry 孙进程两度装载本钩子，若钩子自 unlink 会吞掉首进程 T1）。
 *   - 本文件为零产品码刀面：仅当 E2E_BOOT_TRACE=1 经 run-e2e.mjs flag 门控以 NODE_OPTIONS --import 注入。
 */
import { appendFileSync, mkdirSync } from 'node:fs';
import { register } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { threadId } from 'node:worker_threads';

const TRACE_PATH = join(dirname(dirname(fileURLToPath(import.meta.url))), '.tmp', 'e2e-boot-trace.json');
const ENTRY_SUFFIX = '/e2e/full.e2e.ts';

// run 身份：启动时刻 + pid（每钩子承载进程一枚；receipt 以 argv 区分 tsx-cli 父 / entry 孙）。
const BOOT_AT = new Date().toISOString();
const BOOT_ID = `${Date.now()}.${process.pid}`;

function stamp(evt, extra = {}) {
  // 自守：任何失败（.tmp 不可写等）静默——绝不向被测进程注入新红。
  try {
    appendFileSync(TRACE_PATH, JSON.stringify({ evt, at: new Date().toISOString(), bootId: BOOT_ID, pid: process.pid, ppid: process.ppid, tid: threadId, ...extra }) + '\n');
  } catch { /* self-guarded: silent */ }
}

function errFace(err) {
  // 仅分类面（name/code/有限 message 头）——零行内容零 PII 纪律；原值 message 只留头部且仅入 .tmp 本地文件。
  return { name: err?.name ?? null, code: err?.code ?? undefined, messageHead: String(err?.message ?? '').slice(0, 160) };
}

let t2Stamped = false; // hooks 线程内一次性守卫

// ESM loader hooks（仅 hooks 线程被 module.register 调用；与 tsx loader 链式共存·纯 pass-through）。
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    stamp('resolve-error', { ...errFace(err), specifier: String(specifier).slice(0, 200) });
    throw err; // 原语义 rethrow
  }
}

export async function load(url, context, nextLoad) {
  let result;
  try {
    result = await nextLoad(url, context);
  } catch (err) {
    stamp('load-error', { ...errFace(err), url: String(url).slice(0, 200) });
    throw err; // 原语义 rethrow
  }
  try {
    if (!t2Stamped && String(url).endsWith(ENTRY_SUFFIX)) {
      t2Stamped = true;
      stamp('t2', { url: 'e2e/full.e2e.ts', note: 'entry onLoad fires before its static imports resolve' });
    }
  } catch { /* self-guarded */ }
  return result;
}

// 预载角色（--import 主线程）：T1 + hooks 注册 + T3/stderr 包裹 + 终端异常捕获。
// hooks 线程（threadId>0）只提供上方 hooks 导出，不重复副作用。
if (threadId === 0) {
  try { mkdirSync(dirname(TRACE_PATH), { recursive: true }); } catch { /* self-guarded */ }
  const argvTail = process.argv.slice(1, 8).map((a) => String(a).slice(0, 200));
  const face = argvTail.some((a) => a.endsWith('tsx/dist/cli.mjs'))
    ? 'tsx-cli-process'
    : argvTail.some((a) => a.endsWith(ENTRY_SUFFIX))
      ? 'tsx-runner-entry-process'
      : 'other';
  stamp('t1', { face, argvTail, flag: 'E2E_BOOT_TRACE(name-only)' }); // T1：本进程首 JS 求值 ≈ process start
  try {
    register(import.meta.url, { data: { role: 'hooks' } });
  } catch (err) {
    stamp('selfguard-register-failed', errFace(err));
  }

  // T3：首测试行 = 首个以 ✓/✗ 起始的 stdout 断言行（console.log 经 process.stdout.write；chunk 边界跨写累积）。
  try {
    const origStdoutWrite = process.stdout.write.bind(process.stdout);
    let pending = '';
    let t3Stamped = false;
    process.stdout.write = function patchedStdoutWrite(chunk, ...rest) {
      try {
        if (!t3Stamped) {
          pending = (pending + String(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8'))).slice(-64);
          // console.log 的单次 write 以换行符收尾——先剥行尾再取「最后一行行首」。
          const body = pending.endsWith('\n') ? pending.slice(0, -1) : pending;
          const lineStart = body.slice(body.lastIndexOf('\n') + 1);
          if (lineStart.startsWith('✓') || lineStart.startsWith('✗')) {
            t3Stamped = true;
            stamp('t3', { marker: lineStart.slice(0, 1), note: 'first assertion line on stdout' });
          }
        }
      } catch { /* self-guarded */ }
      return origStdoutWrite(chunk, ...rest);
    };
  } catch (err) {
    stamp('selfguard-stdout-wrap-failed', errFace(err));
  }

  // stderr 死信分类（isolated 链 stderr 被丢弃；此面仅辅助——文件份/hooks 捕获为准）。
  try {
    const origStderrWrite = process.stderr.write.bind(process.stderr);
    const seenCodes = new Set();
    process.stderr.write = function patchedStderrWrite(chunk, ...rest) {
      try {
        const text = String(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8'));
        for (const code of ['ERR_MODULE_NOT_FOUND', 'ERR_UNSUPPORTED_DIR_IMPORT']) {
          if (text.includes(code) && !seenCodes.has(code)) {
            seenCodes.add(code);
            stamp('stderr-classified', { code, via: 'stderr-write-wrap' });
          }
        }
        if (!seenCodes.has('compile-ish') && /Transform failed|Unexpected token|SyntaxError|Cannot use import statement/.test(text)) {
          seenCodes.add('compile-ish');
          stamp('stderr-classified', { code: 'compile-ish', via: 'stderr-write-wrap' });
        }
      } catch { /* self-guarded */ }
      return origStderrWrite(chunk, ...rest);
    };
  } catch (err) {
    stamp('selfguard-stderr-wrap-failed', errFace(err));
  }

  try {
    // 终端异常捕获·零语义扰动形态：仅挂 uncaughtExceptionMonitor（Node ≥13.6 专用监听面——
    // monitor 运行后默认崩溃语义照常，不改变退出码/原生打印；冒烟已证 rethrow 形态会把 EXIT 1→7，弃用）。
    // unhandledRejection 默认 throw 模式会升级为 uncaught exception ⇒ 同一 monitor 面覆盖，无需另挂。
    process.on('uncaughtExceptionMonitor', (err) => stamp('uncaughtException', errFace(err)));
    process.on('exit', (code) => stamp('exit', { code: code === null || code === undefined ? null : Number(code) }));
  } catch (err) {
    stamp('selfguard-handlers-failed', errFace(err));
  }
}
