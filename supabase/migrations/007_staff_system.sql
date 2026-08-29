-- ============================================================
-- LORD REIGNETH FOODS
-- MIGRATION 007: STAFF SYSTEM
-- ============================================================

-- ============================================================
-- 1. EXTEND PROFILES
-- ============================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS location_id UUID
REFERENCES public.locations(id)
ON DELETE SET NULL;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN
NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS profiles_location_idx
ON public.profiles(location_id);

CREATE INDEX IF NOT EXISTS profiles_role_idx
ON public.profiles(role);


-- ============================================================
-- 2. LOCATION MENU ITEMS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.location_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    location_id UUID NOT NULL
        REFERENCES public.locations(id)
        ON DELETE CASCADE,

    menu_item_id UUID NOT NULL
        REFERENCES public.menu_items(id)
        ON DELETE CASCADE,

    is_available BOOLEAN NOT NULL DEFAULT TRUE,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_by UUID
        REFERENCES public.profiles(id)
        ON DELETE SET NULL,

    CONSTRAINT location_menu_items_unique
        UNIQUE (location_id, menu_item_id)
);


CREATE INDEX IF NOT EXISTS location_menu_items_location_idx
ON public.location_menu_items(location_id);

CREATE INDEX IF NOT EXISTS location_menu_items_menu_item_idx
ON public.location_menu_items(menu_item_id);


-- ============================================================
-- 3. UPDATED_AT TRIGGER
-- ============================================================

DROP TRIGGER IF EXISTS
trg_location_menu_items_updated_at
ON public.location_menu_items;

CREATE TRIGGER
trg_location_menu_items_updated_at
BEFORE UPDATE ON public.location_menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();


-- ============================================================
-- 4. STAFF LOCATION HELPER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_staff_location_id(
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_location_id UUID;
BEGIN

    SELECT location_id
    INTO v_location_id
    FROM public.profiles
    WHERE id = p_user_id;

    RETURN v_location_id;

END;
$$;


-- ============================================================
-- 5. CURRENT USER LOCATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.my_location_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.get_staff_location_id(auth.uid());
$$;


-- ============================================================
-- 6. ADMIN CHECK
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        public.auth_user_role() = 'admin',
        FALSE
    );
$$;


-- ============================================================
-- 7. STAFF CHECK
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        public.auth_user_role() IN ('staff', 'admin'),
        FALSE
    );
$$;


-- ============================================================
-- 8. OUTLET ACCESS CHECK
-- ============================================================

CREATE OR REPLACE FUNCTION public.can_access_location(
    p_location_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        public.is_admin()
        OR (
            public.auth_user_role() = 'staff'
            AND public.my_location_id() IS NOT NULL
            AND p_location_id = public.my_location_id()
        );
$$;


-- ============================================================
-- 9. ENABLE RLS ON LOCATION MENU ITEMS
-- ============================================================

ALTER TABLE public.location_menu_items
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 10. LOCATION MENU SELECT
-- ============================================================

DROP POLICY IF EXISTS
"loc_menu_public_read"
ON public.location_menu_items;

CREATE POLICY
"loc_menu_public_read"
ON public.location_menu_items
FOR SELECT
USING (TRUE);


-- ============================================================
-- 11. LOCATION MENU INSERT
-- ============================================================

DROP POLICY IF EXISTS
"loc_menu_staff_insert"
ON public.location_menu_items;

CREATE POLICY
"loc_menu_staff_insert"
ON public.location_menu_items
FOR INSERT
WITH CHECK (
    public.can_access_location(location_id)
);


-- ============================================================
-- 12. LOCATION MENU UPDATE
-- ============================================================

DROP POLICY IF EXISTS
"loc_menu_staff_update"
ON public.location_menu_items;

CREATE POLICY
"loc_menu_staff_update"
ON public.location_menu_items
FOR UPDATE
USING (
    public.can_access_location(location_id)
)
WITH CHECK (
    public.can_access_location(location_id)
);


-- ============================================================
-- 13. LOCATION MENU DELETE
-- ============================================================

DROP POLICY IF EXISTS
"loc_menu_admin_delete"
ON public.location_menu_items;

CREATE POLICY
"loc_menu_admin_delete"
ON public.location_menu_items
FOR DELETE
USING (
    public.is_admin()
);


-- ============================================================
-- 14. ORDER RLS
-- ============================================================

DROP POLICY IF EXISTS
"orders_admin_read_all"
ON public.orders;

DROP POLICY IF EXISTS
"orders_staff_read_own_outlet"
ON public.orders;

CREATE POLICY
"orders_admin_read_all"
ON public.orders
FOR SELECT
USING (
    public.is_admin()
);


CREATE POLICY
"orders_staff_read_own_outlet"
ON public.orders
FOR SELECT
USING (
    public.auth_user_role() = 'staff'
    AND public.can_access_location(location_id)
    AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.is_active = TRUE
    )
);


-- ============================================================
-- 15. ORDER UPDATE
-- ============================================================

DROP POLICY IF EXISTS
"orders_admin_staff_update"
ON public.orders;

CREATE POLICY
"orders_admin_staff_update"
ON public.orders
FOR UPDATE
USING (
    public.is_admin()
    OR (
        public.auth_user_role() = 'staff'
        AND public.can_access_location(location_id)
        AND EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.is_active = TRUE
        )
    )
)
WITH CHECK (
    public.is_admin()
    OR (
        public.auth_user_role() = 'staff'
        AND public.can_access_location(location_id)
        AND EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.is_active = TRUE
        )
    )
);


