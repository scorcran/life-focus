import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { signState, verifyState } from './gcal-oauth-state.js';

const SECRET = 'x'.repeat(32);

describe('gcal-oauth-state (pure, CSRF-safe context carrying)', () => {
  it('round-trips a signed state carrying context + nonce', () => {
    const signed = signState({ context: 'work', nonce: 'nonce-abc' }, SECRET);
    const verified = verifyState(signed, SECRET);
    expect(verified).toEqual({ context: 'work', nonce: 'nonce-abc' });
  });

  it('rejects a tampered payload (signature mismatch)', () => {
    const signed = signState({ context: 'personal', nonce: 'n1' }, SECRET);
    const [payload, sig] = signed.split('.');
    // Flip the context in the payload without re-signing.
    const forged = Buffer.from(JSON.stringify({ context: 'work', nonce: 'n1' }), 'utf8').toString('base64url');
    expect(verifyState(`${forged}.${sig}`, SECRET)).toBeNull();
    // Sanity: original still verifies.
    expect(verifyState(`${payload}.${sig}`, SECRET)).not.toBeNull();
  });

  it('rejects a state signed with a different secret', () => {
    const signed = signState({ context: 'work', nonce: 'n' }, SECRET);
    expect(verifyState(signed, 'y'.repeat(32))).toBeNull();
  });

  it('rejects malformed input without throwing', () => {
    expect(verifyState('not-a-state', SECRET)).toBeNull();
    expect(verifyState('', SECRET)).toBeNull();
    expect(verifyState('a.b.c', SECRET)).toBeNull();
  });

  it('rejects an invalid context value even when correctly signed', () => {
    // A correctly-signed but invalid ('joint') context must be rejected (AD-5).
    const payload = Buffer.from(JSON.stringify({ context: 'joint', nonce: 'n' }), 'utf8').toString('base64url');
    const sig = createHmac('sha256', SECRET).update(payload).digest().toString('base64url');
    expect(verifyState(`${payload}.${sig}`, SECRET)).toBeNull();
  });
});
