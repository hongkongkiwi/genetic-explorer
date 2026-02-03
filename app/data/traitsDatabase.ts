/**
 * Genetic Traits Database
 * 
 * A comprehensive collection of 40+ interesting genetic traits
 * organized into categories: physical, sensory, behavioral, abilities, and miscellaneous.
 * 
 * Each trait includes:
 * - Associated SNP(s) and gene information
 * - Genotype to phenotype mapping
 * - Fun facts and scientific details
 * - Confidence level based on research
 */

import type { Trait, TraitCategory, ConfidenceLevel } from '~/types/traits';

// Helper function to create a trait
function createTrait(
  id: string,
  name: string,
  description: string,
  category: TraitCategory,
  icon: string,
  confidence: ConfidenceLevel,
  config: {
    snps: Array<{ rsid: string; gene: string; geneName?: string; chromosome?: string }>;
    genotypeMap: Array<{ genotype: string; phenotype: string; description: string; frequency?: string }>;
    funFacts: string[];
    scientificDetails?: string;
  }
): Trait {
  return {
    id,
    name,
    description,
    category,
    icon,
    confidence,
    snps: config.snps.map(s => ({ ...s })),
    genotypeMap: config.genotypeMap,
    funFacts: config.funFacts,
    scientificDetails: config.scientificDetails,
  };
}

// ============================================
// PHYSICAL TRAITS
// ============================================

const EYE_COLOR = createTrait(
  'eye-color',
  'Eye Color',
  'The color of your irises, determined primarily by OCA2 and HERC2 genes',
  'physical',
  '👁️',
  'high',
  {
    snps: [
      { rsid: 'rs12913832', gene: 'HERC2', geneName: 'HECT And RLD Domain Containing E3 Ubiquitin Protein Ligase 2', chromosome: '15' },
      { rsid: 'rs1800407', gene: 'OCA2', geneName: 'Oculocutaneous Albinism II', chromosome: '15' },
      { rsid: 'rs12896399', gene: 'SLC24A4', geneName: 'Solute Carrier Family 24 Member 4', chromosome: '14' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'Blue eyes', description: 'Strong predictor of blue eye color', frequency: '~80% of blue-eyed people' },
      { genotype: 'AG', phenotype: 'Blue or green eyes', description: 'Intermediate - may have blue, green, or hazel eyes', frequency: '~50% have blue eyes' },
      { genotype: 'AA', phenotype: 'Brown eyes', description: 'Strong predictor of brown eye color', frequency: '~85% of brown-eyed people' },
    ],
    funFacts: [
      'Only 8% of the world population has blue eyes!',
      'All blue-eyed people share a common ancestor from 6,000-10,000 years ago.',
      'Eye color can appear to change based on lighting and clothing colors.',
      'Heterochromia (different colored eyes) affects less than 1% of the population.',
    ],
    scientificDetails: 'Eye color is a polygenic trait, with the HERC2 gene regulating OCA2 expression. The rs12913832 SNP is the strongest single predictor, but multiple genes contribute to the final color.',
  }
);

const HAIR_COLOR = createTrait(
  'hair-color',
  'Hair Color',
  'Natural hair color determined by melanin production in hair follicles',
  'physical',
  '💇',
  'medium',
  {
    snps: [
      { rsid: 'rs16891982', gene: 'SLC45A2', geneName: 'Solute Carrier Family 45 Member 2', chromosome: '5' },
      { rsid: 'rs12203592', gene: 'IRF4', geneName: 'Interferon Regulatory Factor 4', chromosome: '6' },
      { rsid: 'rs1805007', gene: 'MC1R', geneName: 'Melanocortin 1 Receptor', chromosome: '16' },
    ],
    genotypeMap: [
      { genotype: 'CC', phenotype: 'Darker hair', description: 'Associated with darker hair colors (brown/black)', frequency: '~70% with dark hair' },
      { genotype: 'CT', phenotype: 'Variable', description: 'Mixed association - could be blonde to dark brown', frequency: 'Common in Europeans' },
      { genotype: 'TT', phenotype: 'Lighter hair', description: 'Associated with lighter hair colors (blonde/light brown)', frequency: '~60% with blonde hair' },
    ],
    funFacts: [
      'Red hair is the rarest natural hair color, occurring in only 1-2% of people.',
      'Hair color can naturally change over time due to hormonal changes and aging.',
      'Melanin in hair decreases approximately 10-20% every decade after age 30.',
      'The gene MC1R variants responsible for red hair also affect pain sensitivity!',
    ],
    scientificDetails: 'Hair color is determined by two types of melanin: eumelanin (brown/black) and pheomelanin (red/yellow). The ratio and amount of these pigments create the spectrum of hair colors.',
  }
);

const HAIR_TEXTURE = createTrait(
  'hair-texture',
  'Hair Texture',
  'Whether your hair is straight, wavy, or curly',
  'physical',
  '💫',
  'medium',
  {
    snps: [
      { rsid: 'rs11803731', gene: 'TCHH', geneName: 'Trichohyalin', chromosome: '1' },
      { rsid: 'rs17646946', gene: 'TCHH', geneName: 'Trichohyalin', chromosome: '1' },
    ],
    genotypeMap: [
      { genotype: 'AA', phenotype: 'Straight hair', description: 'Strong association with straight hair texture', frequency: '~45% of straight-haired people' },
      { genotype: 'AG', phenotype: 'Wavy hair', description: 'Associated with wavy or slightly curly hair', frequency: '~40% of wavy-haired people' },
      { genotype: 'GG', phenotype: 'Curly hair', description: 'Strong association with curly hair texture', frequency: '~50% of curly-haired people' },
    ],
    funFacts: [
      'Hair texture is determined by the shape of your hair follicles - round follicles make straight hair, oval make curly.',
      'The same head can have different curl patterns in different areas!',
      'Hair texture can change with hormonal shifts like puberty, pregnancy, and menopause.',
      'Curly hair is dominant over straight hair in genetic inheritance.',
    ],
    scientificDetails: 'The TCHH gene produces trichohyalin, a protein that affects hair fiber structure and cross-linking. Variants affect the shape and strength of the hair shaft.',
  }
);

const SKIN_PIGMENTATION = createTrait(
  'skin-pigmentation',
  'Skin Pigmentation',
  'Natural skin tone determined by melanin production',
  'physical',
  '🏼',
  'high',
  {
    snps: [
      { rsid: 'rs1426654', gene: 'SLC24A5', geneName: 'Solute Carrier Family 24 Member 5', chromosome: '15' },
      { rsid: 'rs16891982', gene: 'SLC45A2', geneName: 'Solute Carrier Family 45 Member 2', chromosome: '5' },
      { rsid: 'rs1042602', gene: 'TYR', geneName: 'Tyrosinase', chromosome: '11' },
    ],
    genotypeMap: [
      { genotype: 'AA', phenotype: 'Lighter skin', description: 'Associated with lighter skin pigmentation', frequency: '~99% of Europeans' },
      { genotype: 'AG', phenotype: 'Medium skin', description: 'Intermediate skin tone', frequency: 'Common in mixed ancestry' },
      { genotype: 'GG', phenotype: 'Darker skin', description: 'Associated with darker skin pigmentation', frequency: '~93% of Africans, ~50% of Asians' },
    ],
    funFacts: [
      'Skin color evolved as humans migrated to different latitudes - lighter skin helps vitamin D synthesis at higher latitudes.',
      'Everyone has roughly the same number of melanocytes - skin color difference is due to melanin production rates.',
      'A single letter change in DNA (A to G at rs1426654) explains about 25-38% of skin color variation!',
      'Fitzpatrick skin type affects how your skin responds to UV and aging.',
    ],
    scientificDetails: 'Skin pigmentation is primarily controlled by melanin production. The SLC24A5 gene variant accounts for a significant portion of European-African skin color differences.',
  }
);

const FRECKLES = createTrait(
  'freckles',
  'Freckles',
  'Small brown spots on the skin that appear with sun exposure',
  'physical',
  '✨',
  'high',
  {
    snps: [
      { rsid: 'rs1805007', gene: 'MC1R', geneName: 'Melanocortin 1 Receptor', chromosome: '16' },
      { rsid: 'rs1805008', gene: 'MC1R', geneName: 'Melanocortin 1 Receptor', chromosome: '16' },
      { rsid: 'rs1015362', gene: 'ASIP', geneName: 'Agouti Signaling Protein', chromosome: '20' },
    ],
    genotypeMap: [
      { genotype: 'CC', phenotype: 'More freckles', description: 'Higher likelihood of having many freckles', frequency: '~70% of freckled individuals' },
      { genotype: 'CT', phenotype: 'Some freckles', description: 'Moderate freckling, especially with sun exposure', frequency: '~50% have freckles' },
      { genotype: 'TT', phenotype: 'Few/no freckles', description: 'Lower likelihood of freckling', frequency: '~80% without freckles' },
    ],
    funFacts: [
      'Freckles are not harmful - they are just clusters of melanin that appear with UV exposure.',
      'Freckles often fade in winter and darken in summer.',
      'People with freckles often have the "R" variant of MC1R - the same gene linked to red hair!',
      'In medieval times, freckles were sometimes considered marks of witchcraft!',
    ],
    scientificDetails: 'MC1R variants reduce eumelanin (brown/black pigment) and increase pheomelanin (red/yellow pigment), leading to fair skin, red hair, and freckling.',
  }
);

