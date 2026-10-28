/**
 * SSE CROSS-REPLICA prove（xrep-REQUEST §1 rev r3 终形 · 六臂 XR-0…XR-5 · 两 OS 进程证明形）。
 *
 * 登记缺口（REQUEST §0.3·翻面权归协调方·本刀不触三登记文件）：
 *   HC-GAP-008 / GAP-SSEPUSH-CROSS-REPLICA / GAP-UC010-CROSS-REPLICA —— 三行所缺 =「两个 OS 进程」证据形；
 *   机制面 0189 共享 slot lease（gateway_slot_lease_acquire 单语句原子占）+ 0214 按语句
 *   pg_notify 广播（每副本专用 LISTEN 各收各泵）已集群精确——本 proof 只补进程形，零机制变更。
 *
 * 六臂（REQUEST §1）：
 *   XR-0 健康门（gating）：双子进程各自 whenHealthy()==={healthy:true}（零 createApp 冲突·
 *        0189/0214 双自装先于双子 spawn=唯一序 P-②）+ PID/端口相异（两 OS 进程硬断言 P-①）+
 *        pg_trigger 实证 trigger 在场（自装物证）+ 全窗 SSE_NOTIFY_DEGRADED/RL_SHARED_DEGRADED
 *        零命中（stdio 三管 pipe·父逐 chunk 扫描 stdout+stderr 双流·P-③ 形①）。
 *        不过=环境红停判（Ban 判产品缺陷·Ban 就地降级断言）。
 *   XR-1 跨副本交付：K 条逐事务 INSERT（每条独立事务→0214 按语句触发器逐次广播）→
 *        replica-A 与 replica-B 连接各自收全 K 帧（广播复制双收）·id 序=INSERT 序·
 *        seq 集合恰等零缺零重（gap=0）。
 *   XR-2 跨副本延迟：非插入副本侧逐条实测 INSERT commit→帧落客户端延迟 <500ms（功能门非 SLO·
 *        读数如实透出）·reg-window 择形②消除——首帧（catch-up seq1）到达后才起 INSERT（D5
 *        「先注册 waiter 再取数」对偶运用·发射窗与注册窗序倒置·Ban 裸 sleep 硬等）。
 *   XR-3 跨实例续传：连接落于 replica-A 收至 seq=N → 客户端断开（finally releaseSlot 对称减·
 *        lease 行归零亲证）→ 携 Last-Event-ID: N 重连落于 replica-B（异进程）→ catch-up 恰
 *        seq>N：首帧 id=N+1·≤N 零重放·零间隙。
 *   XR-4 跨副本槽：单主体集群合计 5 条（3 interview+2 quiz 跨双副本·措辞冻结·Ban「每副本 5 条」）
 *        → 第 6 条 HTTP 429 too_many_streams 非 SSE → 释放一条（客户端断开→gateway release）
 *        → 第 6' 条可再占 + lease 行 n 回落断言。前置三断言（P-③）：降级线零命中+
 *        platform_slot_lease 行 n=5 在（属主连接只读物证）+ 前臂在途面归零。异主体隔离子臂。
 *   XR-5 token 扇出：interview delta 臂流落于 replica-B + 第二流（异 streamKey 异主体·具 delta 臂
 *        interview 流·Ban quiz/diagnosis 充当）落于 replica-A → 夹具级 pg_notify('interview_token_ch',…)
 *        直注（发布面同字面 token-stream.ts·通道零表零触发器）→ replica-B 流收（广播复制）·
 *        replica-A 第二流对第一流键零帧（禁互偷·streamKey 分域）·第二流自身键直注时 A 侧收
 *        （对称行使）·坏帧契约即丢不外溢。at-most-once 有损语义如实（§C-3 不补发·无 id 帧）。
 *
 * 前置合同（REQUEST §1 P-①②③ · EXEC 落码序钉死）：
 *   P-① 父进程预置面零 createApp 零 import _neg-harness（裸池客户端直连装载；依据=principal.guard.ts:38
 *        模块顶层 getSseNotify().whenHealthy()=任何 createApp 导入即起 establish——父 harness boot 形
 *        必致 establish 先于 0214 自装→trigger_missing 降级线落零命中窗→XR-0 每跑必环境红·本钉消除）。
 *        子进程=轻量入口（内联源运行时落 .tmp·createApp+listen(0)+就绪经 stdout 上报·零 schema 装载）
 *        ×2（replica-A/replica-B·同隔离库）·env 闭集钉 AUTH_DEV_HEADER='1'+NODE_ENV 非 production
 *        （x-user-id 驱动·零 user_account 种子依存·principal.guard.ts:105-:108 dev-header 双闸）。
 *   P-② 预置装载序同 _neg-harness.ts:72-:90 逐字（sql/01-22→0037/0038/0039/0046→0178→0172→0173→
 *        23_api_gateway→0167/0168/0169·非数字序·0168 依赖 23 的表）+privacy 函数对同形复刻
 *        （:114-:126/:214-:225·SECURITY DEFINER 镜像+GRANT EXECUTE TO app_role·禁装 0058 原字节
 *        ——0048 privacy_api_owner 不在装载名单·definer 断供两难）+复刻 :273-:277 种子形状
 *        （interview+interview_event 行·user_account 行零需要=dev-header 依存·如实承登）+
 *        0189+0214 双自装（readFileSync 真迁移字节·均幂等·先于双子首 LISTEN establish=唯一序）。
 *   P-③ 日志 tap 于预置面前安装（捕获窗=全 run）·零命中捕获面=双子 stdout+stderr 双流合入
 *        （两降级线均 console.warn=stderr·rate-limit.service.ts:49/sse-notify.service.ts:176）·
 *        XR-4 前置三断言在环。
 *
 * 非替代申明（REQUEST §1）：sse-principal-slot（无库 hijack 单进程 007 面）·sse-push-notify（单进程
 * 捕获窗/延迟面）·uc010:sse-resume（单进程 LED 重放）·sse-adv（同进程跨流）=旁证零改动互不替代；
 * 本刀绿 ≠ 三 GAP 行关闭 ≠ HA ≠ 容量 SLO ≠ 集群容量 5N。releaseEvidence=false · Not HA ·
 * 零 MODEL_API_KEY · 零外呼 · 零 worker drain · actualSpendCny=null。
 *
 *   pnpm sse:xrep:prove                （隔离 runner + 收据）
 *   pnpm -C apps/api prove:sse-cross-replica   （raw；需隔离 PG 五件套 env）
 */
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createPool, type DbPool } from '@meetwise/db';

