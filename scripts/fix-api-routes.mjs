import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

const files = globSync('app/routes/api/**/*.ts');

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  let modified = false;
  
  // Remove import of json from @tanstack/start
  if (content.includes("import { json } from '@tanstack/start'") || 
      content.includes('import { json } from "@tanstack/start"')) {
    content = content.replace(/import\s*\{\s*json\s*\}\s*from\s*['"]@tanstack\/start['"];?\n?/g, '');
    modified = true;
  }
  
  // Also handle imports with multiple items including json
  if (content.includes("from '@tanstack/start'") || content.includes('from "@tanstack/start"')) {
    // Replace json() calls with Response.json()
    content = content.replace(/\bjson\(/g, 'Response.json(');
    modified = true;
  }
  
  if (modified) {
    writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
  }
}

console.log('Done!');
