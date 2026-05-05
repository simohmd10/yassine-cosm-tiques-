-- ============================================================
-- iherbyassine — Complete Supabase Setup v1
-- Fitness & Health Supplements Store
-- Features: Bilingual (FR/EN), MAD currency, Reviews, Coupons,
--           Wishlist (localStorage), User auth, Idempotency,
--           Access token order lookup, Audit log
-- ============================================================

-- ============================================================
-- 1. PRODUCTS (bilingual: name + name_fr)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id            uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text    NOT NULL,
  name_fr       text    NOT NULL DEFAULT '',
  description   text,
  description_fr text,
  price         numeric NOT NULL CHECK (price > 0),
  original_price numeric,
  category      text    NOT NULL,
  image         text,
  rating        numeric DEFAULT 4.5,
  reviews       integer DEFAULT 0,
  badge         text,
  badge_fr      text,
  is_featured   boolean DEFAULT false,
  is_best_seller boolean DEFAULT false,
  stock         integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  flavors       text[],
  weight        text,
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chk_products_price_positive') THEN ALTER TABLE products ADD CONSTRAINT chk_products_price_positive CHECK (price > 0); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chk_products_stock_non_neg') THEN ALTER TABLE products ADD CONSTRAINT chk_products_stock_non_neg CHECK (stock >= 0); END IF; END $$;

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text NOT NULL,
  email      text,
  phone      text NOT NULL,
  address    text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  order_ref        text    UNIQUE,
  idempotency_key  uuid    UNIQUE,
  access_token     uuid    DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  customer_id      uuid    REFERENCES customers(id) ON DELETE SET NULL,
  customer_email   text,
  status           text    NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  total            numeric NOT NULL CHECK (total > 0),
  payment_method   text    NOT NULL DEFAULT 'cash_on_delivery',
  coupon_code      text,
  discount_amount  numeric DEFAULT 0,
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key uuid;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS access_token    uuid DEFAULT gen_random_uuid();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code     text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_orders_idempotency_key ON orders (idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_orders_access_token    ON orders (access_token)    WHERE access_token IS NOT NULL;

-- ============================================================
-- 5. ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id                uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id          uuid    REFERENCES orders(id)   ON DELETE CASCADE,
  product_id        uuid    REFERENCES products(id) ON DELETE SET NULL,
  product_name      text    NOT NULL,
  quantity          integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price             numeric NOT NULL CHECK (price > 0),
  price_at_purchase numeric
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id        uuid    REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_at_purchase numeric;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chk_oi_qty_pos')   THEN ALTER TABLE order_items ADD CONSTRAINT chk_oi_qty_pos   CHECK (quantity > 0);        END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chk_oi_price_pos') THEN ALTER TABLE order_items ADD CONSTRAINT chk_oi_price_pos CHECK (price > 0);           END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chk_oi_pap_pos')   THEN ALTER TABLE order_items ADD CONSTRAINT chk_oi_pap_pos   CHECK (price_at_purchase > 0); END IF; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_order_items_order_product ON order_items (order_id, product_id) WHERE product_id IS NOT NULL;

-- ============================================================
-- 6. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user'))
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id         uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid    REFERENCES products(id) ON DELETE CASCADE,
  user_id    uuid    REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name  text    NOT NULL DEFAULT 'Anonyme',
  rating     integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    text    NOT NULL,
  status     text    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Migration: add status column to existing deployments
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending','approved','rejected'));
-- Backfill existing reviews so they remain visible
UPDATE reviews SET status = 'approved' WHERE status = 'pending';

