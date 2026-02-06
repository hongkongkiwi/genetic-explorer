/**
 * Users Domain Queries
 * 
 * User management, profiles, and authentication queries.
 * These will eventually replace the functions in database-legacy.ts
 */

import { getDb } from '../database-legacy';
import type { User, UserProfile } from './index';

// Valid column names for UPDATE operations (prevents SQL injection)
const VALID_USER_COLUMNS = ['email', 'display_name', 'is_active'] as const;
const VALID_PROFILE_COLUMNS = ['bio', 'birth_date', 'sex', 'ancestry', 'timezone', 'notification_preferences', 'privacy_settings'] as const;

/**
 * Validate column names to prevent SQL injection in dynamic UPDATE queries
 */
function validateColumns(columns: string[], validColumns: readonly string[]): void {
  for (const col of columns) {
    if (!validColumns.includes(col)) {
      throw new Error(`Invalid column name: ${col}`);
    }
  }
}

/**
 * Find user by ID
 */
export function findUserById(id: string): User | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

/**
 * Find user by email
 */
export function findUserByEmail(email: string): User | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
}

/**
 * Create a new user
 */
export function createUser(data: {
  id: string;
  email: string;
  passwordHash: string;
  displayName?: string;
}): User {
  const db = getDb();
  const { id, email, passwordHash, displayName } = data;
  
  db.prepare(`
    INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(id, email, passwordHash, displayName || null);
  
  return findUserById(id)!;
}

/**
 * Update user
 */
export function updateUser(
  id: string,
  data: Partial<Pick<User, 'email' | 'displayName' | 'isActive'>>
): User | undefined {
  const db = getDb();
  const sets: string[] = [];
  const values: unknown[] = [];
  
  if (data.email !== undefined) {
    sets.push('email = ?');
    values.push(data.email);
  }
  if (data.displayName !== undefined) {
    sets.push('display_name = ?');
    values.push(data.displayName);
  }
  if (data.isActive !== undefined) {
    sets.push('is_active = ?');
    values.push(data.isActive ? 1 : 0);
  }
  
  if (sets.length === 0) return findUserById(id);
  
  sets.push('updated_at = datetime("now")');
  values.push(id);
  
  // Validate column names before constructing query (defense-in-depth)
  const columnNames = sets.map(s => s.split(' ')[0]);
  validateColumns(columnNames, VALID_USER_COLUMNS);
  
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  return findUserById(id);
}

/**
 * Update last login timestamp
 */
export function updateLastLogin(id: string): void {
  const db = getDb();
  db.prepare('UPDATE users SET last_login_at = datetime("now") WHERE id = ?').run(id);
}

/**
 * Get user profile
 */
export function getUserProfile(userId: string): UserProfile | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as UserProfile | undefined;
}

/**
 * Create or update user profile
 */
export function upsertUserProfile(
  userId: string,
  data: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): UserProfile {
  const db = getDb();
  const existing = getUserProfile(userId);
  
  if (existing) {
    // Update
    const sets: string[] = [];
    const values: unknown[] = [];
    
    if (data.bio !== undefined) {
      sets.push('bio = ?');
      values.push(data.bio);
    }
    if (data.birthDate !== undefined) {
      sets.push('birth_date = ?');
      values.push(data.birthDate);
    }
    if (data.sex !== undefined) {
      sets.push('sex = ?');
      values.push(data.sex);
    }
    if (data.ancestry !== undefined) {
      sets.push('ancestry = ?');
      values.push(data.ancestry);
    }
    if (data.timezone !== undefined) {
      sets.push('timezone = ?');
      values.push(data.timezone);
    }
    if (data.notificationPreferences !== undefined) {
      sets.push('notification_preferences = ?');
      values.push(JSON.stringify(data.notificationPreferences));
    }
    if (data.privacySettings !== undefined) {
      sets.push('privacy_settings = ?');
      values.push(JSON.stringify(data.privacySettings));
    }
    
    if (sets.length > 0) {
      sets.push('updated_at = datetime("now")');
      values.push(userId);
      db.prepare(`UPDATE profiles SET ${sets.join(', ')} WHERE user_id = ?`).run(...values);
    }
  } else {
    // Create
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO profiles (
        id, user_id, bio, birth_date, sex, ancestry, timezone,
        notification_preferences, privacy_settings, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      id,
      userId,
      data.bio || null,
      data.birthDate || null,
      data.sex || null,
      data.ancestry || null,
      data.timezone || 'UTC',
      data.notificationPreferences ? JSON.stringify(data.notificationPreferences) : '{}',
      data.privacySettings ? JSON.stringify(data.privacySettings) : '{"share_anonymized": false, "allow_family_sharing": true}'
    );
  }
  
  return getUserProfile(userId)!;
}

/**
 * Delete user and all associated data
 */
export function deleteUser(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return result.changes > 0;
}
