"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.sessions = (0, pg_core_1.pgTable)('sessions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    dayOfWeek: (0, pg_core_1.integer)('day_of_week').notNull(),
    startTime: (0, pg_core_1.time)('start_time').notNull(),
    durationMinutes: (0, pg_core_1.integer)('duration_minutes').notNull().default(60),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
}, (table) => [
    (0, pg_core_1.unique)('sessions_day_of_week_start_time_unique').on(table.dayOfWeek, table.startTime),
]);
//# sourceMappingURL=sessions.schema.js.map