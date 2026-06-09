#!/bin/bash
# ============================================
# BG AI Software Factory — VPS Deploy Script
# Run on your Hostinger KVM 2 VPS
# ============================================

set -e  # Exit on any error

echo "🚀 BG AI Software Factory — Deployment Starting..."
echo "=================================================="

# ---- STEP 1: Install Node.js 18 (if missing) ----
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    echo "✅ Node.js $(node -v) already installed"
fi

# ---- STEP 2: Install PM2 (if missing) ----
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
else
    echo "✅ PM2 already installed"
fi

# ---- STEP 3: Clone or Pull ----
APP_DIR="/var/www/BG-AI-factory"

if [ -d "$APP_DIR" ]; then
    echo "🔄 Updating existing installation..."
    cd $APP_DIR
    git pull origin master
else
    echo "📥 Cloning repository..."
    cd /var/www
    git clone https://github.com/algoiq-dmp/BG-AI-factory.git
    cd $APP_DIR
fi

# ---- STEP 4: Check .env ----
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  No .env file found! Creating from template..."
    cp .env.example .env
    echo ""
    echo "🔧 IMPORTANT: Edit the .env file NOW with your real keys:"
    echo "   nano $APP_DIR/.env"
    echo ""
    echo "   Required: NEXTAUTH_SECRET, DEEPSEEK_API_KEY"
    echo "   Then re-run this script."
    echo ""
    exit 1
fi

# ---- STEP 5: Install dependencies ----
echo "📦 Installing npm dependencies..."
npm install --production=false

# ---- STEP 6: Setup Database ----
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma db push --accept-data-loss

# ---- STEP 7: Build ----
echo "🔨 Building production bundle..."
npm run build

# ---- STEP 8: Start/Restart with PM2 ----
echo "🚀 Starting application with PM2..."
pm2 delete bg-factory 2>/dev/null || true
PORT=3003 pm2 start npm --name "bg-factory" -- start

# ---- STEP 9: Setup Nginx (if not already) ----
if [ ! -f "/etc/nginx/sites-available/bgfactory" ]; then
    echo "🌐 Setting up Nginx..."
    apt install -y nginx
    cp deploy/nginx.conf /etc/nginx/sites-available/bgfactory
    ln -sf /etc/nginx/sites-available/bgfactory /etc/nginx/sites-enabled/
    nginx -t && systemctl restart nginx
    echo "✅ Nginx configured on port 80"
else
    echo "✅ Nginx already configured"
fi

# ---- STEP 10: Save PM2 ----
pm2 startup
pm2 save

echo ""
echo "=================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=================================================="
echo ""
echo "🌐 App running at: http://$(hostname -I | awk '{print $1}'):3003"
echo "📊 PM2 status: pm2 status"
echo "📋 View logs:  pm2 logs bg-factory"
echo ""
echo "📌 Next steps:"
echo "   1. Edit Nginx domain: nano /etc/nginx/sites-available/bgfactory"
echo "   2. Setup SSL: certbot --nginx -d bgfactory.yourdomain.com"
echo ""
