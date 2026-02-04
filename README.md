# 🧬 Genetic Explorer

A beautiful, comprehensive web application for exploring and analyzing personal genetic data. Upload your 23andMe, AncestryDNA, or other genetic test results to receive detailed health insights, ancestry analysis, carrier status screening, and personalized recommendations powered by AI.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack%20Start-1.91-FF4154)](https://tanstack.com/start)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-6E9F18?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Genetic%20Explorer%20License-blue.svg)](LICENSE)

![Genetic Explorer](https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&h=400&fit=crop)

## ✨ Features

### 📤 Advanced Data Upload
- **Multiple Format Support**: 23andMe, AncestryDNA, MyHeritage, and generic genome.txt formats
- **Compression Support**: Automatic decompression of ZIP and GZ files
- **Secure Storage**: Files encrypted at rest with AES-256-GCM
- **Integrity Verification**: SHA-256 checksums for data integrity
- **Progress Tracking**: Real-time upload and processing progress
- **File Validation**: Automatic content validation and format detection

### 🔬 Comprehensive Genetic Analysis
- **SNP Database**: 200+ curated genetic variants with clinical significance
- **Multi-Category Coverage**:
  - 🏥 Disease Risk (cardiovascular, cancer predisposition)
  - 💊 Drug Metabolism (pharmacogenomics)
  - 🧬 Carrier Status (recessive conditions)
  - 🌍 Ancestry (ethnicity, haplogroups)
  - 🎯 Genetic Traits (physical characteristics)
  - 🧠 Cognitive & Mental Health
  - 🏃 Fitness & Nutrition
  - 😴 Sleep & Circadian Rhythms
  - 🛡️ Immune System

### 🤖 AI-Powered Reports
Powered by OpenAI GPT-4:
- **Actionable Health Protocol**: Personalized daily routines based on genetics
- **Disease Risk Assessment**: Comprehensive risk analysis with prevention strategies
- **Drug Metabolism Guide**: Pharmacogenomic recommendations
- **Nutrition & Fitness Plans**: Diet and exercise tailored to your DNA
- **Carrier Status Reports**: Family planning insights

### 🌍 Ancestry Analysis
- **Ethnicity Estimation**: Percentage breakdown by population
- **Haplogroups**: Paternal (Y-DNA) and maternal (mtDNA) lineage
- **Chromosome Painting**: Visual representation of ancestry by chromosome
- **Reference Populations**: 25+ global populations for comparison

### 👥 DNA Relatives
- **Relative Matching**: Find genetic relatives based on shared DNA
- **Relationship Prediction**: Estimate degrees of relation
- **Privacy Controls**: Opt-in/opt-out with granular sharing settings
- **Comparison Tools**: Side-by-side genome comparison

### 🔍 Interactive SNP Explorer
- **Advanced Search**: Filter by RSID, gene, category, or impact level
- **Favorites System**: Bookmark important variants
- **Export Options**: CSV export for further analysis
- **External Links**: Direct links to dbSNP and research databases

### 🔐 Security & Privacy
- **At-Rest Encryption**: AES-256-GCM encryption for sensitive data
- **Secure Authentication**: Email/password with bcrypt hashing
- **Two-Factor Authentication (2FA)**: TOTP-based 2FA support
- **OAuth Integration**: Sign in with Google or GitHub
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: API rate limiting to prevent abuse
- **Session Management**: Secure session handling
- **Data Access Controls**: Owner-based permissions for shared data

### 📱 Mobile-First Design
- **Progressive Web App (PWA)**: Installable on mobile devices
- **Touch-Optimized**: Mobile gestures and touch targets
- **Responsive Layout**: Works on all screen sizes
- **Keyboard Shortcuts**: Power-user keyboard navigation
- **Dark Mode**: Automatic system preference detection

### 🔄 Sharing & Collaboration
- **Secure Sharing**: Share genomes with specific users
- **Access Levels**: Read, compare, or full access permissions
- **Sharing Invitations**: Email-based invitation system
- **Revoke Access**: Full control over shared data

### 📊 Research & Updates
- **Research Database**: Stay informed on latest genetic research
- **SNP Changelog**: Track updates to genetic interpretations
- **Activity Log**: Track all account and genome activities
- **Notifications**: In-app notifications for updates and shares

### 📄 Export & Reports
- **Healthcare Export**: PDF reports formatted for doctors
- **Data Export**: Download your raw data anytime
- **Comparative Analysis**: Compare multiple genomes

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+ or pnpm
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd genetic-explorer
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and configure at minimum:
```env
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here
SESSION_SECRET=your-super-secret-session-key-min-32-chars
ENCRYPTION_MASTER_KEY=your-32-character-minimum-encryption-key

# Optional but recommended
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_resend_api_key
APP_URL=http://localhost:3000
```

4. **Initialize the database**
```bash
mkdir -p data uploads
npm run db:migrate
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📖 Usage Guide

### First-Time Setup

1. Register a new account or sign in with Google/GitHub
2. Complete the onboarding tour
3. Verify your email address (if configured)
4. Set up two-factor authentication (recommended)

### Uploading Your Genetic Data

1. Navigate to the Upload page from the dashboard
2. Drag and drop your genome file or click to browse
3. Supported formats:
   - **23andMe**: `genome_[name]_full_[date].txt` or `.zip`
   - **AncestryDNA**: `AncestryDNA.txt` or `.zip`
   - **MyHeritage**: `myheritage_dna_data.csv`
   - **Generic**: Tab-delimited with rsid, chromosome, position, genotype
4. The file will be automatically parsed, validated, and encrypted
5. Your genome will appear in the Genomes list

### Exploring Your Genetics

- **Dashboard**: Overview of all your genomes and reports
- **SNP Explorer**: Search and filter your genetic variants
- **Ancestry**: View ethnicity estimates and haplogroups
- **Carrier Status**: Review genetic carrier screening results
- **Traits**: Discover genetic traits and characteristics
- **Relatives**: Find and connect with DNA relatives (opt-in)

### Generating Reports

1. Select a genome from your dashboard
2. Click "Generate Report" for AI-powered analysis
3. Choose report type (Health Protocol, Disease Risk, Drug Metabolism)
4. Wait for AI analysis to complete
5. View, save, or export your personalized report

### Sharing Genomes

1. Go to the Sharing page
2. Click "Share Genome" and select the genome
3. Enter the recipient's email address
4. Choose access level (View, Compare, or Full)
5. The recipient will receive an email invitation

## 🏗️ Architecture

### Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | TanStack Start (Full-stack React) |
| **Frontend** | React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Radix UI |
| **State Management** | TanStack Query (React Query) |
| **Database** | SQLite (better-sqlite3) |
| **AI/ML** | OpenAI GPT-4 |
| **Authentication** | Custom JWT with 2FA support |
| **Email** | Resend or SMTP (Nodemailer) |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Validation** | Zod |

### Project Structure

```
app/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Button, Card, Input, etc.)
│   ├── ancestry/       # Ancestry-specific components
│   ├── carrier/        # Carrier status components
│   ├── relatives/      # DNA relatives components
│   ├── traits/         # Genetic traits components
│   └── mobile/         # Mobile-optimized components
├── routes/             # TanStack Start routes (file-based routing)
│   ├── api/            # API endpoints
│   │   ├── auth/       # Authentication endpoints
│   │   ├── ancestry/   # Ancestry analysis API
│   │   ├── carrier/    # Carrier status API
│   │   ├── relatives/  # DNA relatives API
│   │   └── ...
│   ├── dashboard.tsx   # Main dashboard
│   ├── explorer.tsx    # SNP explorer
│   ├── ancestry/       # Ancestry pages
│   ├── traits/         # Traits pages
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Authentication hook
│   ├── useCsrf.tsx     # CSRF protection hook
│   └── ...
├── utils/              # Utility functions
│   ├── database.ts     # Database operations
│   ├── encryption.ts   # AES-256-GCM encryption
│   ├── auth.ts         # Authentication utilities
│   ├── genomeParser.ts # Genetic data parsing
│   ├── llmAnalysis.ts  # AI analysis pipeline
│   └── ...
├── types/              # TypeScript type definitions
├── data/               # Reference data (SNPs, haplogroups, etc.)
└── emails/             # React Email templates

