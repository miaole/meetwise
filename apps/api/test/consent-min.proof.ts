/**
 * CONSENT-MIN HTTP 全链证明（#82 缩水件 purpose 枚举 + #69 缩水件语音同意四小件）。
 *
 * 真本地库（isolated runner 一次性 PostgreSQL）· 真 HTTP 全链 · ASR 不配置（零 Key 零外呼）。
 * a-f 矩阵（REQUEST §3-C2-3）：
 *   a 三合法 purpose POST 200 + 幂等（重复 POST 仍 1 行）+ POST 空 body {} → 缺省 resume_processing 同形断言
 *   b POST {purpose:'garbage'} / {purpose:'interview_prep'}（memory 域值故意打界）→ 400 invalid
 *   c GET / DELETE ?purpose=garbage → 400 invalid（非 strict query:其余键 strip 不拒）
 *   d 无 voice_capture 行 transcribe → 403 {error:'consent_required', purpose:'voice_capture'}
 *   e POST voice_capture 200 → transcribe 重发 → 503 asr_unavailable（=门+fence 已过的可证形状·零外呼）
 *   f DELETE voice_capture → transcribe 403 回（门关）
 * 序钉辅证:隐私围栏(410)先于同意门(403)由 privacy-erasure-http :356-361 既有面承接,本证不打围栏面。
 */
import { boot, mkAssert } from './_neg-harness';

const h = await boot();
const { A, done } = mkAssert('prove:consent-min');
const U = h.U('userA');

// 0152 镜像:sql/ 引导链只授 consent_record SELECT,INSERT;本证 f 案撤回需要 DELETE。
// 真迁移链主证 = unstube-erase / migrate 链;此处仅补行为前置,失败静默(superuser 连接下本就可用)。
try { await h.pool.query('GRANT DELETE ON consent_record TO app_role'); } catch { /* mirror best-effort */ }

// 0058 镜像(assert 函数·byte 同形委托):neg-harness 只镜像了读谓词 interview_privacy_active,
// 未镜像 transcribe 链 guardInterviewPrivacy → assertInterviewPrivacyActive 所调的
// assert_interview_privacy_active(真相=0058 迁移链;围栏 410 面主证=privacy-erasure-http 真链)。
// 此处按 0058 原文同形补委托函数(未围栏路径),fence 立法文件零字节。
await h.pool.query(`
  CREATE OR REPLACE FUNCTION assert_interview_privacy_active(target_interview text)
  RETURNS void
  LANGUAGE plpgsql SECURITY DEFINER
  SET search_path = pg_catalog, public, pg_temp AS $fn$
  BEGIN
    IF NOT interview_privacy_active(target_interview) THEN
      RAISE EXCEPTION 'interview_privacy_fenced' USING ERRCODE='P0001';
    END IF;
  END $fn$;`);

const post = (body: unknown) => h.post('/privacy/consent', U, body);
const purposeRows = async (purpose: string) =>
  Number((await h.pool.query('SELECT count(*)::int n FROM consent_record WHERE owner_user_id=$1 AND purpose=$2', ['userA', purpose])).rows[0]?.n ?? 0);

const transcribeBody = {
  audioBase64: 'AAAA',
  mimeType: 'audio/webm',
  capture: { mode: 'single_local_microphone', consent: true, policyVersion: 'voice_ephemeral_v1' },
};
const transcribe = () => h.post('/interview/IV_ACT/transcribe', U, transcribeBody);

async function main() {
  // ── a 三合法 purpose POST 200 + 幂等 + 空 body 缺省 ──
  for (const purpose of ['resume_processing', 'interview_personalization', 'voice_capture']) {
    const r = await post({ purpose });
    A(`a: POST 合法 purpose=${purpose} → 200 recorded:true`, r.status === 200 && r.body?.recorded === true && typeof r.body?.policyVersion === 'string');
    const r2 = await post({ purpose });
    A(`a: 重复 POST purpose=${purpose} 幂等 → 200 且仍恰 1 行`, r2.status === 200 && (await purposeRows(purpose)) === 1);
  }
  {
    const before = await purposeRows('resume_processing');
    const r = await post({});
    A('a: POST 空 body {} → 200 recorded:true（strict DTO + optional 下缺省行为保持）', r.status === 200 && r.body?.recorded === true);
    A('a: 空 body 缺省落 resume_processing → 仍 1 行（无新行无错值行）', (await purposeRows('resume_processing')) === before && before === 1);
  }

  // ── b 非法 purpose POST → 400 invalid ──
  {
    const r1 = await post({ purpose: 'garbage' });
    A('b: POST {purpose:"garbage"} → 400 invalid', r1.status === 400 && r1.body?.error === 'invalid');
    const r2 = await post({ purpose: 'interview_prep' });
    A('b: POST {purpose:"interview_prep"}（memory 域值打界）→ 400 invalid', r2.status === 400 && r2.body?.error === 'invalid');
  }

  // ── c GET/DELETE 非法 purpose query → 400;非 strict 其余键 strip 不拒 ──
  {
    const g = await h.req('GET', '/privacy/consent?purpose=garbage', U);
    A('c: GET ?purpose=garbage → 400 invalid', g.status === 400 && g.body?.error === 'invalid');
    const d = await h.req('DELETE', '/privacy/consent?purpose=garbage', U);
    A('c: DELETE ?purpose=garbage → 400 invalid', d.status === 400 && d.body?.error === 'invalid');
    const gq = await h.req('GET', '/privacy/consent?purpose=voice_capture&extra=1', U);
    A('c: GET 非严格查询（多余键已去除且不拒绝）→ 200 consented:true', gq.status === 200 && gq.body?.consented === true && gq.body?.purpose === 'voice_capture');
  }

  // ── d 无行 transcribe → 403 consent_required（序钉:410 围栏先判已由 privacy-erasure-http 承接）──
  {
    await h.pool.query("DELETE FROM consent_record WHERE owner_user_id='userA' AND purpose='voice_capture'");
    const r = await transcribe();
    A('d: 无 voice_capture 行 transcribe → 403 consent_required(purpose=voice_capture)',
      r.status === 403 && r.body?.error === 'consent_required' && r.body?.purpose === 'voice_capture');
  }

  // ── e POST voice_capture 200 → 门过 → 503 asr_unavailable（ASR 未配置·零外呼）──
  {
    const grant = await post({ purpose: 'voice_capture' });
    A('e: POST voice_capture → 200 recorded:true', grant.status === 200 && grant.body?.recorded === true);
    const r = await transcribe();
    A('e: 有行 transcribe → 门+fence 过 → 503 asr_unavailable（503 形状≠ASR 已配置）',
      r.status === 503 && r.body?.error === 'asr_unavailable');
  }

  // ── f DELETE voice_capture → 门关 → 403 回 ──
  {
    const w = await h.req('DELETE', '/privacy/consent?purpose=voice_capture', U);
    A('f: DELETE ?purpose=voice_capture → 200 withdrawn:true', w.status === 200 && w.body?.withdrawn === true);
    const r = await transcribe();
    A('f: 撤回后 transcribe → 门关 → 403 consent_required（诚实出路=回卡,不假前进）',
      r.status === 403 && r.body?.error === 'consent_required' && r.body?.purpose === 'voice_capture');
    A('f: 撤回=行删除（voice_capture 恰 0 行）', (await purposeRows('voice_capture')) === 0);
  }

  await done();
}

await main();
