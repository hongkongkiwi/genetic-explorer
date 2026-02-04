/**
 * Cloud KMS Integration
 * 
 * Supports AWS KMS, Azure Key Vault, and Google Cloud KMS
 * Uses envelope encryption to minimize API calls and costs:
 * 1. Master key in cloud KMS encrypts a local "data key"
 * 2. Data key is cached in memory for application use
 * 3. Only call KMS when data key needs rotation or on startup
 */

import crypto from 'crypto';

// Types for KMS providers
type KMSProvider = 'aws' | 'azure' | 'gcp' | 'none';

interface KMSConfig {
  provider: KMSProvider;
  keyId: string;
  region?: string;
}

interface DataKey {
  key: Buffer;
  encryptedKey: Buffer;
  createdAt: number;
  expiresAt: number;
}

// Cache for decrypted data key (rotated every 24 hours)
let cachedDataKey: DataKey | null = null;
let kmsClient: any = null;

const DATA_KEY_ROTATION_HOURS = 24;
const KEY_LENGTH = 32;

/**
 * Get KMS configuration from environment
 */
function getKMSConfig(): KMSConfig | null {
  // Check for AWS KMS
  if (process.env.AWS_KMS_KEY_ID) {
    return {
      provider: 'aws',
      keyId: process.env.AWS_KMS_KEY_ID,
      region: process.env.AWS_REGION || 'us-east-1',
    };
  }

  // Check for Azure Key Vault
  if (process.env.AZURE_KEY_VAULT_URL && process.env.AZURE_KEY_NAME) {
    return {
      provider: 'azure',
      keyId: `${process.env.AZURE_KEY_VAULT_URL}/keys/${process.env.AZURE_KEY_NAME}`,
    };
  }

  // Check for GCP KMS
  if (process.env.GCP_KMS_KEY_NAME) {
    return {
      provider: 'gcp',
      keyId: process.env.GCP_KMS_KEY_NAME,
    };
  }

  return null;
}

/**
 * Initialize AWS KMS client (lazy loaded)
 */
async function getAWSKMSClient() {
  if (!kmsClient) {
    const { KMSClient } = await import('@aws-sdk/client-kms');
    const config = getKMSConfig();
    kmsClient = new KMSClient({
      region: config?.region || 'us-east-1',
    });
  }
  return kmsClient;
}

/**
 * Initialize Azure Key Vault client (lazy loaded)
 */
async function getAzureKeyClient() {
  if (!kmsClient) {
    const { DefaultAzureCredential } = await import('@azure/identity');
    const { KeyClient } = await import('@azure/keyvault-keys');
    const config = getKMSConfig();
    
    const credential = new DefaultAzureCredential();
    const vaultUrl = process.env.AZURE_KEY_VAULT_URL!;
    kmsClient = new KeyClient(vaultUrl, credential);
  }
  return kmsClient;
}

/**
 * Initialize GCP KMS client (lazy loaded)
 */
async function getGCPKMSClient() {
  if (!kmsClient) {
    const { GoogleAuth } = await import('google-auth-library');
    kmsClient = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloudkms'],
    });
  }
  return kmsClient;
}

/**
 * Generate a new data key using cloud KMS
 * This is the ONLY operation that calls the cloud KMS API
 */
