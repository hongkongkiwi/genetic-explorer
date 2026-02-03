/**
 * Haplogroup Data
 * 
 * Y-DNA and mtDNA haplogroup definitions, defining SNPs/variants,
 * and functions for haplogroup determination.
 * 
 * Sources: ISOGG Y-DNA Tree, PhyloTree for mtDNA, YFull, FTDNA
 */

import type { YHaplogroupDefinition, MtHaplogroupDefinition, YHaplogroupResult, MtHaplogroupResult } from '~/types/ancestry';
import type { SNP } from '~/types/genetics';

// ============================================================================
// Y-DNA HAPLOGROUP DEFINITIONS - MAJOR GROUPS
// ============================================================================

export const Y_HAPLOGROUPS: Record<string, YHaplogroupDefinition> = {
  'A': {
    haplogroup: 'A',
    parent: 'Y-Root',
    definingSnps: ['M91', 'P97'],
    origin: 'Africa',
    timeEstimate: '275,000 - 200,000 years ago',
    description: 'The most basal haplogroup in the Y-chromosome tree, found primarily in Africa.',
  },
  'B': {
    haplogroup: 'B',
    parent: 'Y-Root',
    definingSnps: ['M60', 'M181', 'P85', 'P90'],
    origin: 'Africa',
    timeEstimate: '150,000 - 100,000 years ago',
    description: 'Found primarily in Central and West Africa, particularly among Pygmy populations.',
  },
  'CT': {
    haplogroup: 'CT',
    parent: 'Y-Root',
    definingSnps: ['M168', 'M294', 'P9.1'],
    origin: 'Africa',
    timeEstimate: '100,000 - 70,000 years ago',
    description: 'The common ancestor of all non-African Y-chromosomes and many African lineages.',
  },
  'CF': {
    haplogroup: 'CF',
    parent: 'CT',
    definingSnps: ['P143'],
    origin: 'Middle East/Asia',
    timeEstimate: '70,000 - 60,000 years ago',
    description: 'Ancestral to most Eurasian and Oceanian Y-chromosomes.',
  },
  'DE': {
    haplogroup: 'DE',
    parent: 'CT',
    definingSnps: ['M1', 'YAP', 'M145', 'M203'],
    origin: 'Africa/Asia',
    timeEstimate: '70,000 - 65,000 years ago',
    description: 'Unusual distribution with D in Asia and E in Africa.',
  },
  'D': {
    haplogroup: 'D',
    parent: 'DE',
    definingSnps: ['M174', 'IMS-JST021355', 'PAGES00003'],
    origin: 'Asia',
    timeEstimate: '60,000 - 50,000 years ago',
    description: 'Found at high frequencies in Tibet, Japan, and the Andaman Islands.',
  },
  'D1': {
    haplogroup: 'D1',
    parent: 'D',
    definingSnps: ['M15'],
    origin: 'Tibet/China',
    timeEstimate: '30,000 years ago',
    description: 'Found primarily in Tibet and surrounding regions.',
  },
  'D2': {
    haplogroup: 'D2',
    parent: 'D',
    definingSnps: ['M55', 'M57', 'M64.1', 'M179', 'P12', 'P37.1', 'P41.1'],
    origin: 'Japan',
    timeEstimate: '20,000 years ago',
    description: 'Found almost exclusively in Japan, particularly among Ainu and Ryukyuan populations.',
  },
  'E': {
    haplogroup: 'E',
    parent: 'DE',
    definingSnps: ['M40', 'M96', 'P29', 'L542'],
    origin: 'Africa',
    timeEstimate: '65,000 - 55,000 years ago',
    description: 'The most common haplogroup in Africa, also found in the Middle East and Europe.',
  },
  'E1': {
    haplogroup: 'E1',
    parent: 'E',
    definingSnps: ['P147', 'P150'],
    origin: 'Africa',
    timeEstimate: '50,000 years ago',
    description: 'Major branch of E found throughout Africa.',
  },
  'E1a': {
    haplogroup: 'E1a',
    parent: 'E1',
    definingSnps: ['M33', 'M132'],
    origin: 'West Africa',
    timeEstimate: '25,000 years ago',
    description: 'Found in West Africa and among African diaspora populations.',
  },
  'E1b': {
    haplogroup: 'E1b',
    parent: 'E1',
    definingSnps: ['P177', 'P2', 'DYS391p'],
    origin: 'East Africa',
    timeEstimate: '45,000 years ago',
    description: 'The most widespread branch of E, found across Africa and into Europe and the Middle East.',
  },
  'E1b1': {
    haplogroup: 'E1b1',
    parent: 'E1b',
    definingSnps: ['P58', 'P179', 'PF2025'],
    origin: 'East Africa/Middle East',
    timeEstimate: '25,000 years ago',
    description: 'Ancestor of major E1b1a and E1b1b branches.',
  },
  'E1b1a': {
    haplogroup: 'E1b1a',
    parent: 'E1b1',
    definingSnps: ['M2', 'M180', 'DYS271', 'P1', 'P189', 'P293', 'V43', 'V95'],
    origin: 'West Africa',
    timeEstimate: '20,000 - 15,000 years ago',
    description: 'The most common haplogroup among Bantu-speaking populations and African Americans.',
  },
  'E1b1a1': {
    haplogroup: 'E1b1a1',
    parent: 'E1b1a',
    definingSnps: ['M180', 'M200', 'P88'],
    origin: 'West Africa',
    timeEstimate: '15,000 years ago',
    description: 'Major subclade of E1b1a with wide distribution in sub-Saharan Africa.',
  },
  'E1b1b': {
    haplogroup: 'E1b1b',
    parent: 'E1b',
    definingSnps: ['M215', 'P2', 'M35', 'M281', 'V6', 'V42', 'V92', 'L341'],
    origin: 'East Africa',
    timeEstimate: '25,000 years ago',
    description: 'Found in East Africa, North Africa, the Middle East, and Mediterranean Europe.',
  },
  'E1b1b1': {
    haplogroup: 'E1b1b1',
    parent: 'E1b1b',
    definingSnps: ['M35'],
    origin: 'North Africa/Horn of Africa',
    timeEstimate: '20,000 years ago',
    description: 'Ancestor of many important North African and Mediterranean lineages.',
  },
  'E1b1b1a': {
    haplogroup: 'E1b1b1a',
    parent: 'E1b1b1',
    definingSnps: ['M78', 'V12', 'V13', 'V22', 'V32', 'V68'],
    origin: 'North Africa/Nile Valley',
    timeEstimate: '15,000 years ago',
    description: 'Associated with the spread of agriculture from the Near East into Europe and North Africa.',
  },
  'E1b1b1a1': {
    haplogroup: 'E1b1b1a1',
    parent: 'E1b1b1a',
    definingSnps: ['V12'],
    origin: 'North Africa',
    timeEstimate: '10,000 years ago',
    description: 'Found primarily in North Africa, especially among Afro-Asiatic speakers.',
  },
  'E1b1b1a2': {
    haplogroup: 'E1b1b1a2',
    parent: 'E1b1b1a',
    definingSnps: ['V13', 'V36'],
    origin: 'Balkans/Southern Europe',
    timeEstimate: '8,000 - 5,000 years ago',
    description: 'The most common haplogroup in the Balkans, associated with Neolithic expansion into Europe.',
  },
  'E1b1b1a3': {
    haplogroup: 'E1b1b1a3',
    parent: 'E1b1b1a',
    definingSnps: ['V22'],
    origin: 'Egypt/Nile Valley',
    timeEstimate: '10,000 years ago',
    description: 'Found at high frequency in Egypt and among Afro-Asiatic speakers.',
  },
  'E1b1b1b': {
    haplogroup: 'E1b1b1b',
    parent: 'E1b1b1',
    definingSnps: ['M81', 'M107', 'M165', 'M183', 'P58'],
    origin: 'North Africa',
    timeEstimate: '10,000 years ago',
    description: 'Dominant haplogroup among Berber populations and throughout North Africa.',
  },
  'E1b1b1c': {
    haplogroup: 'E1b1b1c',
    parent: 'E1b1b1',
    definingSnps: ['M123', 'M34', 'V65', 'V2713'],
    origin: 'Middle East',
    timeEstimate: '15,000 years ago',
    description: 'Found in the Middle East, Ethiopia, and among Jewish populations.',
  },
  'E2': {
    haplogroup: 'E2',
    parent: 'E',
    definingSnps: ['M75', 'L677', 'L837'],
    origin: 'East Africa',
    timeEstimate: '30,000 years ago',
    description: 'Found primarily in East and South Africa.',
  },
  'C': {
    haplogroup: 'C',
    parent: 'CF',
    definingSnps: ['M130', 'M216', 'P184', 'P255', 'P260', 'PK2'],
    origin: 'Central/South Asia',
    timeEstimate: '60,000 - 50,000 years ago',
    description: 'Found throughout Asia, the Americas, and Oceania. Associated with early coastal migration.',
  },
  'C1': {
    haplogroup: 'C1',
    parent: 'C',
    definingSnps: ['M105', 'M163', 'M210'],
    origin: 'Oceania',
    timeEstimate: '40,000 years ago',
    description: 'Found in New Guinea, Melanesia, and Polynesia.',
  },
  'C2': {
    haplogroup: 'C2',
    parent: 'C',
    definingSnps: ['M217', 'P44', 'PK4'],
    origin: 'Central Asia/Siberia',
    timeEstimate: '35,000 years ago',
    description: 'Widely distributed from Europe to the Americas, particularly common among indigenous Siberians and Native Americans.',
  },
  'C2a': {
    haplogroup: 'C2a',
    parent: 'C2',
    definingSnps: ['M48', 'M77', 'M86'],
    origin: 'Siberia',
    timeEstimate: '15,000 years ago',
    description: 'Common among Turkic and Mongolian populations.',
  },
  'C2b': {
    haplogroup: 'C2b',
    parent: 'C2',
    definingSnps: ['M401', 'P39', 'P56'],
    origin: 'Beringia/Americas',
    timeEstimate: '15,000 years ago',
    description: 'Found in indigenous North American populations, particularly Na-Dene speakers.',
  },
  'C3': {
    haplogroup: 'C3',
    parent: 'C',
    definingSnps: ['M93', 'M208'],
    origin: 'Oceania',
    timeEstimate: '35,000 years ago',
    description: 'Found in Polynesia and New Zealand Maori.',
  },
  'C4': {
    haplogroup: 'C4',
    parent: 'C',
    definingSnps: ['M347', 'M210'],
    origin: 'Australia',
    timeEstimate: '40,000 years ago',
    description: 'Found among Australian Aboriginal peoples.',
  },
  'C5': {
    haplogroup: 'C5',
    parent: 'C',
    definingSnps: ['M356', 'P92', 'P93'],
    origin: 'South Asia',
    timeEstimate: '30,000 years ago',
    description: 'Found in India and the Middle East.',
  },
  'F': {
    haplogroup: 'F',
    parent: 'CF',
    definingSnps: ['M89', 'M213', 'P14', 'P133', 'P135', 'P136', 'P138', 'P292'],
    origin: 'South Asia/Middle East',
    timeEstimate: '55,000 - 45,000 years ago',
    description: 'Ancestral to haplogroups G through T, representing the majority of non-African Y-chromosomes.',
  },
  'G': {
    haplogroup: 'G',
    parent: 'F',
    definingSnps: ['M201', 'P257', 'L116', 'L154', 'L204', 'L240', 'L269', 'L294', 'L402'],
    origin: 'Middle East/Caucasus',
    timeEstimate: '20,000 - 15,000 years ago',
    description: 'Associated with the Neolithic expansion from the Middle East into Europe. Common in the Caucasus.',
  },
  'G1': {
    haplogroup: 'G1',
    parent: 'G',
    definingSnps: ['M285', 'M342', 'L201', 'L202', 'L203'],
    origin: 'Iran/Central Asia',
    timeEstimate: '15,000 years ago',
    description: 'Found primarily in Iran and surrounding regions.',
  },
  'G2': {
    haplogroup: 'G2',
    parent: 'G',
    definingSnps: ['P287', 'M377', 'M283'],
    origin: 'Caucasus/Middle East',
    timeEstimate: '18,000 years ago',
    description: 'The most common branch of G, particularly prevalent in the Caucasus.',
  },
  'G2a': {
    haplogroup: 'G2a',
    parent: 'G2',
    definingSnps: ['P15', 'P16', 'P18', 'P20', 'M485', 'M406', 'L14', 'L23', 'L293', 'L314'],
    origin: 'Anatolia/Caucasus',
    timeEstimate: '15,000 years ago',
    description: 'Strongly associated with the spread of agriculture into Europe. Found in ancient European farmer remains.',
  },
  'H': {
    haplogroup: 'H',
    parent: 'F',
    definingSnps: ['M69', 'M370', 'P254', 'P257', 'P316'],
    origin: 'South Asia',
    timeEstimate: '35,000 - 25,000 years ago',
    description: 'Found primarily in the Indian subcontinent, particularly among Dravidian speakers.',
  },
  'H1': {
    haplogroup: 'H1',
    parent: 'H',
    definingSnps: ['M82', 'M285', 'M365'],
    origin: 'India',
    timeEstimate: '15,000 years ago',
    description: 'Common among Roma (Gypsy) populations and throughout India.',
  },
  'I': {
    haplogroup: 'I',
    parent: 'F',
    definingSnps: ['M170', 'M258', 'P19', 'P38', 'P212', 'U179'],
    origin: 'Europe/Southwest Asia',
    timeEstimate: '30,000 - 25,000 years ago',
    description: 'The only major haplogroup born in Europe, associated with the Gravettian culture and post-glacial expansion.',
  },
  'I1': {
    haplogroup: 'I1',
    parent: 'I',
    definingSnps: ['M253', 'M307', 'P30', 'P40', 'M450', 'S108', 'S111'],
    origin: 'Scandinavia/Northern Europe',
    timeEstimate: '15,000 - 5,000 years ago',
    description: 'Associated with Scandinavian and Germanic peoples. Expanded dramatically during the Viking Age.',
  },
  'I2': {
    haplogroup: 'I2',
    parent: 'I',
    definingSnps: ['M438', 'P215', 'P37.2', 'P41.2', 'P214', 'L35', 'L37', 'L40'],
    origin: 'Southeast Europe',
    timeEstimate: '20,000 years ago',
    description: 'Widely distributed across Europe, particularly in the Balkans and Sardinia.',
  },
  'I2a': {
    haplogroup: 'I2a',
    parent: 'I2',
    definingSnps: ['M423', 'P37.2', 'L147.2', 'L158', 'L178', 'L460'],
    origin: 'Balkans/Eastern Europe',
    timeEstimate: '15,000 years ago',
    description: 'Very common in the Balkans, associated with Slavic expansion.',
  },
  'I2a1': {
    haplogroup: 'I2a1',
    parent: 'I2a',
    definingSnps: ['M26', 'L160', 'L247'],
    origin: 'Sardinia/Western Mediterranean',
    timeEstimate: '10,000 years ago',
    description: 'Found at very high frequency in Sardinia (40%).',
  },
  'I2a2': {
    haplogroup: 'I2a2',
    parent: 'I2a',
    definingSnps: ['M423', 'L178', 'L161.1', 'L621'],
    origin: 'Eastern Europe',
    timeEstimate: '10,000 years ago',
    description: 'Common among Slavic populations, particularly in the Balkans.',
  },
  'I2b': {
    haplogroup: 'I2b',
    parent: 'I2',
    definingSnps: ['M223', 'M284', 'P78', 'P95', 'L801'],
    origin: 'Central Europe',
    timeEstimate: '12,000 years ago',
    description: 'Found in Germany, the Low Countries, and Britain.',
  },
  'J': {
    haplogroup: 'J',
    parent: 'F',
    definingSnps: ['M304', 'M267', 'M365', 'M368', 'M369', 'P209', 'P279', 'L134'],
    origin: 'Middle East',
    timeEstimate: '30,000 - 25,000 years ago',
    description: 'Associated with the early settlement of the Middle East and subsequent Neolithic expansion.',
  },
  'J1': {
    haplogroup: 'J1',
    parent: 'J',
    definingSnps: ['M267', 'P58', 'M365', 'M367', 'M368', 'M369', 'L136', 'L222', 'L840'],
    origin: 'Middle East',
    timeEstimate: '15,000 - 10,000 years ago',
    description: 'Associated with Semitic languages and pastoral nomadism in the Middle East. Common among Arab populations and Jews.',
  },
  'J2': {
    haplogroup: 'J2',
    parent: 'J',
    definingSnps: ['M172', 'M410', 'L26', 'L27', 'M47', 'M67', 'M92', 'M137'],
    origin: 'Fertile Crescent',
    timeEstimate: '20,000 - 15,000 years ago',
    description: 'Associated with the spread of agriculture from the Fertile Crescent into Europe, Central Asia, and South Asia.',
  },
  'J2a': {
    haplogroup: 'J2a',
    parent: 'J2',
    definingSnps: ['M410', 'L26', 'L27', 'M47', 'M92', 'M67', 'M68', 'M137'],
    origin: 'Anatolia/Levant',
    timeEstimate: '15,000 years ago',
    description: 'The most common branch of J2, found throughout the Mediterranean, Middle East, and South Asia.',
  },
  'J2b': {
    haplogroup: 'J2b',
    parent: 'J2',
    definingSnps: ['M12', 'M102', 'M221', 'M314', 'M365', 'M390', 'M391', 'L228', 'L229', 'L283'],
    origin: 'Balkans/Middle East',
    timeEstimate: '12,000 years ago',
    description: 'Found in the Balkans, Italy, and South Asia (especially among certain Brahmin groups).',
  },
  'K': {
    haplogroup: 'K',
    parent: 'F',
    definingSnps: ['M9', 'M526', 'P128', 'P131', 'P132', 'P133', 'P134'],
    origin: 'South Asia/Middle East',
    timeEstimate: '50,000 - 40,000 years ago',
    description: 'Ancestral to haplogroups L through T and the major K subclades found in Oceania and the Americas.',
  },
  'L': {
    haplogroup: 'L',
    parent: 'K',
    definingSnps: ['M11', 'M20', 'M22', 'M61', 'M185', 'M295', 'M27', 'M76', 'M317'],
    origin: 'South Asia',
    timeEstimate: '30,000 - 25,000 years ago',
    description: 'Found primarily in South Asia, particularly among Dravidian speakers.',
  },
  'N': {
    haplogroup: 'N',
    parent: 'K',
    definingSnps: ['M231', 'LLY22g', 'P189', 'P198', 'P202', 'P204', 'P206'],
    origin: 'East Asia',
    timeEstimate: '25,000 - 20,000 years ago',
    description: 'Found at high frequencies in northern Eurasia, particularly among Uralic speakers.',
  },
  'N1c': {
    haplogroup: 'N1c',
    parent: 'N',
    definingSnps: ['M46', 'Tat', 'P105'],
    origin: 'Siberia',
    timeEstimate: '12,000 years ago',
    description: 'Very common among Uralic peoples, Latvians, and Lithuanians.',
  },
  'O': {
    haplogroup: 'O',
    parent: 'K',
    definingSnps: ['M175', 'M119', 'M122', 'M134', 'M268', 'P191', 'P196', 'P198'],
    origin: 'East Asia',
    timeEstimate: '30,000 - 25,000 years ago',
    description: 'The dominant haplogroup in East Asia, Southeast Asia, and the Pacific.',
  },
  'O1': {
    haplogroup: 'O1',
    parent: 'O',
    definingSnps: ['M119', 'M101', 'M307', 'P31', 'P32', 'P203'],
    origin: 'East Asia',
    timeEstimate: '20,000 years ago',
    description: 'Found in southern China, Taiwan, and Southeast Asia. Associated with Austronesian expansion.',
  },
  'O2': {
    haplogroup: 'O2',
    parent: 'O',
    definingSnps: ['M122', 'M188', 'M324', 'P197', 'P198', 'P201', 'P202'],
    origin: 'China',
    timeEstimate: '25,000 years ago',
    description: 'The most common haplogroup in China, accounting for 50-60% of Han Chinese Y-chromosomes.',
  },
  'O2a': {
    haplogroup: 'O2a',
    parent: 'O2',
    definingSnps: ['M324', 'M110', 'M134', 'M154', 'M161', 'M164', 'M7', 'M113', 'M117'],
    origin: 'China',
    timeEstimate: '20,000 years ago',
    description: 'The most common branch of O2, particularly prevalent in Han Chinese.',
  },
  'O2b': {
    haplogroup: 'O2b',
    parent: 'O2',
    definingSnps: ['M176', 'M268', 'P49', 'P164'],
    origin: 'Korean Peninsula/Japan',
    timeEstimate: '15,000 years ago',
    description: 'Found primarily in Korea and Japan.',
  },
  'Q': {
    haplogroup: 'Q',
    parent: 'K',
    definingSnps: ['M242', 'M346', 'M378', 'P36.1', 'P55', 'MEH2', 'M323', 'L53', 'L54'],
    origin: 'Central Asia/Siberia',
    timeEstimate: '20,000 - 15,000 years ago',
    description: 'Associated with the migration of humans into the Americas and found at moderate frequency in Central Asia and the Middle East.',
  },
  'Q1': {
    haplogroup: 'Q1',
    parent: 'Q',
    definingSnps: ['M346', 'F1096'],
    origin: 'Central Asia',
    timeEstimate: '15,000 years ago',
    description: 'The major branch of Q found in the Americas and Eurasia.',
  },
  'Q1a': {
    haplogroup: 'Q1a',
    parent: 'Q1',
    definingSnps: ['M378', 'MEH2', 'M3', 'L53', 'L54'],
    origin: 'Siberia',
    timeEstimate: '15,000 years ago',
    description: 'Ancestor of Native American Q lineages and Central Asian branches.',
  },
  'Q1a1': {
    haplogroup: 'Q1a1',
    parent: 'Q1a',
    definingSnps: ['M3', 'M19', 'M194', 'M199', 'L213', 'L268'],
    origin: 'Beringia',
    timeEstimate: '15,000 - 10,000 years ago',
    description: 'The dominant Native American Y-chromosome haplogroup, carried by the first Americans.',
  },
  'R': {
    haplogroup: 'R',
    parent: 'K',
    definingSnps: ['M207', 'M306', 'P224', 'P227', 'P229', 'P232', 'P280'],
    origin: 'Central Asia/Siberia',
    timeEstimate: '28,000 - 25,000 years ago',
    description: 'One of the most widespread haplogroups, dominant in Europe and South Asia.',
  },
  'R1': {
    haplogroup: 'R1',
    parent: 'R',
    definingSnps: ['M173', 'M306', 'S1', 'S4', 'S8', 'S9', 'L135'],
    origin: 'Central Asia',
    timeEstimate: '25,000 years ago',
    description: 'Ancestor of R1a and R1b, the dominant haplogroups in Europe and South Asia.',
  },
  'R1a': {
    haplogroup: 'R1a',
    parent: 'R1',
    definingSnps: ['M420', 'M449', 'M511', 'M513', 'SRY10831.2', 'M17', 'M198'],
    origin: 'Eastern Europe/Central Asia',
    timeEstimate: '20,000 - 15,000 years ago',
    description: 'Associated with the expansion of Indo-European languages into Europe and South Asia.',
  },
  'R1a1': {
    haplogroup: 'R1a1',
    parent: 'R1a',
    definingSnps: ['M17', 'M198', 'M514', 'M515', 'M516', 'L168', 'L449'],
    origin: 'Eastern Europe',
    timeEstimate: '12,000 years ago',
    description: 'The most common subclade of R1a, associated with Corded Ware culture and Indo-European expansion.',
  },
  'R1b': {
    haplogroup: 'R1b',
    parent: 'R1',
    definingSnps: ['M343', 'M415', 'P25', 'P297', 'V88', 'L278', 'L389'],
    origin: 'Central Asia/Eastern Europe',
    timeEstimate: '20,000 - 18,000 years ago',
    description: 'The most common haplogroup in Western Europe, also found in Central Asia, the Middle East, and Africa.',
  },
  'R1b1': {
    haplogroup: 'R1b1',
    parent: 'R1b',
    definingSnps: ['P297', 'L278', 'L389', 'V88', 'M73'],
    origin: 'Eastern Europe',
    timeEstimate: '15,000 years ago',
    description: 'Ancestor of European and Asian R1b branches.',
  },
  'R1b1a': {
    haplogroup: 'R1b1a',
    parent: 'R1b1',
    definingSnps: ['L754', 'L389', 'V1636', 'P297'],
    origin: 'Eastern Europe',
    timeEstimate: '12,000 years ago',
    description: 'Includes the European R1b lineage and some Middle Eastern branches.',
  },
  'R1b1a2': {
    haplogroup: 'R1b1a2',
    parent: 'R1b1a',
    definingSnps: ['P297', 'M269', 'L23', 'PF6323', 'PF6434', 'CTS7822'],
    origin: 'Eastern Europe/Western Asia',
    timeEstimate: '10,000 - 8,000 years ago',
    description: 'The ancestor of most European R1b. Found in ancient Yamnaya and Bell Beaker remains.',
  },
  'R1b1a2a': {
    haplogroup: 'R1b1a2a',
    parent: 'R1b1a2',
    definingSnps: ['L23', 'Z2103', 'Z2104', 'Z2105'],
    origin: 'Pontic-Caspian Steppe',
    timeEstimate: '7,000 years ago',
    description: 'Found in the Balkans, Anatolia, and Central Asia. Associated with early Indo-European dispersals.',
  },
  'R1b1a2a1': {
    haplogroup: 'R1b1a2a1',
    parent: 'R1b1a2a',
    definingSnps: ['Z2103', 'Z2104', 'Z2105', 'CTS7556', 'CTS7822'],
    origin: 'Pontic-Caspian Steppe',
    timeEstimate: '6,000 years ago',
    description: 'Found in the Balkans, Anatolia, Armenia, and among Ashkenazi Jews.',
  },
  'R1b1a2b': {
    haplogroup: 'R1b1a2b',
    parent: 'R1b1a2',
    definingSnps: ['L51', 'L52', 'L151', 'PF6546', 'PF6547', 'PF6548'],
    origin: 'Eastern Europe',
    timeEstimate: '6,500 years ago',
    description: 'The ancestor of Western European R1b, associated with the Bell Beaker culture.',
  },
  'R1b1a2b1': {
    haplogroup: 'R1b1a2b1',
    parent: 'R1b1a2b',
    definingSnps: ['L151', 'P310', 'P311', 'L11', 'U106', 'P312'],
    origin: 'Central Europe',
    timeEstimate: '5,000 years ago',
    description: 'The ancestor of the major Western European R1b subclades.',
  },
  'R1b1a2b1a': {
    haplogroup: 'R1b1a2b1a',
    parent: 'R1b1a2b1',
    definingSnps: ['U106', 'S21', 'Z2265'],
    origin: 'Central Europe',
    timeEstimate: '4,500 years ago',
    description: 'Common in Germanic-speaking populations of Northern Europe. Associated with Anglo-Saxon and Viking migrations.',
  },
  'R1b1a2b1b': {
    haplogroup: 'R1b1a2b1b',
    parent: 'R1b1a2b1',
    definingSnps: ['P312', 'S116', 'DF19', 'DF99', 'L238'],
    origin: 'Western Europe',
    timeEstimate: '4,500 years ago',
    description: 'The most common branch of R1b in Western and Southern Europe, associated with the Bell Beaker expansion.',
  },
  'R1b1a2b1b1': {
    haplogroup: 'R1b1a2b1b1',
    parent: 'R1b1a2b1b',
    definingSnps: ['DF27', 'S250', 'Z195'],
    origin: 'Western Europe (Iberia/France)',
    timeEstimate: '4,000 years ago',
    description: 'Common in Iberia, France, and Britain. Associated with Celtic and Iberian populations.',
  },
  'R1b1a2b1b2': {
    haplogroup: 'R1b1a2b1b2',
    parent: 'R1b1a2b1b',
    definingSnps: ['U152', 'S28', 'PF6500'],
    origin: 'Alpine Region',
    timeEstimate: '4,000 years ago',
    description: 'Common in Northern Italy, Switzerland, and among Celtic populations.',
  },
  'R1b1a2b1b3': {
    haplogroup: 'R1b1a2b1b3',
    parent: 'R1b1a2b1b',
    definingSnps: ['L21', 'M529', 'S145', 'DF13'],
    origin: 'Northwest Europe',
    timeEstimate: '4,000 years ago',
    description: 'The Atlantic Celtic haplogroup, dominant in Ireland, Scotland, Wales, and Brittany.',
  },
  'R1b1a2b1b4': {
    haplogroup: 'R1b1a2b1b4',
    parent: 'R1b1a2b1b',
    definingSnps: ['DF19', 'S232'],
    origin: 'Northwest Europe',
    timeEstimate: '3,500 years ago',
    description: 'Found primarily in the Low Countries, Britain, and Scandinavia.',
  },
  'R1b1b': {
    haplogroup: 'R1b1b',
    parent: 'R1b1',
    definingSnps: ['V88', 'M18', 'V35', 'V7', 'V8', 'V51', 'V59', 'V65'],
    origin: 'Middle East/Central Asia',
    timeEstimate: '10,000 years ago',
    description: 'Found in the Levant, North Africa, and Central Africa. Associated with Chadic-speaking peoples.',
  },
  'R1b2': {
    haplogroup: 'R1b2',
    parent: 'R1b',
    definingSnps: ['PH155', 'M73', 'M478'],
    origin: 'Central Asia',
    timeEstimate: '12,000 years ago',
    description: 'Found in Central Asia, particularly among Turkic-speaking populations.',
  },
  'R2': {
    haplogroup: 'R2',
    parent: 'R',
    definingSnps: ['M124', 'M450', 'M530', 'M534', 'P249', 'P267', 'P268'],
    origin: 'South Asia/Central Asia',
    timeEstimate: '25,000 - 20,000 years ago',
    description: 'Found primarily in South Asia (India, Pakistan) and Central Asia.',
  },
  'T': {
    haplogroup: 'T',
    parent: 'F',
    definingSnps: ['M70', 'M193', 'M272', 'P77', 'P78', 'P321', 'L131', 'L162', 'L208'],
    origin: 'Middle East/Northeast Africa',
    timeEstimate: '20,000 - 15,000 years ago',
    description: 'Found in the Middle East, East Africa, the Mediterranean, and at low frequency throughout Europe.',
  },
  'T1': {
    haplogroup: 'T1',
    parent: 'T',
    definingSnps: ['M70', 'P77', 'P78', 'P321', 'L131', 'L162', 'L208'],
    origin: 'Middle East',
    timeEstimate: '15,000 years ago',
    description: 'The most common branch of T.',
  },
  'T1a': {
    haplogroup: 'T1a',
    parent: 'T1',
    definingSnps: ['M70', 'L131', 'L162', 'L208', 'L446', 'L447'],
    origin: 'Middle East',
    timeEstimate: '12,000 years ago',
    description: 'Found throughout the Middle East, Mediterranean, and Europe.',
  },
};


