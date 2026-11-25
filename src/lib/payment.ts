import { HttpError } from "./api";
// Replace with real verification (e.g. Razorpay signature check) before going live.
export async function verifyPayment(ref?: string) {
  if (process.env.PAYMENT_MODE === "mock" && ref) return;
  throw new HttpError(402, "Payment could not be verified");
}
