/**
 * Server-side RMS energy endpointing (PRD-TEST-006 voice slice 3).
 *
 * Pure deterministic turn-end detection over 16k mono int16 PCM: a sliding
 * frame RMS compared against a fixed threshold. Speech seen (>= minSpeechFrames
 * speechy frames) followed by `silenceFramesToEndTurn` consecutive silent
 * frames emits exactly one `end_of_turn` — no model, no provider call, no
 * probabilistic VAD. Endpointing gates the user-audio side of
 * `streamingVoiceTurn`: when it fires the audio iterable closes, the ASR
 * sender finishes the upstream task and the turn loop advances on the final
 * transcript. It never invents text: an end_of_turn with no ASR final still
 * refuses (`streaming_asr_malformed` in the caller). `withRmsEndOfTurn`
 * carries a one-sample remainder across chunk boundaries so byte-split int16
 * frames are decoded exactly. Deterministic proofs live in
 * `packages/ai-runtime/test/voice-endpointing.proof.ts`; they are not product
 * E2E and say nothing about real-microphone acoustics. `releaseEvidence=false`.
 */
export interface RmsEndpointingConfig {
  /** Input PCM sample rate (default 16000, the product stream ASR rate). */
  sampleRate?: number;
  /** Analysis frame length in milliseconds (default 30 → 480 samples @16k). */
  frameMs?: number;
  /** int16 RMS below this counts as silence (default 120 ≈ -26 dBFS-ish). */
  silenceRms?: number;
  /** Consecutive silent frames after speech that close the turn (default 17 ≈ 510 ms). */
  silenceFramesToEndTurn?: number;
  /** Speechy frames required before end_of_turn may fire (default 3). */
  minSpeechFrames?: number;
}

export interface RmsEndpointerOptions {
  readonly sampleRate: number;
  readonly frameSamples: number;
  readonly silenceRms: number;
  readonly silenceFramesToEndTurn: number;
  readonly minSpeechFrames: number;
}

export type RmsEndpointEvent =
  | { type: 'speech_started'; frame: number; rms: number }
  | { type: 'end_of_turn'; frame: number; speechFrames: number; silenceFrames: number };

export interface RmsEndpointer {
  readonly options: RmsEndpointerOptions;
  /** Frames of speech observed so far. */
  readonly speechFrames: number;
  /** True once end_of_turn has fired; further feed() calls are counted but emit nothing. */
  readonly ended: boolean;
  /** Feed exactly one analysis frame; returns events emitted by this frame. */
  feedFrame(frame: Int16Array): RmsEndpointEvent[];
  /** Feed a raw PCM chunk (bytes, little-endian int16); splits into frames internally. */
  feed(chunk: Uint8Array): RmsEndpointEvent[];
  /** Drop the pending partial frame and reset silence/speech counters (frame samples kept). */
  reset(): void;
}

export const RMS_ENDPOINTING_DEFAULTS: Readonly<RmsEndpointerOptions> = Object.freeze({
  sampleRate: 16000,
  frameSamples: 480,                                  // 30 ms @ 16k
  silenceRms: 120,
  silenceFramesToEndTurn: 17,                         // ≈510 ms of trailing silence
  minSpeechFrames: 3,
});

/** Frame RMS of an int16 buffer (pure; empty frame → 0). */
export function rmsOf(frame: Int16Array): number {
  if (frame.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < frame.length; i++) { const s = frame[i] ?? 0; sum += s * s; }
  return Math.sqrt(sum / frame.length);
}

function resolveOptions(cfg: RmsEndpointingConfig = {}): RmsEndpointerOptions {
  const sampleRate = cfg.sampleRate ?? RMS_ENDPOINTING_DEFAULTS.sampleRate;
  const frameMs = cfg.frameMs ?? RMS_ENDPOINTING_DEFAULTS.frameSamples * 1000 / RMS_ENDPOINTING_DEFAULTS.sampleRate;
  const frameSamples = Math.max(1, Math.round(sampleRate * frameMs / 1000));
  const silenceRms = cfg.silenceRms ?? RMS_ENDPOINTING_DEFAULTS.silenceRms;
  const silenceFramesToEndTurn = cfg.silenceFramesToEndTurn ?? RMS_ENDPOINTING_DEFAULTS.silenceFramesToEndTurn;
  const minSpeechFrames = cfg.minSpeechFrames ?? RMS_ENDPOINTING_DEFAULTS.minSpeechFrames;
  if (!Number.isFinite(sampleRate) || sampleRate <= 0 || !Number.isFinite(silenceRms) || silenceRms < 0
    || !Number.isFinite(silenceFramesToEndTurn) || silenceFramesToEndTurn < 1
    || !Number.isFinite(minSpeechFrames) || minSpeechFrames < 1) {
    throw new Error('rms_endpointing_config_invalid');
  }
  return { sampleRate, frameSamples, silenceRms, silenceFramesToEndTurn, minSpeechFrames };
}