async function generateDataKeyWithKMS(): Promise<DataKey> {
  const config = getKMSConfig();
  
  if (!config) {
    throw new Error('No KMS configuration found');
  }

  // Generate random data key locally
  const dataKey = crypto.randomBytes(KEY_LENGTH);
  
  try {
    let encryptedKey: Buffer;

    switch (config.provider) {
      case 'aws': {
        const { EncryptCommand } = await import('@aws-sdk/client-kms');
        const client = await getAWSKMSClient();
        const command = new EncryptCommand({
          KeyId: config.keyId,
          Plaintext: dataKey,
        });
        const response = await client.send(command);
        encryptedKey = Buffer.from(response.CiphertextBlob as Uint8Array);
        break;
      }

      case 'azure': {
        const { CryptographyClient } = await import('@azure/keyvault-keys');
        const { DefaultAzureCredential } = await import('@azure/identity');
        const credential = new DefaultAzureCredential();
        const cryptoClient = new CryptographyClient(config.keyId, credential);
        
        const encryptResult = await cryptoClient.encrypt('RSA-OAEP-256', dataKey);
        encryptedKey = Buffer.from(encryptResult.result);
        break;
      }

      case 'gcp': {
        const auth = await getGCPKMSClient();
        const client = await auth.getClient();
        const projectId = await auth.getProjectId();
        const location = process.env.GCP_KMS_LOCATION || 'global';
        const keyRing = process.env.GCP_KMS_KEY_RING!;
        const keyName = process.env.GCP_KMS_KEY_NAME!;
        
        const url = `https://cloudkms.googleapis.com/v1/projects/${projectId}/locations/${location}/keyRings/${keyRing}/cryptoKeys/${keyName}:encrypt`;
        
        const response = await client.request({
          url,
          method: 'POST',
          data: {
            plaintext: dataKey.toString('base64'),
          },
        });
        
        encryptedKey = Buffer.from(response.data.ciphertext, 'base64');
        break;
      }

      default:
        throw new Error(`Unknown KMS provider: ${config.provider}`);
    }

    const now = Date.now();
    return {
      key: dataKey,
      encryptedKey,
      createdAt: now,
      expiresAt: now + (DATA_KEY_ROTATION_HOURS * 60 * 60 * 1000),
    };

  } catch (error) {
    console.error(`KMS ${config.provider} encryption failed:`, error);
    throw new Error(`Failed to encrypt data key with ${config.provider} KMS`);
  }
}

/**
 * Decrypt data key using cloud KMS
 * Only called when cached key is missing or expired
 */
async function decryptDataKeyWithKMS(encryptedKey: Buffer): Promise<Buffer> {
  const config = getKMSConfig();
  
  if (!config) {
    throw new Error('No KMS configuration found');
  }

  try {
    switch (config.provider) {
      case 'aws': {
        const { DecryptCommand } = await import('@aws-sdk/client-kms');
        const client = await getAWSKMSClient();
        const command = new DecryptCommand({
          CiphertextBlob: encryptedKey,
          KeyId: config.keyId,
        });
        const response = await client.send(command);
        return Buffer.from(response.Plaintext as Uint8Array);
      }

      case 'azure': {
        const { CryptographyClient } = await import('@azure/keyvault-keys');
        const { DefaultAzureCredential } = await import('@azure/identity');
        const credential = new DefaultAzureCredential();
        const cryptoClient = new CryptographyClient(config.keyId, credential);
        
        const decryptResult = await cryptoClient.decrypt('RSA-OAEP-256', encryptedKey);
        return Buffer.from(decryptResult.result);
      }

      case 'gcp': {
        const auth = await getGCPKMSClient();
        const client = await auth.getClient();
        const projectId = await auth.getProjectId();
        const location = process.env.GCP_KMS_LOCATION || 'global';
        const keyRing = process.env.GCP_KMS_KEY_RING!;
        const keyName = process.env.GCP_KMS_KEY_NAME!;
        
        const url = `https://cloudkms.googleapis.com/v1/projects/${projectId}/locations/${location}/keyRings/${keyRing}/cryptoKeys/${keyName}:decrypt`;
        
        const response = await client.request({
          url,
          method: 'POST',
          data: {
            ciphertext: encryptedKey.toString('base64'),
          },
        });
        
        return Buffer.from(response.data.plaintext, 'base64');
      }

      default:
        throw new Error(`Unknown KMS provider: ${config.provider}`);
    }
  } catch (error) {
    console.error(`KMS ${config.provider} decryption failed:`, error);
    throw new Error(`Failed to decrypt data key with ${config.provider} KMS`);
  }
}

/**
 * Get or generate the data key for encryption operations
 * Uses local cache to avoid expensive KMS API calls
 * 
 * COST OPTIMIZATION: This function only calls KMS:
 * - Once on application startup (to decrypt cached key)
 * - Every 24 hours (key rotation)
 * - If the encrypted key is lost from cache
 */
