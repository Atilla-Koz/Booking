import {
  boolean,
  integer,
  pgTable,
  time,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    dayOfWeek: integer('day_of_week').notNull(),
    startTime: time('start_time').notNull(),
    durationMinutes: integer('duration_minutes').notNull().default(60),
    isActive: boolean('is_active').notNull().default(true),
  },
  (table) => [
    unique('sessions_day_of_week_start_time_unique').on(
      table.dayOfWeek,
      table.startTime,
    ),
  ],
);
