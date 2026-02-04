/**
 * Data Subject Rights API
 * 
 * Handles GDPR Article 15-22 rights and similar rights under other jurisdictions:
 * - Right of access (Article 15)
 * - Right to rectification (Article 16)
 * - Right to erasure (Article 17)
 * - Right to restrict processing (Article 18)
 * - Right to data portability (Article 20)
 * - Right to object (Article 21)
 * - Right not to be subject to automated decision-making (Article 22)
 */

import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
import { csrfProtection } from '~/utils/csrf';
import { getDb } from '~/utils/database';
import { v4 as uuidv4 } from 'uuid';
import { 
  getApplicableJurisdictions, 
  getResponseDeadline,
  JURISDICTION_CONFIG,
  type Jurisdiction,
  type DataSubjectRight,
} from '~/utils/dataProtection';

interface DataSubjectRequest {
  id: string;
  userId: string;
  jurisdiction: Jurisdiction;
  right: DataSubjectRight;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  requestDate: string;
  completionDate?: string;
  deadlineDate: string;
  rejectionReason?: string;
  verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'ADDITIONAL_INFO_REQUIRED';
  requestDetails?: Record<string, any>;
  responseData?: any;
}

// ============================================================================
// Request Management
// ============================================================================

function initDataSubjectRequestsTable(): void {
  const db = getDb();
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS data_subject_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      jurisdiction TEXT NOT NULL,
      right_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      completion_date DATETIME,
      deadline_date DATETIME NOT NULL,
      rejection_reason TEXT,
      verification_status TEXT DEFAULT 'UNVERIFIED',
      request_details TEXT,
      response_data TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_dsr_user_id ON data_subject_requests(user_id)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_dsr_status ON data_subject_requests(status)
  `);
}

function createDataSubjectRequest(
  userId: string,
  jurisdiction: Jurisdiction,
  right: DataSubjectRight,
  details?: Record<string, any>
): DataSubjectRequest {
  initDataSubjectRequestsTable();
  
  const db = getDb();
  const id = uuidv4();
  const requestDate = new Date();
  const deadlineDate = getResponseDeadline(jurisdiction, requestDate);
  
  const request: DataSubjectRequest = {
    id,
    userId,
    jurisdiction,
    right,
    status: 'PENDING',
    requestDate: requestDate.toISOString(),
    deadlineDate: deadlineDate.toISOString(),
    verificationStatus: 'VERIFIED', // Assume verified if authenticated
    requestDetails: details,
  };
  
  db.prepare(`
    INSERT INTO data_subject_requests 
    (id, user_id, jurisdiction, right_type, status, deadline_date, request_details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    jurisdiction,
    right,
    request.status,
    request.deadlineDate,
    details ? JSON.stringify(details) : null
  );
  
  return request;
}

// ============================================================================
// API Routes
// ============================================================================

export const APIRoute = createAPIFileRoute('/api/privacy/rights')({
  // GET - List user's data subject requests
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      
      initDataSubjectRequestsTable();
      const db = getDb();
      
      const requests = db.prepare(`
        SELECT * FROM data_subject_requests 
        WHERE user_id = ?
        ORDER BY request_date DESC
      `).all(auth.id) as DataSubjectRequest[];
      
      return json({
        success: true,
        data: requests,
      });
    } catch (error) {
      console.error('Failed to fetch data subject requests:', error);
      return json(
        { success: false, error: 'Failed to fetch requests' },
        { status: 500 }
      );
    }
  },
  
  // POST - Submit a new data subject rights request
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
      const { right, jurisdiction, details } = body;
      
      if (!right || !jurisdiction) {
        return json(
          { success: false, error: 'Missing required fields: right, jurisdiction' },
          { status: 400 }
        );
      }
      
      // Validate jurisdiction
      if (!JURISDICTION_CONFIG[jurisdiction as Jurisdiction]) {
        return json(
          { success: false, error: 'Invalid jurisdiction' },
          { status: 400 }
        );
      }
      
      // Create the request
      const dsr = createDataSubjectRequest(
        auth.id,
        jurisdiction as Jurisdiction,
        right as DataSubjectRight,
        details
      );
      
      // Process immediately for certain rights
      if (right === 'ACCESS') {
        // Trigger data export
        // In production, this would queue an async job
        console.log(`Data export requested for user ${auth.id}`);
      }
      
      return json({
        success: true,
        message: 'Request submitted successfully',
        data: {
          requestId: dsr.id,
          status: dsr.status,
          deadlineDate: dsr.deadlineDate,
          responseTime: `${JURISDICTION_CONFIG[jurisdiction as Jurisdiction].responseTimeDays} days`,
        },
      });
    } catch (error) {
      console.error('Failed to submit data subject request:', error);
      return json(
        { success: false, error: 'Failed to submit request' },
        { status: 500 }
      );
    }
  },
});
