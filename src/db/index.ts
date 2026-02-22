import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Singleton pattern to prevent connection leaks during Next.js Hot Module Replacement (HMR)
const globalForDb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
};

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = globalForDb.conn ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
    globalForDb.conn = client;
}

export const db = drizzle(client, { schema });
