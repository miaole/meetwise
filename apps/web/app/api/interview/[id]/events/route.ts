import { getServerToken } from '../../../../../lib/api/server';
import { sseProxyFailureResponse } from '../../../../../lib/stream/sse-cursor';

/**
 * 同源 SSE 代理(修审计 P0:面试流原来硬编码 x-user-id:'demo' 未鉴权)。
 * 浏览器同源自动带 httpOnly cookie → 本路由服务端读令牌 → 加 Bearer 透传上游 api 的 SSE 流。
 * client 因此无需(也读不到)令牌,鉴权是真的。
 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
export const dynamic = 'force-dynamic';

const STRESS_ID = '__e2e_stream_stress__';
const STRESS_TURNS = 10_000;
// G3 BEGIN-GUARD #161/#256（REQUEST §2.10 明示属本刀）e2e-guard-only 变体 id 族：
// - progress：connecting 期先推 generation_progress 帧 → 分块停顿 → question_ready(携 plannedTurns) → report_ready。
//   分块+延迟发射让浏览器断言能在「connecting+进度」「进题+徽标」「终态」三拍上停住（W3 臂1/臂2+W4 面板断言注入源）。
// - silent：零帧变体——全程无 generation_* 帧，验证 connecting 静态文案逐字兜底（W3 臂3）+ plannedTurns 缺失降级（W4）。
//   门语义零降级：同样要求构建期内联 __E2E_UI_STRESS__==='1' 且持有正常 httpOnly 会话，门外生产代理路径零触碰。
// 【#65 裁决项⑤「移出生产构建」形·5E 2026-10-12】门由旧「仅靠运行时 env（E2E_UI_STRESS）」改为
// next build 期内联字面量 __E2E_UI_STRESS__（next.config.mjs env 键·global.d.ts 声明）：
// 生产构建（无 E2E_UI_STRESS）内联 '0' → 下方守卫分支静态假 → 打包器死码剔除=压测/守卫数据源
// 移出生产构建；e2e-ui runner build/start 两阶段均显式置 E2E_UI_STRESS='1' → 内联 '1'，
// 既有 spec（stream-window.spec.ts 等消费 __e2e_stream_* id）零改零回归。
const STRESS_PROGRESS_ID = '__e2e_stream_progress__';
const STRESS_SILENT_ID = '__e2e_stream_silent__';

/**
 * Hermetic browser-only pressure source. It is unavailable unless the e2e runner explicitly enables it, still
 * requires the normal httpOnly session, and contains no production/user data. It exercises the actual SSE decoder,
 * reducer, rAF bridge and InterviewPanel DOM window instead of calling a helper in isolation.
 */
function e2eStressStream(lastEventId: number, duplicateFrames: boolean): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const start = Math.max(1, lastEventId + 1);
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (let batchStart = start; batchStart <= STRESS_TURNS; batchStart += 100) {
        const batchEnd = Math.min(STRESS_TURNS, batchStart + 99);
        let payload = '';
        for (let id = batchStart; id <= batchEnd; id++) {
          payload += `id: ${id}\nevent: question_ready\ndata: ${JSON.stringify({ question: `压力回放题 ${id}`, competency: 'stream-stress' })}\n\n`;
        }
        // Browser transport, proxies and reconnect glue may redeliver an
        // already persisted SSE frame.  The E2E-only source makes that race
        // reproducible without changing any production event semantics.
        controller.enqueue(encoder.encode(duplicateFrames ? payload + payload : payload));
      }
      if (lastEventId < STRESS_TURNS + 1) {
        const terminal = `id: ${STRESS_TURNS + 1}\nevent: report_ready\ndata: {"overall":88}\n\n`;
        controller.enqueue(encoder.encode(duplicateFrames ? terminal + terminal : terminal));
      }
      controller.close();
    },
  });
}

