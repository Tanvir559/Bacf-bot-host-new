const fs = require('fs');

let content = fs.readFileSync('src/telegramBot.ts', 'utf8');

const idMap = {
  UPLOAD: '5453958478454341679',
  CHECK: '6311876323224592776',
  ERROR: '6312207774440759897',
  SPEED: '6311939527963319025',
  ADMIN: '6314576556278685829',
  RUNNING: '6312196946828205450',
  STOPPED: '6312019178131824009',
  BROADCAST: '6314420734865185420',
  FILE: '6314178253896555770',
  CONTACT: '5454113432284446338',
  ROCKET: '6314565157435480578',
  TRASH: '6314398126157340467',
  BATTERY: '5454125707300978880',
  HEART: '6314409378971657327',
  ID: '6314333572798881885',
  STATUS: '6314510323588013280',
  ROBOT: '5226893221191237996',
  OWNER: '5453957997418004470',
  STOP: '6314185920413179479',
  START: '6314426086394436542',
  RESTART: '6312314362644143742',
  LOGS: '6314143868388384649',
  BACK: '5253997076169115797',
  GEAR: '6311802110484684838',
  BOX: '6312301920123887895',
  CLOCK: '5373236586760651455',
  MSG: '6311845322150652183',
  USER: '6314599345375158239'
};

// First, inject the IDs into the source file
let injectedIds = '';
for (const [key, value] of Object.entries(idMap)) {
  injectedIds += `const ID_${key} = '${value}';\n`;
}

content = content.replace(/(const E_USER = .*\n)/, `$1\n${injectedIds}`);

// Now find all keyboard definitions and replace them
// { text: 'Upload File', callback_data: 'upload' }
// => { text: 'Upload File', callback_data: 'upload', icon_custom_emoji_id: ID_UPLOAD }

content = content.replace(/\{\s*text:\s*'Upload File',\s*callback_data:\s*'upload'\s*\}/g, "{ text: 'Upload File', callback_data: 'upload', icon_custom_emoji_id: ID_UPLOAD }");
content = content.replace(/\{\s*text:\s*'Check Files',\s*callback_data:\s*'check_files'\s*\}/g, "{ text: 'Check Files', callback_data: 'check_files', icon_custom_emoji_id: ID_FILE }");
content = content.replace(/\{\s*text:\s*'Bot Speed',\s*callback_data:\s*'speed'\s*\}/g, "{ text: 'Bot Speed', callback_data: 'speed', icon_custom_emoji_id: ID_SPEED }");
content = content.replace(/\{\s*text:\s*'Contact Admin',\s*url:(.*?)\}/g, "{ text: 'Contact Admin', url:$1, icon_custom_emoji_id: ID_CONTACT }");
content = content.replace(/\{\s*text:\s*'Contact Developer',\s*url:(.*?)\}/g, "{ text: 'Contact Developer', url:$1, icon_custom_emoji_id: ID_CONTACT }");
content = content.replace(/\{\s*text:\s*'Admin Panel',\s*callback_data:\s*'admin_panel'\s*\}/g, "{ text: 'Admin Panel', callback_data: 'admin_panel', icon_custom_emoji_id: ID_ADMIN }");

content = content.replace(/\{\s*text:\s*'Stop',\s*callback_data:\s*\`stop_\$\{ownerId\}_\$\{fileName\}\`\s*\}/g, "{ text: 'Stop', callback_data: `stop_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_STOP }");
content = content.replace(/\{\s*text:\s*'Restart',\s*callback_data:\s*\`restart_\$\{ownerId\}_\$\{fileName\}\`\s*\}/g, "{ text: 'Restart', callback_data: `restart_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_RESTART }");
content = content.replace(/\{\s*text:\s*'Logs',\s*callback_data:\s*\`logs_\$\{ownerId\}_\$\{fileName\}\`\s*\}/g, "{ text: 'Logs', callback_data: `logs_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_LOGS }");
content = content.replace(/\{\s*text:\s*'Delete',\s*callback_data:\s*\`delete_\$\{ownerId\}_\$\{fileName\}\`\s*\}/g, "{ text: 'Delete', callback_data: `delete_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_TRASH }");
content = content.replace(/\{\s*text:\s*'Start',\s*callback_data:\s*\`start_\$\{ownerId\}_\$\{fileName\}\`\s*\}/g, "{ text: 'Start', callback_data: `start_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_START }");
content = content.replace(/\{\s*text:\s*'View Logs',\s*callback_data:\s*\`logs_\$\{ownerId\}_\$\{fileName\}\`\s*\}/g, "{ text: 'View Logs', callback_data: `logs_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_LOGS }");
content = content.replace(/\{\s*text:\s*'Back to Files',\s*callback_data:\s*'check_files'\s*\}/g, "{ text: 'Back to Files', callback_data: 'check_files', icon_custom_emoji_id: ID_BACK }");

content = content.replace(/text:\s*\`\$\{file.file_name\}\s*\(\$\{statusText\}\)\`/g, "text: `${file.file_name} (${statusText})`, icon_custom_emoji_id: ID_ROBOT");

content = content.replace(/\{\s*text:\s*'Broadcast Message',\s*callback_data:\s*'admin_broadcast'\s*\}/g, "{ text: 'Broadcast Message', callback_data: 'admin_broadcast', icon_custom_emoji_id: ID_BROADCAST }");
content = content.replace(/\{\s*text:\s*'Active Bots List',\s*callback_data:\s*'admin_active_bots'\s*\}/g, "{ text: 'Active Bots List', callback_data: 'admin_active_bots', icon_custom_emoji_id: ID_ROBOT }");

content = content.replace(/\{\s*text:\s*'Back to Menu',\s*callback_data:\s*'back_to_main'\s*\}/g, "{ text: 'Back to Menu', callback_data: 'back_to_main', icon_custom_emoji_id: ID_BACK }");
content = content.replace(/\{\s*text:\s*'Back to Main',\s*callback_data:\s*'back_to_main'\s*\}/g, "{ text: 'Back to Main', callback_data: 'back_to_main', icon_custom_emoji_id: ID_BACK }");
content = content.replace(/\{\s*text:\s*'Back to Admin',\s*callback_data:\s*'admin_panel'\s*\}/g, "{ text: 'Back to Admin', callback_data: 'admin_panel', icon_custom_emoji_id: ID_BACK }");

content = content.replace(/text:\s*\`\$\{running.userId\}\s*\|\s*\$\{running.fileName\}\s*\(Stop\)\`/g, "text: `${running.userId} | ${running.fileName} (Stop)`, icon_custom_emoji_id: ID_USER");

// Update channel text
content = content.replace(/\{\s*text:\s*'Updates Channel',\s*url:(.*?)\}/g, "{ text: 'Updates Channel', url:$1, icon_custom_emoji_id: ID_BROADCAST }");

fs.writeFileSync('src/telegramBot.ts', content);
