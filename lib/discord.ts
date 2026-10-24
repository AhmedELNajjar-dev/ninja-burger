import { Order, OrderItemSnapshot, SIZE_LABELS } from '@/types'

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL!

function formatItems(items: OrderItemSnapshot[]): string {
  if (!items || !Array.isArray(items) || items.length === 0) return 'لا توجد أصناف'
  return items
    .map((item) => {
      const sizeLabel = (item.size && SIZE_LABELS[item.size]) || item.size || ''
      const addons = Array.isArray(item.addons) ? item.addons : []
      const addonStr = addons.length > 0
        ? ` (+${addons.map(a => a.name_ar || a.id).join(', ')})`
        : ''
      return `• ${item.quantity || 1}x ${item.name_ar || 'صنف'} (${sizeLabel})${addonStr} — ${item.lineTotal || 0} ج`
    })
    .join('\n')
}

export async function sendOrderNotification(order: Order): Promise<boolean> {
  if (!WEBHOOK_URL) {
    console.warn('[Discord] DISCORD_WEBHOOK_URL is not set — skipping notification.')
    return false
  }

  const isPickup = order.order_type === 'pickup' || order.delivery_address?.includes('استلام من الفرع')
  const orderTypeTag = isPickup ? ' 🏬 [استلام من الفرع / Pickup]' : ' 🛵 [توصيل / Delivery]'
  const firstTimerTag = order.is_first_order ? ' ⚠️ [عميل جديد — أول طلب]' : ' ⭐ [عميل سابق]'

  const embed: any = {
    title: `🍔 طلب جديد #${String(order.order_number).padStart(4, '0')}${orderTypeTag}${firstTimerTag}`,
    color: isPickup ? 0x8E44AD : (order.is_first_order ? 0xF5A623 : 0xCC1F1A),
    fields: [
      { name: '👤 العميل', value: order.customer_name, inline: true },
      { name: '📞 الهاتف', value: `${order.customer_phone} (${order.is_first_order ? 'يرجى الاتصال للتأكيد 📞' : 'عميل موثوق'})`, inline: true },
      { name: '🏬 طريقة الاستلام', value: isPickup ? 'استلام من الفرع (بدون دليفري)' : 'توصيل منزلي 🛵', inline: true },
      { name: isPickup ? '🏬 الاستلام' : '📍 عنوان التوصيل', value: isPickup ? 'فرع نينجا برجر — المعادي، شارع 9' : order.delivery_address, inline: false },
      { name: '🛒 الطلبات', value: formatItems(order.items), inline: false },
      { name: '💰 الإجمالي', value: `${order.total_amount} ج`, inline: true },
      { name: '💳 الدفع', value: isPickup ? 'كاش بالفرع' : 'كاش عند الاستلام', inline: true },
    ],
    footer: { text: 'نينجا برجر — نظام الطلبات' },
    timestamp: new Date(order.created_at).toISOString(),
  }

  if (order.map_url && /^https:\/\/(www\.)?(google\.com\/maps|maps\.google\.com)/.test(order.map_url)) {
    embed.fields.push({
      name: '🗺️ لوكيشن الخريطة',
      value: `[عرض الموقع على Google Maps](${order.map_url})`,
      inline: false,
    })
  }

  if (order.notes) {
    embed.fields.push({ name: '📝 ملاحظات', value: order.notes, inline: false })
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('[Discord] Webhook failed:', response.status, text)
      return false
    }

    return true
  } catch (error) {
    console.error('[Discord] Network error sending webhook:', error)
    return false
  }
}

