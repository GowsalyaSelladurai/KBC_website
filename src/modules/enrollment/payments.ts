// Enrollment module — payment gateway adapter. "mock" for development, "razorpay" for production.
import crypto from "node:crypto";
import { HttpError } from "@/lib/api";

export type Provider = "mock" | "razorpay";
export const paymentMode = (): Provider => (process.env.PAYMENT_MODE === "razorpay" ? "razorpay" : "mock");

export function assertGatewayReady() {
  if (paymentMode() === "mock") {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_MOCK_PAYMENTS !== "true") throw new HttpError(503, "Online payments are not available right now. Please contact the academy.");
  } else if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new HttpError(503, "Online payments are not configured. Please contact the academy.");
}
const hmac = (secret: string, data: string | Buffer) => crypto.createHmac("sha256", secret).update(data).digest("hex");
const same = (a: string, b: string) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function createGatewayOrder(p: { provider: Provider; paymentId: number; amount: number; currency: string }) {
  if (p.provider === "mock") return { orderId: `mock_order_${crypto.randomUUID()}` };
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const r = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: Math.round(p.amount * 100), currency: p.currency, receipt: `kbc_${p.paymentId}`, notes: { paymentId: String(p.paymentId) } }) });
  const d: any = await r.json().catch(() => ({}));
  if (!r.ok || !d.id) throw new Error(`Razorpay order failed: ${r.status} ${JSON.stringify(d)}`);
  return { orderId: d.id as string };
}

/** Returns the gateway's payment id when (and only when) the payment is genuinely successful. */
export async function verifyGatewayPayment(p: { provider: string; orderId: string; razorpayPaymentId?: string; razorpaySignature?: string; outcome?: string }) {
  if (p.provider === "mock") {
    assertGatewayReady();
    if (p.outcome !== "success") throw new HttpError(402, "Payment failed. No enrolment was created and you have not been charged.", "PAYMENT_FAILED");
    return { providerPaymentId: `mock_pay_${crypto.randomUUID()}` };
  }
  if (!p.razorpayPaymentId || !p.razorpaySignature || !process.env.RAZORPAY_KEY_SECRET) throw new HttpError(402, "Payment could not be verified.", "PAYMENT_UNVERIFIED");
  if (!same(hmac(process.env.RAZORPAY_KEY_SECRET, `${p.orderId}|${p.razorpayPaymentId}`), p.razorpaySignature)) throw new HttpError(402, "Payment could not be verified.", "PAYMENT_UNVERIFIED");
  return { providerPaymentId: p.razorpayPaymentId };
}

export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  return !!secret && !!signature && same(hmac(secret, rawBody), signature);
}