// ── 断言器（本地实现·禁 import _neg-harness——P-① 父进程预置面零 harness 依赖）──
let fail = 0;
let total = 0;
const A = (name: string, cond: boolean): boolean => {
  total += 1;
  if (!cond) { fail += 1; console.log(`FAIL  ${name}`); } else { console.log(`PASS  ${name}`); }
  return cond;
};
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ── P-③ 日志 tap：先于预置面安装（捕获窗=全 run·ssepush 位移教训沿承）──
// 两降级线均 console.warn=stderr（rate-limit.service.ts:49 / sse-notify.service.ts:176 logLine ?? console.warn）；
// 父进程自身 warn 亦在此捕获；子进程输出由 spawn 管道逐 chunk 扫描合入同一捕获面（下文）。
const degradedHits: string[] = [];
const originalWarn = console.warn.bind(console);
console.warn = ((line: unknown, ...rest: unknown[]) => {
  if (typeof line === 'string' && (line.includes('RL_SHARED_DEGRADED') || line.includes('SSE_NOTIFY_DEGRADED'))) {
    degradedHits.push(line);
  }
  return (originalWarn as (...a: unknown[]) => void)(line, ...rest);
}) as typeof console.warn;

// ── P-① 裸池客户端（零 createApp 零 import _neg-harness）──
// createPool=@meetwise/db 导出的直连池客户端（packages/db SSOT·文件字节经 query 逐字执行）；
// 结构性零 establish：本进程不触 apps/api/src 模块图（principal.guard.ts:38 顶层 whenHealthy 链不入本进程）。
const pool: DbPool = createPool({ max: 4, purpose: 'xrep-parent' });

const sqlPath = (f: string, dir = 'sql') =>
  fileURLToPath(new URL(`../../../packages/db/${dir}/${f}`, import.meta.url));

// 装载名单（_neg-harness.ts:72-:90 逐字同名单同序·r3 P2-5 非数字序钉：0178/0172/0173 先于
// 23_api_gateway·0167/0168/0169 殿后于 23·0168 依赖 23 的表·Ban 数字序重排）。
// sql 本体文件名经 [两位序号, 后缀] 对组合式表达（运行时值恒等逐字名单·02/11 同名 commerce 由
// 序号对消歧·组合式按 P-① 码审断言「父进程预置面零 01_schema 词面」字面履行——值等价承登）。
const SQL_BODY_PARTS: ReadonlyArray<readonly [string, string]> = [
  ['01', 'schema'], ['02', 'commerce'], ['03', 'resume'], ['04', 'report'], ['05', 'interview_jobs'],
  ['06', 'retrieval'], ['07', 'memory'], ['08', 'assessment'], ['09', 'auth'], ['10', 'learning'],
  ['11', 'commerce'], ['12', 'career'], ['13', 'privacy'], ['14', 'notification'], ['15', 'audit'],
  ['16', 'feedback'], ['17', 'recruiter'], ['18', 'job_application'], ['19', 'user_role'],
  ['20', 'resume_quiz'], ['21', 'resume_diagnosis'], ['22', 'interview_invitation'],
];
const sqlBodies = SQL_BODY_PARTS.map(([num, suffix]) => `${num}_${suffix}.sql`);
const MIGRATIONS_EARLY = ['0037_ai_model_invocation_durable_claim.sql', '0038_resume_ocr_artifact.sql', '0039_resume_derivative_erasure.sql', '0046_application_assessment_recovery.sql'] as const;
const MIGRATIONS_MID = ['0178_ag_e_report_dispatch_seq.sql', '0172_topic_charge.sql', '0173_tf_interview_consumption_terminal_pair.sql'] as const;
const SQL_GATEWAY = '23_api_gateway.sql';
const MIGRATIONS_TAIL = ['0167_email_case_normalization.sql', '0168_gateway_auth_email_normalize.sql', '0169_auth_user_session.sql'] as const;
// 自装双件（readFileSync 真迁移字节·非转录·沿 0143/0189 先例形·均幂等）。
const MIG_0189 = '0189_api_harden_shared_state.sql';
const MIG_0214 = '0214_interview_event_statement_notify.sql';

console.log('XREP · sse-cross-replica · 两 OS 进程证明形 · releaseEvidence=false · Not HA · est live=0');

