# Enrollment, Payment & Account Activation — Guide

## 1. Architecture

Two modules, one direction of dependency (`enrollment → auth`). Enrollment never touches the `users` table directly; it calls the Authentication module's public API (`src/modules/auth/index.ts`).

| Module | Folder | Responsibility |
|---|---|---|
| **Authentication** | `src/modules/auth/` | Account registration/lookup, OTP issue + verify, activation, password creation, activation delivery (SMS/email). Session/login lives in `src/lib/auth.ts` + `/api/auth/login`. |
| **Enrollment** | `src/modules/enrollment/` | Checkout, payment gateway adapter, payment verification, idempotent fulfilment, enrollment rows (one per student+course), staff enrollment, mark-paid, access-state check used by login. |

Shared pipeline (self-enrollment and Admin Portal both end in the same two calls):
`resolveStudentAccount()` (auth) → `upsertEnrollment()` (enrollment) → if account is `pending` → `sendActivationForUser()` (auth).

### Self-enrollment
`Enroll Now` → details → `POST /api/enroll/checkout` (price read from DB, payment row `created`) → Pay → `POST /api/enroll/confirm` (gateway verification → in ONE transaction: lock payment row, find-or-create account, upsert enrollment, mark payment paid) → OTP sent → success screen → `/activate` (OTP → create password → activated) → `/login` → `/student`.

### Admin enrollment
Admin → Students → `+ Enroll student` → `POST /api/admin/students` → same account resolution; payment is `Paid` (an offline payment row is recorded) or `Pending` (no access until **Mark paid**). New accounts get the OTP automatically; **Resend code** is available for accounts awaiting activation.

## 2. Files

**New**
- `src/modules/auth/{contact,schemas,accounts,otp,delivery,activation,index}.ts`
- `src/modules/enrollment/{schemas,payments,service,index}.ts`
- `src/app/(site)/activate/page.tsx`
- `src/app/api/enroll/{checkout,confirm,fail,webhook}/route.ts`
- `src/app/api/auth/activation/{request,verify,complete}/route.ts`
- `src/app/api/admin/students/[id]/resend-activation/route.ts`
- `src/app/api/admin/enrollments/[id]/mark-paid/route.ts`
- `docs/ENROLLMENT_AUTH_GUIDE.md`

**Modified**
- `sql/schema.sql` (original statements untouched; new section appended)
- `.env.example`, `README.md`
- `src/lib/{db,api,client,auth,access,queries}.ts`
- `src/app/api/auth/login/route.ts`, `src/app/api/admin/students/route.ts`, `src/app/api/admin/students/[id]/route.ts`
- `src/app/admin/login/page.tsx` (link removed), `src/app/(site)/login/page.tsx` (section removed + activation hooks)
- `src/components/EnrollButton.tsx`, `src/components/StudentTabs.tsx`, `src/components/admin/StudentManager.tsx`
- `src/app/admin/(protected)/students/page.tsx`, `src/app/(site)/watch/[id]/page.tsx`

**Deleted** (replaced by the modules): `src/lib/enroll.ts`, `src/lib/payment.ts`, `src/app/api/enroll/route.ts`

## 3. Database

`sql/schema.sql` is idempotent (`create … if not exists`, `add column if not exists`). Running it again never drops or rewrites data. Run: `npm run db:setup`.

To see what your database currently has:
```sql
select table_name from information_schema.tables where table_schema='public' order by 1;
select table_name,column_name,data_type,is_nullable from information_schema.columns where table_schema='public' order by table_name,ordinal_position;
```

### Existing tables (all defined in the original schema.sql)
| Table | Columns | PK / FK | Used for |
|---|---|---|---|
| `users` | id serial, name text, email text, phone text, password_hash text, role text (`student`/`admin`), session_id text, created_at timestamptz | PK id; unique index `lower(email)` | Student + admin accounts. **Reused** as the student account table |
| `courses` | id serial, name text, icon text, duration_days int, price numeric(10,2), active bool, created_at timestamptz | PK id | Course catalogue; price + duration are read from here at checkout |
| `videos` | id serial, course_id int, title text, position int, bunny_video_id text, duration_min int, created_at timestamptz | PK id; FK course_id→courses (cascade) | Course content |
| `enrollments` | id serial, user_id int, course_id int, source text, payment_status text, payment_ref text, enrolled_at timestamptz, expires_at timestamptz | PK id; FK user_id→users (cascade), course_id→courses (cascade); **unique(user_id,course_id)** | One row per student per course = multiple course enrollments. **Reused** |
| `video_progress` | user_id int, video_id int, completed bool, completed_at timestamptz | FKs user_id→users, video_id→videos (cascade) | Watch progress |
| `live_classes` | id serial, title text, starts_at timestamptz, frequency text, meeting_url text, course_id int | PK id; FK course_id→courses | Live classes |
| `recordings` | id serial, live_class_id int, title text, video_url text, course_id int, created_at timestamptz | PK id; FKs live_class_id→live_classes (set null), course_id→courses | Recordings |

