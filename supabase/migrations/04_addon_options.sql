-- 04_addon_options.sql
-- Enables flavor / variant options for sauce cups and soft drinks, and categorizes addons (sandwich topping vs standalone side/drink)

-- 1. Add options (JSONB) and is_topping (boolean) columns to addons table
ALTER TABLE public.addons ADD COLUMN IF NOT EXISTS options jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.addons ADD COLUMN IF NOT EXISTS is_topping boolean NOT NULL DEFAULT true;

-- 2. Mark existing sides and drinks as non-toppings
UPDATE public.addons 
SET is_topping = false 
WHERE name_ar IN ('باكيت فرايز', 'كاب صوص', 'مياه معدنية', 'مياه غازية')
   OR name_en IN ('Fries Packet', 'Sauce Cup', 'Mineral Water', 'Sparkling Water', 'Soft Drinks');

-- 3. Populate default flavor options for Sauce Cup if empty
UPDATE public.addons
SET options = '[
  {"id": "sauce-cheddar", "name_ar": "صوص شيدر", "name_en": "Cheddar Sauce", "is_available": true},
  {"id": "sauce-tasty", "name_ar": "صوص بيج تايستي", "name_en": "Big Tasty Sauce", "is_available": true},
  {"id": "sauce-bbq", "name_ar": "صوص باربيكيو", "name_en": "BBQ Sauce", "is_available": true},
  {"id": "sauce-ranch", "name_ar": "صوص رانش", "name_en": "Ranch Sauce", "is_available": true},
  {"id": "sauce-samourai", "name_ar": "صوص ساموراي حار", "name_en": "Spicy Samourai Sauce", "is_available": true},
  {"id": "sauce-thousand", "name_ar": "صوص تاوزند آيلاند", "name_en": "Thousand Island Sauce", "is_available": true}
]'::jsonb
WHERE (name_ar = 'كاب صوص' OR name_en = 'Sauce Cup') AND (options IS NULL OR options = '[]'::jsonb);

-- 4. Populate default drink options for Soft Drinks if empty
UPDATE public.addons
SET options = '[
  {"id": "drink-pepsi", "name_ar": "بيبسي", "name_en": "Pepsi", "is_available": true},
  {"id": "drink-coca", "name_ar": "كوكاكولا", "name_en": "Coca-Cola", "is_available": true},
  {"id": "drink-7up", "name_ar": "سفن آب", "name_en": "7Up", "is_available": true},
  {"id": "drink-sprite", "name_ar": "سبرايت", "name_en": "Sprite", "is_available": true},
  {"id": "drink-fanta", "name_ar": "فانتا برتقال", "name_en": "Fanta Orange", "is_available": true},
  {"id": "drink-diet-pepsi", "name_ar": "دايت بيبسي", "name_en": "Diet Pepsi", "is_available": true}
]'::jsonb
WHERE (name_ar = 'مياه غازية' OR name_en IN ('Soft Drinks', 'Sparkling Water')) AND (options IS NULL OR options = '[]'::jsonb);

-- 5. Ensure Realtime REPLICA IDENTITY FULL
ALTER TABLE public.addons REPLICA IDENTITY FULL;
