/**
 * 流式语音(刚需:电话面试低延迟 + 打断 barge-in)。把整句 ASR/TTS 升级为增量流。
 *  - StreamingAsr: 音频流 → 增量转写(partial…→final),边说边出字。
 *  - StreamingTts: 文本 → 音频块流,边合成边播(低延迟,不等整段)。
 *  - **barge-in**: 用户开口(VAD 触发)→ 打断正在播的 TTS(真人对话感)。
 * seam 可换:fake 用于 gate;dashscope 流式(qwen3-asr WebSocket / cosyvoice 流式)是生产实现(下一步接 WS)。
 * 内核不变:最终转写仍只是"答案",喂同一面试图——流式只是边缘 I/O 升级,modality-agnostic 不破。
 */
export interface AsrEvent { text: string; final: boolean }
export interface StreamingAsr { readonly id: string; transcribeStream(chunks: AsyncIterable<Uint8Array>, signal?: AbortSignal): AsyncIterable<AsrEvent> }
export interface StreamingTts { readonly id: string; synthesizeStream(text: string, signal?: AbortSignal): AsyncIterable<Uint8Array> }

/** fake 流式 ASR:每收一块吐一个 partial,流尽吐 final。 */
export function fakeStreamingAsr(finalText: string): StreamingAsr {
  return {
    id: 'fake-stream-asr',
    async *transcribeStream(chunks) {
      let n = 0;
      for await (const _ of chunks) { n++; yield { text: finalText.slice(0, Math.min(finalText.length, n * 4)), final: false }; }
      yield { text: finalText, final: true };
    },
  };
}

/** fake 流式 TTS:把文本切块吐出;signal abort 即停(支持 barge-in 打断)。 */
export function fakeStreamingTts(chunk = 5): StreamingTts {
  return {
    id: 'fake-stream-tts',
    async *synthesizeStream(text, signal) {
      for (let i = 0; i < text.length; i += chunk) {
        if (signal?.aborted) return;                                  // 被打断 → 立即停播
        yield new TextEncoder().encode(text.slice(i, i + chunk));
      }
    },
  };
}

/**
 * 真流式 ASR(DashScope 实时 WebSocket,已实测握手通)。协议:连接→run-task→task-started→流式发 PCM→result-generated(增量)→finish-task→task-finished。
 * 把 WS 事件桥成 async generator(边收边 yield),音频发送并发跑。
 */
