/**
 * Turns untrusted child/container output into a non-content diagnostic.
 * Keep this intentionally tiny: callers must never add a preview/hash that
 * can become an offline oracle for a short secret, answer or PII fragment.
 */
export function withheldOutputSummary(label, value) {
  if (!/^[a-z_]+$/.test(label)) throw new Error('withheld_output_label_invalid');
  return `${label}_bytes=${Buffer.byteLength(String(value))}`;
}
