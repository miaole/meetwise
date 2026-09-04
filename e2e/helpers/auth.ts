import { BASE, jsonHeaders, readJson } from './http.ts';

export type AuthSession = {
  token: string;
  headers: Record<string, string>;
  email: string;
};

/**
 * Register, or log in when the isolated rerun already created the account.
 * Does not invent tokens or skip the HTTP auth boundary.
 */
export async function signupOrLogin(email: string, password: string, role?: 'recruiter' | 'candidate'): Promise<AuthSession> {
  const body = role ? { email, password, role } : { email, password };
  let response = await fetch(`${BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  let payload: any = await readJson(response);
  if (response.status !== 200 || typeof payload.token !== 'string') {
    response = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    payload = await readJson(response);
  }
  if (response.status !== 200 || typeof payload.token !== 'string') {
    throw new Error(`e2e_auth_failed:status=${response.status}`);
  }
  return { token: payload.token, headers: jsonHeaders(payload.token), email };
}

/**
 * Decode the uid the current API embeds in the first JWT segment.
 * This matches the live token layout used by recruiter/candidate RLS assertions.
 * Do not replace it with a client-invented user id.
 */
export function uidFromToken(token: string): string {
  const uid = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString()).uid;
  if (typeof uid !== 'string' || uid.length === 0) throw new Error('e2e_token_uid_missing');
  return uid;
}
