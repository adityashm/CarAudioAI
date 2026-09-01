# DigitalOcean Deployment Guide

## Prerequisites

- [x] DigitalOcean account with $200 student credit
- [x] Domain from Namecheap (free .me domain)
- [x] SSH key generated locally

## Step 1: Create Droplet (Backend Server)

### A. Create Droplet via Web Interface

```
1. Go to: https://cloud.digitalocean.com/droplets/new
2. Choose an image: Ubuntu 22.04 (LTS) x64
3. Choose a plan: Basic ($6/month)
   - Regular Intel
   - 1 GB RAM / 1 vCPU
   - 25 GB SSD
   - 1000 GB transfer
4. Choose datacenter region: Bangalore 1 (BLR1)
5. Authentication: SSH Key (upload your public key)
6. Hostname: caraudioai-backend
7. Click "Create Droplet"
```

**Note your droplet IP**: `xxx.xxx.xxx.xxx`

### B. Initial Server Setup

```bash
# SSH into droplet
ssh root@xxx.xxx.xxx.xxx

# Update system
apt update && apt upgrade -y

# Install Python 3.10+
apt install python3.10 python3-pip python3-venv -y

# Install PostgreSQL client (for connecting to managed DB)
apt install postgresql-client -y

# Install Nginx (reverse proxy)
apt install nginx -y

# Install Git
apt install git -y

# Install supervisor (process manager)
apt install supervisor -y
```

## Step 2: Create Managed PostgreSQL Database

### A. Create Database via Web Interface

```
1. Go to: https://cloud.digitalocean.com/databases/new
2. Choose database engine: PostgreSQL 15
3. Choose datacenter: Bangalore 1 (BLR1)
4. Choose a plan: Basic ($15/month)
   - 1 GB RAM
   - 10 GB disk
   - 1 standby node
5. Database name: caraudio-prod
6. Click "Create Database Cluster"
```

### B. Get Connection Details

After creation, note:
- **Host**: `db-postgresql-blr1-xxxxx.db.ondigitalocean.com`
- **Port**: `25060`
- **Username**: `doadmin`
- **Password**: (shown once, save it!)
- **Database**: `caraudio_prod`
- **SSL Mode**: `require`

**Connection String**:
```
postgresql://doadmin:PASSWORD@db-postgresql-blr1-xxxxx.db.ondigitalocean.com:25060/caraudio_prod?sslmode=require
```

## Step 3: Create Spaces (File Storage)

### A. Create Space

```
1. Go to: https://cloud.digitalocean.com/spaces
2. Click "Create Space"
3. Choose datacenter: Bangalore 1
4. Enable CDN: Yes (optional, for faster delivery)
5. Space name: caraudio-files
6. Click "Create Space"
```

### B. Generate Spaces Keys

```
1. Go to: API → Spaces Keys
2. Click "Generate New Key"
3. Name: caraudioai-backend
4. Note Access Key and Secret Key (save them!)
```

**Endpoint**: `https://blr1.digitaloceanspaces.com`

## Step 4: Deploy Application

### A. Setup Application Directory

```bash
# On your droplet (SSH)
cd /var/www
git clone https://github.com/YOUR_USERNAME/CarAudioAI.git caraudioai
cd caraudioai/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### B. Create Environment File

```bash
# Create .env file
nano /var/www/caraudioai/backend/.env
```

Paste your configuration:
```env
ENVIRONMENT=production
DEBUG=False

# DigitalOcean PostgreSQL
DATABASE_URL=postgresql://doadmin:YOUR_PASSWORD@db-postgresql-blr1-xxxxx.db.ondigitalocean.com:25060/caraudio_prod?sslmode=require

# Security
SECRET_KEY=generate-with-openssl-rand-hex-32
ALGORITHM=HS256

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxx

# DigitalOcean Spaces
SPACES_REGION=blr1
SPACES_ENDPOINT=https://blr1.digitaloceanspaces.com
SPACES_KEY=your_access_key
SPACES_SECRET=your_secret_key
SPACES_BUCKET=caraudio-files

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret

# Sentry
SENTRY_DSN=https://xxxxx@sentry.io/xxxxxx
SENTRY_ENVIRONMENT=production
```

Save and exit (Ctrl+X, Y, Enter)

### C. Test Application

```bash
# Activate venv
source venv/bin/activate

# Test run
cd /var/www/caraudioai/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# If successful, stop with Ctrl+C
```

## Step 5: Setup Systemd Service

### A. Create Service File

```bash
sudo nano /etc/systemd/system/caraudioai.service
```

Paste:
```ini
[Unit]
Description=CarAudioAI FastAPI Backend
After=network.target

[Service]
Type=notify
User=root
WorkingDirectory=/var/www/caraudioai/backend
Environment="PATH=/var/www/caraudioai/backend/venv/bin"
ExecStart=/var/www/caraudioai/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always

[Install]
WantedBy=multi-user.target
```

Save and exit.

### B. Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Start service
sudo systemctl start caraudioai

# Enable on boot
sudo systemctl enable caraudioai

# Check status
sudo systemctl status caraudioai
```

## Step 6: Setup Nginx Reverse Proxy

### A. Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/caraudioai
```

Paste:
```nginx
server {
    listen 80;
    server_name api.caraudioai.me;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save and exit.

### B. Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/caraudioai /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 7: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.caraudioai.me

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 8: Configure Domain (Namecheap)

### A. Point Domain to Droplet

```
1. Go to Namecheap dashboard
2. Manage domain: caraudioai.me
3. Advanced DNS
4. Add A Records:

Type    Host    Value                   TTL
A       @       xxx.xxx.xxx.xxx        Automatic
A       api     xxx.xxx.xxx.xxx        Automatic
A       www     xxx.xxx.xxx.xxx        Automatic
```

Wait 5-10 minutes for DNS propagation.

## Step 9: Setup GitHub Actions (Auto-Deploy)

### A. Generate SSH Key for GitHub Actions

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions-caraudioai"
# Save as: github_actions_caraudioai

# Copy public key to droplet
ssh-copy-id -i ~/.ssh/github_actions_caraudioai.pub root@xxx.xxx.xxx.xxx

# Copy private key content for GitHub secret
cat ~/.ssh/github_actions_caraudioai
```

### B. Add Secrets to GitHub

```
1. Go to: GitHub repository → Settings → Secrets and variables → Actions
2. Add repository secrets:
   - DO_HOST: xxx.xxx.xxx.xxx
   - DO_USERNAME: root
   - DO_SSH_KEY: (paste private key content)
```

### C. Push Code to Trigger Deployment

```bash
git add .
git commit -m "Initial deployment setup"
git push origin main

# GitHub Actions will automatically deploy!
```

## Step 10: Verify Deployment

### A. Check API

```bash
# Health check
curl https://api.caraudioai.me/api/health

# API documentation
Open: https://api.caraudioai.me/api/docs
```

### B. Monitor Logs

```bash
# Application logs
sudo journalctl -u caraudioai -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🎉 Deployment Complete!

Your backend is now running at:
- **API**: https://api.caraudioai.me
- **Docs**: https://api.caraudioai.me/api/docs

## 📊 Cost Breakdown

| Service | Monthly Cost | With Student Credit | Duration |
|---------|--------------|---------------------|----------|
| Droplet | $6 | FREE | 33 months |
| PostgreSQL | $15 | FREE | 13 months |
| Spaces | $5 | FREE | 40 months |
| Domain | $1.67 | FREE | 12 months |
| **Total** | **$27.67** | **$0** | **Year 1** |

## 🔧 Maintenance Commands

```bash
# Restart application
sudo systemctl restart caraudioai

# View logs
sudo journalctl -u caraudioai -n 100

# Update application (manual)
cd /var/www/caraudioai
git pull
source backend/venv/bin/activate
pip install -r backend/requirements.txt
sudo systemctl restart caraudioai

# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

## 🚨 Troubleshooting

**Service won't start**:
```bash
sudo journalctl -u caraudioai -n 50
```

**Nginx error**:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

**Database connection error**:
```bash
psql "$DATABASE_URL"
```

---

**Ready to deploy!** Follow steps 1-10 in order. 🚀
