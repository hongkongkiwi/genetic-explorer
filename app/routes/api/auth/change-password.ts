import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
import { getDb, logActivity } from '~/utils/database';
import { csrfProtection } from '~/utils/csrf';
import crypto from 'crypto';

// Password hashing using PBKDF2
function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password);
  // Use timing-safe comparison
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
  } catch {
    return false;
  }
}

export const APIRoute = createAPIFileRoute('/api/auth/change-password')({
  POST: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      // CSRF protection
      const cookieHeader = request.headers.get('cookie');
      const csrfCheck = csrfProtection(request, cookieHeader);
      if (!csrfCheck.valid) {
        return json({ success: false, error: csrfCheck.error }, { status: csrfCheck.status });
      }

      const body = await request.json();
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return json({ success: false, error: 'Current and new password are required' }, { status: 400 });
      }

      // Validate new password strength
      if (newPassword.length < 8) {
        return json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
      }
      if (!/[A-Z]/.test(newPassword)) {
        return json({ success: false, error: 'Password must contain an uppercase letter' }, { status: 400 });
      }
      if (!/[a-z]/.test(newPassword)) {
        return json({ success: false, error: 'Password must contain a lowercase letter' }, { status: 400 });
      }
      if (!/[0-9]/.test(newPassword)) {
        return json({ success: false, error: 'Password must contain a number' }, { status: 400 });
      }

      const db = getDb();

      // Get user's current password hash
      const user = db.prepare(`SELECT password_hash FROM users WHERE id = ?`).get(auth.id) as any;
      if (!user) {
        return json({ success: false, error: 'User not found' }, { status: 404 });
      }

      // Verify current password
      const [salt, hash] = user.password_hash.split(':');
      if (!verifyPassword(currentPassword, hash, salt)) {
        return json({ success: false, error: 'Current password is incorrect' }, { status: 401 });
      }

      // Hash new password
      const { hash: newHash, salt: newSalt } = hashPassword(newPassword);
      const newPasswordHash = `${newSalt}:${newHash}`;

      // Update password
      db.prepare(`
        UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?
      `).run(newPasswordHash, new Date().toISOString(), auth.id);

      // Log activity
      logActivity(auth.id, 'password_changed', 'user', auth.id);

      return json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
