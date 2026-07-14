'use client';

import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { signIn, signUp } from '../../lib/auth-client.js';

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: 400,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  padding: 40,
  borderRadius: 12,
  backgroundColor: 'var(--light-surface-container-lowest)',
  border: '1px solid var(--light-outline-variant)',
};

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const inputStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid var(--light-outline)',
  background: 'var(--light-surface)',
  color: 'var(--light-on-surface)',
  fontFamily: 'var(--font-body)',
  fontSize: 16,
};

const submitStyle: CSSProperties = {
  appearance: 'none',
  cursor: 'pointer',
  padding: '10px 24px',
  borderRadius: 9999,
  border: 'none',
  backgroundColor: 'var(--light-primary-container)',
  color: 'var(--light-on-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: '0.05em',
};

const errorStyle: CSSProperties = {
  color: 'var(--light-error)',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
};

export function SignInForm({ firstRun }: { firstRun: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      if (firstRun) {
        const result = await signUp.email({ email, password, name: name || email });
        if (result.error) {
          // Surface the server's reason (e.g. a rejected weak password) rather
          // than assuming every failure is the single-user gate firing. When the
          // gate refuses a second account, Better Auth's message still explains it.
          setError(
            result.error.message ??
              'Could not create your account. If one already exists, sign in instead.',
          );
          return;
        }
      } else {
        const result = await signIn.email({ email, password });
        if (result.error) {
          setError('Email or password is incorrect.');
          return;
        }
      }
      window.location.href = '/today';
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={cardStyle} noValidate>
      <div>
        <h1 className="headline-lg" style={{ margin: 0 }}>
          {firstRun ? 'Create your account' : 'Sign in'}
        </h1>
        <p className="body-md" style={{ margin: '8px 0 0', color: 'var(--light-on-surface-variant)' }}>
          {firstRun
            ? 'This is a single-user app — the first account is yours.'
            : 'Welcome back.'}
        </p>
      </div>

      {firstRun && (
        <div style={fieldStyle}>
          <label htmlFor="name" className="label-md">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>
      )}

      <div style={fieldStyle}>
        <label htmlFor="email" className="label-md">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label htmlFor="password" className="label-md">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={firstRun ? 'new-password' : 'current-password'}
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
      </div>

      {error && (
        <p role="alert" style={errorStyle}>
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} style={submitStyle}>
        {pending
          ? firstRun
            ? 'Creating account…'
            : 'Signing in…'
          : firstRun
            ? 'Create account'
            : 'Sign in'}
      </button>
    </form>
  );
}
