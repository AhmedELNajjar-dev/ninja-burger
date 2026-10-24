import type { Category, MenuItem, Addon } from '@/types'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-beef', name_ar: 'سندوتشات البيف سماش', name_en: 'Beef Smasher Sandwiches', sort_order: 1 },
  { id: 'cat-chicken', name_ar: 'سندوتشات التشيكن', name_en: 'Chicken Sandwiches', sort_order: 2 },
  { id: 'cat-fries', name_ar: 'فرايز مطرقعة', name_en: 'Crispy Fries', sort_order: 3 },
  { id: 'cat-mix', name_ar: 'الميكس الكبير', name_en: 'The Big Mix', sort_order: 4 },
]

export const DEFAULT_SAUCE_OPTIONS = [
  { id: 'sauce-cheddar', name_ar: 'صوص شيدر', name_en: 'Cheddar Sauce', is_available: true },
  { id: 'sauce-tasty', name_ar: 'صوص بيج تايستي', name_en: 'Big Tasty Sauce', is_available: true },
  { id: 'sauce-bbq', name_ar: 'صوص باربيكيو', name_en: 'BBQ Sauce', is_available: true },
  { id: 'sauce-ranch', name_ar: 'صوص رانش', name_en: 'Ranch Sauce', is_available: true },
  { id: 'sauce-samourai', name_ar: 'صوص ساموراي حار', name_en: 'Spicy Samourai Sauce', is_available: true },
  { id: 'sauce-thousand', name_ar: 'صوص تاوزند آيلاند', name_en: 'Thousand Island Sauce', is_available: true },
]

export const DEFAULT_DRINK_OPTIONS = [
  { id: 'drink-pepsi', name_ar: 'بيبسي', name_en: 'Pepsi', is_available: true },
  { id: 'drink-coca', name_ar: 'كوكاكولا', name_en: 'Coca-Cola', is_available: true },
  { id: 'drink-7up', name_ar: 'سفن آب', name_en: '7Up', is_available: true },
  { id: 'drink-sprite', name_ar: 'سبرايت', name_en: 'Sprite', is_available: true },
  { id: 'drink-fanta', name_ar: 'فانتا برتقال', name_en: 'Fanta Orange', is_available: true },
  { id: 'drink-diet-pepsi', name_ar: 'دايت بيبسي', name_en: 'Diet Pepsi', is_available: true },
]

export const DEFAULT_ADDONS: Addon[] = [
  { id: 'addon-1', name_ar: 'إضافة بيكون', name_en: 'Bacon Add-on', price: 20, is_available: true, sort_order: 1, is_topping: true },
  { id: 'addon-2', name_ar: 'إضافة موتزاريلا', name_en: 'Mozzarella Add-on', price: 15, is_available: true, sort_order: 2, is_topping: true },
  { id: 'addon-3', name_ar: 'إضافة مشروم', name_en: 'Mushroom Add-on', price: 15, is_available: true, sort_order: 3, is_topping: true },
  { id: 'addon-4', name_ar: 'إضافة تركي', name_en: 'Turkey Add-on', price: 15, is_available: true, sort_order: 4, is_topping: true },
  { id: 'addon-5', name_ar: 'إضافة بيبروني', name_en: 'Pepperoni Add-on', price: 15, is_available: true, sort_order: 5, is_topping: true },
  { id: 'addon-6', name_ar: 'شريحة جبن', name_en: 'Cheese Slice', price: 15, is_available: true, sort_order: 6, is_topping: true },
  { id: 'addon-7', name_ar: 'باكيت فرايز', name_en: 'Fries Packet', price: 30, is_available: true, sort_order: 7, is_topping: false },
  {
    id: 'addon-8',
    name_ar: 'كاب صوص',
    name_en: 'Sauce Cup',
    price: 15,
    is_available: true,
    sort_order: 8,
    is_topping: false,
    options: DEFAULT_SAUCE_OPTIONS,
  },
  { id: 'addon-9', name_ar: 'مياه معدنية', name_en: 'Mineral Water', price: 15, is_available: true, sort_order: 9, is_topping: false },
  {
    id: 'addon-10',
    name_ar: 'مياه غازية',
    name_en: 'Soft Drinks',
    price: 20,
    is_available: true,
    sort_order: 10,
    is_topping: false,
    options: DEFAULT_DRINK_OPTIONS,
  },
  { id: 'addon-11', name_ar: 'كرمليز أوبيون', name_en: 'Caramelized Onion', price: 10, is_available: true, sort_order: 11, is_topping: true },
  { id: 'addon-12', name_ar: 'إضافة هاليبنو', name_en: 'Jalapeño Add-on', price: 5, is_available: true, sort_order: 12, is_topping: true },
]

