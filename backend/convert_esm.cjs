const fs = require('fs');
const path = require('path');

const srcDir = 'c:/EBookFarm/backend/src';
const dirs = ['controllers', 'middlewares', 'models', 'routes'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. const { A, B } = require('path'); -> import { A, B } from 'path';
  content = content.replace(/const\s+(\{[\s\S]*?\})\s*=\s*require\((['"])(.*?)\2\);?/g, (match, vars, quote, p) => {
    let newPath = p;
    if ((p.startsWith('./') || p.startsWith('../')) && !p.endsWith('.js')) {
      newPath += '.js';
    }
    return `import ${vars} from '${newPath}';`;
  });

  // 2. const A = require('path'); -> import A from 'path';
  content = content.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*require\((['"])(.*?)\2\);?/g, (match, v, quote, p) => {
    let newPath = p;
    if ((p.startsWith('./') || p.startsWith('../')) && !p.endsWith('.js')) {
      newPath += '.js';
    }
    return `import ${v} from '${newPath}';`;
  });
  
  // 3. module.exports = A; -> export default A;
  content = content.replace(/module\.exports\s*=\s*([a-zA-Z0-9_]+);?/g, 'export default $1;');

  // 4. module.exports = { A, B }; -> export { A, B };
  content = content.replace(/module\.exports\s*=\s*(\{[\s\S]*?\});?/g, 'export $1;');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Converted:', filePath);
  }
}

for (const dir of dirs) {
  const fullPath = path.join(srcDir, dir);
  if (fs.existsSync(fullPath)) {
    const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      processFile(path.join(fullPath, file));
    }
  }
}
console.log('Done converting files to ESM!');