-- ============================================================
-- 8. COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id                uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  code              text    NOT NULL UNIQUE,
  discount_type     text    NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value    numeric NOT NULL CHECK (discount_value > 0),
  min_order_amount  numeric DEFAULT 0,
  max_uses          integer,
  used_count        integer DEFAULT 0,
  is_active         boolean DEFAULT true,
  expires_at        timestamptz,
  created_at        timestamptz DEFAULT now()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. STORE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS store_settings (
  key        text PRIMARY KEY,
  value      text,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id         bigserial   PRIMARY KEY,
  event      text        NOT NULL,
  order_id   uuid,
  order_ref  text,
  email      text,
  details    jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_ref       ON orders(order_ref);
CREATE INDEX IF NOT EXISTS idx_orders_created_at      ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email  ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_products_category      ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured      ON products(is_featured)    WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_bestseller    ON products(is_best_seller) WHERE is_best_seller = true;
CREATE INDEX IF NOT EXISTS idx_reviews_product        ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code           ON coupons(code);

-- ============================================================
-- 11-bis. ADMIN LOGIN THROTTLE TABLES (P0-3)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  key_hash     text PRIMARY KEY,
  ip_hash      text NOT NULL,
  email_hash   text NOT NULL,
  device_hash  text,
  attempts     integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  window_start timestamptz NOT NULL DEFAULT now(),
  locked_until timestamptz,
  updated_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS admin_login_ip_window (
  ip_hash       text PRIMARY KEY,
  attempts      integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  window_start  timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admin_login_ip_window ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_ip_hash ON admin_login_attempts(ip_hash);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_email_hash ON admin_login_attempts(email_hash);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_locked_until ON admin_login_attempts(locked_until);

-- ============================================================
-- 12. is_admin()
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;
REVOKE ALL    ON FUNCTION is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ============================================================
-- 13. _audit()
-- ============================================================
CREATE OR REPLACE FUNCTION _audit(p_event text, p_order_id uuid DEFAULT NULL, p_order_ref text DEFAULT NULL, p_email text DEFAULT NULL, p_details jsonb DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_log (event, order_id, order_ref, email, details) VALUES (p_event, p_order_id, p_order_ref, p_email, p_details);
EXCEPTION WHEN OTHERS THEN NULL;
END;$$;
REVOKE ALL ON FUNCTION _audit(text,uuid,text,text,jsonb) FROM PUBLIC;

-- ============================================================
-- 14. place_order() v1 — Production hardened
-- ============================================================
CREATE OR REPLACE FUNCTION place_order(
  p_order_id          uuid,
  p_order_ref         text,
  p_customer_name     text,
  p_email             text,
  p_phone             text,
  p_address           text,
  p_status            text    DEFAULT 'pending',
  p_total             numeric DEFAULT 0,
  p_payment_method    text    DEFAULT 'cash_on_delivery',
  p_items             jsonb   DEFAULT '[]',
  p_idempotency_key   uuid    DEFAULT NULL,
  p_coupon_code       text    DEFAULT NULL,
  p_discount_amount   numeric DEFAULT 0
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_idem_key       uuid    := COALESCE(p_idempotency_key, p_order_id);
  v_existing       public.orders%ROWTYPE;
  v_customer_id    uuid    := gen_random_uuid();
  v_access_token   uuid;
  v_verified_total numeric := 0;
  v_item           jsonb;
  v_product_id     uuid;
  v_quantity       integer;
  v_product_name   text;
  v_unit_price     numeric;
  v_stock          integer;
  v_rows           integer;
  v_seen           uuid[]  := '{}';
  v_count          integer := 0;
BEGIN
  -- Idempotency fast path
  SELECT * INTO v_existing FROM public.orders WHERE idempotency_key = v_idem_key LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object('verified_total',v_existing.total,'order_id',v_existing.id,'access_token',v_existing.access_token,'idempotent',true);
  END IF;

  -- Advisory lock
  PERFORM pg_advisory_xact_lock(hashtext(v_idem_key::text));

  -- Re-check after lock
  SELECT * INTO v_existing FROM public.orders WHERE idempotency_key = v_idem_key LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object('verified_total',v_existing.total,'order_id',v_existing.id,'access_token',v_existing.access_token,'idempotent',true);
  END IF;

  -- Validate
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'EMPTY_CART: Order must contain at least one item';
  END IF;
  IF jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'TOO_MANY_ITEMS: Maximum 50 products per order';
  END IF;

  -- PASS 1: validate + lock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_count := v_count + 1;
    BEGIN v_product_id := (v_item->>'product_id')::uuid; EXCEPTION WHEN invalid_text_representation THEN RAISE EXCEPTION 'INVALID_PRODUCT_ID at item %', v_count; END;
    IF v_product_id IS NULL THEN RAISE EXCEPTION 'INVALID_ITEM: product_id required (item %)', v_count; END IF;
    BEGIN v_quantity := (v_item->>'quantity')::integer; EXCEPTION WHEN invalid_text_representation THEN RAISE EXCEPTION 'INVALID_QUANTITY at item %', v_count; END;
    IF v_quantity IS NULL OR v_quantity <= 0 THEN RAISE EXCEPTION 'INVALID_QUANTITY: must be > 0 (item %)', v_count; END IF;
    IF v_quantity > 999 THEN RAISE EXCEPTION 'INVALID_QUANTITY: max 999 (item %)', v_count; END IF;
    IF v_product_id = ANY(v_seen) THEN RAISE EXCEPTION 'DUPLICATE_PRODUCT: % appears twice', v_product_id; END IF;
    v_seen := array_append(v_seen, v_product_id);
    BEGIN
      SELECT name, price, stock INTO STRICT v_product_name, v_unit_price, v_stock FROM public.products WHERE id = v_product_id FOR UPDATE;
    EXCEPTION WHEN no_data_found THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND: % (item %)', v_product_id, v_count;
    END;
    IF v_unit_price IS NULL OR v_unit_price <= 0 THEN RAISE EXCEPTION 'INVALID_PRICE: product "%"', v_product_name; END IF;
    IF v_stock < v_quantity THEN
      RAISE EXCEPTION 'OUT_OF_STOCK: "%" — disponible: %, demandé: %', v_product_name, v_stock, v_quantity;
    END IF;
    v_verified_total := v_verified_total + (v_unit_price * v_quantity);
  END LOOP;

  -- Validate and apply coupon discount — MUST happen before INSERT
  -- SECURITY: discount only applied when a valid coupon code is provided and verified
  IF p_coupon_code IS NOT NULL AND p_discount_amount > 0 THEN
    PERFORM 1 FROM public.coupons
      WHERE code = upper(p_coupon_code)
        AND is_active = true
        AND (max_uses IS NULL OR used_count < max_uses)
      FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'COUPON_MAXED: Ce code promo a atteint sa limite d''utilisation';
    END IF;
    -- Discount capped at verified cart total — cannot go below zero
    v_verified_total := GREATEST(0, v_verified_total - COALESCE(p_discount_amount, 0));
    UPDATE public.coupons SET used_count = used_count + 1 WHERE code = upper(p_coupon_code);
  END IF;
  -- SECURITY: if no valid coupon_code, p_discount_amount is ignored entirely

  -- Insert
  INSERT INTO public.customers (id, name, email, phone, address) VALUES (v_customer_id, p_customer_name, p_email, p_phone, p_address);
  INSERT INTO public.orders (id, order_ref, idempotency_key, access_token, customer_id, customer_email, status, total, payment_method, coupon_code, discount_amount)
  -- SECURITY: status always hardcoded to 'pending' — never trust p_status from client
  VALUES (p_order_id, p_order_ref, v_idem_key, gen_random_uuid(), v_customer_id, lower(trim(p_email)), 'pending', v_verified_total, p_payment_method, p_coupon_code, COALESCE(p_discount_amount,0))
  RETURNING access_token INTO v_access_token;

  -- PASS 2: insert items + deduct stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity   := (v_item->>'quantity')::integer;
    SELECT name, price INTO v_product_name, v_unit_price FROM public.products WHERE id = v_product_id;
    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, price, price_at_purchase)
    VALUES (p_order_id, v_product_id, v_product_name, v_quantity, v_unit_price, v_unit_price);
    UPDATE public.products SET stock = stock - v_quantity WHERE id = v_product_id AND stock >= v_quantity;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows = 0 THEN RAISE EXCEPTION 'STOCK_RACE: "%" — please retry', v_product_name; END IF;
  END LOOP;

  PERFORM _audit('order_placed', p_order_id, p_order_ref, p_email,
    jsonb_build_object('verified_total',v_verified_total,'item_count',v_count,'coupon',p_coupon_code));

  RETURN jsonb_build_object('verified_total',v_verified_total,'order_id',p_order_id,'access_token',v_access_token,'idempotent',false);
END;$$;

REVOKE ALL    ON FUNCTION place_order(uuid,text,text,text,text,text,text,numeric,text,jsonb,uuid,text,numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION place_order(uuid,text,text,text,text,text,text,numeric,text,jsonb,uuid,text,numeric) TO anon;
GRANT EXECUTE ON FUNCTION place_order(uuid,text,text,text,text,text,text,numeric,text,jsonb,uuid,text,numeric) TO authenticated;

-- ============================================================
-- 15. lookup_order()
-- ============================================================
CREATE OR REPLACE FUNCTION lookup_order(p_order_ref text, p_access_token uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_order public.orders%ROWTYPE; v_items jsonb;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE order_ref = p_order_ref AND access_token = p_access_token LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT jsonb_agg(jsonb_build_object('name',oi.product_name,'quantity',oi.quantity,'price_at_purchase',COALESCE(oi.price_at_purchase,oi.price)))
  INTO v_items FROM public.order_items oi WHERE oi.order_id = v_order.id;
  RETURN jsonb_build_object('order_ref',v_order.order_ref,'status',v_order.status,'total',v_order.total,
    'payment_method',v_order.payment_method,'created_at',v_order.created_at,
    'discount_amount',COALESCE(v_order.discount_amount,0),'coupon_code',v_order.coupon_code,
    'items',COALESCE(v_items,'[]'::jsonb));
END;$$;

REVOKE ALL    ON FUNCTION lookup_order(text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION lookup_order(text,uuid) TO anon;
GRANT EXECUTE ON FUNCTION lookup_order(text,uuid) TO authenticated;

-- ============================================================
-- 16. handle_new_user()
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN INSERT INTO public.profiles (id,role) VALUES (NEW.id,'user') ON CONFLICT (id) DO NOTHING; RETURN NEW; END;$$;
REVOKE ALL ON FUNCTION handle_new_user() FROM PUBLIC;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 17. DROP ALL POLICIES
-- ============================================================
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT schemaname,tablename,policyname FROM pg_policies WHERE schemaname='public' AND tablename IN ('products','categories','customers','orders','order_items','profiles','store_settings','audit_log','reviews','coupons')) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- 18. RLS POLICIES
-- ============================================================
-- Products: public read, admin write
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "products_update" ON products FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "products_delete" ON products FOR DELETE USING (is_admin());
-- Categories: public read, admin write
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (is_admin());
-- Customers: SECURITY DEFINER only
CREATE POLICY "customers_insert" ON customers FOR INSERT WITH CHECK (false);
CREATE POLICY "customers_select" ON customers FOR SELECT USING (is_admin());
CREATE POLICY "customers_update" ON customers FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
-- Orders: SECURITY DEFINER only
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (false);
CREATE POLICY "orders_select" ON orders FOR SELECT USING (is_admin());
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
-- Order items: SECURITY DEFINER only
CREATE POLICY "order_items_insert" ON order_items FOR INSERT WITH CHECK (false);
CREATE POLICY "order_items_select" ON order_items FOR SELECT USING (is_admin());
-- Profiles
CREATE POLICY "profiles_select_own"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
-- Store settings
CREATE POLICY "settings_select" ON store_settings FOR SELECT USING (is_admin());
CREATE POLICY "settings_insert" ON store_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "settings_update" ON store_settings FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
-- Audit log: admin read only
CREATE POLICY "audit_log_select" ON audit_log FOR SELECT USING (is_admin());
-- Reviews: public read/write (can submit without auth), admin delete
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (status = 'approved' OR is_admin());
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (status = 'pending');
CREATE POLICY "reviews_update" ON reviews FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "reviews_delete" ON reviews FOR DELETE USING (is_admin());
-- Coupons: admin full, anon can validate via SELECT
CREATE POLICY "coupons_select" ON coupons FOR SELECT USING (true);
CREATE POLICY "coupons_insert" ON coupons FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "coupons_update" ON coupons FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "coupons_delete" ON coupons FOR DELETE USING (is_admin());

-- ============================================================
-- 19. STORAGE — product-images bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images','product-images',true,5242880,ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
CREATE POLICY "product_images_select" ON storage.objects FOR SELECT USING (bucket_id='product-images');
CREATE POLICY "product_images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id='product-images' AND is_admin());
CREATE POLICY "product_images_update" ON storage.objects FOR UPDATE USING (bucket_id='product-images' AND is_admin());
CREATE POLICY "product_images_delete" ON storage.objects FOR DELETE USING (bucket_id='product-images' AND is_admin());

-- ============================================================
-- 20. SAMPLE COUPONS (remove in production)
-- ============================================================
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, is_active)
VALUES
  ('WELCOME10', 'percentage', 10, 100, true),
  ('IHERB50',   'fixed',      50, 200, true),
  ('FITNESS20', 'percentage', 20, 300, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 21. GRANT ADMIN — uncomment and replace email
-- ============================================================
-- UPDATE profiles SET role = 'admin'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
