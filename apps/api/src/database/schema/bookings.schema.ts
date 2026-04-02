import {
  date,
  index,
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: date('date', { mode: 'string' }).notNull(),
    timeSlot: varchar('time_slot', { length: 5 }).notNull(),
    durationMinutes: integer('duration_minutes').notNull().default(60),
    status: varchar('status', { length: 20 }).notNull().default('confirmed'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    unique('bookings_date_time_slot_unique').on(table.date, table.timeSlot),
    index('bookings_date_idx').on(table.date),
    index('bookings_user_id_idx').on(table.userId),
    index('bookings_status_idx').on(table.status),
  ],
);
