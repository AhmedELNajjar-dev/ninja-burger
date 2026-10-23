/**
 * WhatsApp Gateway Client
 * Sends direct automated WhatsApp messages (Kitchen Order Alerts)
 * to the restaurant's phone number without any risk of customer spam/bans.
 */

interface SendMessagePayload {
  to: string // 2010...
  message: string
}

const GATEWAY_URL = process.env.WHATSAPP_GATEWAY_URL?.replace(/\/$/, '')
const GATEWAY_SECRET = process.env.WHATSAPP_GATEWAY_SECRET || 'ninja-secret-key-2026'

export function formatPhoneForWhatsApp(phone: string): string {
  let clean = phone.replace(/[\s\-\(\)\+]/g, '')
  if (clean.startsWith('0020')) clean = clean.slice(2)
  else if (clean.startsWith('01') && clean.length === 11) clean = '2' + clean
  return clean
}

export async function sendWhatsAppMessage({ to, message }: SendMessagePayload): Promise<boolean> {
  if (!GATEWAY_URL) {
    console.warn('[WhatsApp Gateway] WHATSAPP_GATEWAY_URL is not set — skipping WhatsApp alert.')
    return false
  }

  const normalizedTo = formatPhoneForWhatsApp(to)

  try {
    const res = await fetch(`${GATEWAY_URL}/api/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gateway-secret': GATEWAY_SECRET,
      },
      body: JSON.stringify({
        to: normalizedTo,
        message,
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[WhatsApp Gateway] Failed to send message:', res.status, err)
      return false
    }

    return true
  } catch (error) {
    console.error('[WhatsApp Gateway] Network or timeout error:', error)
    return false
  }
}

/**
 * Sends an instant Kitchen Order Notification to the restaurant manager/kitchen WhatsApp
 */
export async function sendKitchenOrderAlert(order: any): Promise<boolean> {
  const KITCHEN_PHONE = process.env.RESTAURANT_KITCHEN_PHONE || '201008427736'

  const itemsList = order.items
    ?.map((i: any) => `• ${i.quantity}x ${i.name_ar} (${i.size}) — ${i.lineTotal} ج`)
    ?.join('\n') || ''

  const message = `🔔 *طلب جديد #${String(order.order_number).padStart(4, '0')}*\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *العميل:* ${order.customer_name}\n` +
    `📞 *الهاتف:* ${order.customer_phone}\n` +
    `📍 *العنوان:* ${order.delivery_address}\n` +
    `${order.notes ? `📝 *ملاحظات:* ${order.notes}\n` : ''}` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `🛒 *الطلبات:*\n${itemsList}\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *الإجمالي المطلوب:* *${order.total_amount} ج* (كاش عند الاستلام)`

  return sendWhatsAppMessage({ to: KITCHEN_PHONE, message })
}
