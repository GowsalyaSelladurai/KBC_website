import { route, ok } from "@/lib/api";
import { handleGatewayWebhook } from "@/modules/enrollment";
export const dynamic = "force-dynamic";
// Razorpay webhook (set the same RAZORPAY_WEBHOOK_SECRET in the Razorpay dashboard). Needs the raw body for the signature.
export const POST = route(async (req) => { await handleGatewayWebhook(await req.text(), req.headers.get("x-razorpay-signature")); return ok({ ok: true }); });
