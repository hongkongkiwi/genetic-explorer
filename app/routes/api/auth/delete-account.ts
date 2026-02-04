import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
import { csrfProtection } from '~/utils/csrf';
import { getDb } from '~/utils/database';
import { existsSync, unlinkSync } from 'fs';
import crypto from 'crypto';

function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
  } catch {
    return false;
  }
}

export const APIRoute = createAPIFileRoute('/api/auth/delete-account')({
  POST: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      // CSRF protection
      const cookieHeader = request.headers.get('cookie');
      const csrfCheck = csrfProtection(request, cookieHeader);
      if (csrfCheck.valid === false) {
        return json({ success: false, error: csrfCheck.error }, { status: csrfCheck.status });
      }

      const body = await request.json();
      const { password } = body;

      if (!password) {
        return json({ success: false, error: 'Password is required' }, { status: 400 });
      }

      const db = getDb();

      // Verify password
      const user = db.prepare(`SELECT password_hash FROM users WHERE id = ?`).get(auth.id) as any;
      if (!user) {
        return json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const [salt, hash] = user.password_hash.split(':');
      if (!verifyPassword(password, hash, salt)) {
        return json({ success: false, error: 'Incorrect password' }, { status: 401 });
      }

      // Get all user's genomes to delete files
      const genomes = db.prepare(`SELECT id, storage_path FROM genomes WHERE user_id = ?`).all(auth.id) as any[];

      // Delete genome files
      for (const genome of genomes) {
        if (genome.storage_path && existsSync(genome.storage_path)) {
          try {
            unlinkSync(genome.storage_path);
          } catch (err) {
            console.error(`Failed to delete genome file ${genome.id}:`, err);
          }
        }
      }

      // Delete user's 2FA data
      db.prepare(`DELETE FROM totp_secrets WHERE user_id = ?`).run(auth.id);
      db.prepare(`DELETE FROM backup_codes WHERE user_id = ?`).run(auth.id);
      db.prepare(`DELETE FROM passkeys WHERE user_id = ?`).run(auth.id);

      // Delete user's OAuth connections
      db.prepare(`DELETE FROM oauth_accounts WHERE user_id = ?`).run(auth.id);

      // Delete user's privacy settings
      db.prepare(`DELETE FROM user_privacy_settings WHERE user_id = ?`).run(auth.id);

      // Delete user's relative matching preferences
      db.prepare(`DELETE FROM relative_matching_preferences WHERE user_id = ?`).run(auth.id);

      // Delete user's sharing permissions (where they are owner or recipient)
      db.prepare(`DELETE FROM sharing_permissions WHERE owner_id = ? OR recipient_id = ?`).run(auth.id, auth.id);

      // Delete user's sharing invites
      db.prepare(`DELETE FROM sharing_invites WHERE owner_id = ? OR recipient_email = (SELECT email FROM users WHERE id = ?)`).run(auth.id, auth.id);

      // Delete user's sessions
      db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(auth.id);

      // Delete user's activity logs
      db.prepare(`DELETE FROM activity_logs WHERE user_id = ?`).run(auth.id);

      // Delete user's password resets
      db.prepare(`DELETE FROM password_resets WHERE user_id = ?`).run(auth.id);

      // Delete user's email verifications
      db.prepare(`DELETE FROM email_verifications WHERE user_id = ?`).run(auth.id);

      // Delete user's profile
      db.prepare(`DELETE FROM profiles WHERE user_id = ?`).run(auth.id);

      // Delete user's genomes (cascades to snps and reports)
      db.prepare(`DELETE FROM genomes WHERE user_id = ?`).run(auth.id);
      
      // Delete user's SNP favorites
      db.prepare(`DELETE FROM snp_favorites WHERE user_id = ?`).run(auth.id);

      // Finally, delete the user
      db.prepare(`DELETE FROM users WHERE id = ?`).run(auth.id);

      return json({ 
        success: true, 
        message: 'Account and all associated data have been permanently deleted' 
      });
    } catch (error) {
      console.error('Delete account error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
