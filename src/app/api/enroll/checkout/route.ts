import { route, ok } from "@/lib/api";
import { checkoutSchema, startCheckout } from "@/modules/enrollment";
// Step 1 of self-enrolment: validates details, creates a payment order (amount comes from the DB, never from the client).
export const POST = route(async (req) => ok(await startCheckout(checkoutSchema.parse(await req.json()) as Parameters<typeof startCheckout>[0]), 201));
