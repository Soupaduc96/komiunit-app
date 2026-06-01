# KomiUnit — Database Status

_Last updated: 2026-06-01_

## Connection

| Item | Status | Notes |
|---|---|---|
| Supabase client | ✅ Safe init | Falls back gracefully if `.env.local` is missing; logs a DEV warning |
| Credentials | ⚠ Pending | Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` |
| Schema file | ✅ Complete | `supabase-schema.sql` — apply via Supabase Dashboard → SQL Editor |

---

## Schema: Tables

| Table | Module | Columns | Indexes | RLS SELECT | RLS INSERT | RLS UPDATE | RLS DELETE |
|---|---|---|---|---|---|---|---|
| `users` | Core | id, email, full_name, avatar_url, phone | — | ✅ own | ✅ own | ✅ own | — |
| `komi_sends` | KomiSend | id, sender_id, recipient_id, amount, status, description | sender, recipient, status | ✅ own | ✅ own | ✅ own | — |
| `solution_categories` | KomiSol | id, name, description, icon | — | ✅ public | — | — | — |
| `solutions` | KomiSol | id, title, description, category, status, author_id, author_name, views, likes | category, status | ✅ published | — | ✅ author | — |
| `user_tickets` | KomiSol | id, user_id, title, description, status, priority | user, status | ✅ own | ✅ own | ✅ own | ✅ own |
| `product_categories` | KomiMarché | id, name, description, icon | — | ✅ public | — | — | — |
| `products` | KomiMarché | id, name, description, price, discount_price, image_url, category, stock, rating, reviews | category, stock | ✅ public | — | — | — |
| `cart_items` | KomiMarché | id, user_id, product_id, quantity, added_at | user, product | ✅ own | ✅ own | ✅ own | ✅ own |
| `orders` | KomiMarché | id, user_id, total_amount, status, shipping_address | user, status | ✅ own | ✅ own | ✅ own | — |
| `order_items` | KomiMarché | id, order_id, product_id, quantity, price | order | ✅ via order | ✅ via order | — | — |
| `course_categories` | KomiLearn | id, name, description, icon | — | ✅ public | — | — | — |
| `courses` | KomiLearn | id, title, description, instructor_id, instructor_name, cover_image_url, price, duration, level, rating, enrollments | level | ✅ public | — | — | — |
| `lessons` | KomiLearn | id, course_id, title, description, content, video_url, duration, **lesson_order** | course, order | ✅ public | — | — | — |
| `user_progress` | KomiLearn | id, user_id, course_id, completed_lessons (UUID[]), progress_percentage, certificate_earned, started_at, completed_at | user, course | ✅ own | ✅ own | ✅ own | — |
| `contacts` | KomiVoix | id, user_id, contact_user_id, contact_name, contact_phone, contact_avatar | user, contact_user | ✅ own | ✅ own | ✅ own | ✅ own |
| `call_logs` | KomiVoix | id, caller_id, recipient_id, duration, status, started_at, ended_at | caller, recipient, started_at | ✅ own | ✅ own | — | — |
| `voice_messages` | KomiVoix | id, sender_id, recipient_id, duration, audio_url, transcription, is_read, sent_at, read_at | sender, recipient, is_read | ✅ own | ✅ own | ✅ recipient | — |

---

## Helper Functions (RPC)

| Function | Purpose |
|---|---|
| `increment_solution_views(solution_id)` | Atomically increments `solutions.views` |
| `increment_course_enrollments(course_id)` | Atomically increments `courses.enrollments` |

---

## Schema Notes

- `lessons.lesson_order` — **not** `order` (reserved SQL word). Services query by `lesson_order` explicitly.
- `solutions.author_name` — stores display name string (e.g. "KomiUnit Team") alongside optional `author_id` UUID FK.
- `cart_items` has a `UNIQUE(user_id, product_id)` constraint — adding the same product increments quantity instead of creating a duplicate row.
- `user_progress` has a `UNIQUE(user_id, course_id)` constraint — `enrollCourse` checks for existing progress before inserting.
- `contacts` has a `UNIQUE(user_id, contact_user_id)` constraint — duplicate contact creation is prevented at the DB level.
- All `TIMESTAMPTZ` columns are automatically updated via `update_updated_at_column()` trigger.

---

## Column Mapping (snake_case DB → camelCase App)

All mappings are handled by `src/services/supabase/mappers.ts`. No raw Supabase rows are ever cast directly to TypeScript types.

---

## How to Apply the Schema

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Paste the contents of `supabase-schema.sql`
3. Click **Run**
4. Seed demo data: `npm run seed`
