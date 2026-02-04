# CLAUDE.md

This file provides guidance for Claude Code when working with this codebase.

## Project Overview

Genetic Explorer is a secure genetic data management platform built with:
- **Framework**: TanStack Start (React-based full-stack framework)
- **Database**: Better-SQLite3 (local-first with encryption)
- **Styling**: Tailwind CSS
- **Authentication**: Session-based with 2FA support
- **Security**: KMS encryption, secure data deletion, identity verification

## Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Prefer explicit types over type inference for function parameters and return types
- Use `interface` for object types, `type` for unions/primitives
- Avoid `any` - use `unknown` when type is uncertain

### React Components
- Use functional components with hooks
- Name components with PascalCase
- Use `tsx` extension for all component files
- Place components in `app/components/`
- Follow the pattern: imports -> types -> component -> exports

### File Organization
- Routes: `app/routes/` (file-based routing)
- Utilities: `app/utils/` (pure functions and helpers)
- API handlers: `app/routes/api/` (API endpoints)
- Hooks: `app/hooks/`

### Naming Conventions
- Files: kebab-case for utilities, PascalCase for components
- Variables/functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase

## Compression Support

The project supports multiple compression formats for genome file uploads:

| Format | Extensions | Status |
|--------|------------|--------|
| GZIP | `.gz`, `.gzip` | Supported |
| ZIP | `.zip` | Supported (auto-extracts text files) |
| TAR | `.tar` | Supported |
| TAR+GZIP | `.tar.gz`, `.tgz` | Supported |
| BZIP2 | `.bz2`, `.bzip2` | Supported |
| XZ | `.xz` | Supported |
| ZSTD | `.zst` | Supported |

**Key file**: `app/utils/fileCompression.ts`

## Security Requirements

### Mandatory Security Practices
1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Use Zod schemas
3. **Use parameterized queries** - Never string concatenation for SQL
4. **Hash passwords** - Use bcrypt/scrypt
5. **Encrypt sensitive data** - Use KMS or user-specific encryption

### Data Handling
- Genome data is encrypted per-user using `app/utils/encryption.ts`
- Secure deletion uses `app/utils/secureDeletion.ts`
- Always verify identity before sensitive operations

## Database Schema

Key tables:
- `users` - User accounts with 2FA support
- `genomes` - Genetic data records
- `snps` - Individual SNP data (encrypted)
- `genome_backups` - Backup copies
- `sharing_permissions` - Data sharing settings

## Common Tasks

### Adding a New Route
1. Create file in `app/routes/` (e.g., `app/routes/new-page.tsx`)
2. Export component as default
3. Use `createFileRoute` for API routes

### Adding an API Endpoint
1. Create file in `app/routes/api/` (e.g., `/api/data.ts`)
2. Export handler methods (GET, POST, etc.)

### Modifying Database
1. Update schema in `app/utils/d1_schema.sql`
2. Update types in `app/utils/types.ts`
3. Add migrations in `scripts/`

## Testing

- Use Vitest for unit tests
- Place tests alongside source files (e.g., `utils/fileCompression.test.ts`)
- Run tests: `pnpm test`

## Build & Deploy

- Multi-platform support: Vercel, Cloudflare, Netlify, Fly.io, Railway, etc.
- Build: `pnpm build`
- Type check: `pnpm typecheck`
- Lint: `pnpm lint`

## Environment Variables

Required for production:
- `DATABASE_PATH` - SQLite database location
- `SESSION_SECRET` - Session encryption key
- `KMS_KEY_ID` - AWS/GCP KMS key for encryption
- Cloud credentials as needed

## Important Files

| File | Purpose |
|------|---------|
| `app/utils/auth.ts` | Authentication middleware |
| `app/utils/encryption.ts` | Per-user data encryption |
| `app/utils/fileCompression.ts` | Genome file decompression |
| `app/utils/database.ts` | Database connection & helpers |
| `app/routes/api/genomes/` | Genome upload/processing |
