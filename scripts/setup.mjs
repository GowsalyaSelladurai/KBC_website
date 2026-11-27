import pg from "pg";
import bcrypt from "bcryptjs";
import fs from "node:fs";
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
await c.query(fs.readFileSync("sql/schema.sql", "utf8"));
const {
  rows: [{ n }],
} = await c.query("select count(*)::int n from courses");
if (!n) {
  const seed = [
    [
      "Professional Makeup",
      "💄",
      7,
      14999,
      [
        "Skin prep & tools",
        "Base & contouring",
        "Eye makeup",
        "Bridal look",
        "HD & airbrush",
        "Final styling & assessment",
      ],
    ],
    [
      "Hair Styling",
      "💇‍♀️",
      2,
      3999,
      ["Hair types & prep", "Blow-dry & curls", "Party updos"],
    ],
    ["Nail Art", "💅", 1, 1999, ["Nail shaping & care", "Gel art designs"]],
    ["Saree Pleating", "🥻", 1, 999, ["Draping basics", "Pleating & pinning"]],
  ];
  for (const [name, icon, d, price, vids] of seed) {
    const {
      rows: [r],
    } = await c.query(
      "insert into courses(name,icon,duration_days,price) values($1,$2,$3,$4) returning id",
      [name, icon, d, price],
    );
    for (const [i, t] of vids.entries())
      await c.query(
        "insert into videos(course_id,title,position) values($1,$2,$3)",
        [r.id, t, i + 1],
      );
  }
}
const { ADMIN_EMAIL: e, ADMIN_PASSWORD: p } = process.env;
if (e && p)
  await c.query(
    "insert into users(name,email,password_hash,role) values('Admin',$1,$2,'admin') on conflict (lower(email)) do update set password_hash=excluded.password_hash,role='admin'",
    [e, await bcrypt.hash(p, 10)],
  );
console.log("Database ready");
await c.end();
