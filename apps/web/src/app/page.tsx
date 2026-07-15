import { redirect } from 'next/navigation';

// `/` is the shell entry point → default to Today. Unauthenticated visitors are
// redirected to /sign-in by the middleware before this runs.
export default function Home() {
  redirect('/today');
}