export async function sendOrderCancellationNotification(
  order: Order,
  cancelledBy: 'customer' | 'admin' = 'customer'
): Promise<boolean> {
  if (!WEBHOOK_URL) {
    console.warn('[Discord] DISCORD_WEBHOOK_URL is not set — skipping cancellation notification.')
    return false
  }

  const actorLabel = cancelledBy === 'customer' ? 'العميل' : 'إدارة المطعم'

  const embed: any = {
    title: `❌ تم إلغاء الطلب #${String(order.order_number).padStart(4, '0')}`,
    description: `⚠️ **تنبيه للمطبخ:** قام **${actorLabel}** بإلغاء هذا الطلب. يرجى إيقاف أي تجهيز فوراً.`,
    color: 0x808080, // Neutral Grey / Cancelled
    fields: [
      { name: '👤 العميل', value: order.customer_name, inline: true },
      { name: '📞 الهاتف', value: order.customer_phone, inline: true },
      { name: '💰 قيمة الطلب الملغى', value: `${order.total_amount} ج`, inline: true },
      { name: '📍 العنوان', value: order.delivery_address, inline: false },
      { name: '🛒 الأصناف الملغاة', value: formatItems(order.items), inline: false },
    ],
    footer: { text: `نينجا برجر — إشعار إلغاء طلب (${actorLabel})` },
    timestamp: new Date().toISOString(),
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('[Discord] Cancellation webhook failed:', response.status, text)
      return false
    }

    return true
  } catch (error) {
    console.error('[Discord] Error sending cancellation webhook:', error)
    return false
  }
}

export async function sendOrderEditNotification(
  order: Order,
  changes: { field: string; oldVal: string; newVal: string }[]
): Promise<boolean> {
  if (!WEBHOOK_URL) return false

  const changesSummary = changes
    .map((c) => `• **${c.field}:** \`${c.oldVal}\` ➔ \`${c.newVal}\``)
    .join('\n')

  const embed: any = {
    title: `✏️ تم تعديل بيانات الطلب #${String(order.order_number).padStart(4, '0')}`,
    description: `⚠️ **تنبيه للمطبخ:** قامت الإدارة بتعديل بيانات هذا الطلب:\n\n${changesSummary}`,
    color: 0x3498DB, // Blue
    fields: [
      { name: '👤 العميل', value: order.customer_name, inline: true },
      { name: '📞 الهاتف', value: order.customer_phone, inline: true },
      { name: '💰 الإجمالي', value: `${order.total_amount} ج`, inline: true },
      { name: '📍 العنوان الحالي', value: order.delivery_address, inline: false },
      { name: '🛒 الأصناف', value: formatItems(order.items), inline: false },
    ],
    footer: { text: 'نينجا برجر — تعديل طلب بواسطة الإدارة' },
    timestamp: new Date().toISOString(),
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })
    return response.ok
  } catch (error) {
    console.error('[Discord] Error sending edit webhook:', error)
    return false
  }
}

export async function sendOrderDeletionNotification(
  order: Order,
  previousStatus: string
): Promise<boolean> {
  if (!WEBHOOK_URL) return false

  const embed: any = {
    title: `🗑️ تم حذف الطلب #${String(order.order_number).padStart(4, '0')} نهائياً`,
    description: `⚠️ **تنبيه فوري للمطبخ:** قامت الإدارة بحذف هذا الطلب نهائياً من قاعدة البيانات. يرجى إلغاء أي تجهيز فوراً.`,
    color: 0x2C3E50, // Dark Slate
    fields: [
      { name: '📊 الحالة قبل الحذف', value: `\`${previousStatus}\``, inline: true },
      { name: '👤 العميل', value: order.customer_name, inline: true },
      { name: '📞 الهاتف', value: order.customer_phone, inline: true },
      { name: '💰 قيمة الطلب المحذوف', value: `${order.total_amount} ج`, inline: true },
      { name: '📍 العنوان', value: order.delivery_address, inline: false },
      { name: '🛒 محتويات الطلب المحذوف', value: formatItems(order.items), inline: false },
    ],
    footer: { text: 'نينجا برجر — إشعار حذف نهائي للطلب' },
    timestamp: new Date().toISOString(),
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })
    return response.ok
  } catch (error) {
    console.error('[Discord] Error sending deletion webhook:', error)
    return false
  }
}