-- ============================================================
-- 16. ORDER ITEMS RLS
-- ============================================================

DROP POLICY IF EXISTS
"order_items_admin_read_all"
ON public.order_items;

DROP POLICY IF EXISTS
"order_items_staff_read_own_outlet"
ON public.order_items;


CREATE POLICY
"order_items_admin_read_all"
ON public.order_items
FOR SELECT
USING (
    public.is_admin()
);


CREATE POLICY
"order_items_staff_read_own_outlet"
ON public.order_items
FOR SELECT
USING (
    public.auth_user_role() = 'staff'
    AND EXISTS (
        SELECT 1
        FROM public.orders o
        INNER JOIN public.profiles p
            ON p.id = auth.uid()
        WHERE o.id = order_items.order_id
        AND public.can_access_location(o.location_id)
        AND p.is_active = TRUE
    )
);


-- ============================================================
-- 17. PREVENT STAFF FROM CHANGING THEIR ROLE/OUTLET
-- ============================================================

CREATE OR REPLACE FUNCTION public.prevent_staff_role_or_location_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_role user_role;
BEGIN

    SELECT role
    INTO v_caller_role
    FROM public.profiles
    WHERE id = auth.uid();


    IF NEW.role IS DISTINCT FROM OLD.role
       AND v_caller_role <> 'admin'
    THEN
        RAISE EXCEPTION
        'Only administrators can change user roles';
    END IF;


    IF NEW.location_id IS DISTINCT FROM OLD.location_id
       AND v_caller_role <> 'admin'
    THEN
        RAISE EXCEPTION
        'Only administrators can change outlet assignment';
    END IF;


    RETURN NEW;

END;
$$;


DROP TRIGGER IF EXISTS
trg_prevent_staff_role_or_location_change
ON public.profiles;


CREATE TRIGGER
trg_prevent_staff_role_or_location_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_staff_role_or_location_change();


-- ============================================================
-- 18. PROFILE RLS
-- ============================================================

DROP POLICY IF EXISTS
"profiles_admin_read_all"
ON public.profiles;

DROP POLICY IF EXISTS
"profiles_admin_update"
ON public.profiles;

DROP POLICY IF EXISTS
"profiles_admin_insert"
ON public.profiles;

DROP POLICY IF EXISTS
"profiles_staff_read_colleagues"
ON public.profiles;


CREATE POLICY
"profiles_admin_read_all"
ON public.profiles
FOR SELECT
USING (
    public.is_admin()
);


CREATE POLICY
"profiles_admin_update"
ON public.profiles
FOR UPDATE
USING (
    public.is_admin()
)
WITH CHECK (
    public.is_admin()
);


CREATE POLICY
"profiles_admin_insert"
ON public.profiles
FOR INSERT
WITH CHECK (
    public.is_admin()
);


CREATE POLICY
"profiles_staff_read_colleagues"
ON public.profiles
FOR SELECT
USING (
    public.auth_user_role() = 'staff'
    AND role = 'staff'
    AND location_id IS NOT NULL
    AND location_id = public.my_location_id()
);


-- ============================================================
-- 19. STAFF WHATSAPP ORDER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_staff_whatsapp_order(
    p_order_type order_type,
    p_payment_method payment_method,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_email TEXT,
    p_delivery_address TEXT,
    p_delivery_landmark TEXT,
    p_customer_notes TEXT,
    p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role user_role;
    v_location_id UUID;
    v_active BOOLEAN;
BEGIN

    SELECT
        role,
        location_id,
        is_active
    INTO
        v_role,
        v_location_id,
        v_active
    FROM public.profiles
    WHERE id = auth.uid();


    IF v_role <> 'staff' THEN
        RAISE EXCEPTION
        'Only staff members can use this function';
    END IF;


    IF v_active IS NOT TRUE THEN
        RAISE EXCEPTION
        'Your staff account is inactive';
    END IF;


    IF v_location_id IS NULL THEN
        RAISE EXCEPTION
        'Your staff account is not assigned to an outlet';
    END IF;


    RETURN public.create_order(
        auth.uid(),
        v_location_id,
        p_order_type,
        'whatsapp'::order_source,
        p_payment_method,
        p_customer_name,
        p_customer_phone,
        p_customer_email,
        p_delivery_address,
        p_delivery_landmark,
        p_customer_notes,
        p_items
    );

END;
$$;


-- ============================================================
-- 20. STAFF INVITATION SETTING
-- ============================================================

INSERT INTO public.site_settings
(
    key,
    value,
    description
)
VALUES
(
    'staff_invite_enabled',
    'false',
    'Enable when staff email invitation functionality has been configured.'
)
ON CONFLICT (key)
DO NOTHING;


-- ============================================================
-- 21. GRANT EXECUTION PERMISSIONS
-- ============================================================

GRANT EXECUTE
ON FUNCTION public.get_staff_location_id(UUID)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.my_location_id()
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.is_admin()
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.is_staff()
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.can_access_location(UUID)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.create_staff_whatsapp_order(
    order_type,
    payment_method,
    TEXT,
    TEXT,
    TEXT,
    TEXT,
    TEXT,
    TEXT,
    JSONB
)
TO authenticated;


-- ============================================================
-- MIGRATION 007 COMPLETE
-- ============================================================