const BALDNESS = createTrait(
  'male-pattern-baldness',
  'Male Pattern Baldness',
  'Genetic predisposition to hair loss on the top and front of the head',
  'physical',
  '🦲',
  'high',
  {
    snps: [
      { rsid: 'rs6625163', gene: 'AR', geneName: 'Androgen Receptor', chromosome: 'X' },
      { rsid: 'rs1160312', gene: 'AR', geneName: 'Androgen Receptor', chromosome: 'X' },
      { rsid: 'rs2180439', gene: 'PAX1/FAT1', geneName: 'Paired Box 1 / FAT Atypical Cadherin 1', chromosome: '20' },
    ],
    genotypeMap: [
      { genotype: 'AA', phenotype: 'Higher risk', description: 'Increased risk of male pattern baldness', frequency: '~70% of balding men' },
      { genotype: 'AG', phenotype: 'Moderate risk', description: 'Moderate risk of hair thinning/balding', frequency: '~45% have some hair loss' },
      { genotype: 'GG', phenotype: 'Lower risk', description: 'Lower risk of significant hair loss', frequency: '~60% keep hair longer' },
    ],
    funFacts: [
      'Male pattern baldness affects about 50% of men by age 50.',
      'Baldness is inherited from BOTH parents - not just the mother\'s side!',
      'Some studies suggest bald men are perceived as more dominant and confident!',
      'The AR gene on the X chromosome explains why men are more affected than women.',
    ],
    scientificDetails: 'Androgenetic alopecia is influenced by androgen receptors. The AR gene variants affect sensitivity to DHT (dihydrotestosterone), which miniaturizes hair follicles.',
  }
);

const UNIBROW = createTrait(
  'unibrow',
  'Unibrow',
  'Whether your eyebrows tend to grow together in the middle',
  'physical',
  '👤',
  'medium',
  {
    snps: [
      { rsid: 'rs6718526', gene: 'PAX3', geneName: 'Paired Box 3', chromosome: '2' },
      { rsid: 'rs12203592', gene: 'IRF4', geneName: 'Interferon Regulatory Factor 4', chromosome: '6' },
    ],
    genotypeMap: [
      { genotype: 'CC', phenotype: 'More likely', description: 'Higher likelihood of having a unibrow', frequency: '~60% with unibrows' },
      { genotype: 'CT', phenotype: 'Possible', description: 'May have slight eyebrow connection', frequency: '~30% have slight connection' },
      { genotype: 'TT', phenotype: 'Less likely', description: 'Lower likelihood of unibrow', frequency: '~75% without unibrows' },
    ],
    funFacts: [
      'The unibrow (synophrys) is considered attractive in some cultures, including parts of Tajikistan!',
      'Frida Kahlo famously embraced her unibrow as part of her identity.',
      'Eyebrow thickness and connection varies significantly across ethnicities.',
      'Ancient Greeks considered the unibrow a sign of beauty and intelligence!',
    ],
    scientificDetails: 'PAX3 is involved in facial development and hair follicle patterning. Variants can affect the density and distribution of eyebrow hair.',
  }
);

// ============================================
// SENSORY TRAITS
// ============================================

const CILANTRO_TASTE = createTrait(
  'cilantro-taste',
  'Cilantro Taste Perception',
  'Whether cilantro tastes fresh and citrusy or like soap',
  'sensory',
  '🌿',
  'very-high',
  {
    snps: [
      { rsid: 'rs72921001', gene: 'OR6A2', geneName: 'Olfactory Receptor Family 6 Subfamily A Member 2', chromosome: '11' },
    ],
    genotypeMap: [
      { genotype: 'CC', phenotype: 'Soapy taste', description: 'Cilantro likely tastes like soap or unpleasant', frequency: '~15% of population' },
      { genotype: 'CT', phenotype: 'Mild soapy taste', description: 'May detect slight soap-like flavor', frequency: '~35% detect some soapiness' },
      { genotype: 'TT', phenotype: 'Fresh/citrus taste', description: 'Cilantro tastes fresh, citrusy, or pleasant', frequency: '~85% of population' },
    ],
    funFacts: [
      'Julia Child hated cilantro and said it had a "deadly" taste!',
      'Cilantro aversion is found in about 10-21% of people depending on ethnicity.',
      'Your preference can change over time - some people learn to enjoy cilantro despite the soapy taste!',
      'The compound aldehyde in cilantro is also found in soap and some bugs!',
    ],
    scientificDetails: 'OR6A2 is an olfactory receptor gene. The "A" variant creates a receptor that binds strongly to aldehydes, making cilantro smell and taste like soap to those individuals.',
  }
);

const ASPARAGUS_SMELL = createTrait(
  'asparagus-smell',
  'Asparagus Metabolite Detection',
  'Whether you can smell the distinctive odor in urine after eating asparagus',
  'sensory',
  '🌱',
  'high',
  {
    snps: [
      { rsid: 'rs4481887', gene: 'OR2M7', geneName: 'Olfactory Receptor Family 2 Subfamily M Member 7', chromosome: '1' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'Can smell it', description: 'Able to detect asparagus metabolite odor', frequency: '~60% of population' },
      { genotype: 'AG', phenotype: 'Can smell it', description: 'Likely able to detect the odor', frequency: '~55% can detect' },
      { genotype: 'AA', phenotype: 'Cannot smell', description: 'Unable to detect the distinctive odor', frequency: '~40% of population' },
    ],
    funFacts: [
      'Benjamin Franklin wrote about this phenomenon in 1781!',
      'The smell appears within 15-30 minutes of eating asparagus.',
      'Everyone produces the metabolites, but not everyone can smell them!',
      'The compound responsible is asparagusic acid, which breaks down into sulfur-containing compounds.',
    ],
    scientificDetails: 'Asparagusic acid is metabolized into various sulfur-containing compounds. OR2M7 variants affect the ability to detect these specific odor molecules.',
  }
);

const BITTER_TASTE = createTrait(
  'bitter-taste',
  'Bitter Taste Sensitivity',
  'How strongly you perceive bitter flavors like Brussels sprouts or dark chocolate',
  'sensory',
  '🍫',
  'very-high',
  {
    snps: [
      { rsid: 'rs10246939', gene: 'TAS2R38', geneName: 'Taste 2 Receptor Member 38', chromosome: '7' },
      { rsid: 'rs1726866', gene: 'TAS2R38', geneName: 'Taste 2 Receptor Member 38', chromosome: '7' },
      { rsid: 'rs713598', gene: 'TAS2R38', geneName: 'Taste 2 Receptor Member 38', chromosome: '7' },
    ],
    genotypeMap: [
      { genotype: 'CC', phenotype: 'Super-taster', description: 'Very sensitive to bitter compounds (PROP/PTC)', frequency: '~25% of population' },
      { genotype: 'CG', phenotype: 'Medium taster', description: 'Moderate sensitivity to bitter flavors', frequency: '~50% of population' },
      { genotype: 'GG', phenotype: 'Non-taster', description: 'Less sensitive to bitter compounds', frequency: '~25% of population' },
    ],
    funFacts: [
      'Super-tasters tend to eat fewer vegetables and may have higher BMI!',
      'Bitter taste sensitivity may have evolved to detect toxic plants.',
      'Super-tasters often prefer sweet foods over bitter ones.',
      'You can test this with PTC paper - super-tasters experience intense bitterness!',
    ],
    scientificDetails: 'TAS2R38 detects thiourea compounds found in many vegetables. The AVI haplotype (non-taster) and PAV haplotype (taster) determine sensitivity levels.',
  }
);

