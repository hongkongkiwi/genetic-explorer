# Architecture Review: Genetic Explorer

**Date:** 2026-02-04  
**Reviewer:** Code Architecture Analysis  
**Framework:** TanStack Start (React + Full-stack)

---

## Executive Summary

The Genetic Explorer codebase exhibits several architectural strengths including good use of modern frameworks (TanStack Start, React Query) and clear domain separation in some areas. However, there are significant concerns around **code duplication**, **file organization**, **inconsistent patterns**, and **component complexity** that should be addressed to maintain long-term maintainability.

### Overall Grade: **B-** (Good foundation, significant cleanup needed)

---

## 1. Separation of Concerns (Client vs Server)

### ✅ Strengths
- Proper use of TanStack Start's file-based routing with clear API route separation (`app/routes/api/`)
- Server-side code properly marked with `'use server'` directives
- Good distinction between server utilities (`auth.server.ts`, `database.server.ts`)

### ⚠️ Issues Found

| Issue | Severity | Location | Details |
|-------|----------|----------|---------|
| Mixed auth logic | Medium | `app/routes/api/auth/login.ts` | Lines 206-227 define `get2FAStatus()` helper directly in route file instead of using shared auth module |
| Inline SQL queries | Medium | Multiple API routes | Some routes query database directly instead of using domain functions from `~/db` |
| Server code in hooks | Low | `useAuth.tsx` | Contains redirect logic that could be server-side |

### Recommendations
1. **Consolidate database access** - All SQL queries should go through domain modules in `~/db/`
2. **Remove inline helpers** - The `get2FAStatus()` function in login.ts should be in `~/auth/two-factor.ts`
3. **Use server functions** for data mutations instead of manual fetch calls from components

---

## 2. Database Abstraction Layer Quality

### ✅ Strengths
- Centralized database initialization with proper SQLite optimizations (WAL mode, pragmas)
- Encryption at rest for sensitive SNP data using AES-256-GCM
- Proper use of parameterized queries throughout
- Migration system in place (`app/db/migrations.ts`)

### ⚠️ Issues Found

| Issue | Severity | Details |
|-------|----------|---------|
| **God File Anti-pattern** | **High** | `database-legacy.ts` is 1000+ lines with mixed concerns (schema, queries, file I/O) |
| Confusing module structure | High | `app/db/index.ts` re-exports from `database-legacy.ts` with comments about "transition period" |
| Duplicate exports | Medium | `app/utils/database.server.ts` is marked `@deprecated` but still used |
| Schema initialization scattered | Medium | Table initialization spread across multiple `init*Tables()` functions in different modules |

### Recommendations
1. **Split `database-legacy.ts`** into domain-specific modules:
   ```
   app/db/
   ├── connection.ts       # Database connection & config
   ├── schema/
   │   ├── users.ts
   │   ├── genomes.ts
   │   ├── snps.ts
   │   └── ...
   ├── queries/
   │   ├── users.ts
   │   ├── genomes.ts
   │   └── ...
   └── migrations.ts
   ```

2. **Remove deprecated modules** - `app/utils/database.server.ts` should be deleted

3. **Implement Repository Pattern** for complex queries:
   ```typescript
   // Instead of direct SQL everywhere
   const user = await userRepository.findById(id);
   ```

---

## 3. API Route Organization

### ✅ Strengths
- Consistent file-based routing with `createAPIFileRoute`
- Good use of HTTP methods (GET, POST, DELETE)
- Proper error handling patterns

### ⚠️ Issues Found

| Issue | Severity | Example | Impact |
|-------|----------|---------|--------|
| Inconsistent route depth | Medium | `/api/genomes.ts` vs `/api/genome/$id.ts` | Confusing naming convention |
| Route files too large | Medium | `genomes.ts` (305 lines) | Multiple HTTP methods in single file |
| Missing validation layer | Medium | Manual validation in routes | Should use Zod schemas consistently |