data/                   # SQLite database storage
uploads/                # Uploaded genome files
scripts/                # Database migration and backup scripts
```

### Database Schema

**Users Table**
- `id`: TEXT PRIMARY KEY
- `email`: TEXT UNIQUE
- `password_hash`: TEXT (bcrypt)
- `name`: TEXT
- `is_verified`: INTEGER
- `two_factor_secret`: TEXT (encrypted)
- `two_factor_enabled`: INTEGER
- `created_at`: DATETIME

**Genomes Table**
- `id`: TEXT PRIMARY KEY
- `user_id`: TEXT FOREIGN KEY
- `original_filename`: TEXT
- `filename`: TEXT (stored name)
- `source`: TEXT (23andme, ancestry, etc.)
- `snp_count`: INTEGER
- `stored_snps`: INTEGER
- `checksum_sha256`: TEXT
- `compression_type`: TEXT
- `status`: TEXT (pending, processing, completed, error)
- `is_primary`: INTEGER
- `encrypted_data`: TEXT (for sensitive metadata)

**SNPs Table**
- `id`: INTEGER PRIMARY KEY
- `genome_id`: TEXT FOREIGN KEY
- `rsid`: TEXT
- `chromosome`: TEXT
- `position`: INTEGER
- `genotype`: TEXT
- `gene`: TEXT

**Reports Table**
- `id`: TEXT PRIMARY KEY
- `genome_id`: TEXT FOREIGN KEY
- `user_id`: TEXT FOREIGN KEY
- `report_type`: TEXT
- `content`: JSON
- `status`: TEXT
- `created_at`: DATETIME

**Sharing Table**
- `id`: TEXT PRIMARY KEY
- `genome_id`: TEXT FOREIGN KEY
- `owner_id`: TEXT FOREIGN KEY
- `shared_with_id`: TEXT FOREIGN KEY
- `permission_level`: TEXT (view, compare, full)
- `expires_at`: DATETIME

## 🔬 Data Sources

The application references the following public databases:

- **[ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/)**: Clinical significance of variants
- **[PharmGKB](https://www.pharmgkb.org/)**: Pharmacogenomic information
- **[dbSNP](https://www.ncbi.nlm.nih.gov/snp/)**: Reference SNP database
- **[GWAS Catalog](https://www.ebi.ac.uk/gwas/)**: Genome-wide association studies

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev                 # Start development server
npm run build               # Build for production
npm run start               # Start production server

# Testing
npm run test                # Run tests in watch mode
npm run test:ui             # Run tests with UI
npm run test:coverage       # Run tests with coverage
npm run test:ci             # Run tests once (for CI)

# Code Quality
npm run lint                # Run ESLint
npm run typecheck           # Run TypeScript type checking

# Database
npm run db:migrate          # Run database migrations
npm run db:backup           # Backup database
npm run db:restore          # Restore database from backup

# Docker
npm run docker:build        # Build Docker image
npm run docker:run          # Run with docker-compose
npm run docker:stop         # Stop docker-compose
npm run docker:logs         # View Docker logs

# Platform-specific builds
npm run build:vercel        # Build for Vercel
npm run build:cf            # Build for Cloudflare
npm run build:netlify       # Build for Netlify
npm run build:fly           # Build for Fly.io
npm run build:railway       # Build for Railway
npm run build:heroku        # Build for Heroku
npm run build:do            # Build for DigitalOcean
npm run build:northflank    # Build for Northflank
```

