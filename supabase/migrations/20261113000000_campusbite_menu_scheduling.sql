-- =============================================================================
-- CampusBite – Day-wise Menu Scheduling Migration
-- Target: Supabase PostgreSQL
-- Timezone: Asia/Kolkata
-- =============================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. FOOD CATALOG TABLE
-- Stores all campus dishes independently of their schedules.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.food_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE, -- Stable legacy/import identifier e.g. 'item-1', 'item-4'
    name TEXT NOT NULL,
    short_name TEXT,
    tagline TEXT,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2) CHECK (original_price >= 0),
    image_url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Special Items')),
    badge TEXT,
    prep_time TEXT DEFAULT '5-8 mins',
    calories TEXT DEFAULT '400 kcal',
    is_veg BOOLEAN DEFAULT true,
    is_special BOOLEAN DEFAULT false,
    available BOOLEAN DEFAULT true,
    stock INTEGER DEFAULT 30 CHECK (stock >= 0),
    ingredients TEXT[] DEFAULT '{}',
    theme_color TEXT DEFAULT '#F59E0B',
    model_type TEXT DEFAULT 'burger',
    is_active BOOLEAN DEFAULT true, -- Safe deletion: soft-delete preserves order history
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for category queries and active status
CREATE INDEX IF NOT EXISTS idx_food_catalog_category ON public.food_catalog(category);
CREATE INDEX IF NOT EXISTS idx_food_catalog_is_active ON public.food_catalog(is_active);

-- -----------------------------------------------------------------------------
-- 2. WEEKLY MENU SCHEDULE TABLE
-- Maps existing food IDs to weekdays (0 = Sunday ... 6 = Saturday).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weekly_menu_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID NOT NULL REFERENCES public.food_catalog(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Prevent duplicate food assignments for the same weekday:
    CONSTRAINT uq_weekly_schedule_food_day UNIQUE (food_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_weekly_schedule_day ON public.weekly_menu_schedule(day_of_week);

-- -----------------------------------------------------------------------------
-- 3. SPECIAL DATE MENU TABLES
-- Allows date-specific menu overrides that take priority over weekly schedules.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.special_date_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_date DATE NOT NULL UNIQUE,
    title TEXT NOT NULL,
    badge TEXT DEFAULT 'Fest Special',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_special_menus_date ON public.special_date_menus(menu_date);

CREATE TABLE IF NOT EXISTS public.special_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    special_menu_id UUID NOT NULL REFERENCES public.special_date_menus(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES public.food_catalog(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Prevent duplicate food assignments within the same special menu:
    CONSTRAINT uq_special_menu_food UNIQUE (special_menu_id, food_id)
);

CREATE INDEX IF NOT EXISTS idx_special_items_menu_id ON public.special_menu_items(special_menu_id);

-- -----------------------------------------------------------------------------
-- 4. ADMIN PROFILES & ROLE MANAGEMENT
-- Validates admin rights server-side via Supabase Auth without trusting frontend.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin', 'canteen_staff')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Helper function to check if current user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_profiles
        WHERE id = auth.uid()
          AND role IN ('admin', 'superadmin', 'canteen_staff')
    );
$$;

-- -----------------------------------------------------------------------------
-- 5. AUTOMATIC CURRENT-DAY MENU API: get_today_menu
-- Deterministically resolves the active menu based on Asia/Kolkata timezone.
-- Priority: Active Special Date Menu > Normal Weekly Schedule.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_today_menu(p_simulated_date TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_target_date DATE;
    v_dow INTEGER;
    v_day_name TEXT;
    v_special_menu RECORD;
    v_items JSONB := '[]'::jsonb;
    v_result JSONB;
BEGIN
    -- 1. Determine target date in Asia/Kolkata timezone (or parse simulated date)
    IF p_simulated_date IS NOT NULL AND p_simulated_date <> '' THEN
        BEGIN
            v_target_date := p_simulated_date::date;
        EXCEPTION WHEN OTHERS THEN
            v_target_date := (timezone('Asia/Kolkata', now()))::date;
        END;
    ELSE
        v_target_date := (timezone('Asia/Kolkata', now()))::date;
    END IF;

    -- 2. Extract day of week (0 = Sunday, 1 = Monday, ... 6 = Saturday)
    v_dow := EXTRACT(DOW FROM v_target_date)::integer;
    v_day_name := trim(to_char(v_target_date, 'Day'));

    -- 3. Check for an active Special Date Menu override
    SELECT * INTO v_special_menu
    FROM public.special_date_menus
    WHERE menu_date = v_target_date
      AND is_active = true
    LIMIT 1;

    -- 4. If active special date menu exists, it strictly overrides the weekly schedule
    -- (Even if it intentionally contains 0 items)
    IF FOUND THEN
        SELECT COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', f.id,
                    'code', f.code,
                    'name', f.name,
                    'short_name', f.short_name,
                    'tagline', f.tagline,
                    'description', f.description,
                    'price', f.price,
                    'original_price', f.original_price,
                    'image', f.image_url,
                    'category', f.category,
                    'badge', COALESCE(f.badge, v_special_menu.badge),
                    'prep_time', f.prep_time,
                    'calories', f.calories,
                    'is_veg', f.is_veg,
                    'is_special', true,
                    'available', (f.available AND smi.is_available),
                    'stock', f.stock,
                    'ingredients', f.ingredients,
                    'theme_color', f.theme_color,
                    'model_type', f.model_type
                )
                ORDER BY smi.sort_order, f.name
            ),
            '[]'::jsonb
        )
        INTO v_items
        FROM public.special_menu_items smi
        JOIN public.food_catalog f ON smi.food_id = f.id
        WHERE smi.special_menu_id = v_special_menu.id
          AND smi.is_available = true
          AND f.is_active = true;

        v_result := jsonb_build_object(
            'date', v_target_date::text,
            'day', v_day_name,
            'day_of_week', v_dow,
            'menu_type', 'special',
            'menu_title', v_special_menu.title,
            'badge', v_special_menu.badge,
            'notes', v_special_menu.notes,
            'items', v_items
        );

    ELSE
        -- 5. Otherwise, resolve dishes from the normal Weekly Menu Schedule
        SELECT COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', f.id,
                    'code', f.code,
                    'name', f.name,
                    'short_name', f.short_name,
                    'tagline', f.tagline,
                    'description', f.description,
                    'price', f.price,
                    'original_price', f.original_price,
                    'image', f.image_url,
                    'category', f.category,
                    'badge', f.badge,
                    'prep_time', f.prep_time,
                    'calories', f.calories,
                    'is_veg', f.is_veg,
                    'is_special', f.is_special,
                    'available', (f.available AND wms.is_available),
                    'stock', f.stock,
                    'ingredients', f.ingredients,
                    'theme_color', f.theme_color,
                    'model_type', f.model_type
                )
                ORDER BY wms.sort_order, f.name
            ),
            '[]'::jsonb
        )
        INTO v_items
        FROM public.weekly_menu_schedule wms
        JOIN public.food_catalog f ON wms.food_id = f.id
        WHERE wms.day_of_week = v_dow
          AND wms.is_available = true
          AND f.is_active = true;

        v_result := jsonb_build_object(
            'date', v_target_date::text,
            'day', v_day_name,
            'day_of_week', v_dow,
            'menu_type', 'weekly',
            'menu_title', v_day_name || ' Menu',
            'badge', NULL,
            'notes', NULL,
            'items', v_items
        );
    END IF;

    RETURN v_result;