### Recommendations
1. **Standardize route naming** - Use either plural or singular consistently:
   - Option A: `/api/genomes/` and `/api/genomes/$id`
   - Option B: `/api/genome/` and `/api/genome/$id`

2. **Extract route handlers** - Large route files should delegate to service modules:
   ```typescript
   // api/genomes.ts
   import { genomeService } from '~/services/genome';
   
   export const APIRoute = createAPIFileRoute('/api/genomes')({
     GET: genomeService.list,
     POST: genomeService.create,
     DELETE: genomeService.remove,
   });
   ```

---
## 4. Component Architecture

### ✅ Strengths
- Good component categorization (ui/, layout/, features/)
- Proper use of TypeScript for prop types
- Accessibility features (LiveAnnouncer, skip links)

### 🚨 Critical Issues

| Issue | Severity | File(s) | Lines |
|-------|----------|---------|-------|
| **Components too large** | **Critical** | `EthnicityChart.tsx` | 423 lines |
| | | `ChromosomePainting.tsx` | 491 lines |
| | | `HaplogroupCard.tsx` | 503 lines |
| | | `AncestrySummary.tsx` | 437 lines |
| | | `dashboard.tsx` | 864 lines |
| **Complete duplication** | **High** | `app/components/ancestry/` ↔ `app/components/features/ancestry/` | Identical files |

### Component Size Analysis

Components should ideally be under 200 lines. Current offenders:

```
> 400 lines: 7 components (need immediate refactoring)
200-400 lines: ~15 components (should be monitored)
< 200 lines: Majority (good)
```

### Recommendations

1. **Immediate: Remove duplicate directories**
   ```bash
   # These are identical - delete one
   rm -rf app/components/features/ancestry/  # or ancestry/
   rm -rf app/components/features/carrier/
   rm -rf app/components/features/genome/
   rm -rf app/components/features/relatives/
   rm -rf app/components/features/traits/
   ```

2. **Refactor large components** using composition:
   ```typescript
   // Instead of 500-line EthnicityChart:
   export function EthnicityChart({ data }) {
     return (
       <ChartContainer>
         <ChartHeader data={data} />
         <ChartVisualization data={data} />
         <ChartLegend data={data} />
         <ChartControls data={data} />
       </ChartContainer>
     );
   }
   ```

3. **Extract custom hooks** for stateful logic:
   ```typescript
   // Instead of useState/useEffect in component
   const { data, isLoading, error } = useDashboardData();
   ```

4. **Create component size lint rule**:
   ```javascript
   // eslint.config.js
   'max-lines': ['warn', { max: 200, skipBlankLines: true }]
   ```

---

## 5. State Management Approach

### ✅ Strengths
- React Context used appropriately for global state (Auth, CSRF, Toast)
- TanStack Query (React Query) for server state management
- Good stale time configuration (5 minutes)

### ⚠️ Issues Found

| Issue | Severity | Location | Details |
|-------|----------|----------|---------|
| Duplicate QueryClient | Low | `router.tsx` vs `__root.tsx` | Two QueryClient instances created |
| Local state overuse | Medium | Route components | Many routes use `useState` for form state instead of TanStack Form |
| Missing global state | Low | Feature flags | Environment-based features re-fetched instead of cached |

### Recommendations
1. **Consolidate QueryClient** - Create single instance and pass via context
2. **Use TanStack Form** more consistently for form state (already in dependencies)
3. **Consider Zustand** for client-only global state if Context becomes unwieldy

---

## 6. Module Dependency Cycles

### ✅ Strengths
- Generally clean import graph
- Proper use of barrel exports (`index.ts`)

### ⚠️ Potential Issues

```
app/db/database-legacy.ts
  ↓ imports
~/security (encryption)
  ↓ may import
~/utils/* (various)
  ↓ imports
~/db (database functions)
```

The database module imports from security, which could create circular dependencies if security ever needs database access.

### Recommendations
1. **Audit dependency graph** using `madge`:
   ```bash
   npx madge --circular app/
   ```

