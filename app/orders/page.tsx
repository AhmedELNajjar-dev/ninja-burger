import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import type { Order, Profile } from '@/types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types'

export const metadata = { title: 'طلباتي — نينجا برجر' }

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export default async function OrdersPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/orders')

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const safeOrders: Order[] = orders ?? []

  return (
    <div className="min-h-screen bg-ninja-gray">
      <Navbar profile={profile as Profile | null} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-ninja-dark">طلباتي 📦</h1>
            <p className="text-gray-500 text-sm mt-1">
              {safeOrders.length > 0
                ? `${safeOrders.length} طلب في سجلّك`
                : 'لا توجد طلبات بعد'}
            </p>
          </div>
          <Link href="/" className="btn-primary py-2 px-4 text-sm">
            🍔 اطلب الآن
          </Link>
        </div>

        {safeOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-card">
            <span className="text-6xl">🛒</span>
            <h2 className="text-xl font-bold text-ninja-dark mt-4">لا توجد طلبات بعد</h2>
            <p className="text-gray-500 mt-2 mb-6">اكتشف قائمتنا الشهية وابدأ طلبك الأول!</p>
            <Link href="/" className="btn-primary inline-flex">
              تصفح القائمة
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {safeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden"
              >
                {/* Order header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-ninja-red text-white font-black text-sm w-12 h-12 rounded-xl flex items-center justify-center">
                      #{String(order.order_number).padStart(4, '0').slice(-4)}
                    </div>
                    <div>
                      <div className="font-bold text-ninja-dark">
                        طلب #{String(order.order_number).padStart(4, '0')}
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`status-badge text-xs ${ORDER_STATUS_COLORS[order.status]}`}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* Items */}
                <div className="px-5 py-4">
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex items-start justify-between text-sm">
                        <div>
                          <span className="font-semibold text-ninja-dark">{item.name_ar}</span>
                          <span className="text-gray-400 mx-1">·</span>
                          <span className="text-gray-500">
                            {item.size === 'single'
                              ? 'سنجل'
                              : item.size === 'double'
                              ? 'دابل'
                              : 'تريبل'}
                          </span>
                          {item.addons.length > 0 && (
                            <div className="text-gray-400 text-xs mt-0.5">
                              + {item.addons.map((a) => a.name_ar).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-left shrink-0 mr-4">
                          <span className="text-gray-500">{item.quantity}×</span>
                          <span className="font-semibold text-ninja-dark mr-1">
                            {item.lineTotal} ج
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Notes */}
                  {order.notes && (
                    <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-100">
                      <span className="font-semibold">ملاحظات: </span>
                      {order.notes}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      📍 {order.delivery_address}
                    </div>
                    <div className="font-black text-lg text-ninja-red">
                      {Number(order.total_amount).toFixed(0)} ج
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
