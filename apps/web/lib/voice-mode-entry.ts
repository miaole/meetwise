/**
 * 语音模式入口显示开关（#267 · 纯前端静态开关：零后端、零 API、零新基建）。
 *
 * 裁决⑦（协调方现裁 2026-10-11）= **缺省显示**：未配置本开关时「语音模式」按钮
 * 照常渲染（=现状字节，`e2e-ui/voice-duplex.spec.ts` 的按钮消费面天然绿）。
 * 要收起入口，显式设 `NEXT_PUBLIC_VOICE_MODE_ENTRY=off`（大小写/首尾空白不敏感，
 * 唯独 `'off'` 关闭，关闭→按钮不渲染）。其余任意值（含未设置/on/1）= 显示。
 *
 * 两机制勿混（#267 审计钉）：这是 **UI 入口显示开关**；服务端限频/回落闸在
 * apps/api 的 interview.service（private voiceGate）——本开关不影响任何服务端行为，
 * 也不发明语音能力。
 */
export function isVoiceModeEntryVisible(raw: string | undefined = process.env.NEXT_PUBLIC_VOICE_MODE_ENTRY): boolean {
  return raw?.trim().toLowerCase() !== 'off';
}
