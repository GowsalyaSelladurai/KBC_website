import { route, ok } from "@/lib/api";
import { confirmSchema, confirmPayment } from "@/modules/enrollment";
// Step 2: verifies the payment with the gateway, then creates/links the account and the enrolment (idempotent).
export const POST = route(async (req) => {
  const b = confirmSchema.parse(await req.json());
  return ok(await confirmPayment({ paymentId: b.paymentId, razorpayPaymentId: b.razorpay_payment_id, razorpaySignature: b.razorpay_signature, outcome: b.outcome }));
});
