/**
 * 语音 I/O seam（边缘适配器）——核心洞察:**面试 agent 图是 modality-agnostic 的**,它只收"文本答案"、出"文本问题",
 * 不关心答案是打字还是语音转写。所以语音 = 把 ASR/TTS 包在图外圈,agent 内核(graph/invoke/factuality/eval)一行不动。
 * 易变技术(ASR/TTS/实时模型)藏在本 seam 后(10 年):换 paraformer→qwen3-asr、cosyvoice→别的,业务不动。
 * 隐私:转写文本落 interview_event(已建),**原始录音默认不存**(需单独同意)——见 rules 隐私铁律。
 */
export interface Asr { transcribe(audio: Uint8Array, opts?: { lang?: string }): Promise<string>; }
export interface Tts { synthesize(text: string, opts?: { voice?: string }): Promise<Uint8Array>; }

/** 测试/CI 用:确定性 fake,不联网。 */
export function fakeAsr(transcript: string): Asr { return { async transcribe() { return transcript; } }; }
export function fakeTts(): Tts { return { async synthesize(t) { return new TextEncoder().encode('AUDIO:' + t); } }; }

/**
 * 真 ASR（DashScope 百炼 qwen-audio,经 OpenAI 兼容 chat 端点的 input_audio content——与视觉 image_url 同机制,已实测逐字转写准确）。
 * 非流式(整段音频→文本);流式实时识别(逐字回显/打断)是下一步换 qwen3-asr WebSocket。未配置即抛,由上层降级。
 */
export function dashscopeAsr(cfg: { baseUrl?: string; apiKey?: string; model?: string } = {}): Asr {
  const baseUrl = cfg.baseUrl ?? process.env.MODEL_BASE_URL;
  const apiKey = cfg.apiKey ?? process.env.MODEL_API_KEY;
  const model = cfg.model ?? process.env.ASR_MODEL ?? 'qwen-audio-turbo-latest';
  return {
    async transcribe(audio, opts) {
      if (!baseUrl || !apiKey) throw new Error('asr_not_configured');
      const fmt = (opts as { format?: string } | undefined)?.format ?? 'mp3';
      const b64 = Buffer.from(audio).toString('base64');
      const res = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
        method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: [
          { type: 'input_audio', input_audio: { data: `data:audio/${fmt};base64,${b64}`, format: fmt } },
          { type: 'text', text: '请把这段语音逐字转写成文字，只输出转写出的文字，不要任何解释。' },
        ] }] }),
      });
      if (!res.ok) throw new Error('asr_http_' + res.status);
      const j = await res.json() as { choices?: { message?: { content?: string } }[] };
      return (j.choices?.[0]?.message?.content ?? '').trim();
    },
  };
}

/** 真 TTS（DashScope qwen-tts,**native multimodal-generation 端点**——兼容模式无 /audio/speech,已实测返回 wav）。
 *  非流式(整句合成→下载 wav);流式低延迟(边出边播)是下一步换 WebSocket。未配置即抛,由上层降级。 */
export function dashscopeTts(cfg: { apiKey?: string; model?: string; voice?: string; ttsUrl?: string } = {}): Tts {
  const apiKey = cfg.apiKey ?? process.env.MODEL_API_KEY;
  const model = cfg.model ?? process.env.TTS_MODEL ?? 'qwen-tts';
  const defVoice = cfg.voice ?? process.env.TTS_VOICE ?? 'Cherry';
  const ttsUrl = cfg.ttsUrl ?? process.env.TTS_URL ?? 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
  return {
    async synthesize(text, opts) {
      if (!apiKey) throw new Error('tts_not_configured');
      const res = await fetchWithTimeout(ttsUrl, {
        method: 'POST', headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model, input: { text, voice: opts?.voice ?? defVoice } }),
      });
      if (!res.ok) throw new Error('tts_http_' + res.status);
      const j = await res.json() as { output?: { audio?: { url?: string } } };
      const url = j.output?.audio?.url;
      if (!url) throw new Error('tts_no_audio_url');
      const audioRes = await fetchWithTimeout(url);                                  // 下载 OSS 上的 wav
      if (!audioRes.ok) throw new Error('tts_download_' + audioRes.status);
      return new Uint8Array(await audioRes.arrayBuffer());
    },
  };
}import { fetchWithTimeout } from './timeout.ts';

