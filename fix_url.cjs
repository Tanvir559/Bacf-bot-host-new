const fs = require('fs');

let content = fs.readFileSync('src/telegramBot.ts', 'utf8');

// Fix the bad replacements
content = content.replace(/url:\s*\`https:\/\/t\.me\/\$\{UPDATE_CHANNEL\.replace\('@',\s*''\),\s*icon_custom_emoji_id:\s*ID_BROADCAST\s*\}\`\s*\}/g, "url: `https://t.me/${UPDATE_CHANNEL.replace('@', '')}` }, { icon_custom_emoji_id: ID_BROADCAST }");
// Wait, the original was: { text: 'Updates Channel', url: `https://t.me/${UPDATE_CHANNEL.replace('@', '')}` }
content = content.replace(/\{\s*text:\s*'Updates Channel',\s*url:\s*\`https:\/\/t\.me\/\$\{UPDATE_CHANNEL\.replace\('@',\s*''\),\s*icon_custom_emoji_id:\s*ID_BROADCAST\s*\}\`\s*\}/g, "{ text: 'Updates Channel', url: `https://t.me/${UPDATE_CHANNEL.replace('@', '')}`, icon_custom_emoji_id: ID_BROADCAST }");

content = content.replace(/\{\s*text:\s*'Contact Developer',\s*url:\s*\`https:\/\/t\.me\/\$\{USERNAME\.replace\('@',\s*''\),\s*icon_custom_emoji_id:\s*ID_CONTACT\s*\}\`\s*\}/g, "{ text: 'Contact Developer', url: `https://t.me/${USERNAME.replace('@', '')}`, icon_custom_emoji_id: ID_CONTACT }");

fs.writeFileSync('src/telegramBot.ts', content);
