"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const zod_1 = require("zod");
exports.userSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, "Name must be at least 2 characters long")
        .max(50, "Name cannot exceed 50 characters"),
    email: zod_1.z.string()
        .email("Invalid email format"),
    mobileNumber: zod_1.z.string()
        .regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit Indian number"),
});
