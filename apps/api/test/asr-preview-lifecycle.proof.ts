/**
 * R1/R2/R6 预览语音合同。默认流式开关保持关闭。不是实麦，也不是供应商整链。
 * releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendAsrSentenceFinal } from '@meetwise/contracts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const failures: string[] = [];
const A = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) failures.push(name);
};

A('单句逐字不变', appendAsrSentenceFinal('', '甲句。', 'final') === '甲句。');
A('两句用换行累计', appendAsrSentenceFinal('甲句。', '乙句。', 'final') === '甲句。\n乙句。');
A('第三句继续累计', appendAsrSentenceFinal('甲句。\n乙句。', '丙句。', 'final') === '甲句。\n乙句。\n丙句。');
A('partial 不入稿', appendAsrSentenceFinal('甲句。', '还在说', 'partial') === '甲句。');
A('空句不入稿', appendAsrSentenceFinal('甲句。', '   ', 'final') === '甲句。');
A('连续重复的同一句不累计', appendAsrSentenceFinal('甲句。', '甲句。', 'final') === '甲句。');

const controller = readFileSync(resolve(root, 'apps/api/src/modules/interview/interview.controller.ts'), 'utf8');
const listen = controller.slice(controller.indexOf("async listenStream("));
A('正常结束不再把请求体 close 当成取消', listen.includes("req.raw.on('aborted'") && !listen.includes("req.raw.on('close'"));
A('响应未写完断开仍然取消', listen.includes('reply.raw.on(\'close\'') && listen.includes('writableEnded'));
A('服务端记账走句级累计，不再覆盖', listen.includes('appendAsrSentenceFinal') && !listen.includes('lastFinal = ev.text'));

const panel = readFileSync(resolve(root, 'apps/web/components/VoiceCallPanel.tsx'), 'utf8');
const stream = panel.slice(panel.indexOf('const streamAnswer = useCallback'));
const fetchAt = stream.indexOf('listen/stream');
const listenAt = stream.indexOf("setStatus('listening')");
const tickAt = stream.indexOf('requestAnimationFrame(tick)');
A('流式开关仍然关闭', /const ENABLE_STREAMING_ASR = false;/.test(panel));
A('浏览器在等待响应前就启动电平和听音状态', tickAt > 0 && listenAt > 0 && fetchAt > listenAt && fetchAt > tickAt);
A('浏览器提交稿走同一句级累计', stream.includes('appendAsrSentenceFinal') && !stream.includes('finalText = ev.text'));

const exit = failures.length === 0 ? 0 : 1;
console.log(`ATTEMPT_END EXIT=${exit} fail=${failures.length}`);
process.exit(exit);
