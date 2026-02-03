# Deployment Platforms Summary

Genetic Explorer now supports **12 different hosting platforms** for maximum flexibility.

---

## 📦 Supported Platforms

### 1. 🐳 Docker (Self-Hosted)
**Files:** `Dockerfile`, `docker-compose.yml`, `.dockerignore`

```bash
docker-compose up -d
```
- ✅ Full control
- ✅ Local SQLite
- ✅ File uploads
- ❌ Manual scaling

---

### 2. ▲ Vercel
**Files:** `vercel.json`, `app.config.vercel.ts`

```bash
npm run deploy:vercel
```
- ✅ Serverless
- ✅ Global CDN
- ✅ Free tier
- ❌ No SQLite (needs external DB)

---

### 3. ◆ Netlify
**Files:** `netlify.toml`, `app.config.netlify.ts`

```bash
npm run deploy:netlify
```
- ✅ Serverless
- ✅ Edge functions
- ✅ Free tier
- ❌ No SQLite

---

### 4. ☁️ Cloudflare Workers
**Files:** `wrangler.toml`, `app.config.cloudflare.ts`

```bash
npm run deploy:cf
```
- ✅ 300+ edge locations
- ✅ D1 Database (SQLite at edge)
- ✅ R2 Storage
- ✅ Free tier (100k requests/day)

---

### 5. 🚂 Railway
**Files:** `railway.toml`, `Dockerfile.railway`, `app.config.railway.ts`

```bash
npm run deploy:railway
```
- ✅ $5/month free credit
- ✅ Auto-scaling
- ✅ Managed databases
- ✅ Easy deployment

---

### 6. 🎨 Render
**Files:** `render.yaml`

```bash
git push origin main  # Auto-deploy
```
- ✅ Free tier (never expires)
- ✅ Auto-deploy from Git
- ✅ Managed PostgreSQL
- ⚠️ Free tier sleeps after 15min

---

### 7. 🚀 Fly.io
**Files:** `fly.toml`, `app.config.fly.ts`

```bash
npm run fly:launch     # First time
npm run deploy:fly     # Updates
```
- ✅ $5/month free credit
- ✅ Global edge deployment
- ✅ Docker-native
- ✅ Persistent volumes

---

### 8. ☸️ Koyeb
**Files:** `koyeb.yaml`

```bash
npm run deploy:koyeb
```
- ✅ Free tier
- ✅ Global edge
- ✅ Docker-native
- ✅ Easy deployment

---

### 9. 💜 Heroku
**Files:** `Procfile`, `app.json`, `Dockerfile.heroku`, `heroku.yml`

```bash
npm run deploy:heroku
```
- ✅ Mature platform
- ✅ Easy to use
- ✅ Docker support
- ❌ No free tier ($7+/mo)
- ❌ Sleep mode on hobby

---

### 10. 🌊 DigitalOcean App Platform
**Files:** `.do/app.yaml`, `app.config.digitalocean.ts`

```bash
npm run deploy:do
```
- ✅ Free for static sites
- ✅ Simple deployment
- ⚠️ Limited free tier for containers

---

### 11. 🎯 Northflank
**Files:** `northflank.yaml`, `app.config.northflank.ts`

```bash
# Deploy via CLI
northflank apply -f northflank.yaml

# Or use Git integration (recommended)
git push origin main  # Auto-deploy from Git
```
- ✅ Free tier available
- ✅ Kubernetes-based platform
- ✅ Persistent storage support
- ✅ Git integration
- ✅ Auto-scaling

---

### 12. ⚡ Supabase
**Files:** `supabase/config.toml`

```bash
supabase db push
```
- ✅ Free tier
- ✅ PostgreSQL database
- ✅ Auth built-in
- ✅ Storage included
- ⚠️ Backend only (needs frontend hosting)

---

## 🎯 Quick Deploy Commands

```bash
# Docker (Self-hosted)
docker-compose up -d

# Vercel (Serverless)
vercel --prod

# Netlify (Serverless)
netlify deploy --prod

# Cloudflare Workers (Edge)
wrangler deploy

# Railway (Container)
railway up

# Render (Container)
git push origin main

# Fly.io (Container)
fly deploy

# Koyeb (Container)
koyeb service deploy

# Heroku (Container)
npm run deploy:heroku

# DigitalOcean
npm run deploy:do

# Supabase (Backend)
supabase db push
# Deploy frontend separately
```

---

## 📊 Platform Features Matrix

