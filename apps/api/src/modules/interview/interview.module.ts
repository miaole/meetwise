import { Module } from '@nestjs/common';
import { createInterviewVoiceSeams, type Asr, type Tts, type StreamingAsr, type StreamingTts } from '@meetwise/ai-runtime';
import { InterviewController } from './interview.controller';
import { InterviewService, VOICE_ASR, VOICE_STREAM_ASR, VOICE_STREAM_TTS, VOICE_TTS } from './interview.service';

/**
 * Interview module seam. Batch ASR/TTS and the stream ASR/TTS seams construct
 * native adapters only when the matching operation is wired and the matching
 * capability Key exists (stream ASR: `voice.asr-stream.v1` +
 * `DASHSCOPE_STREAM_ASR_API_KEY`; stream TTS: `voice.tts-stream.v1` +
 * `DASHSCOPE_STREAM_TTS_API_KEY`). The `VOICE_STREAM_ASR_*` dual preview flags
 * still gate inside `transcribeStream`/`synthesizeStream` and the product
 * `/listen/stream`/`/speak/stream` pipes — a Key alone never opens a
 * WebSocket. Server turn-taking stays disabled even when preview flags and
 * stream Keys are present (PRD-TEST-006 turn-taking is not built).
 * Tests may inject fake seams directly.
 */
@Module({
  controllers: [InterviewController],
  providers: [
    InterviewService,
    { provide: VOICE_ASR, useFactory: (): Asr => createInterviewVoiceSeams().asr },
    { provide: VOICE_TTS, useFactory: (): Tts => createInterviewVoiceSeams().tts },
    { provide: VOICE_STREAM_TTS, useFactory: (): StreamingTts => createInterviewVoiceSeams().streamTts },
    { provide: VOICE_STREAM_ASR, useFactory: (): StreamingAsr => createInterviewVoiceSeams().streamAsr },
  ],
})
export class InterviewModule {}
