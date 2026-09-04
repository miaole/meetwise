/**
 * Preview-only resume OCR UI gate. Mirror the API composition-root contract
 * from the API composition-root on main (`0127`): exact `OCR_ENABLED=1` AND `OCR_PREVIEW=1`.
 *
 * Production (`NODE_ENV=production`), `MODEL_COST_ENFORCEMENT=enforce`, and the
 * read-only public site (`MEETWISE_PUBLIC_PREVIEW=1`) stay refuse-closed even if
 * both flags are set. This boolean only decides accept/copy/timeout. The API
 * remains the write authority; flag drift still surfaces as `image_ocr_unavailable`.
 * Not a production visual SLO. `releaseEvidence=false`.
 */
export function isProductionOcrLocked(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV?.trim().toLowerCase() === 'production'
    || env.MODEL_COST_ENFORCEMENT?.trim().toLowerCase() === 'enforce'
    || env.MEETWISE_PUBLIC_PREVIEW === '1';
}

export function isOcrPreviewRequested(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.OCR_ENABLED === '1' && env.OCR_PREVIEW === '1';
}

/** True only when the resume page may offer the image OCR preview path. */
export function isOcrPreviewEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return isOcrPreviewRequested(env) && !isProductionOcrLocked(env);
}
