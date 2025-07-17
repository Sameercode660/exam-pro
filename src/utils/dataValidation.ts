import { z } from "zod";

export const userSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name cannot exceed 50 characters"),

  email: z.string()
    .email("Invalid email format"),

  mobileNumber: z.string()
    .regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit Indian number"),
});
