# TODO Tracker - Genetic Explorer

## 🔴 Critical TODOs (Blocking Production)

### 1. Email Service Integration
**Files:**
- `app/routes/api/auth/forgot-password.ts:33`
- `app/routes/api/auth/verify-email.ts:128`
- `app/routes/api/contact.ts:42`

**Description:**
Email sending is currently stubbed with console.log. Need to integrate with an email provider.

**Recommended Solutions:**
- **Resend** (Recommended) - Developer-friendly, great deliverability
- **SendGrid** - Popular, reliable
- **AWS SES** - Cost-effective at scale
- **Nodemailer + SMTP** - For self-hosted option

**Implementation Notes:**
```typescript
// Add to .env
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=noreply@geneticexplorer.com

// Create app/utils/email.ts
export async function sendEmail({ to, subject, html }: EmailOptions) {
  // Implementation
}
```

---

## 🟡 Medium Priority TODOs

### 2. Real Notifications System
**File:** `app/components/Navbar.tsx:41`

**Current State:**
```typescript
const mockNotifications: NotificationItem[] = [...]
```

**Needs:**
- Database table: `notifications`
- API endpoint: `GET /api/notifications`
- Mark as read: `POST /api/notifications/:id/read`
- Real-time updates (WebSocket or Server-Sent Events)

**Database Schema:**
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL, -- 'research_update', 'sharing_invite', etc.
  title TEXT NOT NULL,
  description TEXT,
  relatedSnp TEXT,
  actionLink TEXT,
  actionText TEXT,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

---

## 🟢 Low Priority / Enhancements

### 3. Test Coverage
**Status:** No test files found

**Recommendation:**
Add Vitest + React Testing Library setup:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Priority Tests:**
1. Authentication flows
2. Genome upload process
3. SNP filtering/sorting
4. API endpoints

---

### 4. Report Detail Page Verification
**Route:** `/report/$id`

**Action:** Verify the report detail page is fully implemented and displays:
- Executive summary
- Disease risk sections
- Drug metabolism
- Nutrition recommendations
- Export/print options

---

### 5. Genome Comparison Results Page
**Feature:** ReportComparison component exists but may need results viewing page

**Current:** Component opens modal for selection
**Need:** Dedicated page to view comparison results

---

## ✅ Recently Completed

- [x] Virtual scrolling for SNP explorer
- [x] Performance monitoring utilities
- [x] Query options with caching
- [x] Database indexes for performance
- [x] What's New page
- [x] Global search (⌘K)
- [x] Dark mode support
- [x] Mobile navigation
- [x] Onboarding flow

---

## 📊 TODO Completion Stats

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Critical | 1 | 0 | 1 |
| Medium | 1 | 0 | 1 |
| Low | 3 | 0 | 3 |
| **Total** | **5** | **0** | **5** |

---

## 🎯 Next Sprint Recommendations

### Sprint 1: Production Readiness
1. Integrate Resend for email
2. Implement notifications API
3. Add notification UI integration

### Sprint 2: Polish & Testing
4. Add Vitest setup
5. Write critical path tests
6. E2E tests with Playwright

### Sprint 3: Features
7. Report PDF export
8. Data export functionality
9. Admin dashboard

---

## 🔗 Related Files

- Email utilities: Create `app/utils/email.ts`
- Notification types: Add to `app/types/index.ts`
- Notification API: Create `app/routes/api/notifications.ts`
- Tests: Create `app/__tests__/` directory
