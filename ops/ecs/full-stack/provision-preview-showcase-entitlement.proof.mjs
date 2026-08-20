import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  assertActiveEpochLimit, assertRoot, GIFT_TTL_SECONDS, GIFT_UNITS, OWNER_EMAIL,
  buildBinding, buildReceipt, classifyBucket, decideGrant, digest, grantIdentity, isExpired, LOCK_KEY, schemaBindingFromLedger,
} from './provision-preview-showcase-entitlement.mjs';

const target = {
  database: 'meetwise_cloud_test', expectedDbRole: 'meetwise_preview_audit',
  schemaHead: '20260820.sql', schemaLedgerDigest: 'a'.repeat(64), releaseTreeDigest: 'b'.repeat(64),
};
const binding = buildBinding(target);
const now = new Date('2026-08-20T12:00:00.000Z');
const identity = grantIdentity(now);
const nextIdentity = grantIdentity(new Date('2026-08-21T12:00:00.000Z'));
const account = { id: 'candidate-preview', email: OWNER_EMAIL, role: 'candidate', status: 'active' };
const fresh = { id: identity.bucketId, owner_user_id: account.id, expected_owner_user_id: account.id, kind: 'gift', units_total: GIFT_UNITS, units_reserved: 0, units_consumed: 3, expires_at: '2026-08-21T12:00:00.000Z' };

assert.doesNotThrow(() => assertRoot(0));
assert.throws(() => assertRoot(1000), /root_required/);
assert.equal(binding.releaseIdentity, `tree:${target.releaseTreeDigest}`);
assert.equal(digest(target).length, 64);
assert.equal(identity.sourceOrderId, 'preview-showcase-gift:v2:2026-08-20:previewc@meetwise.com');
assert.equal(identity.epoch, '2026-08-20');
assert.match(identity.bucketId, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
assert.deepEqual(grantIdentity(now), identity);
assert.notEqual(nextIdentity.bucketId, identity.bucketId);
assert.notEqual(nextIdentity.sourceOrderId, identity.sourceOrderId);
assert.equal(GIFT_UNITS, 6);
assert.equal(GIFT_TTL_SECONDS, 86_400);

assert.equal(decideGrant({ accountRows: [account], sourceRows: [], bucketIdRows: [], now }).operation, 'create');
assert.equal(decideGrant({ accountRows: [account], sourceRows: [fresh], bucketIdRows: [], now }).operation, 'replayed');
assert.throws(() => decideGrant({ accountRows: [{ ...account, role: 'recruiter' }], sourceRows: [], bucketIdRows: [], now }), /owner_role_invalid/);
assert.throws(() => decideGrant({ accountRows: [{ ...account, status: 'disabled' }], sourceRows: [], bucketIdRows: [], now }), /owner_status_invalid/);
assert.throws(() => decideGrant({ accountRows: [account], sourceRows: [{ ...fresh, owner_user_id: 'other' }], bucketIdRows: [], now }), /wrong_owner/);
assert.throws(() => decideGrant({ accountRows: [account], sourceRows: [fresh, fresh], bucketIdRows: [], now }), /source_bucket_conflict/);
assert.throws(() => classifyBucket({ bucket: { ...fresh, expires_at: '2026-08-20T11:59:59.000Z' }, now }), /expired/);
assert.throws(() => classifyBucket({ bucket: { ...fresh, units_total: 4 }, now }), /shape_invalid/);
assert.throws(() => decideGrant({ accountRows: [account], sourceRows: [], bucketIdRows: [fresh], now }), /identity_conflict/);
assert.doesNotThrow(() => assertActiveEpochLimit(2, 'replayed'));
assert.throws(() => assertActiveEpochLimit(2, 'create'), /active_epoch_limit_exceeded/);
assert.doesNotThrow(() => assertActiveEpochLimit(1, 'create'));
assert.equal(isExpired('2026-08-20T11:59:59.000Z', now), true);
assert.equal(isExpired('2026-08-20T12:00:01.000Z', now), false);
assert.deepEqual(schemaBindingFromLedger([{ version: '0089', checksum: 'x' }]), { schemaHead: '0089.sql', schemaLedgerDigest: digest([{ version: '0089', checksum: 'x' }]) });
assert.throws(() => schemaBindingFromLedger([]), /schema_ledger_empty/);

const receipt = buildReceipt({ account, bucket: fresh, operation: 'create', binding, identity, expiresAt: fresh.expires_at, verifiedAt: now.toISOString() });
assert.equal(receipt.receiptDigest, digest(Object.fromEntries(Object.entries(receipt).filter(([key]) => key !== 'receiptDigest'))));
assert.equal(receipt.paymentOrderTouched, false);
assert.equal(receipt.grantEpoch, '2026-08-20');
assert.equal(receipt.sourceOrderId, identity.sourceOrderId);
assert.equal(receipt.unitsConsumed, 3);
assert.equal(receipt.unitsAvailable, 3, 'deep history consumes three units and leaves three interactive units');
assert.equal(Object.keys(receipt).some((key) => /password|secret|databaseUrl|connection/i.test(key)), false);

const source = await readFile(new URL('./provision-preview-showcase-entitlement.mjs', import.meta.url), 'utf8');
assert.match(source, /BEGIN/);
assert.match(source, /pg_advisory_xact_lock/);
assert.match(source, /FOR UPDATE/);
assert.match(source, /schema_migrations/);
assert.match(source, /preview-showcase-gift:v1:previewc@meetwise\.com/);
assert.match(source, /ON CONFLICT \(id\) DO NOTHING/);
assert.doesNotMatch(source, /INSERT\s+INTO\s+public\.payment_order/i);
assert.match(source, new RegExp(LOCK_KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
console.log('provision-preview-showcase-entitlement proof: PASS');