### Changes to existing tables
| Table | Change | Why |
|---|---|---|
| `users` | `password_hash` now **nullable** | A new account has no password until activation |
| `users` | `+ status text` (`pending`/`active`/`disabled`), default `active` | Existing users stay active; new enrolment accounts start `pending` |
| `users` | `+ phone_verified_at, email_verified_at, activated_at timestamptz` | Verification audit |
| `users` | `+ unique index users_phone_key` on last 10 digits of phone (skipped with a notice if your data already has duplicates) | One account per mobile number |
| `enrollments` | `+ payment_id int` FK→payments(id) `on delete set null` | Link enrollment to the payment |

### New tables
| Table | Columns (type) | PK / FK | Purpose |
|---|---|---|---|
| `payments` | id serial; user_id int; course_id int; payer_name, payer_email, payer_phone text; amount numeric(10,2); currency text; provider text(`mock`/`razorpay`/`offline`); provider_order_id, provider_payment_id text; status text(`created`/`paid`/`failed`); source text(`online`/`staff`); reference text; failure_reason text; account_created bool; created_at, paid_at, fulfilled_at timestamptz | PK id; FK user_id→users (set null), course_id→courses (set null); unique(provider,provider_payment_id) and unique(provider,provider_order_id) where not null; indexes on user_id, status | Every checkout attempt / staff payment. Payer details are stored because the account is only created *after* payment succeeds. `fulfilled_at` makes fulfilment idempotent |
| `otp_codes` | id serial; user_id int; purpose text(`activation`/`password_reset`); channel text(`sms`/`email`); destination text; code_hash text; expires_at timestamptz; attempts int; verified_at, used_at, created_at timestamptz | PK id; FK user_id→users (cascade); index (user_id,purpose,created_at desc) | Hashed (HMAC-SHA256) one-time codes: 10-min expiry, 5 attempts, 30 s resend cooldown, 5 sends/hour |

## 4. Run

```bash
cp .env.example .env.local        # set DATABASE_URL, JWT_SECRET (long random), ADMIN_*
npm install
npm run db:setup                  # applies sql/schema.sql (safe to re-run) + seeds admin/courses if empty
npm run dev                       # http://localhost:3000
```
Development defaults: `PAYMENT_MODE=mock` (test-mode payment, with a "Simulate a failed payment" button) and `OTP_*_PROVIDER=console` (**the OTP is printed in the terminal running `npm run dev`**). Use `npm run dev`, not `next start`, for mock payments (mock is blocked in production builds unless `ALLOW_MOCK_PAYMENTS=true`).

Going live: set `PAYMENT_MODE=razorpay` + `RAZORPAY_KEY_ID/SECRET`; add a Razorpay webhook to `https://<site>/api/enroll/webhook` (events `payment.captured`, `payment.failed`, secret = `RAZORPAY_WEBHOOK_SECRET`) so enrolments still complete if the student closes the tab after paying. Set `OTP_SMS_PROVIDER=twilio` (+ Twilio vars) and/or `OTP_EMAIL_PROVIDER=resend` (+ Resend vars). Indian SMS normally needs DLT-registered templates; to use another provider (e.g. MSG91), add one branch in `src/modules/auth/delivery.ts`.

## 5. How to test

Keep the terminal with `npm run dev` visible (OTPs appear there as `[OTP · sms · 9000000001] 123456 is your …`).

**A. New student, self-enrollment**
1. Open `/courses` → a course → **Enroll Now** → enter name, email, mobile → **Continue to payment**.
2. Click **Simulate a failed payment** → "Payment failed" screen; Admin → Students shows no new student. Click **Try again** → **Pay**.
3. See *Enrollment Successful! … Your account has been created … Please verify your mobile number …* → **Verify & Activate Account**.
4. Enter the OTP from the terminal → create a password (8+ chars, letter + number) → *Account Activated* → **Go to Login**.
5. Log in with mobile or email → Student Dashboard shows the course. (Before step 4 completes, login shows "not activated" with a link to `/activate`.)

**B. Existing student, another course**: enroll again with the same email/mobile in a different course → success screen says it was added to the existing account (no OTP, no new account) → log in → both courses are listed. Enrolling again in a course that is still active is refused.

**C. Admin enrollment**: log in at `/admin/login` → Students → **+ Enroll student**.
1. New mobile/email + *Paid* → account created, activation code sent (terminal); the student then follows A4–A5.
2. Same student, another course → added to the same account.
3. *Payment pending* → course shows "(payment pending)" and gives no access; click **Mark paid** to start the access timer.
4. Accounts awaiting activation show a tag and a **Resend code** button.

**D. Security checks to try**: 5 wrong OTPs lock the code; resend within 30 s is throttled; an OTP/setup token cannot be reused; two browser tabs pressing Pay on one order create one enrolment.

## 6. Known limits / follow-ups
- Razorpay, Twilio and Resend code paths are written but could not be exercised with live credentials here; test them in the gateway's test mode before launch.
- No IP-level rate limiting (add at the proxy / a middleware). Per-account OTP limits are in place.
- No forgot-password screen yet (`otp_codes.purpose='password_reset'` is reserved for it).
- Home/course page copy still mentions "get your course password"; it was left untouched as requested.
- Next.js 14.2.15 has a published security advisory — upgrade to the latest 14.2.x when convenient.
