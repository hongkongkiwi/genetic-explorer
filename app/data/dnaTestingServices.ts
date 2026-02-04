/**
 * DNA Testing Services Data
 * 
 * Comprehensive guide to services that provide raw DNA data downloads.
 * Includes pricing, coverage, download instructions, and regional availability.
 */

export interface DNAService {
  id: string;
  name: string;
  company: string;
  logo?: string;
  website: string;
  price: {
    usd: number;
    currency: string;
    note?: string;
  };
  coverage: {
    snps: number;
    percentage: number; // % of genome covered
    description: string;
  };
  regions: string[]; // Countries/regions available
  features: string[];
  pros: string[];
  cons: string[];
  rawData: {
    available: boolean;
    format: string;
    downloadTime: string;
    instructions: string[];
    importantNotes?: string[];
  };
  privacy: {
    dataOwnership: string;
    deletionPolicy: string;
    thirdPartySharing: string;
    rating: 'excellent' | 'good' | 'fair' | 'poor';
  };
  recommended: boolean;
  bestFor: string[];
}

export const dnaTestingServices: DNAService[] = [
  {
    id: '23andme-v5',
    name: '23andMe Ancestry + Health',
    company: '23andMe',
    website: 'https://www.23andme.com',
    price: {
      usd: 199,
      currency: 'USD',
      note: 'Ancestry only: $99',
    },
    coverage: {
      snps: 640000,
      percentage: 0.02,
      description: '~640,000 SNPs across genome',
    },
    regions: ['USA', 'Canada', 'UK', 'EU', 'Australia'],
    features: [
      'Health reports (FDA cleared)',
      'Ancestry composition',
      'DNA relatives matching',
      'Traits reports',
      'Pharmacogenomics',
    ],
    pros: [
      'Largest user database for relative matching',
      'FDA-cleared health reports',
      'Regular free report updates',
      'Easy raw data download',
    ],
    cons: [
      'Privacy concerns (data sharing with pharma)',
      'Expensive for full health package',
      'Limited ancestry analysis',
    ],
    rawData: {
      available: true,
      format: '23andMe (txt)',
      downloadTime: 'Immediate after kit registration',
      instructions: [
        'Sign in to 23andMe.com',
        'Click on your profile name → "Browse Raw Data"',
        'Click "Download" tab',
        'Click "Download Raw Data" button',
        'Enter password for verification',
        'Save the .txt file (filename format: genome_[name]_full_[date].txt)',
      ],
      importantNotes: [
        'File size: ~10-15 MB',
        'Contains ~640,000 SNPs',
        'Format: rsid, chromosome, position, genotype',
      ],
    },
    privacy: {
      dataOwnership: 'You retain ownership but grant broad usage rights',
      deletionPolicy: 'Can request deletion, but data may be retained in aggregated form',
      thirdPartySharing: 'Shares anonymized data with pharmaceutical partners',
      rating: 'fair',
    },
    recommended: true,
    bestFor: ['Health insights', 'Relative matching', 'Beginners'],
  },
  {
    id: 'ancestrydna',
    name: 'AncestryDNA',
    company: 'Ancestry',
    website: 'https://www.ancestry.com/dna',
    price: {
      usd: 99,
      currency: 'USD',
      note: 'Frequent sales for $59-79',
    },
    coverage: {
      snps: 700000,
      percentage: 0.022,
      description: '~700,000 SNPs, excellent for ancestry',
    },
    regions: ['USA', 'Canada', 'UK', 'Ireland', 'Australia', 'NZ'],
    features: [
      'Detailed ethnicity estimates',
      'Family tree integration',
      'DNA matches (20M+ users)',
      'ThruLines (common ancestors)',
      'Traits (separate purchase)',
    ],
    pros: [
      'Largest DNA database for genealogy',
      'Excellent family tree tools',
      'Best ethnicity breakdowns',
      'Good value for ancestry',
    ],
    cons: [
      'No health reports',
      'Requires subscription for full features',
      'Raw data less useful for health analysis',
    ],
    rawData: {
      available: true,
      format: 'AncestryDNA (txt)',
      downloadTime: 'Available after results ready (6-8 weeks)',
      instructions: [
        'Sign in to Ancestry.com',
        'Click "DNA" tab → "Your DNA Results Summary"',
        'Click "Settings" (gear icon) in top right',
        'Scroll to "Download Raw DNA Data"',
        'Click "Download" button',
        'Enter password for verification',
        'Check email for download link (valid 24 hours)',
        'Download the .zip file and extract',
      ],
      importantNotes: [
        'File size: ~5-8 MB compressed',
        'Contains ~700,000 SNPs',
        'Different format than 23andMe (tab-separated)',
      ],
    },
    privacy: {
      dataOwnership: 'Ancestry claims ownership of processed data',
      deletionPolicy: 'Can delete, but takes 30 days',
      thirdPartySharing: 'May share with research partners',
      rating: 'fair',
    },
    recommended: true,
    bestFor: ['Genealogy', 'Ethnicity', 'Family tree building'],
  },
  {
    id: 'myheritage',
    name: 'MyHeritage DNA',
    company: 'MyHeritage',
    website: 'https://www.myheritage.com/dna',
    price: {
      usd: 79,
      currency: 'USD',
      note: 'Frequent sales for $39-59',
    },
    coverage: {
      snps: 630000,
      percentage: 0.02,
      description: '~630,000 SNPs',
    },
    regions: ['Global (ships to most countries)'],
    features: [
      'Ethnicity estimates',
      'DNA matching',
      'Family tree builder',
      'AutoClusters (grouping matches)',
      'Chromosome browser',
    ],
    pros: [
      'Best for European genealogy',
      'Free family tree (250 people)',
      'Good value',
      'Accepts uploads from other services',
    ],
    cons: [
      'Smaller database than Ancestry',
      'No health reports',
      'Some features require subscription',
    ],
    rawData: {
      available: true,
      format: 'MyHeritage (txt)',
      downloadTime: 'Available after results ready (3-4 weeks)',
      instructions: [
        'Sign in to MyHeritage.com',
        'Click "DNA" tab',
        'Click "Manage DNA Kits"',
        'Click "Download Raw Data" next to your kit',
        'Confirm password',
        'Save the .zip file and extract',
      ],
      importantNotes: [
        'Can also UPLOAD raw data from 23andMe/Ancestry for free',
        'File size: ~10 MB',
        'Contains ~630,000 SNPs',
      ],
    },
    privacy: {
      dataOwnership: 'You retain ownership',
      deletionPolicy: 'Can request deletion anytime',
      thirdPartySharing: 'Limited sharing, more privacy-focused',
      rating: 'good',
    },
    recommended: true,
    bestFor: ['European ancestry', 'Uploading existing data', 'Value'],
  },
  {
    id: 'ftdna-family-finder',
    name: 'Family Finder',
    company: 'FamilyTreeDNA',
    website: 'https://www.familytreedna.com',
    price: {
      usd: 79,
      currency: 'USD',
      note: 'Frequent sales',
    },
    coverage: {
      snps: 720000,
      percentage: 0.023,
      description: '~720,000 SNPs',
    },
    regions: ['Global'],
    features: [
      'myOrigins (ethnicity)',
      'Family matching',
      'Chromosome browser',
      'mtDNA/Y-DNA tests available',
      'Projects (surname/geographic)',
    ],
    pros: [
      'Only service offering Y-DNA and mtDNA tests',
      'Advanced tools for genetic genealogy',
      'Good chromosome browser',
      'Project features',
    ],
    cons: [
      'Smaller autosomal database',
      'No health reports',
      'Interface dated',
      'Y-DNA/mtDNA tests expensive',
    ],
    rawData: {
      available: true,
      format: 'FTDNA (csv)',
      downloadTime: 'Immediate after results ready',
      instructions: [
        'Sign in to FamilyTreeDNA.com',
        'Click "myFTDNA" or "Dashboard"',
        'Click "Family Finder"',
        'Click "Download Raw Data"',
        'Select build 37 (standard)',
        'Click "Download"',
      ],
      importantNotes: [
        'Offers Build 36 or 37 (use 37)',
        'File format: CSV',
        'Also offers mtDNA/Y-DNA downloads (separate)',
      ],
    },
    privacy: {
      dataOwnership: 'You retain ownership',
      deletionPolicy: 'Can delete, but some data retained',
      thirdPartySharing: 'Participated in FBI cooperation (controversial)',
      rating: 'poor',
    },
    recommended: false,
    bestFor: ['Y-DNA testing', 'mtDNA testing', 'Advanced genealogy'],
  },
  {
    id: 'nebula-30x',
    name: 'Nebula Genomics (30x Whole Genome)',
    company: 'Nebula Genomics',
    website: 'https://www.nebulagenomics.org',
    price: {
      usd: 299,
      currency: 'USD',
      note: 'Deep: $999 (100x), Lite: $99 (0.4x)',
    },
    coverage: {
      snps: 6000000000, // 6 billion base pairs
      percentage: 99.9,
      description: '30x Whole Genome Sequencing - nearly complete genome',
    },
    regions: ['USA', 'Global'],
    features: [
      'Complete genome sequence',
      'All SNPs (not just selected ones)',
      'Structural variants',
      'Mitochondrial DNA',
      'Privacy-focused (blockchain)',
    ],
    pros: [
      'Most comprehensive data available',
      'True whole genome (not just SNPs)',
      'Best for health analysis',
      'Privacy-focused model',
      'One-time purchase, lifetime updates',
    ],
    cons: [
      'Expensive',
      'Overkill for most users',
      'Large file sizes (100GB+)',
      'Requires technical knowledge',
    ],
    rawData: {
      available: true,
      format: 'BAM/CRAM/VCF',
      downloadTime: '8-12 weeks',
      instructions: [
        'Sign in to Nebula Genomics',
        'Go to "Library"',
        'Click "Download Raw Data"',
        'Choose format: BAM (full), CRAM (compressed), or VCF (variants)',
        'Wait for email notification',
        'Download via provided link (files are huge)',
      ],
      importantNotes: [
        'BAM files: 100-200 GB',
        'VCF files: 1-2 GB',
        'Requires fast internet connection',
        'Consider CRAM for smaller size',
      ],
    },
    privacy: {
      dataOwnership: 'You fully own your data',
      deletionPolicy: 'Complete deletion possible',
      thirdPartySharing: 'No sharing without explicit consent',
      rating: 'excellent',
    },
    recommended: true,
    bestFor: ['Maximum data', 'Health research', 'Privacy-conscious users'],
  },
  {
    id: 'dante-wgs',
    name: 'Dante Labs (30x WGS)',
    company: 'Dante Labs',
    website: 'https://www.dantelabs.com',
    price: {
      usd: 499,
      currency: 'USD',
      note: 'Frequent sales for $199-299',
    },
    coverage: {
      snps: 6000000000,
      percentage: 99.9,
      description: '30x Whole Genome Sequencing',
    },
    regions: ['USA', 'EU', 'Global'],
    features: [
      'Whole genome sequencing',
      'Health reports included',
      'Pharmacogenomics',
      'Carrier status',
      'Nutrigenomics',
    ],
    pros: [
      'True whole genome',
      'Comprehensive health reports',
      'Good sale prices',
      'Fast turnaround (3-4 weeks)',
    ],
    cons: [
      'Customer service issues reported',
      'Reports can be overwhelming',
      'Data interpretation needed',
    ],
    rawData: {
      available: true,
      format: 'BAM/VCF/FASTQ',
      downloadTime: '3-4 weeks',
      instructions: [
        'Sign in to Dante Labs portal',
        'Go to "My Reports"',
        'Click "Download Raw Data"',
        'Select format (VCF recommended for most)',
        'Download via secure link',
      ],
      importantNotes: [
        'VCF: ~1 GB',
        'BAM: ~100 GB',
        'FASTQ: ~200 GB (raw reads)',
      ],
    },
    privacy: {
      dataOwnership: 'You own your data',
      deletionPolicy: 'Can request full deletion',
      thirdPartySharing: 'No sharing without consent',
      rating: 'good',
    },
    recommended: true,
    bestFor: ['Whole genome', 'Health reports', 'Value when on sale'],
  },
  {
    id: 'tellmegen',
    name: 'tellmeGen',
    company: 'tellmeGen',
    website: 'https://www.tellmegen.com',
    price: {
      usd: 199,
      currency: 'USD',
    },
    coverage: {
      snps: 720000,
      percentage: 0.023,
      description: '~720,000 SNPs',
    },
    regions: ['Global'],
    features: [
      'Health predisposition',
      'Pharmacogenomics',
      'Traits',
      'Ancestry',
      'Nutrigenomics',
    ],
    pros: [
      'Strong health focus',
      'Good pharmacogenomics',
      'Regular updates',
      'Accepts uploads from other services',
    ],
    cons: [
      'Smaller database',
      'Less ancestry detail',
    ],
    rawData: {
      available: true,
      format: '23andMe compatible',
      downloadTime: 'Immediate after results',
      instructions: [
        'Sign in to tellmeGen',
        'Go to "Account Settings"',
        'Click "Download Raw Data"',
        'Choose format',
        'Download file',
      ],
      importantNotes: [
        'Upload 23andMe/Ancestry data for free analysis',
        'Good for health-focused European users',
      ],
    },
    privacy: {
      dataOwnership: 'You retain ownership',
      deletionPolicy: 'Can delete anytime',
      thirdPartySharing: 'Limited sharing',
      rating: 'good',
    },
    recommended: false,
    bestFor: ['Health analysis', 'Pharmacogenomics', 'Uploads'],
  },
  {
    id: 'livingdna',
    name: 'Living DNA',
    company: 'Living DNA',
    website: 'https://www.livingdna.com',
    price: {
      usd: 99,
      currency: 'USD',
      note: 'Wellbeing kit: $129',
    },
    coverage: {
      snps: 650000,
      percentage: 0.021,
      description: '~650,000 SNPs',
    },
    regions: ['UK', 'USA', 'Global'],
    features: [
      'Detailed British/Irish ancestry',
      'African ancestry focus',
      'Y-DNA and mtDNA haplogroups',
      'Wellbeing traits',
    ],
    pros: [
      'Best for British ancestry',
      'Detailed regional breakdowns',
      'Free raw data upload',
      'Good African ancestry analysis',
    ],
    cons: [
      'Smaller database',
      'No relative matching (yet)',
      'Less health analysis',
    ],
    rawData: {
      available: true,
      format: 'Living DNA (csv)',
      downloadTime: '6-8 weeks',
      instructions: [
        'Sign in to Living DNA',
        'Go to "Your DNA"',
        'Click "Download Raw Data"',
        'Confirm password',
        'Download CSV file',
      ],
      importantNotes: [
        'Unique CSV format (may need conversion)',
        'Can upload 23andMe data for free ancestry analysis',
      ],
    },
    privacy: {
      dataOwnership: 'You own your data',
      deletionPolicy: 'Full deletion available',
      thirdPartySharing: 'No sharing without consent',
      rating: 'excellent',
    },
    recommended: false,
    bestFor: ['British ancestry', 'African ancestry', 'Privacy'],
  },
];

