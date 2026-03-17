# TURN Server Setup (Self-Hosted Only – No 3rd Party)

When participants are on **different networks**, WebRTC needs a **TURN relay**. This app uses only **your own** TURN server (Coturn). No Metered or other 3rd party services.

---

## Not working on mobile or different WiFi?

If you see **ICE State: checking → disconnected → failed** and one device is on **mobile data** or **different WiFi**, the backend has no TURN server. In the browser console you’ll see something like: `ICE servers: 3 entries → 3 STUN, 0 TURN`. Fix: run Coturn (below), then on **Render → Your service → Environment** add `TURN_HOST`, `TURN_USERNAME`, `TURN_CREDENTIAL`, **Save** and **Redeploy**. After deploy, in the console you should see `X STUN, 2 TURN` (or similar). Then try the call again.

---

## Self-hosted TURN (Coturn)

1. **Deploy Coturn** on a server with a public IP (VPS, cloud VM, or a machine with port forwarding).
   - Ubuntu: `sudo apt install coturn`
   - Enable: `sudo sed -i 's/#TURN_LISTENING_PORT=3478/TURN_LISTENING_PORT=3478/' /etc/turnserver.conf`
   - Set long-term credentials and realm in `turnserver.conf` (see Coturn docs).

2. **Open ports** on the server and firewall:
   - **3478** UDP/TCP (TURN)
   - **49152–65535** UDP (relay range; or configure a smaller range in Coturn)

3. **Environment variables** on your **backend** (e.g. Render):

   ```env
   TURN_HOST=your-turn-server.com
   TURN_PORT=3478
   TURN_USERNAME=your_turn_user
   TURN_CREDENTIAL=your_turn_secret
   ```

   Or use `COTURN_*`:

   ```env
   COTURN_HOST=turn.yourdomain.com
   COTURN_PORT=3478
   COTURN_USERNAME=your_user
   COTURN_CREDENTIAL=your_secret
   ```

4. Restart your backend. The app uses **STUN + your TURN** only.

---

## Quick checklist

- [ ] TURN server has public IP and **3478** (+ relay ports) open.
- [ ] `TURN_HOST` (or `COTURN_HOST`) is the **hostname or IP** of the TURN server (no `turn://`).
- [ ] `TURN_USERNAME` and `TURN_CREDENTIAL` match Coturn (or your TURN) config.
- [ ] Backend restarted after changing env.
- [ ] Test with one user on your network and one on another (e.g. phone hotspot or different WiFi).

After this, **same system** and **other system** should both get working video and audio.
