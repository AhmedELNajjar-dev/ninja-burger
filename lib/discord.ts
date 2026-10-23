import { Order, OrderItemSnapshot, SIZE_LABELS } from '@/types'

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL!

function formatItems(items: OrderItemSnapshot[]): string {
  return items
    .map((item) => {
      const sizeLabel = SIZE_LABELS[item.size]
      const addonStr = item.addons.length > 0
        ? ` (+${item.addons.map(a => a.name_ar).join(', ')})`
        : ''
      return `• ${item.quantity}x ${item.name_ar} (${sizeLabel})${addonStr} — ${item.lineTotal} ج`
    })
    .join('\n')
}

export async function sendOrderNotification(order: Order): Promise<boolean> {
  if (!WEBHOOK_URL) {
    console.warn('[Discord] DISCORD_WEBHOOK_URL is not set — skipping notification.')
    return false
  }

  const firstTimerTag = order.is_first_order ? ' ⚠️ [عميل جديد — أول طلب]' : ' ⭐ [عميل سابق]'

  const embed: any = {
    title: `🍔 طلب جديد #${String(order.order_number).padStart(4, '0')}${firstTimerTag}`,
    color: order.is_first_order ? 0xF5A623 : 0xCC1F1A, // Yellow if new customer, Red if repeat
    fields: [
      { name: '👤 العميل', value: order.customer_name, inline: true },
      { name: '📞 الهاتف', value: `${order.customer_phone} (${order.is_first_order ? 'يرجى الاتصال للتأكيد 📞' : 'عميل موثوق'})`, inline: true },
      { name: '\u200b', value: '\u200b', inline: true }, // spacer
      { name: '📍 عنوان التوصيل', value: order.delivery_address, inline: false },
      { name: '🛒 الطلبات', value: formatItems(order.items), inline: false },
      { name: '💰 الإجمالي', value: `${order.total_amount} ج`, inline: true },
      { name: '💳 الدفع', value: 'كاش عند الاستلام', inline: true },
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