/**
 * Helper to identify if an addon is a topping for sandwiches/fries,
 * or a standalone side/drink meant only for the Addons section.
 */
export function isSandwichTopping(addon: Addon): boolean {
  if (addon.is_topping === false) return false
  if (addon.is_topping === true) return true

  // Fallback heuristic based on names / IDs
  const lowerEn = (addon.name_en || '').toLowerCase()
  const nameAr = addon.name_ar || ''

  if (
    addon.id === 'addon-7' ||
    addon.id === 'addon-8' ||
    addon.id === 'addon-9' ||
    addon.id === 'addon-10' ||
    lowerEn.includes('fries packet') ||
    lowerEn.includes('packet') ||
    nameAr.includes('باكيت') ||
    lowerEn.includes('sauce cup') ||
    nameAr.includes('كاب صوص') ||
    nameAr.includes('صوص كاب') ||
    lowerEn.includes('water') ||
    nameAr.includes('مياه') ||
    lowerEn.includes('drink') ||
    lowerEn.includes('soda') ||
    lowerEn.includes('sparkling') ||
    nameAr.includes('غازية') ||
    nameAr.includes('مشروب')
  ) {
    return false
  }

  return true
}

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  // Beef
  {
    id: 'item-beef-1',
    category_id: 'cat-beef',
    name_ar: 'نينجا ساندوتش',
    name_en: 'Ninja Sandwich',
    description_ar: 'عيش بريوش، صوص كاتشب، خس، خيار مخلل، بصل، قطعة البرجر، أمريكان تشيز، فرايز',
    price_single: 105,
    price_double: 135,
    price_triple: 175,
    is_available: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-beef-2',
    category_id: 'cat-beef',
    name_ar: 'لبو ساندوتش',
    name_en: 'Lbo Sandwich',
    description_ar: 'عيش بريوش، صوص تيسني، خس، خيار مخلل، بصل مكرمل، قطعة البرجر، أمريكان تشيز، فرايز',
    price_single: 110,
    price_double: 140,
    price_triple: 180,
    is_available: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-beef-3',
    category_id: 'cat-beef',
    name_ar: 'رافا ساندوتش',
    name_en: 'Rafa Sandwich',
    description_ar: 'عيش بريوش، صوص تيسني، خس، خيار مخلل، بصل، قطعة البرجر، بيف بيكون، أمريكان تشيز، فرايز',
    price_single: 115,
    price_double: 145,
    price_triple: 185,
    is_available: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-beef-4',
    category_id: 'cat-beef',
    name_ar: 'دوني ساندوتش',
    name_en: 'Dony Sandwich',
    description_ar: 'عيش بريوش، صوص مايونيز، صوص تيسني، خس، خيار مخلل، بصل، قطعة البرجر، مشروم، بصوص الديميجلاس، فرايز',
    price_single: 120,
    price_double: 150,
    price_triple: 190,
    is_available: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-beef-5',
    category_id: 'cat-beef',
    name_ar: 'بيبروني ساندوتش',
    name_en: 'Peperoni Sandwich',
    description_ar: 'عيش بريوش، صوص تيسني، خس، خيار مخلل، بصل، قطعة البرجر، بيبروني، أمريكان تشيز، فرايز',
    price_single: 120,
    price_double: 150,
    price_triple: 190,
    is_available: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
  },

  // Chicken
  {
    id: 'item-chk-1',
    category_id: 'cat-chicken',
    name_ar: 'ليو تشيكن',
    name_en: 'Leo Chicken',
    description_ar: 'عيش بريوش، خس، خيار مخلل، صوص تاوزند آيلاند، قطعة تشيكن، صوص شيدر، فرايز',
    price_single: 110,
    price_double: 140,
    price_triple: 180,
    is_available: true,
    sort_order: 6,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-chk-2',
    category_id: 'cat-chicken',
    name_ar: 'دوني تشيكن',
    name_en: 'Dony Chicken',
    description_ar: 'عيش بريوش، خس، خيار مخلل، صوص مايونيز، قطعة تشيكن، مشروم بصوص الديميجلاس، فرايز',
    price_single: 120,
    price_double: 150,
    price_triple: 190,
    is_available: true,
    sort_order: 7,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-chk-3',
    category_id: 'cat-chicken',
    name_ar: 'رافا تشيكن',
    name_en: 'Rafa Chicken',
    description_ar: 'عيش بريوش، خس، خيار مخلل، صوص تاوزند آيلاند، جبنة موتزاريلا، قطعة تشيكن، قطعة تشيكن تركي مدخن، صوص شيدر، فرايز',
    price_single: 120,
    price_double: 150,
    price_triple: 190,
    is_available: true,
    sort_order: 8,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-chk-4',
    category_id: 'cat-chicken',
    name_ar: 'بيبروني تشيكن',
    name_en: 'Peperoni Chicken',
    description_ar: 'عيش بريوش، خس، خيار مخلل، صوص تاوزند آيلاند، جبنة موتزاريلا، قطعة تشيكن، بيبروني، صوص شيدر، فرايز',
    price_single: 120,
    price_double: 150,
    price_triple: 190,
    is_available: true,
    sort_order: 9,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-chk-5',
    category_id: 'cat-chicken',
    name_ar: 'ناشفيل تشيكن',
    name_en: 'Nashville Chicken',
    description_ar: 'عيش بريوش، خس، خيار مخلل، قطعة ناشفيل تشيكن، كرملايز أوبيون، صوص شيدر، فرايز',
    price_single: 120,
    price_double: 150,
    price_triple: 190,
    is_available: true,
    sort_order: 10,
    created_at: new Date().toISOString(),
  },

  // Fries
  {
    id: 'item-fries-1',
    category_id: 'cat-fries',
    name_ar: 'صوابع سماش',
    name_en: 'Smash Fries',
    description_ar: 'أصابع بطاطس مقرمشة مع توابل سماش الخاصة',
    price_single: 85,
    is_available: true,
    sort_order: 11,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-fries-2',
    category_id: 'cat-fries',
    name_ar: 'صوابع ساموراي',
    name_en: 'Samourai Fries',
    description_ar: 'أصابع بطاطس مقرمشة مع صوص ساموراي الحار',
    price_single: 90,
    is_available: true,
    sort_order: 12,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-fries-3',
    category_id: 'cat-fries',
    name_ar: 'صوابع النينجا',
    name_en: 'Ninja Fries',
    description_ar: 'أصابع بطاطس مقرمشة متبلة بخلطة النينجا السرية',
    price_single: 95,
    is_available: true,
    sort_order: 13,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-fries-4',
    category_id: 'cat-fries',
    name_ar: 'صوابع شيدر هاليبنو',
    name_en: 'Cheddar Jalapeño Fries',
    description_ar: 'أصابع بطاطس غارقة في صوص الشيدر الساخن مع قطع الهاليبنو',
    price_single: 55,
    is_available: true,
    sort_order: 14,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-fries-5',
    category_id: 'cat-fries',
    name_ar: 'لوديد فرايز',
    name_en: 'Loaded Fries',
    description_ar: 'بطاطس مقرمشة مع صوص شيدر، قطع بيكون، وصوص خاص',
    price_single: 70,
    is_available: true,
    sort_order: 15,
    created_at: new Date().toISOString(),
  },

  // Big Mix
  {
    id: 'item-mix-1',
    category_id: 'cat-mix',
    name_ar: 'الفطلعم رشدان دابل',
    name_en: 'Rashdan Double Mix',
    description_ar: 'عيش بريوش، خس، خيار مخلل، بصل، فرش بصوص تيسني، بيف بيكون، قطعة بيف، قطعة تشيكن، تركي مدخن، أمريكان تشيز',
    price_single: 150,
    price_double: 150,
    price_triple: 185,
    is_available: true,
    sort_order: 16,
    created_at: new Date().toISOString(),
  },
]
