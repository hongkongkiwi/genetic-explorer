# User Screens Guide

This document provides an overview of all user-facing screens in the Genetic Explorer application.

## Authentication Screens

### `/login`
**Sign In Page**
- Email and password input
- "Remember me" option
- Link to forgot password
- Link to create account
- Form validation and error handling

### `/register`
**Create Account Page**
- Display name (optional)
- Email address
- Password with strength requirements
- Confirm password
- Password requirements checklist
- Link to sign in
- Success confirmation after registration

### `/forgot-password`
**Forgot Password Page**
- Email input
- Sends reset instructions (if account exists)
- Success message confirming email sent
- Link back to sign in

### `/reset-password`
**Reset Password Page**
- Accepts reset token from URL
- Validates token on load
- New password input with requirements
- Confirm password
- Success message with link to login

### `/verify-email`
**Email Verification Page**
- Accepts verification token from URL
- Validates and activates account
- Resend verification option
- Success/error states

## Profile & Settings Screens

### `/profile`
**Profile Management Page**
- Basic Information
  - Display name
  - Email (read-only)
  - Bio
- Genetic Profile
  - Birth date
  - Sex
  - Ancestry
  - Timezone
- Privacy Settings
  - Allow family sharing
  - Share anonymized data
- Save changes functionality

### `/settings`
**Account Settings Hub**
- Links to:
  - Profile Information
  - Notifications
  - Activity Log
  - Change Password
  - Family Sharing
- Danger Zone
  - Account deletion

### `/notifications`
**Notification Preferences Page**
- Email Notifications
  - Security alerts
  - Sharing invitations
  - Reports ready
  - Research updates
  - New features
- In-App Notifications
  - Analysis complete
  - Sharing activity
  - Research updates
  - New features
- Visual toggle interface

### `/activity`
**Activity Log Page**
- Chronological list of account activity
- Activity types include:
  - Account creation/login/logout
  - Genome uploads/deletions
  - Report generation
  - Sharing activity
  - Profile updates
- Timestamps and details
- 90-day retention notice

## Family Sharing Screens

### `/sharing`
**Family Sharing Management**
- Tabs for:
  - "Shared With Me" - view shares received
  - "My Shares" - manage shares given
- Send invitation form
  - Email input
  - Permission level selection (view/download/manage)
  - Optional expiration
- List of active shares
- Revoke sharing permissions
- Share details (owner, permission level, expiration)

### `/accept-invite`
**Accept Invitation Page**
- Accepts invite token from URL
- Shows invitation details
  - Who is sharing
  - Permission level
- For authenticated users:
  - One-click accept
- For non-authenticated users:
  - Sign in or create account
  - Then automatically accept invitation
- Success confirmation
- Links to shared profiles

## Main Application Screens

### `/`
**Home Page**
- Welcome banner for authenticated users
- Feature highlights
- How it works section
- CTA to upload genome
- Quick links for authenticated users

### `/upload`
**Genome Upload Page**
- File upload zone
- Supports 23andMe, AncestryDNA formats
- Upload progress
- Processing status

### `/genomes`
**My Genomes Page**
- List of user's genomes
- Shared genomes (with indicators)
- Primary genome selection
- Delete genome option

### `/reports`
**Reports List Page**
- List of generated reports
- Filter by genome
- Quick access to latest reports

### `/explorer`
**SNP Explorer Page**
- Search and filter SNPs
- View genetic variants
- Export data

### `/research`
**Research Database Page**
- Browse SNP database
- Research papers
- Statistics

### `/whats-new`
**Updates Page**
- New features
- Database updates
- Research additions

## Component Library

### UI Components (`/app/components/ui/`)
- **Button** - Primary, secondary, outline, ghost, danger variants
- **Input** - Text input with error states
- **Card** - Container component
- **Alert** - Info, success, warning, error variants

## Access Control

### Public Routes (No authentication required)
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/accept-invite`
- `/`

### Protected Routes (Authentication required)
- `/profile`
- `/settings`
- `/notifications`
- `/activity`
- `/sharing`
- `/upload`
- `/genomes`
- `/reports`
- `/explorer`
- `/research`

## Navigation Structure

### Main Navigation
- Home
- Upload
- Genomes
- Reports
- Explorer
- Research
- What's New

### User Menu (when authenticated)
- Profile
- Family Sharing
- Notifications
- Settings
- Sign Out

## Future Enhancements

Potential additional screens:
- **Change Password** - Dedicated page for password update
- **Two-Factor Authentication** - 2FA setup
- **Data Export** - GDPR compliance export
- **Help/FAQ** - User assistance
- **Contact Support** - Support request form
- **Terms & Privacy** - Legal pages
