import { Provider } from '@nestjs/common';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE_TOKEN = 'DRIZZLE_TOKEN';

export type DrizzleClient = NodePgDatabase<typeof schema>;

export const drizzleProvider: Provider = {
  provide: DRIZZLE_TOKEN,
  useFactory: () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined');
    }

    const pool = new Pool({ connectionString });
    return drizzle(pool, { schema });
  },
};
