import { describe, it, expect } from 'vitest';
import { encryptSecret, decryptSecret, decodeTokenKey } from './token-cipher.js';

const MASTER_KEY_STR = Buffer.alloc(32, 5).toString('base64');

describe('token-cipher (Story 1.4 — no plaintext tokens at rest)', () => {
  it('round-trips a token through encrypt → decrypt', () => {
    const key = decodeTokenKey(MASTER_KEY_STR);
    const cipher = encryptSecret('ya29.super-secret-refresh-token', key);
    expect(cipher).not.toContain('super-secret'); // not plaintext
    expect(decryptSecret(cipher, key)).toBe('ya29.super-secret-refresh-token');
  });

  it('produces different ciphertexts for the same plaintext (random IV)', () => {
    const key = decodeTokenKey(MASTER_KEY_STR);
    const a = encryptSecret('same', key);
    const b = encryptSecret('same', key);
    expect(a).not.toBe(b);
    expect(decryptSecret(a, key)).toBe('same');
    expect(decryptSecret(b, key)).toBe('same');
  });

  it('fails to decrypt under a wrong key', () => {
    const key = decodeTokenKey(MASTER_KEY_STR);
    const wrong = decodeTokenKey(Buffer.alloc(32, 9).toString('base64'));
    const cipher = encryptSecret('secret', key);
    expect(() => decryptSecret(cipher, wrong)).toThrow();
  });
});
