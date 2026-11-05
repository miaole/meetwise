/**
 * STALE_BUILD_GUARD 构建复用判定（既有构建是否符合本次 runner 意图）——run-e2e-ui.mjs 的唯一裁决来源。
 *
 * 事故机制（perf-suite 步1/步4 形）：`pnpm verify:e2e-performance` 步1 `pnpm -C apps/web build` 不带
 * E2E_UI_STRESS → next.config.mjs compiler.define 构建期内联 `__E2E_UI_STRESS__='0'` →
 * app/api/interview/[id]/events/route.ts 压测分支静态假 → 打包器死码剔除（压测源三函数出包）；
 * 步4 `pnpm e2e:ui:isolated` 的 STALE_BUILD_GUARD 旧判只看 BUILD_ID mtime 新鲜 → 误复用这份无压测源
 * 生产构建 → 压测 SSE 请求落真 API 代理零帧 → stream-window 用例饿死假红。修法=守卫在复用前加
 * 「意图判」：runner 需要（或不需要）压测源时，递归扫编译产物验证压测源在/不在，不符即强制重建。
 * 步1 生产构建零触（不被测试开关污染），守卫只拒绝误复用。
 *
 * 检测串选型（防守卫自身假阳/假阴·两形构建产物实测）：
 * - 用「服务端压测载荷串」：三变体注入函数体内字符串字面量（e2eStressStream/e2eProgressStream/
 *   e2eSilentStream·events/route.ts）。压测构建=逐串恰在服务产物 1 文件命中；生产构建=死码剔除后
 *   全零命中。字符串字面量经压缩/拆 chunk 原样保留，递归扫 .next/server 全目录防 chunk 拆分假阴。
 * - 弃「压测 id 串」`__e2e_stream_*__`：id 族在 clean 生产构建仍被服务端组件页 bundle（app/interview/
 *   [resultId]/page.tsx 无 'use client'·经运行时门 process.env.E2E_UI_STRESS 引用 id 数组）保留在
 *   .next/server → 检测必假阳（误判 clean 构建为压测构建=事故面复现）。
 * - 扫描面限 `.next/server`（服务产物 canonical 位）：`.next/cache` 系构建缓存（含源码缓存·clean
 *   构建也可能留痕）不入扫面防假阳；`.next/standalone` 系同产物派生副本不另扫。
 * - 中文载荷串若未来打包器翻成 unicode 转义序列（\u 前缀形）→ 扫描读不到 → 判缺源 → 重建（fail-safe
 *   方向=多花重建耗时，不产生「无压测源被当压测构建服务」的错误复用）。
 *
 * 分工：decideBuildReuse 是由输入决定输出的纯函数（无 IO），全部判定都在这里；evaluateExistingBuild
 * 只读盘收集 BUILD_ID 时间与产物扫描结果再交给它。runner 只提供 HEAD 时间与压测意图、调用
 * evaluateExistingBuild、按返回值打日志和执行构建，不留判定逻辑。三者无浏览器/git 依赖，proof 用临时
 * 目录 + 真实模块 import 直测，并把 runner 的判定段截出来跑在假 .next 与替身 build 上。
 *
 * 落位说明：本模块是 run-e2e-ui.mjs 的运行时依赖，不是本目录多数件那样的静态守卫；目录契约的
 * REQUIRED_PLATFORM_FILES 只列必需件、不穷举目录，故不在其中登记。
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 服务端独有压测载荷串（events/route.ts 三变体注入源各一）：
 * - 压力回放题：e2eStressStream（`__e2e_stream_stress__` 压测回放源·stream-window 用例数据面）
 * - 进度预演题：e2eProgressStream（`__e2e_stream_progress__` 三拍分块源）
 * - 静默连接题：e2eSilentStream（`__e2e_stream_silent__` 零帧变体源）
 * 全在才判「压测源在」（三变体注入源任一缺=构建意图不完整·stream-window 之外 W3/W4 臂同样消费）。
 */
export const STRESS_BUILD_MARKERS = Object.freeze(['压力回放题', '进度预演题', '静默连接题']);

/**
 * 递归扫 `apps/web/.next/server` 下全部 .js 文件判压测载荷串在/不在。
 * 目录缺/读失败/单文件读失败均按「未见该串」计（缺源方向 fail-safe=触发重建，不误判在）。
 * 只扫 .js：编译服务产物形；.txt/.json 等含串不计（防未来 manifest 误带串假阳）。
 * scannedFiles 只计真正读到内容的 .js，读失败的不计。
 */
export function scanServerStressMarkers(serverDir) {
  const missing = new Set(STRESS_BUILD_MARKERS);
  let scannedFiles = 0;
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (missing.size === 0) return;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
      let text;
      try {
        text = readFileSync(full, 'utf8');
      } catch {
        continue;
      }
      scannedFiles += 1;
      for (const marker of missing) {
        if (text.includes(marker)) missing.delete(marker);
      }
    }
  };
  walk(serverDir);
  return {
    present: missing.size === 0,
    missing: STRESS_BUILD_MARKERS.filter((marker) => missing.has(marker)),
    scannedFiles,
  };
}

