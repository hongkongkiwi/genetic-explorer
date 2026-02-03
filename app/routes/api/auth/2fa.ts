import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
import {
  generateTotpSecret,
  getTotpUri,
  verifyTotpCode,
  generateBackupCodes,
  hashBackupCode,
  getPasskeyRegistrationOptions,
  getPasskeyAuthenticationOptions,
} from '~/utils/twoFactor';
import {
  saveTotpSecret,
  getTotpSecret,
  deleteTotpSecret,
  saveBackupCodes,
  savePasskey,
  deleteAllPasskeys,
  setTwoFactorEnabled,
  isTwoFactorEnabled,
  getTwoFactorStatus,
  getBackupCodesCount,
} from '~/utils/database';
import { logActivity } from '~/utils/database';
import { getClientIp } from '~/utils/rateLimit';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// POST: Setup TOTP - Generate secret
// ============================================================================

export const APIRouteSetup = createAPIFileRoute('/api/auth/2fa/setup')({
  POST: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const ipAddress = getClientIp(request);
      const body = await request.json();
      const { method } = body;

      if (!method || !['totp', 'passkey'].includes(method)) {
        return json({ success: false, error: 'Invalid method. Use "totp" or "passkey".' }, { status: 400 });
      }

      // Check if 2FA is already enabled
      if (isTwoFactorEnabled(auth.id)) {
        return json({ success: false, error: '2FA is already enabled. Disable it first to reconfigure.' }, { status: 400 });
      }

      if (method === 'totp') {
        // Generate new TOTP secret
        const secret = generateTotpSecret();
        const totpUri = getTotpUri(secret, auth.email);

        // Store secret temporarily (not enabled yet)
        saveTotpSecret(auth.id, secret);

        logActivity(auth.id, '2fa_totp_setup_started', 'user', auth.id, {}, ipAddress);

        return json({
          success: true,
          method: 'totp',
          secret, // Show secret for manual entry
          uri: totpUri, // QR code URI
          message: 'Scan this QR code with your authenticator app, then verify with a code.',
        });
      }

      if (method === 'passkey') {
        // Get existing passkeys for this user
        const { getPasskeys } = require('~/utils/database');
        const existingCredentials = getPasskeys(auth.id).map((p: any) => p.credentialId);

        // Generate registration options
        const options = getPasskeyRegistrationOptions(
          auth.id,
          auth.email,
          auth.user?.displayName || auth.email,
          existingCredentials
        );

        // Store challenge temporarily for verification
        const { savePasskeyChallenge } = require('~/utils/twoFactor');
        savePasskeyChallenge(auth.id, options.challenge);

        logActivity(auth.id, '2fa_passkey_setup_started', 'user', auth.id, {}, ipAddress);

        return json({
          success: true,
          method: 'passkey',
          options,
        });
      }

      return json({ success: false, error: 'Unknown method' }, { status: 400 });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('2FA setup error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});

// ============================================================================
// POST: Verify TOTP or Passkey and enable 2FA
// ============================================================================

export const APIRouteVerify = createAPIFileRoute('/api/auth/2fa/verify')({
  POST: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const ipAddress = getClientIp(request);
      const body = await request.json();
      const { method, code, passkeyResponse } = body;

      if (!method || !['totp', 'passkey', 'email', 'backup'].includes(method)) {
        return json({ success: false, error: 'Invalid method' }, { status: 400 });
      }

      let isValid = false;
      let verificationData: any = {};

      if (method === 'totp') {
        if (!code) {
          return json({ success: false, error: 'Verification code required' }, { status: 400 });
        }

        const secret = getTotpSecret(auth.id);
        if (!secret) {
          return json({ success: false, error: 'No TOTP secret found. Start setup first.' }, { status: 400 });
        }

        isValid = verifyTotpCode(secret, code);

        if (isValid) {
          // Generate backup codes
          const backupCodes = generateBackupCodes();
          const hashedCodes = backupCodes.map((code: string) => hashBackupCode(code, auth.id));
          saveBackupCodes(auth.id, hashedCodes);

          // Enable 2FA
          setTwoFactorEnabled(auth.id, true);

          logActivity(auth.id, '2fa_enabled', 'user', auth.id, { method: 'totp' }, ipAddress);

          verificationData = {
            backupCodes: backupCodes, // Return raw codes (only time they're visible)
            message: '2FA enabled successfully! Save these backup codes in a safe place.',
          };
        }
      } else if (method === 'passkey') {
        if (!passkeyResponse) {
          return json({ success: false, error: 'Passkey response required' }, { status: 400 });
        }

        // Verify passkey registration
        const { verifyPasskeyRegistration } = require('~/utils/twoFactor');
        const verificationResult = await verifyPasskeyRegistration(auth.id, passkeyResponse);

        if (verificationResult.valid) {
          // Save the passkey
          savePasskey(
            auth.id,
            passkeyResponse.id,
            passkeyResponse.rawId,
            0 // Initial counter
          );

          // Generate backup codes
          const backupCodes = generateBackupCodes();
          const hashedCodes = backupCodes.map((code: string) => hashBackupCode(code, auth.id));
          saveBackupCodes(auth.id, hashedCodes);

          // Enable 2FA
          setTwoFactorEnabled(auth.id, true);

          logActivity(auth.id, '2fa_enabled', 'user', auth.id, { method: 'passkey' }, ipAddress);

          verificationData = {
            backupCodes: backupCodes,
            message: 'Passkey registered successfully! Save these backup codes in a safe place.',
          };
        } else {
          isValid = false;
        }
      } else if (method === 'email') {
        // Email code verification
        const { verifyEmailCode } = require('~/utils/twoFactor');
        isValid = verifyEmailCode(auth.email, code);

        if (isValid) {
          // Generate TOTP secret and backup codes
          const secret = generateTotpSecret();
          saveTotpSecret(auth.id, secret);

          const backupCodes = generateBackupCodes();
          const hashedCodes = backupCodes.map((code: string) => hashBackupCode(code, auth.id));
          saveBackupCodes(auth.id, hashedCodes);

          setTwoFactorEnabled(auth.id, true);

          logActivity(auth.id, '2fa_enabled', 'user', auth.id, { method: 'email' }, ipAddress);

          verificationData = {
            message: '2FA enabled successfully! Use an authenticator app for future logins.',
          };
        }
      } else if (method === 'backup') {
        // Backup code verification (admin fallback)
        const { verifyAndUseBackupCode } = require('~/utils/database');
        isValid = verifyAndUseBackupCode(auth.id, code);

        if (isValid) {
          const backupCodes = generateBackupCodes();
          const hashedCodes = backupCodes.map((code: string) => hashBackupCode(code, auth.id));
          saveBackupCodes(auth.id, hashedCodes);

          setTwoFactorEnabled(auth.id, true);

          logActivity(auth.id, '2fa_enabled', 'user', auth.id, { method: 'backup' }, ipAddress);

          verificationData = {
            backupCodes: backupCodes,
            message: '2FA enabled via backup code! Save new backup codes.',
          };
        }
      }

      if (!isValid) {
        logActivity(auth.id, '2fa_verification_failed', 'user', auth.id, { method }, ipAddress);
        return json({ success: false, error: 'Invalid verification code' }, { status: 401 });
      }

      return json({
        success: true,
        ...verificationData,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('2FA verification error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});

// ============================================================================
// GET: Get 2FA status
// ============================================================================

export const APIRouteStatus = createAPIFileRoute('/api/auth/2fa/status')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);

      const status = getTwoFactorStatus(auth.id);

      return json({
        success: true,
        status: {
          enabled: status.enabled,
          methods: {
            totp: status.totpEnabled,
            passkey: status.passkeyEnabled,
            email: status.emailEnabled,
          },
          backupCodesRemaining: status.backupCodesRemaining,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('2FA status error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});

// ============================================================================
// POST: Disable 2FA
// ============================================================================

export const APIRouteDisable = createAPIFileRoute('/api/auth/2fa/disable')({
  POST: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const ipAddress = getClientIp(request);
      const body = await request.json();
      const { password, twoFactor } = body;

      // Verify password
      const { getUserByEmail } = require('~/utils/database');
      const user = getUserByEmail(auth.email);
      if (user && user.passwordHash) {
        const crypto = require('crypto');
        const [salt, hash] = user.passwordHash.split(':');
        const { hash: computedHash } = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
        if (computedHash !== hash) {
          logActivity(auth.id, '2fa_disable_failed', 'user', auth.id, { reason: 'invalid_password' }, ipAddress);
          return json({ success: false, error: 'Invalid password' }, { status: 401 });
        }
      }

      // Verify 2FA if provided
      if (twoFactor && twoFactor.code) {
        const { verifyTotpCode, verifyEmailCode } = require('~/utils/twoFactor');
        let is2faValid = false;

        if (twoFactor.method === 'totp') {
          const secret = getTotpSecret(auth.id);
          if (secret) {
            is2faValid = verifyTotpCode(secret, twoFactor.code);
          }
        } else if (twoFactor.method === 'email') {
          is2faValid = verifyEmailCode(auth.email, twoFactor.code);
        }

        if (!is2faValid) {
          logActivity(auth.id, '2fa_disable_failed', 'user', auth.id, { reason: 'invalid_2fa' }, ipAddress);
          return json({ success: false, error: 'Invalid 2FA code' }, { status: 401 });
        }
      }

      // Disable 2FA
      deleteTotpSecret(auth.id);
      deleteAllPasskeys(auth.id);
      setTwoFactorEnabled(auth.id, false);

      logActivity(auth.id, '2fa_disabled', 'user', auth.id, {}, ipAddress);

      return json({
        success: true,
        message: '2FA has been disabled.',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('2FA disable error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});

// ============================================================================
// POST: Generate new backup codes
// ============================================================================

export const APIRouteRegenerateBackupCodes = createAPIFileRoute('/api/auth/2fa/backup-codes')({
  POST: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const ipAddress = getClientIp(request);
      const body = await request.json();
      const { password, twoFactor } = body;

      // Verify 2FA is enabled
      if (!isTwoFactorEnabled(auth.id)) {
        return json({ success: false, error: '2FA must be enabled first' }, { status: 400 });
      }

      // Verify password
      const { getUserByEmail } = require('~/utils/database');
      const user = getUserByEmail(auth.email);
      if (user && user.passwordHash) {
        const crypto = require('crypto');
        const [salt, hash] = user.passwordHash.split(':');
        const { hash: computedHash } = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
        if (computedHash !== hash) {
          logActivity(auth.id, 'backup_codes_regen_failed', 'user', auth.id, { reason: 'invalid_password' }, ipAddress);
          return json({ success: false, error: 'Invalid password' }, { status: 401 });
        }
      }

      // Verify 2FA
      if (twoFactor && twoFactor.code) {
        const { verifyTotpCode, verifyEmailCode } = require('~/utils/twoFactor');
        let is2faValid = false;

        if (twoFactor.method === 'totp') {
          const secret = getTotpSecret(auth.id);
          if (secret) {
            is2faValid = verifyTotpCode(secret, twoFactor.code);
          }
        } else if (twoFactor.method === 'email') {
          is2faValid = verifyEmailCode(auth.email, twoFactor.code);
        }

        if (!is2faValid) {
          logActivity(auth.id, 'backup_codes_regen_failed', 'user', auth.id, { reason: 'invalid_2fa' }, ipAddress);
          return json({ success: false, error: 'Invalid 2FA code' }, { status: 401 });
        }
      }

      // Generate new backup codes
      const backupCodes = generateBackupCodes();
      const hashedCodes = backupCodes.map(hashBackupCode);
      saveBackupCodes(auth.id, hashedCodes);

      logActivity(auth.id, 'backup_codes_regenerated', 'user', auth.id, {}, ipAddress);

      return json({
        success: true,
        backupCodes,
        message: 'New backup codes generated. Old codes are no longer valid.',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Backup codes regeneration error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});

// ============================================================================
// GET: Get passkey authentication options
// ============================================================================

export const APIRoutePasskeyAuth = createAPIFileRoute('/api/auth/2fa/passkey-auth')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);

      // Get user's passkeys
      const { getPasskeys } = require('~/utils/database');
      const passkeys = getPasskeys(auth.id);

      if (passkeys.length === 0) {
        return json({ success: false, error: 'No passkeys registered' }, { status: 400 });
      }

      const credentialIds = passkeys.map((p: any) => p.credentialId);
      const options = getPasskeyAuthenticationOptions(auth.id, credentialIds);

      return json({
        success: true,
        options,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Passkey auth options error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