const SWEET_TASTE = createTrait(
  'sweet-taste',
  'Sweet Taste Preference',
  'How strongly you crave and enjoy sweet flavors',
  'sensory',
  '🍬',
  'medium',
  {
    snps: [
      { rsid: 'rs35874116', gene: 'TAS1R2', geneName: 'Taste 1 Receptor Member 2', chromosome: '1' },
      { rsid: 'rs5400', gene: 'GLUT2', geneName: 'Glucose Transporter 2', chromosome: '3' },
    ],
    genotypeMap: [
      { genotype: 'CC', phenotype: 'Strong preference', description: 'Stronger preference for sweet foods', frequency: '~40% of population' },
      { genotype: 'CT', phenotype: 'Moderate preference', description: 'Average preference for sweet flavors', frequency: '~45% of population' },
      { genotype: 'TT', phenotype: 'Lower preference', description: 'Less preference for very sweet foods', frequency: '~15% of population' },
    ],
    funFacts: [
      'Sweet preference is partly genetic, but also influenced by early childhood diet!',
      'People with stronger sweet preference may have higher risk of dental cavities.',
      'Taste preferences can change - pregnancy often increases sweet cravings!',
      'Some people are "sweet blind" and can\'t taste sweetness at all!',
    ],
    scientificDetails: 'TAS1R2 and TAS1R3 form the sweet taste receptor. Variants affect receptor sensitivity and signal strength when binding to sugars and artificial sweeteners.',
  }
);

const NOISE_SENSITIVITY = createTrait(
  'noise-sensitivity',
  'Noise Sensitivity',
  'How easily you are disturbed by loud or repetitive sounds',
  'sensory',
  '🔊',
  'low',
  {
    snps: [
      { rsid: 'rs1185684', gene: 'NR3C1', geneName: 'Nuclear Receptor Subfamily 3 Group C Member 1', chromosome: '5' },
      { rsid: 'rs4680', gene: 'COMT', geneName: 'Catechol-O-Methyltransferase', chromosome: '22' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'More sensitive', description: 'Higher sensitivity to noise and stress', frequency: '~30% of population' },
      { genotype: 'AG', phenotype: 'Moderate sensitivity', description: 'Average noise tolerance', frequency: '~50% of population' },
      { genotype: 'AA', phenotype: 'Less sensitive', description: 'Better noise tolerance and stress resilience', frequency: '~20% of population' },
    ],
    funFacts: [
      'Misophonia (sound sensitivity) affects about 20% of people to some degree.',
      'Noise sensitivity can increase with stress and fatigue.',
      'Some people have "super hearing" and can detect sounds most cannot!',
      'White noise can actually help some sensitive people sleep better.',
    ],
    scientificDetails: 'Multiple genes affect stress response and sensory processing. COMT affects dopamine metabolism, influencing how the brain processes sensory input.',
  }
);

// ============================================
// BEHAVIORAL TRAITS
// ============================================

const MOTION_SICKNESS = createTrait(
  'motion-sickness',
  'Motion Sickness',
  'Susceptibility to nausea from movement (cars, boats, VR)',
  'behavioral',
  '🚗',
  'medium',
  {
    snps: [
      { rsid: 'rs1778240', gene: 'CHRM3', geneName: 'Cholinergic Receptor Muscarinic 3', chromosome: '1' },
      { rsid: 'rs6556614', gene: 'CHRM3', geneName: 'Cholinergic Receptor Muscarinic 3', chromosome: '1' },
    ],
    genotypeMap: [
      { genotype: 'AA', phenotype: 'Higher susceptibility', description: 'More likely to experience motion sickness', frequency: '~35% of population' },
      { genotype: 'AG', phenotype: 'Moderate susceptibility', description: 'May experience motion sickness in some conditions', frequency: '~45% of population' },
      { genotype: 'GG', phenotype: 'Lower susceptibility', description: 'Less likely to experience motion sickness', frequency: '~20% of population' },
    ],
    funFacts: [
      'Women and children are more susceptible to motion sickness than men.',
      'Looking at the horizon can help reduce motion sickness!',
      'Astronauts experience "space sickness" as their bodies adapt to zero gravity.',
      'Ginger has been scientifically shown to help reduce motion sickness!',
    ],
    scientificDetails: 'Motion sickness occurs when there is a conflict between visual and vestibular (inner ear) inputs. CHRM3 affects acetylcholine signaling in the brain\'s nausea centers.',
  }
);

const SLEEP_DEPTH = createTrait(
  'sleep-depth',
  'Sleep Depth',
  'How deeply you sleep and how easily you wake up',
  'behavioral',
  '💤',
  'medium',
  {
    snps: [
      { rsid: 'rs7760616', gene: 'ADA', geneName: 'Adenosine Deaminase', chromosome: '20' },
      { rsid: 'rs947934', gene: 'ADA', geneName: 'Adenosine Deaminase', chromosome: '20' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'Deep sleeper', description: 'Tend to sleep more deeply, harder to wake', frequency: '~25% of population' },
      { genotype: 'AG', phenotype: 'Normal sleeper', description: 'Average sleep depth and wakeability', frequency: '~50% of population' },
      { genotype: 'AA', phenotype: 'Light sleeper', description: 'Tend to sleep lightly, wake easily', frequency: '~25% of population' },
    ],
    funFacts: [
      'Deep sleep (slow-wave sleep) is crucial for memory consolidation!',
      'Adenosine builds up while you\'re awake and makes you sleepy.',
      'Caffeine blocks adenosine receptors, which is why it keeps you awake!',
      'Deep sleep decreases significantly with age.',
    ],
    scientificDetails: 'ADA affects adenosine levels, which regulate sleep pressure. Higher adenosine promotes deeper sleep, while variants that clear adenosine faster lead to lighter sleep.',
  }
);

const CHRONOTYPE = createTrait(
  'chronotype',
  'Morning or Night Person',
  'Whether you naturally prefer mornings or evenings',
  'behavioral',
  '🌅',
  'high',
  {
    snps: [
      { rsid: 'rs1801260', gene: 'CLOCK', geneName: 'Clock Circadian Regulator', chromosome: '4' },
      { rsid: 'rs4684677', gene: 'PER2', geneName: 'Period Circadian Regulator 2', chromosome: '2' },
      { rsid: 'rs2287161', gene: 'CRY1', geneName: 'Cryptochrome Circadian Regulator 1', chromosome: '12' },
    ],
    genotypeMap: [
      { genotype: 'CC', phenotype: 'Morning person', description: 'Naturally wake early, feel alert in morning', frequency: '~30% of population' },
      { genotype: 'CG', phenotype: 'Intermediate', description: 'Neither strongly morning nor evening person', frequency: '~50% of population' },
      { genotype: 'GG', phenotype: 'Night owl', description: 'Naturally prefer later bedtimes and wake times', frequency: '~20% of population' },
    ],
    funFacts: [
      'Night owls may have higher risk of obesity and diabetes!',
      'Your chronotype is about 50% genetic and 50% environmental.',
      'Morning people tend to be more proactive and persistent.',
      'Teenagers naturally shift toward evening preference during puberty!',
    ],
    scientificDetails: 'Circadian rhythm genes (CLOCK, PER, CRY) regulate the body\'s internal clock. Variants affect the timing of melatonin release and core body temperature rhythms.',
  }
);

const PAIN_SENSITIVITY = createTrait(
  'pain-sensitivity',
  'Pain Sensitivity',
  'How intensely you experience physical pain',
  'behavioral',
  '⚡',
  'medium',
  {
    snps: [
      { rsid: 'rs4680', gene: 'COMT', geneName: 'Catechol-O-Methyltransferase', chromosome: '22' },
      { rsid: 'rs6265', gene: 'BDNF', geneName: 'Brain-Derived Neurotrophic Factor', chromosome: '11' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'Higher sensitivity', description: 'More sensitive to pain, lower pain tolerance', frequency: '~25% of population' },
      { genotype: 'AG', phenotype: 'Moderate sensitivity', description: 'Average pain sensitivity', frequency: '~50% of population' },
      { genotype: 'AA', phenotype: 'Lower sensitivity', description: 'Higher pain tolerance, less pain sensitivity', frequency: '~25% of population' },
    ],
    funFacts: [
      'Redheads often have higher pain sensitivity due to MC1R variants!',
      'Pain perception varies up to 3-fold between individuals.',
      'Women generally report higher pain sensitivity than men.',
      'Chronic pain can actually change how your brain processes pain signals!',
    ],
    scientificDetails: 'COMT affects dopamine and endorphin metabolism. The "Met/Met" genotype has lower COMT activity, leading to higher dopamine and increased pain sensitivity.',
  }
);

