import { e2eUrl, readJson } from './http.ts';
import { testHttp } from './http.ts';

export type ResumeFilePayload = {
  filename: string;
  mimeType: string;
  contentBase64: string;
};

/**
 * PIPL resume-processing consent. Upload helpers do not invent a consent cookie.
 */
export async function consentResumeProcessing(headers: Record<string, string>): Promise<any> {
  const response = await testHttp(`/privacy/consent`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ purpose: 'resume_processing' }),
  });
  return { response, body: await readJson(response) };
}

export async function uploadTextResume(headers: Record<string, string>, text: string): Promise<any> {
  const response = await testHttp(`/resume`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text }),
  });
  return { response, body: await readJson(response) };
}

export async function uploadImageResume(headers: Record<string, string>, file: ResumeFilePayload): Promise<any> {
  const response = await testHttp(`/resume/file`, {
    method: 'POST',
    headers,
    body: JSON.stringify(file),
  });
  return { response, body: await readJson(response) };
}

export async function getResumeProfile(headers: Record<string, string>, resumeId: string): Promise<any> {
  return readJson(await testHttp(`/resume/${resumeId}/profile`, { headers }));
}
