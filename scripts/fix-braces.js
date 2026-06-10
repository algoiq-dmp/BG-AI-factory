const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/app/(app)');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;

      // Fix double braces issue: content={\s*\{([^}]+)\}\s*}
      // Basically, if we have content={ {something} }, we want content={something}
      const fixRegex = /content=\{\s*\{([^}]+)\}\s*\}/g;
      if (fixRegex.test(content)) {
        content = content.replace(fixRegex, 'content={$1}');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed', fullPath);
      }
    }
  }
}

processDirectory(dir);
console.log('Done!');
