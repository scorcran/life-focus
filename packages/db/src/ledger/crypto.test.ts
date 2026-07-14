import { describe, it, expect } from 'vitest';
import {
  generateDataKey,
  encryptField,
  decryptField,
  wrapDataKey,
  unwrapDataKey,
  isEncryptedField,
  decodeMasterKey,
} from './crypto.js';

describe('ledger crypto (ADR 0001)', () => {
  it('field encrypt → decrypt round-trips', () => {
    const key = generateDataKey();
    const env = encryptField('Ship the ledger', key);
    expect(isEncryptedField(env)).toBe(true);
    expect(env.__enc).not.toContain('Ship'); // ciphertext, not plaintext
    expect(decryptField(env, key)).toBe('Ship the ledger');
  });

  it('field decrypt fails under the wrong key', () => {
    const env = encryptField('secret', generateDataKey());
    expect(() => decryptField(env, generateDataKey())).toThrow();
  });

  it('data-key wrap → unwrap round-trips', () => {
    const master = generateDataKey();
    const dataKey = generateDataKey();
    const wrapped = wrapDataKey(dataKey, master);
    expect(unwrapDataKey(wrapped, master).equals(dataKey)).toBe(true);
  });

  it('unwrap fails under the wrong master key', () => {
    const wrapped = wrapDataKey(generateDataKey(), generateDataKey());
    expect(() => unwrapDataKey(wrapped, generateDataKey())).toThrow();
  });

  it('end-to-end: encrypt under wrapped key, then unwrap and decrypt', () => {
    const master = generateDataKey();
    const dataKey = generateDataKey();
    const wrapped = wrapDataKey(dataKey, master);
    const env = encryptField('title text', dataKey);

    // Later: unwrap the stored key, decrypt the field.
    const recovered = unwrapDataKey(wrapped, master);
    expect(decryptField(env, recovered)).toBe('title text');
  });

  it('decodeMasterKey accepts base64 and hex, rejects wrong length', () => {
    const raw = Buffer.alloc(32, 5);
    expect(decodeMasterKey(raw.toString('base64')).equals(raw)).toBe(true);
    expect(decodeMasterKey(raw.toString('hex')).equals(raw)).toBe(true);
    expect(() => decodeMasterKey(Buffer.alloc(16).toString('base64'))).toThrow();
  });

  it('rejects a non-32-byte data key', () => {
    expect(() => encryptField('x', Buffer.alloc(16))).toThrow();
  });
});
