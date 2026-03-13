# Environment setup – Vercel (frontend) & Render (backend)

Use this so the app and **live meetings (GMeet-style)** work in production.

---

## 1. Vercel (frontend – e.g. mockeefy.com)

Set these in **Vercel → Your project → Settings → Environment Variables**.  
Apply to **Production** (and Preview if you want).

| Variable | Value | Required |
|----------|--------|----------|
| `VITE_API_URL` | Your **Render backend URL**, no trailing slash. Example: `https://newprojectmockeefy.onrender.com` | **Yes** – for API and **sockets** (live meeting) |
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth client ID (Web client) | Yes (for login) |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key (live/test) | Only if you use payment page |

**Important:** After changing any `VITE_*` variable, **redeploy** the frontend on Vercel so the new values are baked into the build.

---

## 2. Render (backend – Node server)

Set these in **Render → Your backend service → Environment**.

| Variable | Example | Required |
|----------|---------|----------|
| `MONGODB_URI` | `mongodb+srv://...` | Yes |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | Yes (for login) |
| `JWT_SECRET` | Any long random string | Yes |
| `CLIENT_URL` or `FRONTEND_URL` | `https://www.mockeefy.com` | Recommended (CORS) |
| (Optional) `METERED_API_KEY` | From metered.ca | For video on “other system” / different network |
| (Optional) `TURN_HOST`, `TURN_USERNAME`, `TURN_CREDENTIAL` | Your Coturn server | Alternative to Metered for “other system” |

---

## 3. Why it was working and then stopped

- **Frontend (Vercel):** If `VITE_API_URL` is wrong or missing, the browser calls the wrong backend and **sockets don’t connect** → live meeting shows “disconnected”.
- **Backend (Render):** If the backend URL or CORS origins changed, or the service is sleeping, the frontend can’t reach it.

**Check:**

1. **Vercel:** `VITE_API_URL` = exact Render URL (e.g. `https://newprojectmockeefy.onrender.com`), no `/api`, no trailing slash.
2. **Render:** In CORS, your frontend origin (e.g. `https://www.mockeefy.com`) is allowed (already in `server.js` for mockeefy.com).
3. **Redeploy:** After changing env on Vercel, trigger a new deploy so the client bundle gets the new `VITE_API_URL`.

---

## 4. Sockets and “GMeet-like”

- **Sockets (Socket.io)** are already used for **signaling** (who is in the room, offer/answer, ICE candidates). That’s why `VITE_API_URL` must point to your Render backend.
- **Video/audio** use **WebRTC** (peer-to-peer or via TURN). So:
  - **Same network:** Correct `VITE_API_URL` + backend running → usually works.
  - **Other system / different network:** Same + **TURN** (e.g. Metered or Coturn) → needed for reliable “GMeet-like” behaviour. See `server/TURN_SETUP.md`.

---

## 5. Quick checklist

- [ ] **Vercel:** `VITE_API_URL` = your Render backend URL (no trailing slash).
- [ ] **Vercel:** `VITE_GOOGLE_CLIENT_ID` set.
- [ ] **Vercel:** Redeploy after any env change.
- [ ] **Render:** `MONGODB_URI`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET` set.
- [ ] **Render:** `CLIENT_URL` or `FRONTEND_URL` = your frontend URL (e.g. `https://www.mockeefy.com`).
- [ ] For **other device/network** video: add TURN (Metered or Coturn) on Render – see `server/TURN_SETUP.md`.
