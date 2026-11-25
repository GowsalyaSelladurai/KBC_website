import { z } from "zod";
import bcrypt from "bcryptjs";
import { route, ok, HttpError } from "@/lib/api";
import { q } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { isEmail, phoneKey } from "@/modules/auth";
import { enrollmentAccessState } from "@/modules/enrollment";

const S = z.object({
  identifier: z.string().trim().min(3, "Enter your email or phone"),
  password: z.string().min(1, "Enter your password"),
  expectedRole: z.enum(["admin", "student"]).default("student"),
});

export const POST = route(async (req) => {
  const body = S.parse(await req.json());
  const id = body.identifier;

  const cols = "id,name,role,status,password_hash";
  const [user] = isEmail(id)
    ? await q(`select ${cols} from users where lower(email)=lower($1)`, [id])
    : phoneKey(id).length >= 8
      ? await q(`select ${cols} from users where phone is not null and right(regexp_replace(phone,'\\D','','g'),10)=$1`, [phoneKey(id)])
      : [];

  // Account created by enrolment but not yet activated: tell the student what to do instead of "wrong password".
  if (user && user.role === "student" && user.status === "pending") {
    throw new HttpError(403, "Your account is not activated yet. Please verify your mobile number to activate it.", "NOT_ACTIVATED");
  }

  if (!user || !user.password_hash || !(await bcrypt.compare(body.password, user.password_hash))) {
    throw new HttpError(401, "Invalid email/phone or password");
  }

  // Enforce the account type requested by the login screen.
  if (user.role !== body.expectedRole) {
    if (body.expectedRole === "admin") {
      throw new HttpError(403, "This account does not have Admin access. Please use Student Login.");
    }
    throw new HttpError(403, "This is an Admin account. Please use Admin Login.");
  }

  if (user.status !== "active") throw new HttpError(403, "This account is disabled. Please contact the academy.");

  if (user.role === "student") {
    const access = await enrollmentAccessState(user.id);
    if (access === "pending") throw new HttpError(403, "Your enrolment is awaiting payment confirmation. Please contact the academy.");
    if (access === "expired") throw new HttpError(403, "Your course access has expired. Please re-enrol.");
  }

  await createSession(user.id, user.role);
  return ok({ role: user.role, name: user.name });
});
