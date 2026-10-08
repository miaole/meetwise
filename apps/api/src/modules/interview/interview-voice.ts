/**
 * GODFN-1c 拆解 · voice 域纯函数(speak/speakStreamPrepare/transcribe 尾段自 interview.service.ts 机械迁出,
 * 零逻辑变更)。归属/隐私围栏层(voiceGate/requireOwnerUserId/asPrincipal+guardInterviewPrivacy)留在
 * InterviewService(DI+tenant 接线面);本文件只承接围栏之后的语音 I/O 编排与供应商错误映射。
 * 边缘 I/O(ASR/TTS)在 invoke 关口之外,api service 内同步请求-响应一次外呼(与 resume extractResumeText 同性质)。
 */
import { HttpException, HttpStatus } from '@nestjs/common';
import { VOICE_EGRESS_DISABLED_ID, type Asr, type StreamingTts, type Tts } from '@meetwise/ai-runtime';
import type { TranscribeDto } from '@meetwise/contracts';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;   // 10MB 上限(单题语音作答足够;防大文件 DoS)

/** MIME → DashScope 可识别的 format 字符串(MediaRecorder 常出 audio/webm;codecs=opus / audio/mp4)。 */
function formatFromMime(mime: string): string {
  const m = (mime || '').toLowerCase();
  const sub = m.split('/')[1]?.split(';')[0]?.trim();      // 'audio/webm;codecs=opus' → 'webm'
  if (sub === 'mpeg' || sub === 'mpga') return 'mp3';
  if (sub === 'x-m4a') return 'm4a';
  return sub || 'mp3';
}

/**
 * TTS 合成尾段(非流式)。调用方(InterviewService.speak)已完成:voiceGate → owner → 隐私围栏 →
 * 文本 trim/empty_text 校验;文本只回转写/播报,原始录音不落库(rules 隐私铁律)。
 */
export async function synthesizeSpokenAudio(tts: Tts, text: string, options: { signal?: AbortSignal } = {}) {
  try {
    const audio = await tts.synthesize(text.slice(0, 2000), { signal: options.signal });   // 截断防超长 TTS
    return { audioBase64: Buffer.from(audio).toString('base64'), mimeType: 'audio/wav' };
  } catch (e: any) {
    if (String(e?.message) === 'tts_not_configured')
      throw new HttpException({ error: 'tts_unavailable', message: '语音播报暂不可用，将以文字显示题目' }, HttpStatus.SERVICE_UNAVAILABLE);
    if (String(e?.message) === 'tts_download_capacity_exceeded')
      throw new HttpException({ error: 'tts_busy', message: '语音播报繁忙，将以文字显示题目', retryAfterSeconds: 1 }, HttpStatus.SERVICE_UNAVAILABLE);
    if (String(e?.message) === 'tts_malformed')
      throw new HttpException({ error: 'tts_failed', message: '语音播报失败，将以文字显示题目' }, HttpStatus.BAD_GATEWAY);
    throw new HttpException({ error: 'tts_failed', message: '语音播报失败，将以文字显示题目' }, HttpStatus.BAD_GATEWAY);
  }
}

/**
 * 流式 TTS 前置尾段:配置校验(503)+ 截断。调用方已完成 voiceGate → owner → 隐私围栏 → empty_text 校验。
 * Disabled before hijack/headers: the browser can always fall back to text
 * and no stream transport can be constructed from a broad provider key.
 */
export function prepareSpeakStreamText(streamTts: StreamingTts, text: string) {
  if (streamTts.id === VOICE_EGRESS_DISABLED_ID)
    throw new HttpException({ error: 'tts_unavailable', message: '语音播报暂不可用，将以文字显示题目' }, HttpStatus.SERVICE_UNAVAILABLE);
  return { text: text.slice(0, 2000) };   // 截断防超长 TTS(对齐非流式 speak)
}

/**
 * ASR 转写尾段。调用方已完成 voiceGate → owner → 隐私围栏(delete-wins 在音频出进程前拦截)。
 * 这不是说话人识别结果:唯一可信事实是请求经过同意、来自本机单轨。
 */
export async function transcribeAnswer(asr: Asr, dto: TranscribeDto, options?: { signal?: AbortSignal }) {
  const audio = Buffer.from(dto.audioBase64, 'base64');
  if (audio.length === 0) throw new HttpException({ error: 'empty_audio' }, HttpStatus.BAD_REQUEST);
  if (audio.length > MAX_AUDIO_BYTES) throw new HttpException({ error: 'audio_too_large' }, HttpStatus.PAYLOAD_TOO_LARGE);
  const format = dto.format?.trim() || formatFromMime(dto.mimeType);
  try {
    const text = await asr.transcribe(new Uint8Array(audio), { format, signal: options?.signal });
    if (typeof text !== 'string')
      throw new HttpException({ error: 'asr_failed', message: '语音转写失败，请重试或改用文字作答' }, HttpStatus.BAD_GATEWAY);
    return {
      text,
      capture: {
        mode: dto.capture.mode,
        speakerAttribution: 'not_diarized' as const,
        wordTimestamps: 'not_available' as const,
      },
    };
  } catch (e: any) {
    if (e instanceof HttpException) throw e;
    // 优雅降级:模型未配置 / 转写失败 → 明确错误,前端回落到文字作答(不抛 500,不死胡同)。
    if (String(e?.message) === 'asr_not_configured')
      throw new HttpException({ error: 'asr_unavailable', message: '语音转写暂不可用，请改用文字作答' }, HttpStatus.SERVICE_UNAVAILABLE);
    if (String(e?.message) === 'asr_malformed')
      throw new HttpException({ error: 'asr_failed', message: '语音转写失败，请重试或改用文字作答' }, HttpStatus.BAD_GATEWAY);
    if (String(e?.message) === 'asr_timeout')
      throw new HttpException({ error: 'asr_timeout', message: '语音转写超时，请重试或改用文字作答' }, HttpStatus.GATEWAY_TIMEOUT);
    // 499 is an internal/client-aborted classification. The response socket
    // is already gone in the normal path, so this must never be aggregated
    // with supplier timeouts or advertised as a retryable provider failure.
    if (String(e?.message) === 'asr_aborted')
      throw new HttpException({ error: 'asr_cancelled' }, 499);
    throw new HttpException({ error: 'asr_failed', message: '语音转写失败，请重试或改用文字作答' }, HttpStatus.BAD_GATEWAY);
  }
}
