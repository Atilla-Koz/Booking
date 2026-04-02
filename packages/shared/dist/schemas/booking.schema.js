"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailableSessionsResponseSchema = exports.AvailableSessionSchema = exports.BookingRequestSchema = void 0;
const zod_1 = require("zod");
exports.BookingRequestSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    timeSlot: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Time slot must be HH:MM'),
});
exports.AvailableSessionSchema = zod_1.z.object({
    timeSlot: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Time slot must be HH:MM'),
    startTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be HH:MM'),
    durationMinutes: zod_1.z.number().int().positive(),
    available: zod_1.z.boolean(),
});
exports.AvailableSessionsResponseSchema = zod_1.z.array(exports.AvailableSessionSchema);
//# sourceMappingURL=booking.schema.js.map