# Multi-User Support Implementation

This document describes the multi-user support and family sharing features added to Genetic Explorer.

## Overview

The application now supports:
- User registration and authentication
- User profiles with genetic-specific fields
- Family sharing with permission levels
- Secure session management
- Activity logging

## Database Schema

### New Tables

#### `users`
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - PBKDF2 hashed password
- `display_name` - Optional display name
- `created_at`, `updated_at` - Timestamps
- `last_login_at` - Last login timestamp
- `is_active` - Account status
- `email_verified` - Email verification status

#### `profiles`
- User profile information
- Bio, birth_date, sex, ancestry, timezone
- Notification preferences (JSON)
- Privacy settings (JSON)

#### `sharing_permissions`
- Family/friend sharing relationships
- `owner_id` - User sharing their data
- `shared_with_id` - User receiving access
- `genome_id` - Specific genome (or null for all)
- `permission_level` - view, download, manage
- `expires_at` - Optional expiration

#### `sharing_invites`
- Pending invitations for users not yet registered
- `invite_token` - Unique token for accepting
- `expires_at` - Expiration date

#### `sessions`
- Secure session management
- `token` - Session token
- `expires_at` - Session expiration
- `ip_address`, `user_agent` - Audit info

#### `activity_logs`
- Audit trail of user actions
- Action type, resource type/id, details

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout and invalidate session
- `GET /api/auth/me` - Get current user info

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Sharing
- `GET /api/sharing?type=shared-with-me` - Get shares received
- `GET /api/sharing?type=my-shares` - Get shares given
- `POST /api/sharing` - Create share/invite
- `DELETE /api/sharing?id=X` - Revoke share

## UI Pages

### New Pages
- `/login` - Sign in page
- `/register` - Create account page
- `/profile` - User profile management
- `/sharing` - Family sharing management
- `/settings` - Account settings

### Updated Pages
- `/` (Home) - Shows welcome banner for authenticated users
- `/genomes` - Now user-specific with access control
- `/reports` - Filtered by user access

## Components

### New Components
- `AuthProvider` - React context for auth state
- `useAuth` hook - Access auth functionality
- `Button`, `Input`, `Card`, `Alert` - UI primitives

### Updated Components
- `Navbar` - Added user menu with profile, sharing, settings, logout

## Security Features

- Passwords hashed with PBKDF2 (100,000 iterations)
- Secure session tokens with expiration
- CSRF protection via SameSite cookies
- HTTPOnly session cookies
- Timing-safe password comparison
- Access control checks on all protected resources

## Permission Levels

1. **view** - View genetic data and reports
2. **download** - View and download raw data
3. **manage** - Full access including analysis generation

## File Structure

```
app/
├── hooks/
│   └── useAuth.tsx          # Auth context and hook
├── components/
│   └── ui/
│       ├── Button.tsx       # Button component
│       ├── Input.tsx        # Input component
│       ├── Card.tsx         # Card component
│       └── Alert.tsx        # Alert component
├── routes/
│   ├── login.tsx            # Login page
│   ├── register.tsx         # Registration page
│   ├── profile.tsx          # Profile page
│   ├── sharing.tsx          # Family sharing page
│   ├── settings.tsx         # Settings page
│   └── api/
│       └── auth/
│           ├── register.ts  # Register API
│           ├── login.ts     # Login API
│           ├── logout.ts    # Logout API
│           └── me.ts        # Current user API
│       ├── profile.ts       # Profile API
│       └── sharing.ts       # Sharing API
└── utils/
    ├── auth.ts              # Auth utilities
    └── database.ts          # Updated with user functions
```

## Backward Compatibility

The existing genome upload and analysis functionality still works without authentication, but all new features require login. This allows existing users to continue using the app while new features are opt-in.

## Future Enhancements

Potential improvements:
- Email verification flow
- Password reset via email
- Two-factor authentication
- OAuth providers (Google, Apple)
- Share expiration notifications
- Activity log UI
- Data export (GDPR compliance)
- Account deletion