2. **Dependency injection** for encryption:
   ```typescript
   // Instead of importing directly, inject dependencies
   export function createDatabase(config: { encryptor: Encryptor }) {
     // use config.encryptor instead of imported encrypt
   }
   ```

---

## 7. Environment Variable Usage

### ✅ Strengths
- Good validation schema in `app/utils/shared/env.ts` using Zod
- Clear separation of public vs private env vars
- Production validation checks

### ⚠️ Issues Found

| Issue | Severity | Location | Details |
|-------|----------|----------|---------|
| Direct process.env access | Medium | `app/security/encryption.ts` | Lines 77, 371, 402 access `process.env` directly |
| | | `app/security/csrf.ts` | Line 77 |
| | | `app/auth/oauth.ts` | Lines 18, 19, 26, 27 |
| | | `app/auth/captcha.ts` | Lines 21-23 |
| Hardcoded fallback secrets | **High** | `app/security/encryption.ts:102` | `'dev-secret-change-in-production'` as fallback |
| Missing env vars | Medium | Tests | Tests modify `process.env` directly instead of mocking |

### Recommendations
1. **Centralize all env access** through `~/utils/shared/env.ts`:
   ```typescript
   // BAD: Direct access
   const apiKey = process.env.OPENAI_API_KEY;
   
   // GOOD: Through validated env
   const apiKey = env.OPENAI_API_KEY;
   ```

2. **Remove fallback secrets in production**:
   ```typescript
   const sessionSecret = isProduction 
     ? requireEnv('SESSION_SECRET') 
     : process.env.SESSION_SECRET || 'dev-secret';
   ```

3. **Create env validation at startup**:
   ```typescript
   // app/ssr.tsx
   import { validateEnv } from '~/utils/shared/env';
   const { valid, errors } = validateEnv();
   if (!valid) {
     console.error('Invalid environment:', errors);
     process.exit(1);
   }
   ```

---

## 8. Configuration Management

### 🚨 Critical Issues

| Issue | Severity | Details |
|-------|----------|---------|
| **9 config files for platforms** | **High** | `app.config.{vercel,cf,netlify,fly,railway,heroku,do,northflank}.ts` |
| Copy-based config switching | High | Build scripts use `cp app.config.X.ts app.config.ts` |
| Risk of config drift | High | Each config may become inconsistent |

Current approach:
```json
// package.json
"build:vercel": "cp app.config.vercel.ts app.config.ts && vinxi build",
"build:cf": "cp app.config.cloudflare.ts app.config.ts && vinxi build",
// ... 7 more
```

### Recommendations

1. **Single config with environment detection**:
   ```typescript
   // app.config.ts
   import { defineConfig } from '@tanstack/start/config';
   
   const platform = process.env.DEPLOYMENT_PLATFORM || 'node';
   
   const platformConfigs = {
     vercel: { /* vercel config */ },
     cloudflare: { /* cf config */ },
     // ...
   };
   
   export default defineConfig(platformConfigs[platform] || platformConfigs.node);
   ```

2. **Or use environment-based imports**:
   ```typescript
   // app.config.ts
   const platform = process.env.DEPLOYMENT_PLATFORM;
   const config = await import(`./config/platforms/${platform}.ts`);
   export default defineConfig(config.default);
   ```

---

## 9. Import/Export Patterns

### ✅ Strengths
- Consistent use of path aliases (`~/`)
- Barrel exports for clean imports
- Type exports properly separated

### ⚠️ Issues Found

| Issue | Severity | Example | Impact |
|-------|----------|---------|--------|
| Deep imports | Low | `~/utils/genome/file-compression` | Breaks if structure changes |
| Require in ESM | Medium | `app/routes/api/auth/login.ts:207` | Uses `require()` inside function |
| Unused exports | Low | `app/components/index.ts` | Only exports 3 components |

### Recommendations

1. **Standardize barrel exports** - Every module should have clean `index.ts`:
   ```typescript
   // app/utils/genome/index.ts
   export * from './parser';
   export * from './quality';
   export * from './file-compression';
   ```