export function dashscopeStreamingAsr(cfg: { apiKey?: string; url?: string; model?: string; sampleRate?: number } = {}): StreamingAsr {
  const apiKey = cfg.apiKey ?? process.env.MODEL_API_KEY;
  const url = cfg.url ?? 'wss://dashscope.aliyuncs.com/api-ws/v1/inference';
  const model = cfg.model ?? process.env.STREAM_ASR_MODEL ?? 'paraformer-realtime-v2';
  const sampleRate = cfg.sampleRate ?? 16000;
  return {
    id: model,
    async *transcribeStream(chunks, signal) {
      if (!apiKey) throw new Error('streaming_asr_not_configured');
      const ws = new WebSocket(url, { headers: { Authorization: 'bearer ' + apiKey } } as any);
      const queue: AsrEvent[] = [];
      let done = false, err: Error | null = null, notify: (() => void) | null = null;
      const wake = () => { const n = notify; notify = null; n?.(); };
      const taskId = 'asr-' + Math.random().toString(36).slice(2);
      let onStarted: (() => void) | null = null;
      const startedP = new Promise<void>((r) => { onStarted = r; });
      ws.addEventListener('message', (e: any) => {
        if (typeof e.data !== 'string') return;
        let m: any; try { m = JSON.parse(e.data); } catch { return; }
        const ev = m.header?.event;
        if (ev === 'task-started') onStarted?.();
        else if (ev === 'result-generated') { const sent = m.payload?.output?.sentence; if (sent?.text != null) { queue.push({ text: sent.text, final: !!sent.sentence_end }); wake(); } }
        else if (ev === 'task-finished') { done = true; wake(); }
        else if (ev === 'task-failed') { err = new Error('asr_task_failed:' + (m.header?.error_message ?? '')); done = true; wake(); }
      });
      ws.addEventListener('error', () => { err ??= new Error('ws_error'); done = true; wake(); });
      ws.addEventListener('close', () => { done = true; wake(); });
      await new Promise<void>((res, rej) => { ws.addEventListener('open', () => res()); ws.addEventListener('error', () => rej(new Error('ws_open_failed'))); });
      ws.send(JSON.stringify({ header: { action: 'run-task', task_id: taskId, streaming: 'duplex' }, payload: { task_group: 'audio', task: 'asr', function: 'recognition', model, parameters: { sample_rate: sampleRate, format: 'pcm' }, input: {} } }));
      await startedP;
      void (async () => {   // 并发发音频
        try { for await (const ch of chunks) { if (signal?.aborted || done) break; ws.send(ch); } }
        finally { if (!done) ws.send(JSON.stringify({ header: { action: 'finish-task', task_id: taskId, streaming: 'duplex' }, payload: { input: {} } })); }
      })().catch(() => {});
      while (!done || queue.length) {
        if (queue.length) { yield queue.shift()!; continue; }
        if (err) break;
        await new Promise<void>((r) => { notify = r; });
      }
      try { ws.close(); } catch { /* ignore */ }
      if (err) throw err;
    },
  };
}
/**
 * 真流式 TTS(DashScope cosyvoice 实时 WebSocket,已实测出 25KB MP3)。协议:连接→run-task→task-started→continue-task(text)→finish-task;
 * 音频走**二进制帧**(result-generated 仅元数据)。边合成边吐音频块;signal abort 即停(支持 barge-in)。
 */
