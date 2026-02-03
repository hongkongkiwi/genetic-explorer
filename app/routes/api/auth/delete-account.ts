import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { requireAuth } from '~/utils/auth';
import { getDb } from '~/utils/database';
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

      const body = await request.json();
      const { password } = body;

      if (!password) {
        return json({ success: false, error: 'Password is required' }, { status: 400 });
      }

      const db = getDb();

      // Verify password
      const user = db.prepare(`SELECT password_hash FROM users WHERE id = ?`).get(auth.user.id) as any;
      if (!user) {
        return json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const [salt, hash] = user.password_hash.split(':');
      if (!verifyPassword(password, hash, salt)) {
        return json({ success: false, error: 'Incorrect password' }, { status: 401 });
      }

      // Get all user's genomes to delete files
      const genomes = db.prepare(`SELECT id, storage_path FROM genomes WHERE user_id = ?`).all(auth.user.id) as any[];

      // Delete genome files
      const fs = await import('fs');
      for (const genome of genomes) {
        if (genome.storage_path && fs.existsSync(genome.storage_path)) {
          try {
            fs.unlinkSync(genome.storage_path);
          } catch (err) {
            console.error(`Failed to delete genome file ${genome.id}:`, err);
          }
        }
      }

      // Delete user's sharing permissions (where they are owner)
      db.prepare(`DELETE FROM sharing_permissions WHERE owner_id = ?`).run(auth.user.id);

      // Delete user's sharing invites
      db.prepare(`DELETE FROM sharing_invites WHERE owner_id = ?`).run(auth.user.id);

      // Delete user's sessions
      db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(auth.user.id);

      // Delete user's activity logs
      db.prepare(`DELETE FROM activity_logs WHERE user_id = ?`).run(auth.user.id);

      // Delete user's password resets
      db.prepare(`DELETE FROM password_resets WHERE user_id = ?`).run(auth.user.id);

      // Delete user's email verifications
      db.prepare(`DELETE FROM email_verifications WHERE user_id = ?`).run(auth.user.id);

      // Delete user's profile
      db.prepare(`DELETE FROM profiles WHERE user_id = ?`).run(auth.user.id);

      // Delete user's genomes (cascades to snps and reports)
      db.prepare(`DELETE FROM genomes WHERE user_id = ?`).run(auth.user.id);

      // Finally, delete the user
      db.prepare(`DELETE FROM users WHERE id = ?`).run(auth.user.id);

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