// ============================================================================
// mtDNA HAPLOGROUP DEFINITIONS (PhyloTree Build 17)
// ============================================================================

export const MT_HAPLOGROUPS: Record<string, MtHaplogroupDefinition> = {
  'L': {
    haplogroup: 'L',
    parent: 'mt-MRCA',
    definingVariants: ['G769A', 'A1018G', 'C182T', 'T3594C', 'G2758A'],
    positions: [769, 1018, 182, 3594, 2758],
    origin: 'Africa',
    timeEstimate: '150,000 - 100,000 years ago',
    description: 'The root of the human mitochondrial DNA tree, found only in Africa.',
  },
  'L0': {
    haplogroup: 'L0',
    parent: 'L',
    definingVariants: ['C1048T', 'G1319A', 'T3594C', 'T7256C', 'C12771T'],
    positions: [1048, 1319, 3594, 7256, 12771],
    origin: 'Southern and Eastern Africa',
    timeEstimate: '130,000 years ago',
    description: 'The most basal mtDNA haplogroup, found primarily among Khoisan peoples of Southern Africa.',
  },
  'L1': {
    haplogroup: 'L1',
    parent: 'L',
    definingVariants: ['G3666A', 'T7055C', 'T7389C', 'C7915T', 'T8251C'],
    positions: [3666, 7055, 7389, 7915, 8251],
    origin: 'Central Africa',
    timeEstimate: '130,000 years ago',
    description: 'Found primarily among Pygmy populations and other Central African groups.',
  },
  'L2': {
    haplogroup: 'L2',
    parent: 'L',
    definingVariants: ['G16390A', 'A357G', 'A750G', 'T2285C', 'G2885A'],
    positions: [16390, 357, 750, 2285, 2885],
    origin: 'West Africa',
    timeEstimate: '80,000 - 70,000 years ago',
    description: 'The most common haplogroup among Bantu-speaking populations and African Americans.',
  },
  'L3': {
    haplogroup: 'L3',
    parent: 'L',
    definingVariants: ['A769G', 'A1018G', 'G2758A', 'C3594T', 'G4104A'],
    positions: [769, 1018, 2758, 3594, 4104],
    origin: 'East Africa',
    timeEstimate: '70,000 years ago',
    description: 'The ancestor of all non-African mtDNA haplogroups (M, N) and many African lineages.',
  },
  'M': {
    haplogroup: 'M',
    parent: 'L3',
    definingVariants: ['T489C', 'C10400T', 'G14783A', 'G15043A', 'T16249C'],
    positions: [489, 10400, 14783, 15043, 16249],
    origin: 'South Asia/Arabian Peninsula',
    timeEstimate: '60,000 years ago',
    description: 'One of the two major non-African haplogroups, found throughout Asia, Oceania, and the Americas.',
  },
  'C': {
    haplogroup: 'C',
    parent: 'M',
    definingVariants: ['G4883A', 'T489C', 'C10400T', 'G14783A', 'G15043A'],
    positions: [4883, 489, 10400, 14783, 15043],
    origin: 'East Asia',
    timeEstimate: '50,000 years ago',
    description: 'Found in East Asia, Siberia, and the Americas. Common among Native Americans.',
  },
  'C1': {
    haplogroup: 'C1',
    parent: 'C',
    definingVariants: ['T3552C', 'A5821G', 'C8414T', 'C16111T'],
    positions: [3552, 5821, 8414, 16111],
    origin: 'East Asia',
    timeEstimate: '25,000 years ago',
    description: 'Found in East Asia and the Americas.',
  },
  'C4': {
    haplogroup: 'C4',
    parent: 'C',
    definingVariants: ['T489C', 'G8418A', 'C10400T', 'G14783A', 'G15043A'],
    positions: [489, 8418, 10400, 14783, 15043],
    origin: 'Australia',
    timeEstimate: '40,000 years ago',
    description: 'Found among Australian Aboriginal peoples.',
  },
  'D': {
    haplogroup: 'D',
    parent: 'M',
    definingVariants: ['T489C', 'C5178a', 'C10400T', 'G14783A', 'G15043A'],
    positions: [489, 5178, 10400, 14783, 15043],
    origin: 'East Asia',
    timeEstimate: '50,000 years ago',
    description: 'Common in East Asia, Siberia, and the Americas.',
  },
  'D4': {
    haplogroup: 'D4',
    parent: 'D',
    definingVariants: ['C3010A', 'C8414T', 'C14668T'],
    positions: [3010, 8414, 14668],
    origin: 'East Asia',
    timeEstimate: '30,000 years ago',
    description: 'The most common branch of D, found throughout East Asia.',
  },
  'D5': {
    haplogroup: 'D5',
    parent: 'D',
    definingVariants: ['G709A', 'G5231A', 'G13928C', 'C16360T'],
    positions: [709, 5231, 13928, 16360],
    origin: 'East Asia',
    timeEstimate: '25,000 years ago',
    description: 'Found in East and Southeast Asia.',
  },
  'E': {
    haplogroup: 'E',
    parent: 'M',
    definingVariants: ['G3027A', 'T489C', 'G7598A', 'C10400T', 'G14783A'],
    positions: [3027, 489, 7598, 10400, 14783],
    origin: 'Southeast Asia',
    timeEstimate: '35,000 years ago',
    description: 'Found in Southeast Asia and Oceania.',
  },
  'G': {
    haplogroup: 'G',
    parent: 'M',
    definingVariants: ['G4833A', 'T489C', 'G5252A', 'C10400T', 'G14783A'],
    positions: [4833, 489, 5252, 10400, 14783],
    origin: 'East Asia',
    timeEstimate: '35,000 years ago',
    description: 'Found in East Asia and Siberia.',
  },
  'Z': {
    haplogroup: 'Z',
    parent: 'M',
    definingVariants: ['T489C', 'G7598A', 'C10400T', 'G14783A', 'C16260T'],
    positions: [489, 7598, 10400, 14783, 16260],
    origin: 'Northeast Asia/Siberia',
    timeEstimate: '25,000 years ago',
    description: 'Found among Siberian populations and some Native Americans.',
  },
  'N': {
    haplogroup: 'N',
    parent: 'L3',
    definingVariants: ['G8701A', 'C9540T', 'G10398A', 'C10873T', 'A15301G'],
    positions: [8701, 9540, 10398, 10873, 15301],
    origin: 'East Africa/Arabian Peninsula',
    timeEstimate: '65,000 years ago',
    description: 'One of the two major non-African haplogroups, ancestral to most European and Near Eastern lineages.',
  },
  'A': {
    haplogroup: 'A',
    parent: 'N',
    definingVariants: ['C73T', 'A663G', 'A1736G', 'T4248C', 'C4824A'],
    positions: [73, 663, 1736, 4248, 4824],
    origin: 'Siberia/East Asia',
    timeEstimate: '30,000 years ago',
    description: 'Found in East Asia, Siberia, and the Americas. Common among Chukchi, Inuit, and some Native American groups.',
  },
  'I': {
    haplogroup: 'I',
    parent: 'N',
    definingVariants: ['G199C', 'T250C', 'G4529A', 'T10873C', 'C12763T'],
    positions: [199, 250, 4529, 10873, 12763],
    origin: 'Near East/Europe',
    timeEstimate: '25,000 years ago',
    description: 'Found in Europe, the Near East, and Central Asia.',
  },
  'I4': {
    haplogroup: 'I4',
    parent: 'I',
    definingVariants: ['A3796G', 'C8251T'],
    positions: [3796, 8251],
    origin: 'Europe',
    timeEstimate: '15,000 years ago',
    description: 'Found in Europe.',
  },
  'O': {
    haplogroup: 'O',
    parent: 'N',
    definingVariants: ['G8701A', 'G12950A', 'A15301G', 'G16320A'],
    positions: [8701, 12950, 15301, 16320],
    origin: 'East Asia',
    timeEstimate: '30,000 years ago',
    description: 'Found in East Asia.',
  },
  'S': {
    haplogroup: 'S',
    parent: 'N',
    definingVariants: ['G8701A', 'T10398C', 'C10873T', 'A15301G'],
    positions: [8701, 10398, 10873, 15301],
    origin: 'Australia/New Guinea',
    timeEstimate: '45,000 years ago',
    description: 'Found in Australia and New Guinea.',
  },
  'W': {
    haplogroup: 'W',
    parent: 'N',
    definingVariants: ['A189G', 'G8701A', 'C10873T', 'G15301A'],
    positions: [189, 8701, 10873, 15301],
    origin: 'Near East',
    timeEstimate: '25,000 years ago',
    description: 'Found in the Near East, Central Asia, and at low frequency in Europe.',
  },
  'X': {
    haplogroup: 'X',
    parent: 'N',
    definingVariants: ['G6221A', 'C6371T', 'G8701A', 'C10873T', 'A15301G'],
    positions: [6221, 6371, 8701, 10873, 15301],
    origin: 'West Eurasia',
    timeEstimate: '25,000 years ago',
    description: 'Found in Europe, the Near East, and North Africa. The only haplogroup besides A, B, C, and D found among Native Americans (X2a).',
  },
  'Y': {
    haplogroup: 'Y',
    parent: 'N',
    definingVariants: ['G8392A', 'G10398A', 'C14167T', 'A15301G'],
    positions: [8392, 10398, 14167, 15301],
    origin: 'Siberia',
    timeEstimate: '20,000 years ago',
    description: 'Found among Nivkh and Ainu peoples.',
  },
  'R': {
    haplogroup: 'R',
    parent: 'N',
    definingVariants: ['G12771C', 'T16223C'],
    positions: [12771, 16223],
    origin: 'Near East',
    timeEstimate: '60,000 years ago',
    description: 'The major ancestor of European and Near Eastern mtDNA lineages.',
  },
  'B': {
    haplogroup: 'B',
    parent: 'R',
    definingVariants: ['C8281d', 'T11187C', 'A13485G', 'T15625C', 'G16390A'],
    positions: [8281, 11187, 13485, 15625, 16390],
    origin: 'East Asia',
    timeEstimate: '40,000 years ago',
    description: 'Found in East Asia, Southeast Asia, the Pacific, and the Americas.',
  },
  'B2': {
    haplogroup: 'B2',
    parent: 'B',
    definingVariants: ['T11187C', 'C15452A', 'T15625C', 'G16390A'],
    positions: [11187, 15452, 15625, 16390],
    origin: 'Beringia/Americas',
    timeEstimate: '15,000 years ago',
    description: 'One of the five major Native American haplogroups.',
  },
  'F': {
    haplogroup: 'F',
    parent: 'R',
    definingVariants: ['A249d', 'C3970T', 'G13928C', 'G14769A', 'T16249C'],
    positions: [249, 3970, 13928, 14769, 16249],
    origin: 'Southeast Asia',
    timeEstimate: '40,000 years ago',
    description: 'Found in Southeast Asia and East Asia.',
  },
  'H': {
    haplogroup: 'H',
    parent: 'R',
    definingVariants: ['G2706A', 'T7028C'],
    positions: [2706, 7028],
    origin: 'Near East/Southwest Asia',
    timeEstimate: '25,000 - 20,000 years ago',
    description: 'The most common mtDNA haplogroup in Europe, found in about 40-50% of the population.',
  },
  'H1': {
    haplogroup: 'H1',
    parent: 'H',
    definingVariants: ['G3010A', 'G2706A', 'T7028C'],
    positions: [3010, 2706, 7028],
    origin: 'Europe',
    timeEstimate: '15,000 years ago',
    description: 'The most common subclade of H in Europe, particularly in Iberia.',
  },
  'H2': {
    haplogroup: 'H2',
    parent: 'H',
    definingVariants: ['G1438A', 'G2706A', 'T7028C'],
    positions: [1438, 2706, 7028],
    origin: 'Europe',
    timeEstimate: '15,000 years ago',
    description: 'Found in Europe and the Near East.',
  },
  'H3': {
    haplogroup: 'H3',
    parent: 'H',
    definingVariants: ['G6776A', 'G2706A', 'T7028C'],
    positions: [6776, 2706, 7028],
    origin: 'Iberia/Western Europe',
    timeEstimate: '12,000 years ago',
    description: 'Common in Western Europe, particularly in Portugal and Spain.',
  },
  'H4': {
    haplogroup: 'H4',
    parent: 'H',
    definingVariants: ['G3992A', 'G2706A', 'T7028C'],
    positions: [3992, 2706, 7028],
    origin: 'Europe',
    timeEstimate: '12,000 years ago',
    description: 'Found in Europe.',
  },
  'H5': {
    haplogroup: 'H5',
    parent: 'H',
    definingVariants: ['G456A', 'G2706A', 'T7028C'],
    positions: [456, 2706, 7028],
    origin: 'Near East/Europe',
    timeEstimate: '12,000 years ago',
    description: 'Found in Europe and the Near East.',
  },
  'H6': {
    haplogroup: 'H6',
    parent: 'H',
    definingVariants: ['G2395A', 'G2706A', 'T7028C'],
    positions: [2395, 2706, 7028],
    origin: 'Central Asia/Europe',
    timeEstimate: '12,000 years ago',
    description: 'Found in Central Asia and Eastern Europe.',
  },
  'H7': {
    haplogroup: 'H7',
    parent: 'H',
    definingVariants: ['C13194T', 'G2706A', 'T7028C'],
    positions: [13194, 2706, 7028],
    origin: 'Europe',
    timeEstimate: '10,000 years ago',
    description: 'Found in Europe.',
  },
  'H8': {
    haplogroup: 'H8',
    parent: 'H',
    definingVariants: ['T5336C', 'G2706A', 'T7028C'],
    positions: [5336, 2706, 7028],
    origin: 'Caucasus',
    timeEstimate: '12,000 years ago',
    description: 'Found in the Caucasus and Near East.',
  },
  'HV': {
    haplogroup: 'HV',
    parent: 'R',
    definingVariants: ['T14766C'],
    positions: [14766],
    origin: 'Near East',
    timeEstimate: '25,000 years ago',
    description: 'Ancestral to H and V, found in the Near East and Europe.',
  },
  'V': {
    haplogroup: 'V',
    parent: 'HV',
    definingVariants: ['G4580A', 'T14766C'],
    positions: [4580, 14766],
    origin: 'Iberia/North Africa',
    timeEstimate: '15,000 years ago',
    description: 'Found in Western Europe, North Africa, and the Near East.',
  },
  'J': {
    haplogroup: 'J',
    parent: 'R',
    definingVariants: ['C295T', 'A10398G', 'G13708A', 'C16069T', 'C16126T'],
    positions: [295, 10398, 13708, 16069, 16126],
    origin: 'Near East',
    timeEstimate: '30,000 years ago',
    description: 'Found in the Near East, Europe, and North Africa. Associated with the spread of agriculture.',
  },
  'J1': {
    haplogroup: 'J1',
    parent: 'J',
    definingVariants: ['T489C', 'C295T', 'A10398G', 'G13708A', 'C16069T', 'C16126T'],
    positions: [489, 295, 10398, 13708, 16069, 16126],
    origin: 'Near East',
    timeEstimate: '20,000 years ago',
    description: 'Found throughout Europe and the Near East.',
  },
  'J1c': {
    haplogroup: 'J1c',
    parent: 'J1',
    definingVariants: ['A4627G', 'C295T', 'A10398G', 'G13708A', 'C16069T', 'C16126T'],
    positions: [4627, 295, 10398, 13708, 16069, 16126],
    origin: 'Near East/Europe',
    timeEstimate: '12,000 years ago',
    description: 'The most common subclade of J1 in Europe.',
  },
  'J2': {
    haplogroup: 'J2',
    parent: 'J',
    definingVariants: ['G7476A', 'C295T', 'A10398G', 'G13708A', 'C16069T', 'C16126T'],
    positions: [7476, 295, 10398, 13708, 16069, 16126],
    origin: 'Near East',
    timeEstimate: '20,000 years ago',
    description: 'Found in the Near East and Mediterranean.',
  },
  'J2a': {
    haplogroup: 'J2a',
    parent: 'J2',
    definingVariants: ['G7476A', 'G13708A', 'C295T', 'A10398G', 'C16069T', 'C16126T'],
    positions: [7476, 13708, 295, 10398, 16069, 16126],
    origin: 'Mediterranean',
    timeEstimate: '12,000 years ago',
    description: 'Common in the Mediterranean region.',
  },
  'J2b': {
    haplogroup: 'J2b',
    parent: 'J2',
    definingVariants: ['G7476A', 'G15257A', 'C295T', 'A10398G', 'G13708A', 'C16069T', 'C16126T'],
    positions: [7476, 15257, 295, 10398, 13708, 16069, 16126],
    origin: 'Near East/Balkans',
    timeEstimate: '12,000 years ago',
    description: 'Found in the Balkans and Near East.',
  },
  'K': {
    haplogroup: 'K',
    parent: 'R',
    definingVariants: ['G16274A', 'G16291A'],
    positions: [16274, 16291],
    origin: 'Near East',
    timeEstimate: '25,000 years ago',
    description: 'Found in Europe, the Near East, and at low frequency throughout the world.',
  },
  'K1': {
    haplogroup: 'K1',
    parent: 'K',
    definingVariants: ['G16274A', 'G16291A', 'C497T'],
    positions: [16274, 16291, 497],
    origin: 'Europe',
    timeEstimate: '15,000 years ago',
    description: 'Found in Europe.',
  },
  'K1a': {
    haplogroup: 'K1a',
    parent: 'K1',
    definingVariants: ['C497T', 'G16274A', 'G16291A', 'G16524A'],
    positions: [497, 16274, 16291, 16524],
    origin: 'Europe',
    timeEstimate: '12,000 years ago',
    description: 'The most common subclade of K, found throughout Europe.',
  },
  'K2': {
    haplogroup: 'K2',
    parent: 'K',
    definingVariants: ['G16274A', 'G16291A', 'T195C'],
    positions: [16274, 16291, 195],
    origin: 'Near East',
    timeEstimate: '15,000 years ago',
    description: 'Found in Europe and the Near East.',
  },
  'K2a': {
    haplogroup: 'K2a',
    parent: 'K2',
    definingVariants: ['T195C', 'G16274A', 'G16291A', 'C16287T'],
    positions: [195, 16274, 16291, 16287],
    origin: 'Europe',
    timeEstimate: '12,000 years ago',
    description: 'Found in Europe.',
  },
  'K2b': {
    haplogroup: 'K2b',
    parent: 'K2',
    definingVariants: ['T195C', 'G16274A', 'G16291A', 'C5231A'],
    positions: [195, 16274, 16291, 5231],
    origin: 'Near East',
    timeEstimate: '12,000 years ago',
    description: 'Found in the Near East and Europe.',
  },
  'P': {
    haplogroup: 'P',
    parent: 'R',
    definingVariants: ['A15607G'],
    positions: [15607],
    origin: 'Southeast Asia/Oceania',
    timeEstimate: '35,000 years ago',
    description: 'Found in Southeast Asia, New Guinea, and the Americas.',
  },
  'T': {
    haplogroup: 'T',
    parent: 'R',
    definingVariants: ['G709A', 'G1888A', 'A4917G', 'G8697A', 'G10463A', 'G13368A'],
    positions: [709, 1888, 4917, 8697, 10463, 13368],
    origin: 'Near East',
    timeEstimate: '25,000 years ago',
    description: 'Found in the Near East, Europe, and East Africa.',
  },
  'T1': {
    haplogroup: 'T1',
    parent: 'T',
    definingVariants: ['G1888A', 'G8697A', 'G13368A', 'G14905A', 'G15928A', 'C12633A'],
    positions: [1888, 8697, 13368, 14905, 15928, 12633],
    origin: 'Near East/Europe',
    timeEstimate: '15,000 years ago',
    description: 'Found in Europe and the Near East.',
  },
  'T2': {
    haplogroup: 'T2',
    parent: 'T',
    definingVariants: ['G1888A', 'C16296T', 'G8697A', 'G13368A', 'G14905A', 'G15928A'],
    positions: [1888, 16296, 8697, 13368, 14905, 15928],
    origin: 'Near East/Europe',
    timeEstimate: '15,000 years ago',
    description: 'Found in Europe and the Near East.',
  },
  'U': {
    haplogroup: 'U',
    parent: 'R',
    definingVariants: ['A11467G', 'A12308G', 'G12372A'],
    positions: [11467, 12308, 12372],
    origin: 'West Eurasia',
    timeEstimate: '50,000 years ago',
    description: 'A diverse haplogroup found throughout Europe, North Africa, the Near East, and Central Asia.',
  },
  'U1': {
    haplogroup: 'U1',
    parent: 'U',
    definingVariants: ['A11467G', 'A12308G', 'G12372A', 'C16179T'],
    positions: [11467, 12308, 12372, 16179],
    origin: 'Near East',
    timeEstimate: '35,000 years ago',
    description: 'Found in the Near East and Mediterranean.',
  },
  'U2': {
    haplogroup: 'U2',
    parent: 'U',
    definingVariants: ['A11467G', 'A12308G', 'G12372A', 'C3731T'],
    positions: [11467, 12308, 12372, 3731],
    origin: 'South Asia',
    timeEstimate: '40,000 years ago',
    description: 'Found in South Asia and at low frequency in Europe.',
  },
  'U2e': {
    haplogroup: 'U2e',
    parent: 'U2',
    definingVariants: ['A1811G', 'A11467G', 'A12308G', 'G12372A', 'C3731T'],
    positions: [1811, 11467, 12308, 12372, 3731],
    origin: 'Europe',
    timeEstimate: '20,000 years ago',
    description: 'Found in Europe.',
  },
  'U3': {
    haplogroup: 'U3',
    parent: 'U',
    definingVariants: ['A11467G', 'A12308G', 'G12372A', 'T5655C', 'C9540T'],
    positions: [11467, 12308, 12372, 5655, 9540],
    origin: 'Near East',
    timeEstimate: '30,000 years ago',
    description: 'Found in the Near East, North Africa, and Europe.',
  },
  'U4': {
    haplogroup: 'U4',
    parent: 'U',
    definingVariants: ['A11467G', 'A12308G', 'G12372A', 'C6045T', 'G9266A', 'T13020C'],
    positions: [11467, 12308, 12372, 6045, 9266, 13020],
    origin: 'West Eurasia',
    timeEstimate: '25,000 years ago',
    description: 'Found in Central Asia, Eastern Europe, and Scandinavia.',
  },
  'U5': {
    haplogroup: 'U5',
    parent: 'U',
    definingVariants: ['A11467G', 'A12308G', 'G12372A', 'C3197T', 'G9477A', 'A13617G'],
    positions: [11467, 12308, 12372, 3197, 9477, 13617],
    origin: 'Europe',
    timeEstimate: '25,000 - 20,000 years ago',
    description: 'The most common haplogroup U subclade in Europe, associated with hunter-gatherer populations.',
  },
  'U5a': {
    haplogroup: 'U5a',
    parent: 'U5',
    definingVariants: ['A14793G', 'A11467G', 'A12308G', 'G12372A', 'C3197T', 'G9477A', 'A13617G'],
    positions: [14793, 11467, 12308, 12372, 3197, 9477, 13617],
    origin: 'Europe',
    timeEstimate: '20,000 years ago',
    description: 'Found throughout Europe, particularly in Eastern Europe and Scandinavia.',
  },
  'U5a1': {
    haplogroup: 'U5a1',
    parent: 'U5a',
    definingVariants: ['A14793G', 'G16270A', 'A11467G', 'A12308G', 'G12372A', 'C3197T', 'G9477A', 'A13617G'],
    positions: [14793, 16270, 11467, 12308, 12372, 3197, 9477, 13617],
    origin: 'Europe',
    timeEstimate: '15,000 years ago',
    description: 'Common in Northern and Eastern Europe.',
  },
  'U5a1a': {
    haplogroup: 'U5a1a',
    parent: 'U5a1',
    definingVariants: ['A14793G', 'G16270A', 'A11467G', 'A12308G', 'G12372A', 'C3197T', 'G9477A', 'A13617G', 'C16192T'],
    positions: [14793, 16270, 11467, 12308, 12372, 3197, 9477, 13617, 16192],
    origin: 'Europe',
    timeEstimate: '10,000 years ago',
    description: 'Very common in Northern Europe.',
  },
  'U5b': {
    haplogroup: 'U5b',
    parent: 'U5',
    definingVariants: ['C150T', 'A11467G', 'A12308G', 'G12372A', 'C3197T', 'G9477A', 'A13617G'],
    positions: [150, 11467, 12308, 12372, 3197, 9477, 13617],
    origin: 'Europe',
    timeEstimate: '20,000 years ago',
    description: 'Found throughout Europe, particularly in Western Europe.',
  },
  'U5b1': {
    haplogroup: 'U5b1',
    parent: 'U5b',
    definingVariants: ['C150T', 'G4551A', 'A11467G', 'A12308G', 'G12372A', 'C3197T', 'G9477A', 'A13617G'],
    positions: [150, 4551, 11467, 12308, 12372, 3197, 9477, 13617],
    origin: 'Western Europe',
    timeEstimate: '15,000 years ago',
    description: 'Common in Iberia and Western Europe.',
  },
  'U5b2': {
    haplogroup: 'U5b2',
    parent: 'U5b',
    definingVariants: ['C150T', 'G17219A', 'A11467G', 'A12308G', 'G12372A', 'C3197T', 'G9477A', 'A13617G'],
    positions: [150, 17219, 11467, 12308, 12372, 3197, 9477, 13617],
    origin: 'Europe',
    timeEstimate: '15,000 years ago',
    description: 'Found throughout Europe.',
  },
  'U6': {
    haplogroup: 'U6',
    parent: 'U',
    definingVariants: ['A11467G', 'A12308G', 'G12372A', 'C3348T', 'G3721A', 'T14178C', 'G14364C'],
    positions: [11467, 12308, 12372, 3348, 3721, 14178, 14364],
    origin: 'North Africa',
    timeEstimate: '35,000 years ago',
    description: 'Found primarily in North Africa, particularly among Berber populations.',
  },
  'U7': {
    haplogroup: 'U7',
    parent: 'U',
    definingVariants: ['A11467G', 'A12308G', 'G12372A', 'T5511C', 'G13105A', 'G16051A'],
    positions: [11467, 12308, 12372, 5511, 13105, 16051],
    origin: 'Near East/South Asia',
    timeEstimate: '30,000 years ago',
    description: 'Found in the Near East, South Asia, and Central Asia.',
  },
  'U8': {
    haplogroup: 'U8',
    parent: 'U',
    definingVariants: ['A11467G', 'A12308G', 'G12372A', 'T9698C', 'C16256T'],
    positions: [11467, 12308, 12372, 9698, 16256],
    origin: 'West Eurasia',
    timeEstimate: '40,000 years ago',
    description: 'Ancestral to K and U8a, U8b.',
  },
  'U9': {
    haplogroup: 'U9',
    parent: 'U',
    definingVariants: ['A11467G', 'A12308G', 'G12372A', 'G199A', 'G6023A', 'T6381C', 'C16234T'],
    positions: [11467, 12308, 12372, 199, 6023, 6381, 16234],
    origin: 'South Asia/Middle East',
    timeEstimate: '30,000 years ago',
    description: 'Found in South Asia and the Middle East.',
  },
};


