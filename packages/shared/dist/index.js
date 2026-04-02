"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterSchema = exports.LoginSchema = exports.BookingRequestSchema = exports.AvailableSessionsResponseSchema = exports.AvailableSessionSchema = exports.TIME_SLOTS = exports.SESSION_DURATION_MINUTES = void 0;
var constants_1 = require("./constants");
Object.defineProperty(exports, "SESSION_DURATION_MINUTES", { enumerable: true, get: function () { return constants_1.SESSION_DURATION_MINUTES; } });
Object.defineProperty(exports, "TIME_SLOTS", { enumerable: true, get: function () { return constants_1.TIME_SLOTS; } });
var booking_schema_1 = require("./schemas/booking.schema");
Object.defineProperty(exports, "AvailableSessionSchema", { enumerable: true, get: function () { return booking_schema_1.AvailableSessionSchema; } });
Object.defineProperty(exports, "AvailableSessionsResponseSchema", { enumerable: true, get: function () { return booking_schema_1.AvailableSessionsResponseSchema; } });
Object.defineProperty(exports, "BookingRequestSchema", { enumerable: true, get: function () { return booking_schema_1.BookingRequestSchema; } });
var auth_schema_1 = require("./schemas/auth.schema");
Object.defineProperty(exports, "LoginSchema", { enumerable: true, get: function () { return auth_schema_1.LoginSchema; } });
Object.defineProperty(exports, "RegisterSchema", { enumerable: true, get: function () { return auth_schema_1.RegisterSchema; } });
//# sourceMappingURL=index.js.map