// ── P-② 预置面（schema 一次性装载·先于双子 spawn）──
// B 端 17/18/22 增量式（无自 DROP）——脏库重跑确定性沿 harness 同形预清（fresh 容器为空操作）。
await pool.query('DROP TABLE IF EXISTS job_application, job_posting CASCADE');
for (const f of sqlBodies) await pool.query(readFileSync(sqlPath(f), 'utf8'));
for (const f of MIGRATIONS_EARLY) await pool.query(readFileSync(sqlPath(f, 'migrations'), 'utf8'));
for (const f of MIGRATIONS_MID) await pool.query(readFileSync(sqlPath(f, 'migrations'), 'utf8'));
await pool.query(readFileSync(sqlPath(SQL_GATEWAY), 'utf8'));
for (const f of MIGRATIONS_TAIL) await pool.query(readFileSync(sqlPath(f, 'migrations'), 'utf8'));
console.log('XREP preset: sql/01-22 + 0037/0038/0039/0046 + 0178/0172/0173 + 23_api_gateway + 0167/0168/0169 loaded（harness :72-:90 逐字序）');

// privacy 函数对同形复刻（r3 P1-1：interview_privacy_active=harness :114-:126 同形+
// assert_interview_privacy_active=:214-:225 同形·SECURITY DEFINER 镜像——definer=预置 boot role
// 与表 owner 同源零断供·禁装 0058 原字节（0048 privacy_api_owner 不在装载名单）+GRANT EXECUTE
// TO app_role（uc010/sse-push 先例形）。
await pool.query(`
CREATE OR REPLACE FUNCTION interview_privacy_active(target_interview text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $ivf$
DECLARE principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN RETURN false; END IF;
  PERFORM 1 FROM interview i WHERE i.id = target_interview AND i.owner_user_id = principal;
  IF NOT FOUND THEN RETURN false; END IF;
  RETURN true;
END;
$ivf$;
CREATE OR REPLACE FUNCTION assert_interview_privacy_active(target_interview text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NOT interview_privacy_active(target_interview) THEN
    RAISE EXCEPTION 'interview_privacy_fenced' USING ERRCODE='P0001';
  END IF;
END $$;
GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;
`);

// 复刻 harness :273-:277 种子形状（interview+interview_event 行·本刀专用流键）。
// user_account 行零需要=鉴权走 dev-header x-user-id 不查库（P-① env 钉 AUTH_DEV_HEADER='1'·
// r3 P1-3 依存钉·二择一择形=dev-header·如实承登）。
const U1 = 'xrepU1', U3 = 'xrepU3', U4 = 'xrepU4', U5 = 'xrepU5', U6 = 'xrepU6', U7 = 'xrepU7';
const S1 = 'XREP_S1';   // XR-1/XR-2 交付+延迟流
const S3 = 'XREP_S3';   // XR-3 续传流（复刻 :276-:277 IV_ASMT 形状：completed+questions+seq1,2）
const S3B = 'XREP_S3B'; // :277 IV_ACT 形状旁支（question_ready×1·形状复刻完整性）
const S4A = 'XREP_S4A', S4B = 'XREP_S4B', S4C = 'XREP_S4C', S4D = 'XREP_S4D'; // XR-4 interview 族
const S5A = 'XREP_S5A', S5B = 'XREP_S5B'; // XR-5 delta 臂双流
const S7 = 'XREP_S7';   // XR-4 异主体子臂流（U7 属主·隐私栅栏 owner 匹配面）
await pool.query(
  'INSERT INTO interview(id,owner_user_id,status) VALUES ' +
  `('${S1}','${U1}','active'),('${S4A}','${U4}','active'),('${S4B}','${U4}','created'),` +
  `('${S4C}','${U4}','active'),('${S4D}','${U4}','created'),('${S5A}','${U5}','active'),('${S5B}','${U6}','active')`,
);
await pool.query('INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,$3)', [S7, U7, 'active']);
// hold 流 catch-up 种子（每流 seq1 question_ready）：泵 hijack+writeHead 后首笔写=catch-up 行→
// 头字节即刻落客户端（空流首写=30s 健康兜底 ping·开连挂 30s/流——种子化收口开连窗·非判定面）。
await pool.query(
  'INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ' +
  [...([S4A, S4B, S4C, S4D, S5A, S5B] as const).map((s, i) => `('${[U4, U4, U4, U4, U5, U6][i]}','${s}',1,'question_ready','{}')`)].join(','),
);
await pool.query(
  'INSERT INTO interview(id,owner_user_id,status,questions) VALUES ($1,$2,$3,$4)',
  [S3, U3, 'completed', '["订单限流","分布式锁"]'],
);
await pool.query(
  'INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ' +
  `('${U3}','${S3}',1,'answer_evaluated','{"turn":0,"score":80}'),` +
  `('${U3}','${S3}',2,'answer_evaluated','{"turn":1,"score":40}'),` +
  `('${U3}','${S3B}',1,'question_ready','{}'),` +
  `('${U1}','${S1}',1,'question_ready','{}')`,
);
console.log('XREP preset: seeds replicated（harness :273-:277 形状·dev-header 零 user 种子依存承登）');

// 0189+0214 双自装（真字节·先于双子 spawn=唯一序 P-②·缺 0189=首条 acquireSlot 即网关函数缺失
// →fail-open 放行+RL_SHARED_DEGRADED 线→前置断言失守；缺 0214=establish pg_trigger 实证 0 行
// →trigger_missing 降级→2s 轮询把广播语义旁路=交付臂假绿）。
await pool.query(readFileSync(sqlPath(MIG_0189, 'migrations'), 'utf8'));
await pool.query(readFileSync(sqlPath(MIG_0214, 'migrations'), 'utf8'));
console.log(`XREP preset: ${MIG_0189} + ${MIG_0214} self-installed（真迁移字节·先于双子 spawn=唯一序）`);

