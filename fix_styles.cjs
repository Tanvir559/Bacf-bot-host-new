const fs = require('fs');
let content = fs.readFileSync('src/telegramBot.ts', 'utf8');

// Inline Buttons
content = content.replace(/\{\s*text:\s*'Updates Channel',\s*url:(.*?),\s*icon_custom_emoji_id:\s*ID_BROADCAST\s*\}/g, "{ text: 'Updates Channel', url:$1, icon_custom_emoji_id: ID_BROADCAST, style: 'primary' }");

content = content.replace(/\{\s*text:\s*'Upload File',\s*callback_data:\s*'upload',\s*icon_custom_emoji_id:\s*ID_UPLOAD\s*\}/g, "{ text: 'Upload File', callback_data: 'upload', icon_custom_emoji_id: ID_UPLOAD, style: 'primary' }");
content = content.replace(/\{\s*text:\s*'Check Files',\s*callback_data:\s*'check_files',\s*icon_custom_emoji_id:\s*ID_FILE\s*\}/g, "{ text: 'Check Files', callback_data: 'check_files', icon_custom_emoji_id: ID_FILE, style: 'success' }");
content = content.replace(/\{\s*text:\s*'Bot Speed',\s*callback_data:\s*'speed',\s*icon_custom_emoji_id:\s*ID_SPEED\s*\}/g, "{ text: 'Bot Speed', callback_data: 'speed', icon_custom_emoji_id: ID_SPEED, style: 'primary' }");
content = content.replace(/\{\s*text:\s*'Contact Admin',\s*url:(.*?),\s*icon_custom_emoji_id:\s*ID_CONTACT\s*\}/g, "{ text: 'Contact Admin', url:$1, icon_custom_emoji_id: ID_CONTACT, style: 'danger' }");
content = content.replace(/\{\s*text:\s*'Admin Panel',\s*callback_data:\s*'admin_panel',\s*icon_custom_emoji_id:\s*ID_ADMIN\s*\}/g, "{ text: 'Admin Panel', callback_data: 'admin_panel', icon_custom_emoji_id: ID_ADMIN, style: 'danger' }");

