# MongoDB Atlas – Fix "Network error" / "querySrv ECONNREFUSED"

---

## If you already added 0.0.0.0/0 and it still fails

**querySrv ECONNREFUSED** means the **DNS lookup** for Atlas is failing (your network or firewall is blocking it). IP whitelist is not the problem.

### Fix: Use the Standard connection string (no SRV)

1. In **MongoDB Atlas** go to **Database** → click **Connect** on your cluster (**Cluster0**).
2. Choose **"Drivers"** (or "Connect your application").
3. Select **Node.js** and copy the connection string.
4. If you see an option like **"Use standard connection string"** or **"Connection string only"**, use that. Otherwise get the **standard** format:
   - In the Connect modal, look for a link or option that says **"Edit"** or **"I have a connection string"** or **"Standard connection string"**.
   - Or: Atlas → your cluster → **Connect** → **Connect using MongoDB Compass** or **Drivers** → sometimes the standard string is shown as an alternative (it starts with `mongodb://` and has multiple hostnames like `ac-xxx-shard-00-00.w4nf7cn.mongodb.net:27017,...`).
5. The **standard** string looks like:
   ```text
   mongodb://mockeefy_db_user:PASSWORD@ac-xxxxx-shard-00-00.w4nf7cn.mongodb.net:27017,ac-xxxxx-shard-00-01.w4nf7cn.mongodb.net:27017,ac-xxxxx-shard-00-02.w4nf7cn.mongodb.net:27017/mockeefy?ssl=true&authSource=admin&replicaSet=atlas-xxxxx
   ```
   Replace `PASSWORD` with your real DB password. Make sure the database path is `/mockeefy`.
6. Put this **whole string** in `server/.env` as **MONGO_URI** (replace the current `mongodb+srv://...` line).
7. Restart your server.

### Other checks

- **VPN / corporate network**: Try turning VPN off, or try from home/mobile hotspot.
- **Firewall / antivirus**: Allow Node.js (or your terminal/IDE) to access the internet.
- **Cluster name**: Confirm the cluster host in Atlas is really `cluster0.w4nf7cn.mongodb.net` (Cluster0 in the project you’re using).

---

## IP whitelist (if you see "IP not allowed" only)

Your app cannot reach Atlas until your IP (or your server’s IP) is allowed in **Network Access**.

### Step 1: Open Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and log in.
2. Select your project (the one that has **Cluster0**).
3. In the left sidebar, click **Network Access** (under "Security").

---

## Step 2: Allow your IP (or all IPs for dev)

### Option A – Allow only your current IP (recommended for your PC)

1. Click **"+ ADD IP ADDRESS"**.
2. Click **"ADD CURRENT IP ADDRESS"** so your current IP is filled in.
3. (Optional) Add a comment, e.g. `My PC`.
4. Click **"Confirm"**.

Your current machine can now connect. If your home/office IP changes, add the new IP the same way.

### Option B – Allow from anywhere (for dev / Render, etc.)

1. Click **"+ ADD IP ADDRESS"**.
2. Click **"ALLOW ACCESS FROM ANYWHERE"**.
3. This sets the address to **`0.0.0.0/0`** (any IP).
4. Click **"Confirm"**.

Use this if you deploy to Render/Heroku etc., or to test quickly. You can remove it later for production.

---

## Step 3: Wait and restart

- Atlas may take **1–2 minutes** to apply the new rule.
- Restart your Node server (e.g. stop and run `npm run dev` again).

---

## Step 4: If it still fails

- Confirm **MONGO_URI** in `server/.env` is correct (user, password, cluster, database name `mockeefy`).
- Confirm the Atlas user **mockeefy_db_user** exists and has access to the cluster.
- If you’re on a company/school network, a firewall might block MongoDB; try from another network or use a VPN.
- Ensure the cluster is running (Atlas dashboard → your cluster → no “Paused” state).
