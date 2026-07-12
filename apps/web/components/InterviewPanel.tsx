'use client';
/**
 * 面试会话面板:消费 useInterviewStream(SSE 驱动)。
 * 真会话:对话历史(逐题 + 所探能力 + **追问/换题标记** + 逐答评分)+ 当前题**打字流式渲染**(贴近流式输出)+ 作答输入。
 * 自适应引擎做追问(同能力=追问 probe、换能力=pivot);面板把它呈现出来。无死胡同由 view-model 保证。
 */
import { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, Send, Square, CornerDownRight, Sparkle, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useInterviewStream } from '@/lib/hooks/useInterviewStream';
import { Markdown } from '@/components/Markdown';
import { VoiceCallPanel } from '@/components/VoiceCallPanel';
import { Thinking } from '@/components/ui/Thinking';

/** Blob → base64(剥掉 data:URL 前缀)。FileReader 路径避免大数组 btoa 爆栈。 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result).split(',')[1] ?? '');
    fr.onerror = () => reject(new Error('read_failed'));
    fr.readAsDataURL(blob);
  });
}
/** 选浏览器支持的录音容器(Chrome/FF=webm,Safari=mp4)。ASR 端按 MIME 派生 format。 */
function pickRecMime(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const t of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']) {
    if (MediaRecorder.isTypeSupported?.(t)) return t;
  }
  return '';
}

/** 打字流式渲染:分步揭示 + **流式安全 Markdown**(中途未闭合代码围栏不吞段)。
 *  **性能**:渲染次数封顶 STEPS(与文本长度解耦)——逐字 +1 会把整段 Markdown 重解析 O(n) 次 = O(n²),长题必卡;
 *  改为每步揭示 ⌈len/STEPS⌉ 字,总重渲染 ≤STEPS;超长文本/reduced-motion 直接呈终态(不做动画)。 */
const TW_STEPS = 42;          // 一次动画最多重渲染 42 次
const TW_MAX = 600;           // 超过此长度不做打字动画(直接呈现,避免重解析长 Markdown)
function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(text.length);
  useEffect(() => {
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (reduce || text.length > TW_MAX) { setN(text.length); return; }
    setN(0);
    const step = Math.max(1, Math.ceil(text.length / TW_STEPS));
    const id = setInterval(() => setN((k) => { const next = k + step; if (next >= text.length) { clearInterval(id); return text.length; } return next; }), 28);
    return () => clearInterval(id);
  }, [text]);
  // 动画进行中:**纯文本**揭示(whitespace-pre-wrap,零 Markdown/highlight 解析,这才是消除卡顿的关键);
  // 揭示完成:才渲染一次真 Markdown(代码块/列表/表格)。题目多为散文,纯文本揭示观感一致。
  if (n < text.length) {
    return (
      <span className="relative whitespace-pre-wrap break-words">
        {text.slice(0, n)}
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" />
      </span>
    );
  }
  return <Markdown>{text}</Markdown>;
}

