const fs = require('fs');

let content = fs.readFileSync('src/telegramBot.ts', 'utf8');

const P_EMOJIS = {
  ERROR: '<tg-emoji emoji-id="6188343249791358585">❌</tg-emoji>',
  CHECK: '<tg-emoji emoji-id="6188038822509418008">✅</tg-emoji>',
  STAR: '<tg-emoji emoji-id="6183661284467152997">⭐</tg-emoji>',
  SPARKLE: '<tg-emoji emoji-id="6089245735658722965">✨</tg-emoji>',
  FIRE: '<tg-emoji emoji-id="6260156941226480954">🔥</tg-emoji>',
  ROCKET: '<tg-emoji emoji-id="6185915377793374304">🔜</tg-emoji>', // using soon arrow or maybe there's a better one? 
  LIGHTNING: '<tg-emoji emoji-id="6183978600945947836">⚡</tg-emoji>',
  CROWN: '<tg-emoji emoji-id="6109401652106630836">👑</tg-emoji>',
  HEART: '<tg-emoji emoji-id="6185719454270231467">❤</tg-emoji>',
  HEART_FIRE: '<tg-emoji emoji-id="6109348016555038383">❤️🔥</tg-emoji>',
  MONEY: '<tg-emoji emoji-id="6185701917918763252">💸</tg-emoji>',
  DIAMOND: '<tg-emoji emoji-id="6233302765582424442">💎</tg-emoji>',
  SKULL: '<tg-emoji emoji-id="6190253496625796044">💀</tg-emoji>',
  TROPHY: '<tg-emoji emoji-id="6235422679835350879">🏆</tg-emoji>',
  PIN: '<tg-emoji emoji-id="6111410240807245099">📌</tg-emoji>',
  NINJA: '<tg-emoji emoji-id="6233527959307688784">🥷</tg-emoji>',
  HUNDRED: '<tg-emoji emoji-id="6233437704864929299">💯</tg-emoji>',
  PARTY: '<tg-emoji emoji-id="6235612354181080084">🥳</tg-emoji>',
  DEVIL: '<tg-emoji emoji-id="6260265754222924781">😈</tg-emoji>',
  COOL: '<tg-emoji emoji-id="6183958126836848002">😎</tg-emoji>',
  CALENDAR: '<tg-emoji emoji-id="6336848409839801489">🗓</tg-emoji>',
  GEAR: '<tg-emoji emoji-id="6089346083274626176">✨</tg-emoji>', // fallback to sparkle
  TARGET: '<tg-emoji emoji-id="6109432142079466939">🎯</tg-emoji>',
  MEGAPHONE: '<tg-emoji emoji-id="6188038212624062387">📣</tg-emoji>'
};

// Insert emojis definitions if they don't exist
let emojiDefs = '';
for (const [key, val] of Object.entries(P_EMOJIS)) {
  emojiDefs += `const P_${key} = '${val}';\n`;
}

content = content.replace(/(const ID_USER = .*?\n)/, `$1\n${emojiDefs}`);

