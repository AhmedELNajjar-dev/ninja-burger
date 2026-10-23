import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const cartSchema = z.object({
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
    .max(30),
})

// GET /api/cart: Retrieve saved cart for logged-in user
export async function GET() {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ items: [] })
    }

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('cart')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ items: profile?.cart ?? [] })
  } catch {
    return NextResponse.json({ items: [] })
  }
}

// POST /api/cart: Save cart for logged-in user to database
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = cartSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات السلة غير صحيحة' }, { status: 400 })
    }

    const { items } = parsed.data
    const adminClient = createAdminClient()

    await adminClient
      .from('profiles')
      .update({ cart: items ?? [] })
      .eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'فشل حفظ السلة' }, { status: 500 })
  }
}
