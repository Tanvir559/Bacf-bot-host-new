const fs = require('fs');
let content = fs.readFileSync('src/telegramBot.ts', 'utf8');

// Also handle the backtick ones
content = content.replace(/\{\s*text:\s*\`Upload File\`,\s*callback_data:\s*'upload'\s*\}/g, "{ text: 'Upload File', callback_data: 'upload', icon_custom_emoji_id: ID_UPLOAD }");
content = content.replace(/\{\s*text:\s*\`Check Files\`,\s*callback_data:\s*'check_files'\s*\}/g, "{ text: 'Check Files', callback_data: 'check_files', icon_custom_emoji_id: ID_FILE }");
content = content.replace(/\{\s*text:\s*\`Bot Speed\`,\s*callback_data:\s*'speed'\s*\}/g, "{ text: 'Bot Speed', callback_data: 'speed', icon_custom_emoji_id: ID_SPEED }");
content = content.replace(/\{\s*text:\s*\`Contact Admin\`,\s*url:(.*?)\}/g, "{ text: 'Contact Admin', url:$1, icon_custom_emoji_id: ID_CONTACT }");
content = content.replace(/\{\s*text:\s*\`Admin Panel\`,\s*callback_data:\s*'admin_panel'\s*\}/g, "{ text: 'Admin Panel', callback_data: 'admin_panel', icon_custom_emoji_id: ID_ADMIN }");

fs.writeFileSync('src/telegramBot.ts', content);
