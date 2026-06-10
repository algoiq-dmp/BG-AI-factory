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

      // Catch any pre that renders AI output
      const genericPreRegex = /<pre className="p-\d+ text-xs font-mono text-\[#a0b0c0\]( max-h-\[\d+px\])?( overflow-y-auto)? whitespace-pre-wrap( custom-scrollbar)?( leading-relaxed)?">([\s\S]*?)<\/pre>/g;
      
      if (genericPreRegex.test(content)) {
        content = content.replace(genericPreRegex, '<div className="h-[400px] bg-[#0b0e14] border-t border-[#1e2532]"><MarkdownViewer content={$5} /></div>');
        modified = true;
      }

      if (modified) {
        if (!content.includes("import { MarkdownViewer }")) {
           content = content.replace(/(import .* from 'react';)/, "$1\nimport { MarkdownViewer } from '@/components/ui/MarkdownViewer';");
        }
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}

processDirectory(dir);
console.log('Done!');
