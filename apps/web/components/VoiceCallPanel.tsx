'use client';
/**
 * 人机双向语音模式：AI 用 TTS 朗读，当前用户用本机麦克风作答，转写后提交、等下一题继续。
 * “单人”仅指一个本机麦克风采集轨，不是“只有人说话”。当前明确支持人↔AI 往返与用户抢话，
 * 但不是电话/会议接入：没有远端媒体轨、双人录音、说话人分离或逐词时间戳；这些能力未接入时必须保持关闭。
 * 不碰 SSE:复用父级 useInterviewStream 的 view/display(同一条流),自身只跑「说→听→转写→提交→下一题」的语音回合循环。
 *
 * 承重不变量(无死胡同 / 不静默卡死):
 *  - TTS 不可用(502/503)→ 跳过音频,题面始终在屏上可读,短暂停顿后照常进入录音。
 *  - ASR 不可用 → 显式提示 + 「切回打字」出口,不静默吞掉这一答。
 *  - 无麦克风权限 → 显式提示 + 「切回打字」,不无限等。
 *  - 静音自动停录(VAD)可能误判 → 永远提供手动「说完了」立即停。
 *  - 报告就绪 / 报告不可用 / 面试不可用 → 朗读收尾或给出路,结束语音会话,绝不空转。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { VOICE_CAPTURE_POLICY_VERSION } from '@meetwise/contracts';
import { Loader2, Mic, PhoneOff, Keyboard, Volume2, Square, CheckCircle2, AlertTriangle, RotateCcw, Sparkles } from 'lucide-react';
import type { InterviewView } from '@/lib/stream/interview-state';
import type { Display } from '@/lib/view-model';
import { buildTurnSubmission, type TurnSubmission } from '@/lib/interview/turn-submission';

/** Blob → base64(剥 data:URL 前缀)。FileReader 路径避免大数组 btoa 爆栈。 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result).split(',')[1] ?? '');
    fr.onerror = () => reject(new Error('read_failed'));
    fr.readAsDataURL(blob);
  });
}
/** base64 → Blob(TTS 返回的 wav 解码后播放)。 */
function base64ToBlob(b64: string, type: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}
/** 选浏览器支持的录音容器(Chrome/FF=webm,Safari=mp4)。ASR 端按 MIME 派生 format。 */
function pickRecMime(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const t of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']) {
    if (MediaRecorder.isTypeSupported?.(t)) return t;
  }
  return '';
}
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const WAVE_BARS = 28;        // 听音波形条数
const TTS_FIRST_BYTE_MS = 4500;  // 流式 TTS 首块超时 → 回落非流式(避免连不上时干等)
const TTS_STALL_MS = 8000;       // 起播后帧间静默超时 → 收尾进录音(防中途断流无限等)

// VAD / 录音参数
const SPEECH_ON = 0.025;     // RMS 语音起声阈值(归一化 0~1)
const SILENCE_MS = 1800;     // 说过话后,静音持续这么久 → 自动停
const MAX_REC_MS = 60_000;   // 单次录音硬上限,防永久录
const NO_SPEECH_HINT_MS = 9_000; // 这么久没听到声 → 提示(仍继续听,不自动结束)

type CallStatus =
  | 'consent_required' // 尚未确认本机单轨的人机语音处理范围
  | 'connecting'    // 等首题
  | 'speaking'      // AI 朗读题目
  | 'listening'     // 在听候选人说
  | 'transcribing'  // 转写中
  | 'submitting'    // 提交作答
  | 'thinking'      // 等下一题(服务端评估/出题)
  | 'mic_denied'    // 无麦克风权限
  | 'asr_down'      // ASR 不可用
  | 'question_unavailable' // 当前 question_ready 的服务端身份缺失/已失效，禁止猜 turn
  | 'submit_failed' // 保留同一 answerId/body，允许无损重试提交
  | 'degraded'      // 报告不可用 / 面试不可用 等终态降级
  | 'ended'         // 用户挂断
  | 'report';       // 报告就绪,语音会话正常收尾

const STATUS_LABEL: Record<CallStatus, string> = {
  consent_required: '需确认语音处理范围',
  connecting: '准备语音中…',
  speaking: 'AI 说话中',
  listening: '在听你说…',
  transcribing: '转写中…',
  submitting: '提交中…',
  thinking: 'AI 思考中…',
  mic_denied: '需要麦克风',
  asr_down: '语音转写暂不可用',
  question_unavailable: '题目身份不可用',
  submit_failed: '回答暂未提交',
  degraded: '面试已结束',
  ended: '语音已结束',
  report: '面试完成',
};

// 流式 TTS(cosyvoice MP3 + MSE)未经真机验证、"起播≠出声"风险高 → 默认关,走已验证的非流式 /speak。真机确认后改 true。
const ENABLE_STREAMING_TTS = false;

