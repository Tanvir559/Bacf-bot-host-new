const fs = require('fs');
let content = fs.readFileSync('src/telegramBot.ts', 'utf8');

// Replace standard menu buttons
content = content.replace(/\{\s*text:\s*'Upload File'\s*\}/g, "{ text: 'Upload File', icon_custom_emoji_id: ID_UPLOAD }");
content = content.replace(/\{\s*text:\s*'Check Files'\s*\}/g, "{ text: 'Check Files', icon_custom_emoji_id: ID_FILE }");
content = content.replace(/\{\s*text:\s*'Bot Speed'\s*\}/g, "{ text: 'Bot Speed', icon_custom_emoji_id: ID_SPEED }");
content = content.replace(/\{\s*text:\s*'Contact Admin'\s*\}/g, "{ text: 'Contact Admin', icon_custom_emoji_id: ID_CONTACT }");
content = content.replace(/\{\s*text:\s*'Admin Panel'\s*\}/g, "{ text: 'Admin Panel', icon_custom_emoji_id: ID_ADMIN }");

fs.writeFileSync('src/telegramBot.ts', content);
