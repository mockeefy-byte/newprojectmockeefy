# TURN Server Setup for Live Meetings (Video/Audio on "Other System")

When one user is on your machine and the other is on a **different system/network** (e.g. another PC, mobile, or different WiFi), WebRTC often cannot connect **peer-to-peer** because of NAT/firewalls. That causes **"Remote Connection: disconnected"** and no video/audio on the other side.

**Solution:** Use a **TURN relay server**. Traffic goes: You ↔ TURN server ↔ Other system. Same idea as Google Meet – your app stays yours; only the relay runs on your (or a) server.

---

## Option 1: Self-hosted TURN (Coturn) – recommended for "by own"

1. **Deploy Coturn** on a server with a public IP (e.g. same VPS as your backend or a small cloud VM).
   - Ubuntu: `sudo apt install coturn`
   - Enable: `sudo sed -i 's/#TURN_LISTENING_PORT=3478/TURN_LISTENING_PORT=3478/' /etc/turnserver.conf` (or your config path)
   - Set long-term credentials and realm in `turnserver.conf` (see Coturn docs).

2. **Open ports** on the server and (if any) cloud firewall:
   - **3478** UDP/TCP (TURN)
   - **49152–65535** UDP (relay range; or a smaller range and set in Coturn config)

3. **Environment variables** on your **backend** (e.g. Render, your Node server):

   ```env
   TURN_HOST=your-turn-server.com
   TURN_PORT=3478
   TURN_USERNAME=your_turn_user
   TURN_CREDENTIAL=your_turn_secret
   ```

   Or use the `COTURN_*` names:

   ```env
   COTURN_HOST=turn.mockeefy.com
   COTURN_PORT=3478
   COTURN_USERNAME=mockeefy
   COTURN_CREDENTIAL=your_secret
   ```

4. Restart your backend. The app will use **STUN + your TURN** so video/audio can work on the other system.

---

## Option 2: Metered (hosted TURN)

If you prefer a hosted service:

1. Sign up at [Metered](https://www.metered.ca/) (or similar) and get an API key.
2. Set in backend env:

   ```env
   METERED_API_KEY=your_metered_key
   ```

Your backend already supports Metered; if the key is set, it will add Metered TURN to the ICE server list. You can combine this with your own Coturn (self-hosted TURN is still used when configured).

---

## Quick checklist

- [ ] TURN server has public IP and **3478** (+ relay ports) open.
- [ ] `TURN_HOST` (or `COTURN_HOST`) is the **hostname or IP** of the TURN server (no `turn://`).
- [ ] `TURN_USERNAME` and `TURN_CREDENTIAL` match Coturn (or your TURN) config.
- [ ] Backend restarted after changing env.
- [ ] Test with one user on your network and one on another (e.g. phone hotspot or different WiFi).

After this, **same system** and **other system** should both get working video and audio.