const EXPLORATORY_BEHAVIOR = createTrait(
  'exploratory-behavior',
  'Exploratory Behavior',
  'Your tendency to seek novelty and new experiences',
  'behavioral',
  '🚀',
  'low',
  {
    snps: [
      { rsid: 'rs1800955', gene: 'DRD4', geneName: 'Dopamine Receptor D4', chromosome: '11' },
    ],
    genotypeMap: [
      { genotype: 'CC', phenotype: 'Novelty seeker', description: 'More likely to seek new experiences', frequency: '~20% of population' },
      { genotype: 'CT', phenotype: 'Moderate', description: 'Balanced between novelty and routine', frequency: '~45% of population' },
      { genotype: 'TT', phenotype: 'Routine-oriented', description: 'Prefer familiar situations and routines', frequency: '~35% of population' },
    ],
    funFacts: [
      'The "explorer gene" DRD4-7R is more common in populations with migration history!',
      'Novelty seekers are more likely to take risks and try new foods.',
      'This trait is associated with creativity and entrepreneurial spirit.',
      'DRD4 variants are also linked to ADHD susceptibility.',
    ],
    scientificDetails: 'DRD4 variants affect dopamine receptor sensitivity in the brain\'s reward pathways. The 7-repeat allele is associated with reduced receptor sensitivity, leading to increased novelty-seeking behavior.',
  }
);

// ============================================
// ABILITIES TRAITS
// ============================================

const MUSICAL_PITCH = createTrait(
  'musical-pitch',
  'Musical Pitch Ability',
  'Your genetic predisposition for recognizing and reproducing musical notes',
  'abilities',
  '🎵',
  'medium',
  {
    snps: [
      { rsid: 'rs3057', gene: 'GATA2', geneName: 'GATA Binding Protein 2', chromosome: '3' },
      { rsid: 'rs9854612', gene: 'PCDH7', geneName: 'Protocadherin 7', chromosome: '4' },
    ],
    genotypeMap: [
      { genotype: 'AA', phenotype: 'Higher aptitude', description: 'Genetic predisposition for better pitch recognition', frequency: '~15% of population' },
      { genotype: 'AG', phenotype: 'Moderate aptitude', description: 'Average musical pitch ability', frequency: '~50% of population' },
      { genotype: 'GG', phenotype: 'Lower aptitude', description: 'May need more training for pitch recognition', frequency: '~35% of population' },
    ],
    funFacts: [
      'Absolute pitch occurs in only about 1 in 10,000 people!',
      'Musical training before age 6 significantly increases pitch ability.',
      'Some languages (like Mandarin) require pitch discrimination, giving speakers an advantage!',
      'Perfect pitch can sometimes be lost with age or hearing damage.',
    ],
    scientificDetails: 'Musical ability is highly polygenic. While specific SNPs show association, musical training and environment play a major role in developing pitch ability.',
  }
);

const SPRINT_VS_ENDURANCE = createTrait(
  'sprint-endurance',
  'Sprint vs Endurance',
  'Whether your muscles are better suited for short bursts or long-duration activity',
  'abilities',
  '🏃',
  'high',
  {
    snps: [
      { rsid: 'rs1815739', gene: 'ACTN3', geneName: 'Actinin Alpha 3', chromosome: '11' },
    ],
    genotypeMap: [
      { genotype: 'CC', phenotype: 'Endurance', description: 'Better suited for endurance activities', frequency: '~25% of population' },
      { genotype: 'CT', phenotype: 'Mixed', description: 'Good at both sprint and endurance activities', frequency: '~50% of population' },
      { genotype: 'TT', phenotype: 'Sprint/Power', description: 'Better suited for sprint/power activities', frequency: '~25% of population' },
    ],
    funFacts: [
      'The "sprinter gene" ACTN3 is found in ~95% of Olympic sprinters!',
      'People with the endurance variant excel at marathons and long-distance cycling.',
      'Jamaican sprinters have a very high frequency of the power variant!',
      'This gene affects fast-twitch vs slow-twitch muscle fiber composition.',
    ],
    scientificDetails: 'ACTN3 produces a protein found in fast-twitch muscle fibers. The R577X variant (T allele) creates a non-functional protein, reducing power but potentially enhancing endurance.',
  }
);

const MEMORY_PERFORMANCE = createTrait(
  'memory-performance',
  'Memory Performance',
  'Your genetic predisposition for episodic memory and learning',
  'abilities',
  '🧠',
  'low',
  {
    snps: [
      { rsid: 'rs17070145', gene: 'KIBRA', geneName: 'Kidney And Brain Expressed Protein', chromosome: '5' },
      { rsid: 'rs6265', gene: 'BDNF', geneName: 'Brain-Derived Neurotrophic Factor', chromosome: '11' },
    ],
    genotypeMap: [
      { genotype: 'TT', phenotype: 'Better memory', description: 'Genetic predisposition for better episodic memory', frequency: '~25% of population' },
      { genotype: 'CT', phenotype: 'Average memory', description: 'Normal memory performance', frequency: '~50% of population' },
      { genotype: 'CC', phenotype: 'Variable memory', description: 'Memory may be more variable or require more effort', frequency: '~25% of population' },
    ],
    funFacts: [
      'The KIBRA gene was named for its expression in kidney and brain!',
      'Sleep quality has a huge impact on memory consolidation.',
      'Physical exercise boosts BDNF and improves memory!',
      'Memory champions use techniques - genetics is just one factor!',
    ],
    scientificDetails: 'KIBRA is involved in synaptic plasticity and memory formation. The T allele is associated with better episodic memory performance in multiple studies.',
  }
);

const HANDEDNESS = createTrait(
  'handedness',
  'Handedness',
  'Whether you are more likely to be left or right handed',
  'abilities',
  '✋',
  'medium',
  {
    snps: [
      { rsid: 'rs199512', gene: 'PCSK6', geneName: 'Proprotein Convertase Subtilisin/Kexin Type 6', chromosome: '15' },
      { rsid: 'rs1446109', gene: 'LRRTM1', geneName: 'Leucine Rich Repeat Transmembrane Neuronal 1', chromosome: '2' },
    ],
    genotypeMap: [
      { genotype: 'TT', phenotype: 'Left-handed', description: 'Higher probability of being left-handed', frequency: '~10% of population' },
      { genotype: 'CT', phenotype: 'Ambidextrous/Mixed', description: 'May show mixed-handedness', frequency: '~20% of population' },
      { genotype: 'CC', phenotype: 'Right-handed', description: 'Higher probability of being right-handed', frequency: '~70% of population' },
    ],
    funFacts: [
      'Left-handed people have an advantage in sports like tennis and boxing!',
      'Many famous artists and musicians were left-handed.',
      'Identical twins can have different handedness!',
      'Left-handedness was once considered evil ("sinister" means left in Latin).',
    ],
    scientificDetails: 'Handedness is about 25% genetic. PCSK6 is involved in left-right body patterning during embryonic development. Environmental factors also play a significant role.',
  }
);

const PROBLEM_SOLVING = createTrait(
  'problem-solving',
  'Problem Solving Style',
  'Your tendency toward analytical vs creative problem solving',
  'abilities',
  '🔍',
  'low',
  {
    snps: [
      { rsid: 'rs4680', gene: 'COMT', geneName: 'Catechol-O-Methyltransferase', chromosome: '22' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'Creative/Intuitive', description: 'May favor creative, holistic problem-solving', frequency: '~25% of population' },
      { genotype: 'AG', phenotype: 'Balanced', description: 'Can use both analytical and creative approaches', frequency: '~50% of population' },
      { genotype: 'AA', phenotype: 'Analytical', description: 'May favor structured, analytical problem-solving', frequency: '~25% of population' },
    ],
    funFacts: [
      'Different problem-solving styles shine in different situations!',
      'Diverse teams with varied problem-solving styles often perform better.',
      'Your style can change with practice and training.',
      'The "warrior vs worrier" hypothesis links COMT to stress response under pressure.',
    ],
    scientificDetails: 'COMT affects prefrontal cortex dopamine levels. The Val158Met variant influences cognitive flexibility and working memory under different conditions.',
  }
);

// ============================================
// MISCELLANEOUS TRAITS
// ============================================

const EARWAX_TYPE = createTrait(
  'earwax-type',
  'Earwax Type',
  'Whether you have wet or dry earwax',
  'miscellaneous',
  '👂',
  'very-high',
  {
    snps: [
      { rsid: 'rs17822931', gene: 'ABCC11', geneName: 'ATP Binding Cassette Subfamily C Member 11', chromosome: '16' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'Wet earwax', description: 'Sticky, yellow-brown earwax', frequency: '~95% of Africans/Europeans' },
      { genotype: 'AG', phenotype: 'Mixed', description: 'Intermediate earwax consistency', frequency: '~5% of population' },
      { genotype: 'AA', phenotype: 'Dry earwax', description: 'Dry, flaky, gray earwax', frequency: '~95% of East Asians, ~30% of Native Americans' },
    ],
    funFacts: [
      'Earwax type correlates with underarm odor - dry earwax = less body odor!',
      'The same gene affects breast cancer risk in some populations.',
      'Wet earwax is dominant over dry earwax.',
      'Mongolians can tell ethnicity by earwax type!',
    ],
    scientificDetails: 'ABCC11 transports lipids into earwax. The G allele produces wet earwax, while the A allele (found mainly in East Asians) produces dry earwax and reduces body odor.',
  }
);

