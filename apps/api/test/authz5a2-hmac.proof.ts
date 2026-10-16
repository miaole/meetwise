/**
 * authz5a2-hmac.proof.ts — AUTHZ-HARDEN 5A-2 #100 HMAC 验签合一证明(静态源断言+单测两形)。
 *
 * ①静态源形:
 *   - commerce.service.ts 内 createHmac 恰 1 处(verifyCommerceSig 函数体内)=三内联点清零+公共函数单源;
 *   - 三调用点收敛=payWebhook/refundWebhook 各 1 次 verifyCommerceSig + payCallback 方法已不存在;
 *   - commerce.controller.ts pay-callback 路由段无 UseGuards(收权·裁决项⑤纯签名);
 *   - privacy.service.ts preview digest 异用途零触(席1 边界=createHmac 独立于 commerce 单源)。
 * ②行为形(直调 verifyCommerceSig·零 HTTP 零 DB·est live=0):
 *   - 合法 fresh ts 签名通过(paid/refunded 两 kind);
 *   - 篡改/等长伪签/短签 → 403 bad_signature(kind 绑定:paid 签打 refunded → 403);
 *   - 缺 ts/非数 ts/超 ±300s 窗(旧/未来) → 400 invalid_callback(防重放窗收口);
 *   - 缺 providerTxn/sig → 400(结构缺字段先于验签)。
 *   运行:pnpm -C apps/api authz5a2:hmac(纯本地·隔离库非必需)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHmac } from 'node:crypto';
import { verifyCommerceSig, PAY_SIG_REPLAY_WINDOW_SECONDS } from '../src/modules/commerce/commerce.service.ts';

const here = dirname(fileURLToPath(import.meta.url));
const read = (p: string) => readFileSync(join(here, '..', p), 'utf8');

process.env.PAY_PROVIDER_SECRET ??= 'authz5a2-hmac-proof-secret-not-production';

let total = 0, failures = 0;
const A = (name: string, cond: boolean) => { total++; if (!cond) { failures++; console.log(`FAIL  ${name}`); } else console.log(`PASS  ${name}`); };
const sigOf = (payload: string) => createHmac('sha256', process.env.PAY_PROVIDER_SECRET!).update(payload).digest('hex');
const statusOf = (e: unknown): number => (e as { status?: number })?.status ?? -1;
const errOf = (e: unknown): string => (e as { response?: { error?: string } })?.response?.error ?? '';

async function main() {
  // ── 形一:静态源断言(read 基准=apps/api) ──
  const svc = read('src/modules/commerce/commerce.service.ts');
  const ctrl = read('src/modules/commerce/commerce.controller.ts');
  const privacy = read('src/modules/privacy/privacy.service.ts');

  const hmacCount = (svc.match(/createHmac\(/g) ?? []).length;
  A(`静态: commerce.service.ts createHmac 恰 1 处(三内联点清零·公共函数单源·实际 ${hmacCount})`, hmacCount === 1);
  A('静态: verifyCommerceSig 为导出公共函数', svc.includes('export function verifyCommerceSig'));
  const verifyCalls = (svc.match(/verifyCommerceSig\(id, body, '(?:paid|refunded)'\)/g) ?? []).length;
  A(`静态: 三调用点收敛=verifyCommerceSig 恰 2 管道调用+payCallback 已并入(实际 ${verifyCalls})`, verifyCalls === 2 && !svc.includes('async payCallback('));
  A('静态: 防重放窗常量在位(300s)', PAY_SIG_REPLAY_WINDOW_SECONDS === 300 && svc.includes('PAY_SIG_REPLAY_WINDOW_SECONDS = 300'));

  const cbStart = ctrl.indexOf("@Post('orders/:id/pay-callback')");
  const cbSeg = ctrl.slice(cbStart).split('\n').slice(0, 8).join('\n');   // 路由头:装饰器+收权注释+方法体(恰 8 行)
  A('静态: pay-callback 路由段无 UseGuards(收权·纯签名访问)', cbStart >= 0 && !cbSeg.includes('UseGuards'));
  A('静态: pay-callback 委托 payWebhook 同管道', cbSeg.includes('this.commerce.payWebhook(id, b)'));

  const privacyHmac = privacy.match(/createHmac\('sha256', secret\)\.update\(`privacy-preview:/);
  A('静态: privacy.service preview digest 异用途零触(席1 边界·不经 commerce 单源)', !!privacyHmac);

  // ── 形二:行为断言(直调单源函数) ──
  const id = 'ord_5a2_unit';
  const txn = 'txn_5a2_unit';
  const fresh = Date.now();
  A('行为: 合法 paid 签名(fresh ts)通过(不抛)', (() => { try { verifyCommerceSig(id, { providerTxn: txn, ts: fresh, sig: sigOf(`${id}:${txn}:paid:${fresh}`) }, 'paid'); return true; } catch { return false; } })());
  A('行为: 合法 refunded 签名通过(不抛)', (() => { try { verifyCommerceSig(id, { providerTxn: txn, ts: fresh, sig: sigOf(`${id}:${txn}:refunded:${fresh}`) }, 'refunded'); return true; } catch { return false; } })());

  const expect = (fn: () => void, status: number, error?: string) => {
    try { fn(); return false; } catch (e) { return statusOf(e) === status && (error === undefined || errOf(e) === error); }
  };
  A('行为: 等长伪签 → 403 bad_signature', expect(() => verifyCommerceSig(id, { providerTxn: txn, ts: fresh, sig: sigOf('forged-unrelated') }, 'paid'), 403, 'bad_signature'));
  A('行为: 短签 → 403 bad_signature(长度分支)', expect(() => verifyCommerceSig(id, { providerTxn: txn, ts: fresh, sig: 'zz' }, 'paid'), 403, 'bad_signature'));
  A('行为: kind 绑定(paid 签打 refunded) → 403', expect(() => verifyCommerceSig(id, { providerTxn: txn, ts: fresh, sig: sigOf(`${id}:${txn}:paid:${fresh}`) }, 'refunded'), 403, 'bad_signature'));
  A('行为: 错单签名(他单 id 入签) → 403', expect(() => verifyCommerceSig(id, { providerTxn: txn, ts: fresh, sig: sigOf(`ord_other:${txn}:paid:${fresh}`) }, 'paid'), 403, 'bad_signature'));

  A('行为: 缺 ts → 400 invalid_callback', expect(() => verifyCommerceSig(id, { providerTxn: txn, sig: sigOf(`${id}:${txn}:paid:${fresh}`) }, 'paid'), 400, 'invalid_callback'));
  A('行为: 非数 ts → 400 invalid_callback', expect(() => verifyCommerceSig(id, { providerTxn: txn, ts: 'soon' as unknown as number, sig: sigOf(`${id}:${txn}:paid:x`) }, 'paid'), 400, 'invalid_callback'));
  const old = Date.now() - (PAY_SIG_REPLAY_WINDOW_SECONDS * 1000) - 1000;
  A('行为: 超窗旧 ts(重放捕获回调) → 400 invalid_callback', expect(() => verifyCommerceSig(id, { providerTxn: txn, ts: old, sig: sigOf(`${id}:${txn}:paid:${old}`) }, 'paid'), 400, 'invalid_callback'));
  const future = Date.now() + (PAY_SIG_REPLAY_WINDOW_SECONDS * 1000) + 1000;
  A('行为: 未来超窗 ts(预签) → 400 invalid_callback', expect(() => verifyCommerceSig(id, { providerTxn: txn, ts: future, sig: sigOf(`${id}:${txn}:paid:${future}`) }, 'paid'), 400, 'invalid_callback'));
  A('行为: 缺 providerTxn → 400 invalid_callback', expect(() => verifyCommerceSig(id, { ts: fresh, sig: sigOf(`${id}:x:paid:${fresh}`) }, 'paid'), 400, 'invalid_callback'));
  A('行为: 缺 sig → 400 invalid_callback', expect(() => verifyCommerceSig(id, { providerTxn: txn, ts: fresh }, 'paid'), 400, 'invalid_callback'));
  const edge = Date.now() - (PAY_SIG_REPLAY_WINDOW_SECONDS * 1000) + 2000;   // 窗内边界(298s 前)
  A('行为: 窗内边界 ts(≈298s 前)仍通过(不抛)', (() => { try { verifyCommerceSig(id, { providerTxn: txn, ts: edge, sig: sigOf(`${id}:${txn}:paid:${edge}`) }, 'paid'); return true; } catch { return false; } })());

  console.log(`\n${failures === 0 ? '✓' : '✗'} authz5a2:hmac — ${total} 断言, 失败 ${failures}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
