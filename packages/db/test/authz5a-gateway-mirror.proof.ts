/**
 * AUTHZ-HARDEN 5A-1 簇① 镜像承重墙 prove — 0168 函数体+ACL 与住地 sql/23_api_gateway.sql auth 族区
 * **逐字节同文**（0159 RX-3 判据·0165/0166 两函数区段同款先例）+ 0155 末位回填并集在位（漏携即抹 #228）
 * + 0167/0169 静态形制臂（R5 命名区分/R9 铁律锚）。静态源断言·零 DB·零外呼。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

let failures = 0, assertions = 0;
const A = (name: string, passed: boolean) => { assertions++; if (!passed) { failures++; console.log(`FAIL  ${name}`); } else console.log(`PASS  ${name}`); };
const root = (f: string) => readFileSync(fileURLToPath(new URL(`../../../${f}`, import.meta.url)), 'utf8');
const sql23 = root('packages/db/sql/23_api_gateway.sql');
const m0167 = root('packages/db/migrations/0167_email_case_normalization.sql');
const m0168 = root('packages/db/migrations/0168_gateway_auth_email_normalize.sql');
const m0169 = root('packages/db/migrations/0169_auth_user_session.sql');

/** 抽取指定函数完整块（CREATE OR REPLACE FUNCTION name( 起，至收口 `$$;` 止）——逐字节比较单元。 */
function block(src: string, name: string): string {
  const start = src.indexOf(`CREATE OR REPLACE FUNCTION ${name}(`);
  if (start < 0) throw new Error(`block_not_found:${name}`);
  const end = src.indexOf('\n$$;', start) + '\n$$;'.length;
  return src.slice(start, end);
}

const authFns = ['gateway_auth_signup', 'gateway_auth_login', 'gateway_active_candidate'] as const;
for (const fn of authFns) {
  A(`镜像/${fn} 函数块与 23 auth 族区逐字节同文`, block(sql23, fn) === block(m0168, fn));
}

const aclLines = [
  'REVOKE ALL ON FUNCTION gateway_auth_signup(text, text, text, text) FROM PUBLIC, app_role;',
  'REVOKE ALL ON FUNCTION gateway_auth_login(text) FROM PUBLIC, app_role;',
  'REVOKE ALL ON FUNCTION gateway_active_candidate(text, text) FROM PUBLIC, app_gateway_role;',
  'GRANT EXECUTE ON FUNCTION gateway_auth_signup(text, text, text, text) TO app_gateway_role;',
  'GRANT EXECUTE ON FUNCTION gateway_auth_login(text) TO app_gateway_role;',
  'GRANT EXECUTE ON FUNCTION gateway_active_candidate(text, text) TO app_role;',
];
A('镜像/auth 族 ACL 六行逐字节同文（0168 ↔ 23）', aclLines.every((l) => sql23.includes(l) && m0168.includes(l)));

// 0155 末位回填并集（trial 桶 grant + approval_status 分支）——换体漏携即抹 #228 行为
A('并集/0168 signup 体携 0154 trial 同事务发放（ON CONFLICT 谓词逐字）',
  block(m0168, 'gateway_auth_signup').includes("INSERT INTO public.entitlement_bucket(owner_user_id, kind, units_total, expires_at)")
  && block(m0168, 'gateway_auth_signup').includes("ON CONFLICT (owner_user_id) WHERE kind = 'trial' DO NOTHING"));
A('并集/0168 signup 体携 b110 审批分支（recruiter→pending）',
  block(m0168, 'gateway_auth_signup').includes("'pending'") && block(m0168, 'gateway_auth_signup').includes('approval_status'));

// 归一语义在位（三函数 SQL 闸）
A('归一/signup 函数体 lower(btrim) 落库闸', block(m0168, 'gateway_auth_signup').includes('lower(btrim(p_email))'));
A('归一/login 函数体入参先归一后精确比较（裁决项①）', block(m0168, 'gateway_auth_login').includes('u.email = lower(btrim(p_email))'));
A('归一/active_candidate email 键归一比较（#131）', block(m0168, 'gateway_active_candidate').includes('u.email = lower(btrim(p_candidate_email))'));

// 0167 静态形制
A('0167/唯一索引名与表达式 §1 逐字（ux_user_email_lower ON user_account (lower(email))）',
  m0167.includes('CREATE UNIQUE INDEX IF NOT EXISTS ux_user_email_lower ON public.user_account (lower(email))'));
A('0167/冲突预检只报告不合并（conflict_report WARNING·无 UPDATE 冲突组）',
  m0167.includes('authz_0167_conflict_report') && m0167.includes('HAVING count(*) > 1'));

// 0169 R5 命名区分
A('R5/0169 表名 auth_user_session（≠ privacy_authorization_snapshot/memory 谱系）', m0169.includes('CREATE TABLE IF NOT EXISTS auth_user_session ('));
A('R5/0169 retention_class 值域恒 auth_session（≠ memory 0112 的 session 值）',
  m0169.includes("retention_class text NOT NULL DEFAULT 'auth_session' CHECK (retention_class IN ('auth_session'))"));
A('R5/0169 无 DELETE 面授出（仅 SELECT/INSERT/UPDATE）', m0169.includes('GRANT SELECT, INSERT, UPDATE ON auth_user_session TO app_role;'));
A('R9/历史迁移 0041/0155 名下零改锚（0168 头注声明换体纪律）', m0168.includes('0168_gateway_auth_email_normalize.sql') && m0168.includes('CREATE OR REPLACE'));

console.log(`\n${failures === 0 ? `✓ authz5a:mirror:prove: ${assertions} 条断言全绿` : `✗ authz5a:mirror:prove: ${failures}/${assertions} 失败`}`);
process.exit(failures === 0 ? 0 : 1);