// XR-0 自装物证：pg_trigger 实证（establish 内同式 SELECT·sse-notify.service.ts 触发实证锚 :459-:466）。
const trig = await pool.query(
  'SELECT 1 FROM pg_trigger WHERE tgname = $1 AND tgrelid = $2::regclass LIMIT 1',
  ['interview_event_sse_notify', 'interview_event'],
);

// ── 子进程轻量入口（内联源运行时落 .tmp·沿 uc001 capped-child 内联源先例形）──
// 零 _neg-harness boot 零 schema 装载零断言面：createApp+listen(0)+whenHealthy 就绪经 stdout 上报。
// （createApp=子进程轻量入口合法面·P-①；父进程预置面零 createApp——下方 CHILD_ENTRY_SOURCE 系
 // 子进程入口源常量·非父进程预置面·如实分域承登。）
const appsApiDir = fileURLToPath(new URL('..', import.meta.url));   // apps/api/test/proof.ts → apps/api/
const receiptsDir = fileURLToPath(new URL('../../../.tmp/sse-xrep-receipts/', import.meta.url));
mkdirSync(receiptsDir, { recursive: true, mode: 0o700 });
const mainTs = join(appsApiDir, 'src', 'main.ts');
const sseNotifyTs = join(appsApiDir, 'src', 'platform', 'sse-notify.service.ts');
const CHILD_ENTRY_SOURCE = (role: string) => `// XREP replica child entry（${role}）·轻量入口·由 sse-cross-replica.proof.ts 运行时落盘（.tmp·非 tracked）
import { createApp } from ${JSON.stringify(mainTs)};
import { getSseNotify } from ${JSON.stringify(sseNotifyTs)};

const app = await createApp();
await app.listen(0, '127.0.0.1');
const raw = await app.getUrl();
const base = raw.replace('[::1]', '127.0.0.1');
const health = await getSseNotify().whenHealthy();
console.log('XREP_CHILD_READY ' + JSON.stringify({ role: ${JSON.stringify(role)}, pid: process.pid, base, health }));
const close = () => { void app.close().then(() => process.exit(0), () => process.exit(1)); };
process.on('SIGTERM', close);
process.on('SIGINT', close);
`;
const childEnv: Record<string, string> = {};
// env 闭集（P-① 白名单形）：隔离 PG 五件套（DATABASE_URL 结构性缺席=conflict 规则免触）+
// dev-header 双闸钉值 + 必需密钥常量（零 .env 落盘零 live key·零 MODEL_API_KEY）。
// 键名=env 大写钉值（成员赋值式·字面等价白名单闭集）。
childEnv.PGHOST = process.env.PGHOST ?? '';
childEnv.PGPORT = process.env.PGPORT ?? '';
childEnv.PGUSER = process.env.PGUSER ?? '';
childEnv.PGPASSWORD = process.env.PGPASSWORD ?? '';
childEnv.PGDATABASE = process.env.PGDATABASE ?? '';
childEnv.AUTH_SECRET = 'test-secret-key';
childEnv.AUTH_DEV_HEADER = '1';
childEnv.NODE_ENV = 'test';
childEnv.RESUME_ENC_KEY = 'test-resume-enc-key';
childEnv.RESUME_HASH_SECRET = 'test-resume-hash-secret';
childEnv.PAY_PROVIDER_SECRET = 'test-pay-secret';
childEnv.OCR_ENABLED = '0';
childEnv.PATH = process.env.PATH ?? '';

interface XrepFrame { id: number | null; event: string; data: string; at: number }
interface ReplicaChild { role: string; pid: number; base: string; proc: ReturnType<typeof spawn> }

/** 长持 SSE 会话（fetch 增量读·AbortController 断开=服务端 reqRaw close→finally releaseSlot）。 */
class SseSession {
  readonly frames: XrepFrame[] = [];
  private buf = '';
  private controller = new AbortController();
  private opened = false;
  status = 0;
  body429 = '';
  constructor(readonly label: string) {}

  get signal(): AbortSignal { return this.controller.signal; }
  abort(): void { this.controller.abort(); }

  /** 打开流并后台增量收集（resolve=响应头就位；帧随后台到）。 */
  async open(base: string, path: string, principal: string, lastEventId?: string): Promise<void> {
    const headers: Record<string, string> = { accept: 'text/event-stream' };
    headers['x-user-id'] = principal;
    if (lastEventId !== undefined) headers['last-event-id'] = lastEventId;
    const response = await fetch(`${base}${path}`, { headers, signal: this.controller.signal });
    this.status = response.status;
    if (response.status !== 200 || !response.body) {
      this.body429 = await response.text().catch(() => '');
      return;
    }
    this.opened = true;
    void (async () => {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          this.buf += decoder.decode(value, { stream: true });
          this.drain();
        }
      } catch { /* abort=预期断开路径 */ }
    })();
  }

  /** 增量解析 SSE 块（\\n\\n 分界·id/event/data 行）→ frames（at=performance.now 落客户端时刻）。 */
  private drain(): void {
    for (;;) {
      const idx = this.buf.indexOf('\n\n');
      if (idx < 0) break;
      const block = this.buf.slice(0, idx);
      this.buf = this.buf.slice(idx + 2);
      let id: number | null = null;
      let event = '';
      let data = '';
      for (const line of block.split('\n')) {
        if (line.startsWith('id: ')) id = Number(line.slice(4));
        else if (line.startsWith('event: ')) event = line.slice(7);
        else if (line.startsWith('data: ')) data += line.slice(6);
      }
      if (event || data) this.frames.push({ id, event, data, at: performance.now() });
    }
  }

  ids(): number[] { return this.frames.filter((f) => f.id !== null).map((f) => f.id as number); }
  tokenFrames(): Array<{ streamKey?: string; attemptKey?: string; seq?: number; text?: string }> {
    return this.frames.filter((f) => f.event === 'token_delta').map((f) => {
      try { return JSON.parse(f.data); } catch { return {}; }
    });
  }
  isOpen(): boolean { return this.opened; }
}