const DANDRUFF = createTrait(
  'dandruff',
  'Dandruff Susceptibility',
  'Your likelihood of experiencing dandruff or dry scalp',
  'miscellaneous',
  '💆',
  'medium',
  {
    snps: [
      { rsid: 'rs6889729', gene: 'IL37', geneName: 'Interleukin 37', chromosome: '2' },
      { rsid: 'rs1062202', gene: 'IL37', geneName: 'Interleukin 37', chromosome: '2' },
    ],
    genotypeMap: [
      { genotype: 'AA', phenotype: 'Higher risk', description: 'Increased susceptibility to dandruff', frequency: '~35% of population' },
      { genotype: 'AG', phenotype: 'Moderate risk', description: 'May experience occasional dandruff', frequency: '~45% of population' },
      { genotype: 'GG', phenotype: 'Lower risk', description: 'Lower susceptibility to dandruff', frequency: '~20% of population' },
    ],
    funFacts: [
      'Dandruff affects about 50% of adults worldwide!',
      'It\'s caused by a yeast called Malassezia that lives on everyone\'s scalp.',
      'Stress and cold weather can worsen dandruff.',
      'Some anti-dandruff shampoos contain the same ingredient as dog flea shampoo!',
    ],
    scientificDetails: 'Dandruff involves skin cell turnover and immune response to scalp microbes. IL37 affects inflammatory responses and skin barrier function.',
  }
);

const MOSQUITO_RESPONSE = createTrait(
  'mosquito-response',
  'Mosquito Bite Response',
  'How strongly your skin reacts to mosquito bites',
  'miscellaneous',
  '🦟',
  'low',
  {
    snps: [
      { rsid: 'rs1871534', gene: 'HLA-C', geneName: 'Major Histocompatibility Complex Class I C', chromosome: '6' },
      { rsid: 'rs2395029', gene: 'HCP5', geneName: 'HLA Complex P5', chromosome: '6' },
    ],
    genotypeMap: [
      { genotype: 'CC', phenotype: 'Strong reaction', description: 'Large, itchy welts from bites', frequency: '~30% of population' },
      { genotype: 'CT', phenotype: 'Moderate reaction', description: 'Average bite reaction', frequency: '~50% of population' },
      { genotype: 'TT', phenotype: 'Mild reaction', description: 'Smaller, less itchy reactions', frequency: '~20% of population' },
    ],
    funFacts: [
      'Mosquitoes are attracted to CO2, body heat, and certain chemicals in sweat!',
      'Only female mosquitoes bite - they need blood for egg development.',
      'Some people are "mosquito magnets" due to their body chemistry!',
      'Your blood type may affect mosquito attraction - Type O is most attractive.',
    ],
    scientificDetails: 'HLA genes affect immune responses. The visible reaction to mosquito bites is actually your immune system responding to proteins in mosquito saliva.',
  }
);

const FINGER_LENGTH_RATIO = createTrait(
  'finger-ratio',
  'Finger Length Ratio',
  'The ratio between your index and ring finger lengths (2D:4D ratio)',
  'miscellaneous',
  '👋',
  'medium',
  {
    snps: [
      { rsid: 'rs314277', gene: 'LIN28B', geneName: 'Lin-28 Homolog B', chromosome: '6' },
      { rsid: 'rs11076061', gene: 'LIN28B', geneName: 'Lin-28 Homolog B', chromosome: '6' },
    ],
    genotypeMap: [
      { genotype: 'AA', phenotype: 'Lower ratio', description: 'Ring finger longer than index (more "masculine" pattern)', frequency: '~40% of males, ~15% of females' },
      { genotype: 'AG', phenotype: 'Intermediate', description: 'Similar finger lengths', frequency: '~35% of population' },
      { genotype: 'GG', phenotype: 'Higher ratio', description: 'Index finger longer or equal (more "feminine" pattern)', frequency: '~25% of males, ~60% of females' },
    ],
    funFacts: [
      'This ratio is set by testosterone exposure in the womb!',
      'Lower ratios are associated with better spatial ability and athletic performance.',
      'Higher ratios are linked to better verbal memory and language skills.',
      'The ratio is different on each hand and relatively fixed by age 2!',
    ],
    scientificDetails: 'The 2D:4D ratio is a marker of prenatal androgen exposure. LIN28B affects growth and development timing. Lower ratios indicate higher testosterone exposure during development.',
  }
);

const SNEEZE_REFLEX = createTrait(
  'sneeze-reflex',
  'Photic Sneeze Reflex',
  'Whether bright sunlight makes you sneeze',
  'miscellaneous',
  '☀️',
  'high',
  {
    snps: [
      { rsid: 'rs1048933', gene: 'ACH2', geneName: 'Achromatopsia-related', chromosome: '2' },
      { rsid: 'rs11861312', gene: 'LOC105374144', geneName: 'Uncharacterized', chromosome: '15' },
    ],
    genotypeMap: [
      { genotype: 'CC', phenotype: 'Likely photic sneezer', description: 'Sunlight likely triggers sneezing', frequency: '~18-35% of population' },
      { genotype: 'CT', phenotype: 'Possible', description: 'May occasionally sneeze in bright light', frequency: '~25% of population' },
      { genotype: 'TT', phenotype: 'Unlikely', description: 'Bright light does not trigger sneezing', frequency: '~65% of population' },
    ],
    funFacts: [
      'Aristotle first described this phenomenon over 2,000 years ago!',
      'It is formally called "Autosomal Dominant Compelling Helio-Ophthalmic Outburst" (ACHOO)!',
      'It affects 18-35% of the population.',
      'Wearing sunglasses or looking away from the sun can prevent it.',
    ],
    scientificDetails: 'The photic sneeze reflex is thought to result from crossed signals between the optic nerve and trigeminal nerve (which controls sneezing). It runs in families in an autosomal dominant pattern.',
  }
);

const HITCHHIKERS_THUMB = createTrait(
  'hitchhikers-thumb',
  'Hitchhiker\'s Thumb',
  'Whether your thumb can bend backward at the top joint',
  'miscellaneous',
  '👍',
  'medium',
  {
    snps: [
      { rsid: 'rs1436362', gene: 'BMPR1B', geneName: 'Bone Morphogenetic Protein Receptor Type 1B', chromosome: '4' },
    ],
    genotypeMap: [
      { genotype: 'AA', phenotype: 'Very flexible', description: 'Thumb can bend backward >50 degrees', frequency: '~25% of population' },
      { genotype: 'AG', phenotype: 'Somewhat flexible', description: 'Thumb can bend backward slightly', frequency: '~45% of population' },
      { genotype: 'GG', phenotype: 'Not flexible', description: 'Thumb is straight or barely bends back', frequency: '~30% of population' },
    ],
    funFacts: [
      'This is a classic example taught in genetics classes!',
      'It\'s a recessive trait - you need two copies for extreme flexibility.',
      'Joint hypermobility can be an advantage in some sports and music.',
      'Some people with very flexible joints are at higher risk for dislocations.',
    ],
    scientificDetails: 'Thumb flexibility is influenced by collagen structure and joint laxity. BMPR1B affects bone and connective tissue development.',
  }
);

const ALCOHOL_FLUSH = createTrait(
  'alcohol-flush',
  'Alcohol Flush Reaction',
  'Whether your face turns red when drinking alcohol',
  'miscellaneous',
  '🍷',
  'very-high',
  {
    snps: [
      { rsid: 'rs671', gene: 'ALDH2', geneName: 'Aldehyde Dehydrogenase 2 Family Member', chromosome: '12' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'Normal flushing', description: 'Normal alcohol metabolism', frequency: '~95% of Europeans/Africans' },
      { genotype: 'AG', phenotype: 'Mild flush', description: 'Slight flushing with alcohol', frequency: '~30% of East Asians' },
      { genotype: 'AA', phenotype: 'Strong flush', description: 'Strong flushing reaction to alcohol', frequency: '~8% of East Asians' },
    ],
    funFacts: [
      'This is why some people call it the "Asian flush"!',
      'The flushing is actually a toxic reaction to acetaldehyde buildup.',
      'People with strong flush reactions have lower rates of alcoholism.',
      'Pepcid AC can reduce flushing but does NOT prevent the toxic acetaldehyde buildup!',
    ],
    scientificDetails: 'ALDH2 breaks down acetaldehyde, a toxic byproduct of alcohol. The A allele creates a less efficient enzyme, causing acetaldehyde accumulation, flushing, and increased cancer risk.',
  }
);

