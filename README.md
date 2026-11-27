# KBC Saloon Academy — Frontend (Next.js 14 + Tailwind CSS)
UI only: dummy data in `src/data/mock.ts`; no backend, auth or DB yet (PostgreSQL planned).

    npm install && npm run dev   # http://localhost:3000

Routes: `/` `/courses` `/courses/[id]` `/login` `/student` `/watch/[id]` `/live` · admin: `/admin` `/admin/courses` `/admin/students` `/admin/live` `/admin/addons`
Structure: `src/app` (routes; `(site)` group has navbar/footer, `admin` has sidebar) · `src/components` (shared + `admin/` + `ui/`) · `src/data` (mock data).
Brand: ink `#121414`, gold `#EFE8A8` in `tailwind.config.ts`.
