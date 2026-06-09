const fs = require('fs'); const txt = fs.readFileSync('reference.js', 'utf8'); console.log(txt.substring(txt.indexOf('7-phase')-100, txt.indexOf('7-phase')+200));
