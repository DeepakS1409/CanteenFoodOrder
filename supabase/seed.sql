-- =============================================================================
-- CampusBite – Day-wise Scheduled Menu Seed Data
-- =============================================================================

-- 1. SEED FOOD CATALOG (14 Dishes)
INSERT INTO public.food_catalog (
    code, name, short_name, tagline, description, price, original_price,
    image_url, category, badge, prep_time, calories, is_veg, is_special,
    available, stock, ingredients, theme_color, model_type, is_active
) VALUES
(
    'item-1',
    'The Quad Smash Burger',
    'Classic Burger',
    'Double Patty • Melted Smoked Cheddar • Brioche Bun',
    'Flame-grilled double smashed beef & chicken blend patties stacked with double melted cheddar, caramelized onions, crisp iceberg lettuce, and secret house sauce in a toasted butter brioche bun.',
    180.00, 220.00,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    'Snacks', 'Bestseller #1', '8-12 mins', '580 kcal', false, true, true, 28,
    ARRAY['Brioche Bun', 'Double Patty', 'Cheddar Cheese', 'Secret Sauce', 'Crispy Onions', 'Pickles'],
    '#F59E0B', 'burger', true
),
(
    'item-2',
    'Schezwan Fire Fried Rice',
    'Veg Fried Rice',
    'Wok-Tossed Basmati • Crunchy Veggies • Spicy Chilli Crisp',
    'Aromatic long-grain basmati wok-tossed on high flame with farm-fresh bell peppers, spring onions, toasted garlic, and fiery Sichuan chili oil. Served with spicy garlic dip.',
    140.00, 170.00,
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80',
    'Lunch', 'Spicy Hit', '6-10 mins', '440 kcal', true, false, true, 35,
    ARRAY['Basmati Rice', 'Bell Peppers', 'Spring Onion', 'Schezwan Paste', 'Toasted Garlic', 'Sesame'],
    '#FF6B35', 'rice', true
),
(
    'item-3',
    'Crispy Peri-Peri Chicken Sub',
    'Chicken Sandwich',
    'Crispy Fried Fillet • Hot Peri-Peri Dust • Jalapeno Slaw',
    'Golden buttermilk-fried chicken breast dusted with zesty African bird''s eye peri-peri spice, layered with pickled jalapenos, creamy slaw, and melted pepper jack cheese on artisanal baguette.',
    160.00, 195.00,
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80',
    'Snacks', 'Campus Crush', '7-10 mins', '520 kcal', false, true, true, 19,
    ARRAY['Baguette Sub', 'Crispy Chicken', 'Peri-Peri Dust', 'Creamy Slaw', 'Pickled Jalapenos'],
    '#EF4444', 'sandwich', true
),
(
    'item-4',
    'Ghee Roast Masala Dosa',
    'Masala Dosa',
    'Golden Crisp Crepe • Spiced Potato Mash • Trio Chutneys',
    'Thin paper-crisp fermented rice-lentil crepe golden roasted in pure desi ghee, filled with mustard-tempered potato masala, served with piping hot drumstick sambar and fresh coconut-tomato chutneys.',
    90.00, 110.00,
    'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80',
    'Breakfast', 'Morning Classic', '5-8 mins', '380 kcal', true, false, true, 45,
    ARRAY['Crisp Dosa', 'Pure Desi Ghee', 'Spiced Aloo Masala', 'Coconut Chutney', 'Drumstick Sambar'],
    '#EAB308', 'dosa', true
),
(
    'item-5',
    'Golden Truffle Crispy Fries',
    'French Fries',
    'Double-Fried Russets • Truffle Oil • Smoked Paprika Mayo',
    'Thick hand-cut russet potatoes double-fried to blistered golden perfection, tossed in black truffle sea salt, fresh parsley flakes, and served with a ramekin of smoked garlic paprika mayo.',
    110.00, 130.00,
    'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=900&q=80',
    'Snacks', 'Crunch Addict', '4-6 mins', '340 kcal', true, false, true, 50,
    ARRAY['Russet Potatoes', 'Truffle Oil', 'Sea Salt', 'Smoked Paprika Mayo', 'Parsley'],
    '#F59E0B', 'fries', true
),
(
    'item-6',
    'Cold Brew Mango Mint Cooler',
    'Fresh Juice',
    'Alphonso Pulp • Crushed Mint • Sparkling Cold Brew',
    'Hand-squeezed sun-ripened Alphonso mango pulp infused with garden fresh bruised mint, lime zest, and cold brewed green tea poured over crushed crystal ice with sparkling tonic.',
    95.00, 120.00,
    'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80',
    'Beverages', 'Chilled Refresh', '3-5 mins', '160 kcal', true, true, true, 30,
    ARRAY['Alphonso Mango', 'Fresh Spearmint', 'Cold Brew Tea', 'Sparkling Tonic', 'Lime Wheel'],
    '#F97316', 'juice', true
),
(
    'item-7',
    'Oreo Monster Fudge Shake',
    'Thick Shake',
    'Belgian Chocolate • Double Stuf Oreos • Whipped Cream',
    'Ultra-thick hand-churned vanilla ice cream blended with dark Dutch cocoa, crumbled double stuf Oreos, drizzled with warm Belgian chocolate fudge and topped with vanilla bean whip.',
    135.00, 160.00,
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80',
    'Beverages', 'Sugar Rush', '5 mins', '490 kcal', true, false, true, 22,
    ARRAY['Oreos', 'Dutch Chocolate', 'Vanilla Ice Cream', 'Whipped Cream', 'Choco Fudge'],
    '#8B5CF6', 'shake', true
),
(
    'item-8',
    'Paneer Butter Masala Meal Box',
    'Paneer Combo',
    'Charred Cottage Cheese • Rich Cashew Makhani • Jeera Rice',
    'Clay-oven smoked soft malai paneer cubes simmered in a velvety slow-simmered tomato-cashew makhani gravy, served with aromatic ghee jeera rice and 2 hot butter phulkas.',
    190.00, 230.00,
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80',
    'Lunch', 'Chef Special', '8-12 mins', '620 kcal', true, true, true, 25,
    ARRAY['Malai Paneer', 'Cashew Makhani Gravy', 'Jeera Rice', 'Butter Phulkas', 'Pickled Onions'],
    '#EA580C', 'rice', true
),
(
    'item-9',
    'Canteen Signature Idli Sambar',
    'Idli Sambar',
    'Steamed Button Idlis • Madras Lentil Stew • Gunpowder Dip',
    'Three pillowy cloud-soft steamed rice-lentil cakes immersed in piping hot aromatic Madras vegetable sambar, accompanied by spicy podi gunpowder infused with warm sesame oil.',
    65.00, 80.00,
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=80',
    'Breakfast', 'Budget Hero', '3-5 mins', '280 kcal', true, false, true, 60,
    ARRAY['Steamed Idlis', 'Toor Dal Sambar', 'Idli Podi', 'Coconut Chutney', 'Ghee'],
    '#CA8A04', 'dosa', true
),
(
    'item-10',
    'Midnight Cheesy Maggi Pot',
    'Cheesy Maggi',
    'Classic 2-Min Noodles • Mozzarella Pull • Spicy Herb Dust',
    'Every hostelite''s sacred midnight fuel: spiced noodle broth cooked with butter, sweet corn, green chilies, topped with an aggressive double mozzarella cheese pull and oregano chili flakes.',
    85.00, 100.00,
    'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=900&q=80',
    'Special Items', 'Hostel Legend', '5-7 mins', '410 kcal', true, true, true, 40,
    ARRAY['Noodles', 'Double Mozzarella', 'Sweet Corn', 'Green Chilies', 'Butter', 'Oregano'],
    '#EAB308', 'rice', true
),
(
    'item-11',
    'Pure Desi Ghee Ven Pongal',
    'Ghee Pongal',
    'Rice & Moong Dal • Cashews • Black Pepper Cumin Tempering',
    'Traditional steaming hot South Indian rice and yellow moong dal mash slow-cooked with whole roasted cashews, crushed black pepper, cumin seeds, and generous desi ghee. Served with hot sambar and coconut chutney.',
    75.00, 90.00,
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=80',
    'Breakfast', 'South Comfort', '3-5 mins', '320 kcal', true, false, true, 50,
    ARRAY['Raw Rice', 'Moong Dal', 'Pure Desi Ghee', 'Whole Cashews', 'Crushed Black Pepper', 'Curry Leaves'],
    '#F59E0B', 'rice', true
),
(
    'item-12',
    'Golden Puffed Poori Masala',
    'Poori Masala',
    '3 Crispy Wheat Pooris • Spiced Potato Onion Sagu',
    'Three piping-hot golden puffed whole wheat pooris served with tempered spiced potato-onion sagu masala and fresh mint coconut chutney.',
    80.00, 95.00,
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
    'Breakfast', 'Crispy Morning', '5-7 mins', '460 kcal', true, false, true, 40,
    ARRAY['Whole Wheat Pooris', 'Spiced Aloo Sagu', 'Green Chilies', 'Ginger', 'Coconut Chutney'],
    '#EAB308', 'dosa', true
),
(
    'item-13',
    'Hyderabadi Chicken Dum Biryani',
    'Chicken Biryani',
    'Kacchi Dum Basmati • Succulent Chicken • Mirchi Ka Salan',
    'Slow dum-cooked long-grain basmati layered with tender saffron-marinated bone-in chicken, caramelized brown onions, fragrant royal spices, boiled egg, served with thick spiced raita and mirchi ka salan.',
    210.00, 250.00,
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80',
    'Special Items', 'Chef Signature', '8-12 mins', '680 kcal', false, true, true, 35,
    ARRAY['Aged Basmati', 'Marinated Chicken', 'Saffron Ghee', 'Crispy Birista', 'Boiled Egg', 'Mint'],
    '#FF6B35', 'rice', true
),
(
    'item-14',
    'Homestyle Soft Chapati Kurma',
    'Chapati Kurma',
    '3 Tawa Chapatis • Coconut Mixed Veg Kurma • Onion Salad',
    'Three soft whole wheat tawa chapatis lightly brushed with butter, paired with a slow-simmered South Indian spiced vegetable kurma infused with coconut and fennel.',
    85.00, 100.00,
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80',
    'Lunch', 'Healthy Choice', '4-6 mins', '340 kcal', true, false, true, 45,
    ARRAY['Whole Wheat Chapatis', 'Mixed Veg Kurma', 'Coconut Fennel Gravy', 'Pickled Onions'],
    '#CA8A04', 'dosa', true
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    image_url = EXCLUDED.image_url,
    category = EXCLUDED.category,
    badge = EXCLUDED.badge,
    prep_time = EXCLUDED.prep_time,
    calories = EXCLUDED.calories,
    is_veg = EXCLUDED.is_veg,
    is_special = EXCLUDED.is_special,
    available = EXCLUDED.available,
    stock = EXCLUDED.stock,
    ingredients = EXCLUDED.ingredients,
    theme_color = EXCLUDED.theme_color,
    model_type = EXCLUDED.model_type,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

-- -----------------------------------------------------------------------------
-- 2. SEED WEEKLY MENU SCHEDULE (0 = Sunday ... 6 = Saturday)
-- -----------------------------------------------------------------------------
-- Helper CTE to map dish codes to real catalog UUIDs
WITH catalog_lookup AS (
    SELECT id, code FROM public.food_catalog
),
schedule_definitions (day_num, dish_codes) AS (
    VALUES
        (0, ARRAY['item-13', 'item-1', 'item-8', 'item-10', 'item-6', 'item-7']),       -- Sunday (0)
        (1, ARRAY['item-4', 'item-9', 'item-11', 'item-6', 'item-10']),                 -- Monday (1)
        (2, ARRAY['item-12', 'item-14', 'item-2', 'item-7', 'item-5']),                 -- Tuesday (2)
        (3, ARRAY['item-9', 'item-12', 'item-11', 'item-5', 'item-10']),                -- Wednesday (3)
        (4, ARRAY['item-4', 'item-14', 'item-12', 'item-1', 'item-6']),                 -- Thursday (4)
        (5, ARRAY['item-11', 'item-9', 'item-8', 'item-13', 'item-3', 'item-6']),       -- Friday (5)
        (6, ARRAY['item-4', 'item-12', 'item-1', 'item-5', 'item-7'])                   -- Saturday (6)
),
unfolded AS (
    SELECT 
        s.day_num,
        c.id AS food_id,
        u.ord AS sort_order
    FROM schedule_definitions s
    CROSS JOIN LATERAL unnest(s.dish_codes) WITH ORDINALITY AS u(code, ord)
    JOIN catalog_lookup c ON c.code = u.code
)
INSERT INTO public.weekly_menu_schedule (food_id, day_of_week, is_available, sort_order)
SELECT food_id, day_num, true, sort_order
FROM unfolded
ON CONFLICT (food_id, day_of_week) DO UPDATE SET
    sort_order = EXCLUDED.sort_order,
    is_available = EXCLUDED.is_available,
    updated_at = timezone('utc'::text, now());

-- -----------------------------------------------------------------------------
-- 3. SEED SPECIAL DATE MENU OVERRIDES
-- -----------------------------------------------------------------------------
INSERT INTO public.special_date_menus (menu_date, title, badge, notes, is_active)
VALUES (
    '2026-11-16',
    'Campus Cultural Fest Grand Feast',
    'Fest Special',
    'Special high-volume fest batch menu approved by Dean of Student Affairs',
    true
)
ON CONFLICT (menu_date) DO UPDATE SET
    title = EXCLUDED.title,
    badge = EXCLUDED.badge,
    notes = EXCLUDED.notes,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

-- Populate Special Menu Items for 2026-11-16
WITH special_menu AS (
    SELECT id FROM public.special_date_menus WHERE menu_date = '2026-11-16' LIMIT 1
),
special_items_def (dish_code, sort_order) AS (
    VALUES
        ('item-13', 1), -- Chicken Biryani
        ('item-8', 2),  -- Paneer Butter Masala
        ('item-1', 3),  -- Smash Burger
        ('item-7', 4),  -- Oreo Shake
        ('item-6', 5)   -- Cold Brew Juice
)
INSERT INTO public.special_menu_items (special_menu_id, food_id, is_available, sort_order)
SELECT 
    sm.id,
    fc.id,
    true,
    sid.sort_order
FROM special_menu sm
CROSS JOIN special_items_def sid
JOIN public.food_catalog fc ON fc.code = sid.dish_code
ON CONFLICT (special_menu_id, food_id) DO UPDATE SET
    sort_order = EXCLUDED.sort_order,
    is_available = EXCLUDED.is_available;



-- -----------------------------------------------------------------------------
-- 4. SEED SAMPLE ACCOUNTS (OPTIONAL INSTRUCTIONS)
-- -----------------------------------------------------------------------------
-- In Supabase Auth, users are created via the Supabase Auth API or Dashboard.
-- When a user registers with email 'canteen.head@campus.edu', grant them admin role:
--
-- INSERT INTO public.admin_profiles (id, email, name, role)
-- SELECT id, email, 'Chef Vikram Rao', 'admin'
-- FROM auth.users WHERE email = 'canteen.head@campus.edu'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
--
-- Similarly, a default student 'alex.rivera@campus.edu' with register number 'CB-2024-884'
-- is automatically inserted into public.student_profiles via the on_auth_user_created trigger.
