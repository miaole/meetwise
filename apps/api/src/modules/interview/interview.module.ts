import { Module } from '@nestjs/common';
import { createInterviewVoiceSeams, type Asr, type Tts, type StreamingTts } from '@meetwise/ai-runtime';
import { InterviewController } from './interview.controller';
import { InterviewService, VOICE_ASR, VOICE_TTS, VOICE_STREAM_TTS } from './interview.service';

/**
 * Interview module seam. Batch ASR/TTS construct native adapters only when
 * `voice.asr.v1` / `voice.tts.v1` are wired and the matching capability Key
 * exists. Streaming stays disabled. Tests may inject fake seams directly.
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
