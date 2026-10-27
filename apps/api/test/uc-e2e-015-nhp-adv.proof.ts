/**
 * UC-E2E-015 · ADV isolated PG/HTTP evidence · NHP-015-ADV-01
 * (REQUEST ai-docs/delivery/harness/nhp-batch-c-REQUEST.md §1 Case 2 · 矩阵 :120 ADV 列)
 *
 * Evidence layer: isolated real PG + real Nest HTTP (createApp+listen(0)+fetch,
 * _neg-harness three-layer shell · uc-e2e-025-nhp-bound-isolated.proof.ts 先例形).
 * Scope: resume 上传对抗缝(声明格式 vs 实际字节魔数 fail-closed / 令牌桶 429 / 全局解析槽 503 /
 * NUL 注入字节) — 与既有 F1–F5 旁证(uc-e2e-015-resume-ingest-failures.proof.ts·零改动)reason 级可分
 * (magic_mismatch / too_many_requests / server_busy ∉ {encrypted, parse_failed, unsupported_file_format,
 * empty_file, file_too_large})· Ban 借本刀收据宣 F 族加强。
 *
 * Arms:
 *   PC  = 合法纯文本上传 200 ingested(对照 · 零扣费面)
 *   A1  = 声明 application/pdf + zip/docx 字节体(PK 头) → 422 magic_mismatch(fail-closed 先于解析
 *         resume.service:66-69 ← resume-extract assertMagicMatchesDeclaration pdf 分支)
 *   A2  = text 声明偷渡 zip 空 ARC 三签(PK\x05\x06) → 422 magic_mismatch(:91 防伪称纯文本偷渡压缩体)
 *   A3  = text 声明偷渡 %PDF- 头 / OLE2 头(D0CF11E0) → 422 magic_mismatch(:92/:93)
 *   A4  = 含 NUL(\u0000) 的 ≥20 字文本 → 200 且落库 blob 解密面零 NUL(resume.service:210-211 剥除 ·
 *         注入字节不 500)
 *   A5  = 专用独立 principal 同 principal 连发 >15 次(突发桶 capacity 15 · refill 0.1/s 耗尽) → 第 16 次
 *         429 too_many_requests(:38-41 反滥用缝真行使 · 拒面零消费零半写)
 *   V1  = 专用独立 principal + RESUME_PARSE_MAX=1 进程窗 + N=3 并发真 PDF 上传 → 败者 ≥1 收 503
 *         server_busy、胜者(首请求)不受损 200 ingested(:50-52 全局解析槽 · 窗值披露 D2: 产品缺省 6 不改 ·
 *         仅测试进程 env)
 *   N   = 对抗拒面全程零 entitlement 消费净账(415/422/429/503 全零扣)
 * 臂预算申明: A5/V1 及 PC/A1–A4 各用独立 principal · per-principal 突发桶预算互不挤占(防 A5 突发耗尽
 * 误伤他臂 429 串扰)。
 *
 * 夹具面(如实申明): 本 proof 于 boot 后重放真迁移链 packages/db/migrations/0189_api_harden_shared_state.sql
 * (expand-only 幂等·真相=迁移链·_neg-harness 未载该文件)使 gateway_slot_lease_acquire/gateway_rl_bucket_take
 * 在隔离库在场 — 'resume-parse:global' 槽系 :global 共享键走 PG lease;缺该函数时 RateLimitService 对
 * 共享键 fail-open(产品降级语义)·V1 的 503 臂将不可行使。零产品码触·零新迁移。零 INSERT 夹具豁免行使
 * (consent 走产品路径 POST /privacy/consent·上传走产品路径·如实申明)。
 *
 * Live-key isolation (uc025 bound-isolated R6 同形): this proof deletes MODEL_API_KEY and MODEL_BASE_URL
 * in-process FIRST, then asserts unset before and after boot. Zero provider egress · est live=0.
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · row/ADV blind→case-only 措辞 ·
 * EXIT0=case≠covered · Ban 借本收据宣 covered/簇加强 · ⛔push
 *
 *   pnpm uc015:nhp-adv:prove
 *   pnpm -C apps/api prove:uc015-nhp-adv   (raw; needs isolated DATABASE_URL)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// V1 窗值钉(REQUEST §1 case 2): PARSE_MAX 系模块载入期常量(resume.service.ts:22)——必须先于任何
// api 模块导入置进程 env。动态 import 隔离载入序·产品缺省 6 不改(仅本测试进程窗)。
process.env.RESUME_PARSE_MAX = '1';

const CMD = 'pnpm uc015:nhp-adv:prove';
const CASE_ID = 'NHP-015-ADV-01';
const ATTEMPT_STARTED_AT = new Date().toISOString();
const { boot } = await import('./_neg-harness');

type Cls = 'PC' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'V1' | 'N' | 'ISO' | 'PIN';
let total = 0;
const failures: { cls: Cls; name: string }[] = [];
const A = (cls: Cls, name: string, cond: boolean) => {
  total++;
  if (!cond) {
    failures.push({ cls, name });
    console.log(`FAIL  [${cls}] ${name}`);
  } else {
    console.log(`PASS  [${cls}] ${name}`);
  }
};

/** 正确 xref 的最小真 PDF(可解析·文本层 ≥20 字)。 */
function realPdfFixture(tag: string): Buffer {
  const text = `Senior backend engineer with Go and Kubernetes ${tag}`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    null as string | null, // stream object filled below (Length depends on payload)
  ];
  const stream = `BT /F1 14 Tf 72 720 Td (${text.replace(/([()\\])/g, '\\$1')}) Tj ET`;
  objects[4] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  const header = '%PDF-1.4\n';
  const body: string[] = [];
  const offsets: number[] = [];
  let pos = header.length;
  objects.forEach((obj, i) => {
    offsets.push(pos);
    const chunk = `${i + 1} 0 obj\n${obj}\nendobj\n`;
    body.push(chunk);
    pos += chunk.length;
  });
  const xrefPos = pos;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(header + body.join('') + xref + trailer, 'latin1');
}

