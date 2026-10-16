/**
 * S4 legacy path forwarder → scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs
 *
 * Conn-only forever (BUG-FAKE-CONN). NEVER LIVE · NEVER prove-shell · NEVER covered.
 * Keeps root package.json mysql-stack:*:prove / worker-wakeup-redis:prove aliases working.
 * releaseEvidence=false · Not HA · 连通绿 ≠ E2E
 *
 * Rollback: restore body here from scripts/conn-stack/ (or git revert); delete conn-stack forwarders.
 */
import './conn-stack/mysql-stack.r5-mark-red.proof.mjs';
