-- ==============================================================================
-- Ninja Burger Migration 02: Support Order Cancellation ('cancelled' status)
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'confirmed', 'on_delivery', 'finished', 'cancelled'));