const uploadFile = (h: Awaited<ReturnType<typeof boot>>, principal: string, dto: { filename: string; mimeType: string; contentBase64: string }) =>
  h.post('/resume/file', h.U(principal), dto);
const uploadText = (h: Awaited<ReturnType<typeof boot>>, principal: string, text: string) =>
  h.post('/resume', h.U(principal), { text });
const consent = async (h: Awaited<ReturnType<typeof boot>>, principal: string) =>
  h.post('/privacy/consent', h.U(principal), { purpose: 'resume_processing' });
const consumptionCount = async (h: Awaited<ReturnType<typeof boot>>, principal: string) =>
  Number((await h.pool.query(
    'SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id=$1',
    [principal],
  )).rows[0]?.n ?? 0);
const resumeCount = async (h: Awaited<ReturnType<typeof boot>>, principal: string) =>
  Number((await h.pool.query(
    'SELECT count(*)::int AS n FROM resume WHERE owner_user_id=$1',
    [principal],
  )).rows[0]?.n ?? 0);

(async () => {
  console.log(`UC-E2E-015 ${CASE_ID} isolated PG/HTTP ADV evidence (对抗注入/伪造声明面)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained');
  console.log('F1–F5(uc-e2e-015-resume-ingest-failures·0d0fc91e) = 既有旁证零改动 · reason 级可分 · Ban 互借');
  console.log('EXIT0=case≠covered · 行 ADV blind→case-only 措辞 · est live=0');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · Ban fake-green\n`);

  // R6 live-key isolation: shell strip list lacks MODEL_API_KEY → in-process self-delete pre-boot.
  delete process.env.MODEL_API_KEY;
  delete process.env.MODEL_BASE_URL;
  A('ISO', 'model-key-unset-in-process(self-deleted pre-boot · shell strip list lacks MODEL_API_KEY)',
    process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);

  const h = await boot();
  const pool = h.pool;
  A('ISO', 'model-key-still-unset-after-boot(no re-import regression)',
    process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);

  // 0189 真迁移链重放(夹具面·expand-only 幂等·真相=迁移链): 共享槽/桶 PG lease 函数在场 —
  // 缺函数时 RateLimitService 对 :global 共享键 fail-open(产品降级语义)·V1 的 503 臂不可行使。
  const mig0189 = readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0189_api_harden_shared_state.sql', import.meta.url)), 'utf8');
  await pool.query(mig0189);
  // 0121 真迁移链重放(夹具面·REVOKE+GRANT 幂等·真相=迁移链): harness sql/01 重建 app_role 会抹
  // pgp_sym_encrypt EXECUTE ACL — PC/A5/V1 合法上传全链(blob 加密)在 harness 面行使所需。
  const mig0121 = readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0121_resume_pgcrypto_runtime_acl.sql', import.meta.url)), 'utf8');
  await pool.query(mig0121);
  const fn = await pool.query("SELECT to_regproc('public.gateway_slot_lease_acquire')::text AS f, to_regproc('public.gateway_rl_bucket_take')::text AS g");
  A('ISO', 'gateway_slot_lease_acquire/gateway_rl_bucket_take 在场(0189 真迁移链重放)',
    !!fn.rows[0]?.f && !!fn.rows[0]?.g);
  console.log('PIN   NHP-015-ADV-ISO-0189-REPLAY: harness 面迁移链重放(≠ 0189 全迁移 prove·真相=迁移链 api-harden:prove)');
  console.log('PIN   NHP-015-ADV-ISO-0121-REPLAY: harness 面迁移链重放(pgp ACL·真相=迁移链 migrate 全链)');

  // V1 窗值披露(D2): 产品缺省 6 不改 · 仅本测试进程窗 RESUME_PARSE_MAX=1。
  A('PIN', 'RESUME_PARSE_MAX=1 process window(self-declared pre-import · product default 6 untouched)',
    process.env.RESUME_PARSE_MAX === '1');

  const S = Date.now().toString(36).toUpperCase();
  // 臂预算申明: 每臂独立 principal — per-principal 突发桶(capacity 15)预算互不挤占。
  const PPC = `nhp015pc_${S}`;
  const PA1 = `nhp015a1_${S}`;
  const PA2 = `nhp015a2_${S}`;
  const PA3 = `nhp015a3_${S}`;
  const PA4 = `nhp015a4_${S}`;
  const PA5 = `nhp015a5_${S}`;
  const PV1 = `nhp015v1_${S}`;
  for (const p of [PPC, PA1, PA2, PA3, PA4, PA5, PV1]) {
    const r = await consent(h, p);
    if (r.status !== 200) console.log(`SEED_FAIL consent ${p} status=${r.status} body=${JSON.stringify(r.body)}`);
  }

  const pcBefore = await consumptionCount(h, PPC);

  // ── PC: 合法纯文本上传 200 ingested(对照 · 零扣费面) ──
  {
    const text = `NHP015 PC baseline resume ${S} — senior platform engineer, distributed systems, Go/Kubernetes.`;
    const r = await uploadFile(h, PPC, { filename: 'pc.txt', mimeType: 'text/plain', contentBase64: Buffer.from(text, 'utf8').toString('base64') });
    console.log(`PC_HTTP  status=${r.status} body=${JSON.stringify(r.body)}`);
    A('PC', 'legal text upload → 200 status=ingested', r.status === 200 && r.body?.status === 'ingested');
    A('PC', 'PC 零扣费面(upload 链路零 entitlement 触点)', (await consumptionCount(h, PPC)) === pcBefore);
  }

  // ── A1: 声明 application/pdf + zip/docx 字节体 → 422 magic_mismatch(fail-closed 先于解析) ──
  {
    const zipBytes = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from('fake-docx-payload-not-a-real-zip', 'utf8')]);
    const r = await uploadFile(h, PA1, { filename: 'cv.pdf', mimeType: 'application/pdf', contentBase64: zipBytes.toString('base64') });
    console.log(`A1_HTTP  status=${r.status} body=${JSON.stringify(r.body)}`);
    A('A1', 'declared pdf + zip bytes → 422 magic_mismatch(非 encrypted/parse_failed/unsupported·reason 级可分)',
      r.status === 422 && r.body?.error === 'magic_mismatch');
    A('A1', 'A1 零落库(拒面零半写·resume 行 0)', (await resumeCount(h, PA1)) === 0);
  }

  // ── A2: text 声明偷渡 zip(PK\x05\x06 空 ARC 签) → 422 magic_mismatch(:91 三签防偷渡) ──
  {
    const zipArc = Buffer.concat([Buffer.from([0x50, 0x4b, 0x05, 0x06]), Buffer.alloc(16, 0x00), Buffer.from('smuggled-archive-body', 'utf8')]);
    const r = await uploadFile(h, PA2, { filename: 'notes.txt', mimeType: 'text/plain', contentBase64: zipArc.toString('base64') });
    console.log(`A2_HTTP  status=${r.status} body=${JSON.stringify(r.body)}`);
    A('A2', 'declared text + zip ARC signature → 422 magic_mismatch(伪称纯文本偷渡压缩体被拒)',
      r.status === 422 && r.body?.error === 'magic_mismatch');
    A('A2', 'A2 零落库', (await resumeCount(h, PA2)) === 0);
  }

  // ── A3: text 声明偷渡 %PDF- 头 / OLE2 头 → 422 magic_mismatch(:92/:93) ──
  {
    const pdfHead = Buffer.from('%PDF-1.4\nsmuggled-pdf-bytes-inside-text-declaration', 'utf8');
    const r1 = await uploadFile(h, PA3, { filename: 'a3.txt', mimeType: 'text/plain', contentBase64: pdfHead.toString('base64') });
    A('A3', 'declared text + %PDF- header → 422 magic_mismatch', r1.status === 422 && r1.body?.error === 'magic_mismatch');
    const ole2 = Buffer.concat([Buffer.from([0xd0, 0xcf, 0x11, 0xe0]), Buffer.alloc(16, 0xa1), Buffer.from('smuggled-ole2-body', 'utf8')]);
    const r2 = await uploadFile(h, PA3, { filename: 'a3b.txt', mimeType: 'text/plain', contentBase64: ole2.toString('base64') });
    A('A3', 'declared text + OLE2 header(D0CF11E0) → 422 magic_mismatch', r2.status === 422 && r2.body?.error === 'magic_mismatch');
    A('A3', 'A3 零落库', (await resumeCount(h, PA3)) === 0);
  }

  // ── A4: 含 NUL 的 ≥20 字文本 → 200 且落库 blob 解密面零 NUL(:210-211 剥除·注入字节不 500) ──
  {
    const marker = `NHP015A4NULPROBE${S}`;
    const text = `简历正文 ${marker} 高级后端工程师\u0000分布式系统\u0000经验丰富`;
    const r = await uploadText(h, PA4, text);
    console.log(`A4_HTTP  status=${r.status} body=${JSON.stringify(r.body)}`);
    A('A4', 'text with NUL bytes → 200 ingested(不 500·NUL 非法字节被剥除)', r.status === 200 && r.body?.status === 'ingested');
    const blobRow = await pool.query(
      'SELECT pgp_sym_decrypt(rb.ciphertext, $3) AS plain FROM resume_blob rb WHERE rb.resume_id=$1 AND rb.owner_user_id=$2',
      [String(r.body?.resumeId), PA4, process.env.RESUME_ENC_KEY],
    );
    const plain = String(blobRow.rows[0]?.plain ?? '');
    A('A4', '落库 blob 解密面零 NUL(注入字节未透传存储)', !plain.includes('\u0000'));
    A('A4', '解密文本内容完整(剥除非截断·marker 在场)', plain.includes(marker));
  }

  // ── A5: 专用独立 principal 连发 >15 → 第 16 次 429 too_many_requests(:38-41 突发桶 15 耗尽) ──
  {
    const before = await consumptionCount(h, PA5);
    const statuses: number[] = [];
    const errors: string[] = [];
    for (let i = 0; i < 16; i++) {
      const text = `NHP015 A5 burst request ${i}/${S} — unique resume payload to avoid dedup mixing ${Math.random().toString(36).slice(2)}`;
      const r = await uploadFile(h, PA5, { filename: `a5-${i}.txt`, mimeType: 'text/plain', contentBase64: Buffer.from(text, 'utf8').toString('base64') });
      statuses.push(r.status);
      if (r.body?.error) errors.push(String(r.body.error));
    }
    console.log(`A5_HTTP  statuses=${JSON.stringify(statuses)}`);
    A('A5', 'first 15 within burst capacity → 200', statuses.slice(0, 15).every((s) => s === 200));
    A('A5', '16th request → 429 too_many_requests(突发桶耗尽真行使)', statuses[15] === 429 && errors.includes('too_many_requests'));
    A('A5', 'A5 拒面零消费(entitlement consumption 行 0)', (await consumptionCount(h, PA5)) === before && before === 0);
    A('A5', 'A5 拒面零半写(恰 15 行 resume·第 16 次零行)', (await resumeCount(h, PA5)) === 15);
  }

  // ── V1: 专用独立 principal + PARSE_MAX=1 窗 + N=3 并发真 PDF → 败者 ≥1 收 503 server_busy ──
  {
    const pdfs = [realPdfFixture(`v1a-${S}`), realPdfFixture(`v1b-${S}`), realPdfFixture(`v1c-${S}`)];
    const rs = await Promise.all(pdfs.map((pdf, i) => uploadFile(h, PV1, {
      filename: `v1-${i}.pdf`,
      mimeType: 'application/pdf',
      contentBase64: pdf.toString('base64'),
    })));
    const busy = rs.filter((r) => r.status === 503 && r.body?.error === 'server_busy');
    const ingested = rs.filter((r) => r.status === 200 && r.body?.status === 'ingested');
    console.log(`V1_HTTP  statuses=${JSON.stringify(rs.map((r) => ({ s: r.status, e: r.body?.error ?? r.body?.status })))} (window RESUME_PARSE_MAX=1)`);
    A('V1', 'N=3 concurrent real-PDF uploads → 败者 ≥1 收 503 server_busy(全局解析槽 capacity=1)',
      busy.length >= 1);
    A('V1', '胜者(首请求)不受损 — 每个非 503 响应均 200 ingested 完整体(零半写零损伤)',
      ingested.length === rs.length - busy.length && ingested.length >= 1
      && ingested.every((r) => typeof r.body?.resumeId === 'string'));
    A('V1', 'V1 拒面零消费', (await consumptionCount(h, PV1)) === 0);
    A('V1', 'V1 落库恰=胜者数(503 败者零行)', (await resumeCount(h, PV1)) === ingested.length);
  }

  // ── N: 对抗拒面全程零 entitlement 消费净账(422/429/503 全零扣) ──
  {
    for (const [name, p] of [['A1', PA1], ['A2', PA2], ['A3', PA3], ['A4', PA4], ['A5', PA5], ['V1', PV1]] as const) {
      A('N', `全程净账审计 ${name}(零 consumption 行·upload 链路零 entitlement 触点)`, (await consumptionCount(h, p)) === 0);
    }
  }

  const attemptEndedAt = new Date().toISOString();
  const exit = failures.length === 0 ? 0 : 1;
  console.log('');
  console.log(`ATTEMPT_END  iso=${attemptEndedAt} EXIT=${exit} total=${total} fail=${failures.length}`);
  if (failures.length) {
    console.log(`GAP  ${CASE_ID}  ${failures.length} assertion(s) failed:`);
    for (const f of failures) console.log(`GAP_DETAIL  [${f.cls}] ${f.name}`);
  } else {
    console.log(`PASS  ${CASE_ID}  isolated PG+HTTP ADV evidence (PC+A1–A5+V1+N)`);
    console.log('HTTP_ERROR_PIN  422 magic_mismatch · 429 too_many_requests · 503 server_busy · 200 ingested(合法对照/NUL 剥除)');
    console.log('EVIDENCE_SHAPE  isolated three-layer shell + real HTTP + real PG · 0189 真迁移链重放(共享槽 lease) · 与 F1–F5 reason 级可分互不替代');
  }
  console.log('ROW_STILL_GAP  UC-E2E-015 ADV 列 blind→case-only 措辞. NEG/FAULT/BOUND partial. coveredCount=8.');
  console.log('NOTE  EXIT0≠covered≠nail≠HA · 窗值披露 D2: RESUME_PARSE_MAX 仅测试进程窗(产品缺省 6 不改) · post dual e2e+privacy still required · actualSpendCny=null');
  console.log(`\nCMD=${CMD} EXIT=${exit}`);
  process.exit(exit);
})().catch((e) => {
  console.error(e);
  console.log(`\nGAP  ${CASE_ID}  harness/runtime failure: ${e?.message ?? e}`);
  console.log(`ATTEMPT_END  iso=${new Date().toISOString()} EXIT=1 (crash)`);
  console.log(`\nCMD=${CMD} EXIT=1`);
  process.exit(1);
});
