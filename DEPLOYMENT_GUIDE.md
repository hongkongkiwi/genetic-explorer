# Deployment Guide

Complete deployment guide for Genetic Explorer on all supported platforms.

---

## 📋 Table of Contents

1. [Docker (Self-Hosted)](#docker-self-hosted)
2. [Vercel](#vercel)
3. [Netlify](#netlify)
4. [Cloudflare Workers](#cloudflare-workers)
5. [Railway](#railway)
6. [Render](#render)
7. [Fly.io](#flyio)
8. [Koyeb](#koyeb)
9. [Heroku](#heroku)
10. [DigitalOcean App Platform](#digitalocean-app-platform)
11. [Northflank](#northflank)
12. [Supabase](#supabase)
13. [Platform Comparison](#platform-comparison)

---

## 🐳 Docker (Self-Hosted)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd genetic-explorer

# Copy environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-key-here
# SESSION_SECRET=your-secret-here

# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Production Docker Deployment

```bash
# Build production image
docker build -t genetic-explorer:latest .

# Run production container
docker run -d \
  --name genetic-explorer \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  -e OPENAI_API_KEY=sk-your-key-here \
  -e SESSION_SECRET=your-secret-here \
  --restart unless-stopped \
  genetic-explorer:latest
```

---

## ▲ Vercel

### Prerequisites
- Vercel CLI: `npm i -g vercel`
- Vercel account

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (development)
vercel

# Deploy to production
npm run deploy:vercel
# or
vercel --prod
```

### Environment Variables on Vercel

Set these in your Vercel dashboard:

```
OPENAI_API_KEY=sk-your-key-here
SESSION_SECRET=your-secret-here
NODE_ENV=production
```

**Note:** Vercel is serverless. For full-stack deployment, you may need external database and storage.

---

## ◆ Netlify

### Prerequisites
- Netlify CLI: `npm i -g netlify-cli`
- Netlify account

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
npm run build:netlify
netlify deploy --prod --dir=.output/public

# Or use:
npm run deploy:netlify
```

### Environment Variables

Set in Netlify dashboard:
```
OPENAI_API_KEY
SESSION_SECRET
NODE_ENV=production
```

---

## ☁️ Cloudflare Workers

### Prerequisites
- Wrangler CLI: `npm i -g wrangler`
- Cloudflare account

### Setup

```bash
# Install dependencies
npm install

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create genetic-explorer-db

# Create R2 bucket
wrangler r2 bucket create genetic-explorer-uploads

# Create KV namespace
wrangler kv:namespace create SESSIONS
```

### Update wrangler.toml

Edit `wrangler.toml` with your IDs from above.

### Deploy

```bash
# Deploy to Cloudflare Workers
npm run deploy:cf

# Or directly with wrangler
wrangler deploy
```

### Secrets

```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put SESSION_SECRET
```

---

## 🚂 Railway

### Prerequisites
- Railway CLI: `npm i -g @railway/cli`
- Railway account

### Deploy

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project (or create new)
railway link

# Deploy
npm run deploy:railway
# or
railway up
```

### Environment Variables

Set in Railway dashboard or CLI:
```bash
railway variables set OPENAI_API_KEY=sk-your-key-here
railway variables set SESSION_SECRET=your-secret-here
```

---

## 🎨 Render

### Deploy

Render uses Git integration:

1. Push code to GitHub/GitLab
2. Connect repository in Render dashboard
3. Use `render.yaml` for configuration
4. Auto-deploy on push

### Manual Deploy

```bash
# Build locally
npm run build

# Push to trigger deploy
git push origin main
```

### Environment Variables

Set in Render dashboard:
```
OPENAI_API_KEY
SESSION_SECRET
NODE_ENV=production
```

---

## 🚀 Fly.io

### Prerequisites
- Fly CLI: `curl -L https://fly.io/install.sh | sh`
- Fly.io account

### Deploy

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app (first time)
npm run fly:launch
# or
fly launch

# Deploy updates
npm run deploy:fly
# or
fly deploy
```

### Environment Variables

```bash
fly secrets set OPENAI_API_KEY=sk-your-key-here
fly secrets set SESSION_SECRET=your-secret-here
```

### Create Volume (for database persistence)

```bash
fly volumes create genetic_explorer_data --size 1
```

---

## ☸️ Koyeb

### Prerequisites
- Koyeb CLI (optional)
- Koyeb account

### Deploy via Git

1. Push code to GitHub
2. Connect repository in Koyeb dashboard
3. Use `koyeb.yaml` configuration
4. Auto-deploy on push

### Deploy via CLI

```bash
# Install Koyeb CLI
curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh

# Login
koyeb login

# Deploy
npm run deploy:koyeb
```

---

## 💜 Heroku

### Prerequisites
- Heroku CLI: `npm i -g heroku`
- Heroku account

### Deploy

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create genetic-explorer

# Set environment variables
heroku config:set OPENAI_API_KEY=sk-your-key-here
heroku config:set SESSION_SECRET=your-secret-here

# Deploy
git push heroku main
```

### Environment Variables

```bash
heroku config:set OPENAI_API_KEY=sk-your-key-here
heroku config:set SESSION_SECRET=your-secret-here
heroku config:set NODE_ENV=production
```

**Note:** Heroku no longer has a free tier. Minimum $7/month.

---

## 🌊 DigitalOcean App Platform

### Prerequisites
- doctl CLI: `brew install doctl`
- DigitalOcean account

### Deploy

```bash
# Install doctl
brew install doctl  # macOS
# or
apt-get install doctl  # Ubuntu

# Authenticate
doctl auth init

# Create app
doctl apps create --spec .do/app.yaml

# Update app
doctl apps update <app-id> --spec .do/app.yaml
```

### Git Integration

1. Push code to GitHub/GitLab
2. Connect repository in DO dashboard
3. Use `.do/app.yaml` for configuration

---

## 🎯 Northflank

### Prerequisites
- Northflank account
- Northflank CLI (optional): `npm install -g northflank`

### Deploy via Git Integration

Northflank automatically deploys from Git repositories:

1. **Push code to GitHub/GitLab**
   ```bash
   git push origin main
   ```

2. **Create Northflank Project**
   - Go to [Northflank Dashboard](https://app.northflank.com)
   - Click "Create Project"
   - Name it `genetic-explorer`

3. **Add Service**
   - Click "Add Service" → "Build from Git"
   - Connect your Git provider
   - Select the repository
   - Use the `Dockerfile` for build
   - Port: `3000`

4. **Configure Environment Variables**
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=/data/genetic_explorer.db
   UPLOADS_DIR=/app/uploads
   SESSION_SECRET=your-secret-here
   OPENAI_API_KEY=sk-your-key-here
   EMAIL_PROVIDER=resend
   EMAIL_FROM=noreply@geneticexplorer.com
   RESEND_API_KEY=your-resend-key
   ```

5. **Add Persistent Storage**
   - Click "Add Volume"
   - Mount path: `/data` (for database)
   - Size: 10GB
   - Click "Add Volume" again
   - Mount path: `/app/uploads` (for uploads)
   - Size: 50GB

### Deploy via CLI

```bash
# Install Northflank CLI
npm install -g northflank

# Login
northflank login

# Create project
northflank create project genetic-explorer

# Deploy service using northflank.yaml
northflank apply -f northflank.yaml
```

### Environment Variables

Set in Northflank dashboard or CLI:
```bash
northflank set variables \
  --project genetic-explorer \
  --service genetic-explorer \
  SESSION_SECRET=your-secret-here \
  OPENAI_API_KEY=sk-your-key-here \
  RESEND_API_KEY=your-resend-key
```

### Custom Domain (Optional)

```bash
# Add custom domain
northflank create domain \
  --project genetic-explorer \
  --service genetic-explorer \
  --domain genetic-explorer.example.com
```

### Scaling

Northflank supports auto-scaling:

```yaml
# Update northflank.yaml
spec:
  scaling:
    minReplicas: 1
    maxReplicas: 3
    metrics:
      - type: cpu
        targetAverageUtilization: 70
```

**Note:** Northflank offers a generous free tier with persistent storage, making it ideal for full-stack applications like Genetic Explorer.

---

## ⚡ Supabase

### Prerequisites
- Supabase CLI: `npm i -g supabase`
- Supabase account

### Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Initialize (if new project)
supabase init

# Link to project
supabase link --project-ref your-project-ref

# Start local development
supabase start
```

### Database Migration

```bash
# Generate types
supabase gen types typescript --linked > types/supabase.ts

# Push database changes
supabase db push
```

### Deploy Frontend

Supabase provides backend services. Deploy frontend separately:
- Vercel (recommended)
- Netlify
- Cloudflare Pages

---

## 🔐 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for genetic analysis |
| `SESSION_SECRET` | Yes | Secret for session encryption (min 32 chars) |
| `NODE_ENV` | No | Environment (development/production) |
| `DATABASE_URL` | No | SQLite database path (default: ./data/genetic_explorer.db) |
| `UPLOADS_DIR` | No | Uploads directory path (default: ./uploads) |
| `PORT` | No | Server port (default: 3000) |
| `HOST` | No | Server host (default: 0.0.0.0) |

---

## 📊 Platform Comparison

| Feature | Docker | Vercel | Netlify | Railway | Render | Fly.io | Koyeb | Northflank |
|---------|--------|--------|---------|---------|--------|--------|-------|------------|
| Free Tier | ❌ | ✅ | ✅ | ✅ ($5) | ✅ | ✅ ($5) | ✅ | ✅ |
| SQLite | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| File Uploads | ✅ Local | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auto-scaling | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Global CDN | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Docker | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

See [HOSTING_COMPARISON.md](HOSTING_COMPARISON.md) for detailed comparison.

---

## 🆘 Troubleshooting

### Docker

```bash
# View container logs
docker-compose logs -f genetic-explorer

# Check container status
docker-compose ps

# Rebuild after code changes
docker-compose up -d --build

# Shell into container
docker-compose exec genetic-explorer sh
```

### Vercel/Netlify

```bash
# View deployment logs
vercel logs
netlify logs

# Check build errors
vercel --debug
```

### Railway/Render

Check dashboard logs in the platform UI.

### Fly.io

```bash
# View logs
fly logs

# Check deployment
fly status

# SSH into machine
fly ssh console

# Debug locally
fly deploy --build-only
```

### Cloudflare Workers

```bash
# View logs
wrangler tail

# Check deployment
wrangler deployment list

# Debug locally
wrangler dev
```

---

## ✅ Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] File storage configured
- [ ] Sessions configured
- [ ] SSL/HTTPS enabled
- [ ] Health check endpoint working
- [ ] Logging configured
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Documentation updated

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Fly.io Documentation](https://fly.io/docs/)
- [Koyeb Documentation](https://www.koyeb.com/docs)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [DigitalOcean Documentation](https://docs.digitalocean.com/)
- [Northflank Documentation](https://northflank.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Start Deployment](https://tanstack.com/start/latest/docs/framework/react/hosting)

---

## 🆘 Support

For deployment issues:
1. Check the logs for your platform
2. Verify environment variables are set
3. Check the health endpoint: `/api/health`
4. Review platform-specific troubleshooting above
5. Check [HOSTING_COMPARISON.md](HOSTING_COMPARISON.md) for platform selection
