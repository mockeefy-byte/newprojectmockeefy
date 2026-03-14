# Environment setup â€“ Vercel (frontend) & Render (backend)

Use this so the app and **live meetings (GMeet-style)** work in production.

---

## 1. Vercel (frontend â€“ e.g. mockeefy.com)

Set these in **Vercel â†’ Your project â†’ Settings â†’ Environment Variables**.  
Apply to **Production** (and Preview if you want).

| Variable | Value | Required |
|----------|--------|----------|
| `VITE_API_URL` | Your **Render backend URL**, no trailing slash. Example: `https://newprojectmockeefy.onrender.com` | **Yes** â€“ for API and **sockets** (live meeting) |
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth client ID (Web client) | Yes (for login) |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key (live/test) | Only if you use payment page |

**Important:** After changing any `VITE_*` variable, **redeploy** the frontend on Vercel so the new values are baked into the build.

---

## 2. Render (backend â€“ Node server)

Set these in **Render â†’ Your backend service â†’ Environment**.

| Variable | Example | Required |
|----------|---------|----------|
| `MONGODB_URI` | `mongodb+srv://...` | Yes |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | Yes (for login) |
| `JWT_SECRET` | Any long random string | Yes |
| `CLIENT_URL` or `FRONTEND_URL` | `https://www.mockeefy.com` | Recommended (CORS) |
| (Optional) `TURN_HOST`, `TURN_USERNAME`, `TURN_CREDENTIAL` | Your Coturn server | For video on different networks (self-hosted only) |

---

## 3. Why it was working and then stopped

- **Frontend (Vercel):** If `VITE_API_URL` is wrong or missing, the browser calls the wrong backend and **sockets donâ€™t connect** â†’ live meeting shows â€œdisconnectedâ€.
- **Backend (Render):** If the backend URL or CORS origins changed, or the service is sleeping, the frontend canâ€™t reach it.

**Check:**

1. **Vercel:** `VITE_API_URL` = exact Render URL (e.g. `https://newprojectmockeefy.onrender.com`), no `/api`, no trailing slash.
2. **Render:** In CORS, your frontend origin (e.g. `https://www.mockeefy.com`) is allowed (already in `server.js` for mockeefy.com).
3. **Redeploy:** After changing env on Vercel, trigger a new deploy so the client bundle gets the new `VITE_API_URL`.

---

## 4. Sockets and â€œGMeet-likeâ€

- **Sockets (Socket.io)** are already used for **signaling** (who is in the room, offer/answer, ICE candidates). Thatâ€™s why `VITE_API_URL` must point to your Render backend.
- **Video/audio** use **WebRTC** (peer-to-peer or via TURN). So:
  - **Same network:** Correct `VITE_API_URL` + backend running â†’ usually works.
  - **Other system / different network:** Same + **TURN** (e.g. Metered or Coturn) â†’ needed for reliable â€œGMeet-likeâ€ behaviour. See `server/TURN_SETUP.md`.

---

## 5. Quick checklist

- [ ] **Vercel:** `VITE_API_URL` = your Render backend URL (no trailing slash).
- [ ] **Vercel:** `VITE_GOOGLE_CLIENT_ID` set.
- [ ] **Vercel:** Redeploy after any env change.
- [ ] **Render:** `MONGODB_URI`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET` set.
- [ ] **Render:** `CLIENT_URL` or `FRONTEND_URL` = your frontend URL (e.g. `https://www.mockeefy.com`).
- [ ] For **other device/network** video: add your own TURN (Coturn) â€“ see `server/TURN_SETUP.md`.

---

## 6. "Remote Connection: disconnected" on production

If the meeting loads but **video/audio never connect** and you see **"Remote Connection: disconnected"**:

1. **Backend URL:** In Vercel, `VITE_API_URL` must be exactly your Render backend URL (e.g. `https://newprojectmockeefy.onrender.com`). Redeploy the frontend after changing it.
2. **Render cold start:** On free tier, the first request can take 30â€“60 seconds. The app waits up to 25s for TURN credentials. If the first load times out, refresh and try again once Render has woken.
3. **TURN required for production:** When the two participants are on different networks, WebRTC needs a **TURN relay**. Use your own Coturn server (no 3rd party). On the server set `TURN_HOST`, `TURN_USERNAME`, `TURN_CREDENTIAL`. See **server/TURN_SETUP.md**.
4. **Retry:** Use "Retry Connection" in the meeting; after adding TURN, restart the backend and retry.
