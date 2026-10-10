import { Pool } from "pg";

/**
 * Singleton Neon PostgreSQL connection pool.
 *
 * - Uses DATABASE_URL from server-side environment only (never prefixed with
 *   NEXT_PUBLIC_ so it is never exposed to the browser).
 * - Enables SSL (required by Neon) and rejects unauthorised certificates.
 * - Keeps a single pool instance across hot-reloads in development.
 * - Pool is created lazily on first call to getPool() so missing DATABASE_URL
 *   can be caught inside route handlers' try/catch blocks.
 */

const globalForDb = globalThis as unknown as { _pgPool?: Pool };

function createPool(): Pool {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string to the .env file."
    );
  }

  // Next.js pg-connection-string warning overlay fix:
  // Neon connection strings often default to sslmode=require.
  // pg warns that 'require' is treated as 'verify-full' and asks to be explicit.
  if (connectionString.includes("sslmode=require")) {
    connectionString = connectionString.replace("sslmode=require", "sslmode=verify-full");
  }

  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: true },
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

/** Returns the singleton connection pool, creating it on first call. */
export function getPool(): Pool {
  if (!globalForDb._pgPool) {
    globalForDb._pgPool = createPool();
  }
  return globalForDb._pgPool;
}