/** Create a deterministic RMS endpointer over 16k mono int16 PCM. */
export function createRmsEndpointer(cfg: RmsEndpointingConfig = {}): RmsEndpointer {
  const options = resolveOptions(cfg);
  let frameIndex = 0;
  let speechFrames = 0;
  let consecutiveSilence = 0;
  let speechStarted = false;
  let ended = false;
  let pending = new Uint8Array(0);                     // odd-byte carry across feed() calls
  return {
    options,
    get speechFrames() { return speechFrames; },
    get ended() { return ended; },
    feedFrame(frame: Int16Array): RmsEndpointEvent[] {
      frameIndex++;
      const rms = rmsOf(frame);
      if (ended) return [];
      if (rms >= options.silenceRms) {
        speechFrames++;
        consecutiveSilence = 0;
        if (!speechStarted && speechFrames >= options.minSpeechFrames) {
          speechStarted = true;
          return [{ type: 'speech_started', frame: frameIndex, rms }];
        }
        return [];
      }
      if (!speechStarted) return [];                   // 未见过语音:纯静音永不切回合
      consecutiveSilence++;
      if (consecutiveSilence >= options.silenceFramesToEndTurn) {
        ended = true;
        return [{ type: 'end_of_turn', frame: frameIndex, speechFrames, silenceFrames: consecutiveSilence }];
      }
      return [];
    },
    feed(chunk: Uint8Array): RmsEndpointEvent[] {
      const events: RmsEndpointEvent[] = [];
      // 恒新建对齐缓冲:上游 chunk 的 byteOffset 可能奇数(Int16Array 视图要求 2 字节对齐)。
      const merged = new Uint8Array(pending.length + chunk.length);
      if (pending.length) merged.set(pending);
      merged.set(chunk, pending.length);
      const wholeBytes = merged.length - (merged.length % 2);          // 完整 int16 样本字节
      const samples = new Int16Array(merged.buffer, 0, wholeBytes >> 1);
      const frameBytes = options.frameSamples * 2;
      const framesDone = Math.floor(samples.length / options.frameSamples);
      for (let f = 0; f < framesDone; f++) {
        events.push(...this.feedFrame(samples.subarray(f * options.frameSamples, (f + 1) * options.frameSamples)));
      }
      pending = merged.slice(framesDone * frameBytes);                 // 帧remainder跨块保留(奇数字节含在内)
      return events;
    },
    reset() {
      pending = new Uint8Array(0);
      consecutiveSilence = 0;
      speechStarted = false;
      ended = false;
      // speechFrames 与 frameIndex 是单调事实,不重置:回合级 endpointer 不复用语音史。
    },
  };
}

/**
 * Wrap a user-audio byte stream with RMS endpointing: every chunk is forwarded
 * unchanged, and the iterable **returns** right after the chunk whose frames
 * fired end_of_turn. Closing the iterable is the endpointing contract: the ASR
 * sender finalizes the upstream task and the turn loop advances on the real
 * final transcript. Deterministic: same audio bytes → same close point.
 * `onEndOfTurn` receives the structural receipt exactly once when it fires.
 */
export function withRmsEndOfTurn(chunks: AsyncIterable<Uint8Array>, cfg: RmsEndpointingConfig = {}, onEndOfTurn?: (info: EndOfTurnInfo) => void): AsyncIterable<Uint8Array> {
  const ep = createRmsEndpointer(cfg);
  return (async function* () {
    for await (const chunk of chunks) {
      const events = ep.feed(chunk);
      yield chunk;
      const end = events.find((ev) => ev.type === 'end_of_turn');
      if (end) {
        const { frame, speechFrames, silenceFrames } = end as { frame: number; speechFrames: number; silenceFrames: number };
        onEndOfTurn?.({ frame, speechFrames, silenceFrames });
        return;
      }
    }
  })();
}

/** Structural receipt of one endpointed turn (for logs/proves; no transcript content). */
export interface EndOfTurnInfo {
  frame: number;
  speechFrames: number;
  silenceFrames: number;
}
