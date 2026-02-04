/**
 * Session Management
 * 
 * Provides enhanced session tracking and management capabilities
 */

import { getDb } from '~/db';
import crypto from 'crypto';

export interface SessionInfo {
  id: string;
  token: string;
  createdAt: string;
  lastActiveAt: string | null;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrentSession: boolean;
  deviceInfo: {
    browser: string | null;
    os: string | null;
    device: string | null;
  };
  location?: {
    country?: string;
    city?: string;
  };
}

export interface SessionHistoryEntry {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  endedAt: string | null;
  endedReason: string | null;
  deviceInfo: {
    browser: string | null;
    os: string | null;
    device: string | null;
  };
}

const SESSION_HISTORY_DAYS = 90; // Keep 90 days of session history

/**
 * Initialize session management tables
 */
export function initSessionManagementTables(): void {
  const db = getDb();

  // Session history table - tracks ended sessions for audit
  db.exec(`
    CREATE TABLE IF NOT EXISTS session_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      device_info TEXT,
      location_info TEXT,
      started_at DATETIME NOT NULL,
      ended_at DATETIME,
      ended_reason TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_session_history_user_id ON session_history(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_session_history_started_at ON session_history(started_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_session_history_ended_at ON session_history(ended_at)`);
}

/**
 * Get all active sessions for a user
 */
export function getUserSessions(userId: string, currentToken?: string): SessionInfo[] {
  const db = getDb();
  
  const sessions = db.prepare(`
    SELECT 
      id,
      token,
      created_at,
      last_active_at,
      expires_at,
      ip_address,
      user_agent
    FROM sessions
    WHERE user_id = ? AND expires_at > datetime('now')
    ORDER BY last_active_at DESC NULLS LAST, created_at DESC
  `).all(userId) as Array<{
    id: string;
    token: string;
    created_at: string;
    last_active_at: string | null;
    expires_at: string;
    ip_address: string | null;
    user_agent: string | null;
  }>;

  return sessions.map(session => ({
    id: session.id,
    token: maskToken(session.token),
    createdAt: session.created_at,
    lastActiveAt: session.last_active_at,
    expiresAt: session.expires_at,
    ipAddress: session.ip_address,
    userAgent: session.user_agent,
    isCurrentSession: currentToken ? session.token === currentToken : false,
    deviceInfo: parseDeviceInfo(session.user_agent),
  }));
}

/**
 * Get session history for a user
 */
export function getSessionHistory(userId: string, limit: number = 50): SessionHistoryEntry[] {
  const db = getDb();
  
  const history = db.prepare(`
    SELECT 
      id,
      ip_address,
      user_agent,
      device_info,
      started_at,
      ended_at,
      ended_reason
    FROM session_history
    WHERE user_id = ?
    ORDER BY started_at DESC
    LIMIT ?
  `).all(userId, limit) as Array<{
    id: string;
    ip_address: string | null;
    user_agent: string | null;
    device_info: string | null;
    started_at: string;
    ended_at: string | null;
    ended_reason: string | null;
  }>;

  return history.map(entry => {
    const deviceInfo = entry.device_info ? JSON.parse(entry.device_info) : null;
    return {
      id: entry.id,
      ipAddress: entry.ip_address,
      userAgent: entry.user_agent,
      createdAt: entry.started_at,
      endedAt: entry.ended_at,
      endedReason: entry.ended_reason,
      deviceInfo: deviceInfo || parseDeviceInfo(entry.user_agent),
    };
  });
}

/**
 * Terminate a specific session
 */
export function terminateSession(sessionId: string, userId: string, reason: string = 'user_terminated'): boolean {
  const db = getDb();
  
  // Get session details before deleting
  const session = db.prepare(`
    SELECT * FROM sessions WHERE id = ? AND user_id = ?
  `).get(sessionId, userId) as {
    id: string;
    user_id: string;
    token: string;
    created_at: string;
    ip_address: string | null;
    user_agent: string | null;
  } | undefined;

  if (!session) {
    return false;
  }

  // Record in session history
  db.prepare(`
    INSERT INTO session_history (
      id, user_id, session_id, ip_address, user_agent, device_info,
      started_at, ended_at, ended_reason
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
  `).run(
    crypto.randomUUID(),
    userId,
    session.id,
    session.ip_address,
    session.user_agent,
    JSON.stringify(parseDeviceInfo(session.user_agent)),
    session.created_at,
    reason
  );

  // Delete the session
  db.prepare(`DELETE FROM sessions WHERE id = ? AND user_id = ?`).run(sessionId, userId);

  return true;
}

/**
 * Terminate all sessions except current one
 */