// Helper functions
export function getRecommendedServices(): DNAService[] {
  return dnaTestingServices.filter(s => s.recommended);
}

export function getServiceById(id: string): DNAService | undefined {
  return dnaTestingServices.find(s => s.id === id);
}

export function getServicesByRegion(region: string): DNAService[] {
  return dnaTestingServices.filter(s => 
    s.regions.some(r => r.toLowerCase().includes(region.toLowerCase()))
  );
}

export function getBestServicesForUseCase(useCase: string): DNAService[] {
  return dnaTestingServices.filter(s => 
    s.bestFor.some(b => b.toLowerCase().includes(useCase.toLowerCase()))
  );
}

// Coverage tiers
export const coverageTiers = {
  microarray: {
    name: 'Microarray (SNP Chip)',
    services: ['23andMe', 'AncestryDNA', 'MyHeritage', 'FTDNA'],
    snpCount: '600K - 720K',
    coverage: '~0.02% of genome',
    bestFor: ['Ancestry', 'Basic health traits', 'Relative matching'],
    priceRange: '$79 - $199',
  },
  lowPass: {
    name: 'Low-Pass WGS',
    services: ['Nebula Lite (0.4x)'],
    snpCount: 'Millions (imputed)',
    coverage: '~5% of genome',
    bestFor: ['Budget whole genome', 'More SNPs than microarray'],
    priceRange: '$99',
  },
  wholeGenome: {
    name: 'Whole Genome Sequencing (30x)',
    services: ['Nebula', 'Dante Labs'],
    snpCount: '6 Billion base pairs',
    coverage: '~99.9% of genome',
    bestFor: ['Complete genetic picture', 'Health research', 'Rare variants'],
    priceRange: '$199 - $999',
  },
};

// Comparison table data
export const comparisonMatrix = {
  features: [
    'Raw Data Download',
    'Health Reports',
    'Ancestry Analysis',
    'Relative Matching',
    'Y-DNA/mtDNA Tests',
    'Accepts Uploads',
    'Privacy Focused',
    'Regular Updates',
  ],
  services: dnaTestingServices.map(s => ({
    name: s.name,
    features: {
      rawData: s.rawData.available,
      health: s.features.some(f => f.toLowerCase().includes('health')),
      ancestry: s.features.some(f => f.toLowerCase().includes('ancestry') || f.toLowerCase().includes('ethnicity')),
      matching: s.features.some(f => f.toLowerCase().includes('match') || f.toLowerCase().includes('relative')),
      ydna: s.features.some(f => f.toLowerCase().includes('y-dna') || f.toLowerCase().includes('mtdna')),
      uploads: s.name.toLowerCase().includes('myheritage') || s.name.toLowerCase().includes('living'),
      privacy: s.privacy.rating === 'excellent' || s.privacy.rating === 'good',
      updates: s.features.some(f => f.toLowerCase().includes('update')),
    },
  })),
};
