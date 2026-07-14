/**
 * Encrypt/decrypt OAuth tokens at rest for `calendar_source` (Story 1.4, NFR-6).
 *
 * Reuses the ledger crypto primitives (`crypto.ts`) with the LEDGER_MASTER_KEY
 * bytes as the data key — no new crypto primitive. Tokens are stored as an
 * opaque base64 string so a single text column holds the whole envelope.
 * Never store tokens in plaintext.
 */
import { encryptField, decryptField, decodeMasterKey } from '../ledger/crypto.js';
import type { EncryptedField } from '../ledger/crypto.js';

/** Encrypt a token string → opaque base64 envelope (or null passthrough). */
export function encryptSecret(plaintext: string, masterKey: Buffer): string {
  const env = encryptField(plaintext, masterKey);
  return Buffer.from(JSON.stringify(env), 'utf8').toString('base64');
}

/** Decrypt an opaque base64 envelope produced by `encryptSecret`. */
export function decryptSecret(ciphertext: string, masterKey: Buffer): string {
  const json = Buffer.from(ciphertext, 'base64').toString('utf8');
  const env = JSON.parse(json) as EncryptedField;
  return decryptField(env, masterKey);
}

/** Decode the configured master-key string into 32 raw bytes (delegates to config). */
export function decodeTokenKey(masterKey: string): Buffer {
  return decodeMasterKey(masterKey);
}