export function terminateOtherSessions(userId: string, currentToken: string, reason: string = 'user_terminated_all'): number {
  const db = getDb();
  
  // Get all sessions except current
  const sessions = db.prepare(`
    SELECT * FROM sessions 
    WHERE user_id = ? AND token != ? AND expires_at > datetime('now')
  `).all(userId, currentToken) as Array<{
    id: string;
    user_id: string;
    token: string;
    created_at: string;
    ip_address: string | null;
    user_agent: string | null;
  }>;

  let terminatedCount = 0;
  
  for (const session of sessions) {
    // Record in history
    db.prepare(`
      INSERT INTO session_history (
        id, user_id, session_id, ip_address, user_agent, device_info,
        started_at, ended_at, ended_reason
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
    `).run(
      crypto.randomUUID(),
      userId,
      session.id,
      session.ip_address,
      session.user_agent,
      JSON.stringify(parseDeviceInfo(session.user_agent)),
      session.created_at,
      reason
    );

    terminatedCount++;
  }

  // Delete all sessions except current
  db.prepare(`DELETE FROM sessions WHERE user_id = ? AND token != ?`).run(userId, currentToken);

  return terminatedCount;
}

/**
 * Terminate all sessions for a user (e.g., after password change)
 */
export function terminateAllUserSessions(userId: string, reason: string = 'security_action'): number {
  const db = getDb();
  
  // Get all sessions
  const sessions = db.prepare(`
    SELECT * FROM sessions WHERE user_id = ? AND expires_at > datetime('now')
  `).all(userId) as Array<{
    id: string;
    user_id: string;
    token: string;
    created_at: string;
    ip_address: string | null;
    user_agent: string | null;
  }>;

  let terminatedCount = 0;
  
  for (const session of sessions) {
    // Record in history
    db.prepare(`
      INSERT INTO session_history (
        id, user_id, session_id, ip_address, user_agent, device_info,
        started_at, ended_at, ended_reason
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
    `).run(
      crypto.randomUUID(),
      userId,
      session.id,
      session.ip_address,
      session.user_agent,
      JSON.stringify(parseDeviceInfo(session.user_agent)),
      session.created_at,
      reason
    );

    terminatedCount++;
  }

  // Delete all sessions
  db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(userId);

  return terminatedCount;
}

/**
 * Record session activity (update last_active_at)
 */
export function recordSessionActivity(token: string): void {
  const db = getDb();
  
  db.prepare(`
    UPDATE sessions 
    SET last_active_at = datetime('now')
    WHERE token = ? AND expires_at > datetime('now')
  `).run(token);
}

/**
 * Clean up old session history
 */
export function cleanupOldSessionHistory(): number {
  const db = getDb();
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - SESSION_HISTORY_DAYS);
  
  const result = db.prepare(`
    DELETE FROM session_history 
    WHERE ended_at < ?
  `).run(cutoff.toISOString());

  return result.changes;
}

/**
 * Parse user agent string to extract device info
 */
function parseDeviceInfo(userAgent: string | null): {
  browser: string | null;
  os: string | null;
  device: string | null;
} {
  if (!userAgent) {
    return { browser: null, os: null, device: null };
  }

  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Unknown';

  // Browser detection
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edg')) browser = 'Edge';
  else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';
  else if (userAgent.includes('Brave')) browser = 'Brave';

  // OS detection
  if (userAgent.includes('Windows NT 10.0')) os = 'Windows 10/11';
  else if (userAgent.includes('Windows NT 6.3')) os = 'Windows 8.1';
  else if (userAgent.includes('Windows NT 6.2')) os = 'Windows 8';
  else if (userAgent.includes('Windows NT 6.1')) os = 'Windows 7';
  else if (userAgent.includes('Mac OS X')) os = 'macOS';
  else if (userAgent.includes('Linux') && !userAgent.includes('Android')) os = 'Linux';
  else if (userAgent.includes('iPhone')) os = 'iOS';
  else if (userAgent.includes('iPad')) os = 'iPadOS';
  else if (userAgent.includes('Android')) os = 'Android';

  // Device type detection
  if (userAgent.includes('Mobile')) {
    if (userAgent.includes('iPhone')) device = 'iPhone';
    else if (userAgent.includes('iPad')) device = 'iPad';
    else if (userAgent.includes('Android')) device = 'Android Phone';
    else device = 'Mobile Device';
  } else if (userAgent.includes('Tablet')) {
    device = 'Tablet';
  } else {
    device = 'Desktop/Computer';
  }

  return { browser, os, device };
}

/**
 * Mask a session token for display
 */
function maskToken(token: string): string {
  if (token.length <= 8) return '****';
  return token.slice(0, 4) + '****' + token.slice(-4);
}

/**
 * Get session count for a user
 */
export function getUserSessionCount(userId: string): number {
  const db = getDb();
  
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM sessions
    WHERE user_id = ? AND expires_at > datetime('now')
  `).get(userId) as { count: number };

  return result.count;
}

/**
 * Check if a specific token is the only session for a user
 */
export function isOnlySession(userId: string, token: string): boolean {
  const count = getUserSessionCount(userId);
  if (count !== 1) return false;
  
  const db = getDb();
  const session = db.prepare(`
    SELECT token FROM sessions WHERE user_id = ? AND expires_at > datetime('now')
  `).get(userId) as { token: string } | undefined;

  return session?.token === token;
}
