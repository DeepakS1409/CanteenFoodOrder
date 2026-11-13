-- =============================================================================
-- CampusBite – Authentication & Role-Based Access Control (RBAC) Migration
-- Target: Supabase PostgreSQL
-- =============================================================================

-- Ensure pgcrypto is enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. STUDENT PROFILES TABLE
-- Linked to auth.users. Role is strictly locked to 'student'.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    college_email TEXT NOT NULL UNIQUE,
    register_number TEXT NOT NULL UNIQUE,
    department TEXT DEFAULT 'Computer Science & Engg',
    year TEXT DEFAULT '3rd Year (Semester 5)',
    hostel_block TEXT DEFAULT 'Block B - Room 304',
    phone TEXT DEFAULT '+91 98765 43210',
    campus_card_balance NUMERIC(10, 2) DEFAULT 850.00 CHECK (campus_card_balance >= 0),
    loyalty_points INTEGER DEFAULT 340 CHECK (loyalty_points >= 0),
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    diet_preference TEXT DEFAULT 'Non-Vegetarian',
    role TEXT NOT NULL DEFAULT 'student' CHECK (role = 'student'),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_reg_no ON public.student_profiles(register_number);
CREATE INDEX IF NOT EXISTS idx_student_profiles_email ON public.student_profiles(college_email);

-- -----------------------------------------------------------------------------
-- 2. ORDERS & ORDER ITEMS TABLES (IF NOT ALREADY CREATED)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    token TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    department TEXT DEFAULT 'Computer Science',
    year TEXT DEFAULT '3rd Year',
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    pickup_slot TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Cooking', 'Ready for Pickup', 'Collected', 'Cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'Paid (UPI FastPay)',
    payment_method TEXT DEFAULT 'UPI FastPay Demo',
    prep_remaining_mins INTEGER DEFAULT 15,
    qr_code_value TEXT,
    notes TEXT DEFAULT '',
    cancel_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    food_id UUID REFERENCES public.food_catalog(id) ON DELETE SET NULL,
    food_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- -----------------------------------------------------------------------------
-- 3. AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- Guarantees public signup ALWAYS creates a student profile and cannot elevate role
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_full_name TEXT;
    v_reg_no TEXT;
    v_dept TEXT;
    v_year TEXT;
BEGIN
    -- Check if user is an admin in admin_profiles
    IF EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = NEW.id OR email = NEW.email) THEN
        RETURN NEW;
    END IF;

    -- Extract metadata supplied during registration
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    v_reg_no := COALESCE(NEW.raw_user_meta_data->>'register_number', 'CB-' || to_char(now(), 'YY') || '-' || substring(NEW.id::text from 1 for 5));
    v_dept := COALESCE(NEW.raw_user_meta_data->>'department', 'Computer Science & Engg');
    v_year := COALESCE(NEW.raw_user_meta_data->>'year', '1st Year (Semester 1)');

    -- Insert into student_profiles (role is hardcoded to 'student')
    INSERT INTO public.student_profiles (
        id,
        full_name,
        college_email,
        register_number,
        department,
        year,
        role
    ) VALUES (
        NEW.id,
        v_full_name,
        NEW.email,
        v_reg_no,
        v_dept,
        v_year,
        'student'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = timezone('utc'::text, now());

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Prevent transaction abort while logging error
    RAISE WARNING 'handle_new_user trigger error: %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 4. ROLE RESOLUTION RPC: public.get_current_user_role()
-- Returns role and profile info securely for the calling authenticated session
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    v_uid UUID := auth.uid();
    v_admin RECORD;
    v_student RECORD;
BEGIN
    IF v_uid IS NULL THEN
        RETURN jsonb_build_object('authenticated', false, 'role', 'anonymous');
    END IF;

    -- Check Admin Profiles first
    SELECT id, email, name, role INTO v_admin
    FROM public.admin_profiles
    WHERE id = v_uid;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'authenticated', true,
            'role', 'admin',
            'admin_role', v_admin.role,
            'profile', jsonb_build_object(
                'id', v_admin.id,
                'name', v_admin.name,
                'email', v_admin.email,
                'role', 'admin',
                'badgeTitle', 'Canteen Operations Staff'
            )
        );
    END IF;

    -- Check Student Profiles
    SELECT id, full_name, college_email, register_number, department, year,
           hostel_block, phone, campus_card_balance, loyalty_points, avatar_url, diet_preference, role
    INTO v_student
    FROM public.student_profiles
    WHERE id = v_uid;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'authenticated', true,
            'role', 'student',
            'profile', jsonb_build_object(
                'id', v_student.id,
                'name', v_student.full_name,
                'email', v_student.college_email,
                'collegeId', v_student.register_number,
                'department', v_student.department,
                'year', v_student.year,
                'hostelBlock', v_student.hostel_block,
                'phone', v_student.phone,
                'campusCardBalance', v_student.campus_card_balance,
                'loyaltyPoints', v_student.loyalty_points,
                'avatar', v_student.avatar_url,
                'dietPreference', v_student.diet_preference,
                'role', 'student'
            )
        );
    END IF;

    RETURN jsonb_build_object(
        'authenticated', true,
        'role', 'student',
        'profile', jsonb_build_object('id', v_uid, 'role', 'student')
    );
END;
$$;

-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- A. Student Profiles RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view own profile or admin can view all" ON public.student_profiles;
CREATE POLICY "Students can view own profile or admin can view all"
    ON public.student_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Students can update own profile fields" ON public.student_profiles;
CREATE POLICY "Students can update own profile fields"
    ON public.student_profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() AND
        role = 'student' AND
        register_number = (SELECT register_number FROM public.student_profiles WHERE id = auth.uid()) AND
        college_email = (SELECT college_email FROM public.student_profiles WHERE id = auth.uid())
    );

-- B. Admin Profiles RLS
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view own record or other admins" ON public.admin_profiles;
CREATE POLICY "Admins can view own record or other admins"
    ON public.admin_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.is_admin());

-- C. Orders RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own orders or admins view all" ON public.orders;
CREATE POLICY "Students view own orders or admins view all"
    ON public.orders
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Students create own orders" ON public.orders;
CREATE POLICY "Students create own orders"
    ON public.orders
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Students cancel own pending orders" ON public.orders;
CREATE POLICY "Students cancel own pending orders"
    ON public.orders
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() AND status = 'Pending')
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins full management on orders" ON public.orders;
CREATE POLICY "Admins full management on orders"
    ON public.orders
    FOR ALL
    TO authenticated
    USING (public.is_admin());

-- D. Order Items RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view items of permitted orders" ON public.order_items;
CREATE POLICY "Users can view items of permitted orders"
    ON public.order_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
CREATE POLICY "Users can insert order items"
    ON public.order_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 6. ENABLE REALTIME ON ORDERS & PROFILES
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.student_profiles;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;
