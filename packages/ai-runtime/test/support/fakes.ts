/**
 * @meetwise/ai-runtime · fake 族 test-support 子路径导出（#74 · 形制沿 `./g7-test-support` 先例）。
 *
 * 生产公共主入口（'@meetwise/ai-runtime'）**零 fake 导出**——fake 实现体仍在 src（voice.ts /
 * embedder.ts / voice-stream.ts，包内相对引用可达），但公共可达面只保留本子路径：
 *   - 生产码禁 import（越线即 #74 边界证明红，见 test/test-support-fakes.proof.ts）；
 *   - 测试统一 `import { fakeAsr... } from '@meetwise/ai-runtime/test-support'`。
 * 覆盖族域（5E REQUEST §1-簇B rev2 全域口径）：fakeAsr / fakeTts / fakeEmbedder /
 * fakeStreamingAsr / fakeStreamingTts。disabled*（真关断 stub，生产 seams 在用）不在本族、
 * 仍留主入口导出。
 */
export { fakeAsr, fakeTts } from '../../src/voice.ts';
export { fakeEmbedder } from '../../src/embedder.ts';
export { fakeStreamingAsr, fakeStreamingTts } from '../../src/voice-stream.ts';
