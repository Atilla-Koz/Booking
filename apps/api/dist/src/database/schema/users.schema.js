"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
});
//# sourceMappingURL=users.schema.js.map