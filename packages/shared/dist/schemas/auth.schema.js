"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().trim().min(1, 'Name is required'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1, 'Password is required'),
});
//# sourceMappingURL=auth.schema.js.map