const EARLOBE_ATTACHMENT = createTrait(
  'earlobe-attachment',
  'Earlobe Attachment',
  'Whether your earlobes hang free or attach directly to your head',
  'miscellaneous',
  '👂',
  'low',
  {
    snps: [
      { rsid: 'rs2593495', gene: 'EDAR', geneName: 'Ectodysplasin A Receptor', chromosome: '2' },
    ],
    genotypeMap: [
      { genotype: 'AA', phenotype: 'Free earlobes', description: 'Earlobes hang free from the head', frequency: '~60% of population' },
      { genotype: 'AG', phenotype: 'Intermediate', description: 'Slightly attached or mixed appearance', frequency: '~30% of population' },
      { genotype: 'GG', phenotype: 'Attached earlobes', description: 'Earlobes attach directly to the head', frequency: '~40% of population' },
    ],
    funFacts: [
      'This was once taught as a simple dominant/recessive trait, but it\'s actually more complex!',
      'Your earlobe shape is determined by cartilage structure and skin attachment.',
      'Attached earlobes are more common in some East Asian populations.',
      'Free earlobes can range from barely hanging to very dangly!',
    ],
    scientificDetails: 'Earlobe attachment was historically taught as a simple Mendelian trait, but twin studies show it is influenced by multiple genes and environmental factors during development.',
  }
);

const CLEFT_CHIN = createTrait(
  'cleft-chin',
  'Cleft Chin',
  'Whether you have a dimple or cleft in your chin',
  'miscellaneous',
  '😃',
  'low',
  {
    snps: [
      { rsid: 'rs2197285', gene: 'EDAR', geneName: 'Ectodysplasin A Receptor', chromosome: '2' },
    ],
    genotypeMap: [
      { genotype: 'TT', phenotype: 'More likely cleft', description: 'Higher likelihood of having a cleft chin', frequency: '~25% of population' },
      { genotype: 'CT', phenotype: 'Possible', description: 'May have slight chin dimple', frequency: '~35% of population' },
      { genotype: 'CC', phenotype: 'Less likely', description: 'Lower likelihood of cleft chin', frequency: '~40% of population' },
    ],
    funFacts: [
      'Famous people with cleft chins include John Travolta and Sandra Bullock!',
      'It was once thought to be a simple dominant trait, but it\'s actually complex.',
      'Cleft chins result from incomplete fusion of the jaw during development.',
      'Some people develop cleft chins with age as tissue thins!',
    ],
    scientificDetails: 'Cleft chin results from the incomplete fusion of the left and right sides of the jaw bone during fetal development. It is influenced by multiple genes and developmental factors.',
  }
);

const WISDOM_TEETH = createTrait(
  'wisdom-teeth',
  'Wisdom Teeth',
  'Your likelihood of developing wisdom teeth and how they erupt',
  'miscellaneous',
  '🦷',
  'medium',
  {
    snps: [
      { rsid: 'rs6504340', gene: 'MSX1', geneName: 'Msh Homeobox 1', chromosome: '4' },
      { rsid: 'rs7776725', gene: 'PAX9', geneName: 'Paired Box 9', chromosome: '14' },
    ],
    genotypeMap: [
      { genotype: 'CC', phenotype: 'Missing/likely absent', description: 'Higher chance of missing one or more wisdom teeth', frequency: '~10% of population' },
      { genotype: 'CT', phenotype: 'Variable', description: 'May have fewer than 4 wisdom teeth', frequency: '~30% of population' },
      { genotype: 'TT', phenotype: 'All 4 likely', description: 'Higher likelihood of having all 4 wisdom teeth', frequency: '~60% of population' },
    ],
    funFacts: [
      '35% of people are born without wisdom teeth!',
      'Wisdom teeth are a vestigial trait from when humans ate tougher foods.',
      'Not everyone needs their wisdom teeth removed.',
      'Some people have more than 4 wisdom teeth!',
    ],
    scientificDetails: 'MSX1 and PAX9 are transcription factors critical for tooth development. Variants can lead to missing teeth, including wisdom teeth (third molars).',
  }
);

const TOOTH_CAVITIES = createTrait(
  'tooth-cavities',
  'Cavity Susceptibility',
  'Your genetic predisposition to dental cavities',
  'miscellaneous',
  '🦷',
  'medium',
  {
    snps: [
      { rsid: 'rs7737991', gene: 'DEFB1', geneName: 'Defensin Beta 1', chromosome: '8' },
      { rsid: 'rs10932688', gene: 'AMELX', geneName: 'Amelogenin X-Linked', chromosome: 'X' },
    ],
    genotypeMap: [
      { genotype: 'AA', phenotype: 'Higher risk', description: 'Increased susceptibility to cavities', frequency: '~30% of population' },
      { genotype: 'AG', phenotype: 'Moderate risk', description: 'Average cavity risk', frequency: '~50% of population' },
      { genotype: 'GG', phenotype: 'Lower risk', description: 'Lower susceptibility to cavities', frequency: '~20% of population' },
    ],
    funFacts: [
      'Some people naturally have "stronger" teeth due to enamel differences!',
      'Sugar is the main culprit, but genetics affects your mouth\'s bacterial environment.',
      'Fluoride can help everyone regardless of genetic risk!',
      'Ancient humans had fewer cavities because they ate less sugar.',
    ],
    scientificDetails: 'DEFB1 produces antimicrobial peptides that affect oral bacteria. AMELX is essential for enamel formation. Variants affect tooth hardness and bacterial resistance.',
  }
);

const RED_HAIR = createTrait(
  'red-hair',
  'Red Hair',
  'Your genetic predisposition for red hair',
  'physical',
  '🦰',
  'very-high',
  {
    snps: [
      { rsid: 'rs1805007', gene: 'MC1R', geneName: 'Melanocortin 1 Receptor', chromosome: '16' },
      { rsid: 'rs1805008', gene: 'MC1R', geneName: 'Melanocortin 1 Receptor', chromosome: '16' },
      { rsid: 'rs1805009', gene: 'MC1R', geneName: 'Melanocortin 1 Receptor', chromosome: '16' },
    ],
    genotypeMap: [
      { genotype: 'CC', phenotype: 'Red hair likely', description: 'High probability of red hair', frequency: '~1-2% of population' },
      { genotype: 'CT', phenotype: 'Carrier/possible', description: 'May carry red hair variant or have strawberry blonde', frequency: '~10% of population' },
      { genotype: 'TT', phenotype: 'Unlikely', description: 'Low probability of red hair', frequency: '~88% of population' },
    ],
    funFacts: [
      'Red hair is the rarest natural hair color!',
      'Scotland has the highest percentage of redheads (~13%).',
      'Redheads often require more anesthesia due to MC1R variants!',
      'Ancient Greeks believed redheads turned into vampires after death!',
    ],
    scientificDetails: 'MC1R variants lead to pheomelanin production instead of eumelanin. Two variant copies typically result in red hair, fair skin, and freckles.',
  }
);

const CURLY_HAIR = createTrait(
  'curly-hair',
  'Hair Curl Pattern',
  'The natural curl pattern of your hair',
  'physical',
  '🌀',
  'medium',
  {
    snps: [
      { rsid: 'rs17646946', gene: 'TCHH', geneName: 'Trichohyalin', chromosome: '1' },
      { rsid: 'rs11803731', gene: 'TCHH', geneName: 'Trichohyalin', chromosome: '1' },
      { rsid: 'rs7349332', gene: 'WNT10A', geneName: 'Wnt Family Member 10A', chromosome: '2' },
    ],
    genotypeMap: [
      { genotype: 'TT', phenotype: 'Straight hair', description: 'Hair is naturally straight', frequency: '~45% of Europeans' },
      { genotype: 'CT', phenotype: 'Wavy hair', description: 'Hair has gentle waves', frequency: '~40% of Europeans' },
      { genotype: 'CC', phenotype: 'Curly/coily', description: 'Hair forms curls or coils', frequency: '~15% of Europeans, higher in other populations' },
    ],
    funFacts: [
      'Curly hair is dominant over straight hair genetically!',
      'The shape of your hair follicle determines curl - round = straight, oval = curly.',
      'Humidity affects curly hair more because the hair structure absorbs moisture.',
      'Identical twins can have slightly different curl patterns!',
    ],
    scientificDetails: 'TCHH affects hair fiber structure through trichohyalin protein. WNT10A influences hair follicle development. Multiple genes create the spectrum from straight to coily hair.',
  }
);

