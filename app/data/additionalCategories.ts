/**
 * Additional Categories & SNPs
 * 
 * Expanding coverage to include:
 * - Ancestry & Genealogy
 * - Skin & Beauty
 * - Longevity & Aging
 * - Allergies & Sensitivities
 * - Vision & Eye Health
 * - Hearing
 * - Dental Health
 * - Addiction & Behavior
 * - Pregnancy & Fertility
 * - Injury Risk & Recovery
 * - Stress & Resilience
 * - Metabolism & Energy
 */

import type { SNPInfo } from '~/types/genetics';

export const ADDITIONAL_CATEGORIES_SNPS: Record<string, SNPInfo> = {
  // ============================================================================
  // ANCESTRY & GENEALOGY
  // ============================================================================

  'rs1426654': {
    rsid: 'rs1426654',
    gene: 'SLC24A5',
    geneName: 'Solute Carrier Family 24 Member 5',
    chromosome: '15',
    position: 48426484,
    category: 'Ancestry',
    impact: 'Low',
    description: 'Strongly associated with skin pigmentation and European ancestry.',
    genotypes: {
      'GG': { effect: 'Darker skin, African/Asian ancestry', magnitude: 'Normal' },
      'AG': { effect: 'Intermediate skin tone', magnitude: 'Normal' },
      'AA': { effect: 'Lighter skin, European ancestry', magnitude: 'Normal' },
    },
    populationFrequency: { european: 0.95, african: 0.05, asian: 0.10 },
    evidenceLevel: 'Strong',
  },

  'rs16891982': {
    rsid: 'rs16891982',
    gene: 'SLC45A2',
    geneName: 'Solute Carrier Family 45 Member 2',
    chromosome: '5',
    position: 33951693,
    category: 'Ancestry',
    impact: 'Low',
    description: 'Associated with skin/hair/eye color and European ancestry.',
    populationFrequency: { european: 0.90, african: 0.02, asian: 0.15 },
    evidenceLevel: 'Strong',
  },

  'rs12913832': {
    rsid: 'rs12913832',
    gene: 'HERC2',
    geneName: 'HECT And RLD Domain Containing E3 Ubiquitin Protein Ligase 2',
    chromosome: '15',
    position: 28365618,
    category: 'Ancestry',
    impact: 'Low',
    description: 'Strong predictor of blue vs brown eye color.',
    genotypes: {
      'GG': { effect: 'Blue/green eyes likely', magnitude: 'Normal' },
      'AG': { effect: 'Intermediate eye color', magnitude: 'Normal' },
      'AA': { effect: 'Brown eyes likely', magnitude: 'Normal' },
    },
    populationFrequency: { european: 0.70, african: 0.05, asian: 0.10 },
    evidenceLevel: 'Very Strong',
  },

  'rs12203592': {
    rsid: 'rs12203592',
    gene: 'IRF4',
    geneName: 'Interferon Regulatory Factor 4',
    chromosome: '6',
    position: 396321,
    category: 'Ancestry',
    impact: 'Low',
    description: 'Associated with hair color, skin pigmentation, and freckling.',
    evidenceLevel: 'Strong',
  },

  'rs12821256': {
    rsid: 'rs12821256',
    gene: 'KITLG',
    geneName: 'KIT Ligand',
    chromosome: '12',
    position: 89328335,
    category: 'Ancestry',
    impact: 'Low',
    description: 'Associated with blonde hair in Europeans.',
    populationFrequency: { european: 0.25 },
    evidenceLevel: 'Strong',
  },

  'rs3827760': {
    rsid: 'rs3827760',
    gene: 'EDAR',
    geneName: 'Ectodysplasin A Receptor',
    chromosome: '2',
    position: 109513601,
    category: 'Ancestry',
    impact: 'Low',
    description: 'East Asian-specific variant affecting hair thickness, tooth shape, and sweat glands.',
    genotypes: {
      'AA': { effect: 'Thicker hair, shovel-shaped incisors', magnitude: 'Normal' },
    },
    populationFrequency: { asian: 0.80, european: 0.01, african: 0.01 },
    evidenceLevel: 'Very Strong',
  },

  'rs2737194': {
    rsid: 'rs2737194',
    gene: 'ABCC11',
    geneName: 'ATP Binding Cassette Subfamily C Member 11',
    chromosome: '16',
    position: 48224299,
    category: 'Ancestry',
    impact: 'Low',
    description: 'Determines earwax type and body odor.',
    genotypes: {
      'GG': { effect: 'Wet earwax, body odor present', magnitude: 'Normal' },
      'GA': { effect: 'Intermediate', magnitude: 'Normal' },
      'AA': { effect: 'Dry earwax, reduced body odor', magnitude: 'Normal' },
    },
    populationFrequency: { asian: 0.85, european: 0.05, african: 0.10 },
    evidenceLevel: 'Very Strong',
  },

  // ============================================================================
  // SKIN & BEAUTY
  // ============================================================================

  'rs1805007': {
    rsid: 'rs1805007',
    gene: 'MC1R',
    geneName: 'Melanocortin 1 Receptor',
    chromosome: '16',
    position: 89986144,
    category: 'Skin & Beauty',
    impact: 'Moderate',
    description: 'R151C variant - red hair, fair skin, increased sun damage risk.',
    genotypes: {
      'CC': { effect: 'Red hair carrier', magnitude: 'Moderate' },
      'CT': { effect: 'Red hair carrier', magnitude: 'Moderate' },
      'TT': { effect: 'Normal', magnitude: 'Normal' },
    },
    conditions: ['Increased sunburn risk', 'Higher skin cancer risk'],
    recommendations: [
      'High SPF sunscreen (50+) daily',
      'Avoid peak sun hours',
      'Regular skin cancer screenings',
      'Protective clothing',
    ],
    evidenceLevel: 'Very Strong',
  },

  'rs1805008': {
    rsid: 'rs1805008',
    gene: 'MC1R',
    geneName: 'Melanocortin 1 Receptor',
    chromosome: '16',
    position: 89986117,
    category: 'Skin & Beauty',
    impact: 'Moderate',
    description: 'R160W variant - red hair, increased melanoma risk.',
    recommendations: ['Aggressive sun protection', 'Annual dermatology exams'],
    evidenceLevel: 'Very Strong',
  },

  'rs1015362': {
    rsid: 'rs1015362',
    gene: 'ASIP',
    geneName: 'Agouti Signaling Protein',
    chromosome: '20',
    position: 33940297,
    category: 'Skin & Beauty',
    impact: 'Low',
    description: 'Affects skin pigmentation and sun sensitivity.',
    recommendations: ['Sun protection important'],
    evidenceLevel: 'Moderate',
  },

  'rs9922484': {
    rsid: 'rs9922484',
    gene: 'SOD2',
    geneName: 'Superoxide Dismutase 2',
    chromosome: '6',
    position: 160527580,
    category: 'Skin & Beauty',
    impact: 'Low',
    description: 'Affects antioxidant defense and skin aging.',
    recommendations: ['Antioxidant-rich diet', 'Topical vitamin C', 'Sun protection'],
    evidenceLevel: 'Moderate',
  },

  'rs4880': {
    rsid: 'rs4880',
    gene: 'SOD2',
    geneName: 'Superoxide Dismutase 2',
    chromosome: '6',
    position: 160527789,
    category: 'Skin & Beauty',
    impact: 'Low',
    description: 'V16A variant affecting mitochondrial antioxidant defense.',
    genotypes: {
      'TT': { effect: 'Normal SOD2 activity', magnitude: 'Normal' },
      'CT': { effect: 'Intermediate activity', magnitude: 'Low' },
      'CC': { effect: 'Reduced activity, more oxidative stress', magnitude: 'Moderate' },
    },
    recommendations: ['Manganese-rich foods', 'Antioxidant support', 'Avoid excessive iron'],
    evidenceLevel: 'Moderate',
  },

  'rs1800012': {
    rsid: 'rs1800012',
    gene: 'COL1A1',
    geneName: 'Collagen Type I Alpha 1 Chain',
    chromosome: '17',
    position: 50187946,
    category: 'Skin & Beauty',
    impact: 'Low',
    description: 'Affects collagen structure and skin aging.',
    recommendations: ['Vitamin C for collagen synthesis', 'Avoid smoking', 'Sun protection'],
    evidenceLevel: 'Moderate',
  },

  // ============================================================================
  // LONGEVITY & AGING
  // ============================================================================

  'rs2802292': {
    rsid: 'rs2802292',
    gene: 'FOXO3',
    geneName: 'Forkhead Box O3',
    chromosome: '6',
    position: 108879457,
    category: 'Longevity',
    impact: 'Moderate',
    description: 'Associated with longevity and healthy aging in multiple populations.',
    recommendations: ['Caloric restriction may be beneficial', 'Exercise regularly', 'Stress management'],
    evidenceLevel: 'Strong',
  },

  'rs9378199': {
    rsid: 'rs9378199',
    gene: 'CETP',
    geneName: 'Cholesteryl Ester Transfer Protein',
    chromosome: '16',
    position: 56995862,
    category: 'Longevity',
    impact: 'Moderate',
    description: 'I405V variant associated with longevity and cardiovascular health.',
    recommendations: ['May benefit from moderate alcohol', 'Monitor HDL levels'],
    evidenceLevel: 'Moderate',
  },

  'rs2542052': {
    rsid: 'rs2542052',
    gene: 'CETP',
    geneName: 'Cholesteryl Ester Transfer Protein',
    chromosome: '16',
    position: 56996248,
    category: 'Longevity',
    impact: 'Moderate',
    description: 'Associated with exceptional longevity.',
    evidenceLevel: 'Moderate',
  },

  'rs2764264': {
    rsid: 'rs2764264',
    gene: 'CETP',
    geneName: 'Cholesteryl Ester Transfer Protein',
    chromosome: '16',
    position: 56996786,
    category: 'Longevity',
    impact: 'Moderate',
    description: 'Longevity-associated variant.',
    evidenceLevel: 'Moderate',
  },

  'rs33968283': {
    rsid: 'rs33968283',
    gene: 'TP53',
    geneName: 'Tumor Protein P53',
    chromosome: '17',
    position: 7673776,
    category: 'Longevity',
    impact: 'Moderate',
    description: 'P72R variant affecting cancer protection vs aging.',
    genotypes: {
      'CC': { effect: 'Better cancer protection', magnitude: 'Normal' },
      'CG': { effect: 'Intermediate', magnitude: 'Normal' },
      'GG': { effect: 'Better longevity, slightly higher cancer risk', magnitude: 'Low' },
    },
    evidenceLevel: 'Moderate',
  },

  'rs1799950': {
    rsid: 'rs1799950',
    gene: 'TP53',
    geneName: 'Tumor Protein P53',
    chromosome: '17',
    position: 7674959,
    category: 'Longevity',
    impact: 'Low',
    description: 'HWE variant affecting p53 function.',
    evidenceLevel: 'Moderate',
  },

  // ============================================================================
  // ALLERGIES & SENSITIVITIES
  // ============================================================================

  'rs2155219': {
    rsid: 'rs2155219',
    gene: 'GATA3',
    geneName: 'GATA Binding Protein 3',
    chromosome: '10',
    position: 8115867,
    category: 'Allergies',
    impact: 'Moderate',
    description: 'Associated with allergic rhinitis (hay fever).',
    conditions: ['Seasonal allergies', 'Hay fever'],
    recommendations: ['Consider antihistamines during allergy season', 'Air purifier indoors', 'Monitor pollen counts'],
    evidenceLevel: 'Strong',
  },

  'rs7216389': {
    rsid: 'rs7216389',
    gene: 'ORMDL3',
    geneName: 'ORMDL Sphingolipid Biosynthesis Regulator 3',
    chromosome: '17',
    position: 38006605,
    category: 'Allergies',
    impact: 'Moderate',
    description: 'Strongly associated with childhood asthma.',
    conditions: ['Asthma', 'Allergic asthma'],
    recommendations: ['Monitor for asthma symptoms', 'Avoid triggers', 'Have rescue inhaler available'],
    evidenceLevel: 'Very Strong',
  },

  'rs242941': {
    rsid: 'rs242941',
    gene: 'IL13',
    geneName: 'Interleukin 13',
    chromosome: '5',
    position: 132002451,
    category: 'Allergies',
    impact: 'Moderate',
    description: 'Affects IgE levels and allergic response.',
    conditions: ['Allergies', 'Asthma', 'Eczema'],
    recommendations: ['Monitor for atopic conditions', 'Consider IL-13 targeted therapies if severe'],
    evidenceLevel: 'Strong',
  },

  'rs1801274': {
    rsid: 'rs1801274',
    gene: 'IL4R',
    geneName: 'Interleukin 4 Receptor',
    chromosome: '16',
    position: 27349547,
    category: 'Allergies',
    impact: 'Moderate',
    description: 'I50V variant affecting allergic responses.',
    conditions: ['Allergies', 'Asthma'],
    recommendations: ['May respond to anti-IgE therapy', 'Monitor allergy symptoms'],
    evidenceLevel: 'Strong',
  },

  'rs1801131': {
    rsid: 'rs1801131',
    gene: 'HLA-DRB1',
    geneName: 'HLA-DRB1',
    chromosome: '6',
    position: 32546546,
    category: 'Allergies',
    impact: 'Low',
    description: 'Associated with specific allergies and autoimmune risk.',
    evidenceLevel: 'Moderate',
  },

  // ============================================================================
  // VISION & EYE HEALTH
  // ============================================================================

  'rs28929474': {
    rsid: 'rs28929474',
    gene: 'SERPINA1',
    geneName: 'Serpin Family A Member 1',
    chromosome: '14',
    position: 94378587,
    category: 'Vision',
    impact: 'Moderate',
    description: 'Alpha-1 antitrypsin deficiency variant.',
    conditions: ['Alpha-1 antitrypsin deficiency'],
    recommendations: ['Avoid smoking', 'Monitor lung and liver function', 'Consider augmentation therapy'],
    evidenceLevel: 'Very Strong',
  },

  'rs28929475': {
    rsid: 'rs28929475',
    gene: 'SERPINA1',
    geneName: 'Serpin Family A Member 1',
    chromosome: '14',
    position: 94378612,
    category: 'Vision',
    impact: 'High',
    description: 'S variant - severe AATD.',
    conditions: ['Severe alpha-1 antitrypsin deficiency'],
    recommendations: ['URGENT: Pulmonology referral', 'Avoid all smoke', 'Vaccinations essential'],
    evidenceLevel: 'Very Strong',
  },

  // Already have CFH and ARMS2 for macular degeneration

  'rs8176746': {
    rsid: 'rs8176746',
    gene: 'ABO',
    geneName: 'ABO Blood Group',
    chromosome: '9',
    position: 136132683,
    category: 'Vision',
    impact: 'Low',
    description: 'Blood group affects certain eye conditions risk.',
    evidenceLevel: 'Moderate',
  },

  // ============================================================================
  // HEARING
  // ============================================================================

  'rs28935076': {
    rsid: 'rs28935076',
    gene: 'GJB2',
    geneName: 'Gap Junction Protein Beta 2',
    chromosome: '13',
    position: 20763612,
    category: 'Hearing',
    impact: 'High',
    description: '35delG - most common cause of congenital hearing loss.',
    conditions: ['Congenital deafness'],
    recommendations: ['Hearing screening', 'Early intervention if positive'],
    evidenceLevel: 'Very Strong',
  },

  'rs80338943': {
    rsid: 'rs80338943',
    gene: 'GJB2',
    geneName: 'Gap Junction Protein Beta 2',
    chromosome: '13',
    position: 20763603,
    category: 'Hearing',
    impact: 'High',
    description: '167delT - Ashkenazi Jewish hearing loss variant.',
    recommendations: ['Carrier screening important'],
    evidenceLevel: 'Very Strong',
  },

  'rs29001680': {
    rsid: 'rs29001680',
    gene: 'SLC26A4',
    geneName: 'Solute Carrier Family 26 Member 4',
    chromosome: '7',
    position: 107333709,
    category: 'Hearing',
    impact: 'High',
    description: 'Pendred syndrome - hearing loss and thyroid.',
    conditions: ['Hearing loss', 'Thyroid goiter'],
    recommendations: ['Endocrine evaluation', 'Hearing aids may help'],
    evidenceLevel: 'Very Strong',
  },

  // ============================================================================
  // DENTAL HEALTH
  // ============================================================================

  'rs17803185': {
    rsid: 'rs17803185',
    gene: 'EDAR',
    geneName: 'Ectodysplasin A Receptor',
    chromosome: '2',
    position: 109513595,
    category: 'Dental Health',
    impact: 'Low',
    description: 'Shovel-shaped incisors - East Asian ancestry marker.',
    evidenceLevel: 'Strong',
  },

  'rs3827760': {
    rsid: 'rs3827760',
    gene: 'EDAR',
    geneName: 'Ectodysplasin A Receptor',
    chromosome: '2',
    position: 109513601,
    category: 'Dental Health',
    impact: 'Low',
    description: 'Also affects tooth morphology.',
    evidenceLevel: 'Strong',
  },

  'rs1801133': {
    rsid: 'rs1801133',
    gene: 'MTHFR',
    geneName: 'Methylenetetrahydrofolate Reductase',
    chromosome: '1',
    position: 11856378,
    category: 'Dental Health',
    impact: 'Low',
    description: 'May affect periodontal disease risk.',
    recommendations: ['Good oral hygiene essential', 'Regular dental checkups'],
    evidenceLevel: 'Moderate',
  },

  'rs1861868': {
    rsid: 'rs1861868',
    gene: 'IL1A',
    geneName: 'Interleukin 1 Alpha',
    chromosome: '2',
    position: 113594486,
    category: 'Dental Health',
    impact: 'Moderate',
    description: 'Associated with severe periodontal disease.',
    conditions: ['Periodontitis'],
    recommendations: ['Aggressive dental hygiene', 'Regular professional cleanings', 'Consider genetic testing for periodontitis'],
    evidenceLevel: 'Moderate',
  },

  // ============================================================================
  // ADDICTION & BEHAVIOR
  // ============================================================================

  'rs1799971': {
    rsid: 'rs1799971',
    gene: 'OPRM1',
    geneName: 'Opioid Receptor Mu 1',
    chromosome: '6',
    position: 154452600,
    category: 'Addiction & Behavior',
    impact: 'Moderate',
    description: 'A118G variant affects opioid response and addiction risk.',
    genotypes: {
      'AA': { effect: 'Normal opioid response', magnitude: 'Normal' },
      'AG': { effect: 'Reduced opioid effect', magnitude: 'Moderate' },
      'GG': { effect: 'Significantly reduced opioid response', magnitude: 'High' },
    },
    conditions: ['Opioid addiction risk', 'Altered pain response'],
    recommendations: [
      'May need higher opioid doses for pain (but addiction risk)',
      'Consider non-opioid pain management',
      'Naltrexone more effective for addiction treatment',
    ],
    evidenceLevel: 'Very Strong',
  },

  'rs4680': {
    rsid: 'rs4680',
    gene: 'COMT',
    geneName: 'Catechol-O-Methyltransferase',
    chromosome: '22',
    position: 19951271,
    category: 'Addiction & Behavior',
    impact: 'Moderate',
    description: 'Also affects substance use and reward processing.',
    recommendations: ['AA genotype: Higher addiction risk, avoid substances'],
    evidenceLevel: 'Strong',
  },

  'rs1800497': {
    rsid: 'rs1800497',
    gene: 'DRD2',
    geneName: 'Dopamine Receptor D2',
    chromosome: '11',
    position: 113283484,
    category: 'Addiction & Behavior',
    impact: 'Moderate',
    description: 'Taq1A variant associated with addiction and reward deficiency.',
    genotypes: {
      'CC': { effect: 'Lower D2 receptors, addiction risk', magnitude: 'Moderate' },
      'CT': { effect: 'Intermediate', magnitude: 'Low' },
      'TT': { effect: 'Normal D2 receptors', magnitude: 'Normal' },
    },
    conditions: ['Addiction susceptibility', 'Reward deficiency syndrome'],
    recommendations: ['Be cautious with addictive substances', 'Exercise increases dopamine', 'Behavioral addictions also at risk'],
    evidenceLevel: 'Strong',
  },

  'rs6152': {
    rsid: 'rs6152',
    gene: 'CHRNA5',
    geneName: 'Cholinergic Receptor Nicotinic Alpha 5 Subunit',
    chromosome: '15',
    position: 78882925,
    category: 'Addiction & Behavior',
    impact: 'High',
    description: 'Strongly associated with nicotine addiction.',
    conditions: ['Nicotine addiction', 'Lung cancer risk'],
    recommendations: ['Avoid smoking initiation', 'If smoker, more intensive cessation support needed'],
    evidenceLevel: 'Very Strong',
  },

  'rs1051730': {
    rsid: 'rs1051730',
    gene: 'CHRNA3',
    geneName: 'Cholinergic Receptor Nicotinic Alpha 3 Subunit',
    chromosome: '15',
    position: 78894339,
    category: 'Addiction & Behavior',
    impact: 'High',
    description: 'Strongly associated with smoking behavior and lung cancer.',
    conditions: ['Nicotine addiction', 'Lung cancer'],
    recommendations: ['CRITICAL: Never start smoking', 'If smoker, urgent cessation needed'],
    evidenceLevel: 'Very Strong',
  },

  // ============================================================================
  // PREGNANCY & FERTILITY
  // ============================================================================

  'rs1799807': {
    rsid: 'rs1799807',
    gene: 'CYP19A1',
    geneName: 'Cytochrome P450 Family 19 Subfamily A Member 1',
    chromosome: '15',
    position: 51165655,
    category: 'Pregnancy & Fertility',
    impact: 'Low',
    description: 'Affects estrogen levels and fertility.',
    evidenceLevel: 'Moderate',
  },

  'rs4646': {
    rsid: 'rs4646',
    gene: 'CYP19A1',
    geneName: 'Cytochrome P450 Family 19 Subfamily A Member 1',
    chromosome: '15',
    position: 51166827,
    category: 'Pregnancy & Fertility',
    impact: 'Low',
    description: 'Affects aromatase activity and fertility treatments.',
    recommendations: ['May affect response to fertility medications'],
    evidenceLevel: 'Moderate',
  },

  'rs1801133': {
    rsid: 'rs1801133',
    gene: 'MTHFR',
    geneName: 'Methylenetetrahydrofolate Reductase',
    chromosome: '1',
    position: 11856378,
    category: 'Pregnancy & Fertility',
    impact: 'High',
    description: 'CRITICAL for pregnancy: affects neural tube development.',
    conditions: ['Neural tube defects', 'Miscarriage risk', 'Preeclampsia'],
    recommendations: [
      'CRITICAL: High-dose methylfolate before conception',
      '4-5mg methylfolate during first trimester',
      'Start supplementation 3 months before trying to conceive',
    ],
    evidenceLevel: 'Very Strong',
  },

  'rs1801131': {
    rsid: 'rs1801131',
    gene: 'MTHFR',
    geneName: 'Methylenetetrahydrofolate Reductase',
    chromosome: '1',
    position: 11854476,
    category: 'Pregnancy & Fertility',
    impact: 'Moderate',
    description: 'Also important for pregnancy outcomes.',
    recommendations: ['Consider with C677T', 'Methylfolate supplementation'],
    evidenceLevel: 'Strong',
  },

  'rs9923871': {
    rsid: 'rs9923871',
    gene: 'SHBG',
    geneName: 'Sex Hormone Binding Globulin',
    chromosome: '17',
    position: 7631350,
    category: 'Pregnancy & Fertility',
    impact: 'Low',
    description: 'Affects hormone levels and fertility.',
    evidenceLevel: 'Moderate',
  },

  // ============================================================================
  // INJURY RISK & RECOVERY
  // ============================================================================

  'rs1800012': {
    rsid: 'rs1800012',
    gene: 'COL1A1',
    geneName: 'Collagen Type I Alpha 1 Chain',
    chromosome: '17',
    position: 50187946,
    category: 'Injury Risk',
    impact: 'Moderate',
    description: 'Sp1 variant affecting collagen structure and soft tissue injuries.',
    conditions: ['ACL tears', 'Tendon injuries', 'Fractures'],
    recommendations: ['Strengthening exercises important', 'Proper warm-up/cool-down', 'Consider collagen supplementation'],
    evidenceLevel: 'Strong',
  },

  'rs12722': {
    rsid: 'rs12722',
    gene: 'COL5A1',
    geneName: 'Collagen Type V Alpha 1 Chain',
    chromosome: '9',
    position: 137694556,
    category: 'Injury Risk',
    impact: 'Moderate',
    description: 'Associated with Achilles tendon injuries and flexibility.',
    genotypes: {
      'CC': { effect: 'Higher injury risk, less flexibility', magnitude: 'Moderate' },
      'CT': { effect: 'Intermediate', magnitude: 'Low' },
      'TT': { effect: 'More flexible, lower injury risk', magnitude: 'Normal' },
    },
    conditions: ['Achilles tendon rupture', 'Soft tissue injuries'],
    recommendations: ['CC genotype: Extra stretching and strengthening', 'Avoid sudden intensity increases'],
    evidenceLevel: 'Strong',
  },

  'rs679620': {
    rsid: 'rs679620',
    gene: 'COL5A1',
    geneName: 'Collagen Type V Alpha 1 Chain',
    chromosome: '9',
    position: 137694878,
    category: 'Injury Risk',
    impact: 'Moderate',
    description: 'Also associated with tendon and ligament injuries.',
    recommendations: ['Similar to rs12722', 'Gradual training progression'],
    evidenceLevel: 'Strong',
  },

  'rs1800255': {
    rsid: 'rs1800255',
    gene: 'COL3A1',
    geneName: 'Collagen Type III Alpha 1 Chain',
    chromosome: '2',
    position: 189862375,
    category: 'Injury Risk',
    impact: 'High',
    description: 'Vascular Ehlers-Danlos syndrome risk.',
    conditions: ['Ehlers-Danlos syndrome', 'Arterial rupture risk'],
    recommendations: ['URGENT: Cardiology evaluation if symptomatic', 'Avoid contact sports', 'Medical alert bracelet'],
    evidenceLevel: 'Very Strong',
  },

  'rs2228570': {
    rsid: 'rs2228570',
    gene: 'VDR',
    geneName: 'Vitamin D Receptor',
    chromosome: '12',
    position: 48272895,
    category: 'Injury Risk',
    impact: 'Low',
    description: 'FokI variant affecting bone density and stress fractures.',
    recommendations: ['Optimize vitamin D status', 'Monitor bone density'],
    evidenceLevel: 'Moderate',
  },

  // ============================================================================
  // STRESS & RESILIENCE
  // ============================================================================

  'rs4680': {
    rsid: 'rs4680',
    gene: 'COMT',
    geneName: 'Catechol-O-Methyltransferase',
    chromosome: '22',
    position: 19951271,
    category: 'Stress & Resilience',
    impact: 'Moderate',
    description: 'Warrior vs Worrier - stress response and resilience.',
    recommendations: [
      'AA (Warrior): Excel under pressure but recover slowly, prioritize stress management',
      'GG (Worrier): Better working memory, benefit from preparation',
    ],
    evidenceLevel: 'Strong',
  },

  'rs1801252': {
    rsid: 'rs1801252',
    gene: 'ADRB2',
    geneName: 'Adrenoceptor Beta 2',
    chromosome: '5',
    position: 148206440,
    category: 'Stress & Resilience',
    impact: 'Moderate',
    description: 'Arg16Gly affects stress response and asthma.',
    genotypes: {
      'CC': { effect: 'Arg/Arg - Better stress response', magnitude: 'Normal' },
      'CG': { effect: 'Intermediate', magnitude: 'Normal' },
      'GG': { effect: 'Gly/Gly - Greater stress reactivity', magnitude: 'Low' },
    },
    recommendations: ['GG genotype: Stress management techniques crucial'],
    evidenceLevel: 'Strong',
  },

  'rs1801253': {
    rsid: 'rs1801253',
    gene: 'ADRB2',
    geneName: 'Adrenoceptor Beta 2',
    chromosome: '5',
    position: 148206473,
    category: 'Stress & Resilience',
    impact: 'Moderate',
    description: 'Gln27Glu also affects stress and cardiovascular response.',
    evidenceLevel: 'Strong',
  },

  'rs53576': {
    rsid: 'rs53576',
    gene: 'OXTR',
    geneName: 'Oxytocin Receptor',
    chromosome: '3',
    position: 8747740,
    category: 'Stress & Resilience',
    impact: 'Low',
    description: 'Affects social bonding, stress response, and empathy.',
    genotypes: {
      'GG': { effect: 'Better stress resilience, social skills', magnitude: 'Normal' },
      'GA': { effect: 'Intermediate', magnitude: 'Normal' },
      'AA': { effect: 'Higher stress sensitivity', magnitude: 'Low' },
    },
    recommendations: ['AA genotype: Social support especially important'],
    evidenceLevel: 'Moderate',
  },

  'rs25531': {
    rsid: 'rs25531',
    gene: 'SLC6A4',
    geneName: 'Serotonin Transporter',
    chromosome: '17',
    position: 30212312,
    category: 'Stress & Resilience',
    impact: 'Moderate',
    description: '5-HTTLPR - stress sensitivity and depression risk.',
    recommendations: [
      'Short allele: Higher stress sensitivity',
      'Stress management and social support crucial',
      'May benefit from cognitive behavioral therapy',
    ],
    evidenceLevel: 'Strong',
  },

  // ============================================================================
  // METABOLISM & ENERGY
  // ============================================================================

  'rs8192678': {
    rsid: 'rs8192678',
    gene: 'PPARGC1A',
    geneName: 'PPARG Coactivator 1 Alpha',
    chromosome: '4',
    position: 23815762,
    category: 'Metabolism',
    impact: 'Moderate',
    description: 'Gly482Ser affects mitochondrial function and energy metabolism.',
    genotypes: {
      'GG': { effect: 'Better mitochondrial function', magnitude: 'Normal' },
      'GA': { effect: 'Intermediate', magnitude: 'Normal' },
      'AA': { effect: 'Reduced mitochondrial efficiency', magnitude: 'Low' },
    },
    recommendations: ['AA genotype: Endurance training beneficial', 'Optimize mitochondrial support'],
    evidenceLevel: 'Moderate',
  },

  'rs1801282': {
    rsid: 'rs1801282',
    gene: 'PPARG',
    geneName: 'Peroxisome Proliferator Activated Receptor Gamma',
    chromosome: '3',
    position: 12368126,
    category: 'Metabolism',
    impact: 'Moderate',
    description: 'Pro12Ala affects insulin sensitivity and diabetes risk.',
    genotypes: {
      'CC': { effect: 'Pro/Pro - Higher diabetes risk', magnitude: 'Moderate' },
      'CG': { effect: 'Intermediate protection', magnitude: 'Low' },
      'GG': { effect: 'Ala/Ala - Better insulin sensitivity', magnitude: 'Protective' },
    },
    recommendations: ['CC genotype: Prioritize weight management', 'Monitor glucose regularly'],
    evidenceLevel: 'Very Strong',
  },

  'rs9939609': {
    rsid: 'rs9939609',
    gene: 'FTO',
    geneName: 'Fat Mass and Obesity Associated',
    chromosome: '16',
    position: 53786615,
    category: 'Metabolism',
    impact: 'Moderate',
    description: 'Major obesity risk variant affecting appetite and metabolism.',
    recommendations: ['High protein diet', 'Regular meal timing', 'Exercise especially important'],
    evidenceLevel: 'Very Strong',
  },

  'rs780094': {
    rsid: 'rs780094',
    gene: 'GCKR',
    geneName: 'Glucokinase Regulator',
    chromosome: '2',
    position: 27730940,
    category: 'Metabolism',
    impact: 'Low',
    description: 'Affects triglyceride levels and glucose metabolism.',
    evidenceLevel: 'Strong',
  },

  // ============================================================================
  // HORMONES
  // ============================================================================

  'rs6259': {
    rsid: 'rs6259',
    gene: 'SHBG',
    geneName: 'Sex Hormone Binding Globulin',
    chromosome: '17',
    position: 7631350,
    category: 'Hormones',
    impact: 'Low',
    description: 'Asp327Asn affects testosterone and estrogen levels.',
    evidenceLevel: 'Moderate',
  },

  'rs1799941': {
    rsid: 'rs1799941',
    gene: 'CAG repeat',
    geneName: 'AR',
    chromosome: 'X',
    position: 67544057,
    category: 'Hormones',
    impact: 'Moderate',
    description: 'Androgen receptor CAG repeat length affects testosterone sensitivity.',
    conditions: ['Prostate cancer risk', 'Androgen sensitivity'],
    recommendations: ['Longer repeats: Lower androgen sensitivity', 'May affect fertility'],
    evidenceLevel: 'Moderate',
  },

  'rs4646': {
    rsid: 'rs4646',
    gene: 'CYP19A1',
    geneName: 'Aromatase',
    chromosome: '15',
    position: 51166827,
    category: 'Hormones',
    impact: 'Low',
    description: 'Affects estrogen levels in men and women.',
    evidenceLevel: 'Moderate',
  },

  // ============================================================================
  // CHILD DEVELOPMENT
  // ============================================================================

  'rs4680': {
    rsid: 'rs4680',
    gene: 'COMT',
    geneName: 'Catechol-O-Methyltransferase',
    chromosome: '22',
    position: 19951271,
    category: 'Child Development',
    impact: 'Moderate',
    description: 'Affects cognitive development and executive function in children.',
    evidenceLevel: 'Strong',
  },

  'rs16147': {
    rsid: 'rs16147',
    gene: 'NPY',
    geneName: 'Neuropeptide Y',
    chromosome: '7',
    position: 28773109,
    category: 'Child Development',
    impact: 'Low',
    description: 'Affects temperament and stress response in children.',
    evidenceLevel: 'Moderate',
  },

  'rs1042522': {
    rsid: 'rs1042522',
    gene: 'TP53',
    geneName: 'Tumor Protein P53',
    chromosome: '17',
    position: 7675239,
    category: 'Longevity',
    impact: 'Moderate',
    description: 'Pro72Arg affects cancer protection vs aging.',
    evidenceLevel: 'Strong',
  },
};

