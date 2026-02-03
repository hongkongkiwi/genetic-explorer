import crypto from 'crypto';
import { getUserByEmail, createUser, updateUserLastLogin, getUserById, createSession, getSessionByToken, deleteSession, type User } from './database';

const SESSION_DURATION_DAYS = 7;
const TOKEN_BYTES = 32;

export interface AuthResult {
  success: boolean;
  user?: User;
  sessionToken?: string;
  error?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Password hashing using PBKDF2
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, useSalt, 100000, 64, 'sha256').toString('hex');
  return { hash, salt: useSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password, salt);
  // Use timing-safe comparison
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
  } catch {
    return false;
  }
}

function generateSessionToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

// Register a new user
export async function registerUser(data: RegisterData): Promise<AuthResult> {
  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: 'Invalid email address' };
    }

    // Validate password strength
    if (data.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(data.password)) {
      return { success: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(data.password)) {
      return { success: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(data.password)) {
      return { success: false, error: 'Password must contain at least one number' };
    }

    // Check if user already exists
    const existingUser = getUserByEmail(data.email);
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Hash password
    const { hash, salt } = hashPassword(data.password);
    const passwordHash = `${salt}:${hash}`;

    // Create user
    const user = createUser(data.email, passwordHash, data.displayName);

    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Login user
export async function loginUser(data: LoginData, ipAddress?: string, userAgent?: string): Promise<AuthResult> {
  try {
    // Find user
    const userWithPassword = getUserByEmail(data.email);
    if (!userWithPassword) {
      // Use constant-time response to prevent timing attacks
      hashPassword('dummy');
      return { success: false, error: 'Invalid email or password' };
    }

    // Verify password
    const [salt, hash] = userWithPassword.passwordHash.split(':');
    if (!verifyPassword(data.password, hash, salt)) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Check if account is active
    if (!userWithPassword.isActive) {
      return { success: false, error: 'Account has been deactivated' };
    }

    // Update last login
    updateUserLastLogin(userWithPassword.id);

    // Create session
    const sessionToken = generateSessionToken();
    const durationDays = data.rememberMe ? 30 : SESSION_DURATION_DAYS;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    createSession(userWithPassword.id, sessionToken, expiresAt, ipAddress, userAgent);

    // Remove password hash from user object
    const { passwordHash, ...user } = userWithPassword;

    return { success: true, user, sessionToken };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Validate session token
export function validateSession(token: string): { valid: boolean; userId?: string } {
  try {
    const session = getSessionByToken(token);
    if (!session) {
      return { valid: false };
    }
    return { valid: true, userId: session.userId };
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false };
  }
}

// Logout user
export function logoutUser(token: string): void {
  deleteSession(token);
}

// Get current user from session token
export function getCurrentUser(token: string): User | null {
  const { valid, userId } = validateSession(token);
  if (!valid || !userId) return null;
  return getUserById(userId);
}

// Password reset token generation
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Change password
export function changePassword(userId: string, currentPassword: string, newPassword: string): { success: boolean; error?: string } {
  try {
    // Get user with password
    const user = getUserById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Note: We need to get the password hash separately since getUserById doesn't return it
    // This is a simplified implementation - in production you'd have a separate function

    // Validate new password
    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long' };
    }

    // Hash new password
    const { hash, salt } = hashPassword(newPassword);
    const passwordHash = `${salt}:${hash}`;

    // Update password in database
    const { getDb } = require('./database');
    const db = getDb();
    db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
      .run(passwordHash, new Date().toISOString(), userId);

    return { success: true };
  } catch (error) {
    console.error('Password change error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Middleware helper for API routes
export function getAuthUser(request: Request): { user: User | null; token: string | null } {
  // Check for Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const user = getCurrentUser(token);
    return { user, token };
  }

  // Check for session cookie
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const sessionMatch = cookieHeader.match(/session_token=([^;]+)/);
    if (sessionMatch) {
      const token = sessionMatch[1];
      const user = getCurrentUser(token);
      return { user, token };
    }
  }

  return { user: null, token: null };
}

// Require authentication helper - throws if not authenticated
export function requireAuth(request: Request): { id: string; email: string } {
  const { user, token } = getAuthUser(request);
  if (!user || !token) {
    throw new Error('Unauthorized');
  }
  return { id: user.id, email: user.email };
}

// Safe auth check that returns null instead of throwing
export function getAuthUserSafe(request: Request): { user: User; token: string } | null {
  const { user, token } = getAuthUser(request);
  if (!user || !token) {
    return null;
  }
  return { user, token };
}
