import type { CSSProperties } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '../../lib/auth.js';
import { countUsersInDb, isSignUpOpen } from '../../lib/sign-up-gate.js';
import { SignInForm } from './sign-in-form.js';

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  backgroundColor: 'var(--light-surface)',
};

// This surface must not be cached — first-run vs sign-in depends on live DB state.
export const dynamic = 'force-dynamic';

export default async function SignInPage() {
  // Already signed in? Go straight to the shell.
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (session?.user) {
    redirect('/today');
  }

  // First run (no user yet) shows sign-up; otherwise sign-in only.
  const firstRun = await isSignUpOpen(countUsersInDb);

  return (
    <main style={pageStyle}>
      <SignInForm firstRun={firstRun} />
    </main>
  );
}