export function InterviewPanel({ resultId }: { resultId: string }) {
  const { view, display } = useInterviewStream(resultId);
  const [mode, setMode] = useState<'text' | 'call'>('text');   // 打字 / 全程电话(语音)模式,共用同一条 SSE 流
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});   // turnIndex → 已提交答案(本地保留以显示对话)
  const [turn, setTurn] = useState(0);
  const [rec, setRec] = useState<'idle' | 'recording' | 'transcribing'>('idle');   // 语音作答状态机
  const [submitting, setSubmitting] = useState(false);   // 已提交答案↔下一题到达之间的"AI 思考中"桥接(本地态,SSE 推进即清)
  const [voiceErr, setVoiceErr] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canAnswer = display.action.kind === 'answer';
  const lastIdx = view.turns.length - 1;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [view.turns.length, display.action.kind]);
  // SSE 一旦推进(新题/评分/终态/降级),清掉本地"思考中"桥接,交回 display 驱动(避免双 spinner / 卡死)。
  useEffect(() => {
    setSubmitting(false);
    if (submitTimerRef.current) { clearTimeout(submitTimerRef.current); submitTimerRef.current = null; }
  }, [view.turns.length, view.lastScore, display.action.kind, display.degraded]);
  useEffect(() => () => { if (submitTimerRef.current) clearTimeout(submitTimerRef.current); }, []);
  // 卸载时停录音并释放麦克风(防泄漏 / 红点常亮)。
  useEffect(() => () => { try { recorderRef.current?.stream?.getTracks().forEach((t) => t.stop()); } catch { /* noop */ } }, []);

  // 语音作答:录音 → 停 → 转写 → 塞进作答框(可编辑后再提交)。全程降级:无麦克风权限 / ASR 不可用都回落文字作答,不死胡同。
  async function startRecording() {
    setVoiceErr(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoiceErr('当前浏览器不支持录音，请改用文字作答'); return;
    }
    let stream: MediaStream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { setVoiceErr('麦克风权限被拒，请改用文字作答，或在浏览器设置中开启麦克风'); return; }
    const mime = pickRecMime();
    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    chunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
    mr.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());                                  // 释放麦克风
      const blob = new Blob(chunksRef.current, { type: mr.mimeType || mime || 'audio/webm' });
      if (!blob.size) { setRec('idle'); return; }
      setRec('transcribing');
      try {
        const b64 = await blobToBase64(blob);
        const res = await fetch(`/api/interview/${encodeURIComponent(resultId)}/transcribe`, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ audioBase64: b64, mimeType: blob.type }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({} as any));
          const msg = j?.message ?? '语音转写失败，请改用文字作答';                    // 503 asr_unavailable / 502 asr_failed
          setVoiceErr(msg); toast.error(msg);                                          // 显式反馈:不静默吞掉这一答
        } else {
          const { text } = await res.json() as { text: string };
          if (text?.trim()) setAnswer((a) => (a ? a.trimEnd() + ' ' : '') + text.trim());  // 追加,允许多段录;用户可改
          else setVoiceErr('没有识别到语音，请重试或改用文字作答');
        }
      } catch { const msg = '语音转写失败，请改用文字作答'; setVoiceErr(msg); toast.error(msg); }
      finally { setRec('idle'); }
    };
    recorderRef.current = mr;
    mr.start();
    setRec('recording');
  }
  function toggleVoice() {
    if (rec === 'recording') { try { recorderRef.current?.stop(); } catch { setRec('idle'); } }
    else if (rec === 'idle') void startRecording();
  }

  function clearSubmitBridge() {
    setSubmitting(false);
    if (submitTimerRef.current) { clearTimeout(submitTimerRef.current); submitTimerRef.current = null; }
  }

  async function submit(overrideText?: string) {
    const sent = overrideText ?? answer;          // 锁定本次作答文本(跳过传 '跳过';失败可保留在框内重试)
    if (!sent.trim() || submitting) return;       // 防空答 / 防双提交(in-flight 期间再点直接忽略)
    const sentTurn = turn;                        // 锁定本回合序号:body/幂等键/计数推进都用它,避免 30s 兜底重开输入后计数错位
    setSubmitting(true);   // 立刻进入"AI 思考中",填满提交↔评分/下一题的间隙(下条 SSE 事件会清掉)
    // 兜底:即使提交请求异常 / 流迟迟不推进,也在 30s 后退回作答态,绝不把用户永久卡在"思考中"。
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    submitTimerRef.current = setTimeout(() => setSubmitting(false), 30000);
    setAnswers((m) => ({ ...m, [lastIdx]: sent }));   // 乐观回显;失败时回滚
    try {
      const res = await fetch(`/api/interview/${encodeURIComponent(resultId)}/turn`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'idempotency-key': `${resultId}:turn:${sentTurn}` },
        body: JSON.stringify({ turn: sentTurn, answer: sent }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as any));
        toast.error(j?.message ?? '提交失败,请重试');                 // 显式反馈,绝不静默失败
        setAnswers((m) => { const n = { ...m }; delete n[lastIdx]; return n; });   // 回滚回显
        clearSubmitBridge();                                          // 回到作答态,保留输入框内容
        return;
      }
      setAnswer('');                                       // 仅成功才清空作答框
      setTurn((t) => (t > sentTurn ? t : sentTurn + 1));   // 幂等推进:同一回合即使重复成功也只前进一格(失败保持同键以便重试)
    } catch {
      toast.error('网络错误,提交未成功,请重试');
      setAnswers((m) => { const n = { ...m }; delete n[lastIdx]; return n; });
      clearSubmitBridge();
    }
  }

  // 全程电话模式:同一条 useInterviewStream 驱动,语音「说→听→转写→提交→下一题」连续进行。
  if (mode === 'call') {
    return (
      <div className="mx-auto max-w-2xl">
        <VoiceCallPanel resultId={resultId} view={view} display={display} onSwitchToText={() => setMode('text')} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header className="flex items-center justify-between border-b pb-3">
        <h2 className="font-semibold tracking-tight">模拟面试</h2>
        <div className="flex items-center gap-3">
          <button
            type="button" onClick={() => setMode('call')}
            title="全程语音通话:AI 朗读题目,你说话作答,像打电话一样连续面试"
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium hover:border-primary hover:text-primary"
          >
            <Phone className="size-3.5" />电话模式
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`size-1.5 rounded-full ${view.connection === 'live' ? 'animate-pulse bg-primary' : 'bg-muted-foreground'}`} />
            {view.connection === 'live' ? '进行中' : view.connection === 'reconnecting' ? '重连中…' : '已结束'}
          </span>
        </div>
      </header>

      {/* 对话历史 */}
      <div className="space-y-4">
        {view.turns.map((t, i) => {
          const isCurrent = i === lastIdx && canAnswer;
          return (
            <div key={i} className="space-y-2">
              {/* 题:追问/换题标记 + 能力 */}
              <div className="rounded-lg border bg-card p-4 shadow-[0_1px_0_rgba(26,26,26,.03),0_8px_24px_-18px_rgba(26,26,26,.25)]">
                <div className="mb-2 flex items-center gap-2 text-xs">
                  {t.followUp
                    ? <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-medium text-brand-deep"><CornerDownRight className="size-3" />追问</span>
                    : <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-muted-foreground"><Sparkle className="size-3" />新问题</span>}
                  {t.competency && <span className="text-muted-foreground">· {t.competency}</span>}
                  <span className="ml-auto text-muted-foreground">第 {i + 1} 题</span>
                </div>
                <div className="leading-relaxed">{isCurrent ? <Typewriter text={t.q} /> : <Markdown>{t.q}</Markdown>}</div>
              </div>
              {/* 我的回答 + 评分 */}
              {answers[i] && (
                <div className="ml-6 rounded-md border border-primary/20 bg-secondary/50 p-3 text-sm">
                  <div className="text-muted-foreground">我的回答</div>
                  <div className="mt-1"><Markdown>{answers[i]}</Markdown></div>
                  {t.score !== undefined && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs">
                      <span className="font-semibold text-primary">{t.score}</span>
                      <span className="h-1 w-16 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${t.score}%` }} /></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* 思考/连接/评分间隙:平滑的"AI 思考中"占位(呼吸点 + 柔脉冲文案),不是裸 spinner 也不是死白。submitting 桥接提交↔下一题。 */}
      {(submitting || display.spinner) && (
        <div className="flex items-center rounded-lg border bg-secondary/40 px-3.5 py-3">
          <Thinking label={display.spinner ? (display.message || 'AI 思考中') : '正在评估你的回答，准备下一题'} />
        </div>
      )}
      {display.report && (
        <div className="rounded-lg border bg-accent p-4 text-center text-accent-foreground">
          面试完成 · 综合评分 <span className="text-2xl font-extrabold text-primary">{display.report.overall}</span>
        </div>
      )}
      {display.degraded && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{display.message}</p>}

      {/* 答非所问/没答:引导横幅(同一题重答 + 可跳过,非死胡同)。view.guidance 由 clarification_needed 事件挂上。 */}
      {canAnswer && !submitting && view.guidance && (
        <div className="rounded-lg border border-brand-em/40 bg-accent/60 p-3.5 text-sm text-ink2">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-brand-deep"><Sparkle className="size-3.5" />换个角度回答</div>
          <p className="leading-relaxed">{view.guidance.hint}</p>
        </div>
      )}

      {/* 作答输入(思考中时收起,交给上方"AI 思考中"占位;30s 兜底必回作答态,无死胡同) */}
      {canAnswer && !submitting && (
        <div className="sticky bottom-4 space-y-2 rounded-lg border bg-card p-3 shadow-[0_1px_0_rgba(26,26,26,.03),0_8px_24px_-18px_rgba(26,26,26,.25)]">
          <textarea
            value={answer} onChange={(e) => setAnswer(e.target.value)} rows={3}
            placeholder="打字作答…(答得简略时,AI 会就同一能力追问,逼你说透)"
            className="w-full resize-none rounded-lg border-0 bg-transparent p-1 text-base outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between">
            <button type="button" onClick={toggleVoice} disabled={rec === 'transcribing'}
              aria-pressed={rec === 'recording'}
              title={rec === 'recording' ? '点击停止录音并转写' : '语音作答(录音→转写,文字可编辑后再提交)'}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${rec === 'recording' ? 'bg-destructive/10 font-medium text-destructive' : 'text-muted-foreground hover:text-foreground'}`}>
              {rec === 'transcribing' ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : rec === 'recording' ? <Square className="size-4 fill-current" /> : <Mic className="size-4" />}
              {rec === 'transcribing' ? '转写中…' : rec === 'recording' ? '录音中·停止' : '语音'}
            </button>
            {/* 跳过这题:确实没相关经历时换一题(发"跳过",引擎按非作答→换能力,不死缠、不加深)。 */}
            <button type="button" onClick={() => submit('跳过')} disabled={submitting || rec !== 'idle'}
              title="确实没相关经历?跳过这题,换一道"
              className="ml-2 inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50">
              <CornerDownRight className="size-3.5" />跳过这题
            </button>
            <span className="flex-1" />
            {/* submitting 时整个作答区收起(见上方 {canAnswer && !submitting}),提交反馈交给上方"AI 思考中"占位;
                此处按钮只处理"不可提交"的可见禁用态(空答 / 录音转写未结束)。 */}
            <button onClick={() => submit()} disabled={!answer.trim() || rec !== 'idle'}
              aria-disabled={!answer.trim() || rec !== 'idle' || undefined}
              title={!answer.trim() ? '请先输入回答' : rec !== 'idle' ? '请先结束语音录入' : '提交回答'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
              <Send className="size-4" />提交</button>
          </div>
          {voiceErr && <p role="alert" className="px-1 text-xs text-destructive">{voiceErr}</p>}
        </div>
      )}
      {display.action.kind === 'retry' && (
        <button
          onClick={(e) => { e.currentTarget.disabled = true; e.currentTarget.setAttribute('aria-busy', 'true'); location.reload(); }}
          className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm hover:border-primary disabled:cursor-not-allowed disabled:opacity-50">
          {display.action.label}
        </button>
      )}
    </div>
  );
}
