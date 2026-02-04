# Production Deployment Guide

This guide covers deploying Genetic Explorer in production with multiple instances, load balancing, and high availability.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Single Instance Deployment](#single-instance-deployment)
3. [Multi-Instance Deployment](#multi-instance-deployment)
4. [AWS ECS Deployment](#aws-ecs-deployment)
5. [Load Balancing](#load-balancing)
6. [Health Checks](#health-checks)
7. [Graceful Shutdown](#graceful-shutdown)
8. [Database Considerations](#database-considerations)
9. [Background Jobs](#background-jobs)
10. [Monitoring](#monitoring)
11. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    │   (nginx/ALB)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼─────┐ ┌──────▼──────┐ ┌────▼─────┐
     │  Instance 1  │ │ Instance 2  │ │Instance 3│
     │  (Primary)   │ │  (Backup)   │ │ (Backup) │
     └──────┬───────┘ └──────┬──────┘ └────┬─────┘
            │                │             │
            └────────────────┼─────────────┘
                             │
                    ┌────────▼────────┐
                    │   SQLite DB     │
                    │ (shared volume) │
                    └─────────────────┘
```

### Key Features

- **Health Checks**: Liveness and readiness probes for load balancers
- **Graceful Shutdown**: Proper request draining on shutdown
- **Distributed Rate Limiting**: Shared counters via database
- **Leader Election**: Only one instance runs background jobs
- **Circuit Breakers**: Protection against cascading failures
- **Startup Coordination**: Ordered initialization with retries

---

## Single Instance Deployment

### Basic Setup

```bash
# Environment variables
NODE_ENV=production
PORT=3000
DATABASE_URL=./data/genetic_explorer.db
ENCRYPTION_MASTER_KEY=your-secure-32-char-key

# Start application
npm run build
npm start
```

### Using PM2

```bash
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'genetic-explorer',
    script: './dist/server/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
    },
    // Graceful shutdown
    kill_timeout: 30000,
    wait_ready: true,
    listen_timeout: 10000,
  }]
};
```

---

## Multi-Instance Deployment

### Requirements

1. **Shared SQLite Database**: All instances must access the same database file
2. **Shared Uploads Directory**: Genome files must be accessible to all instances
3. **Load Balancer**: Distribute traffic across instances

### Docker Compose Example

```yaml
version: '3.8'

services:
  app:
    build: .
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
      - DATABASE_URL=/data/genetic_explorer.db
      - UPLOADS_DIR=/uploads
      - ENCRYPTION_MASTER_KEY=${ENCRYPTION_MASTER_KEY}
      # Enable distributed rate limiting
      - DISTRIBUTED_RATE_LIMIT=true
    volumes:
      # Shared data volume
      - app-data:/data
      - app-uploads:/uploads
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health?type=ready"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s
    # Graceful shutdown
    stop_grace_period: 30s
    stop_signal: SIGTERM

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app

volumes:
  app-data:
  app-uploads:
```

### Nginx Load Balancer Config

```nginx
upstream genetic_explorer {
    least_conn;  # Load balancing method
    
    server app1:3000 max_fails=3 fail_timeout=30s;
    server app2:3000 max_fails=3 fail_timeout=30s;
    server app3:3000 max_fails=3 fail_timeout=30s backup;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://genetic_explorer;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Health check endpoint
    location /api/health {
        proxy_pass http://genetic_explorer;
        access_log off;
    }
}
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: genetic-explorer
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app: genetic-explorer
  template:
    metadata:
      labels:
        app: genetic-explorer
    spec:
      containers:
      - name: app
        image: genetic-explorer:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DISTRIBUTED_RATE_LIMIT
          value: "true"
        # Shared volume for SQLite
        volumeMounts:
        - name: data
          mountPath: /data
        - name: uploads
          mountPath: /uploads
        # Health checks
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health?type=ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        # Graceful shutdown
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 15"]
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: genetic-explorer-data
      - name: uploads
        persistentVolumeClaim:
          claimName: genetic-explorer-uploads
      # Ensure only one instance runs background jobs
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - genetic-explorer
              topologyKey: kubernetes.io/hostname
---
apiVersion: v1
kind: Service
metadata:
  name: genetic-explorer
spec:
  selector:
    app: genetic-explorer
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

---

## AWS ECS Deployment

For AWS-native deployments, use Amazon ECS with Fargate.

### Architecture

```
                    ┌─────────────────┐
                    │   Route 53      │
                    │  (DNS/HTTPS)    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  CloudFront     │
                    │   (CDN/WAF)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │       ALB       │
                    │  (HTTPS/TLS)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼─────┐ ┌──────▼──────┐ ┌────▼─────┐
     │  ECS Task 1  │ │ ECS Task 2  │ │ ECS Task │
     │  (Fargate)   │ │  (Fargate)  │ │(Fargate) │
     └──────┬───────┘ └──────┬──────┘ └────┬─────┘
            │                │             │
            └────────────────┼─────────────┘
                             │
                    ┌────────▼────────┐
                    │      EFS        │
                    │  (Encrypted)    │
                    └─────────────────┘
```

### Quick Deploy

```bash
# 1. Configure AWS credentials
aws configure

# 2. Create secrets
aws secretsmanager create-secret \
  --name genetic-explorer/encryption-master-key \
  --secret-string "your-secure-key"

# 3. Deploy
cd deploy/ecs
./deploy.sh production --full-deploy
```

### Features

- **Fargate**: Serverless containers (no EC2 management)
- **Auto Scaling**: CPU, memory, and request-based scaling
- **EFS**: Shared persistent storage across all tasks
- **Application Load Balancer**: With HTTPS termination
- **CloudWatch**: Centralized logging and metrics
- **Secrets Manager**: Secure credential storage
- **KMS**: Encryption at rest

### See Also

For complete ECS documentation, see: [`docs/ECS_DEPLOYMENT.md`](ECS_DEPLOYMENT.md)

---

## Load Balancing

### Health Check Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `GET /api/health` | Basic health | 200 = healthy, 503 = unhealthy |
| `GET /api/health?type=ready` | Readiness probe | 200 = ready, 503 = not ready |
| `GET /api/health?type=deep` | Comprehensive check | Detailed health info |

### Load Balancer Configuration

**Nginx:**
```nginx
upstream backend {
    least_conn;
    server instance1:3000;
    server instance2:3000;
    server instance3:3000;
    
    # Health checks
    check interval=5000 rise=2 fall=3 timeout=3000 type=http;
    check_http_send "GET /api/health HTTP/1.0\r\n\r\n";
    check_http_expect_alive http_2xx http_3xx;
}
```

**AWS ALB:**
```bash
# Target Group Health Checks
Protocol: HTTP
Path: /api/health
Port: traffic port
Healthy threshold: 2
Unhealthy threshold: 3
Timeout: 5 seconds
Interval: 10 seconds
Success codes: 200
```

---

## Graceful Shutdown

### How It Works

1. **SIGTERM received** (from Kubernetes, Docker, PM2)
2. **Mark not ready** - Readiness probe fails
3. **Stop accepting new connections** - Load balancer removes instance
4. **Wait for active requests** - Complete in-flight requests
5. **Close resources** - Database connections, file handles
6. **Exit** - Process terminates cleanly

### Configuration

```typescript
// Set in environment
SHUTDOWN_TIMEOUT_MS=30000  // Max time to wait for requests
```

### Monitoring

```bash
# Check active requests during shutdown
curl http://localhost:3000/api/health?type=deep | jq '.activeRequests'
```

---

## Database Considerations

### SQLite with Multiple Instances

SQLite supports concurrent reads but has limitations on writes:

**Best Practices:**
1. Use WAL mode (Write-Ahead Logging) - enabled by default
2. Keep database on fast SSD storage
3. Consider read replicas for heavy read workloads

**WAL Mode Benefits:**
- Readers don't block writers
- Writers don't block readers
- Better concurrency than default rollback journal

### Database Backups

```bash
# Automated backup script
npm run db:backup

# Restore from backup
npm run db:restore ./backups/genetic-explorer-backup-xxx.tar.gz
```

### For High Write Loads

If you experience database lock contention:

1. **Reduce instances** - Use 1-2 instances instead of many
2. **Queue writes** - Implement a write queue
3. **Consider PostgreSQL** - Migrate to client-server database

---

## Background Jobs

### Leader Election

Only one instance runs background jobs using database-backed locking:

```typescript
import { executeAsLeader } from '~/utils/leaderElection';

// Run task only on leader instance
await executeAsLeader('daily-cleanup', async () => {
  // This runs on only one instance
  await cleanupOldGenomes();
  await generateReports();
}, { ttlSeconds: 3600 });
```

### Scheduled Tasks

Use a job scheduler like `node-cron` on each instance, but only the leader executes:

```typescript
import cron from 'node-cron';
import { acquireLeadership, releaseLeadership } from '~/utils/leaderElection';

// Run every hour
cron.schedule('0 * * * *', async () => {
  if (acquireLeadership('hourly-tasks', { ttlSeconds: 300 })) {
    try {
      await runHourlyTasks();
    } finally {
      releaseLeadership('hourly-tasks');
    }
  }
});
```

### Key Rotation

```typescript
import { rotateDataKey } from '~/utils/kms';
import { executeAsLeader } from '~/utils/leaderElection';

// Rotate KMS data key monthly
await executeAsLeader('key-rotation', async () => {
  await rotateDataKey();
}, { ttlSeconds: 60 });
```

---

## Monitoring

### Metrics Endpoints

```bash
# Basic health
curl http://localhost:3000/api/health

# Deep health check with all metrics
curl http://localhost:3000/api/health?type=deep | jq
```

### Key Metrics

| Metric | Description | Endpoint |
|--------|-------------|----------|
| Uptime | Process uptime | `/api/health` |
| Database | Connection status | `/api/health?type=deep` |
| Encryption | KMS status | `/api/health?type=deep` |
| Circuit Breakers | Service health | `/api/health?type=deep` |
| Rate Limits | Current entries | `/api/health?type=deep` |
| Memory Usage | Heap usage | `/api/health?type=deep` |

### Logging

Structured logging for production:

```bash
# Enable JSON logging
LOG_FORMAT=json
LOG_LEVEL=info
```

### Alerts

Configure alerts for:
- Health check failures
- High error rates
- Circuit breaker trips
- Database connection failures

---

## Troubleshooting

### Issue: Instance not becoming ready

**Check:**
```bash
curl http://localhost:3000/api/health?type=ready
```

**Common causes:**
- Database connection failing
- Encryption key not set
- KMS initialization failing

### Issue: Rate limiting not working across instances

**Check:**
```bash
# Verify distributed mode is enabled
curl http://localhost:3000/api/health?type=deep | jq '.rateLimitStats.mode'
# Should return "distributed"
```

**Fix:**
```bash
# Enable distributed rate limiting
DISTRIBUTED_RATE_LIMIT=true
```

### Issue: Multiple instances running background jobs

**Check leader locks:**
```bash
# Query database
sqlite3 data/genetic_explorer.db "SELECT * FROM leader_locks;"
```

**Fix:**
- Ensure all instances use the same database
- Check `instance_id` in logs to identify instances

### Issue: Database locked errors

**Solutions:**
1. Reduce number of instances (recommended: 2-3)
2. Enable WAL mode (already enabled by default)
3. Check disk I/O performance
4. Consider migrating to PostgreSQL

### Issue: High memory usage

**Check:**
```bash
curl http://localhost:3000/api/health?type=deep | jq '.checks.memory'
```

**Solutions:**
1. Restart instances periodically
2. Reduce in-memory caches
3. Add memory limits in Docker/Kubernetes
4. Scale horizontally with more instances

---

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | SQLite database path | `./data/genetic_explorer.db` |
| `UPLOADS_DIR` | Genome files directory | `./uploads` |
| `ENCRYPTION_MASTER_KEY` | Master encryption key | - |
| `DISTRIBUTED_RATE_LIMIT` | Enable distributed rate limits | `false` (auto-enabled in production) |
| `SHUTDOWN_TIMEOUT_MS` | Graceful shutdown timeout | `30000` |
| `AWS_KMS_KEY_ID` | AWS KMS key ARN | - |
| `AZURE_KEY_VAULT_URL` | Azure Key Vault URL | - |
| `GCP_KMS_KEY_NAME` | GCP KMS key name | - |

---

## Quick Start Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure strong `ENCRYPTION_MASTER_KEY`
- [ ] Set up shared volumes for database and uploads
- [ ] Configure load balancer with health checks
- [ ] Enable distributed rate limiting for multi-instance
- [ ] Set up log aggregation
- [ ] Configure monitoring and alerts
- [ ] Test graceful shutdown
- [ ] Test database backup/restore
- [ ] Document instance IDs for debugging