const NO_BUILD_LOG = 'E2E-UI: 无 .next/BUILD_ID，先 next build 再 next start…';
const FORCED_BUILD_LOG = 'E2E-UI: STALE_BUILD_GUARD 判定重建(陈旧/缺压测源) → 强制 next build…';

/**
 * 复用/重建判定（纯函数：输出只由入参决定）。优先级自上而下：
 * - buildIdExists=false → 重建（产物缺失）。
 * - BUILD_ID mtime 早于 HEAD commit time → 重建（陈旧构建假红防线）。两个时间任一不可得时跳过本判并
 *   告警（fail-open：git 不可用/非 git 树/mtime 读失败不单凭新鲜度强拆既有构建），后续意图判照检。
 * - stressExpected=true 且压测源不在 → 重建（无压测源构建被压测 runner 复用=压测 SSE 零帧假红）。
 * - stressExpected=false 且压测源在 → 重建（压测源不进非压测服务面）。
 * - 其余 → 复用。
 * stressScan 缺失或 present 非 true 一律按「压测源不在」计。
 * 返回 { rebuild, reason, warnings, buildLog }：warnings 是调用方须原样告警的行，buildLog 是开始构建前的
 * 日志行（不重建时为 null）。
 */
export function decideBuildReuse({ buildIdExists, buildIdMtimeMs = null, headTimeSec = null, stressExpected, stressScan = null }) {
  if (!buildIdExists) return { rebuild: true, reason: 'build_id_missing', warnings: [], buildLog: NO_BUILD_LOG };
  const headKnown = typeof headTimeSec === 'number' && headTimeSec > 0;
  const mtimeKnown = typeof buildIdMtimeMs === 'number' && Number.isFinite(buildIdMtimeMs);
  const stressSourcePresent = stressScan?.present === true;
  const warnings = [];
  if (!headKnown) {
    warnings.push('E2E-UI: STALE_BUILD_GUARD HEAD commit time 不可得(git 不可用/非 git 树)→ 新鲜度判按现行为服务既有构建(压测意图判照检)');
  } else if (!mtimeKnown) {
    warnings.push('E2E-UI: STALE_BUILD_GUARD BUILD_ID mtime 读取失败 → 新鲜度判按现行为服务既有构建(压测意图判照检)');
  }
  const rebuild = (reason, warning) => ({ rebuild: true, reason, warnings: [...warnings, warning], buildLog: FORCED_BUILD_LOG });
  if (headKnown && mtimeKnown && buildIdMtimeMs / 1000 < headTimeSec) {
    return rebuild('stale_vs_head', `E2E-UI: STALE_BUILD_GUARD .next/BUILD_ID mtime=${new Date(buildIdMtimeMs).toISOString()} 早于 HEAD commit time=${new Date(headTimeSec * 1000).toISOString()} → 强制重建(防陈旧构建假红)`);
  }
  if (stressExpected === true && !stressSourcePresent) {
    const missing = stressScan?.missing ?? [];
    return rebuild('stress_source_missing', `E2E-UI: STALE_BUILD_GUARD 既有构建缺压测源(.next/server 未见 e2e-guard-only 压测载荷${missing.length ? `·缺 ${missing.join('/')}` : ''}·疑无 E2E_UI_STRESS 生产构建)→ 强制重建(防误复用后压测 SSE 零帧假红)`);
  }
  if (stressExpected === false && stressSourcePresent) {
    return rebuild('stress_source_unexpected', 'E2E-UI: STALE_BUILD_GUARD 既有构建携压测源而本次意图不含压测 → 强制重建(压测源不进非压测服务面)');
  }
  return { rebuild: false, reason: 'reuse', warnings, buildLog: null };
}

/**
 * 读盘收集判定输入并裁决：webDir 下 .next/BUILD_ID 的存在与 mtime、.next/server 的扫描结果。
 * 本函数不做判定，全部判定在 decideBuildReuse。
 */
export function evaluateExistingBuild({ webDir, headTimeSec = null, stressExpected }) {
  const buildIdPath = join(webDir, '.next', 'BUILD_ID');
  let buildIdMtimeMs = null;
  try {
    buildIdMtimeMs = statSync(buildIdPath).mtimeMs;
  } catch {
    // 读失败=时间不可得，交决策函数按 fail-open 处理。
  }
  return decideBuildReuse({
    buildIdExists: existsSync(buildIdPath),
    buildIdMtimeMs,
    headTimeSec,
    stressExpected,
    stressScan: scanServerStressMarkers(join(webDir, '.next', 'server')),
  });
}