content = content.replace(/\{\s*text:\s*'Stop',\s*callback_data:\s*\`stop_\$\{ownerId\}_\$\{fileName\}\`,\s*icon_custom_emoji_id:\s*ID_STOP\s*\}/g, "{ text: 'Stop', callback_data: `stop_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_STOP, style: 'danger' }");
content = content.replace(/\{\s*text:\s*'Restart',\s*callback_data:\s*\`restart_\$\{ownerId\}_\$\{fileName\}\`,\s*icon_custom_emoji_id:\s*ID_RESTART\s*\}/g, "{ text: 'Restart', callback_data: `restart_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_RESTART, style: 'success' }");
content = content.replace(/\{\s*text:\s*'Logs',\s*callback_data:\s*\`logs_\$\{ownerId\}_\$\{fileName\}\`,\s*icon_custom_emoji_id:\s*ID_LOGS\s*\}/g, "{ text: 'Logs', callback_data: `logs_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_LOGS, style: 'primary' }");
content = content.replace(/\{\s*text:\s*'Delete',\s*callback_data:\s*\`delete_\$\{ownerId\}_\$\{fileName\}\`,\s*icon_custom_emoji_id:\s*ID_TRASH\s*\}/g, "{ text: 'Delete', callback_data: `delete_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_TRASH, style: 'danger' }");
content = content.replace(/\{\s*text:\s*'Start',\s*callback_data:\s*\`start_\$\{ownerId\}_\$\{fileName\}\`,\s*icon_custom_emoji_id:\s*ID_START\s*\}/g, "{ text: 'Start', callback_data: `start_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_START, style: 'success' }");
content = content.replace(/\{\s*text:\s*'View Logs',\s*callback_data:\s*\`logs_\$\{ownerId\}_\$\{fileName\}\`,\s*icon_custom_emoji_id:\s*ID_LOGS\s*\}/g, "{ text: 'View Logs', callback_data: `logs_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_LOGS, style: 'primary' }");
content = content.replace(/\{\s*text:\s*'Back to Files',\s*callback_data:\s*'check_files',\s*icon_custom_emoji_id:\s*ID_BACK\s*\}/g, "{ text: 'Back to Files', callback_data: 'check_files', icon_custom_emoji_id: ID_BACK, style: 'primary' }");

content = content.replace(/text:\s*\`\$\{file.file_name\}\s*\(\$\{statusText\}\)\`,\s*icon_custom_emoji_id:\s*ID_ROBOT/g, "text: `${file.file_name} (${statusText})`, icon_custom_emoji_id: ID_ROBOT, style: 'primary'");

content = content.replace(/\{\s*text:\s*'Contact Developer',\s*url:(.*?),\s*icon_custom_emoji_id:\s*ID_CONTACT\s*\}/g, "{ text: 'Contact Developer', url:$1, icon_custom_emoji_id: ID_CONTACT, style: 'success' }");

content = content.replace(/\{\s*text:\s*'Broadcast Message',\s*callback_data:\s*'admin_broadcast',\s*icon_custom_emoji_id:\s*ID_BROADCAST\s*\}/g, "{ text: 'Broadcast Message', callback_data: 'admin_broadcast', icon_custom_emoji_id: ID_BROADCAST, style: 'success' }");
content = content.replace(/\{\s*text:\s*'Active Bots List',\s*callback_data:\s*'admin_active_bots',\s*icon_custom_emoji_id:\s*ID_ROBOT\s*\}/g, "{ text: 'Active Bots List', callback_data: 'admin_active_bots', icon_custom_emoji_id: ID_ROBOT, style: 'primary' }");

content = content.replace(/\{\s*text:\s*'Back to Menu',\s*callback_data:\s*'back_to_main',\s*icon_custom_emoji_id:\s*ID_BACK\s*\}/g, "{ text: 'Back to Menu', callback_data: 'back_to_main', icon_custom_emoji_id: ID_BACK, style: 'danger' }");
content = content.replace(/\{\s*text:\s*'Back to Main',\s*callback_data:\s*'back_to_main',\s*icon_custom_emoji_id:\s*ID_BACK\s*\}/g, "{ text: 'Back to Main', callback_data: 'back_to_main', icon_custom_emoji_id: ID_BACK, style: 'danger' }");
content = content.replace(/\{\s*text:\s*'Back to Admin',\s*callback_data:\s*'admin_panel',\s*icon_custom_emoji_id:\s*ID_BACK\s*\}/g, "{ text: 'Back to Admin', callback_data: 'admin_panel', icon_custom_emoji_id: ID_BACK, style: 'danger' }");

content = content.replace(/text:\s*\`\$\{running.userId\}\s*\|\s*\$\{running.fileName\}\s*\(Stop\)\`,\s*icon_custom_emoji_id:\s*ID_USER/g, "text: `${running.userId} | ${running.fileName} (Stop)`, icon_custom_emoji_id: ID_USER, style: 'danger'");

// Reply Keyboard Buttons
content = content.replace(/\{\s*text:\s*'Upload File',\s*icon_custom_emoji_id:\s*ID_UPLOAD\s*\}/g, "{ text: 'Upload File', icon_custom_emoji_id: ID_UPLOAD, style: 'primary' }");
content = content.replace(/\{\s*text:\s*'Check Files',\s*icon_custom_emoji_id:\s*ID_FILE\s*\}/g, "{ text: 'Check Files', icon_custom_emoji_id: ID_FILE, style: 'success' }");
content = content.replace(/\{\s*text:\s*'Bot Speed',\s*icon_custom_emoji_id:\s*ID_SPEED\s*\}/g, "{ text: 'Bot Speed', icon_custom_emoji_id: ID_SPEED, style: 'primary' }");
content = content.replace(/\{\s*text:\s*'Contact Admin',\s*icon_custom_emoji_id:\s*ID_CONTACT\s*\}/g, "{ text: 'Contact Admin', icon_custom_emoji_id: ID_CONTACT, style: 'danger' }");
content = content.replace(/\{\s*text:\s*'Admin Panel',\s*icon_custom_emoji_id:\s*ID_ADMIN\s*\}/g, "{ text: 'Admin Panel', icon_custom_emoji_id: ID_ADMIN, style: 'danger' }");


fs.writeFileSync('src/telegramBot.ts', content);
