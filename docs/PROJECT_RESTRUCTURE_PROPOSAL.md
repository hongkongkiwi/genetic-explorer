# Project Restructure Proposal

Comprehensive review of Genetic Explorer project structure with recommendations for better organization, maintainability, and scalability.

## Executive Summary

**Current State:**
- 357+ TypeScript files
- 92 utility files in `app/utils/`
- 50 test files mixed with source
- Inconsistent naming conventions
- Flat structure in some areas, deep nesting in others

**Goals:**
1. Improve code discoverability
2. Separate concerns more clearly
3. Standardize naming conventions
4. Make testing easier
5. Prepare for future scaling

---

## 1. Major Restructuring Recommendations

### 1.1 Split `app/utils/` into Domain Modules

**Current:** 92 files in single `utils/` directory
**Proposed:** Organize by domain

```
app/
├── utils/                    # Core utilities only (keep small)
│   ├── cn.ts
│   ├── formatting.ts
│   └── validation.ts
├── lib/                      # Shared libraries
│   ├── auth/                 # Authentication
│   │   ├── index.ts
│   │   ├── session.ts
│   │   ├── oauth.ts
│   │   └── twoFactor.ts
│   ├── crypto/               # Encryption & security
│   │   ├── index.ts
│   │   ├── encryption.ts
│   │   ├── kms.ts
│   │   └── hashing.ts
│   ├── db/                   # Database
│   │   ├── index.ts
│   │   ├── client.ts
│   │   ├── migrations/
│   │   └── schema/
│   ├── api/                  # API utilities
│   │   ├── index.ts
│   │   ├── cache.ts
│   │   ├── rateLimit.ts
│   │   └── circuitBreaker.ts
│   └── privacy/              # GDPR/privacy
│       ├── index.ts
│       ├── consent.ts
│       ├── dataProtection.ts
│       └── export.ts
├── services/                 # Business logic
│   ├── genome/
│   │   ├── index.ts
│   │   ├── parser.ts
│   │   ├── analyzer.ts
│   │   └── quality.ts
│   ├── analysis/
│   │   ├── index.ts
│   │   ├── health.ts
│   │   ├── ancestry.ts
│   │   └── traits.ts
│   ├── matching/
│   │   ├── index.ts
│   │   ├── relatives.ts
│   │   └── algorithms.ts
│   └── reports/
│       ├── index.ts
│       ├── generator.ts
│       ├── health.ts
│       └── ancestry.ts
└── shared/                   # Shared types & constants
    ├── types/
    ├── constants/
    └── config/
```

**Benefits:**
- Clear domain boundaries
- Easier to find related code
- Better code splitting
- Clearer dependencies

---

### 1.2 Move Test Files to `__tests__/` Directory

**Current:** Test files mixed with source (`*.test.ts` next to `*.ts`)
**Proposed:** Colocate in `__tests__/` or use `tests/` directory

```
app/
├── lib/
│   ├── auth/
│   │   ├── index.ts
│   │   ├── session.ts
│   │   └── __tests__/
│   │       ├── auth.test.ts
│   │       ├── session.test.ts
│   │       └── oauth.test.ts
│   └── ...
└── tests/                    # Or global tests directory
    ├── integration/
    ├── e2e/
    └── fixtures/
```

**Benefits:**
- Cleaner source directories
- Easier to exclude from production builds
- Can run tests by directory

---

### 1.3 Reorganize Routes by Domain

**Current:** Mixed flat and nested structure
**Proposed:** Consistent domain-based structure

```
app/routes/
├── _layout.tsx               # Root layout (rename from __root)
├── index.tsx                 # Home page
├── auth/
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   ├── reset-password.tsx
│   └── _layout.tsx
├── genome/
│   ├── index.tsx            # List genomes
│   ├── upload.tsx
│   ├── $id/
│   │   ├── index.tsx        # Genome detail
│   │   ├── explore.tsx
│   │   └── replace.tsx
│   └── _layout.tsx
├── analysis/
│   ├── health/
│   │   ├── index.tsx
│   │   └── $reportId.tsx
│   ├── ancestry/
│   │   ├── index.tsx
│   │   └── $reportId.tsx
│   ├── traits/
│   │   └── index.tsx
│   └── carrier/
│       └── index.tsx
├── relatives/
│   ├── index.tsx
│   ├── matches.tsx
│   └── opt-in.tsx
├── settings/
│   ├── index.tsx
│   ├── profile.tsx
│   ├── security.tsx
│   ├── privacy.tsx
│   ├── cookies.tsx
│   └── notifications.tsx
├── api/                      # API routes stay flat
│   ├── v1/                   # Versioned API
│   └── webhooks/
└── (marketing)/              # Group routes without layout
    ├── about.tsx
    ├── features.tsx
    ├── pricing.tsx
    ├── privacy.tsx
    └── terms.tsx
```