// ============================================================================
// Y-DNA SNP TO HAPLOGROUP MAPPING
// ============================================================================

export const YDNA_SNP_MAP: Record<string, string[]> = {
  'M91': ['A'], 'P97': ['A'],
  'M60': ['B'], 'M181': ['B'],
  'M168': ['CT'], 'M294': ['CT'],
  'P143': ['CF'],
  'M1': ['DE'], 'YAP': ['DE'], 'M145': ['DE'],
  'M174': ['D'], 'M215': ['E1b1b'],
  'M96': ['E'], 'M40': ['E'],
  'M2': ['E1b1a'], 'M180': ['E1b1a1'],
  'M35': ['E1b1b1'], 'M78': ['E1b1b1a'],
  'V12': ['E1b1b1a1'], 'V13': ['E1b1b1a2'], 'V22': ['E1b1b1a3'],
  'M81': ['E1b1b1b'],
  'M123': ['E1b1b1c'],
  'M130': ['C'], 'M216': ['C'],
  'M217': ['C2'],
  'M48': ['C2a'], 'P39': ['C2b'],
  'M201': ['G'],
  'P287': ['G2'], 'M406': ['G2a'],
  'M69': ['H'],
  'M82': ['H1'],
  'M170': ['I'],
  'M253': ['I1'],
  'M438': ['I2'], 'P37.2': ['I2a'], 'M223': ['I2b'],
  'M304': ['J'],
  'M267': ['J1'],
  'M172': ['J2'],
  'M410': ['J2a'], 'M12': ['J2b'],
  'M9': ['K'],
  'M526': ['K2'],
  'M231': ['N'],
  'M46': ['N1c'], 'Tat': ['N1c'],
  'M175': ['O'],
  'M119': ['O1'], 'M268': ['O1b'],
  'M122': ['O2'],
  'M324': ['O2a'],
  'M45': ['P'],
  'M207': ['R'],
  'M173': ['R1'],
  'M420': ['R1a'], 'M17': ['R1a1a'],
  'M343': ['R1b'], 'M269': ['R1b1a2'],
  'L23': ['R1b1a2a'], 'L51': ['R1b1a2b'],
  'U106': ['R1b1a2b1a'], 'P312': ['R1b1a2b1b'],
  'L21': ['R1b1a2b1b3'],
  'U152': ['R1b1a2b1b2'],
  'DF27': ['R1b1a2b1b1'],
  'M124': ['R2'],
  'M70': ['T'],
};

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Determine Y-DNA haplogroup from user's SNPs
 */
