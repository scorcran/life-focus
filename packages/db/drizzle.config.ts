import { defineConfig } from 'drizzle-kit';
import { loadConfig } from '@life-focus/config';

// All env access flows through @life-focus/config (no raw process.env — lint-enforced).
const { DATABASE_URL } = loadConfig();

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema',
  out: './drizzle',
  dbCredentials: {
    url: DATABASE_URL,
  },
});