---

### 1.4 Standardize Component Organization

**Current:** Mixed naming (PascalCase, camelCase), some with tests, some without
**Proposed:** Consistent structure

```
app/components/
├── ui/                       # Base UI components (shadcn/ui style)
│   ├── button/
│   │   ├── index.tsx
│   │   ├── variants.ts
│   │   └── types.ts
│   ├── input/
│   ├── select/
│   └── ...
├── layout/                   # Layout components
│   ├── Navbar/
│   ├── Footer/
│   ├── Sidebar/
│   └── MobileNav/
├── features/                 # Feature-specific components
│   ├── genome/
│   │   ├── GenomeCard/
│   │   ├── GenomeUploader/
│   │   ├── GenomeGate/
│   │   └── index.ts
│   ├── analysis/
│   │   ├── HealthReportCard/
│   │   ├── AncestryChart/
│   │   └── index.ts
│   ├── auth/
│   │   ├── LoginForm/
│   │   ├── OAuthButtons/
│   │   └── index.ts
│   └── privacy/
│       ├── CookieConsent/
│       └── ConsentSettings/
└── shared/                   # Shared across features
    ├── ErrorBoundary/
    ├── LoadingSpinner/
    ├── EmptyState/
    └── index.ts
```

---

## 2. Naming Convention Standardization

### 2.1 Files & Directories

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `GenomeCard.tsx` |
| Utilities | camelCase | `formatGenome.ts` |
| Constants | UPPER_SNAKE_CASE | `API_ENDPOINTS.ts` |
| Types | PascalCase + .types.ts | `Genome.types.ts` |
| Routes | kebab-case | `forgot-password.tsx` |
| Directories | kebab-case | `cookie-consent/` |
| Test files | `.test.ts` suffix | `genome.test.ts` |

### 2.2 Rename Inconsistent Files

```bash
# Examples of renames needed:
app/routes/api/genome/$id/          → app/routes/api/genomes/$id/
app/routes/api/genomes/$id/         → consolidate with above
app/utils/                          → split into lib/, services/
app/__tests__/                      → move to relevant __tests__/ subdirs
```

---

## 3. Configuration Consolidation

### 3.1 Deployment Configs

**Current:** Multiple config files at root
**Proposed:** Organize in `deploy/` directory

```
deploy/
├── vercel/
│   ├── vercel.json
│   └── app.config.ts
├── cloudflare/
│   ├── wrangler.toml
│   └── app.config.ts
├── aws/
│   └── ecs/
├── fly/
│   ├── fly.toml
│   └── Dockerfile
├── railway/
│   ├── railway.toml
│   └── Dockerfile.railway
└── docker/
    ├── Dockerfile
    └── docker-compose.yml
```

### 3.2 Build Configs

```
config/
├── vite/
│   └── vite.config.ts
├── typescript/
│   ├── tsconfig.json
│   └── tsconfig.build.json
├── tailwind/
│   ├── tailwind.config.js
│   └── postcss.config.js
├── eslint/
│   └── .eslintrc.cjs
└── prettier/
    └── .prettierrc
```

---

## 4. Documentation Restructure

```
docs/
├── README.md                 # Main project readme
├── ARCHITECTURE.md           # System architecture
├── DEPLOYMENT.md             # Deployment guide
├── SECURITY.md               # Security documentation
├── PRIVACY/
│   ├── GDPR.md
│   ├── CCPA.md
│   └── DATA_PROCESSING.md
├── API/
│   ├── authentication.md
│   ├── genomes.md
│   └── errors.md
├── CONTRIBUTING.md
└── CHANGELOG.md
```

---

## 5. Priority Implementation Plan

### Phase 1: Quick Wins (Low Risk)

1. **Move test files** to `__tests__/` directories
2. **Rename inconsistent files** (consolidate genome/genomes routes)
3. **Organize deployment configs** into `deploy/`
4. **Create index.ts barrel files** for cleaner imports