export function determineYHaplogroup(snps: SNP[], hasYChromosome: boolean = true): YHaplogroupResult | undefined {
  if (!hasYChromosome) {
    return undefined;
  }

  const detectedSnps: string[] = [];
  const snpMap = new Map(snps.map(s => [s.rsid.toLowerCase(), s.genotype]));
  
  for (const [snpId, haplogroups] of Object.entries(YDNA_SNP_MAP)) {
    const genotype = snpMap.get(snpId.toLowerCase());
    if (genotype && genotype !== '--' && genotype.length === 1) {
      detectedSnps.push(snpId);
    }
  }

  if (detectedSnps.length === 0) {
    return {
      haplogroup: 'Unknown',
      name: 'Y Haplogroup Unknown',
      description: 'No Y-chromosome haplogroup-defining SNPs were detected in your data. This may be due to limited Y-chromosome coverage.',
      origin: 'Unknown',
      timeDepth: 'Unknown',
      migrationPath: 'Unknown',
      definingSnps: [],
      confidence: 'very_low',
    };
  }

  let bestHaplogroup = 'A';
  let maxScore = 0;

  for (const [haplogroupId, definition] of Object.entries(Y_HAPLOGROUPS)) {
    const matchingSnps = definition.definingSnps.filter(snp => 
      detectedSnps.some(ds => ds.toLowerCase() === snp.toLowerCase())
    );
    const score = matchingSnps.length * (1 + haplogroupId.length * 0.1);
    if (score > maxScore) {
      maxScore = score;
      bestHaplogroup = haplogroupId;
    }
  }

  const definition = Y_HAPLOGROUPS[bestHaplogroup];
  if (!definition) {
    return undefined;
  }

  const confidence = maxScore >= 3 ? 'high' : maxScore >= 1 ? 'medium' : 'low';

  return {
    haplogroup: definition.haplogroup,
    name: `${definition.haplogroup} Haplogroup`,
    description: definition.description,
    origin: definition.origin,
    timeDepth: definition.timeEstimate,
    migrationPath: getYMigrationPath(definition.haplogroup),
    definingSnps: detectedSnps,
    confidence,
    subclade: definition.parent || undefined,
    notableMembers: getNotableYMembers(definition.haplogroup),
  };
}

