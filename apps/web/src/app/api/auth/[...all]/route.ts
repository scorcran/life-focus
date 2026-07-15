import { toNextJsHandler } from 'better-auth/next-js';
import { getAuth } from '../../../../lib/auth.js';

// Better Auth mounts all its endpoints under /api/auth/* (sign-in, sign-up,
// sign-out, get-session, …). The gated single-user rule is enforced inside the
// auth instance (see lib/auth.ts), not here.
export const { GET, POST } = toNextJsHandler(getAuth());
