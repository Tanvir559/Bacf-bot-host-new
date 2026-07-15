const fs = require('fs');
let content = fs.readFileSync('src/telegramBot.ts', 'utf8');

// 1. Ensure all bot.sendMessage have { parse_mode: 'HTML' } if they contain P_
content = content.replace(/bot\.sendMessage\(chatId, (.*?P_.*?)(\);)/g, "bot.sendMessage(chatId, $1, { parse_mode: 'HTML' });");

// Replace targetId sends as well
content = content.replace(/bot\.sendMessage\(targetId, (.*?P_.*?)(\);)/g, "bot.sendMessage(targetId, $1, { parse_mode: 'HTML' });");

// 2. Fix tg-emoji content to be exactly ONE simple emoji to avoid ENTITY_TEXT_INVALID
// A simple fallback like 🟢 or ✨ is safe and won't throw ENTITY_TEXT_INVALID for multi-character emojis
content = content.replace(/<tg-emoji emoji-id="(\d+)">.*?<\/tg-emoji>/g, '<tg-emoji emoji-id="$1">✨</tg-emoji>');

fs.writeFileSync('src/telegramBot.ts', content);
