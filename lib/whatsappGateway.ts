/**
 * WhatsApp Gateway Client
 * Communicates with the free cloud-hosted Baileys gateway to send
 * direct automated WhatsApp messages (OTPs and Kitchen Order Alerts)
 */

interface SendMessagePayload {
  to: string // Egyptian phone number: 010... or 2010...
  message: string
}

const GATEWAY_URL = process.env.WHATSAPP_GATEWAY_URL?.replace(/\/$/, '')
const GATEWAY_SECRET = process.env.WHATSAPP_GATEWAY_SECRET || 'ninja-secret-key-2026'

/**
 * Normalizes phone to international format without plus sign:
 * 01008427736 -> 201008427736
 */
export function formatPhoneForWhatsApp(phone: string): string {
  let clean = phone.replace(/[\s\-\(\)\+]/g, '')
  if (clean.startsWith('0020')) clean = clean.slice(2)
  else if (clean.startsWith('01') && clean.length === 11) clean = '2' + clean
  return clean
}

/**
 * Sends a message via the external WhatsApp Gateway bot.
 * Returns true if successful, false otherwise.
 */
export async function sendWhatsAppMessage({ to, message }: SendMessagePayload): Promise<boolean> {
  if (!GATEWAY_URL) {
    console.warn('[WhatsApp Gateway] WHATSAPP_GATEWAY_URL is not set in environment.')
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
      // Set reasonable timeout
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
 * Sends a 4-digit verification code with 5-minute timeout notice
 */
export async function sendVerificationOtp(phone: string, code: string): Promise<boolean> {
  const message = `🍔 نينجا برجر (Ninja Burger)\n\nرمز التحقق الخاص بك هو: *${code}*\n\n⏱️ هذا الرمز صالح لمدة 5 دقائق فقط.\nيرجى عدم مشاركة الرمز مع أي شخص.`
  return sendWhatsAppMessage({ to: phone, message })
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
    `📞 *الهاتف:* ${order.customer_phone} ${order.is_phone_verified ? '✅ (موثق)' : '⚠️ (غير موثق)'}\n` +
    `📍 *العنوان:* ${order.delivery_address}\n` +
    `${order.notes ? `📝 *ملاحظات:* ${order.notes}\n` : ''}` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `🛒 *الطلبات:*\n${itemsList}\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *الإجمالي المطلوب:* *${order.total_amount} ج* (كاش عند الاستلام)`

  return sendWhatsAppMessage({ to: KITCHEN_PHONE, message })
}
