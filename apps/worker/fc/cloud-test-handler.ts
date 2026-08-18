import { createCloudTestFcHandler } from '../src/cloud-test-fc.ts';

export function loadCloudTestConfigFromEnvironment(env: NodeJS.ProcessEnv = process.env): Promise<string> {
  const encoded = env.MEETWISE_CLOUD_TEST_EXECUTOR_CONFIG_B64?.trim();
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded))
    return Promise.reject(new Error('cloud_test_fc_secret_unavailable'));
  try {
    return Promise.resolve(Buffer.from(encoded, 'base64').toString('utf8'));
  } catch {
    return Promise.reject(new Error('cloud_test_fc_secret_unavailable'));
  }
}

/** No trigger is configured: a trusted project control session invokes this function directly. */
export const handler = createCloudTestFcHandler({
  loadSecret: loadCloudTestConfigFromEnvironment,
  tlsModeOverride: process.env.MEETWISE_CLOUD_TEST_TLS_MODE_OVERRIDE,
});