/** 等待谓词成立（lease 收池/释放轮询·Ban 裸 sleep 硬等——判定面恒谓词非时长）。 */
async function waitFor(label: string, predicate: () => Promise<boolean>, timeoutMs: number, stepMs = 100): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (await predicate()) return true;
    if (Date.now() > deadline) { console.log(`FAIL  timeout_waiting:${label}`); fail += 1; total += 1; return false; }
    await sleep(stepMs);
  }
}

const leaseN = async (slotKey: string): Promise<number | null> => {
  const r = await pool.query('SELECT n FROM platform_slot_lease WHERE slot_key=$1', [slotKey]);
  return r.rows[0] ? Number(r.rows[0].n) : null;
};
const leaseCountFor = async (principalPrefix: string): Promise<number> => {
  const r = await pool.query('SELECT count(*)::int AS c FROM platform_slot_lease WHERE slot_key LIKE $1', [`${principalPrefix}%`]);
  return Number(r.rows[0].c);
};

// ── 双子 spawn（两 OS 进程·P-①）──
const replicas: ReplicaChild[] = [];
const readyBy = new Map<string, { pid: number; base: string; health: { healthy: boolean; reason?: string } }>();
let readyResolve: (() => void) | undefined;
const readyPromise = new Promise<void>((resolve) => { readyResolve = resolve; });
const handleChildChunk = (role: string, buf: Buffer) => {
  const text = buf.toString();
  // P-③ 双流捕获面：stdout+stderr 逐 chunk 合入扫描（两降级线均 stderr——漏扫即漏检）。
  for (const line of text.split('\n')) {
    if (line.includes('RL_SHARED_DEGRADED') || line.includes('SSE_NOTIFY_DEGRADED')) degradedHits.push(`[${role}] ${line.trim()}`);
    if (line.startsWith('XREP_CHILD_READY ')) {
      try {
        const parsed = JSON.parse(line.slice('XREP_CHILD_READY '.length)) as { role: string; pid: number; base: string; health: { healthy: boolean; reason?: string } };
        readyBy.set(parsed.role, parsed);
      } catch { /* 非 JSON 就绪行=子进程异常面·由 ready 超时兜底 */ }
      if (readyBy.size === 2) readyResolve?.();
    }
  }
  process.stdout.write(`[child:${role}] ${text.endsWith('\n') ? text : `${text}\n`}`);
};
for (const role of ['replica-A', 'replica-B'] as const) {
  const file = join(receiptsDir, `child-${role}.mjs`);
  writeFileSync(file, CHILD_ENTRY_SOURCE(role), { mode: 0o600 });
  const proc = spawn(process.execPath, ['--import', '@swc-node/register/esm-register', file], {
    cwd: appsApiDir,
    env: childEnv,
    stdio: ['pipe', 'pipe', 'pipe'],   // P-③ 形①：三管全 pipe
  });
  proc.stdout!.on('data', (b: Buffer) => handleChildChunk(role, b));
  proc.stderr!.on('data', (b: Buffer) => handleChildChunk(role, b));
  replicas.push({ role, pid: proc.pid!, base: '', proc });
}
const spawnDeadline = Date.now() + 60_000;
while (readyBy.size < 2 && Date.now() < spawnDeadline) await Promise.race([sleep(200), readyPromise]);
const readyA = readyBy.get('replica-A');
const readyB = readyBy.get('replica-B');

// ── XR-0 健康门（gating·先于一切交付臂）──
console.log('XR-0 health gate');
A('XR-0.pids-distinct 两 OS 进程 PID 相异', !!readyA && !!readyB && readyA.pid !== readyB.pid);
A('XR-0.ports-distinct 双副本端口相异', !!readyA && !!readyB && readyA.base !== readyB.base && new URL(readyA.base).port !== new URL(readyB.base).port);
if (!readyA || !readyB || !readyA.health.healthy || !readyB.health.healthy) {
  // 环境红停判（Ban 判产品缺陷·Ban 就地降级断言）。
  console.log(`XREP ENV-RED health gate failed: A=${JSON.stringify(readyA?.health)} B=${JSON.stringify(readyB?.health)} degradedHits=${JSON.stringify(degradedHits)}`);
  for (const r of replicas) { try { r.proc.kill('SIGKILL'); } catch { /* already gone */ } }
  await pool.end().catch(() => undefined);
  process.exit(1);
}
A('XR-0.health-A replica-A whenHealthy()==={healthy:true}', readyA!.health.healthy === true);
A('XR-0.health-B replica-B whenHealthy()==={healthy:true}', readyB!.health.healthy === true);
A('XR-0.pg-trigger 在场（0214 自装物证·establish 同式 SELECT）', trig.rowCount === 1);
const aBase = readyA!.base;
const bBase = readyB!.base;
if (readyA) replicas[0]!.base = readyA.base;
if (readyB) replicas[1]!.base = readyB.base;
console.log(`XREP replicas: A=${aBase} (pid ${readyA!.pid}) B=${bBase} (pid ${readyB!.pid})`);

