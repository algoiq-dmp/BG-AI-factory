const fs = require('fs');
const content = fs.readFileSync('legacy_app.js', 'utf8');

// Find anything that looks like id: `...` or "...", name: `...` or "...", prompt: `...` or "..."
// The legacy app is minified, so we can try to find the prompt property first, then walk backward to find id and name.
const prompts = [];
const promptRegex = /prompt:\s*\`([\s\S]*?)\`/g;
let match;
while ((match = promptRegex.exec(content)) !== null) {
  const promptText = match[1];
  // grab 200 chars before this to find id and name
  const before = content.substring(Math.max(0, match.index - 200), match.index);
  
  let id = "unknown";
  let name = "unknown";
  
  const idMatch = before.match(/id:\s*[\`\'\"]([^\`\'\"]+)[\`\'\"]/);
  if (idMatch) id = idMatch[1];
  
  const nameMatch = before.match(/name:\s*[\`\'\"]([^\`\'\"]+)[\`\'\"]/);
  if (nameMatch) name = nameMatch[1];
  else {
    const labelMatch = before.match(/label:\s*[\`\'\"]([^\`\'\"]+)[\`\'\"]/);
    if (labelMatch) name = labelMatch[1];
  }

  prompts.push({ id, name, prompt: promptText });
}

fs.writeFileSync('extracted_prompts.json', JSON.stringify(prompts, null, 2));
