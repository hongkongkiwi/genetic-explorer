# 🧬 Genetic Explorer

A beautiful, comprehensive web application for exploring and analyzing personal genetic data. Upload your 23andMe, AncestryDNA, or other genetic test results to receive detailed health insights, drug metabolism analysis, and personalized recommendations powered by AI.

![Genetic Explorer](https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&h=400&fit=crop)

## ✨ Features

### 📤 Easy Data Upload
- Support for 23andMe, AncestryDNA, and standard genome.txt formats
- Secure local storage of genetic data
- Automatic parsing and validation

### 🔬 Comprehensive SNP Analysis
- Cross-references with ClinVar (clinical significance)
- PharmGKB integration for drug metabolism
- Categorized variants: Drug Response, Nutrition, Fitness, Disease Risk, Ancestry

### 🤖 AI-Powered Reports
- **Actionable Health Protocol**: Personalized recommendations based on your genetics
- **Disease Risk Summary**: Understand your genetic predispositions
- **Drug Metabolism Guide**: How your body processes medications
- **Nutrition & Fitness**: Tailored diet and exercise recommendations

### 🔍 Interactive SNP Explorer
- Search and filter by RSID, gene, category, or impact
- Export results to CSV
- Direct links to dbSNP for detailed variant information

### 📊 Beautiful Visualizations
- Risk level indicators
- Impact badges
- Category-based organization
- Progress tracking during analysis

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (for AI-powered analysis)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd genetic-explorer
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=your_api_key_here
```

4. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📖 Usage Guide

### Uploading Your Genetic Data

1. Navigate to the Upload page
2. Drag and drop your genome file (from 23andMe, AncestryDNA, etc.)
3. The file will be automatically parsed and stored securely

**Supported Formats:**
- 23andMe raw data (genome_*.txt)
- AncestryDNA (AncestryDNA.txt)
- Generic format (rsid, chromosome, position, genotype)

### Viewing Reports

1. After upload, your genome will be analyzed automatically
2. Visit the Reports page to see all generated reports
3. Click on any report to view detailed insights

### Exploring SNPs

1. Go to the SNP Explorer
2. Select your genome from the dropdown
3. Use filters to find specific variants:
   - Search by RSID, gene name, or description
   - Filter by category (Drug Response, Nutrition, etc.)
   - Filter by impact level (High, Moderate, Low, Protective)
4. Export results to CSV for further analysis

## 🏗️ Architecture

### Tech Stack

- **Framework**: TanStack Start (Full-stack React)
- **Styling**: Tailwind CSS
- **Database**: SQLite (better-sqlite3)
- **AI Analysis**: OpenAI GPT-4
- **Icons**: Lucide React

### Project Structure

```
app/
├── components/          # React components
│   ├── AnalysisProgress.tsx
│   ├── CategoryBadge.tsx
│   ├── DNALogo.tsx
│   ├── ImpactBadge.tsx
│   ├── Navbar.tsx
│   └── UploadZone.tsx
├── routes/             # TanStack Start routes
│   ├── api/            # API endpoints
│   │   ├── analyze/    # Analysis endpoints
│   │   ├── genomes.ts  # Genome management
│   │   └── reports/    # Report endpoints
│   ├── __root.tsx      # Root layout
│   ├── explorer.tsx    # SNP explorer page
│   ├── genomes.tsx     # Genome list page
│   ├── index.tsx       # Home page
│   ├── report/         # Report detail pages
│   ├── reports.tsx     # Reports list page
│   └── upload.tsx      # Upload page
├── types/              # TypeScript types
│   └── genetics.ts
├── utils/              # Utility functions
│   ├── cn.ts           # CSS utilities
│   ├── database.ts     # Database operations
│   ├── databaseQueries.ts  # SNP database queries
│   ├── genomeParser.ts # Genome file parsing
│   └── llmAnalysis.ts  # AI analysis pipeline
├── client.tsx          # Client entry
├── router.tsx          # Router configuration
└── ssr.tsx             # SSR entry

data/                   # SQLite database storage
public/                 # Static assets
```

### Database Schema

**Genomes Table**
- id: TEXT PRIMARY KEY
- originalName: TEXT
- filePath: TEXT
- uploadedAt: DATETIME
- status: TEXT (pending, processing, completed, error)

**Reports Table**
- id: TEXT PRIMARY KEY
- genomeId: TEXT FOREIGN KEY
- reportType: TEXT
- status: TEXT
- content: JSON
- createdAt: DATETIME

## 🔬 Data Sources

The application queries the following public databases:

- **ClinVar**: Clinical significance of variants
- **PharmGKB**: Pharmacogenomic information
- **dbSNP**: Reference SNP information

## ⚠️ Important Disclaimer

**This application is for educational and research purposes only.**

- Genetic analysis is complex and constantly evolving
- Results should not be used as medical advice
- Always consult healthcare professionals for medical decisions
- The AI-generated reports are based on available research and may not reflect the latest findings
- Not all genetic variants are well-understood or have clinical significance

## 🔒 Privacy & Security

- All genetic data is stored locally on your machine
- No data is sent to external servers (except OpenAI for analysis, if enabled)
- You have full control over your genetic information
- Database is stored in the `data/` directory

## 🛠️ Development

### Building for Production

```bash
npm run build
```

### Database Management

The SQLite database is automatically created in the `data/` directory. To reset:

```bash
rm data/genetic_explorer.db
```

### Adding New SNPs to Database

Edit `app/utils/databaseQueries.ts` to add new SNPs to the local database:

```typescript
const SNP_DATABASE: Record<string, SNPInfo> = {
  'rs12345': {
    rsid: 'rs12345',
    gene: 'GENE1',
    // ... details
  },
  // Add more SNPs...
}
```

## 📚 Learn More

- [TanStack Start Documentation](https://tanstack.com/start/latest)
- [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/)
- [PharmGKB](https://www.pharmgkb.org/)
- [dbSNP](https://www.ncbi.nlm.nih.gov/snp/)

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- OpenAI for providing the AI analysis capabilities
- NCBI for ClinVar and dbSNP databases
- PharmGKB for pharmacogenomic data
- The open-source community for the amazing tools that make this possible

---

**Built with ❤️ for the curious about their genetic code.**