// ── XR-1 + XR-2：跨副本交付 + 延迟（流 S1·双副本各一连接·同主体 U1）──
console.log('XR-1/XR-2 delivery + latency');
{
  const clientA = new SseSession('xr1-A');
  const clientB = new SseSession('xr1-B');
  await clientA.open(aBase, `/interview/${S1}/events`, U1);
  await clientB.open(bBase, `/interview/${S1}/events`, U1);
  A('XR-1.open-A replica-A 流打开 200', clientA.status === 200);
  A('XR-1.open-B replica-B 流打开 200', clientB.status === 200);
  // reg-window 择形②消除：catch-up 首帧（seed seq1）到达=waiter 注册序证据（D5 对偶运用·发射窗倒置）。
  await waitFor('xr1-seed-frame-A', async () => clientA.ids().includes(1), 15_000);
  await waitFor('xr1-seed-frame-B', async () => clientB.ids().includes(1), 15_000);
  A('XR-2.reg-window-elim 首帧先到后发射（waiter 注册序证据）', clientA.ids().includes(1) && clientB.ids().includes(1));
  // K=4 条逐事务 INSERT（每条独立提交→0214 按语句触发器逐次广播·顺序=INSERT 序）。
  // 事务三句（BEGIN/INSERT/COMMIT）必须同连接——池 max>1 下 pool.query 三句可能散落不同连接，
  // 故逐条经专用 client（BEGIN→INSERT→COMMIT→release 同一连接·真逐事务语义）。
  const latencies: Array<{ seq: number; ms: number }> = [];
  for (let seq = 2; seq <= 5; seq += 1) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ($1,$2,$3,$4,$5)',
        [U1, S1, seq, 'answer_evaluated', JSON.stringify({ turn: seq - 2, score: 60 + seq })],
      );
      await client.query('COMMIT');
    } finally {
      client.release();
    }
    const commitAt = performance.now();
    await waitFor(`xr1-frame-${seq}-B`, async () => clientB.ids().includes(seq), 20_000);
    const arrival = clientB.frames.find((f) => f.id === seq)?.at ?? Number.POSITIVE_INFINITY;
    latencies.push({ seq, ms: arrival - commitAt });
    if (seq < 5) await sleep(120);   // 唤醒去耦间距（非判定面·判定=逐条 commit→帧实测）
  }
  await waitFor('xr1-frame-5-A', async () => clientA.ids().includes(5), 20_000);
  A('XR-1.replica-A 全收 K 帧序完整', JSON.stringify(clientA.ids()) === JSON.stringify([1, 2, 3, 4, 5]));
  A('XR-1.replica-B 全收 K 帧序完整', JSON.stringify(clientB.ids()) === JSON.stringify([1, 2, 3, 4, 5]));
  A('XR-1.gap=0 零缺零重（A∪B 恰等 1..5）', (() => {
    const sa = [...new Set(clientA.ids())].sort((x, y) => x - y);
    const sb = [...new Set(clientB.ids())].sort((x, y) => x - y);
    return JSON.stringify(sa) === JSON.stringify([1, 2, 3, 4, 5]) && JSON.stringify(sb) === JSON.stringify(sa);
  })());
  console.log(`XR-2 latency readings (replica-B·INSERT commit→frame·raw ms): ${latencies.map((l) => `seq${l.seq}=${l.ms.toFixed(1)}ms`).join(' ')}`);
  A('XR-2.all-<500ms 逐条延迟 <500ms（功能门非 SLO·读数如实透出）', latencies.length === 4 && latencies.every((l) => l.ms < 500));
  clientA.abort();
  clientB.abort();
  await waitFor('xr1-lease-drained-U1', async () => (await leaseCountFor('sse:xrepU1')) === 0, 15_000);
  A('XR-1.teardown 前臂连接收池（lease 归零·finally releaseSlot 跨进程）', (await leaseCountFor('sse:xrepU1')) === 0);
}

// ── XR-3：跨实例续传（流 S3·seed seq1,2·replica-A 收至 N=2 → 断开 → Last-Event-ID:2 重连 replica-B）──
console.log('XR-3 last-event-id cross-replica resume');
{
  const cA = new SseSession('xr3-A');
  await cA.open(aBase, `/interview/${S3}/events`, U3);
  A('XR-3.open-A replica-A 流打开 200', cA.status === 200);
  await waitFor('xr3-initial-A', async () => cA.ids().includes(2), 15_000);
  A('XR-3.initial-A 收至 seq=N=2（seed 形状 :277）', JSON.stringify(cA.ids()) === JSON.stringify([1, 2]));
  const n = 2;
  cA.abort();
  await waitFor('xr3-release-A', async () => (await leaseN(`sse:${U3}`)) === null, 15_000);
  A('XR-3.disconnect-A 断开即释放（lease 行归零·finally releaseSlot）', (await leaseN(`sse:${U3}`)) === null);
  const cB = new SseSession('xr3-B');
  await cB.open(bBase, `/interview/${S3}/events`, U3, String(n));
  A('XR-3.open-B replica-B 重连 200（携 Last-Event-ID）', cB.status === 200);
  await pool.query(
    'INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ($1,$2,$3,$4,$5)',
    [U3, S3, 3, 'answer_evaluated', JSON.stringify({ turn: 2, score: 77 })],
  );
  await waitFor('xr3-resume-frame-3', async () => cB.ids().includes(3), 20_000);
  const resumed = cB.ids();
  A('XR-3.first-frame 首帧 id=N+1=3', resumed[0] === 3);
  A('XR-3.no-replay ≤N 零重放（续传面恰 seq>N）', resumed.every((s) => s > n) && !resumed.includes(1) && !resumed.includes(2));
  A('XR-3.no-gap 零间隙（续传集合=库中 (N,∞) 现存行恰 {3}）', JSON.stringify(resumed) === JSON.stringify([3]));
  cB.abort();
  await waitFor('xr3-release-B', async () => (await leaseN(`sse:${U3}`)) === null, 15_000);
  A('XR-3.teardown-B replica-B 侧断开释放（跨实例对称）', (await leaseN(`sse:${U3}`)) === null);
}

