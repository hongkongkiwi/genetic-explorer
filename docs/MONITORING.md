# Monitoring & Logging Setup

This document describes the monitoring and logging infrastructure for Genetic Explorer.

## Overview

Genetic Explorer uses a dual approach for observability:

1. **Loglayer + Axiom** - Structured logging with centralized log aggregation
2. **Sentry** - Error tracking and performance monitoring

Both systems are **optional** and only activate when their respective environment variables are configured.

---

## Logging with Loglayer & Axiom

### Features

- Structured JSON logging
- Multiple log levels (debug, info, warn, error)
- Contextual logging with child loggers
- Buffered log transmission to Axiom
- Automatic fallback to console when Axiom is not configured

### Configuration

```bash
# Required for Axiom logging
AXIOM_TOKEN=xaat-your-axiom-api-token
AXIOM_DATASET=genetic-explorer-logs

# Optional: Custom Axiom URL (for third-party compatible services)
AXIOM_URL=https://api.axiom.co
```

### Usage

```typescript
import { logger, createComponentLogger, logError } from '~/utils/loggingIndex';

// Basic logging
logger.info('Application started');
logger.warn('Disk space low', { freeSpace: '10%' });
logger.error('Failed to connect to database', error);

// Component-specific logger
const dbLogger = createComponentLogger('database');
dbLogger.info('Connected to database');
dbLogger.debug('Executing query', { query: 'SELECT * FROM users' });

// Error logging with context
logError(new Error('Connection failed'), {
  host: 'db.example.com',
  port: 5432,
  retryCount: 3,
});
```

### Log Levels

| Level | Usage |
|-------|-------|
| `debug` | Detailed debugging information |
| `info` | General application events |
| `warn` | Warning conditions |
| `error` | Error conditions |

### Privacy & Security

Logs are automatically sanitized to remove sensitive information:
- API keys are redacted
- Email addresses are masked
- Passwords and secrets are removed
- Genetic data is filtered

---

## Error Tracking with Sentry

### Features

- Automatic error capture
- Performance monitoring (traces)
- Release tracking
- Environment tagging
- User context tracking
- Breadcrumbs for debugging
- Third-party Sentry compatibility (GlitchTip, etc.)

### Configuration

```bash
# Required for Sentry
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Optional: Custom Sentry URL for self-hosted or third-party
SENTRY_URL=https://sentry.my-company.com

# Optional: Environment and release tags
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0

# Optional: Performance monitoring sample rates
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1

# Optional: Debug mode (development only)
SENTRY_DEBUG=true
```

### Usage

```typescript
import { 
  captureException, 
  captureMessage,
  setSentryUser,
  addSentryBreadcrumb 
} from '~/utils/loggingIndex';

// Capture exceptions
try {
  await riskyOperation();
} catch (error) {
  captureException(error, { 
    context: 'payment-processing',
    userId: 'user-123'
  });
}

// Capture messages
captureMessage('User completed onboarding', 'info');

// Set user context
setSentryUser('user-123', 'user@example.com', {
  plan: 'premium',
});

// Add breadcrumbs
addSentryBreadcrumb('User clicked checkout button', 'ui', 'info');
addSentryBreadcrumb('Payment processed', 'payment', 'info');
```

### React Error Boundary

The application automatically wraps routes with a Sentry-enabled error boundary:

```tsx
import { SentryErrorBoundary } from '~/components/SentryErrorBoundary';

// Errors in children are caught and reported
<SentryErrorBoundary>
  <YourComponent />
</SentryErrorBoundary>
```

---

## Third-Party Compatibility

### Self-Hosted Sentry

```bash
SENTRY_DSN=https://key@your-sentry.com/1
SENTRY_URL=https://your-sentry.com
```

### GlitchTip (Open Source Sentry Alternative)

```bash
SENTRY_DSN=https://key@glitchtip.example.com/1
SENTRY_URL=https://glitchtip.example.com
```

### Custom Axiom-Compatible Logging

