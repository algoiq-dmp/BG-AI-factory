#!/bin/bash
# ============================================================
# BG AI Software Factory — Hostinger VPS Deployment Script
# ============================================================
# Usage: SSH into your VPS, then run this script
# ============================================================

set -e

APP_DIR="/home/bg-ai-factory"
REPO_URL="https://github.com/algoiq-dmp/BG-AI-factory.git"
BRANCH="master"
NODE_VERSION="20"

echo "🚀 BG AI Software Factory — Hostinger VPS Deployment"
echo "====================================================="

# ── 1. Install Node.js (if not installed) ────────────────────
echo ""
echo "📦 Step 1: Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "   Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "   ✅ Node.js $(node --version)"
echo "   ✅ npm $(npm --version)"

# ── 2. Install PM2 (process manager) ────────────────────────
echo ""
echo "📦 Step 2: Checking PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "   Installing PM2..."
    sudo npm install -g pm2
fi
echo "   ✅ PM2 $(pm2 --version)"

# ── 3. Clone or update the repository ────────────────────────
echo ""
echo "📁 Step 3: Setting up repository..."
if [ -d "$APP_DIR" ]; then
    echo "   Pulling latest changes..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/$BRANCH
else
    echo "   Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi
echo "   ✅ Repository ready"

# ── 4. Install dependencies ──────────────────────────────────
echo ""
echo "📦 Step 4: Installing dependencies..."
npm ci --production=false
echo "   ✅ Dependencies installed"

# ── 5. Setup Database (Docker) ──────────────────────────────
echo ""
echo "🐳 Step 5: Starting PostgreSQL via Docker..."
docker compose up -d
echo "   ✅ Database container running"

# ── 6. Set up environment variables ──────────────────────────
echo ""
echo "🔐 Step 6: Environment setup..."
if [ ! -f ".env.local" ]; then
    echo "   ⚠️  No .env.local found! Creating template..."
    cat > .env.local << 'ENVFILE'
# === BG AI Software Factory — Production Environment ===

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-a-strong-secret-here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bg_ai_factory

# AI APIs
OPENAI_API_KEY=your-key-here
DEEPSEEK_API_KEY=your-key-here

# App
NODE_ENV=production
PORT=3000
ENVFILE
    echo "   ⚠️  IMPORTANT: Edit .env.local with your actual values!"
    echo "   Run: nano $APP_DIR/.env.local"
else
    echo "   ✅ .env.local exists"
fi

# ── 7. Build the application ─────────────────────────────────
echo ""
echo "🔨 Step 7: Generating Prisma & Building production bundle..."
npx prisma generate
npm run build
echo "   ✅ Build complete"

# ── 8. Start/Restart with PM2 ────────────────────────────────
echo ""
echo "🚀 Step 8: Starting application..."
pm2 delete bg-ai-factory 2>/dev/null || true
pm2 start npm --name "bg-ai-factory" -- start
pm2 save
echo "   ✅ Application running!"

# ── 8. Setup PM2 startup (auto-restart on reboot) ────────────
echo ""
echo "🔄 Step 8: Setting up auto-restart..."
pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami)) 2>/dev/null || true
pm2 save
echo "   ✅ PM2 startup configured"

# ── 9. Setup Nginx reverse proxy (optional) ──────────────────
echo ""
echo "🌐 Step 9: Nginx setup..."
if command -v nginx &> /dev/null; then
    if [ ! -f "/etc/nginx/sites-available/bg-ai-factory" ]; then
        sudo tee /etc/nginx/sites-available/bg-ai-factory > /dev/null << 'NGINX'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
NGINX
        sudo ln -sf /etc/nginx/sites-available/bg-ai-factory /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        echo "   ✅ Nginx configured"
        echo "   ⚠️  Replace 'your-domain.com' in /etc/nginx/sites-available/bg-ai-factory"
    else
        echo "   ✅ Nginx config already exists"
    fi
else
    echo "   ⚠️  Nginx not installed. Install with: sudo apt install nginx"
fi

# ── 10. SSL with Let's Encrypt (optional) ────────────────────
echo ""
echo "🔒 Step 10: SSL..."
if command -v certbot &> /dev/null; then
    echo "   Certbot available. Run manually:"
    echo "   sudo certbot --nginx -d your-domain.com -d www.your-domain.com"
else
    echo "   Install certbot: sudo apt install certbot python3-certbot-nginx"
    echo "   Then run: sudo certbot --nginx -d your-domain.com"
fi

# ── Done ─────────────────────────────────────────────────────
echo ""
echo "====================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "====================================================="
echo ""
echo "📍 App running at: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📋 Quick Commands:"
echo "   pm2 logs bg-ai-factory     — View logs"
echo "   pm2 restart bg-ai-factory  — Restart app"
echo "   pm2 status                 — Check status"
echo "   pm2 monit                  — Monitor dashboard"
echo ""
echo "🔄 To redeploy after code changes:"
echo "   cd $APP_DIR && git pull && docker compose up -d && npm ci && npx prisma generate && npm run build && pm2 restart bg-ai-factory"
echo ""
