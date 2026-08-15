import { cloudTestSerialFailure, runCloudTestSerial } from '../src/cloud-test-serial.ts';

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  try {
    console.log(JSON.stringify(await runCloudTestSerial({ runId: argument('--run'), caseId: argument('--case') })));
  } catch (error) {
    console.error(JSON.stringify({ kind: 'cloud_test_serial_receipt', status: 'failed', testOnly: true, releaseEvidence: false, code: cloudTestSerialFailure(error) }));
    process.exitCode = 1;
  }
}

void main();