/**
 * Determine mtDNA haplogroup from user's SNPs
 */
export function determineMtHaplogroup(snps: SNP[]): MtHaplogroupResult {
  const detectedVariants: string[] = [];
  const snpMap = new Map<string, string>();
  
  for (const snp of snps) {
    if (snp.chromosome === 'MT' || snp.chromosome === 'M' || snp.chromosome === '26') {
      snpMap.set(snp.position.toString(), snp.genotype);
      snpMap.set(snp.rsid.toLowerCase(), snp.genotype);
    }
  }

  for (const [haplogroupId, definition] of Object.entries(MT_HAPLOGROUPS)) {
    const matchingPositions = definition.positions.filter(pos => {
      const genotype = snpMap.get(pos.toString());
      return genotype && genotype !== '--';
    });
    if (matchingPositions.length > 0) {
      detectedVariants.push(...matchingPositions.map(p => mtPositionToHGVS(p)));
    }
  }

  let bestHaplogroup = 'H';
  let maxScore = 0;

  for (const [haplogroupId, definition] of Object.entries(MT_HAPLOGROUPS)) {
    const matchingVariants = definition.positions.filter(pos => {
      const genotype = snpMap.get(pos.toString());
      return genotype && genotype !== '--';
    });
    const score = matchingVariants.length * (1 + haplogroupId.length * 0.05);
    if (score > maxScore) {
      maxScore = score;
      bestHaplogroup = haplogroupId;
    }
  }

  const definition = MT_HAPLOGROUPS[bestHaplogroup] || MT_HAPLOGROUPS['H'];
  const confidence = maxScore >= 5 ? 'high' : maxScore >= 2 ? 'medium' : 'low';

  return {
    haplogroup: definition.haplogroup,
    name: `Haplogroup ${definition.haplogroup}`,
    description: definition.description,
    origin: definition.origin,
    timeDepth: definition.timeEstimate,
    migrationPath: getMtMigrationPath(definition.haplogroup),
    definingVariants: detectedVariants.slice(0, 20),
    confidence,
    distribution: getMtDistribution(definition.haplogroup),
  };
}

