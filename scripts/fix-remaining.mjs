import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

// Fix 1: Replace validateGenomeData calls with correct signature
const files = globSync('app/routes/api/**/*.ts');

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  let modified = false;
  
  // Fix validateGenomeData destructuring
  if (content.includes('const { valid, error, status } = validateGenomeData')) {
    content = content.replace(
      /const \{ valid, error, status \} = validateGenomeData\(content, 'strict'\)/g,
      `const validationResult = validateGenomeData(content)\n      const valid = validationResult.valid\n      const error = validationResult.error\n      const status = validationResult.status`
    );
    modified = true;
  }
  
  // Fix csrfProtection calls
  if (content.includes('csrfProtection(request, request.headers.get(\'cookie\'))')) {
    content = content.replace(/csrfProtection\(request, request\.headers\.get\('cookie'\)\)/g, 'csrfProtection(request)');
    modified = true;
  }
  
  if (modified) {
    writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
  }
}

console.log('Done!');
