import { z } from "zod";
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters").max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must include a letter").regex(/\d/, "Password must include a number");
export const requestCodeSchema = z.object({ identifier: z.string().trim().min(3, "Enter your mobile number or email"), channel: z.enum(["sms", "email"]).optional() });
export const verifyCodeSchema = z.object({ identifier: z.string().trim().min(3, "Enter your mobile number or email"), code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code") });
export const completeSchema = z.object({ setupToken: z.string().min(10, "Verification expired. Please verify again."), password: passwordSchema });
