import type { ReactNode, CSSProperties } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '../../lib/auth.js';
import { SideNav } from '../../components/side-nav.js';
import { SignOutButton } from '../../components/sign-out-button.js';

const shellStyle: CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: 'var(--light-surface)',
};

const columnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '16px 40px',
  borderBottom: '1px solid var(--light-outline-variant)',
  backgroundColor: 'var(--light-surface)',
};

const mainStyle: CSSProperties = {
  flex: 1,
  padding: '40px',
};

/**
 * Authenticated shell (AD-6). This is the authoritative, DB-backed session
 * gate: middleware makes an optimistic cookie-presence redirect, but the real
 * check happens here via Better Auth's `getSession`. No session → /sign-in.
 */
export default async function AppShellLayout({ children }: { children: ReactNode }) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect('/sign-in');
  }

  return (
    <div style={shellStyle}>
      <SideNav />
      <div style={columnStyle}>
        <header style={headerStyle}>
          <span className="headline-md" style={{ color: 'var(--light-on-surface)' }}>
            Life Focus
          </span>
          <SignOutButton />
        </header>
        <main style={mainStyle}>{children}</main>
      </div>
    </div>
  );
}
