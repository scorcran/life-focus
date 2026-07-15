import { describe, it, expect } from 'vitest';
import { isSignUpOpen } from './sign-up-gate.js';

describe('single-user sign-up gate', () => {
  it('is OPEN when the user table is empty', async () => {
    const open = await isSignUpOpen(async () => 0);
    expect(open).toBe(true);
  });

  it('is CLOSED once one user exists', async () => {
    const open = await isSignUpOpen(async () => 1);
    expect(open).toBe(false);
  });

  it('is CLOSED for any non-zero count (defence in depth)', async () => {
    const open = await isSignUpOpen(async () => 5);
    expect(open).toBe(false);
  });
});
