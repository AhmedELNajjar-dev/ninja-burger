-- 03_admin_menu_and_orders.sql
-- Enables bilingual description, admin CRUD permissions, orders edit/delete, addons availability/price editing, and Supabase Storage bucket for menu images

-- 1. Add description_en to menu_items table
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS description_en text;

-- 2. Add is_available to addons table
ALTER TABLE public.addons ADD COLUMN IF NOT EXISTS is_available boolean NOT NULL DEFAULT true;

-- 3. Helper function to check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Menu items: Public read, Admin full CRUD
DROP POLICY IF EXISTS "Public can read menu" ON public.menu_items;
CREATE POLICY "Public can read menu" ON public.menu_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage menu" ON public.menu_items;
CREATE POLICY "Admin can manage menu" ON public.menu_items
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Addons: Public read, Admin full CRUD
DROP POLICY IF EXISTS "Public can read addons" ON public.addons;
CREATE POLICY "Public can read addons" ON public.addons
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage addons" ON public.addons;
CREATE POLICY "Admin can manage addons" ON public.addons
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. Orders: Admin can update and delete
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
CREATE POLICY "Admin can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete orders" ON public.orders;
CREATE POLICY "Admin can delete orders" ON public.orders
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- 7. Supabase Storage bucket for menu items
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-items', 'menu-items', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies: Public view, Admin upload/modify/delete
DROP POLICY IF EXISTS "Public can view menu images" ON storage.objects;
CREATE POLICY "Public can view menu images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-items');

DROP POLICY IF EXISTS "Admin can upload menu images" ON storage.objects;
CREATE POLICY "Admin can upload menu images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'menu-items' AND public.is_admin());

DROP POLICY IF EXISTS "Admin can update menu images" ON storage.objects;
CREATE POLICY "Admin can update menu images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'menu-items' AND public.is_admin());

DROP POLICY IF EXISTS "Admin can delete menu images" ON storage.objects;
CREATE POLICY "Admin can delete menu images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'menu-items' AND public.is_admin());

-- ── Enable Supabase Realtime broadcast for menu, addons, and categories ─────
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.addons;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;



-- ── Support Pickup Orders in orders table ──
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_type text NOT NULL DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup'));
