import 'dotenv/config';
import { SESSION_DURATION_MINUTES, TIME_SLOTS } from '@booking/shared';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sessions } from './schema';

const WEEKDAY_START = 1;
const WEEKDAY_END = 5;

async function seedSessions(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  try {
    const payload = [];
    for (
      let dayOfWeek = WEEKDAY_START;
      dayOfWeek <= WEEKDAY_END;
      dayOfWeek += 1
    ) {
      for (const timeSlot of TIME_SLOTS) {
        payload.push({
          dayOfWeek,
          startTime: `${timeSlot}:00`,
          durationMinutes: SESSION_DURATION_MINUTES,
          isActive: true,
        });
      }
    }

    await db.insert(sessions).values(payload).onConflictDoNothing();
    console.log(`Seed completed. Inserted up to ${payload.length} sessions.`);
  } finally {
    await pool.end();
  }
}

void seedSessions();
