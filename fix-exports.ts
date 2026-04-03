import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'src/pages/customer-hub');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx') && file !== 'HubMain.tsx') {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const compName = file.replace('.tsx', '');
    content = content.replace(`function ${compName}()`, `export default function ${compName}()`);
    fs.writeFileSync(filePath, content);
  }
});
console.log('Export added');
