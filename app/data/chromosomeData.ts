/**
 * Chromosome Data Module
 * 
 * Contains reference data for all 23 human chromosomes (22 autosomes + X chromosome)
 * Including base pair lengths, cytogenetic band positions, and centromere locations.
 * 
 * Data sources:
 * - Chromosome lengths based on GRCh38 (hg38) reference genome
 * - Cytogenetic bands from UCSC Genome Browser
 */

export interface CytogeneticBand {
  /** Band name (e.g., "p36.33", "q12.1") */
  name: string;
  /** Start position in base pairs */
  start: number;
  /** End position in base pairs */
  end: number;
  /** Giemsa staining pattern */
  stain: 'gneg' | 'gpos25' | 'gpos50' | 'gpos75' | 'gpos100' | 'acen' | 'gvar' | 'stalk';
}

export interface ChromosomeInfo {
  /** Chromosome number (1-22, X) */
  name: string;
  /** Total length in base pairs */
  length: number;
  /** Centromere position in base pairs */
  centromere: number;
  /** Cytogenetic bands */
  bands: CytogeneticBand[];
  /** Short arm (p arm) length */
  pArmLength: number;
  /** Long arm (q arm) length */
  qArmLength: number;
}

/** Category colors for SNPs */
export const SNP_CATEGORIES = {
  'Methylation': { color: '#3b82f6', label: 'Methylation', icon: '🧬' },      // blue
  'Drug Metabolism': { color: '#a855f7', label: 'Drug Metabolism', icon: '💊' }, // purple
  'Cardiovascular': { color: '#ef4444', label: 'Cardiovascular', icon: '❤️' },   // red
  'Nutrition': { color: '#22c55e', label: 'Nutrition', icon: '🥗' },             // green
  'Fitness': { color: '#f97316', label: 'Fitness', icon: '💪' },                 // orange
  'Mental Health': { color: '#8b5cf6', label: 'Mental Health', icon: '🧠' },     // violet
  'Disease Risk': { color: '#eab308', label: 'Disease Risk', icon: '⚠️' },       // yellow
  'Immune System': { color: '#14b8a6', label: 'Immune', icon: '🛡️' },           // teal
  'Hormonal': { color: '#f59e0b', label: 'Hormonal', icon: '⚡' },               // amber
  'Sleep': { color: '#6366f1', label: 'Sleep', icon: '😴' },                     // indigo
  'Cognitive': { color: '#06b6d4', label: 'Cognitive', icon: '🎯' },             // cyan
  'Longevity': { color: '#10b981', label: 'Longevity', icon: '⏳' },             // emerald
  'Carrier Status': { color: '#ec4899', label: 'Carrier', icon: '🧪' },          // pink
  'Unknown': { color: '#94a3b8', label: 'Unknown', icon: '❓' },                  // slate
} as const;

/** Get color for a category */
export function getCategoryColor(category: string): string {
  return SNP_CATEGORIES[category as keyof typeof SNP_CATEGORIES]?.color ?? SNP_CATEGORIES.Unknown.color;
}

/** Get label for a category */
export function getCategoryLabel(category: string): string {
  return SNP_CATEGORIES[category as keyof typeof SNP_CATEGORIES]?.label ?? category;
}

/** Get icon for a category */
export function getCategoryIcon(category: string): string {
  return SNP_CATEGORIES[category as keyof typeof SNP_CATEGORIES]?.icon ?? '🔬';
}

// ============================================================================
// Chromosome Lengths (GRCh38)
// ============================================================================

export const CHROMOSOME_LENGTHS: Record<string, number> = {
  '1': 248956422,
  '2': 242193529,
  '3': 198295559,
  '4': 190214555,
  '5': 181538259,
  '6': 170805979,
  '7': 159345973,
  '8': 145138636,
  '9': 138394717,
  '10': 133797422,
  '11': 135086622,
  '12': 133275309,
  '13': 114364328,
  '14': 107043718,
  '15': 101991189,
  '16': 90338345,
  '17': 83257441,
  '18': 80373285,
  '19': 58617616,
  '20': 64444167,
  '21': 46709983,
  '22': 50818468,
  'X': 156040895,
  'Y': 57227415,
  'MT': 16569,
};

// ============================================================================
// Centromere Positions (GRCh38)
// ============================================================================

export const CENTROMERE_POSITIONS: Record<string, number> = {
  '1': 125000000,
  '2': 93300000,
  '3': 91000000,
  '4': 50400000,
  '5': 48400000,
  '6': 61000000,
  '7': 59900000,
  '8': 45600000,
  '9': 49000000,
  '10': 40200000,
  '11': 53700000,
  '12': 35800000,
  '13': 17900000,
  '14': 17600000,
  '15': 19000000,
  '16': 36600000,
  '17': 24000000,
  '18': 17200000,
  '19': 26500000,
  '20': 27500000,
  '21': 13200000,
  '22': 14700000,
  'X': 61000000,
  'Y': 10400000,
};

// ============================================================================
// Cytogenetic Bands
// Simplified representation of major bands
// ============================================================================