/**
 * Convert mtDNA position to HGVS notation
 */
function mtPositionToHGVS(position: number): string {
  return `m.${position}N`;
}

/**
 * Get Y-haplogroup migration path
 */
function getYMigrationPath(haplogroup: string): string {
  const paths: Record<string, string> = {
    'A': 'Deepest roots in Africa, particularly among Khoisan peoples',
    'B': 'Central and West Africa, particularly among Pygmy populations',
    'C': 'Central Asia → Siberia → Americas and Oceania',
    'D': 'East Asia, particularly Japan and Tibet',
    'E': 'Africa → Middle East → Mediterranean',
    'E1b1a': 'West Africa → Americas',
    'E1b1b': 'North Africa → Middle East → Mediterranean Europe',
    'G': 'Middle East/Caucasus → Europe',
    'H': 'Indian subcontinent',
    'I': 'Southeast Europe → expansion across Europe',
    'I1': 'Scandinavia → Germanic expansion → Viking dispersal',
    'J': 'Middle East → Mediterranean',
    'J1': 'Arabian Peninsula → Semitic expansion',
    'J2': 'Fertile Crescent → Europe, Central Asia, South Asia',
    'L': 'South Asia',
    'N': 'East Asia → Siberia → Northern Europe',
    'O': 'East Asia → Southeast Asia → Pacific',
    'Q': 'Central Asia/Siberia → Americas',
    'R': 'Central Asia → Europe and South Asia',
    'R1a': 'Eastern Europe/Central Asia → Indo-European expansion',
    'R1b': 'Eastern Europe → Western Europe',
    'T': 'Middle East → Mediterranean',
  };

  for (const [prefix, path] of Object.entries(paths)) {
    if (haplogroup.startsWith(prefix)) {
      return path;
    }
  }
  return 'Migration path not well characterized';
}