2. **Remove dynamic requires** in favor of ESM:
   ```typescript
   // BAD
   const { getDb } = require('~/utils/database');
   
   // GOOD
   import { getDb } from '~/utils/database';
   ```

---

## 10. Architectural Anti-Patterns

### 🚨 Critical Anti-Patterns Found

#### 1. **File Duplication (Complete Copies)**
```
app/components/ancestry/          ↔  app/components/features/ancestry/
app/components/carrier/           ↔  app/components/features/carrier/
app/utils/fileCompression.ts      ↔  app/utils/genome/file-compression.ts (different implementations!)
app/utils/genomeParser.ts         ↔  app/utils/genome/genomeParser.ts (re-export)
```

**Risk:** Confusion about which to use, maintenance burden, bugs from diverging copies

#### 2. **God Object (Database Module)**
`database-legacy.ts` contains:
- Schema definition (table creation)
- 100+ exported functions
- File system operations
- Encryption/decryption logic
- Migration hooks

**Risk:** Unmaintainable, hard to test, tight coupling

#### 3. **Spaghetti Initialization**
Database initialization calls:
```
initDatabase()
  → runMigrations()
  → createIndexes()
  → initSecurityTables()
  → initTermsTables()
  → initSessionManagementTables()
  → initTwoFactorDisableDelayTables()
  → initNotificationPreferencesTables()
```

All these init functions are scattered across different modules.

#### 4. **Configuration Proliferation**
9 different build configuration files for different platforms.

#### 5. **Deep Component Hierarchy with Large Files**
Components at 400-500 lines with multiple responsibilities.

---

## Prioritized Action Plan

### Phase 1: Immediate (High Impact, Low Effort)
1. [ ] **Remove duplicate component directories** (ancestry, carrier, etc.)
2. [ ] **Consolidate file compression modules** - keep `genome/file-compression.ts`, delete root version
3. [ ] **Fix direct process.env access** - route through `env.ts`
4. [ ] **Remove deprecated `database.server.ts`**

### Phase 2: Short-term (1-2 weeks)
1. [ ] **Consolidate build configs** to single file with platform detection
2. [ ] **Split `database-legacy.ts`** into domain modules
3. [ ] **Extract service layer** from API routes
4. [ ] **Add madge** for circular dependency detection

### Phase 3: Medium-term (1 month)
1. [ ] **Component refactoring** - break down 400+ line components
2. [ ] **Repository pattern** for database access
3. [ ] **Standardize form handling** with TanStack Form
4. [ ] **Add component size linting**

### Phase 4: Long-term (Ongoing)
1. [ ] **Dependency injection** for better testability
2. [ ] **Module boundaries** enforcement with eslint
3. [ ] **E2E test coverage** for critical paths
4. [ ] **Performance monitoring** setup

---

## Code Quality Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Files over 400 lines | 7 | 0 | 🔴 |
| Duplicate file sets | 5 pairs | 0 | 🔴 |
| Config files | 9 | 1 | 🔴 |
| Direct process.env access | 20+ | 0 | 🟡 |
| Test coverage | Unknown | >70% | ⚪ |
| TypeScript strict mode | Off | On | 🟡 |

---

## Conclusion

The Genetic Explorer has a solid foundation with modern frameworks and good security practices. However, **technical debt has accumulated** in the form of:

1. **Code duplication** (complete file copies)
2. **Oversized modules** (god objects)
3. **Configuration sprawl** (9 platform configs)
4. **Inconsistent patterns** (direct env access)

**Immediate priority** should be removing the duplicate component directories and consolidating the file compression modules, as these are causing immediate confusion and maintenance burden.

**Medium priority** is refactoring the database layer into domain-specific modules, which will improve testability and make the codebase more approachable for new developers.

The architecture is **salvageable and improvable** without a complete rewrite. The recommended changes are evolutionary rather than revolutionary.
