const fs = require('fs');
let content = fs.readFileSync('src/telegramBot.ts', 'utf8');

// Fix duplicates: ", { parse_mode: 'HTML' }, { parse_mode: 'HTML' }" -> ", { parse_mode: 'HTML' }"
content = content.replace(/, \{ parse_mode: 'HTML' \}, \{ parse_mode: 'HTML' \}/g, ", { parse_mode: 'HTML' }");

fs.writeFileSync('src/telegramBot.ts', content);