const HEIGHT_VARIANT = createTrait(
  'height-variant',
  'Height Potential',
  'Your genetic contribution to adult height',
  'physical',
  '📏',
  'low',
  {
    snps: [
      { rsid: 'rs1042725', gene: 'HMGA2', geneName: 'High Mobility Group AT-Hook 2', chromosome: '12' },
      { rsid: 'rs11716129', gene: 'UQCC1', geneName: 'Ubiquinol-Cytochrome C Reductase Complex Assembly Factor 1', chromosome: '20' },
    ],
    genotypeMap: [
      { genotype: 'TT', phenotype: 'Taller tendency', description: 'Genetic variants associated with taller height', frequency: '~20% of population' },
      { genotype: 'CT', phenotype: 'Average', description: 'Genetic variants for average height', frequency: '~50% of population' },
      { genotype: 'CC', phenotype: 'Shorter tendency', description: 'Genetic variants associated with shorter height', frequency: '~30% of population' },
    ],
    funFacts: [
      'Height is 80% genetic but hundreds of genes are involved!',
      'Proper nutrition in childhood is crucial for reaching genetic height potential.',
      'Men are on average 5-6 inches taller than women worldwide.',
      'The Dutch are the tallest nationality, averaging over 6 feet for men!',
    ],
    scientificDetails: 'Height is highly polygenic with over 700 associated variants. HMGA2 is one of the strongest single associations, affecting cell proliferation and growth.',
  }
);

const LONGEVITY = createTrait(
  'longevity',
  'Longevity Potential',
  'Genetic factors that may contribute to longer lifespan',
  'miscellaneous',
  '⏳',
  'low',
  {
    snps: [
      { rsid: 'rs2802292', gene: 'FOXO3', geneName: 'Forkhead Box O3', chromosome: '6' },
      { rsid: 'rs2764264', gene: 'CETP', geneName: 'Cholesteryl Ester Transfer Protein', chromosome: '16' },
    ],
    genotypeMap: [
      { genotype: 'TT', phenotype: 'Favorable', description: 'Variants associated with increased longevity', frequency: '~25% of population' },
      { genotype: 'CT', phenotype: 'Moderate', description: 'Average longevity genetics', frequency: '~50% of population' },
      { genotype: 'CC', phenotype: 'Standard', description: 'Standard longevity genetics', frequency: '~25% of population' },
    ],
    funFacts: [
      'Lifestyle factors like diet and exercise matter more than genetics for longevity!',
      'FOXO3 is called the "longevity gene" and affects stress resistance.',
      'Centenarians often have unique variants in multiple longevity pathways.',
      'Your "healthspan" (years of healthy life) may be more important than lifespan!',
    ],
    scientificDetails: 'FOXO3 is a transcription factor involved in stress resistance, metabolism, and cell death regulation. It is consistently associated with longevity across populations.',
  }
);

const CAFFEINE_METABOLISM = createTrait(
  'caffeine-metabolism',
  'Caffeine Metabolism',
  'How quickly your body processes caffeine',
  'miscellaneous',
  '☕',
  'high',
  {
    snps: [
      { rsid: 'rs762551', gene: 'CYP1A2', geneName: 'Cytochrome P450 Family 1 Subfamily A Member 2', chromosome: '15' },
    ],
    genotypeMap: [
      { genotype: 'AA', phenotype: 'Fast metabolizer', description: 'Caffeine is processed quickly', frequency: '~45% of population' },
      { genotype: 'AC', phenotype: 'Moderate metabolizer', description: 'Average caffeine processing speed', frequency: '~45% of population' },
      { genotype: 'CC', phenotype: 'Slow metabolizer', description: 'Caffeine is processed slowly - effects last longer', frequency: '~10% of population' },
    ],
    funFacts: [
      'Slow metabolizers may have increased heart attack risk with high caffeine intake!',
      'Smoking increases caffeine metabolism significantly.',
      'Pregnancy slows caffeine metabolism by up to 3x.',
      'Caffeine has a half-life of about 5 hours in fast metabolizers, 10+ hours in slow!',
    ],
    scientificDetails: 'CYP1A2 is the primary enzyme metabolizing caffeine. The AA genotype produces more enzyme, while CC produces less, leading to prolonged caffeine effects.',
  }
);

const VITAMIN_D = createTrait(
  'vitamin-d',
  'Vitamin D Levels',
  'Your genetic predisposition for vitamin D levels',
  'miscellaneous',
  '☀️',
  'medium',
  {
    snps: [
      { rsid: 'rs2282679', gene: 'GC', geneName: 'Group-Specific Component (Vitamin D Binding Protein)', chromosome: '4' },
      { rsid: 'rs10741657', gene: 'CYP2R1', geneName: 'Cytochrome P450 Family 2 Subfamily R Member 1', chromosome: '11' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'Lower levels', description: 'Tend toward lower vitamin D levels', frequency: '~30% of population' },
      { genotype: 'AG', phenotype: 'Moderate levels', description: 'Average vitamin D levels', frequency: '~50% of population' },
      { genotype: 'AA', phenotype: 'Higher levels', description: 'Tend toward higher vitamin D levels', frequency: '~20% of population' },
    ],
    funFacts: [
      'Vitamin D is actually a hormone, not a vitamin!',
      'Your skin produces vitamin D when exposed to UVB rays.',
      'Vitamin D deficiency is common in winter at higher latitudes.',
      'Fatty fish and fortified foods are good dietary sources.',
    ],
    scientificDetails: 'GC produces vitamin D binding protein. CYP2R1 converts vitamin D to its active form. Variants affect vitamin D transport and activation efficiency.',
  }
);

const LACTOSE_TOLERANCE = createTrait(
  'lactose-tolerance',
  'Lactose Tolerance',
  'Whether you can digest lactose in dairy products as an adult',
  'sensory',
  '🥛',
  'very-high',
  {
    snps: [
      { rsid: 'rs4988235', gene: 'MCM6', geneName: 'Minichromosome Maintenance Complex Component 6', chromosome: '2' },
      { rsid: 'rs182549', gene: 'MCM6', geneName: 'Minichromosome Maintenance Complex Component 6', chromosome: '2' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'Lactose intolerant', description: 'Likely lactose intolerant as an adult', frequency: '~65% of global population' },
      { genotype: 'AG', phenotype: 'Intermediate', description: 'May tolerate moderate lactose', frequency: '~15% of global population' },
      { genotype: 'AA', phenotype: 'Lactose tolerant', description: 'Can digest lactose as an adult', frequency: '~35% of global population' },
    ],
    funFacts: [
      'Lactose tolerance is a relatively recent evolutionary adaptation!',
      'It became common in populations with cattle domestication (~10,000 years ago).',
      '95% of Northern Europeans are lactose tolerant.',
      'Fermented dairy (yogurt, cheese) has less lactose than milk.',
    ],
    scientificDetails: 'The MCM6 gene regulates LCT (lactase) gene expression. The A allele maintains lactase production into adulthood. This is one of the strongest examples of recent human evolution.',
  }
);

const THRILL_SEEKING = createTrait(
  'thrill-seeking',
  'Thrill Seeking',
  'Your tendency to seek exciting, risky experiences',
  'behavioral',
  '🎢',
  'low',
  {
    snps: [
      { rsid: 'rs4680', gene: 'COMT', geneName: 'Catechol-O-Methyltransferase', chromosome: '22' },
      { rsid: 'rs1800497', gene: 'DRD2', geneName: 'Dopamine Receptor D2', chromosome: '11' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'Higher seeking', description: 'More likely to seek thrills and novelty', frequency: '~25% of population' },
      { genotype: 'AG', phenotype: 'Moderate', description: 'Balanced approach to risk', frequency: '~50% of population' },
      { genotype: 'AA', phenotype: 'Lower seeking', description: 'Prefer safety and routine', frequency: '~25% of population' },
    ],
    funFacts: [
      'Thrill-seekers often have lower baseline dopamine levels!',
      'Extreme sports athletes score high on sensation-seeking scales.',
      'Sensation-seeking tends to peak in adolescence.',
      'Some researchers link thrill-seeking to creativity and innovation.',
    ],
    scientificDetails: 'Dopamine system genes affect reward processing. Variants that reduce baseline dopamine may increase sensation-seeking to achieve optimal arousal levels.',
  }
);

const EMPATHY = createTrait(
  'empathy',
  'Empathy Level',
  'Your ability to understand and share others\' feelings',
  'behavioral',
  '💝',
  'low',
  {
    snps: [
      { rsid: 'rs53576', gene: 'OXTR', geneName: 'Oxytocin Receptor', chromosome: '3' },
      { rsid: 'rs2254298', gene: 'OXTR', geneName: 'Oxytocin Receptor', chromosome: '3' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'Higher empathy', description: 'May show greater empathy and social skills', frequency: '~40% of population' },
      { genotype: 'AG', phenotype: 'Moderate empathy', description: 'Average empathy levels', frequency: '~40% of population' },
      { genotype: 'AA', phenotype: 'Variable empathy', description: 'Empathy may vary by situation', frequency: '~20% of population' },
    ],
    funFacts: [
      'Oxytocin is called the "love hormone" and "cuddle chemical"!',
      'Empathy can be strengthened through practice and meditation.',
      'Some people are "super-empaths" who deeply feel others\' emotions.',
      'Oxytocin increases during childbirth, breastfeeding, and physical touch.',
    ],
    scientificDetails: 'OXTR variants affect oxytocin receptor sensitivity. Oxytocin plays a key role in social bonding, trust, and empathy. Environment strongly influences empathy development.',
  }
);

