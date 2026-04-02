"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const shared_1 = require("@booking/shared");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const schema_1 = require("./schema");
const WEEKDAY_START = 1;
const WEEKDAY_END = 5;
async function seedSessions() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL is not defined');
    }
    const pool = new pg_1.Pool({ connectionString });
    const db = (0, node_postgres_1.drizzle)(pool);
    try {
        const payload = [];
        for (let dayOfWeek = WEEKDAY_START; dayOfWeek <= WEEKDAY_END; dayOfWeek += 1) {
            for (const timeSlot of shared_1.TIME_SLOTS) {
                payload.push({
                    dayOfWeek,
                    startTime: `${timeSlot}:00`,
                    durationMinutes: shared_1.SESSION_DURATION_MINUTES,
                    isActive: true,
                });
            }
        }
        await db.insert(schema_1.sessions).values(payload).onConflictDoNothing();
        console.log(`Seed completed. Inserted up to ${payload.length} sessions.`);
    }
    finally {
        await pool.end();
    }
}
void seedSessions();
//# sourceMappingURL=seed.js.map