| Platform | Type | Free Tier | SQLite | Files | Docker | Global CDN |
|----------|------|-----------|--------|-------|--------|------------|
| Docker | Self-hosted | ❌ | ✅ | ✅ | ✅ | ❌ |
| Vercel | Serverless | ✅ | ❌ | ❌ | ❌ | ✅ |
| Netlify | Serverless | ✅ | ❌ | ❌ | ❌ | ✅ |
| Cloudflare | Edge | ✅ | ✅ (D1) | ✅ (R2) | ❌ | ✅ |
| Railway | Container | ✅ ($5) | ✅ | ✅ | ✅ | ❌ |
| Render | Container | ✅ | ✅ | ✅ | ✅ | ✅ |
| Fly.io | Container | ✅ ($5) | ✅ | ✅ | ✅ | ✅ |
| Koyeb | Container | ✅ | ✅ | ✅ | ✅ | ✅ |
| Northflank | Container | ✅ | ✅ | ✅ | ✅ | ✅ |
| Heroku | Container | ❌ | ✅ | ✅ | ✅ | ❌ |
| DigitalOcean | Container | ⚠️ | ✅ | ✅ | ✅ | ❌ |
| Supabase | Backend | ✅ | ✅ (Postgres) | ✅ | ❌ | ❌ |

---

## 💰 Free Tier Comparison

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| Railway | $5 credit | Full-stack apps |
| Render | Free forever | Side projects |
| Fly.io | $5 credit | Docker apps |
| Vercel | Hobby tier | Frontend |
| Netlify | Starter tier | Static sites |
| Cloudflare | 100k req/day | Global apps |
| Koyeb | Free tier | Docker apps |
| Northflank | Free tier | Full-stack |
| Supabase | Free tier | Backend |

---

## 🏆 Recommendations

### For Beginners
1. **Railway** - Easiest full-stack deployment
2. **Render** - Simple, reliable, never expires
3. **Northflank** - Git integration, persistent storage
4. **Vercel** - Best frontend experience

### For Production
1. **Fly.io** - Performance + global edge
2. **Railway** - Auto-scaling + managed DB
3. **Docker (VPS)** - Full control

### For Free Hosting
1. **Railway** ($5 credit)
2. **Render** (free forever)
3. **Northflank** (free tier)
4. **Fly.io** ($5 credit)

### For Global Performance
1. **Cloudflare Workers** (300+ locations)
2. **Fly.io** (edge deployment)
3. **Vercel** (global CDN)

---

## 📚 Documentation

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Full deployment instructions
- [HOSTING_COMPARISON.md](HOSTING_COMPARISON.md) - Detailed platform comparison
- [.env.example](.env.example) - Environment variables template

---

## 🔧 Configuration Files Created

### Docker
- `Dockerfile` - Main Docker build
- `Dockerfile.railway` - Railway-specific build
- `docker-compose.yml` - Container orchestration
- `.dockerignore` - Docker ignore rules

### Platform Configs
- `vercel.json` - Vercel configuration
- `netlify.toml` - Netlify configuration
- `wrangler.toml` - Cloudflare Workers
- `railway.toml` - Railway configuration
- `render.yaml` - Render configuration
- `fly.toml` - Fly.io configuration
- `koyeb.yaml` - Koyeb configuration
- `northflank.yaml` - Northflank configuration
- `Procfile` - Heroku process file
- `app.json` - Heroku app configuration
- `Dockerfile.heroku` - Heroku-specific Docker build
- `heroku.yml` - Heroku build configuration
- `.do/app.yaml` - DigitalOcean configuration
- `supabase/config.toml` - Supabase configuration

### Build Configs
- `app.config.vercel.ts`
- `app.config.netlify.ts`
- `app.config.cloudflare.ts`
- `app.config.fly.ts`
- `app.config.railway.ts`
- `app.config.heroku.ts`
- `app.config.digitalocean.ts`
- `app.config.northflank.ts`

---

## ✅ Deployment Checklist

For any platform:

- [ ] Copy `.env.example` to `.env`
- [ ] Set `OPENAI_API_KEY`
- [ ] Set `SESSION_SECRET` (32+ random chars)
- [ ] Choose deployment platform
- [ ] Run platform-specific deploy command
- [ ] Set environment variables on platform
- [ ] Test `/api/health` endpoint
- [ ] Verify app is accessible

---

## 🆘 Support

Having issues? Check:

1. [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Full instructions
2. [HOSTING_COMPARISON.md](HOSTING_COMPARISON.md) - Choose the right platform
3. Platform-specific documentation (linked in deployment guide)
4. Health endpoint: `GET /api/health`
