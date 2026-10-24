// ─── Core Domain Types ─────────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string
  phone: string
  email?: string | null
  role: 'customer' | 'admin'
  cart?: CartItem[]
  is_phone_verified?: boolean
  phone_verification_code?: string | null
  saved_address?: {
    delivery_address?: string
    building_no?: string
    floor_no?: string
    apartment_no?: string
    map_url?: string
    notes?: string
  } | null
  created_at: string
}

export interface Category {
  id: string
  name_ar: string
  name_en: string
  sort_order: number
}

export interface MenuItem {
  id: string
  category_id: string
  name_ar: string
  name_en: string
  description_ar: string | null
  description_en?: string | null
  price_single: number
  price_double?: number | null
  price_triple?: number | null
  image_url?: string | null
  is_available: boolean
  sort_order: number
  category?: Category
  created_at?: string
}

// Addon / modifier available for any menu item
export interface Addon {
  id: string
  name_ar: string
  name_en: string
  price: number
  sort_order?: number
  category?: string // optional grouping
  is_available?: boolean
}

// ─── Cart Types ─────────────────────────────────────────────────────────────

export type ItemSize = 'single' | 'double' | 'triple'

export const SIZE_LABELS: Record<ItemSize, string> = {
  single: 'سنجل',
  double: 'دابل',
  triple: 'تريبل',
}

export interface SelectedAddon {
  id: string
  name_ar: string
  price: number
}

export interface CartItem {
  cartId: string // unique id per cart line (uuid v4)
  menuItemId: string
  name_ar: string
  name_en: string
  size: ItemSize
  quantity: number
  unitPrice: number // price for chosen size
  addons: SelectedAddon[]
  addonTotal: number // sum of addons * quantity NOT included — add separately
  lineTotal: number // (unitPrice + addonTotal) * quantity
}

// ─── Order Types ─────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'confirmed' | 'on_delivery' | 'finished' | 'cancelled'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  on_delivery: 'جاري التوصيل',
  finished: 'مكتمل',
  cancelled: 'ملغي',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-red-100 text-red-700 border-red-200',
  confirmed: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  on_delivery: 'bg-blue-100 text-blue-700 border-blue-200',
  finished: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-300',
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'on_delivery',
  'finished',
]

// Snapshot of a cart item stored inside the order JSONB
export interface OrderItemSnapshot {
  menuItemId: string
  name_ar: string
  name_en: string
  size: ItemSize
  quantity: number
  unitPrice: number
  addons: SelectedAddon[]
  lineTotal: number
}

export interface Order {
  id: string
  order_number: number
  user_id: string | null
  customer_name: string
  customer_phone: string
  delivery_address: string
  building_no?: string | null
  floor_no?: string | null
  apartment_no?: string | null
  map_coordinates?: { lat: number; lng: number } | null
  map_url?: string | null
  is_first_order?: boolean
  notes: string | null
  items: OrderItemSnapshot[]
  total_amount: number
  status: OrderStatus
  discord_notified: boolean
  is_phone_verified?: boolean
  created_at: string
}

// ─── Form / API Payload Types ─────────────────────────────────────────────────

export interface CheckoutPayload {
  customer_name: string
  customer_phone: string
  delivery_address: string
  building_no?: string
  floor_no?: string
  apartment_no?: string
  map_coordinates?: { lat: number; lng: number }
  map_url?: string
  notes?: string
  items: OrderItemSnapshot[]
  total_amount?: number
}

export interface LoginPayload {
  identifier: string // email or Egyptian phone number
  password: string
}

export interface RegisterPayload {
  full_name: string
  phone: string
  email: string
  password: string
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus
}

// ─── API Response Shape ───────────────────────────────────────────────────────

export interface ApiError {
  error: string
  details?: string
}

export interface ApiSuccess<T = unknown> {
  data: T
  message?: string
}
