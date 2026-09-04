import { BASE, jsonHeaders, readJson } from './http.ts';

export type AuthSession = {
  token: string;
  headers: Record<string, string>;
  email: string;
};

type AuthPayload = { token?: unknown };

async function postAuth(
  path: '/auth/signup' | '/auth/login',
  body: { email: string; password: string; role?: 'recruiter' | 'candidate' },
): Promise<{ status: number; payload: AuthPayload }> {
  const response = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, payload: await readJson(response) };
}

function tokenFromPayload(payload: AuthPayload): string | null {
  return typeof payload?.token === 'string' && payload.token.length > 0 ? payload.token : null;
}

/**
 * Register, or log in when the isolated rerun already created the account.
 * Login is only attempted after a non-200 signup (typically email_taken).
 * A 200 signup without a token is a contract failure, not a login cue.
 * Does not invent tokens or skip the HTTP auth boundary.
 */
export async function signupOrLogin(email: string, password: string, role?: 'recruiter' | 'candidate'): Promise<AuthSession> {
  if (typeof email !== 'string' || email.length === 0 || typeof password !== 'string' || password.length === 0) {
    throw new Error('e2e_auth_failed:status=invalid_input');
  }
  const signupBody = role ? { email, password, role } : { email, password };
  let { status, payload } = await postAuth('/auth/signup', signupBody);
  if (status !== 200) {
    ({ status, payload } = await postAuth('/auth/login', { email, password }));
  }
  const token = tokenFromPayload(payload);
  if (status !== 200 || !token) {
    throw new Error(`e2e_auth_failed:status=${status}`);
  }
  return { token, headers: jsonHeaders(token), email };
}

/**
 * Decode the uid the current API embeds in the signed payload segment:
 * `base64url({uid,exp,pe}).sig` from domain `signToken`.
 * This is the identity used by recruiter/candidate RLS assertions.
 * Do not replace it with a client-invented user id or the optional body.userId.
 */
export function uidFromToken(token: string): string {
  if (typeof token !== 'string' || token.length === 0) throw new Error('e2e_token_uid_missing');
  const payloadSegment = token.split('.')[0];
  if (!payloadSegment) throw new Error('e2e_token_uid_missing');
  let parsed: { uid?: unknown };
  try {
    parsed = JSON.parse(Buffer.from(payloadSegment, 'base64url').toString());
  } catch {
    throw new Error('e2e_token_uid_missing');
  }
  if (typeof parsed?.uid !== 'string' || parsed.uid.length === 0) throw new Error('e2e_token_uid_missing');
  return parsed.uid;
}
