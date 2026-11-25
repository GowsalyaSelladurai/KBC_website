import { z } from "zod";
import bcrypt from "bcryptjs";
import { route, ok, HttpError } from "@/lib/api";
import { q } from "@/lib/db";
import { createSession } from "@/lib/auth";

const S = z.object({
  identifier: z.string().trim().min(3, "Enter your email or phone"),
  password: z.string().min(1, "Enter your password"),
  expectedRole: z.enum(["admin", "student"]).default("student"),
});

export const POST = route(async (req) => {
  const body = S.parse(await req.json());

  const [user] = await q(
    "select id,name,role,password_hash from users where lower(email)=lower($1) or phone=$1",
    [body.identifier]
  );

  if (!user || !(await bcrypt.compare(body.password, user.password_hash))) {
    throw new HttpError(401, "Invalid email/phone or password");
  }

  // Enforce the account type requested by the login screen.
  if (user.role !== body.expectedRole) {
    if (body.expectedRole === "admin") {
      throw new HttpError(403, "This account does not have Admin access. Please use Student Login.");
    }
    throw new HttpError(403, "This is an Admin account. Please use Admin Login.");
  }

  if (user.role === "student") {
    const [activeEnrollment] = await q(
      "select 1 from enrollments where user_id=$1 and expires_at>now()",
      [user.id]
    );
    if (!activeEnrollment) {
      throw new HttpError(403, "Your course access has expired. Please re-enrol.");
    }
  }

  await createSession(user.id, user.role);
  return ok({ role: user.role, name: user.name });
});
