import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import crypto from 'crypto';
import { requireAuth } from '~/utils/auth';
import { getUserByEmail, getUserById, updateUser } from '~/utils/database';
import { logActivity } from '~/utils/database';
import { getClientIp } from '~/utils/rateLimit';

interface ChangeEmailRequest {
  newEmail: string;
  password: string;
}

// Request email change (initiate)
export const APIRoutePost = createAPIFileRoute('/api/auth/change-email')({
  POST: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const body = await request.json() as ChangeEmailRequest;
      const { newEmail, password } = body;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return json({ success: false, error: 'Invalid email format' }, { status: 400 });
      }

      // Verify password
      const user = getUserById(auth.id);
      if (!user || !user.passwordHash) {
        return json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const [salt, hash] = user.passwordHash.split(':');
      const { hash: computedHash } = crypto.pbkdf2Sync(
        password,
        salt,
        100000,
        64,
        'sha256',
      );

      if (computedHash !== hash) {
        const ipAddress = getClientIp(request);
        logActivity(auth.id, 'email_change_failed', 'user', auth.id, { reason: 'invalid_password' }, ipAddress);
        return json({ success: false, error: 'Invalid password' }, { status: 401 });
      }

      // Check if email is already in use
      const existingUser = getUserByEmail(newEmail);
      if (existingUser && existingUser.id !== auth.id) {
        return json({ success: false, error: 'Email address is already in use' }, { status: 400 });
      }

      // Check if email is the same as current
      if (newEmail.toLowerCase() === user.email.toLowerCase()) {
        return json({ success: false, error: 'New email must be different from current email' }, { status: 400 });
      }

      // Update email (in production, you might want to verify the new email first)
      updateUser(auth.id, { email: newEmail });

      const ipAddress = getClientIp(request);
      logActivity(auth.id, 'email_changed', 'user', auth.id, { oldEmail: user.email }, ipAddress);

      return json({
        success: true,
        message: 'Email address updated successfully',
        email: newEmail,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Change email error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