export function VoiceCallPanel({
  resultId, view, display, onSwitchToText,
}: { resultId: string; view: InterviewView; display: Display; onSwitchToText: () => void }) {
  const [status, setStatus] = useState<CallStatus>('consent_required');
  const [captureConsented, setCaptureConsented] = useState(false);
  const [level, setLevel] = useState(0);              // 实时麦克风电平 → 驱动脉冲/波形
  const [wave, setWave] = useState<number[]>(() => new Array(WAVE_BARS).fill(0)); // 滚动波形(右进左出)
  const [ttsPhase, setTtsPhase] = useState<'synth' | 'playing'>('synth');        // 朗读子态:合成中(微光)/播放中(声波)
  const [hint, setHint] = useState<string | null>(null);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);

  // 资源 / 取消引用
  const genRef = useRef(0);                            // 回合代次:挂断/卸载时 +1,作废所有在途异步
  // 不能只按 turns 数组下标去重：clarification_needed（同题澄清）会保留历史题、
  // 但服务端会签发新的 questionId/stateVersion/turn。若不按身份重开语音回合，
  // 用户会卡在“AI 思考中”，既不能重答也不能得到文字出口。
  const processedQuestionKeyRef = useRef<string | null>(null);
  const reportSpokenRef = useRef(false);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);   // 流式 TTS fetch 中断(挂断/切走/打断)
  const waveRef = useRef<number[]>(new Array(WAVE_BARS).fill(0));
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const manualStopRef = useRef<(() => void) | null>(null);
  const levelTsRef = useRef(0);
  const pendingSubmissionRef = useRef<TurnSubmission | null>(null);

  /** 用户抢话只停 AI 播放，不碰正在采集的麦克风；这才是全双工的 barge-in。 */
  const interruptAssistantSpeech = useCallback(() => {
    try { ttsAbortRef.current?.abort(); } catch { /* noop */ }
    try { audioElRef.current?.pause(); } catch { /* noop */ }
    setStatus('listening');
  }, []);

  const lastIdx = view.turns.length - 1;
  const canAnswer = display.action.kind === 'answer';

  /** 停录音 + 释放麦克风 + 关 AudioContext + 停 RAF(幂等)。 */
  const teardownAudioIo = useCallback(() => {
    if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    try { ttsAbortRef.current?.abort(); } catch { /* noop */ }     // 停流式 TTS 拉流
    ttsAbortRef.current = null;
    try { if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop(); } catch { /* noop */ }
    recorderRef.current = null;
    manualStopRef.current = null;
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* noop */ }
    streamRef.current = null;
    try { audioCtxRef.current?.close(); } catch { /* noop */ }
    audioCtxRef.current = null;
    try { audioElRef.current?.pause(); } catch { /* noop */ }
    audioElRef.current = null;
    waveRef.current = new Array(WAVE_BARS).fill(0);
    setLevel(0);
    setWave(new Array(WAVE_BARS).fill(0));
  }, []);

  /** 整体挂断:作废代次 + 拆资源。 */
  const hangup = useCallback(() => {
    genRef.current += 1;
    teardownAudioIo();
    setStatus('ended');
  }, [teardownAudioIo]);

  // 卸载即停,防麦克风红点常亮 / 死组件 setState
  useEffect(() => () => { genRef.current += 1; teardownAudioIo(); }, [teardownAudioIo]);

  /**
   * 流式 TTS:MSE 渐进播放 audio/mpeg 块,首音 ~1-2s(对比非流式整段 ~9s)。
   * 返回 'played'(成功播完/已起播,无需回落)| 'fallback'(没法流式,交给非流式 /speak)。
   * 失败回落只在"尚未起播"时发生(已起播再失败就地收尾,不重播扰民)。
   */
  const playStreamingTts = useCallback(async (text: string, gen: number): Promise<'played' | 'fallback'> => {
    // 能力门:浏览器需支持 MSE + MP3(Safari/旧浏览器不支持 → 直接回落)
    if (typeof MediaSource === 'undefined' || !(MediaSource.isTypeSupported?.('audio/mpeg'))) return 'fallback';
    const ac = new AbortController();
    ttsAbortRef.current = ac;
    let res: Response;
    try {
      res = await fetch(`/api/interview/${encodeURIComponent(resultId)}/speak/stream`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }), signal: ac.signal,
      });
    } catch { return gen === genRef.current ? 'fallback' : 'played'; }   // 取消/网络错:在途代次→回落;已切走→静默
    if (gen !== genRef.current) { try { ac.abort(); } catch { /* noop */ } return 'played'; }
    if (!res.ok || !res.body) return 'fallback';                          // 503/502/404 → 回落非流式

    const mediaSource = new MediaSource();
    const audio = new Audio();
    audio.src = URL.createObjectURL(mediaSource);
    audioElRef.current = audio;
    let started = false;   // 已起播标记:起播后失败不再回落(避免重播)

    try {
      await new Promise<void>((resolve, reject) => {
        let sb: SourceBuffer | null = null;
        const queue: Uint8Array[] = [];
        let appending = false, reading = true, eos = false, settled = false;
        let watch: ReturnType<typeof setTimeout> | undefined;
        // 单点结清:任何路径只 settle 一次,并清掉看门狗(防泄漏 + 防 resolve-after-reject)
        const ok = () => { if (settled) return; settled = true; clearTimeout(watch); resolve(); };
        const bad = (e: unknown) => { if (settled) return; settled = true; clearTimeout(watch); reject(e); };
        // 看门狗:首块前用首字节超时;起播后改"帧间静默"超时——中途卡住绝不无限等(审计 致命#1)。
        const arm = () => {
          clearTimeout(watch);
          watch = setTimeout(() => {
            if (!started) bad(new Error('tts_first_byte_timeout'));                                  // 首块没来 → 回落非流式
            else { try { audio.pause(); } catch { /* noop */ } try { mediaSource.endOfStream(); } catch { /* noop */ } ok(); }  // 已起播但断流 → 收尾,进录音
          }, started ? TTS_STALL_MS : TTS_FIRST_BYTE_MS);
        };
        const pump = () => {
          if (!sb || appending || sb.updating) return;
          if (queue.length) { appending = true; try { sb.appendBuffer(queue.shift()! as unknown as BufferSource); } catch (e) { bad(e); } return; }
          if (!reading && !eos) { eos = true; try { mediaSource.endOfStream(); } catch { /* noop */ } }
        };
        const readLoop = async () => {
          const reader = res.body!.getReader();
          try {
            for (;;) {
              const { done, value } = await reader.read();
              if (gen !== genRef.current || ac.signal.aborted) { try { await reader.cancel(); } catch { /* noop */ } reading = false; pump(); return; }
              if (done) { reading = false; if (!started) { bad(new Error('empty_stream')); return; } pump(); return; }  // 空流 → 立刻回落(不干等超时,审计 中#4)
              if (value && value.byteLength) {
                queue.push(value); pump(); arm();     // 每块重置看门狗
                if (!started) {                       // 首块到达 → 立刻起播(首音 ~1-2s)
                  started = true; setTtsPhase('playing');
                  audio.play().catch(() => ok());     // 自动播放被拦 → 不卡死,题面在屏,直接收尾进录音
                }
              }
            }
          } catch (e) { if (!started) bad(e); else { reading = false; pump(); } }
        };
        mediaSource.addEventListener('sourceopen', () => {
          try { sb = mediaSource.addSourceBuffer('audio/mpeg'); } catch (e) { bad(e); return; }
          sb.addEventListener('updateend', () => { appending = false; pump(); });
          sb.addEventListener('error', () => { if (!started) bad(new Error('sb_error')); });
          void readLoop();
        }, { once: true });
        audio.addEventListener('ended', () => ok());
        audio.addEventListener('error', () => { if (!started) bad(new Error('audio_error')); else ok(); });
        ac.signal.addEventListener('abort', () => ok());   // 挂断/切走/打断:teardown 会 pause(ended 不再触发)→ 在此结清,promise 不悬挂
        arm();   // 起始看门狗(等首块/sourceopen)
      });
      return 'played';
    } catch {
      return started ? 'played' : 'fallback';
    } finally {
      try { ac.abort(); } catch { /* noop */ }                         // 关键:无论成功/回落/打断都中断拉流,停掉 runaway reader + 透传到上游关 WS(审计 高#2)
      try { audio.pause(); } catch { /* noop */ }
      try { URL.revokeObjectURL(audio.src); } catch { /* noop */ }      // 释放 MSE objectURL
      if (audioElRef.current === audio) audioElRef.current = null;
      if (ttsAbortRef.current === ac) ttsAbortRef.current = null;
    }
  }, [resultId]);

  /** 朗读一段文字:先试流式(低延迟),不行再回落非流式整段 TTS,再不行降级文字读题(题面始终在屏)。 */
  const speak = useCallback(async (text: string, gen: number): Promise<void> => {
    setStatus('speaking');
    setTtsPhase('synth');
    // **可靠性优先**:流式 MSE 播放(cosyvoice MP3)未经真机验证、且"起播≠出声"会让语音会话静默卡死,
    // 默认走**已验证的非流式 /speak(qwen-tts wav + Audio)**;真机确认流式无声问题后再开此开关。
    if (ENABLE_STREAMING_TTS) {
      const streamed = await playStreamingTts(text, gen).catch(() => 'fallback' as const);
      if (gen !== genRef.current) return;                        // 已挂断/切走
      if (streamed === 'played') return;
    }

    // 回落:非流式整段 TTS(qwen-tts wav)
    setTtsPhase('synth');
    // 必须在发起 HTTP 前就登记同一把中止器。否则用户已开口时只能暂停
    // 已创建的 <audio>，无法阻止“迟到的 TTS 响应”随后开始播放，形成抢话反播。
    const speechAbort = new AbortController();
    ttsAbortRef.current = speechAbort;
    let audioUrl: string | null = null;
    try {
      const res = await fetch(`/api/interview/${encodeURIComponent(resultId)}/speak`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }), signal: speechAbort.signal,
      });
      if (!res.ok) throw new Error('tts_unavailable');           // 502 tts_failed / 503 tts_unavailable
      const spoken = await res.json().catch(() => null) as { audioBase64?: unknown; mimeType?: unknown } | null;
      const audioBase64 = spoken?.audioBase64;
      if (typeof audioBase64 !== 'string' || !audioBase64)
        throw new Error('tts_malformed');
      if (gen !== genRef.current || speechAbort.signal.aborted) return;
      const mimeType = typeof spoken?.mimeType === 'string' ? spoken.mimeType : 'audio/wav';
      audioUrl = URL.createObjectURL(base64ToBlob(audioBase64, mimeType));
      const audio = new Audio(audioUrl);
      audioElRef.current = audio;
      setTtsPhase('playing');
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        speechAbort.signal.addEventListener('abort', () => { try { audio.pause(); } catch { /* noop */ } resolve(); }, { once: true });
        audio.play().catch(() => resolve());                     // 自动播放被拦 → 不卡死,题面仍可读
      });
    } catch {
      // 挂断、切换文字、或用户抢话都是预期取消，不显示“服务不可用”的假错误。
      if (gen !== genRef.current || speechAbort.signal.aborted) return;
      setHint('语音播报暂不可用,请看屏幕上的题目');               // 降级:跳过音频
      await delay(900);                                          // 给用户读题的时间
    } finally {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (ttsAbortRef.current === speechAbort) ttsAbortRef.current = null;
      if (audioElRef.current?.paused) audioElRef.current = null;
    }
  }, [resultId, playStreamingTts]);

  /** 录音 + Web Audio VAD 静音自动停;返回录到的音频(无声返回 null)。 */
  const recordAnswer = useCallback(async (gen: number, onUserSpeech?: () => void): Promise<Blob | null> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus('mic_denied'); return null;
    }
    let stream: MediaStream;
    // AEC（声学回声消除）/降噪/自动增益是全双工的前提：AI 本机播报不能被当成候选人回答。
    // 浏览器或设备不支持时会忽略约束，仍由后面的 VAD + 用户可见转写复核兜底。
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } }); }
    catch { setStatus('mic_denied'); return null; }
    if (gen !== genRef.current) { stream.getTracks().forEach((t) => t.stop()); return null; }
    streamRef.current = stream;

    const mime = pickRecMime();
    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    recorderRef.current = mr;
    const chunks: Blob[] = [];
    mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

    const stopped = new Promise<Blob | null>((resolve) => {
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: mr.mimeType || mime || 'audio/webm' });
        resolve(blob.size ? blob : null);
      };
    });

    // VAD:RMS 电平 → 起声后持续静音 SILENCE_MS 即停;手动「说完了」走同一停止口
    const stopRec = () => { try { if (mr.state !== 'inactive') mr.stop(); } catch { /* noop */ } };
    manualStopRef.current = stopRec;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Uint8Array(analyser.fftSize);
    let speech = false, speechNotified = false, silenceStart = 0, hintShown = false;
    const startedAt = Date.now();

    const tick = () => {
      if (gen !== genRef.current || !recorderRef.current || mr.state === 'inactive') return;
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) { const x = (buf[i] - 128) / 128; sum += x * x; }
      const rms = Math.sqrt(sum / buf.length);
      const now = Date.now();
      if (now - levelTsRef.current > 80) {           // 节流刷新电平 + 滚动波形(右进左出)
        levelTsRef.current = now;
        setLevel(rms);
        const norm = Math.min(1, rms / 0.35);        // 归一到条高(0.35 ≈ 较响)
        const next = waveRef.current.slice(1);
        next.push(norm);
        waveRef.current = next;
        setWave(next);
      }

      if (rms > SPEECH_ON) {
        speech = true; silenceStart = 0;
        if (!speechNotified) { speechNotified = true; onUserSpeech?.(); }
      }
      else if (speech) {
        if (!silenceStart) silenceStart = now;
        else if (now - silenceStart > SILENCE_MS) { stopRec(); return; }               // 静音够久 → 自动停
      }
      if (!speech && !hintShown && now - startedAt > NO_SPEECH_HINT_MS) {
        hintShown = true; setHint('没听到声音?对着麦克风说,或点「说完了」');
      }
      if (now - startedAt > MAX_REC_MS) { stopRec(); return; }                          // 硬上限兜底
      rafRef.current = requestAnimationFrame(tick);
    };

    setStatus('listening');
    setHint(null);
    mr.start();
    rafRef.current = requestAnimationFrame(tick);
    const blob = await stopped;
    if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    try { stream.getTracks().forEach((t) => t.stop()); } catch { /* noop */ }
    try { await ctx.close(); } catch { /* noop */ }
    audioCtxRef.current = null; streamRef.current = null; recorderRef.current = null; manualStopRef.current = null;
    setLevel(0);
    return blob;
  }, []);

  /** 同一转写结果始终使用同一 answerId/body 重试，避免网络断在“服务端已收、客户端未收响应”时重复扣费或错题。 */
  const submitPending = useCallback(async (gen: number): Promise<void> => {
    const body = pendingSubmissionRef.current;
    if (!body) {
      if (gen === genRef.current) { setHint('没有可重试的回答。请切回文字模式刷新题目后再试。'); setStatus('question_unavailable'); }
      return;
    }
    setStatus('submitting');
    try {
      const res = await fetch(`/api/interview/${encodeURIComponent(resultId)}/turn`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'idempotency-key': `${resultId}:question:${body.questionId}:answer:${body.answerId}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as { error?: string }));
        if (gen !== genRef.current) return;
        if (res.status === 409 || err.error === 'stale_question' || err.error === 'answer_conflict') {
          setHint('题目已更新或该题已有其他回答。为避免错题评分，本段转写没有再次提交。');
          setStatus('question_unavailable');
        } else {
          setStatus('submit_failed');
          toast.error('回答提交失败，可重试提交同一段转写，或切回打字。');
        }
        return;
      }
      if (gen !== genRef.current) return;
      pendingSubmissionRef.current = null;
      setStatus('thinking');
    } catch {
      if (gen === genRef.current) { setStatus('submit_failed'); toast.error('网络错误，回答未确认提交；可无损重试同一段转写。'); }
    }
  }, [resultId]);

  /** 一道题的完整回合:麦克风先接通并持续监听，AI 同时播题；用户一开口即停播。 */
  const runTurn = useCallback(async (questionText: string) => {
    const gen = genRef.current;
    const recording = recordAnswer(gen, interruptAssistantSpeech);  // 先开麦，避免用户抢话首字被截掉
    await speak(questionText, gen);                                 // 与录音并行；barge-in 只中止播放
    if (gen !== genRef.current) return;
    setStatus('listening');
    const blob = await recording;
    if (gen !== genRef.current) return;
    if (!blob) return;                                  // 无声/无权限:状态已置 mic_denied 或保持,等手动出路

    setStatus('transcribing');
    let text = '';
    try {
      const b64 = await blobToBase64(blob);
      const res = await fetch(`/api/interview/${encodeURIComponent(resultId)}/transcribe`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          audioBase64: b64,
          mimeType: blob.type,
          capture: { mode: 'single_local_microphone', consent: true, policyVersion: VOICE_CAPTURE_POLICY_VERSION },
        }),
      });
      if (!res.ok) { if (gen === genRef.current) { setStatus('asr_down'); toast.error('语音转写暂不可用,可切回打字继续'); } return; }   // 503/502 → 出路:切回打字
      const body = await res.json().catch(() => null) as { text?: unknown } | null;
      const transcribed = body?.text;
      if (typeof transcribed !== 'string') {
        if (gen === genRef.current) { setStatus('asr_down'); toast.error('语音转写失败,可切回打字继续'); }
        return;
      }
      text = transcribed;
    } catch { if (gen === genRef.current) { setStatus('asr_down'); toast.error('语音转写失败,可切回打字继续'); } return; }
    if (gen !== genRef.current) return;

    if (!text.trim()) {                                  // 没识别到 → 再听一次,不提交空答
      setHint('没听清,请再说一遍');
      void runTurnRetryRef.current?.();
      return;
    }

    setLastAnswer(text);
    setStatus('submitting');
    try {
      const identity = view.questionIdentity;
      if (!identity) {
        // 不从数组下标/本地 idx 猜 turn：缺服务端 question_ready 身份宁可不提交。
        if (gen === genRef.current) { setHint('题目身份已失效。为避免把回答提交到错误题目，请切回文字模式刷新后重试。'); setStatus('question_unavailable'); }
        return;
      }
      const body = await buildTurnSubmission(identity, text);
      pendingSubmissionRef.current = body;
      await submitPending(gen);                          // 等下一题 question_ready / report_ready
    } catch { if (gen === genRef.current) { toast.error('回答身份生成失败，请切回打字后重试'); setStatus('question_unavailable'); } }
  }, [recordAnswer, speak, interruptAssistantSpeech, submitPending, view.questionIdentity]);

  // 「再听一次」复用录音→转写→提交那段(不重读题),用 ref 解循环依赖
  const runTurnRetryRef = useRef<(() => Promise<void>) | null>(null);
  runTurnRetryRef.current = async () => {
    const gen = genRef.current;
    const blob = await recordAnswer(gen);
    if (gen !== genRef.current || !blob) return;
    setStatus('transcribing');
    try {
      const b64 = await blobToBase64(blob);
      const res = await fetch(`/api/interview/${encodeURIComponent(resultId)}/transcribe`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          audioBase64: b64,
          mimeType: blob.type,
          capture: { mode: 'single_local_microphone', consent: true, policyVersion: VOICE_CAPTURE_POLICY_VERSION },
        }),
      });
      if (!res.ok) { if (gen === genRef.current) { setStatus('asr_down'); toast.error('语音转写暂不可用,可切回打字继续'); } return; }
      const retryBody = await res.json().catch(() => null) as { text?: unknown } | null;
      const text = retryBody?.text;
      if (typeof text !== 'string') {
        if (gen === genRef.current) { setStatus('asr_down'); toast.error('语音转写失败,可切回打字继续'); }
        return;
      }
      if (gen !== genRef.current) return;
      if (!text.trim()) { setHint('还是没听清,可点「说完了」后改用打字'); return; }
      setLastAnswer(text); setStatus('submitting');
      const identity = view.questionIdentity;
      if (!identity) {
        if (gen === genRef.current) { setHint('题目身份已失效。为避免错题提交，请切回文字模式刷新后重试。'); setStatus('question_unavailable'); }
        return;
      }
      const body = await buildTurnSubmission(identity, text);
      pendingSubmissionRef.current = body;
      await submitPending(gen);
    } catch { if (gen === genRef.current) { setStatus('asr_down'); toast.error('语音转写失败,可切回打字继续'); } }
  };

  // 主驱动:监听 view/display 变化,推进语音回合
  useEffect(() => {
    // 明确同意前不请求麦克风、不调用 ASR。这个能力门不能由任何展示文案绕过。
    if (!captureConsented) { setStatus('consent_required'); return; }
    if (status === 'ended' || status === 'mic_denied' || status === 'asr_down' || status === 'question_unavailable' || status === 'submit_failed') return; // 等用户出路,别自动重启

    // 终态降级(报告不可用 / 面试不可用 / error)→ 给出路,结束语音会话
    if (display.degraded) { genRef.current += 1; teardownAudioIo(); setStatus('degraded'); return; }

    // 报告就绪 → 朗读收尾一次,正常结束
    if (display.report && !reportSpokenRef.current) {
      reportSpokenRef.current = true;
      genRef.current += 1; teardownAudioIo();
      setStatus('report');
      void speak(`本次模拟面试练习结束，练习反馈为 ${display.report.overall}。该反馈仅供个人复盘，可在屏幕上查看完整报告。`, genRef.current);
      return;
    }

    // 新题或同题澄清的新服务端身份 → 开启一个回合。question identity 缺失时
    // fail-closed，不能从数组下标猜 turn 后把语音答案写到旧题。
    const identity = view.questionIdentity;
    const questionKey = identity
      ? `${identity.questionId}:${identity.stateVersion}:${identity.turn}`
      : null;
    if (canAnswer && lastIdx >= 0 && questionKey && processedQuestionKeyRef.current !== questionKey) {
      processedQuestionKeyRef.current = questionKey;
      void runTurn(view.question ?? view.turns[lastIdx].q);
    }
    // 评估中/出题中(已作答未出新题)→ thinking
    else if (!canAnswer && !display.report && !display.degraded && processedQuestionKeyRef.current === questionKey && status !== 'speaking' && status !== 'listening') {
      setStatus((s) => (s === 'submitting' || s === 'transcribing' ? s : 'thinking'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.turns.length, view.question, view.questionIdentity?.questionId, view.questionIdentity?.stateVersion, view.questionIdentity?.turn, display.action.kind, display.report?.overall, display.degraded, captureConsented]);

  // ── 渲染 ──
  const currentQ = lastIdx >= 0 ? view.turns[lastIdx].q : (view.question ?? '');
  const busyDot = status === 'speaking' || status === 'listening' || status === 'transcribing' || status === 'submitting' || status === 'thinking';
  const micActive = status === 'listening';

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col">
      {/* 顶部状态条 */}
      <header className="flex items-center justify-between border-b pb-3">
        <h2 className="font-serif text-lg">🎙️ 人机双向语音面试 <span className="align-middle text-xs font-normal text-muted-foreground">预览版</span></h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={`size-1.5 rounded-full ${busyDot ? 'animate-pulse bg-primary' : 'bg-muted-foreground'}`} />
          {STATUS_LABEL[status]}
        </span>
      </header>

      {/* 语音主体 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
        {/* 语音中大标识 + 脉冲麦克 */}
        <div className="relative grid place-items-center">
          {/* 听音:电平驱动外圈脉冲(reduced-motion 隐藏) */}
          {micActive && (
            <span
              className="absolute rounded-full bg-primary/20 transition-transform duration-100 motion-reduce:hidden"
              style={{ width: 120, height: 120, transform: `scale(${1 + Math.min(level * 6, 1.4)})` }}
            />
          )}
          {/* 转写:外扩 ping 环 */}
          {status === 'transcribing' && <span className="vc-ping absolute size-28 rounded-full border-2 border-primary/40" aria-hidden />}
          <div className={`relative grid size-28 place-items-center rounded-full border-2 transition-colors ${
            micActive ? 'border-primary bg-accent'
              : status === 'speaking' ? 'border-primary/60 bg-secondary'
              : status === 'report' ? 'border-primary bg-accent'
              : (status === 'mic_denied' || status === 'asr_down' || status === 'question_unavailable' || status === 'submit_failed' || status === 'degraded' || status === 'ended') ? 'border-destructive/40 bg-card'
              : 'border-border bg-card'
          }`}>
            {status === 'speaking' && ttsPhase === 'playing' ? <Volume2 className="size-9 text-primary motion-safe:animate-pulse" />
              : status === 'speaking' ? <Sparkles className="size-9 text-primary motion-safe:animate-pulse motion-reduce:animate-none" />
              : status === 'report' ? <CheckCircle2 className="size-9 text-primary" />
              : (status === 'mic_denied' || status === 'asr_down' || status === 'question_unavailable' || status === 'submit_failed' || status === 'degraded' || status === 'ended') ? <AlertTriangle className="size-9 text-destructive" />
              : status === 'listening' ? <Mic className="size-9 text-primary" />
              : (status === 'transcribing' || status === 'submitting' || status === 'thinking' || status === 'connecting') ? <Loader2 className="size-9 animate-spin text-primary motion-reduce:animate-none" />
              : <Mic className="size-9 text-muted-foreground" />}
          </div>
        </div>
        <div className="font-serif text-xl text-foreground" aria-live="polite">{STATUS_LABEL[status]}</div>

        {/* 等待动效区:每种 wait 都有一个"有意"的画面,绝不空白死等 */}
        <div className="flex h-10 w-full max-w-xs items-center justify-center" aria-hidden>
          {micActive ? <WaveBars wave={wave} />
            : status === 'speaking' && ttsPhase === 'playing' ? <EqualizerBars />
            : (status === 'speaking' || status === 'connecting' || status === 'thinking') ? <ShimmerBar />
            : status === 'transcribing' || status === 'submitting' ? <ThinkingDots />
            : null}
        </div>

        {status === 'consent_required' && (
          <section role="dialog" aria-modal="true" aria-labelledby="voice-consent-title" className="w-full rounded-lg border border-primary/30 bg-secondary/50 p-4 text-left text-sm">
            <h3 id="voice-consent-title" className="font-medium">确认人机语音处理范围（预览版）</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              预览版语音只会采集这台设备当前的一个麦克风片段并发送给转写服务；超时或转写异常会回到文字作答，不会编造内容。此页面的开关只能停止后续录音，不能撤回已经发送的片段。它不是电话或会议接入，没有说话人分离或逐词时间戳。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setCaptureConsented(true); setStatus('connecting'); }}
                className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                同意并启用本机语音
              </button>
              <button type="button" onClick={onSwitchToText} className="rounded-md border px-3 py-2 text-xs hover:border-primary">
                改用文字作答
              </button>
            </div>
          </section>
        )}

        {/* 当前题面(始终在屏:无障碍 + TTS 降级兜底) */}
        {currentQ && status !== 'report' && status !== 'degraded' && (
          <div className="w-full rounded-lg border bg-card p-4 text-left leading-relaxed shadow-[0_1px_0_rgba(26,26,26,.03),0_8px_24px_-18px_rgba(26,26,26,.25)]">
            <div className="mb-1 text-xs text-muted-foreground">第 {lastIdx + 1} 题{view.competency ? ` · ${view.competency}` : ''}</div>
            {currentQ}
          </div>
        )}

        {/* 澄清不是错误、也不是低分：语音模式必须和文字模式一样把服务端指导语明确呈现。
            仅重新播题会让用户不知道为何要重答；该提示不含原始回答，避免把语音转写重复暴露。 */}
        {view.guidance && status !== 'report' && status !== 'degraded' && (
          <section className="w-full rounded-lg border border-primary/30 bg-secondary/50 p-4 text-left" aria-live="polite">
            <div className="text-sm font-medium">请换个角度回答</div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{view.guidance.hint}</p>
          </section>
        )}

        {/* 刚转写出的我的回答 */}
        {lastAnswer && (status === 'submitting' || status === 'thinking') && (
          <div className="w-full rounded-md border border-primary/20 bg-secondary/50 p-3 text-left text-sm">
            <div className="text-xs text-muted-foreground">我的回答</div>
            <div className="mt-1">{lastAnswer}</div>
          </div>
        )}

        {display.signalConclude && (
          <p data-testid="signal-conclude-reason" role="status" className="w-full rounded-md border bg-muted/40 p-3 text-left text-sm text-muted-foreground">
            {display.signalConclude.message}
          </p>
        )}
        {/* 报告收尾 */}
        {status === 'report' && display.report && (
          <div className="w-full rounded-lg border bg-accent p-5 text-center text-accent-foreground">
            练习完成 · 本次练习反馈 <span className="text-3xl font-extrabold text-primary">{display.report.overall}</span>
            <div className="mt-2 text-xs text-muted-foreground">仅供个人复盘，不用于招聘决定；语音模式已结束，可切回查看完整报告</div>
          </div>
        )}

        {/* 降级 / 异常出路提示(永不死胡同) */}
        {status === 'mic_denied' && <p role="alert" className="text-sm text-destructive">麦克风不可用或权限被拒。请在浏览器设置中开启麦克风,或切回打字作答。</p>}
        {status === 'asr_down' && <p role="alert" className="text-sm text-destructive">语音转写暂不可用。可切回打字继续作答,你的进度已保存。</p>}
        {status === 'question_unavailable' && <p role="alert" className="text-sm text-destructive">{hint || '题目身份不可用。为避免把回答错提交到另一题，语音模式已停止；请切回文字模式刷新后重试。'}</p>}
        {status === 'submit_failed' && <p role="alert" className="text-sm text-destructive">本段转写尚未确认提交。可重试同一请求（保持同一 answerId），或切回文字作答。</p>}
        {status === 'degraded' && <p role="alert" className="text-sm text-destructive">{display.message || '面试已结束,可切回查看详情或重试。'}</p>}
        {hint && status === 'listening' && <p className="text-xs text-muted-foreground">{hint}</p>}
        {status === 'listening' && <p className="text-xs text-muted-foreground">正在检测本机麦克风电平；不代表通话另一方，也不做说话人归因。</p>}
        {hint && status === 'speaking' && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>

      {/* 底部操作区 */}
      <div className="space-y-3 border-t pt-4">
        {/* 听音中:手动「说完了」立即停(VAD 误判兜底) */}
        {status === 'listening' && (
          <button
            type="button"
            onClick={() => manualStopRef.current?.()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Square className="size-4 fill-current" />说完了
          </button>
        )}

        {/* ASR 挂掉:给「再试一次录音」+ 主出路切回打字 */}
        {status === 'asr_down' && (
          <button
            type="button"
            onClick={() => { setHint(null); processedQuestionKeyRef.current = null; if (lastIdx >= 0) void runTurn(view.question ?? view.turns[lastIdx]?.q ?? currentQ); }}  // 直接重开本题回合(主驱动 effect 不依赖 status,不能靠它重启)
            className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm hover:border-primary"
          >
            <RotateCcw className="size-4" />再试一次语音
          </button>
        )}

        {status === 'submit_failed' && (
          <button
            type="button"
            onClick={() => void submitPending(genRef.current)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm hover:border-primary"
          >
            <RotateCcw className="size-4" />重试提交这段转写
          </button>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSwitchToText}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm hover:border-primary"
          >
            <Keyboard className="size-4" />切回打字
          </button>
          {status === 'ended' ? (
            <button
              type="button"
              onClick={onSwitchToText}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              返回面试
            </button>
          ) : (
            <button
              type="button"
              onClick={hangup}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
            >
              <PhoneOff className="size-4" />结束语音
            </button>
          )}
        </div>
        {status === 'ended' && <p className="text-center text-xs text-muted-foreground">语音模式已结束。进度已保存，可返回继续或切回打字。</p>}
      </div>
    </div>
  );
}

/** 听音实时波形:把 VAD 算出的 RMS 历史(右进左出)画成琥珀色声柱,候选人能"看见自己在说话"。 */
function WaveBars({ wave }: { wave: number[] }) {
  return (
    <div className="flex h-full w-full items-center justify-center gap-[3px]" role="img" aria-label="本机麦克风实时音量波形，不代表电话另一方">
      {wave.map((v, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-primary/80 transition-[height] duration-100 ease-out"
          style={{ height: `${Math.max(8, Math.min(100, v * 100))}%` }}
        />
      ))}
    </div>
  );
}

/** 朗读中:伪均衡器声柱(无法直接分析 <audio> 输出,用错相呼吸近似"AI 在说话"的律动)。 */
function EqualizerBars() {
  const heights = [40, 70, 100, 55, 85, 60, 95, 45];
  return (
    <div className="flex h-full items-center justify-center gap-1">
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-primary/70 motion-safe:animate-pulse motion-reduce:animate-none"
          style={{ height: `${h}%`, animationDelay: `${i * 110}ms`, animationDuration: '900ms' }}
        />
      ))}
    </div>
  );
}

/** 合成/接通/出题等待:暖琥珀微光横扫,表达"系统在干活",而非死白屏。 */
function ShimmerBar() {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="vc-shimmer h-2 w-40 rounded-full" />
      <div className="vc-shimmer h-2 w-28 rounded-full opacity-70" />
    </div>
  );
}

/** 转写/提交:三点错相呼吸。 */
function ThinkingDots() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="vc-dot size-2.5 rounded-full bg-primary/70" style={{ animationDelay: `${i * 200}ms` }} />
      ))}
    </div>
  );
}
