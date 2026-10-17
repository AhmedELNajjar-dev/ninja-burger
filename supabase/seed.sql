-- Seed categories
WITH cat_beef AS (
  INSERT INTO public.categories (id, name_ar, name_en, sort_order) VALUES (uuid_generate_v4(), 'سندوتشات البيف سماش', 'Beef Smasher Sandwiches', 1) RETURNING id
),
cat_chicken AS (
  INSERT INTO public.categories (id, name_ar, name_en, sort_order) VALUES (uuid_generate_v4(), 'سندوتشات التشيكن', 'Chicken Sandwiches', 2) RETURNING id
),
cat_fries AS (
  INSERT INTO public.categories (id, name_ar, name_en, sort_order) VALUES (uuid_generate_v4(), 'فرايز مطرقعة', 'Crispy Fries', 3) RETURNING id
),
cat_mix AS (
  INSERT INTO public.categories (id, name_ar, name_en, sort_order) VALUES (uuid_generate_v4(), 'الميكس الكبير', 'The Big Mix', 4) RETURNING id
),
cat_addons AS (
  INSERT INTO public.categories (id, name_ar, name_en, sort_order) VALUES (uuid_generate_v4(), 'الاضافات', 'Add-ons', 5) RETURNING id
)

-- Seed menu_items (Beef)
INSERT INTO public.menu_items (id, category_id, name_ar, name_en, description_ar, price_single, price_double, price_triple)
SELECT uuid_generate_v4(), id, 'نينجا ساندونش', 'Ninja Sandwich', 'عيش بريوش، صوص كاتشب، خس، خيار مخلل، بصل، قطعة البرجر، أمريكان تشيز، فرايز', 105, 135, 175 FROM cat_beef
UNION ALL SELECT uuid_generate_v4(), id, 'لبو ساندونش', 'Lbo Sandwich', 'عيش بريوش، صوص تيسني، خس، خيار مخلل، بصل مكرمل، قطعة البرجر، أمريكان تشيز، فرايز', 110, 140, 180 FROM cat_beef
UNION ALL SELECT uuid_generate_v4(), id, 'رافا ساندونش', 'Rafa Sandwich', 'عيش بريوش، صوص تيسني، خس، خيار مخلل، بصل، قطعة البرجر، بيف بيكون، أمريكان تشيز، فرايز', 115, 145, 185 FROM cat_beef
UNION ALL SELECT uuid_generate_v4(), id, 'دوني ساندونش', 'Dony Sandwich', 'عيش بريوش، صوص مايونيز، صوص تيسني، خس، خيار مخلل، بصل، قطعة البرجر، مشروم، بصوص الديميجلاس، فرايز', 120, 150, 190 FROM cat_beef
UNION ALL SELECT uuid_generate_v4(), id, 'بيبروني ساندونش', 'Peperoni Sandwich', 'عيش بريوش، صوص تيسني، خس، خيار مخلل، بصل، قطعة البرجر، بيبروني، أمريكان تشيز، فرايز', 120, 150, 190 FROM cat_beef;

