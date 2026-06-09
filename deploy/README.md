# Deployment

Deployment configuration for the BG AI Software Factory.

## Files

| File | Purpose |
|------|---------|
| `nginx.conf` | Nginx reverse proxy (port 3003, WebSocket, security headers) |
| `setup.sh` | Full VPS deployment script (Node.js, PM2, Prisma, Nginx) |

## Quick Deploy (VPS)

```bash
# SSH into server
ssh root@148.230.66.71

# Pull and rebuild
cd /var/www/BG-AI-factory
git pull origin master
npm install --production
npx prisma generate
npm run build
pm2 restart bg-factory
```

## Docker Deploy

```bash
docker-compose up -d --build
```

## PM2 Commands

```bash
pm2 status           # Check status
pm2 logs bg-factory  # View logs
pm2 restart bg-factory  # Restart
pm2 monit            # Monitor
```
