# WhatsApp Gateway Service for Ninja Burger 🥷

This is a standalone, lightweight Node.js gateway that connects to WhatsApp Web via the open-source **Baileys** library.
It runs **100% free** on cloud platforms like **Render.com**, **Koyeb**, or **Railway**.

---

## ⚡ What it Does
1. **Automated Customer OTP Delivery:** Receives requests from the Ninja Burger website and immediately sends the 4-digit code to the customer's WhatsApp with a 5-minute timeout notice.
2. **Instant Kitchen Order Alerts:** Whenever an order is placed, it automatically sends a detailed formatted order receipt straight to the restaurant's kitchen/manager WhatsApp number.

---

## 🚀 How to Deploy on Render.com (100% Free Forever)

### Step 1: Push this directory to a new GitHub repo
1. Create a new repository on your GitHub (e.g. `ninja-whatsapp-bot`).
2. Copy the files inside `whatsapp-gateway/` into it and push to GitHub.

### Step 2: Deploy on Render
1. Go to [dashboard.render.com](https://dashboard.render.com) and click **"New +"** ➔ **"Web Service"**.
2. Select your `ninja-whatsapp-bot` GitHub repo.
3. Configure the service:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Add these **Environment Variables**:
   - `PORT`: `3000`
   - `GATEWAY_SECRET`: `ninja-secret-key-2026` (or any custom secret key)
5. Click **"Create Web Service"**.

### Step 3: Link WhatsApp (Scan QR Code Once)
1. Once Render finishes deploying, open your service URL in the browser (e.g. `https://ninja-whatsapp-bot.onrender.com/`).
2. You will see an active **WhatsApp QR Code** on screen.
3. Open WhatsApp on your restaurant phone ➔ **Settings / Linked Devices** ➔ **Link a Device** ➔ Scan the QR Code.
4. The page will display: **`✅ WhatsApp is Connected and Active!`**.
   *The authentication credentials are saved into the cloud session, so it reconnects automatically even if the container restarts.*

### Step 4: Connect with Ninja Burger
In your **Ninja Burger project settings on Vercel**, add these environment variables:
- `WHATSAPP_GATEWAY_URL`: `https://ninja-whatsapp-bot.onrender.com`
- `WHATSAPP_GATEWAY_SECRET`: `ninja-secret-key-2026`
- `RESTAURANT_KITCHEN_PHONE`: `201008427736`
