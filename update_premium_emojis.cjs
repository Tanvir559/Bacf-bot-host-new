const fs = require('fs');

let content = fs.readFileSync('src/telegramBot.ts', 'utf8');

const P_EMOJIS2 = {
  THUMBSUP: '<tg-emoji emoji-id="6183943695746732556">👍</tg-emoji>',
  SMILE: '<tg-emoji emoji-id="6186170065059058057">🙂</tg-emoji>',
  DIZZY: '<tg-emoji emoji-id="6185739709335998839">💫</tg-emoji>',
  CAT: '<tg-emoji emoji-id="6183997331298325247">😽</tg-emoji>',
  DUCK: '<tg-emoji emoji-id="6186020952384475802">🦆</tg-emoji>',
  OWL: '<tg-emoji emoji-id="6186045884669628967">🦉</tg-emoji>',
  BLUSH: '<tg-emoji emoji-id="6183512317821457841">😊</tg-emoji>',
  RICH: '<tg-emoji emoji-id="6186175669991379791">🤑</tg-emoji>',
  FIREWORKS: '<tg-emoji emoji-id="6183456844023862509">🎆</tg-emoji>',
  HEART_EYES: '<tg-emoji emoji-id="6186026132115034887">😍</tg-emoji>',
  TREX: '<tg-emoji emoji-id="6186233896863011865">🦖</tg-emoji>',
  LEAF: '<tg-emoji emoji-id="6186176846812418718">🍂</tg-emoji>',
  LADYBUG: '<tg-emoji emoji-id="6185942006590608576">🐞</tg-emoji>',
  KNIFE: '<tg-emoji emoji-id="6188087407179470181">🔪</tg-emoji>',
  YUM: '<tg-emoji emoji-id="6188420095346217764">😋</tg-emoji>',
  SHINING_STAR: '<tg-emoji emoji-id="6188404727953232658">🌟</tg-emoji>',
  PICTURE: '<tg-emoji emoji-id="6188447235244562676">🖼</tg-emoji>',
  CRY: '<tg-emoji emoji-id="6188347695082509858">😭</tg-emoji>',
  GIFT: '<tg-emoji emoji-id="6188464883265181261">🎁</tg-emoji>',
  PRAY: '<tg-emoji emoji-id="6188221998569624607">🙏</tg-emoji>',
  STAR_STRUCK: '<tg-emoji emoji-id="6190477479170282300">🤩</tg-emoji>',
  DOWN: '<tg-emoji emoji-id="6233317712068613378">⬇️</tg-emoji>',
  RIGHT: '<tg-emoji emoji-id="6233035687336089620">➡️</tg-emoji>',
  PANDA: '<tg-emoji emoji-id="6233287728901921071">🐼</tg-emoji>',
  CHECK_MARK: '<tg-emoji emoji-id="6233153665792742268">✔</tg-emoji>',
  SAD: '<tg-emoji emoji-id="6233136657722251031">😞</tg-emoji>',
  SWEAT: '<tg-emoji emoji-id="6260478625687018336">😓</tg-emoji>',
  LIP: '<tg-emoji emoji-id="6260073653220675991">🫦</tg-emoji>',
  PLAY: '<tg-emoji emoji-id="6260390956814573101">▶️</tg-emoji>',
  SMILEY: '<tg-emoji emoji-id="6260540279942550766">😃</tg-emoji>',
  LAUGH: '<tg-emoji emoji-id="6266847228963329610">😂</tg-emoji>',
  HERO: '<tg-emoji emoji-id="6269279310029265574">🦸</tg-emoji>',
  THUMBSDOWN: '<tg-emoji emoji-id="6337081879967044997">👎</tg-emoji>',
  BOLT: '<tg-emoji emoji-id="6337107731375199009">⚡️</tg-emoji>',
  EYE: '<tg-emoji emoji-id="6336887317948536124">👁</tg-emoji>',
  DRINK: '<tg-emoji emoji-id="6337057364293719177">🍸</tg-emoji>',
  SMOKE: '<tg-emoji emoji-id="6109170716010091984">🚬</tg-emoji>',
  STONE: '<tg-emoji emoji-id="6109238713932323725">🗿</tg-emoji>',
  SKULL2: '<tg-emoji emoji-id="6109451886044124125">☠️</tg-emoji>',
  UP: '<tg-emoji emoji-id="6111443144551699001">👆</tg-emoji>',
  FEATHER: '<tg-emoji emoji-id="6109275865399432385">🪶</tg-emoji>',
  BIRD: '<tg-emoji emoji-id="6109491532887235167">🐦</tg-emoji>',
  CLOWN: '<tg-emoji emoji-id="6109353007307037236">🤡</tg-emoji>',
  LION: '<tg-emoji emoji-id="6109269040696400224">🦁</tg-emoji>',
  SPEECHLESS: '<tg-emoji emoji-id="6109210444457581233">😶</tg-emoji>',
  MIC: '<tg-emoji emoji-id="6109651730872408665">🎤</tg-emoji>'
};

// Insert emojis definitions if they don't exist
let emojiDefs = '';
for (const [key, val] of Object.entries(P_EMOJIS2)) {
  if (!content.includes(`const P_${key} =`)) {
    emojiDefs += `const P_${key} = '${val}';\n`;
  }
}

if (emojiDefs.length > 0) {
  content = content.replace(/(const P_MEGAPHONE = .*?\n)/, `$1${emojiDefs}`);
}

// Enhance some strings to use the new emojis for premium feel
content = content.replace(/\$\{P_NINJA\}/g, "${P_SKULL2}"); // Change ninja to skull2 for access denied
content = content.replace(/\$\{P_LIGHTNING\} Testing ping/g, "${P_BOLT} Testing ping"); // Use new bolt
content = content.replace(/\$\{P_ROCKET\} Launching bot/g, "${P_HERO} Launching bot"); // Superhero!
content = content.replace(/\$\{P_PIN\} Click on any bot/g, "${P_DOWN} Click on any bot"); // Down arrow
content = content.replace(/\$\{P_TARGET\} Detected main entry/g, "${P_EYE} Detected main entry"); 
content = content.replace(/\$\{P_CHECK\} File saved successfully!/g, "${P_SHINING_STAR} File saved successfully!"); 
content = content.replace(/Bot is currently locked by the administrator\./g, "Bot is currently locked by the administrator. ${P_SAD}"); 
content = content.replace(/\$\{P_ROCKET\} Sending broadcast to/g, "${P_FIREWORKS} Sending broadcast to");
content = content.replace(/\$\{P_CHECK\} Broadcast completed successfully!/g, "${P_THUMBSUP} Broadcast completed successfully!");
content = content.replace(/Subscription required\./g, "${P_RICH} Subscription required.");

fs.writeFileSync('src/telegramBot.ts', content);