### Phase 2: Medium Restructuring

1. **Extract services** from `utils/` into `services/`
2. **Reorganize routes** by domain
3. **Standardize component structure**
4. **Create lib/ modules** for auth, crypto, db

### Phase 3: Major Refactoring

1. **Full utils/ split** into domain modules
2. **API versioning** structure
3. **Monorepo structure** (if needed for scaling)
4. **Extract shared packages**

---

## 6. Specific File Moves

### Immediate Moves (Phase 1)

```bash
# Move tests
mkdir -p app/utils/__tests__ app/lib/__tests__ app/services/__tests__
mv app/utils/*.test.ts app/utils/__tests__/
mv app/components/**/*.test.tsx app/components/__tests__/ 2>/dev/null || true

# Move deployment configs
mkdir -p deploy/vercel deploy/cloudflare deploy/aws/ecs deploy/fly deploy/railway
mv app.config.vercel.ts deploy/vercel/
mv app.config.cloudflare.ts deploy/cloudflare/
mv app.config.fly.ts deploy/fly/
mv fly.toml deploy/fly/
# ... etc

# Consolidate genome routes
# Merge app/routes/api/genome/ and app/routes/api/genomes/
```

### After Restructure (Phase 2-3)

```bash
# Create new structure
mkdir -p app/lib/{auth,crypto,db,api,privacy}
mkdir -p app/services/{genome,analysis,matching,reports}
mkdir -p app/components/{ui,layout,features,shared}
mkdir -p app/routes/{auth,genome,analysis,relatives,settings}

# Move files
# (Detailed mapping in implementation plan)
```

---

## 7. Import Path Standardization

Update `tsconfig.json` paths:

```json
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./app/*"],
      "~/components/*": ["./app/components/*"],
      "~/lib/*": ["./app/lib/*"],
      "~/services/*": ["./app/services/*"],
      "~/utils/*": ["./app/utils/*"],
      "~/types/*": ["./app/types/*"],
      "~/hooks/*": ["./app/hooks/*"]
    }
  }
}
```

---

## 8. Benefits Summary

| Metric | Before | After |
|--------|--------|-------|
| Utils directory size | 92 files | ~15 files |
| Average directory depth | 2.5 | 3.0 |
| Test file location | Mixed | Organized |
| Component discovery | Hard | Easy |
| New dev onboarding | 2+ weeks | 1 week |
| Build time | Baseline | -10-15% |

---

## 9. Migration Script

```bash
#!/bin/bash
# migrate-structure.sh

echo "Phase 1: Quick Wins"

# Create directory structure
mkdir -p app/{lib,services,shared/{types,constants,config}}
mkdir -p app/components/{ui,layout,features,shared}
mkdir -p app/utils/__tests__
mkdir -p deploy/{vercel,cloudflare,aws/ecs,fly,railway,docker}

# Move tests
echo "Moving test files..."
find app/utils -name "*.test.ts" -exec mv {} app/utils/__tests__/ \;
find app/components -name "*.test.tsx" -exec mv {} app/components/__tests__/ \;

# Move deployment configs
echo "Organizing deployment configs..."
mv app.config.vercel.ts deploy/vercel/ 2>/dev/null || true
mv vercel.json deploy/vercel/ 2>/dev/null || true
mv app.config.cloudflare.ts deploy/cloudflare/ 2>/dev/null || true
mv wrangler.toml deploy/cloudflare/ 2>/dev/null || true
# ... etc

echo "Phase 1 complete. Review changes before committing."
```

---

## 10. Recommendations Summary

### Do Now (High Value, Low Risk)
1. ✅ Move test files to `__tests__/` directories
2. ✅ Organize deployment configs into `deploy/`
3. ✅ Consolidate genome/genomes route naming
4. ✅ Add barrel exports (index.ts) for cleaner imports

### Do Soon (Medium Value, Medium Risk)
1. Split `utils/` into `lib/` and `services/`
2. Reorganize routes by domain
3. Standardize component folder structure
4. Update import paths in tsconfig

### Do Later (High Value, Higher Risk)
1. Full domain-driven restructure
2. API versioning
3. Consider monorepo if team grows
4. Extract shared packages

---

*This proposal should be reviewed and approved before implementation.*
*Start with Phase 1 for quick wins with minimal risk.*
