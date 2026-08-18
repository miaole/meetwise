/**
 * Disabled until MODEL-OP-01 supplies a typed vision binding, native endpoint
 * registry, media budget, attempt ledger and deletion contract. This command
 * intentionally reads no environment, file or image and makes no network
 * request, so it cannot turn a local credential or resume into an uncontrolled
 * visual-model smoke.
 */
console.error('vl_smoke_disabled_until_model_op_01');
process.exitCode = 2;
