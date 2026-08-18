import { Module } from '@nestjs/common';
import { disabledAsr, disabledTts, disabledStreamingTts, type Asr, type Tts, type StreamingTts } from '@meetwise/ai-runtime';
import { InterviewController } from './interview.controller';
import { InterviewService, VOICE_ASR, VOICE_TTS, VOICE_STREAM_TTS } from './interview.service';

/**
 * Interview module seam. Native voice stays disabled until MODEL-OP-01 binds
 * each media operation to authorization, cost/unknown handling and deletion
 * receipts. Tests inject fake seams directly; configuration must not turn
 * this composition root into a direct provider caller.
 */
@Module({
  controllers: [InterviewController],
  providers: [
    InterviewService,
    { provide: VOICE_ASR, useFactory: (): Asr => disabledAsr() },
    { provide: VOICE_TTS, useFactory: (): Tts => disabledTts() },
    { provide: VOICE_STREAM_TTS, useFactory: (): StreamingTts => disabledStreamingTts() },
  ],
})
export class InterviewModule {}
