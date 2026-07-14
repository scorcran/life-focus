/**
 * AES-256-GCM crypto helpers for ledger crypto-shredding (ADR 0001).
 * Pure functions over `node:crypto` — unit-testable without Postgres.
 *
 * Two layers:
 *  - field encryption: sensitive payload fields are encrypted under a per-scope
 *    32-byte data key.
 *  - key wrapping: each data key is itself encrypted ("wrapped") under the
 *    32-byte LEDGER_MASTER_KEY and stored in `ledger_erasure_key`.
 */
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from 'node:crypto';
import { decodeKeyBytes } from '@life-focus/config';

const ALGO = 'aes-256-gcm';
const IV_BYTES = 12; // GCM standard nonce size
const KEY_BYTES = 32; // AES-256

/** An encrypted field envelope stored in place of a sensitive plaintext value. */
export interface EncryptedField {
  /** Marker so read logic can distinguish encrypted values from plaintext. */
  readonly __enc: string; // base64 ciphertext
  readonly iv: string; // base64 iv
  readonly tag: string; // base64 auth tag
}

/** Type guard: is a payload value an EncryptedField envelope? */
export function isEncryptedField(value: unknown): value is EncryptedField {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as EncryptedField).__enc === 'string' &&
    typeof (value as EncryptedField).iv === 'string' &&
    typeof (value as EncryptedField).tag === 'string'
  );
}

/** Generate a fresh 32-byte data key. */
export function generateDataKey(): Buffer {
  return randomBytes(KEY_BYTES);
}

function assertKey(key: Buffer, name: string): void {
  if (key.length !== KEY_BYTES) {
    throw new Error(`${name} must be exactly ${KEY_BYTES} bytes (got ${key.length})`);
  }
}

/** Encrypt a UTF-8 plaintext string under `dataKey` → EncryptedField envelope. */
export function encryptField(plaintext: string, dataKey: Buffer): EncryptedField {
  assertKey(dataKey, 'dataKey');
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, dataKey, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    __enc: ct.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  };
}

/** Decrypt an EncryptedField envelope under `dataKey`. Throws on wrong key/tamper. */
export function decryptField(env: EncryptedField, dataKey: Buffer): string {
  assertKey(dataKey, 'dataKey');
  const iv = Buffer.from(env.iv, 'base64');
  const ct = Buffer.from(env.__enc, 'base64');
  const tag = Buffer.from(env.tag, 'base64');
  const decipher = createDecipheriv(ALGO, dataKey, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

/**
 * Wrap (encrypt) a data key under the master key. Returns an opaque base64
 * string `iv.tag.ct` suitable for storing in `ledger_erasure_key`.
 */
export function wrapDataKey(dataKey: Buffer, masterKey: Buffer): string {
  assertKey(dataKey, 'dataKey');
  assertKey(masterKey, 'masterKey');
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, masterKey, iv);
  const ct = Buffer.concat([cipher.update(dataKey), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), ct.toString('base64')].join('.');
}

/** Unwrap (decrypt) a wrapped data key produced by `wrapDataKey`. */
export function unwrapDataKey(wrapped: string, masterKey: Buffer): Buffer {
  assertKey(masterKey, 'masterKey');
  const parts = wrapped.split('.');
  if (parts.length !== 3) {
    throw new Error('malformed wrapped data key');
  }
  const [ivB64, tagB64, ctB64] = parts as [string, string, string];
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ct = Buffer.from(ctB64, 'base64');
  const decipher = createDecipheriv(ALGO, masterKey, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

/**
 * Decode a base64 or hex key string into 32 raw bytes. Delegates to the single
 * canonical decoder in `@life-focus/config` (the same one that validates
 * LEDGER_MASTER_KEY at startup) so the two never diverge. Throws if it does not
 * decode to 32 bytes.
 */
export function decodeMasterKey(value: string): Buffer {
  const bytes = decodeKeyBytes(value);
  if (!bytes || bytes.length !== KEY_BYTES) {
    throw new Error(`LEDGER_MASTER_KEY must decode to exactly ${KEY_BYTES} bytes`);
  }
  return bytes;
}