### Testing

The project uses **Vitest** for unit and integration testing:

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage report
npm run test:coverage
```

Tests are located alongside the files they test with `.test.ts` or `.test.tsx` extensions.

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for genetic analysis |
| `SESSION_SECRET` | Yes | Secret for session encryption (min 32 chars) |
| `ENCRYPTION_MASTER_KEY` | Yes | Master key for data encryption (min 32 chars) |
| `DATABASE_URL` | No | SQLite database path (default: `./data/genetic_explorer.db`) |
| `UPLOADS_DIR` | No | Uploads directory (default: `./uploads`) |
| `PORT` | No | Server port (default: 3000) |
| `APP_URL` | No | Application URL for emails (default: http://localhost:3000) |
| `EMAIL_PROVIDER` | No | Email provider: `resend` or `smtp` |
| `RESEND_API_KEY` | No | Resend API key for email sending |
| `SMTP_*` | No | SMTP configuration (if using SMTP) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |
| `DISABLE_SIGNUP` | No | Set to `true` to disable new registrations |
| `ALLOWED_EMAIL_DOMAINS` | No | Comma-separated list of allowed email domains |

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t genetic-explorer .
docker run -p 3000:3000 --env-file .env genetic-explorer
```

### Platform-Specific Deployment

The project includes configurations for multiple deployment platforms:

