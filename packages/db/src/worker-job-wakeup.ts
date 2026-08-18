/**
 * PostgreSQL wakeup is a lossy, commit-delivered hint only.  It intentionally
 * carries no owner, job, request, or user data; queue tables and claim leases
 * remain the sole durable source of work.
 */
export const WORKER_JOB_WAKEUP_CHANNEL = 'meetwise_worker_wakeup_v1';
export const WORKER_JOB_WAKEUP_PAYLOAD = 'wake';