// Replace strings
content = content.replace(/bot\.sendMessage\(chatId, \`Bot is currently locked/g, "bot.sendMessage(chatId, `${P_ERROR} Bot is currently locked");
content = content.replace(/bot\.sendMessage\(chatId, \`<b>Limit Reached!<\/b>\\nYou have already uploaded/g, "bot.sendMessage(chatId, `${P_ERROR} <b>Limit Reached!</b>\\n${P_PIN} You have already uploaded");
content = content.replace(/bot\.sendMessage\(chatId, \`Please send your Python/g, "bot.sendMessage(chatId, `${P_STAR} Please send your Python");
content = content.replace(/bot\.sendMessage\(chatId, \`You don't have any uploaded bots yet/g, "bot.sendMessage(chatId, `${P_ERROR} You don't have any uploaded bots yet");
content = content.replace(/bot\.sendMessage\(chatId, \`<b>Your Hosted Bots:<\/b>\\nClick/g, "bot.sendMessage(chatId, `${P_FIRE} <b>Your Hosted Bots:</b>\\n${P_PIN} Click");
content = content.replace(/bot\.sendMessage\(chatId, \`Testing ping response speed\.\.\.\`\)/g, "bot.sendMessage(chatId, `${P_LIGHTNING} Testing ping response speed...`)");
content = content.replace(/bot\.editMessageText\(\`<b>Response Speed:<\/b>/g, "bot.editMessageText(`${P_LIGHTNING} <b>Response Speed:</b>");
content = content.replace(/bot\.sendMessage\(chatId, \`Click below to chat directly/g, "bot.sendMessage(chatId, `${P_COOL} Click below to chat directly");
content = content.replace(/bot\.sendMessage\(chatId, \`<b>Upgraded Admin Control Room<\/b>\\n\\nManage global/g, "bot.sendMessage(chatId, `${P_CROWN} <b>Upgraded Admin Control Room</b>\\n\\n${P_STAR} Manage global");
content = content.replace(/bot\.sendMessage\(chatId, \`You are not authorized/g, "bot.sendMessage(chatId, `${P_ERROR} You are not authorized");
content = content.replace(/bot\.sendMessage\(chatId, \`<b>Limit Reached!<\/b>\\nYou have already reached/g, "bot.sendMessage(chatId, `${P_ERROR} <b>Limit Reached!</b>\\n${P_PIN} You have already reached");
content = content.replace(/bot\.sendMessage\(chatId, \`Invalid file upload\.\`/g, "bot.sendMessage(chatId, `${P_ERROR} Invalid file upload.`");
content = content.replace(/bot\.sendMessage\(chatId, \`Unsupported file type!/g, "bot.sendMessage(chatId, `${P_ERROR} Unsupported file type!");
content = content.replace(/bot\.sendMessage\(chatId, \`Downloading <code>/g, "bot.sendMessage(chatId, `${P_STAR} Downloading <code>");
content = content.replace(/bot\.sendMessage\(chatId, \`Extracting ZIP/g, "bot.sendMessage(chatId, `${P_FIRE} Extracting ZIP");
content = content.replace(/bot\.sendMessage\(chatId, \`No executable script/g, "bot.sendMessage(chatId, `${P_ERROR} No executable script");
content = content.replace(/bot\.sendMessage\(chatId, \`ZIP project extracted successfully!\\nDetected main entry/g, "bot.sendMessage(chatId, `${P_CHECK} ZIP project extracted successfully!\\n${P_TARGET} Detected main entry");
content = content.replace(/bot\.sendMessage\(chatId, \`<b>\$\{entryPoint\}<\/b> is now running/g, "bot.sendMessage(chatId, `${P_LIGHTNING} <b>${entryPoint}</b> is now running");
content = content.replace(/bot\.sendMessage\(chatId, \`File saved successfully!\\nLaunching/g, "bot.sendMessage(chatId, `${P_CHECK} File saved successfully!\\n${P_ROCKET} Launching");
content = content.replace(/bot\.sendMessage\(chatId, \`<b>\$\{fileName\}<\/b> is now running/g, "bot.sendMessage(chatId, `${P_LIGHTNING} <b>${fileName}</b> is now running");
content = content.replace(/bot\.sendMessage\(chatId, \`Error processing your file/g, "bot.sendMessage(chatId, `${P_ERROR} Error processing your file");
content = content.replace(/bot\.sendMessage\(chatId, \`Bot <code>\$\{fileName\}<\/b> has been started/g, "bot.sendMessage(chatId, `${P_CHECK} Bot <code>${fileName}</code> has been started");
content = content.replace(/bot\.sendMessage\(chatId, \`Failed to start bot/g, "bot.sendMessage(chatId, `${P_ERROR} Failed to start bot");
content = content.replace(/bot\.sendMessage\(chatId, \`Bot <code>\$\{fileName\}<\/code> has been stopped/g, "bot.sendMessage(chatId, `${P_ERROR} Bot <code>${fileName}</code> has been stopped");
content = content.replace(/bot\.sendMessage\(chatId, \`Bot <code>\$\{fileName\}<\/code> has been restarted/g, "bot.sendMessage(chatId, `${P_CHECK} Bot <code>${fileName}</code> has been restarted");
content = content.replace(/bot\.sendMessage\(chatId, \`Restart failed:/g, "bot.sendMessage(chatId, `${P_ERROR} Restart failed:");
content = content.replace(/bot\.sendMessage\(chatId, \`Deletion error:/g, "bot.sendMessage(chatId, `${P_ERROR} Deletion error:");
content = content.replace(/bot\.sendMessage\(chatId, \`<b>Console Output/g, "bot.sendMessage(chatId, `${P_STAR} <b>Console Output");
content = content.replace(/bot\.sendMessage\(chatId, \`Please type your broadcast/g, "bot.sendMessage(chatId, `${P_MEGAPHONE} Please type your broadcast");
content = content.replace(/bot\.sendMessage\(chatId, 'Broadcast cancelled\.'/g, "bot.sendMessage(chatId, `${P_ERROR} Broadcast cancelled.`");
content = content.replace(/bot\.sendMessage\(chatId, \`Broadcast must be text\.\`/g, "bot.sendMessage(chatId, `${P_ERROR} Broadcast must be text.`");
content = content.replace(/bot\.sendMessage\(chatId, \`Sending broadcast to/g, "bot.sendMessage(chatId, `${P_ROCKET} Sending broadcast to");
content = content.replace(/bot\.sendMessage\(chatId, \`Broadcast completed successfully!/g, "bot.sendMessage(chatId, `${P_CHECK} Broadcast completed successfully!");

content = content.replace(/bot\.editMessageText\(\`<b>Control Panel for:<\/b>/g, "bot.editMessageText(`${P_GEAR} <b>Control Panel for:</b>");

content = content.replace(/\`<b>Access Denied<\/b>\\n\\nWelcome/g, "`${P_ERROR} <b>Access Denied</b>\\n\\n${P_NINJA} Welcome");
content = content.replace(/\`Welcome, <b>\$\{firstName\}<\/b>!\\n\\n\` \+/g, "`${P_HEART_FIRE} Welcome, <b>${firstName}</b>!\\n\\n` +");
content = content.replace(/\`Your User ID:/g, "`${P_ID} Your User ID:");
content = content.replace(/\`Your Status:/g, "`${P_STAR} Your Status:");
content = content.replace(/\`Bot Hosting Limit:/g, "`${P_DIAMOND} Bot Hosting Limit:");
content = content.replace(/\`You can host & run/g, "`${P_FIRE} You can host & run");
content = content.replace(/\`Use the buttons below to control/g, "`${P_PIN} Use the buttons below to control");

content = content.replace(/const ID_ = '<tg-emoji.*?\n/g, ""); // cleanup if any

fs.writeFileSync('src/telegramBot.ts', content);
