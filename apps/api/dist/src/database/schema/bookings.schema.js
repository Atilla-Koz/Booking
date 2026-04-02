"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookings = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const users_schema_1 = require("./users.schema");
exports.bookings = (0, pg_core_1.pgTable)('bookings', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => users_schema_1.users.id, { onDelete: 'cascade' }),
    date: (0, pg_core_1.date)('date', { mode: 'string' }).notNull(),
    timeSlot: (0, pg_core_1.varchar)('time_slot', { length: 5 }).notNull(),
    durationMinutes: (0, pg_core_1.integer)('duration_minutes').notNull().default(60),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('confirmed'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true })
        .defaultNow()
        .$onUpdateFn(() => new Date())
        .notNull(),
}, (table) => [
    (0, pg_core_1.unique)('bookings_date_time_slot_unique').on(table.date, table.timeSlot),
    (0, pg_core_1.index)('bookings_date_idx').on(table.date),
    (0, pg_core_1.index)('bookings_user_id_idx').on(table.userId),
    (0, pg_core_1.index)('bookings_status_idx').on(table.status),
]);
//# sourceMappingURL=bookings.schema.js.map