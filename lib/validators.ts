import { z } from 'zod'

// Egyptian phone regex: starts with 010, 011, 012, or 015 + 8 digits
const egyptianPhoneRegex = /^(\+?2)?0(10|11|12|15)[0-9]{8}$/

export const loginSchema = z.object({
  identifier: z.string().min(3, 'أدخل البريد الإلكتروني أو رقم الهاتف'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
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
  agree_terms: z.literal(true, {
    errorMap: () => ({
      message: 'يرجى الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة',
    }),
  }),
})

export const checkoutSchema = z
  .object({
    customer_name: z.string().min(2, 'الاسم مطلوب').max(60),
    customer_phone: z
      .string()
      .regex(egyptianPhoneRegex, 'رقم الهاتف غير صحيح'),
    order_type: z.enum(['delivery', 'pickup']).default('delivery'),
    delivery_address: z.string().max(300).optional().default(''),
    building_no: z.string().max(50).optional().default(''),
    floor_no: z.string().max(50).optional().default(''),
    apartment_no: z.string().max(50).optional().default(''),
    map_coordinates: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
      .optional(),
    map_url: z.string().max(300).optional(),
    notes: z.string().max(500).optional(),
    items: z
      .array(
        z
          .object({
            menuItemId: z.string().uuid(),
            size: z.enum(['single', 'double', 'triple']),
            quantity: z.number().int().min(1).max(20),
            addons: z
              .array(
                z
                  .object({
                    id: z.string().uuid(),
                  })
                  .passthrough()
              )
              .max(10)
              .default([]),
          })
          .passthrough()
      )
      .min(1, 'السلة فارغة')
      .max(30),
  })
  .superRefine((data, ctx) => {
    if (data.order_type === 'delivery') {
      if (!data.delivery_address || data.delivery_address.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'أدخل اسم الشارع والمنطقة',
          path: ['delivery_address'],
        })
      }
      if (!data.building_no || data.building_no.trim().length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'رقم العمارة مطلوب',
          path: ['building_no'],
        })
      }
      if (!data.floor_no || data.floor_no.trim().length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'الدور مطلوب',
          path: ['floor_no'],
        })
      }
      if (!data.apartment_no || data.apartment_no.trim().length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'رقم الشقة مطلوب',
          path: ['apartment_no'],
        })
      }
    }
  })

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'on_delivery', 'finished', 'cancelled']),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type CheckoutFormValues = z.infer<typeof checkoutSchema>
export type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>