| Platform | Build Command | Deploy Command |
|----------|---------------|----------------|
| **Vercel** | `npm run build:vercel` | `npm run deploy:vercel` |
| **Cloudflare Pages** | `npm run build:cf` | `npm run deploy:cf` |
| **Netlify** | `npm run build:netlify` | `npm run deploy:netlify` |
| **Railway** | `npm run build:railway` | `npm run deploy:railway` |
| **Fly.io** | `npm run build:fly` | `npm run deploy:fly` |
| **Heroku** | `npm run build:heroku` | `npm run deploy:heroku` |
| **DigitalOcean** | `npm run build:do` | `npm run deploy:do` |
| **Northflank** | `npm run build:northflank` | `npm run deploy:northflank` |
| **Koyeb** | - | `npm run deploy:koyeb` |
| **Render** | - | Deploy via Git integration |

See individual configuration files (`vercel.json`, `fly.toml`, `railway.toml`, etc.) for platform-specific settings.

## 🔒 Privacy & Security

### Data Encryption

- **At-Rest Encryption**: All sensitive genetic data is encrypted using AES-256-GCM
- **User-Specific Keys**: Each user has a unique encryption key derived from the master key
- **Secure Passwords**: Passwords hashed with bcrypt (10+ rounds)
- **Session Security**: HTTP-only cookies with secure flags

### Data Access

- **Owner-Based Access**: Only genome owners can access their data (unless explicitly shared)
- **Audit Logging**: All access and modifications are logged
- **No Third-Party Sharing**: Genetic data is never shared with third parties
- **OpenAI Privacy**: Only relevant genetic variants are sent to OpenAI for analysis (not full genome)

### Self-Hosting Security Recommendations

1. Use HTTPS in production (required for OAuth)
2. Set strong `SESSION_SECRET` and `ENCRYPTION_MASTER_KEY` (use `openssl rand -hex 32`)
3. Enable 2FA for admin accounts
4. Configure rate limiting
5. Set up regular database backups
6. Use environment-specific OAuth credentials

## ⚠️ Important Disclaimer

**This application is for educational and research purposes only.**

- Genetic analysis is complex and constantly evolving
- Results should **not** be used as medical advice
- Always consult healthcare professionals for medical decisions
- AI-generated reports are based on available research and may not reflect the latest findings
- Not all genetic variants are well-understood or have clinical significance
- The app does not diagnose diseases or predict outcomes with certainty

## 📚 Learn More

- [TanStack Start Documentation](https://tanstack.com/start/latest)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/)
- [PharmGKB](https://www.pharmgkb.org/)
- [dbSNP](https://www.ncbi.nlm.nih.gov/snp/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the **Genetic Explorer License**.

### Quick Summary
- ✅ **Free for personal use** - Analyze your own genetic data
- ✅ **Free for research & education** - Academic and non-profit use welcome
- ✅ **Free to modify** - Contribute improvements back to the project
- ❌ **No competing services** - Cannot create competing SaaS/genetic analysis platforms
- 💼 **Commercial use requires license** - Contact us for commercial licensing

See [LICENSE](LICENSE) for full terms and [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md) for commercial use inquiries.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for AI analysis capabilities
- [NCBI](https://www.ncbi.nlm.nih.gov/) for ClinVar and dbSNP databases
- [PharmGKB](https://www.pharmgkb.org/) for pharmacogenomic data
- [TanStack](https://tanstack.com/) for the amazing full-stack React framework
- The open-source community for the tools that make this possible

---

**Built with ❤️ for the curious about their genetic code.**

<p align="center">
  <a href="https://geneticexplorer.com">Website</a> •
  <a href="https://docs.geneticexplorer.com">Documentation</a> •
  <a href="https://github.com/yourusername/genetic-explorer/issues">Issues</a> •
  <a href="https://github.com/yourusername/genetic-explorer/discussions">Discussions</a>
</p>
