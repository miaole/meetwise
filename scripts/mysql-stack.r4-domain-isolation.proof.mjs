/**
 * S4 legacy path forwarder → scripts/conn-stack/mysql-stack.r4-domain-isolation.proof.mjs
 *
 * Conn-only forever (BUG-FAKE-CONN). NEVER LIVE · NEVER prove-shell · NEVER covered.
 * Keeps root package.json mysql-stack:*:prove aliases working.
 * releaseEvidence=false · Not HA · 连通绿 ≠ E2E · pass ≠ R4 已关 · ≠ 题域已隔离
 *
 * Rollback: restore body here from scripts/conn-stack/ (or git revert); delete conn-stack forwarders.
 */
import './conn-stack/mysql-stack.r4-domain-isolation.proof.mjs';