// Summary statistics
export const CATEGORY_SUMMARY = {
  'Ancestry': Object.values(ADDITIONAL_CATEGORIES_SNPS).filter(s => s.category === 'Ancestry').length,
  'Skin & Beauty': Object.values(ADDITIONAL_CATEGORIES_SNPS).filter(s => s.category === 'Skin & Beauty').length,
  'Longevity': Object.values(ADDITIONAL_CATEGORIES_SNPS).filter(s => s.category === 'Longevity').length,
  'Allergies': Object.values(ADDITIONAL_CATEGORIES_SNPS).filter(s => s.category === 'Allergies').length,
  'Vision': Object.values(ADDITIONAL_CATEGORIES_SNPS).filter(s => s.category === 'Vision').length,
  'Hearing': Object.values(ADDITIONAL_CATEGORIES_SNPS).filter(s => s.category === 'Hearing').length,
  'Dental Health': Object.values(ADDITIONAL_CATEGORIES_SNPS).filter(s => s.category === 'Dental Health').length,
  'Addiction & Behavior': Object.values(ADDITIONAL_CATEGORIES_SNPS).filter(s => s.category === 'Addiction & Behavior').length,
  'Pregnancy & Fertility': Object.values(ADDITIONAL_CATEGORIES_SNPS).filter(s => s.category === 'Pregnancy & Fertility').length,
  'Injury Risk': Object.values(ADDITIONAL_CATEGORIES_SNPS).filter(s => s.category === 'Injury Risk').length,
  'Stress & Resilience': Object.values(ADDITIONAL_CATEGORIES_SNPS).filter(s => s.category === 'Stress & Resilience').length,
  'Metabolism': Object.values(ADDITIONAL_CATEGORIES_SNPS).filter(s => s.category === 'Metabolism').length,
};

console.log('Additional categories loaded:', CATEGORY_SUMMARY);
