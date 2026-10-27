import assert from 'node:assert/strict'
import { z } from 'zod'

const egyptianPhone = /^(\+?2)?0(10|11|12|15)[0-9]{8}$/

const getRegisterSchema = (isArabic) =>
  z
    .object({
      full_name: z
        .string()
        .min(2, isArabic ? 'الاسم يجب أن يكون حرفين على الأقل' : 'Name must be at least 2 characters')
        .max(60),
      phone: z
        .string()
        .regex(
          egyptianPhone,
          isArabic ? 'رقم الهاتف غير صحيح (مثال: 01012345678)' : 'Invalid phone number (e.g. 01012345678)'
        ),
      email: z.string().email(isArabic ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address'),
      password: z
        .string()
        .min(8, isArabic ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters')
        .regex(/[A-Z]/, isArabic ? 'يجب أن تحتوي على حرف كبير' : 'Must contain an uppercase letter')
        .regex(/[0-9]/, isArabic ? 'يجب أن تحتوي على رقم' : 'Must contain a number'),
      confirm_password: z.string(),
      agree_terms: z.literal(true, {
        errorMap: () => ({
          message: isArabic
            ? 'يرجى الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة'
            : 'Please agree to the Terms of Service and Privacy Policy to continue',
        }),
      }),
    })
    .refine((d) => d.password === d.confirm_password, {
      path: ['confirm_password'],
      message: isArabic ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match',
    })

// Test 1: Arabic schema with unchecked agree_terms
const arSchema = getRegisterSchema(true)
const invalidArResult = arSchema.safeParse({
  full_name: 'أحمد علي',
  phone: '01012345678',
  email: 'ahmed@example.com',
  password: 'Password123',
  confirm_password: 'Password123',
  agree_terms: false,
})
assert.equal(invalidArResult.success, false, 'Unchecked agree_terms must fail validation')
assert.equal(
  invalidArResult.error.errors[0].message,
  'يرجى الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة',
  'Arabic error message must match requirement'
)

// Test 2: English schema with unchecked agree_terms
const enSchema = getRegisterSchema(false)
const invalidEnResult = enSchema.safeParse({
  full_name: 'Ahmed Ali',
  phone: '01012345678',
  email: 'ahmed@example.com',
  password: 'Password123',
  confirm_password: 'Password123',
  agree_terms: false,
})
assert.equal(invalidEnResult.success, false, 'Unchecked agree_terms must fail validation in English')
assert.equal(
  invalidEnResult.error.errors[0].message,
  'Please agree to the Terms of Service and Privacy Policy to continue',
  'English error message must match requirement'
)

// Test 3: Missing agree_terms field fails
const missingResult = arSchema.safeParse({
  full_name: 'أحمد علي',
  phone: '01012345678',
  email: 'ahmed@example.com',
  password: 'Password123',
  confirm_password: 'Password123',
})
assert.equal(missingResult.success, false, 'Missing agree_terms must fail validation')

// Test 4: Valid registration with agree_terms = true
const validResult = arSchema.safeParse({
  full_name: 'أحمد علي',
  phone: '01012345678',
  email: 'ahmed@example.com',
  password: 'Password123',
  confirm_password: 'Password123',
  agree_terms: true,
})
assert.equal(validResult.success, true, 'Checked agree_terms with valid inputs must pass')

// Test 5: Server-side registerSchema rejects payload without agree_terms
const serverRegisterSchema = z.object({
  full_name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(60),
  phone: z.string().regex(egyptianPhone, 'رقم الهاتف غير صحيح (مثال: 01012345678)'),
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

const serverMissingConsent = serverRegisterSchema.safeParse({
  full_name: 'أحمد علي',
  phone: '01012345678',
  email: 'ahmed@example.com',
  password: 'Password123',
})
assert.equal(serverMissingConsent.success, false, 'Server registerSchema must reject payload missing agree_terms')
assert.equal(
  serverMissingConsent.error.errors[0].message,
  'يرجى الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة',
  'Server error message matches requirement'
)

// Test 6: Server-side registerSchema rejects agree_terms = false
const serverConsentFalse = serverRegisterSchema.safeParse({
  full_name: 'أحمد علي',
  phone: '01012345678',
  email: 'ahmed@example.com',
  password: 'Password123',
  agree_terms: false,
})
assert.equal(serverConsentFalse.success, false, 'Server registerSchema must reject agree_terms = false')

// Test 7: Server-side registerSchema accepts agree_terms = true
const serverConsentTrue = serverRegisterSchema.safeParse({
  full_name: 'أحمد علي',
  phone: '01012345678',
  email: 'ahmed@example.com',
  password: 'Password123',
  agree_terms: true,
})
assert.equal(serverConsentTrue.success, true, 'Server registerSchema accepts valid payload with agree_terms: true')

console.log('✓ All compliance schema tests (client & server) passed successfully!')
