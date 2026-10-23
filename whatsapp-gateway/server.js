const express = require('express')
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')
const QRCode = require('qrcode')
const path = require('path')
const fs = require('fs')

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000
const GATEWAY_SECRET = process.env.GATEWAY_SECRET || 'ninja-secret-key-2026'
const AUTH_DIR = path.join(__dirname, 'auth_info')

if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true })
}

let sock = null
let currentQrCodeDataUrl = null
let isConnected = false

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)

  sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      currentQrCodeDataUrl = await QRCode.toDataURL(qr)
      console.log('⚡ New QR code generated. Visit / to scan.')
    }

    if (connection === 'close') {
      isConnected = false
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Connection closed. Reconnecting...', shouldReconnect)
      if (shouldReconnect) {
        startWhatsApp()
      }
    } else if (connection === 'open') {
      isConnected = true
      currentQrCodeDataUrl = null
      console.log('✅ WhatsApp connection is active!')
    }
  })
}

startWhatsApp()

// Status and QR Code Dashboard for easy pairing
app.get('/', (req, res) => {
  if (isConnected) {
    return res.send(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <title>Ninja Burger WhatsApp Gateway</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: white; margin: 0; }
            .box { background: #1e293b; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            h1 { color: #22c55e; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>✅ البوت متصل وشغال بنجاح!</h1>
            <p>جاهز لإرسال كود التأكيد وإشعارات الطلبات لمطعم نينجا برجر.</p>
          </div>
        </body>
      </html>
    `)
  }

  if (currentQrCodeDataUrl) {
    return res.send(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <title>Link WhatsApp — Ninja Burger</title>
          <meta http-equiv="refresh" content="10">
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: white; margin: 0; }
            .box { background: #1e293b; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            img { margin: 20px 0; border-radius: 12px; background: white; padding: 10px; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>امسح الـ QR Code لربط واتساب المطعم</h2>
            <p>افتح واتساب في هاتفك ➔ الأجهزة المرتبطة ➔ ربط جهاز</p>
            <img src="${currentQrCodeDataUrl}" width="280" height="280" alt="WhatsApp QR Code" />
            <p style="color: #94a3b8; font-size: 13px;">تتحدث هذه الصفحة تلقائياً كل 10 ثوانٍ.</p>
          </div>
        </body>
      </html>
    `)
  }

  return res.send(`
    <html dir="rtl">
      <body style="background:#0f172a; color:white; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
        <div style="text-align:center;">
          <h3>جاري بدء تشغيل البوت وتوليد الـ QR Code...</h3>
          <p>أعد تحديث الصفحة بعد 5 ثوانٍ.</p>
        </div>
      </body>
    </html>
  `)
})

// API to send WhatsApp messages
app.post('/api/send', async (req, res) => {
  const authHeader = req.headers['x-gateway-secret']
  if (authHeader !== GATEWAY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!isConnected || !sock) {
    return res.status(503).json({ error: 'WhatsApp is not connected yet. Please scan the QR code at /.' })
  }

  const { to, message } = req.body
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing "to" or "message" parameter' })
  }

  try {
    // International WhatsApp JID format: e.g. 201008427736@s.whatsapp.net
    let cleanPhone = to.toString().replace(/[\s\-\(\)\+]/g, '')
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      cleanPhone = '2' + cleanPhone
    }
    const jid = `${cleanPhone}@s.whatsapp.net`

    await sock.sendMessage(jid, { text: message })
    return res.json({ success: true, jid })
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return res.status(500).json({ error: error.message || 'Failed to send message' })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
