/**
 * Carrier Conditions Database
 * 
 * Comprehensive database of genetic carrier conditions that can be detected
 * through direct-to-consumer genetic testing data.
 * 
 * IMPORTANT MEDICAL DISCLAIMER:
 * This database is for educational purposes only. It is not a substitute for 
 * professional medical advice, diagnosis, or treatment. Always seek the advice 
 * of your physician or other qualified health provider with any questions you 
 * may have regarding a medical condition.
 */

import type { CarrierCondition } from '~/types/carrier';
import type { InheritancePattern, ClinicalSignificance } from '~/types/carrier';
import { InheritancePattern as InheritancePatternEnum, ClinicalSignificance as ClinicalSignificanceEnum } from '~/types/carrier';

/**
 * Comprehensive carrier condition database
 */
export const CARRIER_CONDITIONS: CarrierCondition[] = [
  // ============================================
  // AUTOSOMAL RECESSIVE CONDITIONS
  // ============================================

  {
    id: 'cystic_fibrosis',
    name: 'Cystic Fibrosis',
    gene: 'CFTR',
    geneFullName: 'Cystic Fibrosis Transmembrane Conductance Regulator',
    chromosome: '7',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Pulmonary',
    severity: 'critical',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'Cystic fibrosis is a genetic disorder that affects the lungs, pancreas, liver, kidneys, and intestine. It causes thick, sticky mucus to build up in the lungs and digestive tract, leading to breathing problems and difficulty absorbing nutrients.',
    symptoms: [
      'Persistent coughing with thick mucus',
      'Frequent lung infections (pneumonia, bronchitis)',
      'Wheezing and shortness of breath',
      'Poor growth and weight gain',
      'Frequent greasy, bulky stools',
      'Salty-tasting skin',
      'Male infertility',
    ],
    treatments: [
      'Airway clearance techniques',
      'Inhaled medications (bronchodilators, mucus thinners)',
      'Pancreatic enzyme supplements',
      'CFTR modulator therapies (Trikafta, Kalydeco)',
      'Nutritional support',
      'Lung transplant in severe cases',
    ],
    pathogenicVariants: [
      {
        id: 'deltaF508',
        name: 'ΔF508 (p.Phe508del)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs113993960',
        frequency: { european: 0.7, ashkenazi: 0.3, hispanic: 0.47, african: 0.24 },
      },
      {
        id: 'G551D',
        name: 'G551D (p.Gly551Asp)',
        pathogenicGenotypes: ['AG', 'GG'],
        rsid: 'rs75527207',
        frequency: { european: 0.05 },
      },
      {
        id: 'W1282X',
        name: 'W1282X (p.Trp1282Ter)',
        pathogenicGenotypes: ['AG', 'GG'],
        rsid: 'rs77010898',
        frequency: { ashkenazi: 0.11 },
      },
    ],
    associatedSNPs: ['rs113993960', 'rs75527207', 'rs77010898', 'rs74503330', 'rs121908745'],
    prevalence: {
      european: '1 in 2,500 to 3,500',
      ashkenazi_jewish: '1 in 3,500',
      hispanic: '1 in 4,000 to 10,000',
      african: '1 in 15,000 to 20,000',
      asian: '1 in 31,000',
      carrier_rate: '1 in 25 to 30 (European ancestry)',
    },
    recommendations: [
      'If planning children, partner should also be screened',
      'Consider genetic counseling before conception',
      'Newborn screening is available in all 50 US states',
      'Prenatal testing options include CVS and amniocentesis',
      'Stay current with CF treatment advances',
    ],
    resources: [
      { title: 'Cystic Fibrosis Foundation', url: 'https://www.cff.org', type: 'website' },
      { title: 'Genetics Home Reference - CF', url: 'https://ghr.nlm.nih.gov/condition/cystic-fibrosis', type: 'website' },
      { title: 'CF Foundation Patient Support', url: 'https://www.cff.org/Get-Involved/Find-a-Chapter/', type: 'support_group' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: true,
    ageOfOnset: 'Usually diagnosed by age 2, but mild forms may be diagnosed later',
  },

  {
    id: 'sickle_cell_anemia',
    name: 'Sickle Cell Disease',
    gene: 'HBB',
    geneFullName: 'Hemoglobin Subunit Beta',
    chromosome: '11',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Hematology',
    severity: 'critical',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'Sickle cell disease is a group of inherited red blood cell disorders. The abnormal hemoglobin causes red blood cells to become rigid and shaped like sickles, leading to blocked blood flow, pain, and organ damage.',
    symptoms: [
      'Episodes of severe pain (sickle cell crises)',
      'Anemia and fatigue',
      'Swelling in hands and feet',
      'Frequent infections',
      'Delayed growth in children',
      'Vision problems',
      'Stroke risk',
    ],
    treatments: [
      'Pain management during crises',
      'Blood transfusions',
      'Hydroxyurea to reduce crises',
      'Antibiotics to prevent infections',
      'Bone marrow transplant (potential cure)',
      'Gene therapy (emerging treatments)',
      'New medications (Oxbryta, Adakveo)',
    ],
    pathogenicVariants: [
      {
        id: 'HbS',
        name: 'Hemoglobin S (p.Glu6Val)',
        pathogenicGenotypes: ['AT', 'TT'],
        rsid: 'rs334',
        frequency: { african: 0.1, african_american: 0.08, mediterranean: 0.03 },
      },
      {
        id: 'HbC',
        name: 'Hemoglobin C (p.Glu6Lys)',
        pathogenicGenotypes: ['AC', 'CC'],
        rsid: 'rs33930165',
        frequency: { african: 0.02, african_american: 0.015 },
      },
    ],
    associatedSNPs: ['rs334', 'rs33930165', 'rs63750447', 'rs63750953'],
    prevalence: {
      african_american: '1 in 365 births (affected)',
      hispanic: '1 in 16,300 births (affected)',
      carrier_rate_african_american: '1 in 13',
      carrier_rate_african: 'Up to 1 in 4 in some regions',
      carrier_rate_mediterranean: '1 in 25',
    },
    recommendations: [
      'Genetic counseling strongly recommended',
      'Partner screening essential before conception',
      'Prenatal diagnosis available',
      'Regular medical care with hematologist',
      'Stay hydrated and avoid extreme temperatures',
      'Up-to-date on vaccinations',
    ],
    resources: [
      { title: 'Sickle Cell Disease Association of America', url: 'https://www.scdaa.org', type: 'website' },
      { title: 'CDC Sickle Cell Disease', url: 'https://www.cdc.gov/ncbddd/sicklecell', type: 'website' },
      { title: 'Sickle Cell Society', url: 'https://www.sicklecellsociety.org', type: 'support_group' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: true,
    ageOfOnset: 'Symptoms typically appear around 5-6 months of age',
  },

  {
    id: 'tay_sachs_disease',
    name: 'Tay-Sachs Disease',
    gene: 'HEXA',
    geneFullName: 'Hexosaminidase Subunit Alpha',
    chromosome: '15',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Neurological',
    severity: 'critical',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'Tay-Sachs disease is a fatal genetic disorder that destroys nerve cells in the brain and spinal cord. It is caused by a deficiency of the enzyme hexosaminidase A, leading to the buildup of GM2 ganglioside in nerve cells.',
    symptoms: [
      'Loss of motor skills',
      'Exaggerated startle response',
      'Seizures',
      'Vision and hearing loss',
      'Intellectual disability',
      'Paralysis',
      'Cherry-red spot on retina',
    ],
    treatments: [
      'Currently no cure',
      'Supportive care to manage symptoms',
      'Seizure management',
      'Nutritional support',
      'Physical therapy',
      'Experimental enzyme replacement and gene therapy trials',
    ],
    pathogenicVariants: [
      {
        id: '4bp_del',
        name: '4 bp insertion (c.1274_1277dup)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs76173980',
        frequency: { ashkenazi: 0.008, cajun: 0.007 },
      },
      {
        id: 'G269S',
        name: 'Gly269Ser',
        pathogenicGenotypes: ['AG', 'GG'],
        rsid: 'rs121907963',
        frequency: { ashkenazi: 0.003 },
      },
    ],
    associatedSNPs: ['rs76173980', 'rs121907963', 'rs121907957', 'rs28941778'],
    prevalence: {
      ashkenazi_jewish: '1 in 3,600 (affected)',
      cajun: '1 in 6,000 (affected)',
      irish_american: '1 in 50,000',
      general: '1 in 320,000',
      carrier_rate_ashkenazi: '1 in 27',
      carrier_rate_cajun: '1 in 30',
      carrier_rate_irish: '1 in 50',
    },
    recommendations: [
      'URGENT: Genetic counseling before conception',
      'Partner must be screened if of high-risk ancestry',
      'Prenatal testing available (CVS, amniocentesis)',
      'Preimplantation genetic diagnosis (PGD) an option',
      'Consider carrier screening before marriage in high-risk communities',
    ],
    resources: [
      { title: 'National Tay-Sachs & Allied Diseases', url: 'https://www.ntsad.org', type: 'website' },
      { title: 'Cure Tay-Sachs Foundation', url: 'https://www.curetay-sachs.org', type: 'support_group' },
      { title: 'Genetics Home Reference', url: 'https://ghr.nlm.nih.gov/condition/tay-sachs-disease', type: 'website' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: true,
    ageOfOnset: 'Infantile (most common), Juvenile, or Adult onset forms',
  },

  {
    id: 'gaucher_disease',
    name: 'Gaucher Disease',
    gene: 'GBA',
    geneFullName: 'Glucocerebrosidase Beta Acid',
    chromosome: '1',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Metabolic',
    severity: 'high',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'Gaucher disease is an inherited metabolic disorder caused by deficiency of the enzyme glucocerebrosidase. This leads to accumulation of fatty substances in organs, particularly the spleen, liver, and bone marrow.',
    symptoms: [
      'Enlarged spleen and liver',
      'Bone pain and fractures',
      'Low blood counts (anemia, thrombocytopenia)',
      'Easy bruising and bleeding',
      'Fatigue',
      'Growth delays in children',
      'Neurological symptoms (in Type 2 and 3)',
    ],
    treatments: [
      'Enzyme replacement therapy (ERT) - Cerezyme, VPRIV',
      'Substrate reduction therapy (SRT) - Zavesca, Cerdelga',
      'Bone marrow transplant (for severe cases)',
      'Pain management',
      'Blood transfusions',
      'Joint replacement surgery',
    ],
    pathogenicVariants: [
      {
        id: 'N370S',
        name: 'Asn370Ser (N370S)',
        pathogenicGenotypes: ['AG', 'GG'],
        rsid: 'rs76763715',
        frequency: { ashkenazi: 0.03 },
      },
      {
        id: '84GG',
        name: '84GG insertion',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs387906315',
        frequency: { ashkenazi: 0.008 },
      },
    ],
    associatedSNPs: ['rs76763715', 'rs387906315', 'rs1064651', 'rs2230288'],
    prevalence: {
      ashkenazi_jewish: '1 in 450 (affected)',
      general: '1 in 50,000 to 100,000',
      carrier_rate_ashkenazi: '1 in 10 to 15',
    },
    recommendations: [
      'Genetic counseling recommended',
      'Partner screening if Ashkenazi Jewish',
      'Enzyme assay can confirm carrier status',
      'Regular monitoring if affected',
      'Treatment is highly effective for Type 1',
    ],
    resources: [
      { title: 'National Gaucher Foundation', url: 'https://www.gaucherdisease.org', type: 'website' },
      { title: 'Gaucher Community Alliance', url: 'https://www.gaucheralliance.org', type: 'support_group' },
      { title: 'Genetics Home Reference', url: 'https://ghr.nlm.nih.gov/condition/gaucher-disease', type: 'website' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: false,
    ageOfOnset: 'Type 1: Any age; Type 2: Infancy; Type 3: Childhood',
  },

  {
    id: 'niemann_pick_disease',
    name: 'Niemann-Pick Disease',
    gene: 'SMPD1',
    geneFullName: 'Sphingomyelin Phosphodiesterase 1',
    chromosome: '11',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Metabolic',
    severity: 'critical',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'Niemann-Pick disease is a group of inherited metabolic disorders in which harmful quantities of lipids accumulate in the spleen, liver, lungs, bone marrow, and brain. Type A and B are caused by SMPD1 gene mutations.',
    symptoms: [
      'Enlarged liver and spleen',
      'Progressive neurological deterioration',
      'Cherry-red spot on retina',
      'Lung disease',
      'Developmental delays',
      'Muscle weakness',
      'Seizures (in severe forms)',
    ],
    treatments: [
      'Enzyme replacement therapy for Type B (Olipudase alfa)',
      'Supportive care',
      'Bone marrow transplant (investigational)',
      'Symptom management',
      'Gene therapy trials underway',
    ],
    pathogenicVariants: [
      {
        id: 'R496L',
        name: 'Arg496Leu',
        pathogenicGenotypes: ['GT', 'TT'],
        rsid: 'rs61046031',
        frequency: { ashkenazi: 0.003 },
      },
      {
        id: 'L302P',
        name: 'Leu302Pro',
        pathogenicGenotypes: ['CG', 'GG'],
        rsid: 'rs61046028',
        frequency: { ashkenazi: 0.0015 },
      },
    ],
    associatedSNPs: ['rs61046031', 'rs61046028', 'rs120074190'],
    prevalence: {
      ashkenazi_jewish: 'Type A: 1 in 40,000',
      general: '1 in 250,000',
      carrier_rate_ashkenazi: '1 in 90',
    },
    recommendations: [
      'Genetic counseling recommended',
      'Specialist referral if affected',
      'Family screening recommended',
      'Prenatal testing available',
    ],
    resources: [
      { title: 'National Niemann-Pick Disease Foundation', url: 'https://www.nnpdf.org', type: 'website' },
      { title: 'Ara Parseghian Medical Research Foundation', url: 'https://www.parseghianfoundation.org', type: 'website' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: false,
    ageOfOnset: 'Type A: Infancy; Type B: Childhood; Type C: Variable',
  },

  {
    id: 'canavan_disease',
    name: 'Canavan Disease',
    gene: 'ASPA',
    geneFullName: 'Aspartoacylase',
    chromosome: '17',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Neurological',
    severity: 'critical',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'Canavan disease is a progressive neurological disorder that causes brain tissue degeneration. It is caused by deficiency of the enzyme aspartoacylase, leading to accumulation of N-acetylaspartic acid in the brain.',
    symptoms: [
      'Poor head control',
      'Abnormally large head (macrocephaly)',
      'Developmental delay',
      'Loss of previously acquired skills',
      'Seizures',
      'Feeding difficulties',
      'Blindness',
      'Hearing loss',
    ],
    treatments: [
      'No cure currently available',
      'Supportive care',
      'Physical therapy',
      'Seizure management',
      'Feeding tube placement',
      'Gene therapy trials in progress',
    ],
    pathogenicVariants: [
      {
        id: 'E285A',
        name: 'Glu285Ala (E285A)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs121908548',
        frequency: { ashkenazi: 0.0098 },
      },
      {
        id: 'Y231X',
        name: 'Tyr231Ter (Y231X)',
        pathogenicGenotypes: ['AG', 'GG'],
        rsid: 'rs121908549',
        frequency: { ashkenazi: 0.0015 },
      },
    ],
    associatedSNPs: ['rs121908548', 'rs121908549', 'rs28940279'],
    prevalence: {
      ashkenazi_jewish: '1 in 6,400 to 13,500',
      general: '1 in 100,000',
      carrier_rate_ashkenazi: '1 in 40 to 57',
    },
    recommendations: [
      'Genetic counseling essential',
      'Partner screening mandatory if Ashkenazi Jewish',
      'Prenatal diagnosis available',
      'Preimplantation genetic diagnosis an option',
      'Consider joining clinical trials',
    ],
    resources: [
      { title: 'Canavan Foundation', url: 'https://www.canavanfoundation.org', type: 'website' },
      { title: 'Canavan Research Illinois', url: 'https://www.canavanresearch.org', type: 'website' },
      { title: 'Jacob\'s Cure', url: 'https://www.jacobscure.org', type: 'support_group' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: true,
    ageOfOnset: 'Infancy (3-5 months)',
  },

  {
    id: 'familial_mediterranean_fever',
    name: 'Familial Mediterranean Fever',
    gene: 'MEFV',
    geneFullName: 'Mediterranean Fever',
    chromosome: '16',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Autoimmune',
    severity: 'moderate',
    clinicalSignificance: ClinicalSignificanceEnum.STRONG,
    description: 'Familial Mediterranean Fever (FMF) is an inherited inflammatory disorder characterized by recurrent fevers and painful inflammation of the abdomen, chest, and joints. It primarily affects people of Mediterranean ancestry.',
    symptoms: [
      'Recurrent fever episodes',
      'Abdominal pain (peritonitis)',
      'Chest pain (pleuritis)',
      'Joint pain and swelling',
      'Skin rash (erysipelas-like)',
      'Muscle pain',
      'Amyloidosis risk (kidney damage)',
    ],
    treatments: [
      'Colchicine (highly effective for prevention)',
      'Biologics (IL-1 inhibitors) for colchicine-resistant cases',
      'Pain management',
      'Regular monitoring for amyloidosis',
      'Lifestyle modifications to manage triggers',
    ],
    pathogenicVariants: [
      {
        id: 'M694V',
        name: 'Met694Val (M694V)',
        pathogenicGenotypes: ['AG', 'GG'],
        rsid: 'rs28940580',
        frequency: { ashkenazi: 0.015, armenian: 0.1, arab: 0.08, turkish: 0.08 },
      },
      {
        id: 'V726A',
        name: 'Val726Ala (V726A)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs28940581',
        frequency: { ashkenazi: 0.008, arab: 0.05 },
      },
      {
        id: 'E148Q',
        name: 'Glu148Gln (E148Q)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs3743930',
        frequency: { ashkenazi: 0.005, arab: 0.03 },
      },
    ],
    associatedSNPs: ['rs28940580', 'rs28940581', 'rs3743930', 'rs61752717'],
    prevalence: {
      ashkenazi_jewish: '1 in 200 to 1,000',
      armenian: '1 in 500',
      arab: '1 in 1,000 to 2,000',
      turkish: '1 in 1,000',
      carrier_rate: '1 in 5 to 7 (high-risk populations)',
    },
    recommendations: [
      'Genetic counseling recommended',
      'Clinical evaluation if symptomatic',
      'Colchicine treatment very effective',
      'Regular monitoring for amyloidosis',
      'Family screening recommended',
    ],
    resources: [
      { title: 'FMF & AID Global Association', url: 'https://www.fmf-aid.org', type: 'website' },
      { title: 'American FMF Foundation', url: 'https://www.fmfinfo.org', type: 'support_group' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: false,
    ageOfOnset: 'Childhood to adolescence (usually before age 20)',
  },

  {
    id: 'phenylketonuria',
    name: 'Phenylketonuria (PKU)',
    gene: 'PAH',
    geneFullName: 'Phenylalanine Hydroxylase',
    chromosome: '12',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Metabolic',
    severity: 'high',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'Phenylketonuria (PKU) is an inherited metabolic disorder caused by deficiency of the enzyme phenylalanine hydroxylase. Without treatment, phenylalanine accumulates, causing intellectual disability and other neurological problems.',
    symptoms: [
      'Intellectual disability (without treatment)',
      'Seizures',
      'Behavioral problems',
      'Musty odor in breath, skin, or urine',
      'Lighter skin and hair than family',
      'Eczema',
      'Developmental delays',
    ],
    treatments: [
      'Low-phenylalanine diet for life',
      'Special medical foods and formulas',
      'Kuvan (sapropterin) for some patients',
      'Palynziq (pegvaliase) for adults',
      'Regular blood phenylalanine monitoring',
      'Nutritional counseling',
    ],
    pathogenicVariants: [
      {
        id: 'R408W',
        name: 'Arg408Trp (R408W)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs5030858',
        frequency: { european: 0.004 },
      },
      {
        id: 'IVS12plus1',
        name: 'IVS12+1G>A splice mutation',
        pathogenicGenotypes: ['AG', 'GG'],
        rsid: 'rs62514903',
        frequency: { european: 0.003 },
      },
    ],
    associatedSNPs: ['rs5030858', 'rs62514903', 'rs5030857', 'rs5030856'],
    prevalence: {
      general: '1 in 10,000 to 15,000',
      irish: '1 in 4,500',
      turkish: '1 in 2,600',
      carrier_rate: '1 in 50 to 60',
    },
    recommendations: [
      'Newborn screening catches most cases',
      'Strict dietary management essential',
      'Genetic counseling for family planning',
      'Maternal PKU management for pregnancy',
      'Lifelong monitoring required',
    ],
    resources: [
      { title: 'National PKU Alliance', url: 'https://www.npkua.org', type: 'website' },
      { title: 'PKU News', url: 'https://www.pkunews.org', type: 'website' },
      { title: 'Children\'s PKU Network', url: 'https://www.pkunetwork.org', type: 'support_group' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: true,
    ageOfOnset: 'Newborn (symptoms appear if untreated)',
  },

  {
    id: 'medium_chain_acyl_dehydrogenase_deficiency',
    name: 'Medium-Chain Acyl-CoA Dehydrogenase Deficiency (MCADD)',
    gene: 'ACADM',
    geneFullName: 'Acyl-CoA Dehydrogenase Medium Chain',
    chromosome: '1',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Metabolic',
    severity: 'high',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'MCADD is a fatty acid oxidation disorder that prevents the body from converting certain fats to energy, especially during fasting. It can lead to serious health problems including brain damage or death if not managed properly.',
    symptoms: [
      'Hypoglycemia (low blood sugar)',
      'Vomiting',
      'Lethargy',
      'Seizures',
      'Breathing problems',
      'Liver problems',
      'Coma (during metabolic crisis)',
    ],
    treatments: [
      'Avoid fasting (regular meals and snacks)',
      'Low-fat diet',
      'L-carnitine supplements',
      'Emergency management plan for illness',
      'Glucose emergency protocols',
      'Regular monitoring',
    ],
    pathogenicVariants: [
      {
        id: 'K304E',
        name: 'Lys304Glu (K304E)',
        pathogenicGenotypes: ['AG', 'GG'],
        rsid: 'rs77931234',
        frequency: { northern_european: 0.009 },
      },
    ],
    associatedSNPs: ['rs77931234', 'rs121434283'],
    prevalence: {
      northern_european: '1 in 10,000 to 15,000',
      general: '1 in 17,000',
      carrier_rate: '1 in 65',
    },
    recommendations: [
      'Never skip meals or fast',
      'Emergency letter for healthcare providers',
      'Medical alert bracelet recommended',
      'Genetic counseling for family planning',
      'Regular follow-up with metabolic specialist',
    ],
    resources: [
      { title: 'FOD Family Support Group', url: 'https://www.fodsupport.org', type: 'support_group' },
      { title: 'National Organization for Rare Disorders', url: 'https://rarediseases.org/rare-diseases/mcad-deficiency', type: 'website' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: true,
    ageOfOnset: 'Usually triggered by illness or fasting',
  },

  {
    id: 'hereditary_hemochromatosis',
    name: 'Hereditary Hemochromatosis',
    gene: 'HFE',
    geneFullName: 'Homeostatic Iron Regulator',
    chromosome: '6',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Metabolic',
    severity: 'moderate',
    clinicalSignificance: ClinicalSignificanceEnum.STRONG,
    description: 'Hereditary hemochromatosis is a disorder that causes the body to absorb too much iron from the diet. The excess iron is stored in organs, particularly the liver, heart, and pancreas, potentially causing organ damage.',
    symptoms: [
      'Joint pain (especially in knuckles)',
      'Fatigue and weakness',
      'Abdominal pain',
      'Skin discoloration (bronze or gray)',
      'Diabetes (bronze diabetes)',
      'Liver disease (cirrhosis, liver cancer)',
      'Heart problems',
      'Erectile dysfunction',
    ],
    treatments: [
      'Regular phlebotomy (blood removal)',
      'Iron chelation therapy (if phlebotomy not possible)',
      'Avoid iron supplements and vitamin C',
      'Limit alcohol consumption',
      'Regular monitoring of iron levels',
      'Genetic counseling for family',
    ],
    pathogenicVariants: [
      {
        id: 'C282Y',
        name: 'Cys282Tyr (C282Y)',
        pathogenicGenotypes: ['AG', 'GG'],
        rsid: 'rs1800562',
        frequency: { european: 0.06, celtic: 0.1 },
      },
      {
        id: 'H63D',
        name: 'His63Asp (H63D)',
        pathogenicGenotypes: ['CG', 'GG'],
        rsid: 'rs1799945',
        frequency: { european: 0.15, general: 0.1 },
      },
    ],
    associatedSNPs: ['rs1800562', 'rs1799945', 'rs855791'],
    prevalence: {
      european: '1 in 200 to 400 (affected with C282Y homozygosity)',
      general: '1 in 300',
      carrier_rate: '1 in 8 to 10 (Northern European)',
    },
    recommendations: [
      'Regular monitoring of ferritin and transferrin saturation',
      'Avoid iron supplements',
      'Limit alcohol intake',
      'Genetic testing for at-risk family members',
      'Phlebotomy is simple and effective treatment',
      'Discuss with physician even if asymptomatic',
    ],
    resources: [
      { title: 'American Hemochromatosis Society', url: 'https://www.americanhs.org', type: 'website' },
      { title: 'Iron Disorders Institute', url: 'https://www.irondisorders.org', type: 'website' },
      { title: 'Hemochromatosis Arthritis', url: 'https://www.hemochromatosis.org', type: 'support_group' },
    ],
    prenatalTestingAvailable: false,
    newbornScreeningAvailable: false,
    ageOfOnset: 'Usually after age 40 (earlier in men)',
  },

  {
    id: 'wilson_disease',
    name: 'Wilson Disease',
    gene: 'ATP7B',
    geneFullName: 'ATPase Copper Transporting Beta',
    chromosome: '13',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Metabolic',
    severity: 'critical',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'Wilson disease is a rare genetic disorder characterized by excess copper stored in various body tissues, particularly the liver, brain, and corneas of the eyes. If untreated, it can cause life-threatening organ damage.',
    symptoms: [
      'Liver disease (jaundice, ascites)',
      'Neurological symptoms (tremor, rigidity)',
      'Psychiatric symptoms (depression, personality changes)',
      'Kayser-Fleischer rings (copper in cornea)',
      'Anemia',
      'Kidney problems',
      'Osteoporosis',
    ],
    treatments: [
      'Copper-chelating agents (D-penicillamine, trientine)',
      'Zinc acetate (blocks copper absorption)',
      'Low-copper diet',
      'Liver transplant (for severe liver failure)',
      'Regular monitoring of copper levels',
      'Lifelong treatment required',
    ],
    pathogenicVariants: [
      {
        id: 'H1069Q',
        name: 'His1069Gln (H1069Q)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs76151636',
        frequency: { european: 0.003 },
      },
    ],
    associatedSNPs: ['rs76151636', 'rs1801243', 'rs7327744'],
    prevalence: {
      general: '1 in 30,000',
      carrier_rate: '1 in 90',
    },
    recommendations: [
      'Urgent specialist referral if symptoms present',
      'Lifelong treatment essential',
      'Regular monitoring of liver and neurological function',
      'Genetic counseling for family planning',
      'Siblings should be tested',
    ],
    resources: [
      { title: 'Wilson Disease Association', url: 'https://www.wilsondisease.org', type: 'website' },
      { title: 'British Liver Trust', url: 'https://britishlivertrust.org.uk/information-and-support/living-with-a-liver-condition/liver-conditions/wilson-disease', type: 'website' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: false,
    ageOfOnset: 'Childhood to young adulthood (usually before age 40)',
  },

  {
    id: 'alpha_1_antitrypsin_deficiency',
    name: 'Alpha-1 Antitrypsin Deficiency',
    gene: 'SERPINA1',
    geneFullName: 'Serpin Family A Member 1',
    chromosome: '14',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Pulmonary',
    severity: 'high',
    clinicalSignificance: ClinicalSignificanceEnum.STRONG,
    description: 'Alpha-1 antitrypsin deficiency is a genetic disorder that can cause lung disease (emphysema/COPD) and liver disease. The deficiency leads to uncontrolled elastase activity that damages lung tissue.',
    symptoms: [
      'Shortness of breath',
      'Wheezing',
      'Chronic cough with phlegm',
      'Recurrent respiratory infections',
      'Fatigue',
      'Liver disease (jaundice, ascites)',
      'Panniculitis (skin condition)',
    ],
    treatments: [
      'Augmentation therapy (Prolastin, Zemaira)',
      'Bronchodilators and inhaled steroids',
      'Antibiotics for infections',
      'Pulmonary rehabilitation',
      'Lung transplant (severe cases)',
      'Avoid smoking and secondhand smoke',
      'Vaccinations (flu, pneumonia)',
    ],
    pathogenicVariants: [
      {
        id: 'Z_allele',
        name: 'Z allele (Glu342Lys)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs28929474',
        frequency: { european: 0.015 },
      },
      {
        id: 'S_allele',
        name: 'S allele (Glu264Val)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs17580',
        frequency: { european: 0.03, iberian: 0.06 },
      },
    ],
    associatedSNPs: ['rs28929474', 'rs17580', 'rs709932'],
    prevalence: {
      european: 'ZZ: 1 in 3,000 to 5,000',
      general: '1 in 1,500 to 3,500',
      carrier_rate: '1 in 10 to 25',
    },
    recommendations: [
      'Avoid smoking completely',
      'Annual vaccinations',
      'Regular pulmonary function tests',
      'Augmentation therapy for ZZ individuals',
      'Genetic counseling for family planning',
      'Liver monitoring for ZZ individuals',
    ],
    resources: [
      { title: 'Alpha-1 Foundation', url: 'https://www.alpha1.org', type: 'website' },
      { title: 'AlphaNet', url: 'https://www.alphanet.org', type: 'support_group' },
      { title: 'COPD Foundation', url: 'https://www.copdfoundation.org', type: 'website' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: false,
    ageOfOnset: 'Lung symptoms: 20-50 years; Liver symptoms: infancy to adulthood',
  },

  // ============================================
  // X-LINKED CONDITIONS
  // ============================================

  {
    id: 'g6pd_deficiency',
    name: 'G6PD Deficiency',
    gene: 'G6PD',
    geneFullName: 'Glucose-6-Phosphate Dehydrogenase',
    chromosome: 'X',
    inheritance: InheritancePatternEnum.X_LINKED_RECESSIVE,
    category: 'Hematology',
    severity: 'moderate',
    clinicalSignificance: ClinicalSignificanceEnum.STRONG,
    description: 'G6PD deficiency is the most common human enzyme deficiency, affecting red blood cells. It causes hemolytic anemia when exposed to certain triggers like fava beans, certain medications, or infections.',
    symptoms: [
      'Hemolytic anemia (episodic)',
      'Jaundice',
      'Dark urine',
      'Fatigue',
      'Pale skin',
      'Rapid heart rate',
      'Shortness of breath',
    ],
    treatments: [
      'Avoid triggers (fava beans, certain drugs)',
      'Treat underlying infection promptly',
      'Blood transfusion (severe hemolysis)',
      'Phototherapy (for newborn jaundice)',
      'Avoid naphthalene (mothballs)',
    ],
    pathogenicVariants: [
      {
        id: 'G6PD_A_',
        name: 'G6PD A- (African variant)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs1050829',
        frequency: { african_american: 0.11 },
      },
      {
        id: 'G6PD_Mediterranean',
        name: 'G6PD Mediterranean',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs5030868',
        frequency: { mediterranean: 0.03, middle_eastern: 0.06 },
      },
    ],
    associatedSNPs: ['rs1050829', 'rs5030868', 'rs137852328'],
    prevalence: {
      african_american: '1 in 10 males',
      mediterranean: '1 in 10 males (Sardinia, Greece)',
      middle_eastern: '1 in 10 males (Kurdish Jews)',
      asian: '1 in 20 to 50 males',
      general: '400 million people worldwide',
    },
    recommendations: [
      'Carry medical alert information',
      'Avoid fava beans completely',
      'Check all medications for safety',
      'Inform all healthcare providers',
      'Sons of female carriers have 50% risk',
    ],
    resources: [
      { title: 'G6PD Deficiency Association', url: 'https://www.g6pd.org', type: 'website' },
      { title: 'G6PD Deficiency Favism Association', url: 'https://www.favism.org', type: 'website' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: true,
    ageOfOnset: 'Usually triggered by exposure',
  },

  // ============================================
  // AUTOSOMAL DOMINANT CONDITIONS
  // ============================================

  {
    id: 'brca1_brca2_syndrome',
    name: 'Hereditary Breast and Ovarian Cancer Syndrome',
    gene: 'BRCA1/BRCA2',
    geneFullName: 'BRCA1 DNA Repair Associated / BRCA2 DNA Repair Associated',
    chromosome: '17 (BRCA1), 13 (BRCA2)',
    inheritance: InheritancePatternEnum.AUTOSOMAL_DOMINANT,
    category: 'Oncology',
    severity: 'critical',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'BRCA1 and BRCA2 are tumor suppressor genes. Pathogenic variants significantly increase the risk of breast, ovarian, prostate, and pancreatic cancers. This is not a carrier condition per se, but affects the individual\'s own cancer risk.',
    symptoms: [
      'Increased cancer risk (not a disease itself)',
      'Breast cancer (often before age 50)',
      'Ovarian cancer',
      'Prostate cancer (increased risk)',
      'Pancreatic cancer (increased risk)',
      'Male breast cancer',
    ],
    treatments: [
      'Enhanced screening (MRI, mammography)',
      'Risk-reducing medications (tamoxifen)',
      'Risk-reducing surgery (mastectomy, oophorectomy)',
      'Genetic counseling essential',
      'Lifestyle modifications',
    ],
    pathogenicVariants: [
      {
        id: 'BRCA1_185delAG',
        name: 'BRCA1 185delAG',
        pathogenicGenotypes: ['AG', 'GG'],
        rsid: 'rs80357906',
        frequency: { ashkenazi: 0.009 },
      },
      {
        id: 'BRCA1_5382insC',
        name: 'BRCA1 5382insC',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs80358152',
        frequency: { ashkenazi: 0.003 },
      },
      {
        id: 'BRCA2_6174delT',
        name: 'BRCA2 6174delT',
        pathogenicGenotypes: ['AT', 'TT'],
        rsid: 'rs80359550',
        frequency: { ashkenazi: 0.012 },
      },
    ],
    associatedSNPs: ['rs80357906', 'rs80358152', 'rs80359550', 'rs28897696'],
    prevalence: {
      general: '1 in 400 to 800',
      ashkenazi_jewish: '1 in 40',
      carrier_rate: '1 in 500 (general), 1 in 40 (Ashkenazi)',
    },
    recommendations: [
      'URGENT: Referral to genetic counselor',
      'Referral to high-risk cancer clinic',
      'Enhanced screening protocols',
      'Discuss risk-reducing options',
      'Family screening essential',
      'Consider research studies',
    ],
    resources: [
      { title: 'FORCE (Facing Our Risk)', url: 'https://www.facingourrisk.org', type: 'support_group' },
      { title: 'BRCA Exchange', url: 'https://brcaexchange.org', type: 'website' },
      { title: 'National Cancer Institute', url: 'https://www.cancer.gov/about-cancer/causes-prevention/genetics/brca-fact-sheet', type: 'clinical' },
      { title: 'Bright Pink', url: 'https://www.brightpink.org', type: 'support_group' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: false,
    ageOfOnset: 'Cancer risk increases with age, often before 50',
  },

  {
    id: 'familial_hypercholesterolemia',
    name: 'Familial Hypercholesterolemia (FH)',
    gene: 'LDLR',
    geneFullName: 'Low Density Lipoprotein Receptor',
    chromosome: '19',
    inheritance: InheritancePatternEnum.AUTOSOMAL_DOMINANT,
    category: 'Cardiovascular',
    severity: 'high',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'Familial hypercholesterolemia is a genetic disorder characterized by very high LDL cholesterol levels from birth. It significantly increases the risk of early heart disease if untreated.',
    symptoms: [
      'Very high LDL cholesterol from birth',
      'Cholesterol deposits in tendons (xanthomas)',
      'Cholesterol deposits around eyes (xanthelasma)',
      'Corneal arcus (gray ring around cornea)',
      'Angina and heart attacks at young age',
      'Stroke at young age',
    ],
    treatments: [
      'High-dose statins',
      'Ezetimibe',
      'PCSK9 inhibitors',
      'Lomitapide or mipomersen (severe cases)',
      'Lipoprotein apheresis',
      'Very low saturated fat diet',
      'Start treatment in childhood',
    ],
    pathogenicVariants: [
      {
        id: 'LDLR_common',
        name: 'Various LDLR pathogenic variants',
        pathogenicGenotypes: ['CT', 'TT', 'AG', 'GG'],
        rsid: 'rs5925',
        frequency: { european: 0.002 },
      },
    ],
    associatedSNPs: ['rs5925', 'rs688', 'rs1433099'],
    prevalence: {
      heterozygous: '1 in 250',
      homozygous: '1 in 160,000 to 1 million',
    },
    recommendations: [
      'Referral to lipid specialist',
      'Start statins early (often in childhood)',
      'Family cascade screening essential',
      'Heart-healthy diet from childhood',
      'Regular monitoring of cholesterol',
      'Address other cardiac risk factors',
    ],
    resources: [
      { title: 'FH Foundation', url: 'https://thefhfoundation.org', type: 'website' },
      { title: 'Family Heart Foundation', url: 'https://www.familyheart.org', type: 'website' },
      { title: 'British Heart Foundation', url: 'https://www.bhf.org.uk/informationsupport/conditions/familial-hypercholesterolemia', type: 'website' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: false,
    ageOfOnset: 'Birth (cholesterol elevated), heart disease often by 40-50',
  },

  // ============================================
  // ADDITIONAL CARRIER CONDITIONS
  // ============================================

  {
    id: 'congenital_adrenal_hyperplasia',
    name: 'Congenital Adrenal Hyperplasia (21-Hydroxylase Deficiency)',
    gene: 'CYP21A2',
    geneFullName: 'Cytochrome P450 Family 21 Subfamily A Member 2',
    chromosome: '6',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Endocrine',
    severity: 'critical',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'The most common form of CAH is caused by 21-hydroxylase deficiency. It affects adrenal hormone production and can cause life-threatening salt-wasting crises in the severe form.',
    symptoms: [
      'Ambiguous genitalia (females)',
      'Salt-wasting crises (vomiting, dehydration)',
      'Early puberty (males)',
      'Excess facial/body hair',
      'Short stature (untreated)',
      'Fertility issues',
      'Menstrual irregularities',
    ],
    treatments: [
      'Glucocorticoid replacement (hydrocortisone)',
      'Mineralocorticoid replacement (fludrocortisone)',
      'Salt supplements (infants)',
      'Stress-dose steroids for illness/surgery',
      'Genital surgery (if needed)',
      'Fertility treatments',
    ],
    pathogenicVariants: [
      {
        id: 'I2G',
        name: 'Intron 2 splice mutation',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs6475',
        frequency: { ashkenazi: 0.015 },
      },
      {
        id: 'Q318X',
        name: 'Gln318Ter',
        pathogenicGenotypes: ['AG', 'GG'],
        rsid: 'rs121917819',
        frequency: { ashkenazi: 0.008 },
      },
    ],
    associatedSNPs: ['rs6475', 'rs121917819'],
    prevalence: {
      general: '1 in 10,000 to 15,000',
      carrier_rate: '1 in 50 to 60',
    },
    recommendations: [
      'Newborn screening available',
      'Genetic counseling for family planning',
      'Prenatal treatment possible (experimental)',
      'Stress management education critical',
      'Regular endocrinology follow-up',
    ],
    resources: [
      { title: 'CARES Foundation', url: 'https://www.caresfoundation.org', type: 'website' },
      { title: 'National Adrenal Diseases Foundation', url: 'https://www.nadf.us', type: 'support_group' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: true,
    ageOfOnset: 'Birth (salt-wasting form) or childhood (simple virilizing)',
  },

  {
    id: 'spinal_muscular_atrophy',
    name: 'Spinal Muscular Atrophy',
    gene: 'SMN1',
    geneFullName: 'Survival Motor Neuron 1',
    chromosome: '5',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Neurological',
    severity: 'critical',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'Spinal muscular atrophy is a genetic disorder that affects the motor nerve cells in the spinal cord, leading to progressive muscle weakness and atrophy. It is a leading genetic cause of infant death.',
    symptoms: [
      'Muscle weakness and wasting',
      'Difficulty breathing',
      'Difficulty swallowing',
      'Delayed motor milestones',
      'Tremors',
      'Scoliosis',
      'Respiratory infections',
    ],
    treatments: [
      'Gene therapy (Zolgensma - one-time treatment)',
      'Nusinersen (Spinraza) - ongoing injections',
      'Risdiplam (Evrysdi) - oral medication',
      'Respiratory support',
      'Physical and occupational therapy',
      'Feeding tube placement',
    ],
    pathogenicVariants: [
      {
        id: 'SMN1_del',
        name: 'SMN1 deletion (exon 7)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs80338943',
        frequency: { general: 0.007 },
      },
    ],
    associatedSNPs: ['rs80338943', 'rs968601', 'rs77044559'],
    prevalence: {
      general: '1 in 10,000 births (affected)',
      carrier_rate: '1 in 40 to 50',
    },
    recommendations: [
      'Carrier screening recommended for all',
      'New treatments are transformative',
      'Early diagnosis is critical',
      'Prenatal testing available',
      'Genetic counseling essential',
    ],
    resources: [
      { title: 'Cure SMA', url: 'https://www.curesma.org', type: 'website' },
      { title: 'SMA Foundation', url: 'https://www.smafoundation.org', type: 'website' },
      { title: 'SMA Europe', url: 'https://www.sma-europe.eu', type: 'support_group' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: true,
    ageOfOnset: 'Type 1: Before 6 months; Type 2: 6-18 months; Type 3: After 18 months; Type 4: Adulthood',
  },

  {
    id: 'fragile_x_syndrome',
    name: 'Fragile X Syndrome',
    gene: 'FMR1',
    geneFullName: 'Fragile X Messenger Ribonucleoprotein 1',
    chromosome: 'X',
    inheritance: InheritancePatternEnum.X_LINKED_DOMINANT,
    category: 'Neurological',
    severity: 'critical',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'Fragile X syndrome is the most common inherited cause of intellectual disability and autism. It is caused by an expansion of CGG repeats in the FMR1 gene.',
    symptoms: [
      'Intellectual disability',
      'Autism spectrum features',
      'Long, narrow face',
      'Large ears',
      'Flexible fingers',
      'Hyperactivity',
      'Seizures (in some)',
      'Premature ovarian failure (female carriers)',
    ],
    treatments: [
      'Early intervention programs',
      'Speech and occupational therapy',
      'Special education',
      'Behavioral therapy',
      'Medications for specific symptoms',
      'Clinical trials for targeted treatments',
    ],
    pathogenicVariants: [
      {
        id: 'FMR1_expansion',
        name: 'FMR1 CGG expansion (>200 repeats)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs28928875',
        frequency: { general: 0.0005 },
      },
    ],
    associatedSNPs: ['rs28928875'],
    prevalence: {
      males: '1 in 4,000',
      females: '1 in 6,000 to 8,000',
      carrier_rate: '1 in 130 to 250 women (premutation)',
    },
    recommendations: [
      'Genetic counseling for interpretation',
      'Carrier testing for female relatives',
      'Early intervention if child affected',
      'FXTAS screening for older male carriers',
      'Premature ovarian failure awareness',
    ],
    resources: [
      { title: 'National Fragile X Foundation', url: 'https://fragilex.org', type: 'website' },
      { title: 'FRAXA Research Foundation', url: 'https://www.fraxa.org', type: 'website' },
      { title: 'CDC Fragile X', url: 'https://www.cdc.gov/ncbddd/fxs', type: 'website' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: false,
    ageOfOnset: 'Developmental delays apparent by age 2',
  },

  {
    id: 'thalassemia_alpha',
    name: 'Alpha Thalassemia',
    gene: 'HBA1/HBA2',
    geneFullName: 'Hemoglobin Subunit Alpha 1/2',
    chromosome: '16',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Hematology',
    severity: 'high',
    clinicalSignificance: ClinicalSignificanceEnum.STRONG,
    description: 'Alpha thalassemia is a blood disorder that reduces hemoglobin production. Severity ranges from silent carrier to life-threatening hydrops fetalis (loss of all 4 alpha globin genes).',
    symptoms: [
      'Anemia (severity varies)',
      'Fatigue',
      'Pale skin',
      'Splenomegaly',
      'Bone deformities (severe forms)',
      'Poor growth',
      'Hydrops fetalis (4 gene deletion)',
    ],
    treatments: [
      'Blood transfusions (moderate to severe)',
      'Iron chelation therapy',
      'Folic acid supplements',
      'Bone marrow transplant (curative)',
      'Gene therapy (in trials)',
      'Management of complications',
    ],
    pathogenicVariants: [
      {
        id: 'SEA_deletion',
        name: 'Southeast Asian deletion (--SEA)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs33915225',
        frequency: { southeast_asian: 0.04 },
      },
      {
        id: '3p7_deletion',
        name: '3.7 kb deletion (-α3.7)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs33950575',
        frequency: { african: 0.15, mediterranean: 0.1 },
      },
    ],
    associatedSNPs: ['rs33915225', 'rs33950575'],
    prevalence: {
      southeast_asian: 'Up to 30% carrier rate',
      african: 'Carrier rate 1 in 3',
      mediterranean: 'Carrier rate varies by region',
      carrier_rate: 'Very common in malaria-endemic regions',
    },
    recommendations: [
      'Partner screening essential',
      'Prenatal diagnosis available',
      'Genetic counseling for family planning',
      'Regular monitoring if affected',
      'Malaria protection (balanced polymorphism)',
    ],
    resources: [
      { title: 'Cooley\'s Anemia Foundation', url: 'https://cooleysanemia.org', type: 'website' },
      { title: 'Thalassemia International Federation', url: 'https://thalassemia.org.cy', type: 'website' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: true,
    ageOfOnset: 'Birth (severe forms) or later',
  },

  {
    id: 'thalassemia_beta',
    name: 'Beta Thalassemia',
    gene: 'HBB',
    geneFullName: 'Hemoglobin Subunit Beta',
    chromosome: '11',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Hematology',
    severity: 'high',
    clinicalSignificance: ClinicalSignificanceEnum.STRONG,
    description: 'Beta thalassemia is characterized by reduced or absent beta globin chain production. It ranges from asymptomatic carrier (trait) to transfusion-dependent thalassemia major.',
    symptoms: [
      'Severe anemia',
      'Failure to thrive',
      'Bone deformities (facial)',
      'Jaundice',
      'Splenomegaly',
      'Delayed puberty',
      'Iron overload (from transfusions)',
    ],
    treatments: [
      'Regular blood transfusions',
      'Iron chelation therapy',
      'Folic acid supplements',
      'Splenectomy (in some cases)',
      'Bone marrow transplant (curative option)',
      'Gene therapy (Zynteglo - approved)',
      'Luspatercept (reduce transfusion needs)',
    ],
    pathogenicVariants: [
      {
        id: 'IVS110',
        name: 'IVS1-110 G>A',
        pathogenicGenotypes: ['AG', 'GG'],
        rsid: 'rs33999445',
        frequency: { mediterranean: 0.03 },
      },
      {
        id: 'CD39',
        name: 'Cd39 C>T',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs35456885',
        frequency: { mediterranean: 0.025 },
      },
    ],
    associatedSNPs: ['rs33999445', 'rs35456885'],
    prevalence: {
      mediterranean: 'Carrier rate up to 20%',
      middle_eastern: 'Carrier rate varies',
      southeast_asian: 'Increasing prevalence',
      general: 'Carrier rate varies by ethnicity',
    },
    recommendations: [
      'Partner screening essential',
      'Genetic counseling before conception',
      'Prenatal diagnosis available',
      'Preimplantation genetic diagnosis option',
      'Regular care at thalassemia center',
    ],
    resources: [
      { title: 'Cooley\'s Anemia Foundation', url: 'https://cooleysanemia.org', type: 'website' },
      { title: 'Thalassemia International Federation', url: 'https://thalassemia.org.cy', type: 'website' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: true,
    ageOfOnset: '6-24 months (thalassemia major)',
  },

  {
    id: 'maple_syrup_urine_disease',
    name: 'Maple Syrup Urine Disease (MSUD)',
    gene: 'BCKDHA/BCKDHB/DBT',
    geneFullName: 'Branched-Chain Keto Acid Dehydrogenase Subunits',
    chromosome: '19, 6, 1',
    inheritance: InheritancePatternEnum.AUTOSOMAL_RECESSIVE,
    category: 'Metabolic',
    severity: 'critical',
    clinicalSignificance: ClinicalSignificanceEnum.DEFINITIVE,
    description: 'MSUD is an inherited disorder in which the body cannot process certain amino acids (leucine, isoleucine, valine). It causes distinctive sweet-smelling urine and can lead to severe brain damage if untreated.',
    symptoms: [
      'Maple syrup odor in urine, sweat, earwax',
      'Poor feeding',
      'Vomiting',
      'Lethargy',
      'Seizures',
      'Developmental delays',
      'Coma (during metabolic crisis)',
    ],
    treatments: [
      'Special low-protein diet',
      'Medical formula without BCAAs',
      'Thiamine supplementation (responsive forms)',
      'Emergency management during illness',
      'Liver transplant (curative option)',
      'Regular monitoring of amino acids',
    ],
    pathogenicVariants: [
      {
        id: 'Y393N',
        name: 'Tyr393Asn (BCKDHA)',
        pathogenicGenotypes: ['CT', 'TT'],
        rsid: 'rs121964972',
        frequency: { menonite: 0.035 },
      },
    ],
    associatedSNPs: ['rs121964972', 'rs121964974'],
    prevalence: {
      general: '1 in 185,000',
      menonite: '1 in 380',
      carrier_rate: '1 in 215',
    },
    recommendations: [
      'Newborn screening essential',
      'Strict dietary management lifelong',
      'Emergency protocol for illness',
      'Genetic counseling for family planning',
      'Consider liver transplant evaluation',
    ],
    resources: [
      { title: 'MSUD Family Support Group', url: 'https://www.msud-support.org', type: 'support_group' },
      { title: 'National Organization for Rare Disorders', url: 'https://rarediseases.org/rare-diseases/maple-syrup-urine-disease', type: 'website' },
    ],
    prenatalTestingAvailable: true,
    newbornScreeningAvailable: true,
    ageOfOnset: 'First week of life (classic form)',
  },
];

/**
 * Get all carrier conditions
 */
export function getAllCarrierConditions(): CarrierCondition[] {
  return CARRIER_CONDITIONS;
}

/**
 * Get condition by ID
 */
export function getConditionById(id: string): CarrierCondition | undefined {
  return CARRIER_CONDITIONS.find(c => c.id === id);
}

/**
 * Get conditions by gene
 */
export function getConditionsByGene(gene: string): CarrierCondition[] {
  return CARRIER_CONDITIONS.filter(c => 
    c.gene.toLowerCase().includes(gene.toLowerCase())
  );
}

/**
 * Get conditions by category
 */
export function getConditionsByCategory(category: string): CarrierCondition[] {
  return CARRIER_CONDITIONS.filter(c => 
    c.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get conditions by inheritance pattern
 */
export function getConditionsByInheritance(inheritance: InheritancePattern): CarrierCondition[] {
  return CARRIER_CONDITIONS.filter(c => c.inheritance === inheritance);
}

/**
 * Get high-risk conditions (severity critical or high)
 */
export function getHighRiskConditions(): CarrierCondition[] {
  return CARRIER_CONDITIONS.filter(c => c.severity === 'critical' || c.severity === 'high');
}

/**
 * Get conditions with specific SNP
 */
export function getConditionsBySNP(rsid: string): CarrierCondition[] {
  return CARRIER_CONDITIONS.filter(c => 
    c.associatedSNPs.includes(rsid)
  );
}

/**
 * Get conditions by severity
 */
export function getConditionsBySeverity(severity: 'critical' | 'high' | 'moderate' | 'low'): CarrierCondition[] {
  return CARRIER_CONDITIONS.filter(c => c.severity === severity);
}

/**
 * Get database statistics
 */
export function getCarrierDatabaseStats(): {
  totalConditions: number;
  byCategory: Record<string, number>;
  byInheritance: Record<string, number>;
  bySeverity: Record<string, number>;
  totalSNPs: number;
} {
  const byCategory: Record<string, number> = {};
  const byInheritance: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  
  CARRIER_CONDITIONS.forEach(c => {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    byInheritance[c.inheritance] = (byInheritance[c.inheritance] || 0) + 1;
    bySeverity[c.severity] = (bySeverity[c.severity] || 0) + 1;
  });

  const totalSNPs = new Set(CARRIER_CONDITIONS.flatMap(c => c.associatedSNPs)).size;

  return {
    totalConditions: CARRIER_CONDITIONS.length,
    byCategory,
    byInheritance,
    bySeverity,
    totalSNPs,
  };
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(CARRIER_CONDITIONS.map(c => c.category)));
}

/**
 * Get all genes
 */
export function getAllGenes(): string[] {
  return Array.from(new Set(CARRIER_CONDITIONS.map(c => c.gene)));
}

/**
 * Search conditions
 */
export function searchConditions(query: string): CarrierCondition[] {
  const lowerQuery = query.toLowerCase();
  return CARRIER_CONDITIONS.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.gene.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery) ||
    c.category.toLowerCase().includes(lowerQuery) ||
    c.symptoms.some(s => s.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Medical disclaimer
 */
export const CARRIER_DISCLAIMER = `
IMPORTANT MEDICAL DISCLAIMER:

This carrier screening analysis is provided for educational and informational purposes only. 
It is NOT a substitute for professional medical advice, diagnosis, or treatment.

Key Points:
- Always consult with a qualified healthcare provider or genetic counselor about your results
- This analysis may not detect all disease-causing variants
- A negative result does not completely eliminate the risk of being a carrier
- The absence of a variant does not guarantee a healthy child
- Population-specific variants may not be included in this analysis
- Laboratory confirmation is recommended for any positive findings before making reproductive decisions

If you receive a positive carrier result:
1. Do not panic - being a carrier is common and usually does not affect your health
2. Speak with a genetic counselor about your results
3. Consider partner testing if planning a family
4. Discuss reproductive options with your healthcare provider

For urgent concerns, contact your healthcare provider immediately.
`;

// Export for debugging
console.log('Carrier Conditions Database loaded:', {
  totalConditions: CARRIER_CONDITIONS.length,
  categories: getAllCategories().length,
  genes: getAllGenes().length,
});
