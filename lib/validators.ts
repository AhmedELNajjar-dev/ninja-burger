import { z } from 'zod'

// Egyptian phone regex: starts with 010, 011, 012, or 015 + 8 digits
const egyptianPhoneRegex = /^(\+?2)?0(10|11|12|15)[0-9]{8}$/

export const loginSchema = z.object({
  identifier: z.string().min(3, 'أدخل البريد الإلكتروني أو رقم الهاتف'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

export const registerSchema = z.object({
  full_name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(60),
  phone: z
    .string()
    .regex(egyptianPhoneRegex, 'رقم الهاتف غير صحيح (مثال: 01012345678)'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
    .regex(/[0-9]/, 'يجب أن تحتوي على رقم'),
})

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'الاسم مطلوب').max(60),
  customer_phone: z
    .string()
    .regex(egyptianPhoneRegex, 'رقم الهاتف غير صحيح'),
  delivery_address: z.string().min(3, 'أدخل اسم الشارع والمنطقة').max(300),
  building_no: z.string().min(1, 'رقم العمارة مطلوب').max(50),
  floor_no: z.string().min(1, 'الدور مطلوب').max(50),
  apartment_no: z.string().min(1, 'رقم الشقة مطلوب').max(50),
  map_coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  map_url: z.string().optional(),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        name_ar: z.string(),
        name_en: z.string(),
        size: z.enum(['single', 'double', 'triple']),
        quantity: z.number().int().min(1).max(20),
        unitPrice: z.number().positive(),
        addons: z.array(
          z.object({
            id: z.string(),
            name_ar: z.string(),
            price: z.number().nonnegative(),
          })
        ),
        lineTotal: z.number().positive(),
      })
    )
    .min(1, 'السلة فارغة'),
  total_amount: z.number().positive('الإجمالي غير صحيح'),
})

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'on_delivery', 'finished']),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type CheckoutFormValues = z.infer<typeof checkoutSchema>
export type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>
