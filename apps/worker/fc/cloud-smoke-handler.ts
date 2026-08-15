import { createCloudSmokeFcHandler } from '../src/cloud-smoke-fc.ts';

export function loadCloudSmokeConfigFromEnvironment(env: NodeJS.ProcessEnv = process.env): Promise<string> {
  const encoded = env.MEETWISE_CLOUD_SMOKE_CONFIG_B64?.trim();
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded))
    return Promise.reject(new Error('cloud_smoke_fc_secret_unavailable'));
  try {
    return Promise.resolve(Buffer.from(encoded, 'base64').toString('utf8'));
  } catch {
    return Promise.reject(new Error('cloud_smoke_fc_secret_unavailable'));
  }
}

/**
 * The fixed-readonly test function has no trigger and accepts no connection
 * parameters. Its one encrypted Function Compute environment value is a
 * base64-encoded configuration envelope; it is intentionally not read from
 * the process environment by the smoke runner itself.
 */
export const handler = createCloudSmokeFcHandler({ loadSecret: loadCloudSmokeConfigFromEnvironment });
