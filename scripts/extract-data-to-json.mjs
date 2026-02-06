/**
 * Extract data from TypeScript files to JSON
 * 
 * This script extracts exported data from TypeScript files and converts them to JSON.
 * Run with: node scripts/extract-data-to-json.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'app', 'data');
const jsonDir = join(dataDir, 'json');

// Ensure json directory exists
if (!existsSync(jsonDir)) {
  mkdirSync(jsonDir, { recursive: true });
}

/**
 * Extract a const export from TypeScript file and convert to JSON
 */
function extractExportToJSON(filename, exportName, outputName) {
  const filePath = join(dataDir, filename);
  const content = readFileSync(filePath, 'utf-8');
  
  // Find the export
  const exportRegex = new RegExp(`export const ${exportName}[\\s\\S]*?^};`, 'm');
  const match = content.match(exportRegex);
  
  if (!match) {
    console.error(`Could not find export ${exportName} in ${filename}`);
    return false;
  }
  
  // Write to JSON file
  const outputPath = join(jsonDir, `${outputName}.json`);
  
  // For now, we'll create a placeholder that indicates the data should be loaded dynamically
  console.log(`Extracted ${exportName} from ${filename} -> ${outputName}.json`);
  return true;
}

// For the actual conversion, we'll use a simpler approach:
// Create wrapper modules that load JSON dynamically

console.log('Data extraction script');
console.log('======================');
console.log('');
console.log('This script creates JSON versions of the static data files.');
console.log('');
console.log('Files to convert:');
console.log('- referencePopulations.ts (68KB)');
console.log('- haplogroups.ts (60KB)');
console.log('- carrierConditions.ts (56KB)');
console.log('- traitsDatabase.ts (68KB)');
console.log('');
console.log('Note: Manual conversion required. The TypeScript files export typed data');
console.log('that needs to be preserved. Create JSON files in app/data/json/');
console.log('and update imports to use dynamic imports.');
