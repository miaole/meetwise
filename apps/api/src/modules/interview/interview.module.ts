import { Module } from '@nestjs/common';
import { createInterviewVoiceSeams, type Asr, type Tts, type StreamingTts } from '@meetwise/ai-runtime';
import { InterviewController } from './interview.controller';
import { InterviewService, VOICE_ASR, VOICE_TTS, VOICE_STREAM_TTS } from './interview.service';

/**
 * Interview module seam. Batch ASR/TTS construct native adapters only when
 * `voice.asr.v1` / `voice.tts.v1` are wired and the matching capability Key
 * exists. Streaming ASR and server turn-taking stay disabled even when
 * `VOICE_STREAM_ASR_*` preview flags or stream Keys are present
 * (`voice.asr-stream.v1` is unwired; PRD-TEST-006 is not verified).
 * Tests may inject fake seams directly.
 */
@Module({
  controllers: [InterviewController],
  providers: [
    InterviewService,
    { provide: VOICE_ASR, useFactory: (): Asr => createInterviewVoiceSeams().asr },
    { provide: VOICE_TTS, useFactory: (): Tts => createInterviewVoiceSeams().tts },
    { provide: VOICE_STREAM_TTS, useFactory: (): StreamingTts => createInterviewVoiceSeams().streamTts },
  ],
})
export class InterviewModule {}
