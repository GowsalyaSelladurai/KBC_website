create table if not exists users(id serial primary key,name text not null,email text not null,phone text,password_hash text not null,role text not null default 'student' check(role in('student','admin')),session_id text,created_at timestamptz not null default now());
create unique index if not exists users_email_key on users(lower(email));
create table if not exists courses(id serial primary key,name text not null,icon text not null default '✨',duration_days int not null check(duration_days>0),price numeric(10,2) not null default 0 check(price>=0),active boolean not null default true,created_at timestamptz not null default now());
create table if not exists videos(id serial primary key,course_id int not null references courses(id) on delete cascade,title text not null,position int not null default 1,bunny_video_id text,duration_min int,created_at timestamptz not null default now());
create index if not exists videos_course_idx on videos(course_id,position);
create table if not exists enrollments(id serial primary key,user_id int not null references users(id) on delete cascade,course_id int not null references courses(id) on delete cascade,source text not null default 'online' check(source in('online','staff')),payment_status text not null default 'paid' check(payment_status in('pending','paid','failed')),payment_ref text,enrolled_at timestamptz not null default now(),expires_at timestamptz not null,unique(user_id,course_id));
create table if not exists video_progress(user_id int not null references users(id) on delete cascade,video_id int not null references videos(id) on delete cascade,completed boolean not null default false,completed_at timestamptz,primary key(user_id,video_id));
create table if not exists live_classes(id serial primary key,title text not null,starts_at timestamptz not null,frequency text not null default 'Weekly',meeting_url text,course_id int references courses(id) on delete set null);
create table if not exists recordings(id serial primary key,live_class_id int references live_classes(id) on delete set null,title text not null,video_url text,course_id int references courses(id) on delete set null,created_at timestamptz not null default now());

-- =====================================================================================
-- Enrollment / authentication update. Everything below is idempotent and non-destructive:
-- it only adds columns/tables/indexes and loosens one NOT NULL. Existing rows are kept.
-- =====================================================================================

-- users: accounts created by enrolment have no password until the student activates them.
alter table users alter column password_hash drop not null;
-- Existing accounts get 'active' (they already have working passwords). New accounts are inserted as 'pending'.
alter table users add column if not exists status text not null default 'active' check(status in('pending','active','disabled'));
alter table users add column if not exists phone_verified_at timestamptz;
alter table users add column if not exists email_verified_at timestamptz;
alter table users add column if not exists activated_at timestamptz;

-- One account per mobile number (compared on the last 10 digits so "+91 98765 43210" == "9876543210").
-- Skipped with a notice (instead of failing) if your existing data already contains duplicate numbers.
do $$
begin
  if exists (select 1 from users where phone is not null and phone<>'' group by right(regexp_replace(phone,'\D','','g'),10) having count(*)>1) then
    raise notice 'users_phone_key NOT created: duplicate phone numbers exist in users. Clean them up and re-run.';
  else
    create unique index if not exists users_phone_key on users((right(regexp_replace(phone,'\D','','g'),10))) where phone is not null and phone<>'';
  end if;
end $$;

-- payments: one row per checkout attempt (online) or staff-recorded payment (offline).
create table if not exists payments(
  id serial primary key,
  user_id int references users(id) on delete set null,
  course_id int references courses(id) on delete set null,
  payer_name text not null,
  payer_email text not null,
  payer_phone text not null,
  amount numeric(10,2) not null check(amount>=0),
  currency text not null default 'INR',
  provider text not null check(provider in('mock','razorpay','offline')),
  provider_order_id text,
  provider_payment_id text,
  status text not null default 'created' check(status in('created','paid','failed')),
  source text not null default 'online' check(source in('online','staff')),
  reference text,
  failure_reason text,
  account_created boolean not null default false,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  fulfilled_at timestamptz
);
create unique index if not exists payments_provider_payment_key on payments(provider,provider_payment_id) where provider_payment_id is not null;
create unique index if not exists payments_provider_order_key on payments(provider,provider_order_id) where provider_order_id is not null;
create index if not exists payments_user_idx on payments(user_id);
create index if not exists payments_status_idx on payments(status);

-- enrollments: link each enrolment to the payment that created it (existing unique(user_id,course_id) is reused).
alter table enrollments add column if not exists payment_id int references payments(id) on delete set null;

-- otp_codes: hashed one-time codes for account activation (purpose 'password_reset' is reserved for later).
create table if not exists otp_codes(
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  purpose text not null default 'activation' check(purpose in('activation','password_reset')),
  channel text not null check(channel in('sms','email')),
  destination text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  verified_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists otp_codes_lookup_idx on otp_codes(user_id,purpose,created_at desc);