```bash
# Any service with Axiom-compatible API
AXIOM_TOKEN=your-token
AXIOM_DATASET=your-dataset
AXIOM_URL=https://logs.your-company.com
```

---

## Health Checks

### Logging Status

```typescript
import { getLoggingStatus, getAxiomStatus } from '~/utils/loggingIndex';

const status = getLoggingStatus();
// { consoleEnabled: true, axiomEnabled: true, axiomDataset: 'genetic-explorer-logs' }

const axiom = getAxiomStatus();
// { enabled: true, dataset: 'genetic-explorer-logs', url: 'https://api.axiom.co' }
```

### Sentry Status

```typescript
import { getSentryStatus, isSentryConfigured } from '~/utils/loggingIndex';

const configured = isSentryConfigured();
// true

const status = getSentryStatus();
// { enabled: true, dsn: '[CONFIGURED]', environment: 'production' }
```

---

## Best Practices

### 1. Always Use Structured Logging

```typescript
// Good
logger.info('User login', { userId, ip: clientIp, method: 'password' });

// Bad
logger.info(`User ${userId} logged in from ${ip}`);
```

### 2. Include Context with Errors

```typescript
// Good
captureException(error, {
  component: 'genome-parser',
  fileName: uploadedFile.name,
  fileSize: uploadedFile.size,
});

// Bad
captureException(error);
```

### 3. Use Appropriate Log Levels

- `debug` - Development-only information
- `info` - Normal operations
- `warn` - Recoverable issues
- `error` - Failures requiring attention

### 4. Sanitize Sensitive Data

The logging system automatically sanitizes sensitive data. If you need additional sanitization:

```typescript
import { sanitizeLogMessage } from '~/utils/secureLogger';

const sanitized = sanitizeLogMessage(message);
logger.info(sanitized);
```

### 5. Use Child Loggers for Components

```typescript
const logger = createComponentLogger('genome-upload');

// All logs will include { component: 'genome-upload' }
logger.info('Processing started');
logger.info('Processing complete');
```

---

## Troubleshooting

### Logs Not Appearing in Axiom

1. Check `AXIOM_TOKEN` and `AXIOM_DATASET` are set correctly
2. Verify the Axiom dataset exists
3. Check browser console for transport errors
4. Logs are buffered and sent every 5 seconds

### Sentry Not Capturing Errors

1. Verify `SENTRY_DSN` is set correctly
2. Check browser console for initialization errors
3. Ensure Sentry is initialized before errors occur
4. Check if errors are being filtered by `beforeSend`

### High Log Volume

1. Adjust `SENTRY_TRACES_SAMPLE_RATE` (default: 0.1 = 10%)
2. Use log levels appropriately in production
3. Filter out expected errors in `beforeSend`

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `AXIOM_TOKEN` | Yes (for Axiom) | Axiom API token |
| `AXIOM_DATASET` | Yes (for Axiom) | Axiom dataset name |
| `AXIOM_URL` | No | Custom Axiom URL |
| `SENTRY_DSN` | Yes (for Sentry) | Sentry DSN |
| `SENTRY_URL` | No | Custom Sentry URL |
| `SENTRY_ENVIRONMENT` | No | Environment tag (default: NODE_ENV) |
| `SENTRY_RELEASE` | No | Release version |
| `SENTRY_TRACES_SAMPLE_RATE` | No | Performance sample rate (default: 0.1) |
| `SENTRY_PROFILES_SAMPLE_RATE` | No | Profiling sample rate (default: 0.1) |
| `SENTRY_DEBUG` | No | Debug mode (default: false) |

---

## Migration from Console Logging

If you're migrating from console.log statements:

1. Replace `console.log` with `logger.info`
2. Replace `console.warn` with `logger.warn`
3. Replace `console.error` with `logger.error` or `logError()`
4. Add structured context objects instead of string interpolation

```typescript
// Before
console.log(`User ${userId} logged in from ${ip}`);

// After
logger.info('User logged in', { userId, ip });
```
