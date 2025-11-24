# 🚀 Deployment Guide

This guide covers deploying Multistream to various platforms.

## 🌐 Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Steps

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**
   ```bash
   vercel
   ```

3. **Or Deploy via GitHub**
   - Push your code to GitHub
   - Import project on [vercel.com](https://vercel.com)
   - Vercel auto-detects Next.js
   - Click Deploy

### Environment Variables

Set in Vercel dashboard:
```
NEXT_PUBLIC_TWITCH_PARENT=your-domain.com
```

### Custom Domain

1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS as instructed

## 🐳 Docker

Deploy using Docker containers.

### Dockerfile

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Update next.config.ts

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
};
```

### Build & Run

```bash
docker build -t multistream .
docker run -p 3000:3000 multistream
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_TWITCH_PARENT=localhost
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

## ☁️ Netlify

Deploy to Netlify with build plugin.

### netlify.toml

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Deploy

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

## 🔷 Railway

Deploy with Railway for free.

### Steps

1. Visit [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Railway auto-detects Next.js
4. Click Deploy
5. Set environment variables in dashboard

## 🌊 DigitalOcean App Platform

Deploy to DigitalOcean.

### Steps

1. Push code to GitHub
2. Create new app on [DigitalOcean](https://www.digitalocean.com/products/app-platform)
3. Connect repository
4. Configure:
   - Build Command: `npm run build`
   - Run Command: `npm start`
5. Deploy

## 🔧 VPS / Dedicated Server

Deploy to your own server.

### Requirements

- Node.js 18+
- PM2 (process manager)
- Nginx (reverse proxy)

### Setup

1. **Install dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx
   npm install -g pm2
   ```

2. **Clone repository**
   ```bash
   git clone your-repo.git
   cd multistream
   npm install
   npm run build
   ```

3. **Start with PM2**
   ```bash
   pm2 start npm --name "multistream" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**
   Create `/etc/nginx/sites-available/multistream`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/multistream /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. **SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## 🔒 Important Notes

### Twitch Embeds

For Twitch embeds to work in production, you need to:

1. **Update `urlParser.ts`**
   ```typescript
   embedUrl: `https://player.twitch.tv/?channel=${channelName}&parent=${process.env.NEXT_PUBLIC_TWITCH_PARENT || 'localhost'}`
   ```

2. **Set environment variable**
   ```
   NEXT_PUBLIC_TWITCH_PARENT=your-domain.com
   ```

### CORS Headers

If you encounter CORS issues, add to `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
      ],
    },
  ];
}
```

### Performance

- Enable production mode
- Use CDN for static assets
- Enable caching headers
- Monitor with analytics

## 📊 Monitoring

### Recommended Tools

- **Vercel Analytics** - Built-in for Vercel
- **Google Analytics** - Web analytics
- **Sentry** - Error tracking
- **LogRocket** - Session replay

### Health Check

Add health check endpoint in `app/api/health/route.ts`:
```typescript
export async function GET() {
  return Response.json({ status: 'ok', timestamp: Date.now() });
}
```

## 🔄 CI/CD

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test # if you have tests
      # Add deployment step for your platform
```

## 📝 Post-Deployment Checklist

- [ ] SSL certificate installed
- [ ] Custom domain configured
- [ ] Environment variables set
- [ ] Twitch parent domain configured
- [ ] Analytics setup
- [ ] Error monitoring enabled
- [ ] Backup strategy in place
- [ ] CDN configured (optional)

---

**Need help?** Open an issue on GitHub!
