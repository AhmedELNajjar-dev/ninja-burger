-- ==============================================================================
-- Ninja Burger Security Migration 01: Database Hardening & Least-Privilege Grants
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Ensure required columns exist on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS saved_address jsonb;

-- 2. Backfill email for any existing users from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 3. Fix truncated trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Drop dangerous direct order insert policy (all order inserts MUST go through /api/orders)
DROP POLICY IF EXISTS "Anyone can insert an order" ON public.orders;

-- 5. Revoke dangerous blanket privileges from client-facing roles (anon and authenticated)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

-- 6. Ensure service_role retains full access for server-side API routes
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

-- 7. Grant minimal necessary table-level permissions to browser roles
-- Menu & categories: read-only for public/customers
GRANT SELECT ON public.categories, public.menu_items, public.addons TO anon, authenticated;

-- Menu writes for authenticated admins (enforced by existing RLS policies)
GRANT INSERT, UPDATE, DELETE ON public.categories, public.menu_items, public.addons TO authenticated;

-- Orders: authenticated users can SELECT their own orders (enforced by RLS)
GRANT SELECT ON public.orders TO authenticated;
-- Authenticated users (admin) can update status only (enforced by RLS)
GRANT UPDATE (status) ON public.orders TO authenticated;

-- Profiles: Authenticated users can read their own profile (strictly governed by RLS: auth.uid() = id).
-- UPDATE is strictly restricted to full_name only (preventing privilege escalation to 'role' = 'admin').
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name) ON public.profiles TO authenticated;
