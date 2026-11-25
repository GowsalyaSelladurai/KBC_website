import { z } from "zod";
export const courseSchema = z.object({ name: z.string().trim().min(2, "Course name is required"), icon: z.string().default("✨"), days: z.coerce.number().int().min(1, "Duration must be at least 1 day"), price: z.coerce.number().min(0, "Price cannot be negative") });
export const personSchema = z.object({ name: z.string().trim().min(2, "Name is required"), email: z.string().trim().email("Enter a valid email"), phone: z.string().trim().min(8, "Enter a valid phone number").max(20) });
export const enrollSchema = personSchema.extend({ courseId: z.coerce.number().int().positive("Select a course") });