/**
 * Get mtDNA haplogroup migration path
 */
function getMtMigrationPath(haplogroup: string): string {
  const paths: Record<string, string> = {
    'L0': 'Southern Africa (Khoisan peoples)',
    'L1': 'Central Africa',
    'L2': 'West Africa → Central Africa',
    'L3': 'East Africa → Out of Africa',
    'M': 'South Asia → East Asia → Oceania → Americas',
    'N': 'Near East → Europe, Asia, Americas',
    'A': 'East Asia/Siberia → Americas',
    'B': 'East Asia → Pacific → Americas',
    'C': 'East Asia/Siberia → Americas',
    'D': 'East Asia/Siberia → Americas',
    'H': 'Near East → Europe',
    'HV': 'Near East',
    'I': 'Near East → Europe',
    'J': 'Near East → Europe',
    'K': 'Near East → Europe',
    'T': 'Near East → Europe',
    'U': 'West Eurasia',
    'U5': 'Europe (hunter-gatherer haplogroup)',
    'V': 'Near East → Iberia/North Africa',
    'W': 'Near East → Central Asia',
    'X': 'Near East → Europe/North Africa',
  };

  for (const [prefix, path] of Object.entries(paths)) {
    if (haplogroup.startsWith(prefix)) {
      return path;
    }
  }
  return 'Migration path not well characterized';
}