export function dashscopeStreamingTts(cfg: { apiKey?: string; url?: string; model?: string; voice?: string; format?: string } = {}): StreamingTts {
  const apiKey = cfg.apiKey ?? process.env.MODEL_API_KEY;
  const url = cfg.url ?? 'wss://dashscope.aliyuncs.com/api-ws/v1/inference';
  const model = cfg.model ?? process.env.STREAM_TTS_MODEL ?? 'cosyvoice-v1';
  const voice = cfg.voice ?? 'longxiaochun';
  const format = cfg.format ?? 'mp3';
  // 超时护栏(可调):任何 await 都不得无界阻塞——否则 WS 连同 HTTP 连接一起悬挂(审计 致命#1/#2)。
  const openMs = Number(process.env.STREAM_TTS_OPEN_MS) || 6000;     // 建连/握手
  const startMs = Number(process.env.STREAM_TTS_START_MS) || 8000;   // 等 task-started
  const idleMs = Number(process.env.STREAM_TTS_IDLE_MS) || 12000;    // 帧间空闲(防服务端中途静默)
  return {
    id: model,
    async *synthesizeStream(text, signal) {
      if (!apiKey) throw new Error('streaming_tts_not_configured');
      if (signal?.aborted) return;
      const ws = new WebSocket(url, { headers: { Authorization: 'bearer ' + apiKey } } as any);
      (ws as any).binaryType = 'arraybuffer';
      const queue: Uint8Array[] = [];
      let done = false, started = false, err: Error | null = null, notify: (() => void) | null = null;
      const wake = () => { const n = notify; notify = null; n?.(); };
      const taskId = 'tts-' + Math.random().toString(36).slice(2);
      let onStarted: (() => void) | null = null;
      const startedP = new Promise<void>((r) => { onStarted = r; });
      const onAbort = () => { done = true; wake(); };                 // 打断/挂断:干净停(不抛),finally 关 WS
      ws.addEventListener('message', (e: any) => {
        if (typeof e.data !== 'string') { queue.push(new Uint8Array(e.data)); wake(); return; }   // 音频二进制帧
        let m: any; try { m = JSON.parse(e.data); } catch { return; }
        const ev = m.header?.event;
        if (ev === 'task-started') { started = true; onStarted?.(); }
        else if (ev === 'task-finished') { done = true; wake(); }
        else if (ev === 'task-failed') { err = new Error('tts_task_failed:' + (m.header?.error_message ?? '')); done = true; wake(); }
      });
      ws.addEventListener('error', () => { err ??= new Error('ws_error'); done = true; wake(); });
      ws.addEventListener('close', () => { done = true; wake(); });
      try {
        signal?.addEventListener('abort', onAbort);
        // 1. 建连(带超时,防 TLS/WS 握手悬挂)
        await new Promise<void>((res, rej) => {
          const t = setTimeout(() => rej(new Error('ws_open_timeout')), openMs);
          ws.addEventListener('open', () => { clearTimeout(t); res(); });
          ws.addEventListener('error', () => { clearTimeout(t); rej(new Error('ws_open_failed')); });
        });
        if (signal?.aborted) return;
        ws.send(JSON.stringify({ header: { action: 'run-task', task_id: taskId, streaming: 'duplex' }, payload: { task_group: 'audio', task: 'tts', function: 'SpeechSynthesizer', model, parameters: { text_type: 'PlainText', voice, format, sample_rate: 22050 }, input: {} } }));
        // 2. 等 task-started(带超时,防服务端接了连接却永不就绪)
        await new Promise<void>((res, rej) => {
          if (started || done) return res();
          const t = setTimeout(() => rej(new Error('tts_started_timeout')), startMs);
          startedP.then(() => { clearTimeout(t); res(); });
          signal?.addEventListener('abort', () => { clearTimeout(t); res(); }, { once: true });
        });
        if (signal?.aborted || done) return;
        ws.send(JSON.stringify({ header: { action: 'continue-task', task_id: taskId, streaming: 'duplex' }, payload: { input: { text } } }));
        ws.send(JSON.stringify({ header: { action: 'finish-task', task_id: taskId, streaming: 'duplex' }, payload: { input: {} } }));
        // 3. 边收边吐(空闲超时兜底:帧间静默超 idleMs → 收尾,绝不无界等)
        while (!done || queue.length) {
          if (queue.length) { if (signal?.aborted) break; yield queue.shift()!; continue; }   // barge-in:abort 即停吐
          if (err) break;
          await new Promise<void>((r) => {
            let settled = false;
            const fin = () => { if (settled) return; settled = true; clearTimeout(t); r(); };
            notify = fin;
            const t = setTimeout(() => { err ??= new Error('tts_idle_timeout'); done = true; fin(); }, idleMs);
          });
        }
        if (err && !signal?.aborted) throw err;
      } finally {
        signal?.removeEventListener('abort', onAbort);
        try { ws.close(); } catch { /* ignore */ }                    // **finally**:正常完成/throw/.return()(for-await break)/abort 都关 WS,不漏连接
      }
    },
  };
}

export interface StreamTurnHooks { onTtsChunk?: (c: Uint8Array) => void; onPartial?: (t: string) => void; bargeIn?: Promise<void> }

/**
 * 实时一回合:流式播问题(可被 barge-in 打断)→ 流式识别用户答(边说边出 partial)→ final 转写。
 * 返回 { transcript(喂图), ttsInterrupted, partials }。
 */
export async function streamingVoiceTurn(
  deps: { asr: StreamingAsr; tts: StreamingTts }, question: string, userAudio: AsyncIterable<Uint8Array>, hooks: StreamTurnHooks = {},
): Promise<{ transcript: string; ttsInterrupted: boolean; partials: number }> {
  const ttsAbort = new AbortController();
  hooks.bargeIn?.then(() => ttsAbort.abort(), () => {});             // 用户开口 → 打断 TTS
  for await (const chunk of deps.tts.synthesizeStream(question, ttsAbort.signal)) hooks.onTtsChunk?.(chunk);
  const ttsInterrupted = ttsAbort.signal.aborted;

  let transcript = '', partials = 0;
  for await (const ev of deps.asr.transcribeStream(userAudio)) {
    if (ev.final) transcript = ev.text;
    else { partials++; hooks.onPartial?.(ev.text); }
  }
  return { transcript, ttsInterrupted, partials };
}
