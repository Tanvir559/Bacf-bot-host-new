const fs = require('fs');
let content = fs.readFileSync('src/telegramBot.ts', 'utf8');

content = content.replace(/\{\s*text:\s*'Contact Admin',\s*url:\s*\`https:\/\/t\.me\/\$\{USERNAME\.replace\('@',\s*''\),\s*icon_custom_emoji_id:\s*ID_CONTACT\s*\}\`\s*\}/g, "{ text: 'Contact Admin', url: `https://t.me/${USERNAME.replace('@', '')}`, icon_custom_emoji_id: ID_CONTACT }");

fs.writeFileSync('src/telegramBot.ts', content);