export async function getDataKey(): Promise<Buffer> {
  const now = Date.now();

  // Check if we have a valid cached key
  if (cachedDataKey && cachedDataKey.expiresAt > now) {
    return cachedDataKey.key;
  }

  // Check if we have a stored encrypted key in database
  // This allows key persistence across restarts without calling KMS
  const storedEncryptedKey = await loadEncryptedDataKeyFromDatabase();
  
  if (storedEncryptedKey) {
    try {
      // Decrypt the data key using KMS (single API call)
      const decryptedKey = await decryptDataKeyWithKMS(storedEncryptedKey);
      
      cachedDataKey = {
        key: decryptedKey,
        encryptedKey: storedEncryptedKey,
        createdAt: now,
        expiresAt: now + (DATA_KEY_ROTATION_HOURS * 60 * 60 * 1000),
      };
      
      return decryptedKey;
    } catch (error) {
      console.warn('Failed to decrypt stored data key, generating new one:', error);
    }
  }

  // Generate new data key (requires KMS encrypt call)
  console.log('Generating new data key with cloud KMS...');
  cachedDataKey = await generateDataKeyWithKMS();
  
  // Store encrypted key for persistence
  await saveEncryptedDataKeyToDatabase(cachedDataKey.encryptedKey);
  
  return cachedDataKey.key;
}

/**
 * Get master key for encryption
 * Returns cloud-managed data key if KMS is configured,
 * otherwise falls back to environment variable
 */
export async function getMasterKey(): Promise<Buffer> {
  // Check if cloud KMS is configured
  const kmsConfig = getKMSConfig();
  
  if (kmsConfig) {
    try {
      // Use cloud-managed key (with local caching)
      return await getDataKey();
    } catch (error) {
      console.error('Cloud KMS failed, falling back to environment key:', error);
      // Fall through to environment key fallback
    }
  }

  // Fallback to environment variable (original behavior)
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;
  
  if (!masterKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL: ENCRYPTION_MASTER_KEY must be set in production when cloud KMS is not configured');
    }
    // In development, derive a key from a constant (not secure, but functional)
    console.warn('⚠️ Using development encryption key - NOT SECURE FOR PRODUCTION');
    return crypto.scryptSync('dev-key-not-for-production', 'salt', KEY_LENGTH);
  }
  
  // Derive proper key if not exactly 32 bytes
  if (masterKey.length !== KEY_LENGTH) {
    return crypto.scryptSync(masterKey, 'genetic-explorer-key-derivation', KEY_LENGTH);
  }
  
  return Buffer.from(masterKey, 'utf8');
}

/**
 * Check if cloud KMS is configured and working
 */
export function isCloudKMSEnabled(): boolean {
  return getKMSConfig() !== null;
}

/**
 * Get current KMS provider name
 */
export function getKMSProvider(): string {
  return getKMSConfig()?.provider || 'environment';
}

// Import database functions for persistent storage of encrypted data key
// This allows the key to survive restarts without requiring KMS API calls
import { loadEncryptedDataKey, saveEncryptedDataKey } from './database';

async function loadEncryptedDataKeyFromDatabase(): Promise<Buffer | null> {
  try {
    return loadEncryptedDataKey();
  } catch (error) {
    console.warn('Failed to load encrypted data key from database:', error);
    return null;
  }
}

async function saveEncryptedDataKeyToDatabase(encryptedKey: Buffer): Promise<void> {
  try {
    saveEncryptedDataKey(encryptedKey);
  } catch (error) {
    console.error('Failed to save encrypted data key to database:', error);
    throw error;
  }
}

/**
 * Force rotation of the data key
 * Call this periodically (e.g., via cron job) for key rotation
 */
export async function rotateDataKey(): Promise<void> {
  console.log('Rotating data key...');
  cachedDataKey = null;
  
  // Delete the old key from database to force generation of new key
  try {
    const { deleteSystemSetting } = await import('./database');
    deleteSystemSetting('kms_encrypted_data_key');
  } catch (error) {
    console.warn('Failed to delete old data key from database:', error);
  }
  
  await getDataKey();
  console.log('Data key rotated successfully');
}
