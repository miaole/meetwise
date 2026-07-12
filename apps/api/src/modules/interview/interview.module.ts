import { Module } from '@nestjs/common';
import { fakeAsr, fakeTts, fakeStreamingTts, dashscopeAsr, dashscopeTts, dashscopeStreamingTts, type Asr, type Tts, type StreamingTts } from '@meetwise/ai-runtime';
import { InterviewController } from './interview.controller';
import { InterviewService, VOICE_ASR, VOICE_TTS, VOICE_STREAM_TTS } from './interview.service';

/** interview 模块缝。DbService 由全局 PlatformModule 提供。语音 ASR/TTS 客户端由工厂注入:VOICE_FAKE=1(测试)→确定性 fake,否则真 dashscope——让语音端点可端到端测(非硬编 demo)。工厂内工厂懒调用,真实现构造不读 key,prod 路径行为不变。 */
@Module({
  controllers: [InterviewController],
  providers: [
    InterviewService,
    { provide: VOICE_ASR, useFactory: (): Asr => process.env.VOICE_FAKE === '1' ? fakeAsr(process.env.VOICE_FAKE_TRANSCRIPT ?? '用 Redis 令牌桶做限流,Lua 原子扣减保证并发正确') : dashscopeAsr() },
    { provide: VOICE_TTS, useFactory: (): Tts => process.env.VOICE_FAKE === '1' ? fakeTts() : dashscopeTts() },
    { provide: VOICE_STREAM_TTS, useFactory: (): StreamingTts => process.env.VOICE_FAKE === '1' ? fakeStreamingTts() : dashscopeStreamingTts() },
  ],
})
export class InterviewModule {}