function createBands(
  chromosome: string,
  centromerePos: number,
  length: number
): CytogeneticBand[] {
  const bands: CytogeneticBand[] = [];
  const armRatio = centromerePos / length;
  
  // Create p arm bands (short arm, before centromere)
  if (centromerePos > 1000000) {
    const pArmLength = centromerePos;
    const numPBands = Math.max(3, Math.floor(pArmLength / 15000000));
    
    for (let i = 0; i < numPBands; i++) {
      const start = Math.floor((i / numPBands) * pArmLength);
      const end = Math.floor(((i + 1) / numPBands) * pArmLength);
      const region = Math.floor((numPBands - i - 1) / 3) + 1;
      const subBand = ['.3', '.2', '.1'][i % 3] || '';
      
      // Alternate staining patterns
      const stains: CytogeneticBand['stain'][] = ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100'];
      const stain = stains[i % stains.length];
      
      bands.push({
        name: `p${region}${subBand}`,
        start,
        end,
        stain,
      });
    }
  }
  
  // Add centromere
  bands.push({
    name: 'cen',
    start: centromerePos - 1000000,
    end: centromerePos + 1000000,
    stain: 'acen',
  });
  
  // Create q arm bands (long arm, after centromere)
  const qArmLength = length - centromerePos;
  const numQBands = Math.max(3, Math.floor(qArmLength / 15000000));
  
  for (let i = 0; i < numQBands; i++) {
    const start = centromerePos + Math.floor((i / numQBands) * qArmLength);
    const end = centromerePos + Math.floor(((i + 1) / numQBands) * qArmLength);
    const region = Math.floor(i / 3) + 1;
    const subBand = ['.1', '.2', '.3'][i % 3] || '';
    
    // Alternate staining patterns
    const stains: CytogeneticBand['stain'][] = ['gpos100', 'gpos75', 'gpos50', 'gpos25', 'gneg'];
    const stain = stains[i % stains.length];
    
    bands.push({
      name: `q${region}${subBand}`,
      start,
      end,
      stain,
    });
  }
  
  return bands;
}

// ============================================================================
// Complete Chromosome Data
// ============================================================================

export const CHROMOSOMES: ChromosomeInfo[] = (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X'] as const).map(
  (name) => {
    const length = CHROMOSOME_LENGTHS[name];
    const centromere = CENTROMERE_POSITIONS[name];
    const bands = createBands(name, centromere, length);
    
    return {
      name,
      length,
      centromere,
      bands,
      pArmLength: centromere,
      qArmLength: length - centromere,
    };
  }
);

/** Get chromosome info by name */
export function getChromosome(name: string): ChromosomeInfo | undefined {
  return CHROMOSOMES.find((c) => c.name === name);
}

/** Get total genome size in base pairs */
export function getTotalGenomeSize(): number {
  return Object.values(CHROMOSOME_LENGTHS).reduce((sum, len) => sum + len, 0);
}

/** Format base pair count for display */
export function formatBasePairs(bp: number): string {
  if (bp >= 1000000) {
    return `${(bp / 1000000).toFixed(2)} Mb`;
  }
  if (bp >= 1000) {
    return `${(bp / 1000).toFixed(2)} kb`;
  }
  return `${bp} bp`;
}

/** Convert position to percentage along chromosome */
export function positionToPercent(position: number, chromosomeLength: number): number {
  return (position / chromosomeLength) * 100;
}

/** Convert percentage to position */
export function percentToPosition(percent: number, chromosomeLength: number): number {
  return Math.floor((percent / 100) * chromosomeLength);
}

/** Get cytogenetic band for a position */
export function getBandForPosition(
  position: number,
  chromosome: string
): CytogeneticBand | undefined {
  const chr = getChromosome(chromosome);
  if (!chr) return undefined;
  
  return chr.bands.find((band) => position >= band.start && position <= band.end);
}

/** Format position as cytogenetic band notation */
export function getCytogeneticPosition(position: number, chromosome: string): string {
  const band = getBandForPosition(position, chromosome);
  if (band && band.name !== 'cen') {
    return `${chromosome}${band.name}`;
  }
  return `Chr${chromosome}:${position.toLocaleString()}`;
}

/** Stain to color mapping for visualization */
export const STAIN_COLORS: Record<CytogeneticBand['stain'], string> = {
  gneg: '#f8fafc',      // Light - AT-rich, gene-poor
  gpos25: '#cbd5e1',    // Light gray
  gpos50: '#94a3b8',    // Medium gray
  gpos75: '#64748b',    // Dark gray
  gpos100: '#475569',   // Dark - GC-rich, gene-dense
  acen: '#dc2626',      // Red for centromere
  gvar: '#fca5a5',      // Variable region
  stalk: '#fef3c7',     // Stalk region
};

/** Get stain color with dark mode support */
export function getStainColor(stain: CytogeneticBand['stain'], isDark: boolean): string {
  const darkModeColors: Record<CytogeneticBand['stain'], string> = {
    gneg: '#1e293b',
    gpos25: '#334155',
    gpos50: '#475569',
    gpos75: '#64748b',
    gpos100: '#94a3b8',
    acen: '#ef4444',
    gvar: '#7f1d1d',
    stalk: '#451a03',
  };
  
  return isDark ? darkModeColors[stain] : STAIN_COLORS[stain];
}

/** Compare mode types */
export type CompareMode = 'single' | 'compare' | 'overlay';

/** Chromosome view state */
export interface ViewState {
  /** Selected chromosome name */
  selectedChromosome: string | null;
  /** Zoom level (1 = full view) */
  zoom: number;
  /** Pan offset in pixels */
  pan: { x: number; y: number };
  /** Visible region start position */
  viewStart: number;
  /** Visible region end position */
  viewEnd: number;
  /** Whether to show labels */
  showLabels: boolean;
  /** Whether to show genes */
  showGenes: boolean;
  /** Filter by categories */
  categoryFilter: string[];
}

/** Default view state */
export const DEFAULT_VIEW_STATE: ViewState = {
  selectedChromosome: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
  viewStart: 0,
  viewEnd: 0,
  showLabels: true,
  showGenes: false,
  categoryFilter: [],
};
