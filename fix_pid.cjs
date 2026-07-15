const fs = require('fs');

let content = fs.readFileSync('src/telegramBot.ts', 'utf8');

// Ensure P_ID is defined
if (!content.includes('const P_ID =')) {
  content = content.replace(/(const P_ERROR = .*?\n)/, "$1const P_ID = '<tg-emoji emoji-id=\"6314333572798881885\">🆔</tg-emoji>';\n");
}

fs.writeFileSync('src/telegramBot.ts', content);
