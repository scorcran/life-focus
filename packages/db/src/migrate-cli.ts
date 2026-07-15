import { loadConfig } from '@life-focus/config';
import { runMigrations } from './migrate.js';

/**
 * One-shot migration entrypoint for the dev/prod `migrate` container. Applies
 * all pending migrations, then exits — the web/worker services depend on this
 * completing successfully before they serve authed routes.
 */
async function main(): Promise<void> {
  const { DATABASE_URL } = loadConfig();
  await runMigrations(DATABASE_URL);
  console.log('[db] migrations applied');
}

main().then(
  () => process.exit(0),
  (err: unknown) => {
    console.error('[db] migration failed:', err);
    process.exit(1);
  },
);
