-- KomiUnit Database Schema for Supabase
-- Apply via: Supabase Dashboard → SQL Editor → Run

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- AUTH & USERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  full_name   VARCHAR(255),
  avatar_url  TEXT,
  phone       VARCHAR(20),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- KOMI SEND — Money Transfer
-- ============================================================================

CREATE TABLE IF NOT EXISTS komi_sends (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount       DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  status       VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_komi_sends_sender    ON komi_sends(sender_id);
CREATE INDEX IF NOT EXISTS idx_komi_sends_recipient ON komi_sends(recipient_id);
CREATE INDEX IF NOT EXISTS idx_komi_sends_status    ON komi_sends(status);

-- ============================================================================
-- KOMI SOL — Solutions & Support
-- ============================================================================

CREATE TABLE IF NOT EXISTS solution_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solutions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  category    VARCHAR(255),
  status      VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  author_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(255) DEFAULT 'KomiUnit Team',
  views       INT DEFAULT 0,
  likes       INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solutions_category ON solutions(category);
CREATE INDEX IF NOT EXISTS idx_solutions_status   ON solutions(status);

CREATE TABLE IF NOT EXISTS user_tickets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  priority    VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_tickets_user   ON user_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tickets_status ON user_tickets(status);

-- ============================================================================
-- KOMI MARCHÉ — Marketplace
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(255) NOT NULL,
  description    TEXT,
  price          DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  discount_price DECIMAL(12, 2),
  image_url      TEXT,
  category       VARCHAR(255),
  stock          INT DEFAULT 0 CHECK (stock >= 0),
  rating         DECIMAL(3, 2) DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  reviews        INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock    ON products(stock);

CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user    ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount     DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
  status           VARCHAR(20) DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_address TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity   INT NOT NULL CHECK (quantity > 0),
  price      DECIMAL(12, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================================================
-- KOMI LEARN — Education
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  instructor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  instructor_name  VARCHAR(255),
  cover_image_url  TEXT,
  price            DECIMAL(10, 2) DEFAULT 0 CHECK (price >= 0),
  duration         INT DEFAULT 0,
  level            VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  rating           DECIMAL(3, 2) DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  enrollments      INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);

CREATE TABLE IF NOT EXISTS lessons (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  content      TEXT,
  video_url    TEXT,
  duration     INT DEFAULT 0,
  lesson_order INT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order  ON lessons(course_id, lesson_order);

CREATE TABLE IF NOT EXISTS user_progress (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id           UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_lessons   UUID[] DEFAULT ARRAY[]::UUID[],
  progress_percentage INT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  certificate_earned  BOOLEAN DEFAULT FALSE,
  started_at          TIMESTAMPTZ DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user   ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course ON user_progress(course_id);

-- ============================================================================
-- KOMI VOIX — Voice & Calls
-- ============================================================================

CREATE TABLE IF NOT EXISTS contacts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_name     VARCHAR(255) NOT NULL,
  contact_phone    VARCHAR(30),
  contact_avatar   TEXT,
  added_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, contact_user_id)
);

CREATE INDEX IF NOT EXISTS idx_contacts_user         ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_user ON contacts(contact_user_id);

CREATE TABLE IF NOT EXISTS call_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caller_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  duration     INT DEFAULT 0,
  status       VARCHAR(20) CHECK (status IN ('completed', 'missed', 'rejected')),
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  ended_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_call_logs_caller     ON call_logs(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_recipient  ON call_logs(recipient_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at);

CREATE TABLE IF NOT EXISTS voice_messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  duration     INT DEFAULT 0,
  audio_url    TEXT NOT NULL,
  transcription TEXT,
  is_read      BOOLEAN DEFAULT FALSE,
  sent_at      TIMESTAMPTZ DEFAULT NOW(),
  read_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_voice_messages_sender    ON voice_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_voice_messages_recipient ON voice_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_voice_messages_is_read   ON voice_messages(is_read);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER komi_sends_updated_at
  BEFORE UPDATE ON komi_sends FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER solutions_updated_at
  BEFORE UPDATE ON solutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER user_tickets_updated_at
  BEFORE UPDATE ON user_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER lessons_updated_at
  BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER user_progress_updated_at
  BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HANDLE NEW AUTH USER — auto-create public.users profile
-- ============================================================================
-- This trigger fires AFTER every INSERT on auth.users (i.e. every signUp).
-- It runs as SECURITY DEFINER so it always has permission to write to
-- public.users regardless of RLS.  The full_name is taken from
-- raw_user_meta_data, which is what we pass in supabase.auth.signUp options.data.
-- ON CONFLICT (id) DO UPDATE ensures idempotency if the app code also tries
-- to insert (e.g. when email confirmation is disabled and a session exists).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE
    SET
      email      = EXCLUDED.email,
      full_name  = COALESCE(EXCLUDED.full_name, public.users.full_name),
      updated_at = NOW()
    WHERE public.users.full_name IS NULL OR public.users.full_name = '';

  RETURN NEW;
END;
$$;

-- Drop and recreate so re-running the script is safe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- HELPER FUNCTIONS (called via supabase.rpc)
-- ============================================================================

-- Increment solution view counter atomically
CREATE OR REPLACE FUNCTION increment_solution_views(solution_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE solutions SET views = views + 1 WHERE id = solution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment course enrollment counter atomically
CREATE OR REPLACE FUNCTION increment_course_enrollments(course_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE courses SET enrollments = enrollments + 1 WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY — Enable
-- ============================================================================

ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE komi_sends     ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tickets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES — users
-- ============================================================================

CREATE POLICY "users_select_own"  ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own"  ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own"  ON users FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- RLS POLICIES — komi_sends
-- ============================================================================

CREATE POLICY "sends_select"  ON komi_sends FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "sends_insert"  ON komi_sends FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "sends_update"  ON komi_sends FOR UPDATE
  USING (auth.uid() = sender_id);

-- ============================================================================
-- RLS POLICIES — solutions (public read, admin write)
-- ============================================================================

CREATE POLICY "solutions_select"  ON solutions FOR SELECT USING (status = 'published');
CREATE POLICY "solutions_update_author" ON solutions FOR UPDATE
  USING (auth.uid() = author_id);

-- ============================================================================
-- RLS POLICIES — user_tickets
-- ============================================================================

CREATE POLICY "tickets_select"  ON user_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tickets_insert"  ON user_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets_update"  ON user_tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tickets_delete"  ON user_tickets FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES — products (public read)
-- ============================================================================

CREATE POLICY "products_select" ON products FOR SELECT USING (true);

-- ============================================================================
-- RLS POLICIES — cart_items
-- ============================================================================

CREATE POLICY "cart_select"  ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cart_insert"  ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_update"  ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cart_delete"  ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES — orders + order_items
-- ============================================================================

CREATE POLICY "orders_select"  ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert"  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update"  ON orders FOR UPDATE USING (auth.uid() = user_id);

-- order_items visible if user owns the parent order
CREATE POLICY "order_items_select" ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));
CREATE POLICY "order_items_insert" ON order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

-- ============================================================================
-- RLS POLICIES — courses + lessons (public read)
-- ============================================================================

CREATE POLICY "courses_select"  ON courses  FOR SELECT USING (true);
CREATE POLICY "lessons_select"  ON lessons  FOR SELECT USING (true);

-- ============================================================================
-- RLS POLICIES — user_progress
-- ============================================================================

CREATE POLICY "progress_select"  ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_insert"  ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_update"  ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES — contacts
-- ============================================================================

CREATE POLICY "contacts_select"  ON contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contacts_insert"  ON contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contacts_update"  ON contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "contacts_delete"  ON contacts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES — call_logs
-- ============================================================================

CREATE POLICY "call_logs_select"  ON call_logs FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = recipient_id);
CREATE POLICY "call_logs_insert"  ON call_logs FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

-- ============================================================================
-- RLS POLICIES — voice_messages
-- ============================================================================

CREATE POLICY "voice_messages_select"  ON voice_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "voice_messages_insert"  ON voice_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "voice_messages_update"  ON voice_messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- ============================================================================
-- SOLUTION_CATEGORIES + PRODUCT_CATEGORIES + COURSE_CATEGORIES (public read)
-- ============================================================================

ALTER TABLE solution_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sol_cat_select"     ON solution_categories FOR SELECT USING (true);
CREATE POLICY "prod_cat_select"    ON product_categories  FOR SELECT USING (true);
CREATE POLICY "course_cat_select"  ON course_categories   FOR SELECT USING (true);
