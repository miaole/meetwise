/**
 * STALE_BUILD_GUARD 意图判（既有构建是否符合本次 runner 意图）纯函数模块——run-e2e-ui.mjs 消费。
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
 * - 弃「压测 id 串」`__e2e_stream_*__`：clean 生产构建的 app/interview/[resultId] 客户端 chunk 仍保留
 *   该 id 族（构造跳转 URL 用）→ 检测必假阳（误判 clean 构建为压测构建=事故面复现）。
 * - 扫描面限 `.next/server`（服务产物 canonical 位）：`.next/cache` 系构建缓存（含源码缓存·clean
 *   构建也可能留痕）不入扫面防假阳；`.next/standalone` 系同产物派生副本不另扫。
 * - 中文载荷串若未来打包器翻成 unicode 转义序列（\u 前缀形）→ 扫描读不到 → 判缺源 → 重建（fail-safe
 *   方向=多花重建耗时，不产生「无压测源被当压测构建服务」的错误复用）。
 *
 * 决策函数为纯函数（无 IO），扫描函数只读本地 .next/server——两者无浏览器/无子进程依赖，proof 可
 * 直测（fixtures 临时目录 + 真实模块 import，非源码副本同构评估）。
 */
import { readdirSync, readFileSync } from 'node:fs';
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
      scannedFiles += 1;
      let text;
      try {
        text = readFileSync(full, 'utf8');
      } catch {
        continue;
      }
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

/**
 * 复用/重建决策（纯函数·run-e2e-ui.mjs 唯一裁决入口）。
 * - buildIdExists=false → 重建（产物缺失）。
 * - BUILD_ID mtime 早于 HEAD commit time（双值齐且有效才判·任一不可得跳过新鲜度判=既有 fail-open
 *   语义保持：git 不可用/非 git 树/mtime 读失败不单凭新鲜度强拆既有构建）→ 重建（陈旧构建假红防线）。
 * - stressExpected=true 且压测源不在 → 重建（意图不符：无压测源构建被压测 runner 复用=压测 SSE 零帧假红）。
 * - stressExpected=false 且压测源在 → 重建（反向意图：压测源不进非压测服务面）。
 * - 其余 → 复用。
 */
export function decideBuildReuse({ buildIdExists, buildIdMtimeMs = null, headTimeSec = null, stressExpected, stressSourcePresent }) {
  if (!buildIdExists) return { reuse: false, reason: 'build_id_missing' };
  if (
    typeof headTimeSec === 'number' && headTimeSec > 0
    && typeof buildIdMtimeMs === 'number' && buildIdMtimeMs / 1000 < headTimeSec
  ) {
    return { reuse: false, reason: 'stale_vs_head' };
  }
  if (stressExpected === true && stressSourcePresent !== true) return { reuse: false, reason: 'stress_source_missing' };
  if (stressExpected === false && stressSourcePresent === true) return { reuse: false, reason: 'stress_source_unexpected' };
  return { reuse: true, reason: 'reuse' };
}