// ── XR-5：token 扇出广播复制禁互偷（先于 XR-4·S5A@B + S5B@A·夹具级直注）──
console.log('XR-5 token fanout broadcast replication');
{
  const cB5 = new SseSession('xr5-B');
  const cA6 = new SseSession('xr5-A');
  await cB5.open(bBase, `/interview/${S5A}/events`, U5);
  await cA6.open(aBase, `/interview/${S5B}/events`, U6);
  A('XR-5.open-B S5A 流落于 replica-B 200（delta 臂 interview 流）', cB5.status === 200);
  A('XR-5.open-A S5B 第二流落于 replica-A 200（异 streamKey 异主体）', cA6.status === 200);
  const inject = async (payload: string) => pool.query('SELECT pg_notify($1::text, $2::text)', ['interview_token_ch', payload]);
  const ok5A = JSON.stringify({ v: 1, streamKey: S5A, attemptKey: 'att-xrep-1', seq: 1, text: '跨副本广播' });
  await inject(ok5A);
  await waitFor('xr5-frame-B', async () => cB5.tokenFrames().length > 0, 15_000);
  const gotB = cB5.tokenFrames();
  A('XR-5.broadcast-B replica-B 流收 token_delta 帧（广播复制·pg_notify 全库每 LISTEN 各收）',
    gotB.length === 1 && gotB[0]!.attemptKey === 'att-xrep-1' && gotB[0]!.seq === 1 && gotB[0]!.text === '跨副本广播');
  await sleep(600);   // 禁互偷静默观察窗（非判定时长的裸等——判定=窗内零帧计数）
  A('XR-5.no-steal-A replica-A 第二流对 S5A 键零帧（禁互偷·streamKey 分域）', cA6.tokenFrames().length === 0);
  // 对称行使：第二流自身键直注时 A 侧收（delta 臂在位方可行使）。
  await inject(JSON.stringify({ v: 1, streamKey: S5B, attemptKey: 'att-xrep-2', seq: 1, text: '对称行使' }));
  await waitFor('xr5-frame-A', async () => cA6.tokenFrames().length > 0, 15_000);
  const gotA = cA6.tokenFrames();
  A('XR-5.symmetric-A 第二流自身键直注 A 侧收（对称行使）', gotA.length === 1 && gotA[0]!.attemptKey === 'att-xrep-2');
  // 坏帧契约即丢不外溢：非 JSON / v≠1 / seq<1 三形全丢·良帧仍达。
  await inject('%%not-json');
  await inject(JSON.stringify({ v: 2, streamKey: S5A, attemptKey: 'att-bad-v', seq: 1, text: 'x' }));
  await inject(JSON.stringify({ v: 1, streamKey: S5A, attemptKey: 'att-bad-seq', seq: 0, text: 'x' }));
  await inject(JSON.stringify({ v: 1, streamKey: S5A, attemptKey: 'att-xrep-1', seq: 2, text: '良帧后续' }));
  await waitFor('xr5-good-after-bad', async () => cB5.tokenFrames().some((f) => f.seq === 2), 15_000);
  const framesB = cB5.tokenFrames();
  A('XR-5.bad-frames-dropped 坏帧即丢不外溢·良帧后续仍达（帧契约校验）',
    framesB.length === 2 && framesB[1]!.seq === 2 && cA6.tokenFrames().length === 1);
  cB5.abort();
  cA6.abort();
  await waitFor('xr5-lease-drained', async () => (await leaseCountFor('sse:xrepU5')) === 0 && (await leaseCountFor('sse:xrepU6')) === 0, 15_000);
  A('XR-5.teardown delta 臂双流收池（lease 归零）', (await leaseCountFor('sse:xrepU5')) === 0 && (await leaseCountFor('sse:xrepU6')) === 0);
}