-- Seed menu_items (Chicken)
WITH cat_chicken AS (SELECT id FROM public.categories WHERE name_en = 'Chicken Sandwiches' LIMIT 1)
INSERT INTO public.menu_items (id, category_id, name_ar, name_en, description_ar, price_single, price_double, price_triple)
SELECT uuid_generate_v4(), id, 'ليو نشبكن', 'Leo Chicken', 'عيش بريوش، خس، خيار مخلل، صوص تاوزند آيلاند، قطعة تشيكن، صوص شيدر، فرايز', 110, 140, 180 FROM cat_chicken
UNION ALL SELECT uuid_generate_v4(), id, 'دوني نشبكن', 'Dony Chicken', 'عيش بريوش، خس، خيار مخلل، صوص مايونيز، قطعة تشيكن، مشروم بصوص الديميجلاس، فرايز', 120, 150, 190 FROM cat_chicken
UNION ALL SELECT uuid_generate_v4(), id, 'رافا نشبكن', 'Rafa Chicken', 'عيش بريوش، خس، خيار مخلل، صوص تاوزند آيلاند، جبنة موتزاريلا، قطعة تشيكن، قطعة تشيكن تركي مدخن، صوص شيدر، فرايز', 120, 150, 190 FROM cat_chicken
UNION ALL SELECT uuid_generate_v4(), id, 'بيبروني نشبكن', 'Peperoni Chicken', 'عيش بريوش، خس، خيار مخلل، صوص تاوزند آيلاند، جبنة موتزاريلا، قطعة تشيكن، بيبروني، صوص شيدر، فرايز', 120, 150, 190 FROM cat_chicken
UNION ALL SELECT uuid_generate_v4(), id, 'ناشفيل نشبكن', 'Nashville Chicken', 'عيش بريوش، خس، خيار مخلل، قطعة ناشفيل تشيكن، كرملايز أوبيون، صوص شيدر، فرايز', 120, 150, 190 FROM cat_chicken;

-- Seed menu_items (Fries)
WITH cat_fries AS (SELECT id FROM public.categories WHERE name_en = 'Crispy Fries' LIMIT 1)
INSERT INTO public.menu_items (id, category_id, name_ar, name_en, price_single)
SELECT uuid_generate_v4(), id, 'صوابع سماش', 'Smash Fries', 85 FROM cat_fries
UNION ALL SELECT uuid_generate_v4(), id, 'صوابع سامورای', 'Samourai Fries', 90 FROM cat_fries
UNION ALL SELECT uuid_generate_v4(), id, 'صوابع النـنبن', 'Nenben Fries', 95 FROM cat_fries
UNION ALL SELECT uuid_generate_v4(), id, 'صوابع شيدر هاليبنو', 'Cheddar Jalapeño Fries', 55 FROM cat_fries
UNION ALL SELECT uuid_generate_v4(), id, 'لوديد فرايز', 'Loaded Fries', 70 FROM cat_fries;

-- Seed menu_items (The Big Mix)
WITH cat_mix AS (SELECT id FROM public.categories WHERE name_en = 'The Big Mix' LIMIT 1)
INSERT INTO public.menu_items (id, category_id, name_ar, name_en, description_ar, price_single, price_double, price_triple)
SELECT uuid_generate_v4(), id, 'الفطلعم رشدان دابل', 'Rashdan Double Mix', 'عيش بريوش، خس، خيار مخلل، بصل، فرش بصوص تيسني، بيف بيكون، قطعة بيف، قطعة تشيكن، تركي مدخن، أمريكان تشيز', 0, 150, 185 FROM cat_mix;

-- Seed addons
INSERT INTO public.addons (id, name_ar, name_en, price) VALUES
(uuid_generate_v4(), 'إضافة بيكون', 'Bacon Add-on', 20),
(uuid_generate_v4(), 'إضافة موتزاريلا', 'Mozzarella Add-on', 15),
(uuid_generate_v4(), 'إضافة مشروم', 'Mushroom Add-on', 15),
(uuid_generate_v4(), 'إضافة تركي', 'Turkey Add-on', 15),
(uuid_generate_v4(), 'إضافة بيبروني', 'Pepperoni Add-on', 15),
(uuid_generate_v4(), 'شريحة جبن', 'Cheese Slice', 15),
(uuid_generate_v4(), 'باكيت فرايز', 'Fries Packet', 30),
(uuid_generate_v4(), 'كاب صوص', 'Sauce Cup', 15),
(uuid_generate_v4(), 'مياه معدنية', 'Mineral Water', 15),
(uuid_generate_v4(), 'مياه غازية', 'Sparkling Water', 20),
(uuid_generate_v4(), 'كرمليز أوبيون', 'Caramelized Onion', 10),
(uuid_generate_v4(), 'إضافة هاليبنو', 'Jalapeño Add-on', 5);
