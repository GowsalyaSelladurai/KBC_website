import { NextResponse } from "next/server";
import { ZodError } from "zod";
export class HttpError extends Error { constructor(public status: number, msg: string, public code?: string) { super(msg); } }
export const ok = (d: any, s = 200) => NextResponse.json(d, { status: s });
export const route = (fn: (req: Request, ctx: any) => Promise<Response>) => async (req: Request, ctx: any) => {
  try { return await fn(req, ctx); } catch (e: any) {
    if (e instanceof ZodError) return ok({ error: e.issues[0].message }, 400);
    if (e instanceof HttpError) return ok({ error: e.message, ...(e.code ? { code: e.code } : {}) }, e.status);
    if (e?.code === "23505") return ok({ error: "Already exists" }, 409);
    console.error(e); return ok({ error: "Server error" }, 500);
  }
};