END;
$$;

-- Grant execution to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_today_menu(TEXT) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict least-privilege security model protecting database integrity.
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.food_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_menu_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_date_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 6.1 FOOD CATALOG POLICIES
-- Students/Public can read active dishes
CREATE POLICY "Public read active food items"
    ON public.food_catalog
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Admins have full access to create/update/deactivate catalog
CREATE POLICY "Admins manage food catalog"
    ON public.food_catalog
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6.2 WEEKLY MENU SCHEDULE POLICIES
-- Students can read schedule
CREATE POLICY "Public read weekly schedule"
    ON public.weekly_menu_schedule
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Admins can insert/update/delete weekly schedules
CREATE POLICY "Admins manage weekly schedule"
    ON public.weekly_menu_schedule
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6.3 SPECIAL DATE MENUS POLICIES
-- Students can view active special menus
CREATE POLICY "Public read active special date menus"
    ON public.special_date_menus
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Admins have full control
CREATE POLICY "Admins manage special date menus"
    ON public.special_date_menus
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6.4 SPECIAL MENU ITEMS POLICIES
CREATE POLICY "Public read special menu items"
    ON public.special_menu_items
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admins manage special menu items"
    ON public.special_menu_items
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6.5 ADMIN PROFILES POLICIES
CREATE POLICY "Admins can view admin profiles"
    ON public.admin_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR public.is_admin());

-- -----------------------------------------------------------------------------
-- 7. ENABLE REALTIME
-- Enables instantaneous live updates on connected student devices when
-- the kitchen updates the menu.
-- -----------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_menu_schedule;
ALTER PUBLICATION supabase_realtime ADD TABLE public.special_date_menus;
ALTER PUBLICATION supabase_realtime ADD TABLE public.special_menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.food_catalog;
