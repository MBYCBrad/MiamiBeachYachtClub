import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Optimized connection pool for millisecond response times
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 50, // Increased pool size
  idleTimeoutMillis: 60000, // Keep connections alive longer
  connectionTimeoutMillis: 5000, // Increased timeout
  query_timeout: 10000,
  statement_timeout: 10000,
  application_name: 'mbyc-app',
  keepAlive: true,
  keepAliveInitialDelayMillis: 0
});

export const db = drizzle({ 
  client: pool, 
  schema,
  logger: false  // Disable logging for performance
});
