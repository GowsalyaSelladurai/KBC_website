import { z } from "zod"; import { route, ok } from "@/lib/api"; import { enrollSchema } from "@/lib/schemas"; import { enrollStudent } from "@/lib/enroll"; import { verifyPayment } from "@/lib/payment";
export const POST = route(async (req) => {
  const b = enrollSchema.extend({ paymentRef: z.string().optional() }).parse(await req.json());
  await verifyPayment(b.paymentRef);
  return ok(await enrollStudent({ ...b, source: "online" }), 201);
});
