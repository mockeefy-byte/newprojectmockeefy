# WebRTC + Socket.io Production Debugging (Render + Vercel)

Use this when the app works locally but fails in production (e.g. "Remote Connection: disconnected", socket never connects, or no video/audio).

---

## 1. STUN + TURN in RTCPeerConnection

**What we do:** The frontend fetches ICE servers from `GET /api/meetings/turn-credentials`. The backend returns STUN (always) + your self-hosted TURN (when `TURN_HOST`, `TURN_USERNAME`, `TURN_CREDENTIAL` are set).

**Check:**
- Open DevTools → Network. Find the request to `turn-credentials`. Response should be a JSON array of `{ urls: "stun:..." }` and, in production, `{ urls: ["turn:..."], username, credential }`.
- In Console you should see: `[WebRTC] Loaded ICE servers: N (includes TURN)` or `(STUN only – add TURN for production)`.
- If the request fails or times out (e.g. Render cold start), the client falls back to STUN-only; add a longer timeout or retry (already 25s in prod).

**Common mistake:** Deploying without TURN. Same WiFi often works with STUN; different networks need TURN. Set Coturn env vars on Render (see `server/TURN_SETUP.md`).

---

## 2. Socket.io Signaling (offer, answer, ICE)

**Backend (Render):** `server/websocket/signaling.js` handles:
- `join-room` → join Socket room, emit `both-ready` when expert + candidate are in the room.
- `offer` / `answer` / `ice-candidate` → forward to the other peer in the same room.

**Frontend:** `useSignaling` connects to `SOCKET_URL` (same as `API_BASE_URL`), then:
- On `connect` → emit `join-room` with `{ meetingId, role, userId }`.
- On `both-ready` → expert creates offer, sends via `offer`; candidate gets offer, creates answer, sends via `answer`; both send `ice-candidate` as they’re gathered.

**Check:**
- Console: `[useSignaling] Socket connected, id: ...` and `[useSignaling] Both ready – starting WebRTC`.
- If you never see "Socket connected", the frontend is not reaching the backend (wrong URL or CORS).
- If you see "Socket connected" but never "Both ready", the second user didn’t join the same `meetingId` or backend didn’t emit `both-ready` (check Render logs for `[Signaling]`).
- If you see "Both ready" but ICE stays `checking` then `failed`, the problem is network/firewall/TURN (see section 3).

**Common mistake:** `VITE_API_URL` on Vercel pointing to the wrong URL (typo, old URL, or with `/api` suffix). It must be the exact Render backend URL with no trailing slash (e.g. `https://yourapp.onrender.com`). Redeploy Vercel after changing env vars.

---

## 3. Connection Across Different Networks

**Why it fails:** WebRTC tries direct peer-to-peer first (STUN). Across different networks (e.g. one on home WiFi, one on mobile data), direct connection often fails; a TURN relay is required.

**What we do:** Backend builds ICE server list with STUN + your Coturn TURN. The client uses that list in `RTCPeerConnection({ iceServers })`.

**Check:**
- Render env: `TURN_HOST`, `TURN_USERNAME`, `TURN_CREDENTIAL` (or `COTURN_*`) set and correct.
- Coturn running on a host with a public IP; ports 3478 (UDP/TCP) and relay range (e.g. 49152–65535 UDP) open.
- In browser console: `[WebRTC] ICE failed – check TURN server and firewall` means ICE gave up; verify TURN from the step above and test from two different networks.

**Common mistake:** No TURN configured in production, or TURN host not reachable from the internet (firewall/security group blocking UDP).

---

## 4. Connection State Logs (connected / failed)

**Where:** Browser console and in-app.

- **Console:** `[WebRTC] ICE state: new | checking | connected | completed | failed | disconnected` and `[WebRTC] Connection state: new | connecting | connected | failed`.
- **UI:** On the remote video tile, hover to see "Connected" (green) or "Connection: checking|failed|disconnected". Status bar shows "Live" when ICE is connected/completed, "Connection Lost" when failed/disconnected.

**Check:** If state stays `checking` then goes `failed`, see section 3 (TURN/network). If socket never connects, see section 2 (signaling URL/CORS).

---

## 5. Video Quality (720p)

**What we do:** `getUserMedia` and screen share use:
- Video: `width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 24, max: 30 }`.
- Console logs actual resolution after start: `[WebRTC] Local media started: W x H`.

**Check:** If quality is low, ensure the device supports 720p and no other app is limiting the camera; check Console for the logged resolution.

---

## 6. HTTPS / Secure Context

**What we do:** `getUserMedia` and WebRTC require a secure context (HTTPS or localhost). We:
- Pass `secure: true` to Socket.io when the page is loaded over HTTPS.
- In production, if `!window.isSecureContext`, we show a message: "Video calls require a secure connection – open over HTTPS."

**Check:** In production, always use `https://www.mockeefy.com` (or your HTTPS domain). If you open the site over HTTP, camera/mic will not work and we show the warning.

---

## Common Render Deployment Mistakes

| Mistake | Symptom | Fix |
|--------|---------|-----|
| Wrong or missing `VITE_API_URL` on Vercel | Socket never connects; "Socket Error" or timeout | Set `VITE_API_URL` to Render URL (no `/api`, no trailing slash). Redeploy Vercel. |
| CORS blocking Socket | Socket `connect_error` with CORS in message | Add your Vercel domain to `allowedOrigins` in `server.js` and Socket.io `cors`. |
| Backend sleeping (free tier) | First request (e.g. turn-credentials) times out; ICE stays STUN-only | Increase client timeout (we use 25s); or use a paid instance so the server doesn’t sleep. |
| No TURN in production | ICE `failed` when peers on different networks | Run Coturn on a VPS; set `TURN_HOST`, `TURN_USERNAME`, `TURN_CREDENTIAL` on Render. |
| TURN host not reachable | ICE still fails with TURN set | Ensure Coturn has public IP; open 3478 UDP/TCP and relay UDP range; test with `telnet TURN_HOST 3478`. |
| Frontend not redeployed after env change | Old `VITE_API_URL` in bundle | In Vercel, trigger a new deployment after changing any `VITE_*` variable. |

---

## Quick Checklist

1. **Vercel:** `VITE_API_URL` = Render backend URL; redeploy after change.
2. **Render:** Required env vars set (e.g. `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`); for cross-network video add `TURN_HOST`, `TURN_USERNAME`, `TURN_CREDENTIAL`.
3. **Coturn:** Running and reachable; ports open; credentials match env.
4. **Browser:** Use HTTPS in production; allow camera/mic when prompted.
5. **Console:** Confirm "[useSignaling] Socket connected", "[WebRTC] Loaded ICE servers" with TURN in prod, and "[WebRTC] ICE connected" when the call works.
