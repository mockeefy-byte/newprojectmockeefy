# Live meeting: what to do locally vs on Render

## Locally (your computer)

1. **Start the backend** (from project root):
   ```bash
   cd server && npm run dev
   ```
   Backend runs at `http://localhost:5000` (or your configured port).

2. **Start the frontend**:
   ```bash
   cd client && npm run dev
   ```
   Frontend runs at `http://localhost:5173` (or similar).

3. **Point the frontend to your local backend**  
   In `client/.env` (or `.env.local`):
   ```env
   VITE_API_URL=http://localhost:5000
   ```
   Restart the frontend after changing this.

4. **Test the meeting**  
   - Open the app in the browser, book/join a session, open the live meeting URL.  
   - **Same PC / same WiFi:** Video and audio usually work with **STUN only** (no TURN). You don’t need to do anything else.  
   - **Different network (e.g. phone on mobile data):** For that to work locally you’d need a TURN server (see below). For most local dev, testing on the same machine or same WiFi is enough.

**Summary (local):** Run backend + frontend, set `VITE_API_URL=http://localhost:5000`. Same network = usually works without TURN.

---

## On Render (production)

1. **Deploy the backend** on Render and set these env vars in **Render → Your service → Environment**:
   - `MONGODB_URI`
   - `GOOGLE_CLIENT_SECRET`
   - `JWT_SECRET`
   - `CLIENT_URL` or `FRONTEND_URL` (e.g. `https://www.mockeefy.com`)

2. **Point the frontend to Render**  
   On **Vercel** (or wherever the frontend is hosted), set:
   ```env
   VITE_API_URL=https://your-app-name.onrender.com
   ```
   No trailing slash, no `/api`. Then **redeploy** the frontend so the new value is used.

3. **Video/audio behaviour**
   - **Same network (e.g. two people on same WiFi):** Often works with STUN only. No extra step.
   - **Different networks (e.g. one on home WiFi, one on mobile data):** You need **your own TURN server** (Coturn). Render cannot run TURN (no UDP, no open ports for TURN).

4. **If you want it to work across different networks**
   - Run **Coturn** on a server that has a public IP (VPS, cloud VM, or home with port forwarding).  
   - In **Render → Environment**, add:
     ```env
     TURN_HOST=your-turn-server.com
     TURN_PORT=3478
     TURN_USERNAME=your_turn_user
     TURN_CREDENTIAL=your_turn_secret
     ```
   - Restart the backend on Render.  
   - Full steps: see **server/TURN_SETUP.md**.

**Summary (Render):** Backend on Render with env vars above. Frontend’s `VITE_API_URL` = your Render URL; redeploy frontend. For different networks, add your own Coturn and set `TURN_*` on Render.

---

## Quick reference

| Where you run        | What you do |
|----------------------|-------------|
| **Locally**          | Backend + frontend; `VITE_API_URL=http://localhost:5000`. Same-network testing works without TURN. |
| **Render (production)** | Backend env (MongoDB, JWT, etc.); frontend `VITE_API_URL` = Render URL; redeploy frontend. Same network often works; for different networks add Coturn and `TURN_*` on Render. |
| **TURN (optional)**  | Only if you need video/audio between **different networks**. Self-host Coturn, then set `TURN_HOST`, `TURN_USERNAME`, `TURN_CREDENTIAL` on the **backend** (local or Render). See **server/TURN_SETUP.md**. |
