# KMS Data Key Persistence

## How It Works

Our Cloud KMS integration uses **envelope encryption** with persistent storage to minimize API costs and handle restarts gracefully.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Cloud KMS (AWS/Azure/GCP)                    │
│                          Master Key                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Encrypt/Decrypt (1 call per restart)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Encrypted Data Key                           │
│            (Stored in SQLite - system_settings table)           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Load on startup (no API call)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Memory Cache                     │
│                 (Plaintext Data Key - 24hr TTL)                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ All encryption/decryption operations
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      User Data (SNPs, PII)                      │
│                    (AES-256-GCM encrypted)                      │
└─────────────────────────────────────────────────────────────────┘
```

### The Problem: Restarts

**Without persistence:**
1. App starts → No data key in memory
2. Must call Cloud KMS to decrypt/generate data key
3. Every restart = 1 API call per instance
4. In a multi-instance deployment with frequent restarts, costs add up

**With persistence:**
1. App starts → Checks database for encrypted data key
2. If exists: Load from DB, decrypt with Cloud KMS (1 call)
3. If not exists: Generate new key, encrypt with Cloud KMS, save to DB
4. Subsequent restarts reuse the same encrypted key

### Cost Analysis

| Scenario | Without Persistence | With Persistence |
|----------|-------------------|------------------|
| Single instance, 1 restart/day | 1 API call/day | 1 API call/day |
| 5 instances, 1 restart/day | 5 API calls/day | 1 API call/day |
| 5 instances, 10 restarts/day | 50 API calls/day | 1 API call/day |
| Key rotation (monthly) | +1 call | +1 call |

**AWS KMS Pricing:** $0.03 per 10,000 API calls
- Without persistence: ~$0.135/month (5 instances, frequent restarts)
- With persistence: ~$0.003/month (1 call per day + rotation)

### Database Schema

```sql
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value BLOB NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

The encrypted data key is stored with key = `'kms_encrypted_data_key'`.

### Key Rotation

To rotate the data key:

```typescript
import { rotateDataKey } from '~/utils/kms';

// Call this via admin API or scheduled job
await rotateDataKey();
```

This will:
1. Delete the old key from the database
2. Generate a new data key
3. Encrypt it with Cloud KMS
4. Save the new encrypted key to the database

**Recommendation:** Rotate keys monthly or when an employee with KMS access leaves.

### Security Considerations

1. **Encrypted at rest:** The data key stored in SQLite is encrypted by Cloud KMS
2. **In-memory only:** The plaintext data key only exists in application memory
3. **No key exposure:** Even if someone gets the database file, they can't decrypt without Cloud KMS access
4. **Automatic rotation:** The cached in-memory key expires every 24 hours and is re-decrypted

### Multi-Instance Deployments

All instances share the same encrypted data key from the database:

```
Instance 1 ──┐
Instance 2 ──┼──► SQLite Database (encrypted data key)
Instance 3 ──┘
     │
     └── All use same key, decrypted independently
```

This means:
- All instances can decrypt each other's data
- If one instance rotates the key, others will pick it up on next read
- No need for shared memory or Redis

### Fallback Behavior

If database storage fails:

1. **On load:** Falls back to generating a new data key
2. **On save:** Logs error but continues (will retry on next rotation)
3. **Encryption continues:** Uses in-memory key until restart

### Configuration

No additional configuration needed! The system automatically:
- Detects if Cloud KMS is configured
- Falls back to environment key if not
- Handles database storage transparently

### Monitoring

Check KMS usage in logs:

```
✅ Encryption initialized with aws KMS (envelope encryption)
Generating new data key with cloud KMS...  <- Only on first start or rotation
Data key rotated successfully
```

### Troubleshooting

**Issue:** High KMS API call costs
- **Check:** Are you rotating keys too frequently?
- **Check:** Do you have many instances restarting frequently?
- **Solution:** The persistence layer should handle this. Verify DB is writable.

**Issue:** "Failed to load encrypted data key from database"
- **Cause:** Database might be read-only or corrupted
- **Solution:** Check file permissions on SQLite database

**Issue:** Different instances can't decrypt each other's data
- **Cause:** They might be using different Cloud KMS keys
- **Solution:** Ensure all instances use the same `AWS_KMS_KEY_ID` / `AZURE_KEY_NAME` / `GCP_KMS_KEY_NAME`