/**
 * Get mtDNA haplogroup distribution
 */
function getMtDistribution(haplogroup: string): string {
  const distributions: Record<string, string> = {
    'H': 'Most common in Western Europe (~40-50%)',
    'HV': 'Found in the Near East and Mediterranean',
    'V': 'Concentrated in Iberia and among the Saami',
    'J': 'Common in the Middle East and Mediterranean Europe',
    'T': 'Found throughout Europe and the Near East',
    'U': 'Widespread across Europe, North Africa, and the Middle East',
    'U5': 'Most common in Northern and Eastern Europe',
    'U6': 'Concentrated in North Africa',
    'K': 'Found in Europe and the Near East',
    'X': 'Rare, found in Europe, North Africa, and among Native Americans',
    'I': 'Found in Europe and the Near East',
    'W': 'Found in Central Asia, the Middle East, and Eastern Europe',
    'N': 'Found across Eurasia',
    'A': 'Siberia and the Americas',
    'B': 'East Asia, Pacific, and the Americas',
    'C': 'East Asia, Siberia, and the Americas',
    'D': 'East Asia, Siberia, and the Americas',
    'M': 'Found across Asia and the Americas',
  };

  for (const [prefix, dist] of Object.entries(distributions)) {
    if (haplogroup.startsWith(prefix)) {
      return dist;
    }
  }
  return 'Distribution not well characterized';
}

/**
 * Get notable historical figures with specific Y-haplogroups
 */
function getNotableYMembers(haplogroup: string): string[] {
  const notable: Record<string, string[]> = {
    'R1b': ['King Tutankhamun (predicted)', 'Napoleon Bonaparte', 'Albert Einstein (predicted)'],
    'R1a': ['Viking remains (various)', 'Slavic historical figures'],
    'I1': ['Viking chieftains', 'Early Germanic leaders'],
    'Q': ['Some Native American chiefs', 'Genghis Khan (related lineage)'],
    'E1b1b': ['Albert Einstein (confirmed)', 'Napoleon Bonaparte (alternate theory)'],
    'J1': ['Arabic historical figures', 'Jewish Cohen priests'],
    'J2': ['Ancient Greeks and Romans', 'Ashkenazi Jewish lineages'],
    'G': ['Oetzi the Iceman', 'Neolithic European farmers'],
    'N': ['Uralic leaders', 'Siberian chieftains'],
    'O': ['Chinese emperors (various dynasties)'],
    'C': ['Mongol leaders', 'Australian Aboriginal elders'],
    'T': ['Thomas Jefferson (predicted)', 'Egyptian pharaohs (some)'],
  };

  for (const [prefix, members] of Object.entries(notable)) {
    if (haplogroup.startsWith(prefix)) {
      return members;
    }
  }
  return [];
}

/**
 * Get all Y-haplogroups for a given major group
 */
export function getYHaplogroupGroup(majorGroup: string): string[] {
  return Object.keys(Y_HAPLOGROUPS).filter(hg => hg.startsWith(majorGroup));
}

/**
 * Get all mtDNA haplogroups for a given major group
 */
export function getMtHaplogroupGroup(majorGroup: string): string[] {
  return Object.keys(MT_HAPLOGROUPS).filter(hg => hg.startsWith(majorGroup));
}

/**
 * Get parent haplogroup for a given Y-haplogroup
 */
export function getYParentHaplogroup(haplogroup: string): string | undefined {
  return Y_HAPLOGROUPS[haplogroup]?.parent;
}

/**
 * Get parent haplogroup for a given mtDNA haplogroup
 */
export function getMtParentHaplogroup(haplogroup: string): string | undefined {
  return MT_HAPLOGROUPS[haplogroup]?.parent;
}

console.log('Haplogroup data loaded:', {
  yHaplogroups: Object.keys(Y_HAPLOGROUPS).length,
  mtHaplogroups: Object.keys(MT_HAPLOGROUPS).length,
});
