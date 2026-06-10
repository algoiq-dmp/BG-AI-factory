const fs = require('fs');
const content = fs.readFileSync('legacy_app.js', 'utf8');

const regex = /id:\`([^\`]+)\`,name:\`([^\`]+)\`,emoji:\`([^\`]+)\`,color:\`([^\`]+)\`,prompt:\`([^\`]+)\`/g;
let match;
const tools = [];
while ((match = regex.exec(content)) !== null) {
  tools.push({
    id: match[1],
    name: match[2],
    prompt: match[5]
  });
}

console.log(JSON.stringify(tools, null, 2));
