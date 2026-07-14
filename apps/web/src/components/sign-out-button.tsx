'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { signOut } from '../lib/auth-client.js';

const buttonStyle: CSSProperties = {
  appearance: 'none',
  cursor: 'pointer',
  padding: '8px 16px',
  borderRadius: 9999,
  border: '1px solid var(--light-outline)',
  background: 'transparent',
  color: 'var(--light-on-background)',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: '0.05em',
};

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await signOut();
    // Full navigation so the middleware re-evaluates the (now absent) session.
    window.location.href = '/sign-in';
  }

  return (
    <button type="button" onClick={handleSignOut} disabled={pending} style={buttonStyle}>
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