const STRESS_RESILIENCE = createTrait(
  'stress-resilience',
  'Stress Resilience',
  'How well you handle and recover from stressful situations',
  'behavioral',
  '🧘',
  'medium',
  {
    snps: [
      { rsid: 'rs4680', gene: 'COMT', geneName: 'Catechol-O-Methyltransferase', chromosome: '22' },
      { rsid: 'rs1360780', gene: 'FKBP5', geneName: 'FK506 Binding Protein 5', chromosome: '6' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'More resilient', description: 'Better stress resilience under pressure', frequency: '~25% of population' },
      { genotype: 'AG', phenotype: 'Moderate resilience', description: 'Average stress handling', frequency: '~50% of population' },
      { genotype: 'AA', phenotype: 'Variable resilience', description: 'May need more stress management strategies', frequency: '~25% of population' },
    ],
    funFacts: [
      'The "warrior vs worrier" hypothesis suggests different COMT variants suit different roles!',
      'Exercise is one of the best ways to improve stress resilience.',
      'Chronic stress can actually change gene expression through epigenetics.',
      'Some stress is good - it helps you grow and adapt!',
    ],
    scientificDetails: 'COMT affects how quickly dopamine is cleared from the prefrontal cortex. The Met allele (A) maintains dopamine longer, helping with working memory but potentially increasing anxiety under stress.',
  }
);

const CREATIVITY = createTrait(
  'creativity',
  'Creative Thinking',
  'Your tendency toward creative and divergent thinking',
  'abilities',
  '🎨',
  'low',
  {
    snps: [
      { rsid: 'rs4680', gene: 'COMT', geneName: 'Catechol-O-Methyltransferase', chromosome: '22' },
      { rsid: 'rs1800955', gene: 'DRD4', geneName: 'Dopamine Receptor D4', chromosome: '11' },
    ],
    genotypeMap: [
      { genotype: 'CC', phenotype: 'More creative', description: 'May show more creative thinking patterns', frequency: '~20% of population' },
      { genotype: 'CT', phenotype: 'Balanced', description: 'Can use both creative and analytical thinking', frequency: '~50% of population' },
      { genotype: 'TT', phenotype: 'More analytical', description: 'May prefer structured approaches', frequency: '~30% of population' },
    ],
    funFacts: [
      'Creativity involves many brain regions working together!',
      'Everyone is creative in different ways - not just artistic.',
      'Daydreaming is actually important for creative thinking.',
      'Creative people often have more flexible thinking patterns.',
    ],
    scientificDetails: 'Dopamine system affects cognitive flexibility and idea generation. However, creativity is highly influenced by environment, practice, and diverse experiences.',
  }
);

// ============================================
// TRAITS DATABASE
// ============================================

export const TRAITS_DATABASE: Record<string, Trait> = {
  // Physical traits
  'eye-color': EYE_COLOR,
  'hair-color': HAIR_COLOR,
  'hair-texture': HAIR_TEXTURE,
  'skin-pigmentation': SKIN_PIGMENTATION,
  'freckles': FRECKLES,
  'male-pattern-baldness': BALDNESS,
  'unibrow': UNIBROW,
  'red-hair': RED_HAIR,
  'curly-hair': CURLY_HAIR,
  'height-variant': HEIGHT_VARIANT,
  
  // Sensory traits
  'cilantro-taste': CILANTRO_TASTE,
  'asparagus-smell': ASPARAGUS_SMELL,
  'bitter-taste': BITTER_TASTE,
  'sweet-taste': SWEET_TASTE,
  'noise-sensitivity': NOISE_SENSITIVITY,
  'lactose-tolerance': LACTOSE_TOLERANCE,
  
  // Behavioral traits
  'motion-sickness': MOTION_SICKNESS,
  'sleep-depth': SLEEP_DEPTH,
  'chronotype': CHRONOTYPE,
  'pain-sensitivity': PAIN_SENSITIVITY,
  'exploratory-behavior': EXPLORATORY_BEHAVIOR,
  'thrill-seeking': THRILL_SEEKING,
  'empathy': EMPATHY,
  'stress-resilience': STRESS_RESILIENCE,
  
  // Abilities traits
  'musical-pitch': MUSICAL_PITCH,
  'sprint-endurance': SPRINT_VS_ENDURANCE,
  'memory-performance': MEMORY_PERFORMANCE,
  'handedness': HANDEDNESS,
  'problem-solving': PROBLEM_SOLVING,
  'creativity': CREATIVITY,
  
  // Miscellaneous traits
  'earwax-type': EARWAX_TYPE,
  'dandruff': DANDRUFF,
  'mosquito-response': MOSQUITO_RESPONSE,
  'finger-ratio': FINGER_LENGTH_RATIO,
  'sneeze-reflex': SNEEZE_REFLEX,
  'hitchhikers-thumb': HITCHHIKERS_THUMB,
  'alcohol-flush': ALCOHOL_FLUSH,
  'earlobe-attachment': EARLOBE_ATTACHMENT,
  'cleft-chin': CLEFT_CHIN,
  'wisdom-teeth': WISDOM_TEETH,
  'tooth-cavities': TOOTH_CAVITIES,
  'longevity': LONGEVITY,
  'caffeine-metabolism': CAFFEINE_METABOLISM,
  'vitamin-d': VITAMIN_D,
};

// Category display names
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'physical': 'Physical Traits',
  'sensory': 'Sensory Traits',
  'behavioral': 'Behavioral Traits',
  'abilities': 'Abilities',
  'miscellaneous': 'Fun Facts',
};

// Category icons
export const CATEGORY_ICONS: Record<string, string> = {
  'physical': '👤',
  'sensory': '👅',
  'behavioral': '🧠',
  'abilities': '⭐',
  'miscellaneous': '🎲',
};

// Category descriptions
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'physical': 'Visible characteristics like eye color, hair type, and facial features',
  'sensory': 'How you perceive taste, smell, and other sensations',
  'behavioral': 'Natural tendencies in sleep, pain response, and preferences',
  'abilities': 'Genetic predispositions for physical and mental capabilities',
  'miscellaneous': 'Fun genetic quirks from earwax type to sneeze reflexes',
};

// Statistics
export const TRAITS_STATS = {
  totalTraits: Object.keys(TRAITS_DATABASE).length,
  byCategory: Object.values(TRAITS_DATABASE).reduce((acc, trait) => {
    acc[trait.category] = (acc[trait.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  byConfidence: Object.values(TRAITS_DATABASE).reduce((acc, trait) => {
    acc[trait.confidence] = (acc[trait.confidence] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
};

// Get all traits
export function getAllTraits(): Trait[] {
  return Object.values(TRAITS_DATABASE);
}

// Get trait by ID
export function getTraitById(id: string): Trait | null {
  return TRAITS_DATABASE[id] || null;
}

// Get traits by category
export function getTraitsByCategory(category: string): Trait[] {
  return Object.values(TRAITS_DATABASE).filter(
    trait => trait.category === category
  );
}

// Get traits by confidence level
export function getTraitsByConfidence(confidence: string): Trait[] {
  return Object.values(TRAITS_DATABASE).filter(
    trait => trait.confidence === confidence
  );
}

// Search traits
export function searchTraits(query: string): Trait[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(TRAITS_DATABASE).filter(
    trait =>
      trait.name.toLowerCase().includes(lowerQuery) ||
      trait.description.toLowerCase().includes(lowerQuery) ||
      trait.id.toLowerCase().includes(lowerQuery) ||
      trait.snps.some(snp => 
        snp.rsid.toLowerCase().includes(lowerQuery) ||
        snp.gene.toLowerCase().includes(lowerQuery)
      )
  );
}

// Get categories
export function getCategories(): string[] {
  return ['physical', 'sensory', 'behavioral', 'abilities', 'miscellaneous'];
}

// Get random fun fact for a trait
export function getRandomFunFact(trait: Trait): string {
  const index = Math.floor(Math.random() * trait.funFacts.length);
  return trait.funFacts[index];
}

// Export for debugging
console.log('Traits Database loaded:', {
  total: TRAITS_STATS.totalTraits,
  byCategory: TRAITS_STATS.byCategory,
});