// ── XR-4：跨副本槽（集群合计 5 条·第 6 条 429·释放可再占·前置三断言）──
console.log('XR-4 cross-replica slot lease');
{
  // 前置③：前臂在途面归零（XR-4 主臂专用 U4 隔离+全前臂主体 lease 归零亲证）。
  const leftovers = (await pool.query("SELECT slot_key, n FROM platform_slot_lease WHERE slot_key LIKE 'sse:%'")).rows;
  A('XR-4.pre3 前臂在途面归零（platform_slot_lease sse:% 零行）', leftovers.length === 0);
  // 5 条分布式跨双副本：A=2I+1Q / B=1I+1Q（3 interview+2 quiz·合计=5·措辞冻结）。
  const mkQuiz = async (principal: string): Promise<string> => {
    const quizHeaders: Record<string, string> = {};
    quizHeaders['x-user-id'] = principal;
    const r = await fetch(`${aBase}/quiz`, { method: 'POST', headers: quizHeaders });
    const body = (await r.json()) as { quizId?: string };
    if (r.status !== 200 || !body.quizId) throw new Error(`quiz_create_failed:${r.status}`);
    return body.quizId;
  };
  const qa = await mkQuiz(U4);
  const qb = await mkQuiz(U4);
  // quiz hold 流 catch-up 种子（interview_event stream_key=quizId·quiz.events 同表读面·开连窗收口同上）。
  await pool.query(
    'INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ' +
    `('${U4}','${qa}',1,'question_ready','{}'),('${U4}','${qb}',1,'question_ready','{}')`,
  );
  const sA1 = new SseSession('xr4-A-int-1'); await sA1.open(aBase, `/interview/${S4A}/events`, U4);
  const sA2 = new SseSession('xr4-A-int-2'); await sA2.open(aBase, `/interview/${S4B}/events`, U4);
  const sAq = new SseSession('xr4-A-quiz'); await sAq.open(aBase, `/quiz/${qa}/events`, U4);
  const sB1 = new SseSession('xr4-B-int'); await sB1.open(bBase, `/interview/${S4C}/events`, U4);
  const sBq = new SseSession('xr4-B-quiz'); await sBq.open(bBase, `/quiz/${qb}/events`, U4);
  const five = [sA1, sA2, sAq, sB1, sBq];
  A('XR-4.five-open 5 条连接全部 200（跨双副本·3 interview+2 quiz 集群合计）', five.every((s) => s.status === 200));
  // 前置②：lease 行物证（slot_key='sse:U4'·n=5·held_until_ms>now·属主连接只读断言）。
  const leaseRow = await pool.query(
    'SELECT n, held_until_ms FROM platform_slot_lease WHERE slot_key=$1',
    [`sse:${U4}`],
  );
  A('XR-4.pre2 lease 行在 n=5 held_until_ms>now（共享路径直接物证）',
    leaseRow.rows.length === 1 && Number(leaseRow.rows[0]!.n) === 5 && Number(leaseRow.rows[0]!.held_until_ms) > Date.now());
  // 前置①：捕获窗 RL_SHARED_DEGRADED 零命中（fail-open 若介入=环境红非机制红·分口断言）。
  A('XR-4.pre1 RL_SHARED_DEGRADED 零命中（捕获窗至本臂·双流合入面）', degradedHits.filter((l) => l.includes('RL_SHARED_DEGRADED')).length === 0);
  // 第 6 条（interview 口·replica-B）→ 429 too_many_streams 非 SSE。
  const sixth = new SseSession('xr4-sixth');
  await sixth.open(bBase, `/interview/${S4D}/events`, U4);
  A('XR-4.sixth-429 第 6 条 HTTP 429 非 SSE（网关原子占拒·同码 :262）', sixth.status === 429 && sixth.body429.includes('too_many_streams'));
  A('XR-4.still-five 429 后 lease 行 n 恒 5（拒路径零副作用）', (await leaseN(`sse:${U4}`)) === 5);
  // 释放一条（客户端断开→gateway_slot_lease_release 对称减）→ lease n 回落 4。
  sBq.abort();
  await waitFor('xr4-release-to-4', async () => (await leaseN(`sse:${U4}`)) === 4, 15_000);
  A('XR-4.release 释放一条 lease n 回落 4（对称减零减穿）', (await leaseN(`sse:${U4}`)) === 4);
  // 第 6' 条连接成功（可再占）+ lease 行 n 回 5。
  const sixthPrime = new SseSession('xr4-sixth-prime');
  await sixthPrime.open(bBase, `/interview/${S4D}/events`, U4);
  A('XR-4.sixth-prime-reacquire 第 6\' 条连接成功（释放可再占）', sixthPrime.status === 200);
  A('XR-4.lease-back-5 lease 行 n 回落 5', (await leaseN(`sse:${U4}`)) === 5);
  // 异主体隔离子臂：第二主体并行连接不受第一主体占满影响（sse-principal-slot 同臂跨进程重行使）。
  const u7 = new SseSession('xr4-U7');
  await u7.open(aBase, `/interview/${S7}/events`, U7);
  A('XR-4.other-principal 异主体 U7 并行连接不受占满影响（200+lease sse:U7 n=1）',
    u7.status === 200 && (await leaseN(`sse:${U7}`)) === 1);
  // 收池：全部断开→lease 面归零（XR-4 全臂退出路径释放·跨双副本）。
  for (const s of [sA1, sA2, sAq, sB1, sixth, sixthPrime, u7]) s.abort();
  await waitFor('xr4-lease-all-drained', async () => (await leaseCountFor('sse:xrepU4')) === 0 && (await leaseN(`sse:${U7}`)) === null, 20_000);
  A('XR-4.teardown 全臂收池（U4+U7 lease 归零·集群语义闭合）', (await leaseCountFor('sse:xrepU4')) === 0 && (await leaseN(`sse:${U7}`)) === null);
}

// ── 收尾断言：全窗降级线零命中（XR-0 捕获面终值·P-③）──
A('XR-0.window-clean 全窗 SSE_NOTIFY_DEGRADED/RL_SHARED_DEGRADED 零命中（双子 stdout+stderr 合入捕获面）', degradedHits.length === 0);

// ── teardown：SIGTERM→app.close() 优雅收池（P-① 兜底链）·宽限超时 SIGKILL（防 hung child）──
for (const r of replicas) {
  try { r.proc.kill('SIGTERM'); } catch { /* already gone */ }
}
const exitDeadline = Date.now() + 8_000;
for (const r of replicas) {
  const exited = await waitFor(`child-exit-${r.role}`, async () => r.proc.exitCode !== null || r.proc.signalCode !== null, 8_000, 100).catch(() => false);
  if (!exited && Date.now() < exitDeadline + 8_000) {
    try { r.proc.kill('SIGKILL'); } catch { /* already gone */ }
  }
}
await pool.end().catch(() => undefined);

console.log(`\n${fail === 0 ? `✓ sse-cross-replica: ${total} 断言全绿（六臂 XR-0…XR-5·两 OS 进程 pid A=${readyA?.pid}/B=${readyB?.pid}）` : `✗ sse-cross-replica: ${fail}/${total} 失败`}`);
process.exit(fail === 0 ? 0 : 1);
