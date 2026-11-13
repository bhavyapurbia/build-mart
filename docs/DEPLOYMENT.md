# BuildMart Production Deployment & Operations Manual

This runbook provides complete operational guidelines for deploying, securing, backing up, and maintaining the BuildMart platform in production.

---

## 1. System Topology & Prerequisites

```
[ Client Browsers / PWA ]
           │
           ▼
[ Cloudflare / Nginx (HTTPS, Brotli/Gzip, Cache) ]
     │                              │
     ▼ (:80/443)                    ▼ (:5000)
[ Frontend (Nginx SPA) ]       [ Backend API (Node.js Express) ]
                                    │               │
                                    ▼               ▼
                        [ MongoDB Atlas (Replica) ] [ Redis (Cache/Queue) ]
```

### Server Specifications
- **Minimum:** 2 vCPU, 4 GB RAM, 20 GB SSD (handles up to 500 concurrent users).
- **Recommended Production:** 4 vCPU, 8 GB RAM, 50 GB NVMe SSD.
- **Operating System:** Ubuntu 22.04 LTS / 24.04 LTS.

---

## 2. Environment Variables Configuration

Ensure all required production environment variables are configured. Refer to `backend/.env.example` and `frontend/.env.example`.

### Critical Production Variables

| Variable | Description | Requirement |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | **Required** |
| `PORT` | `5000` | **Required** |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/buildmart?retryWrites=true&w=majority` | **Required (MongoDB Atlas or Replica Set)** |
| `JWT_SECRET` | 64+ char random string (`openssl rand -hex 32`) | **Required (≥ 32 chars)** |
| `CLIENT_URL` | `https://buildmart.in,https://admin.buildmart.in` | **Required (CORS allowlist)** |
| `RAZORPAY_KEY_ID` | `rzp_live_xxxxxxxx` | **Required for payments** |
| `RAZORPAY_KEY_SECRET` | Live secret key from Razorpay dashboard | **Required for payments** |
| `RAZORPAY_WEBHOOK_SECRET` | Live webhook secret | **Required for webhook HMAC** |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name | **Required for uploads** |
| `CLOUDINARY_API_KEY` | Cloudinary API key | **Required for uploads** |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | **Required for uploads** |

---

## 3. Deployment Methods

### Option A: Docker Compose (Recommended)

1. Clone repository to server:
   ```bash
   git clone https://github.com/your-org/build-mart.git /opt/buildmart
   cd /opt/buildmart
   ```
2. Create `backend/.env` with production secrets:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your production credentials
   ```
3. Build and launch services:
   ```bash
   docker compose up -d --build
   ```
4. Verify container status & health:
   ```bash
   docker compose ps
   docker compose logs -f api
   ```

### Option B: VPS Deployment (Nginx + PM2)

1. **Install Node.js 22 LTS, PM2, and Nginx:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx
   sudo npm install -g pm2
   ```

2. **Deploy Backend:**
   ```bash
   cd /opt/buildmart/backend
   npm ci --omit=dev
   pm2 start src/server.js --name "buildmart-api" -i max
   pm2 start src/jobs/worker.js --name "buildmart-worker"
   pm2 save
   pm2 startup
   ```

3. **Build Frontend:**
   ```bash
   cd /opt/buildmart/frontend
   npm ci
   npm run build
   sudo cp -r dist/* /var/www/buildmart/
   ```

4. **Nginx Reverse Proxy Configuration:**
   Place configuration in `/etc/nginx/sites-available/buildmart`:
   ```nginx
   server {
       listen 80;
       server_name buildmart.in www.buildmart.in;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name buildmart.in www.buildmart.in;

       ssl_certificate /etc/letsencrypt/live/buildmart.in/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/buildmart.in/privkey.pem;

       root /var/www/buildmart;
       index index.html;

       location /assets/ {
           expires 1y;
           add_header Cache-Control "public, max-age=31536000, immutable";
       }

       location /api/ {
           proxy_pass http://127.0.0.1:5000/api/;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
   Enable site and test:
   ```bash
   sudo ln -s /etc/nginx/sites-available/buildmart /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

---

## 4. Razorpay Live Checklist

Before switching from Test to Live mode:

1. **Activate Live Account:** Complete KYC on the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. **Generate Live Keys:** Navigate to *Settings → API Keys* and generate Key ID & Secret.
3. **Register Live Webhook:**
   - Webhook URL: `https://api.buildmart.in/api/payments/webhook`
   - Secret: Generate a strong secret and set as `RAZORPAY_WEBHOOK_SECRET`.
   - Subscribed Events:
     - `order.paid`
     - `payment.authorized`
     - `payment.captured`
     - `payment.failed`
     - `refund.processed`
4. **Test Live Small Transaction:** Run a ₹1 transaction to verify end-to-end webhook receipt and state transition to `Confirmed`.

---

## 5. Database Backup & Disaster Recovery

### Automated Daily Backup Script (`/opt/scripts/backup-db.sh`)

```bash
#!/bin/bash
set -e

BACKUP_DIR="/var/backups/mongodb"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MONGODB_URI="${MONGODB_URI}"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting MongoDB dump..."
mongodump --uri="$MONGODB_URI" --gzip --archive="$BACKUP_DIR/buildmart_$TIMESTAMP.archive"

# Retain backups for 14 days, delete older
find "$BACKUP_DIR" -type f -name "buildmart_*.archive" -mtime +14 -delete
echo "[$(date)] Backup completed: buildmart_$TIMESTAMP.archive"
```

Configure via crontab (`crontab -e`):
```cron
0 2 * * * /opt/scripts/backup-db.sh >> /var/log/mongodb-backup.log 2>&1
```

### Database Restore Procedure

To restore from an archive backup:
```bash
mongorestore --uri="$MONGODB_URI" --gzip --archive="/var/backups/mongodb/buildmart_YYYYMMDD_HHMMSS.archive" --drop
```

---

## 6. Zero-Downtime Rollback Procedure

If a deployed release introduces critical issues:

1. **Docker Deployment:**
   ```bash
   # Checkout previous known stable tag/commit
   git checkout v1.0.0
   docker compose build
   docker compose up -d --no-deps api web
   ```
2. **PM2 Deployment:**
   ```bash
   git checkout v1.0.0
   cd backend && npm ci --omit=dev
   pm2 reload buildmart-api --update-env
   ```
3. **Database Migrations Rollback:**
   - If a migration was run, execute data rollback script `node backend/src/scripts/migrate.js --rollback`.

