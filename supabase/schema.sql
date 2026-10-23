-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  cart jsonb NOT NULL DEFAULT '[]'::jsonb,
  saved_address jsonb,
  is_phone_verified boolean NOT NULL DEFAULT false,
  phone_verification_code text,
  created_at timestamptz DEFAULT now()
);

-- categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

-- menu_items table
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description_ar text,
  price_single numeric(10,2) NOT NULL,
  price_double numeric(10,2),
  price_triple numeric(10,2),
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- addons table
CREATE TABLE public.addons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  price numeric(10,2) NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

-- orders table (with auto-incrementing order_number)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number int NOT NULL DEFAULT nextval('order_number_seq'),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  notes text,
  items jsonb NOT NULL DEFAULT '[]',
  total_amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'on_delivery', 'finished')),
  discord_notified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX idx_profiles_phone ON public.profiles(phone);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can manage profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- categories: public read
CREATE POLICY "Public can read categories" ON public.categories
  FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- menu_items: public read, admin write
CREATE POLICY "Public can read menu" ON public.menu_items
  FOR SELECT USING (is_available = true);
CREATE POLICY "Admin can manage menu" ON public.menu_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- addons: public read
CREATE POLICY "Public can read addons" ON public.addons
  FOR SELECT USING (true);
CREATE POLICY "Admin can manage addons" ON public.addons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- orders: customers see their own, admins see all
CREATE POLICY "Users can see own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
-- Note: Order creation is strictly performed through /api/orders via service_role to ensure price validation.
CREATE POLICY "Admin can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admin can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Service role full access" ON public.orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Profile is inserted via the register API route with full_name + phone
  -- This trigger is a safety net for OAuth users
  INSERT INTO public.profiles (id, full_name, phone, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email,
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- ─── Permissions & Least-Privilege Grants ───────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- service_role keeps full access (used by server API routes)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

-- Remove blanket grants from client/browser roles
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

-- Public menu: read-only for visitors and customers
GRANT SELECT ON public.categories, public.menu_items, public.addons TO anon, authenticated;
-- Admin writes on menu are limited to admins by existing RLS policies
GRANT INSERT, UPDATE, DELETE ON public.categories, public.menu_items, public.addons TO authenticated;

-- Orders: customers read their own via RLS, admins update status via RLS
GRANT SELECT ON public.orders TO authenticated;
GRANT UPDATE (status) ON public.orders TO authenticated;

-- Profiles: Authenticated users can read their own profile (strictly governed by RLS: auth.uid() = id)
-- UPDATE is strictly restricted to full_name only (preventing privilege escalation to 'role' = 'admin')
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name) ON public.profiles TO authenticated;
