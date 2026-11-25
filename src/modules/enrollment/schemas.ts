import { z } from "zod";
import { normalizeEmail, normalizePhone } from "@/modules/auth";
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(254).transform(normalizeEmail),
  phone: z.string().trim().max(25).transform(normalizePhone).refine((p) => p.length >= 8 && p.length <= 15, "Enter a valid mobile number"),
});
export const checkoutSchema = contactSchema.extend({ courseId: z.coerce.number().int().positive("Select a course") });
export const confirmSchema = z.object({
  paymentId: z.coerce.number().int().positive(),
  razorpay_payment_id: z.string().optional(), razorpay_signature: z.string().optional(),
  outcome: z.enum(["success", "failure"]).optional(), // honoured in mock mode only
});
export const failSchema = z.object({ paymentId: z.coerce.number().int().positive(), reason: z.string().max(200).optional() });
export const staffEnrollSchema = checkoutSchema.extend({ paymentStatus: z.enum(["paid", "pending"]).default("paid"), reference: z.string().trim().max(100).optional() });
