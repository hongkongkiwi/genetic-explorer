# Heroku & DigitalOcean Deployment Guide

## 💜 Heroku Deployment

### Prerequisites
- Heroku CLI: `npm i -g heroku`
- Heroku account
- Git repository

### Quick Deploy

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app (first time)
npm run heroku:create
# or
heroku create genetic-explorer

# Set environment variables
heroku config:set OPENAI_API_KEY=sk-your-key-here
heroku config:set SESSION_SECRET=your-secret-here
heroku config:set NODE_ENV=production

# Deploy to Heroku
npm run deploy:heroku
# or
git push heroku main
```

### Configuration Files

**app.json** - Heroku app configuration
**Procfile** - Process definition
**Dockerfile.heroku** - Heroku-specific Docker build
**heroku.yml** - Heroku build configuration

### Scaling

```bash
# Scale to 1 web dyno (paid tier required)
heroku ps:scale web=1

# Check dyno status
heroku ps

# View logs
heroku logs --tail
```

### Add-ons (Optional)

```bash
# Add PostgreSQL (if migrating from SQLite)
heroku addons:create heroku-postgresql:mini

# Add Redis for sessions
heroku addons:create heroku-redis:mini

# Add monitoring
heroku addons:create papertrail:choklad
```

### Important Notes

- ⚠️ **No free tier** - Minimum $7/month for hobby dyno
- Free dynos sleep after 30 minutes of inactivity
- File system is ephemeral - use S3 for uploads
- Consider migrating to PostgreSQL for production

---

## 🌊 DigitalOcean App Platform

### Prerequisites
- doctl CLI: `brew install doctl` (macOS) or `apt-get install doctl` (Ubuntu)
- DigitalOcean account
- Git repository

### Quick Deploy

```bash
# Install doctl
brew install doctl  # macOS
# or
apt-get install doctl  # Ubuntu

# Authenticate with DigitalOcean
doctl auth init

# Create app from spec file
npm run deploy:do
# or
doctl apps create --spec .do/app.yaml

# Update existing app
npm run deploy:do-update
# or
doctl apps update <app-id> --spec .do/app.yaml
```

### Git Integration Deploy

```bash
# Push to GitHub/GitLab
git push origin main

# In DigitalOcean Dashboard:
# 1. Create App
# 2. Choose GitHub/GitLab source
# 3. Select repository
# 4. Configure environment variables
# 5. Deploy
```

### Configuration

**File:** `.do/app.yaml`

Key features:
- Docker-based deployment
- Persistent volume for database
- Health checks
- Auto-deploy on git push
- Environment variables

### Environment Variables

Set in `.do/app.yaml` or via dashboard:

```yaml
envs:
  - key: OPENAI_API_KEY
    value: ""
    type: SECRET
    required: true
  - key: SESSION_SECRET
    value: ""
    type: SECRET
    required: true
```

### Scaling

```bash
# List apps
doctl apps list

# Update instance size
doctl apps update <app-id> --spec .do/app.yaml

# View logs
doctl apps logs <app-id>
```

### Pricing

| Tier | Cost | Features |
|------|------|----------|
| Static Sites | Free | Static hosting only |
| Basic-XS | $5/mo | 512MB RAM, 1 CPU |
| Basic-S | $12/mo | 1GB RAM, 1 CPU |
| Basic-M | $24/mo | 2GB RAM, 1 CPU |

---

## 🔧 Platform Comparison

| Feature | Heroku | DigitalOcean |
|---------|--------|--------------|
| **Cost** | $7+/mo | $5+/mo |
| **Free Tier** | ❌ No | ⚠️ Static only |
| **Docker** | ✅ Yes | ✅ Yes |
| **Persistent Storage** | ❌ Ephemeral | ✅ Yes |
| **SQLite** | ⚠️ Not recommended | ✅ Yes |
| **Global CDN** | ✅ Yes | ❌ No |
| **Auto-scaling** | ✅ Yes | ⚠️ Manual |
| **Git Integration** | ✅ Yes | ✅ Yes |
| **SSL** | ✅ Auto | ✅ Auto |

---

## 📝 Environment Variables

### Heroku

```bash
heroku config:set OPENAI_API_KEY=sk-your-key
heroku config:set SESSION_SECRET=your-secret
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=./data/genetic_explorer.db
heroku config:set UPLOADS_DIR=./uploads
```

### DigitalOcean

Set in dashboard or `.do/app.yaml`:

```yaml
envs:
  - key: OPENAI_API_KEY
    scope: RUN_TIME
    type: SECRET
    value: sk-your-key
  - key: SESSION_SECRET
    scope: RUN_TIME
    type: SECRET
    value: your-secret
```

---

## 🆘 Troubleshooting

### Heroku

```bash
# View logs
heroku logs --tail

# Check dyno status
heroku ps

# Restart app
heroku restart

# Open app in browser
heroku open

# Run database migrations (if using PostgreSQL)
heroku run npm run db:migrate
```

### DigitalOcean

```bash
# View logs
doctl apps logs <app-id>

# List deployments
doctl apps list-deployments <app-id>

# Rollback deployment
doctl apps rollback <app-id> --deployment-id <deployment-id>

# Delete app
doctl apps delete <app-id>
```

---

## 📊 Migration Guide

### SQLite to PostgreSQL (Heroku)

```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Get database URL
heroku config:get DATABASE_URL

# Update app to use PostgreSQL
# (requires code changes to use pg instead of better-sqlite3)
```

### Local to DigitalOcean

```bash
# Backup local database
npm run db:backup

# Copy to DigitalOcean volume (via SSH or dashboard)
# Restore on DigitalOcean
npm run db:restore
```

---

## 🎯 Recommendations

### Choose Heroku if:
- You want managed services
- You need easy scaling
- You have budget for $7+/mo
- You want extensive add-on ecosystem
- You don't need persistent file storage

### Choose DigitalOcean if:
- You want lower cost ($5/mo)
- You need persistent storage
- You want Docker deployment
- You need SQLite support
- You want predictable pricing

---

## 📚 Additional Resources

- [Heroku Documentation](https://devcenter.heroku.com/)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [doctl CLI Reference](https://docs.digitalocean.com/reference/doctl/)