/** #161 W3 臂1/臂2 注入源（e2e-guard-only）：三拍分块流——进度帧→出题(携 plannedTurns)→终态。 */
function e2eProgressStream(): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const enqueue = (s: string) => controller.enqueue(encoder.encode(s));
      // 拍1：connecting 期真实进度帧（段=检索素材、已 3 秒——view-model connecting 臂拼帧文案的原料）。
      enqueue(`id: 1\nevent: generation_progress\ndata: ${JSON.stringify({ attemptKey: 'e2e-progress', stage: 'retrieve', elapsedMs: 3000 })}\n\n`);
      // 拍2：出题（携带 plannedTurns=5 = #256 形制 A 发射面；turn=0 → 徽标 1 基「第 1 题」）。
      setTimeout(() => {
        enqueue(`id: 2\nevent: question_ready\ndata: ${JSON.stringify({ question: '进度预演题：讲一个你主导的线上事故复盘。', competency: 'stream-progress', questionId: 'q-v2-t0-c0', stateVersion: 2, turn: 0, qkind: 'fundamental', plannedTurns: 5 })}\n\n`);
        // 拍3：终态收口（复用既有 report_ready 渲染）。
        setTimeout(() => {
          enqueue(`id: 3\nevent: report_ready\ndata: ${JSON.stringify({ overall: 88 })}\n\n`);
          controller.close();
        }, 2500);
      }, 2500);
    },
  });
}

/** #161 W3 臂3「零帧变体」注入源（e2e-guard-only）：无任何 generation_* 帧 + question_ready 无 plannedTurns。 */
function e2eSilentStream(): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const enqueue = (s: string) => controller.enqueue(encoder.encode(s));
      // 先静默停 2.5s：断言 connecting 静态文案逐字（零进度帧不拼帧、不空转不编造）。
      setTimeout(() => {
        enqueue(`id: 1\nevent: question_ready\ndata: ${JSON.stringify({ question: '静默连接题：零进度帧时连接文案保持静态兜底。', competency: 'stream-silent', questionId: 'q-v3-t0-c0', stateVersion: 3, turn: 0 })}\n\n`);
        setTimeout(() => {
          enqueue(`id: 2\nevent: report_ready\ndata: ${JSON.stringify({ overall: 77 })}\n\n`);
          controller.close();
        }, 2500);
      }, 2500);
    },
  });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) return new Response('unauthorized', { status: 401 });
  const lastEventId = Number(req.headers.get('last-event-id') ?? '0') || 0;
  // G3：同门扩两个 e2e-guard-only 变体 id（progress/silent——W3 三臂/W4 面板断言注入源·§2.10 属本刀）。
  // #65：门=构建期内联常量（见文件头注）——生产构建此处为 '0'==='1' 恒假+死码剔除。
  if ((id === STRESS_ID || id === STRESS_PROGRESS_ID || id === STRESS_SILENT_ID) && __E2E_UI_STRESS__ === '1') {
    if (id === STRESS_PROGRESS_ID) {
      return new Response(e2eProgressStream(), {
        status: 200,
        headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive' },
      });
    }
    if (id === STRESS_SILENT_ID) {
      return new Response(e2eSilentStream(), {
        status: 200,
        headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive' },
      });
    }
    const duplicateFrames = new URL(req.url).searchParams.get('duplicateFrames') === '1';
    return new Response(e2eStressStream(lastEventId, duplicateFrames), {
      status: 200,
      headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive' },
    });
  }
  const headers: Record<string, string> = { authorization: `Bearer ${token}`, accept: 'text/event-stream' };
  const lastEventIdHeader = req.headers.get('last-event-id');
  if (lastEventIdHeader) headers['last-event-id'] = lastEventIdHeader;     // 续传水位透传
  const upstream = await fetch(`${API}/interview/${encodeURIComponent(id)}/events`, { headers, signal: req.signal });
  if (!upstream.ok || !upstream.body) return sseProxyFailureResponse(upstream);
  return new Response(upstream.body, {                          // 透传 SSE 流(ReadableStream)
    status: 200,
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive' },
  });
}
