# KBC Saloon Academy — Next.js 14 + Tailwind + PostgreSQL

## Setup
    cp .env.example .env.local        # set DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
    npm install
    npm run db:setup                  # applies sql/schema.sql, seeds 4 sample courses, creates the admin user
    npm run dev                       # http://localhost:3000  (admin: log in at /admin/login with ADMIN_EMAIL)

## How the PDF rules are enforced
- **Course timers**: `enrollments.expires_at = enrolled_at + duration_days`; checked server-side for every video request (`lib/access.ts`).
- **Multi-course students**: one account per student; each course has its own timer. Login is denied only when *every* course has expired.
- **Single device**: each login rotates `users.session_id`; older devices' cookies stop matching. Admin can reset it.
- **Sequential unlock**: the play/complete APIs refuse a video until all earlier ones are completed.
- **Protected playback**: Bunny Stream signed embed tokens (set `BUNNY_*` env), right-click disabled, moving watermark with email/phone. Browsers cannot fully block screen recording without DRM (Widevine/FairPlay).
- **Accounts**: enrolment creates a *pending* student account; the student verifies an OTP (mobile/email), creates their own password and the account becomes *active*. Same pipeline for self-enrolment and Admin → Students. See `docs/ENROLLMENT_AUTH_GUIDE.md`.

## Not done yet
Live Razorpay/SMS/email credentials (code is in place, see `.env.example`), live-class recording upload/attach UI (table `recordings` exists), Phase 2 add-on persistence, IP-based rate limiting, forgot-password, automated tests.


## Separate portal sign-in
- Students sign in at `/login`; this screen only accepts accounts with the `student` role.
- Administrators sign in at `/admin/login`; this screen only accepts accounts with the `admin` role.
- The Admin dashboard and its pages are protected by the `(protected)` route-group layout under `src/app/admin`.
- Admin API endpoints continue to enforce administrator authorization on the server with `requireUser(true)`.
