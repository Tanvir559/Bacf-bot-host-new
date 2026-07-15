import TelegramBot, {
  Message,
  User,
  ReplyKeyboardMarkup,
  InlineKeyboardMarkup,
  InlineKeyboardButton,
  KeyboardButton
} from 'node-telegram-bot-api';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import { db, UserFile } from './db';
import { processManager, getUserFolder } from './processManager';

// Configuration
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8755268927:AAGLB1HbtiuQOtZosnzvOWWAW44nZfgy_sU';
const OWNER_ID = 6845602766;
const UPDATE_CHANNEL = '@tanvirtechhub';
const USERNAME = '@abdtanvir';

// Instantiate Telegram Bot
let bot: TelegramBot;

try {
  bot = new TelegramBot(TOKEN, { polling: true });
  console.log('Telegram Bot polling started successfully.');
} catch (err) {
  console.error('Error starting Telegram Bot:', err);
  // Create a dummy bot so server doesn't crash
  bot = new TelegramBot('123456:dummy-token', { polling: false });
}

// Emoji definitions mapped to premium HTML tags
const E_UPLOAD = '<tg-emoji emoji-id="5453958478454341679">✨</tg-emoji>';
const E_CHECK = '<tg-emoji emoji-id="6311876323224592776">✨</tg-emoji>';
const E_ERROR = '<tg-emoji emoji-id="6312207774440759897">✨</tg-emoji>';
const E_SPEED = '<tg-emoji emoji-id="6311939527963319025">✨</tg-emoji>';
const E_ADMIN = '<tg-emoji emoji-id="6314576556278685829">✨</tg-emoji>';
const E_RUNNING = '<tg-emoji emoji-id="6312196946828205450">✨</tg-emoji>';
const E_STOPPED = '<tg-emoji emoji-id="6312019178131824009">✨</tg-emoji>';
const E_BROADCAST = '<tg-emoji emoji-id="6314420734865185420">✨</tg-emoji>';
const E_FILE = '<tg-emoji emoji-id="6314178253896555770">✨</tg-emoji>';
const E_CONTACT = '<tg-emoji emoji-id="5454113432284446338">✨</tg-emoji>';
const E_ROCKET = '<tg-emoji emoji-id="6314565157435480578">✨</tg-emoji>';
const E_TRASH = '<tg-emoji emoji-id="6314398126157340467">✨</tg-emoji>';
const E_BATTERY = '<tg-emoji emoji-id="5454125707300978880">✨</tg-emoji>';
const E_HEART = '<tg-emoji emoji-id="6314409378971657327">✨</tg-emoji>';

const E_ID = '<tg-emoji emoji-id="6314333572798881885">✨</tg-emoji>';
const E_STATUS = '<tg-emoji emoji-id="6314510323588013280">✨</tg-emoji>';
const E_ROBOT = '<tg-emoji emoji-id="5226893221191237996">✨</tg-emoji>';
const E_OWNER = '<tg-emoji emoji-id="5453957997418004470">✨</tg-emoji>';
const E_STOP = '<tg-emoji emoji-id="6314185920413179479">✨</tg-emoji>';
const E_START = '<tg-emoji emoji-id="6314426086394436542">✨</tg-emoji>';
const E_RESTART = '<tg-emoji emoji-id="6312314362644143742">✨</tg-emoji>';
const E_LOGS = '<tg-emoji emoji-id="6314143868388384649">✨</tg-emoji>';
const E_BACK = '<tg-emoji emoji-id="5253997076169115797">✨</tg-emoji>';
const E_GEAR = '<tg-emoji emoji-id="6311802110484684838">✨</tg-emoji>';
const E_BOX = '<tg-emoji emoji-id="6312301920123887895">✨</tg-emoji>';
const E_CLOCK = '<tg-emoji emoji-id="5373236586760651455">✨</tg-emoji>';
const E_MSG = '<tg-emoji emoji-id="6311845322150652183">✨</tg-emoji>';
const E_USER = '<tg-emoji emoji-id="6314599345375158239">✨</tg-emoji>';

const ID_UPLOAD = '5453958478454341679';
const ID_CHECK = '6311876323224592776';
const ID_ERROR = '6312207774440759897';
const ID_SPEED = '6311939527963319025';
const ID_ADMIN = '6314576556278685829';
const ID_RUNNING = '6312196946828205450';
const ID_STOPPED = '6312019178131824009';
const ID_BROADCAST = '6314420734865185420';
const ID_FILE = '6314178253896555770';
const ID_CONTACT = '5454113432284446338';
const ID_ROCKET = '6314565157435480578';
const ID_TRASH = '6314398126157340467';
const ID_BATTERY = '5454125707300978880';
const ID_HEART = '6314409378971657327';
const ID_ID = '6314333572798881885';
const ID_STATUS = '6314510323588013280';
const ID_ROBOT = '5226893221191237996';
const ID_OWNER = '5453957997418004470';
const ID_STOP = '6314185920413179479';
const ID_START = '6314426086394436542';
const ID_RESTART = '6312314362644143742';
const ID_LOGS = '6314143868388384649';
const ID_BACK = '5253997076169115797';
const ID_GEAR = '6311802110484684838';
const ID_BOX = '6312301920123887895';
const ID_CLOCK = '5373236586760651455';
const ID_MSG = '6311845322150652183';
const ID_USER = '6314599345375158239';

const P_ERROR = '<tg-emoji emoji-id="6188343249791358585">✨</tg-emoji>';
const P_ID = '<tg-emoji emoji-id="6314333572798881885">✨</tg-emoji>';
const P_CHECK = '<tg-emoji emoji-id="6188038822509418008">✨</tg-emoji>';
const P_STAR = '<tg-emoji emoji-id="6183661284467152997">✨</tg-emoji>';
const P_SPARKLE = '<tg-emoji emoji-id="6089245735658722965">✨</tg-emoji>';
const P_FIRE = '<tg-emoji emoji-id="6260156941226480954">✨</tg-emoji>';
const P_ROCKET = '<tg-emoji emoji-id="6185915377793374304">✨</tg-emoji>';
const P_LIGHTNING = '<tg-emoji emoji-id="6183978600945947836">✨</tg-emoji>';
const P_CROWN = '<tg-emoji emoji-id="6109401652106630836">✨</tg-emoji>';
const P_HEART = '<tg-emoji emoji-id="6185719454270231467">✨</tg-emoji>';
const P_HEART_FIRE = '<tg-emoji emoji-id="6109348016555038383">✨</tg-emoji>';
const P_MONEY = '<tg-emoji emoji-id="6185701917918763252">✨</tg-emoji>';
const P_DIAMOND = '<tg-emoji emoji-id="6233302765582424442">✨</tg-emoji>';
const P_SKULL = '<tg-emoji emoji-id="6190253496625796044">✨</tg-emoji>';
const P_TROPHY = '<tg-emoji emoji-id="6235422679835350879">✨</tg-emoji>';
const P_PIN = '<tg-emoji emoji-id="6111410240807245099">✨</tg-emoji>';
const P_NINJA = '<tg-emoji emoji-id="6233527959307688784">✨</tg-emoji>';
const P_HUNDRED = '<tg-emoji emoji-id="6233437704864929299">✨</tg-emoji>';
const P_PARTY = '<tg-emoji emoji-id="6235612354181080084">✨</tg-emoji>';
const P_DEVIL = '<tg-emoji emoji-id="6260265754222924781">✨</tg-emoji>';
const P_COOL = '<tg-emoji emoji-id="6183958126836848002">✨</tg-emoji>';
const P_CALENDAR = '<tg-emoji emoji-id="6336848409839801489">✨</tg-emoji>';
const P_GEAR = '<tg-emoji emoji-id="6089346083274626176">✨</tg-emoji>';
const P_TARGET = '<tg-emoji emoji-id="6109432142079466939">✨</tg-emoji>';
const P_MEGAPHONE = '<tg-emoji emoji-id="6188038212624062387">✨</tg-emoji>';
const P_THUMBSUP = '<tg-emoji emoji-id="6183943695746732556">✨</tg-emoji>';
const P_SMILE = '<tg-emoji emoji-id="6186170065059058057">✨</tg-emoji>';
const P_DIZZY = '<tg-emoji emoji-id="6185739709335998839">✨</tg-emoji>';
const P_CAT = '<tg-emoji emoji-id="6183997331298325247">✨</tg-emoji>';
const P_DUCK = '<tg-emoji emoji-id="6186020952384475802">✨</tg-emoji>';
const P_OWL = '<tg-emoji emoji-id="6186045884669628967">✨</tg-emoji>';
const P_BLUSH = '<tg-emoji emoji-id="6183512317821457841">✨</tg-emoji>';
const P_RICH = '<tg-emoji emoji-id="6186175669991379791">✨</tg-emoji>';
const P_FIREWORKS = '<tg-emoji emoji-id="6183456844023862509">✨</tg-emoji>';
const P_HEART_EYES = '<tg-emoji emoji-id="6186026132115034887">✨</tg-emoji>';
const P_TREX = '<tg-emoji emoji-id="6186233896863011865">✨</tg-emoji>';
const P_LEAF = '<tg-emoji emoji-id="6186176846812418718">✨</tg-emoji>';
const P_LADYBUG = '<tg-emoji emoji-id="6185942006590608576">✨</tg-emoji>';
const P_KNIFE = '<tg-emoji emoji-id="6188087407179470181">✨</tg-emoji>';
const P_YUM = '<tg-emoji emoji-id="6188420095346217764">✨</tg-emoji>';
const P_SHINING_STAR = '<tg-emoji emoji-id="6188404727953232658">✨</tg-emoji>';
const P_PICTURE = '<tg-emoji emoji-id="6188447235244562676">✨</tg-emoji>';
const P_CRY = '<tg-emoji emoji-id="6188347695082509858">✨</tg-emoji>';
const P_GIFT = '<tg-emoji emoji-id="6188464883265181261">✨</tg-emoji>';
const P_PRAY = '<tg-emoji emoji-id="6188221998569624607">✨</tg-emoji>';
const P_STAR_STRUCK = '<tg-emoji emoji-id="6190477479170282300">✨</tg-emoji>';
const P_DOWN = '<tg-emoji emoji-id="6233317712068613378">✨</tg-emoji>';
const P_RIGHT = '<tg-emoji emoji-id="6233035687336089620">✨</tg-emoji>';
const P_PANDA = '<tg-emoji emoji-id="6233287728901921071">✨</tg-emoji>';
const P_CHECK_MARK = '<tg-emoji emoji-id="6233153665792742268">✨</tg-emoji>';
const P_SAD = '<tg-emoji emoji-id="6233136657722251031">✨</tg-emoji>';
const P_SWEAT = '<tg-emoji emoji-id="6260478625687018336">✨</tg-emoji>';
const P_LIP = '<tg-emoji emoji-id="6260073653220675991">✨</tg-emoji>';
const P_PLAY = '<tg-emoji emoji-id="6260390956814573101">✨</tg-emoji>';
const P_SMILEY = '<tg-emoji emoji-id="6260540279942550766">✨</tg-emoji>';
const P_LAUGH = '<tg-emoji emoji-id="6266847228963329610">✨</tg-emoji>';
const P_HERO = '<tg-emoji emoji-id="6269279310029265574">✨</tg-emoji>';
const P_THUMBSDOWN = '<tg-emoji emoji-id="6337081879967044997">✨</tg-emoji>';
const P_BOLT = '<tg-emoji emoji-id="6337107731375199009">✨</tg-emoji>';
const P_EYE = '<tg-emoji emoji-id="6336887317948536124">✨</tg-emoji>';
const P_DRINK = '<tg-emoji emoji-id="6337057364293719177">✨</tg-emoji>';
const P_SMOKE = '<tg-emoji emoji-id="6109170716010091984">✨</tg-emoji>';
const P_STONE = '<tg-emoji emoji-id="6109238713932323725">✨</tg-emoji>';
const P_SKULL2 = '<tg-emoji emoji-id="6109451886044124125">✨</tg-emoji>';
const P_UP = '<tg-emoji emoji-id="6111443144551699001">✨</tg-emoji>';
const P_FEATHER = '<tg-emoji emoji-id="6109275865399432385">✨</tg-emoji>';
const P_BIRD = '<tg-emoji emoji-id="6109491532887235167">✨</tg-emoji>';
const P_CLOWN = '<tg-emoji emoji-id="6109353007307037236">✨</tg-emoji>';
const P_LION = '<tg-emoji emoji-id="6109269040696400224">✨</tg-emoji>';
const P_SPEECHLESS = '<tg-emoji emoji-id="6109210444457581233">✨</tg-emoji>';
const P_MIC = '<tg-emoji emoji-id="6109651730872408665">✨</tg-emoji>';

// Helper to check authorization
function isAuthorized(userId: number): boolean {
  if (db.isAdmin(userId) || userId === OWNER_ID) return true;
  const sub = db.getSubscription(userId);
  if (!sub) return false;
  return new Date(sub.expiry) > new Date();
}

// Helper to get limit string
function getLimitStr(userId: number): string {
  if (userId === OWNER_ID) return 'Unlimited';
  if (db.isAdmin(userId)) return '999';
  const sub = db.getSubscription(userId);
  return sub ? sub.bot_limit.toString() : '0';
}

// Next-step state tracking for simple interactive conversations in Node.js
const nextStepHandlers: Map<number, (msg: Message) => void> = new Map();

// Helper to register next step
function registerNextStep(userId: number, handler: (msg: Message) => void) {
  nextStepHandlers.set(userId, handler);
}

// Listen to messages for next step handlers
bot.on('message', (msg) => {
  const userId = msg.from?.id;
  if (userId && nextStepHandlers.has(userId)) {
    const handler = nextStepHandlers.get(userId);
    nextStepHandlers.delete(userId);
    if (handler) handler(msg);
  }
});

// Reply Keyboard layouts
function getMainMenuReplyKeyboard(userId: number): ReplyKeyboardMarkup {
  const keyboard: KeyboardButton[][] = [
    [{ text: 'Upload File', icon_custom_emoji_id: ID_UPLOAD, style: 'primary' }, { text: 'Check Files', icon_custom_emoji_id: ID_FILE, style: 'success' }],
    [{ text: 'Bot Speed', icon_custom_emoji_id: ID_SPEED, style: 'primary' }, { text: 'Contact Admin', icon_custom_emoji_id: ID_CONTACT, style: 'danger' }],
  ];

  if (db.isAdmin(userId)) {
    keyboard.push([{ text: 'Admin Panel', icon_custom_emoji_id: ID_ADMIN, style: 'danger' }]);
  }

  return {
    keyboard,
    resize_keyboard: true,
  };
}

// Inline Keyboard layouts
function getMainMenuInlineKeyboard(userId: number): InlineKeyboardMarkup {
  const inline_keyboard: InlineKeyboardButton[][] = [
    [{ text: 'Updates Channel', url: `https://t.me/${UPDATE_CHANNEL.replace('@', '')}`, icon_custom_emoji_id: ID_BROADCAST, style: 'primary' }],
    [
      { text: 'Upload File', callback_data: 'upload', icon_custom_emoji_id: ID_UPLOAD, style: 'primary' },
      { text: 'Check Files', callback_data: 'check_files', icon_custom_emoji_id: ID_FILE, style: 'success' },
    ],
    [
      { text: 'Bot Speed', callback_data: 'speed', icon_custom_emoji_id: ID_SPEED, style: 'primary' },
      { text: 'Contact Admin', url: `https://t.me/${USERNAME.replace('@', '')}`, icon_custom_emoji_id: ID_CONTACT, style: 'danger' },
    ],
  ];

  if (db.isAdmin(userId)) {
    inline_keyboard.push([
      { text: 'Admin Panel', callback_data: 'admin_panel', icon_custom_emoji_id: ID_ADMIN, style: 'danger' },
    ]);
  }

  return { inline_keyboard };
}

// Standard file control buttons
function getFileControlButtons(ownerId: number, fileName: string, isRunning: boolean): InlineKeyboardMarkup {
  const inline_keyboard: InlineKeyboardButton[][] = [];

  if (isRunning) {
    inline_keyboard.push([
      { text: 'Stop', callback_data: `stop_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_STOP, style: 'danger' },
      { text: 'Restart', callback_data: `restart_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_RESTART, style: 'success' },
    ]);
    inline_keyboard.push([
      { text: 'Logs', callback_data: `logs_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_LOGS, style: 'primary' },
      { text: 'Delete', callback_data: `delete_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_TRASH, style: 'danger' },
    ]);
  } else {
    inline_keyboard.push([
      { text: 'Start', callback_data: `start_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_START, style: 'success' },
      { text: 'Delete', callback_data: `delete_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_TRASH, style: 'danger' },
    ]);
    inline_keyboard.push([
      { text: 'View Logs', callback_data: `logs_${ownerId}_${fileName}`, icon_custom_emoji_id: ID_LOGS, style: 'primary' },
    ]);
  }

  inline_keyboard.push([
    { text: 'Back to Files', callback_data: 'check_files', icon_custom_emoji_id: ID_BACK, style: 'primary' },
  ]);

  return { inline_keyboard };
}

// Welcome command logic
function sendWelcome(chatId: number, user: User) {
  const userId = user.id;
  const firstName = user.first_name || 'User';

  if (db.isLocked() && !db.isAdmin(userId)) {
    bot.sendMessage(chatId, `${P_ERROR} Bot is currently locked by the administrator. ${P_SAD} Please try again later.`, { parse_mode: 'HTML' });
    return;
  }

  if (!isAuthorized(userId)) {
    const msgText = `${P_ERROR} <b>Access Denied</b>\n\n${P_SKULL2} Welcome, <b>${firstName}</b>!\nYou do not have an active hosting subscription.\nID: <code>${userId}</code>\n\nPlease contact the Admin to purchase a subscription.`;
    bot.sendMessage(chatId, msgText, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [[{ text: 'Contact Admin', icon_custom_emoji_id: ID_CONTACT, style: 'danger' }]],
        resize_keyboard: true,
      },
    });
    return;
  }

  // Register user as active
  db.addActiveUser(userId);

  // Stats
  const limitStr = getLimitStr(userId);
  const fileCount = db.getUserFiles(userId).length;
  let userStatus = 'Free User';
  let expiryInfo = '';

  if (userId === OWNER_ID) {
    userStatus = `Owner`;
  } else if (db.isAdmin(userId)) {
    userStatus = `Admin`;
  } else {
    const sub = db.getSubscription(userId);
    if (sub) {
      userStatus = `Premium`;
      const diffTime = Math.abs(new Date(sub.expiry).getTime() - new Date().getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expiryInfo = `\nSubscription expires in: <b>${diffDays} days</b>`;
    }
  }

  const msgText = `${P_HEART_FIRE} Welcome, <b>${firstName}</b>!\n\n` +
    `${P_ID} Your User ID: <code>${userId}</code>\n` +
    `${P_STAR} Your Status: <b>${userStatus}</b>${expiryInfo}\n` +
    `${P_DIAMOND} Bot Hosting Limit: <b>${fileCount} / ${limitStr}</b>\n\n` +
    `${P_FIRE} You can host & run Python (<code>.py</code>) or JS (<code>.js</code>) scripts persistently.\n` +
    `${P_PIN} Use the buttons below to control your hosting.`;

  bot.sendMessage(chatId, msgText, {
    parse_mode: 'HTML',
    reply_markup: getMainMenuReplyKeyboard(userId),
  });
}

// COMMAND: /start & /help
bot.onText(/\/(start|help)/, (msg) => {
  if (msg.from) {
    sendWelcome(msg.chat.id, msg.from);
  }
});

// Message handlers matching the reply keyboard
bot.on('message', (msg) => {
  const text = msg.text;
  const userId = msg.from?.id;
  const chatId = msg.chat.id;

  if (!text || !userId) return;

  // Skip commands starting with '/'
  if (text.startsWith('/')) return;

  if (text === 'Upload File') {
    handleUploadPrompt(chatId, userId);
  } else if (text === 'Check Files') {
    handleCheckFiles(chatId, userId);
  } else if (text === 'Bot Speed') {
    handleBotSpeed(chatId);
  } else if (text === 'Contact Admin') {
    handleContactAdmin(chatId);
  } else if (text === 'Admin Panel') {
    if (db.isAdmin(userId)) {
      handleAdminPanel(chatId, userId);
    }
  }
});

// Handlers for commands/buttons
function handleUploadPrompt(chatId: number, userId: number) {
  if (!isAuthorized(userId)) return;

  const files = db.getUserFiles(userId);
  const limit = getLimitStr(userId);
  const maxLimit = limit === 'Unlimited' ? Infinity : parseInt(limit, 10);

  if (files.length >= maxLimit) {
    bot.sendMessage(chatId, `${P_ERROR} <b>Limit Reached!</b>\n${P_PIN} You have already uploaded ${files.length}/${limit} files. Delete a bot before uploading another.`, { parse_mode: 'HTML' });
    return;
  }

  bot.sendMessage(chatId, `${P_STAR} Please send your Python file (<code>.py</code>), Node.js file (<code>.js</code>), or a zipped project (<code>.zip</code>) directly.`, { parse_mode: 'HTML' });
}

function handleCheckFiles(chatId: number, userId: number) {
  if (!isAuthorized(userId)) return;

  const files = db.getUserFiles(userId);
  if (files.length === 0) {
    bot.sendMessage(chatId, `${P_ERROR} You don't have any uploaded bots yet. Use <b>Upload File</b> to upload one!`, { parse_mode: 'HTML' });
    return;
  }

  const inline_keyboard: InlineKeyboardButton[][] = [];
  for (const file of files) {
    const isRunning = processManager.isBotRunning(userId, file.file_name);
    const statusText = isRunning ? '🟢 Running' : '🔴 Stopped';
    inline_keyboard.push([
      {
        text: `${file.file_name} (${statusText})`, icon_custom_emoji_id: ID_ROBOT, style: 'primary',
        callback_data: `file_${userId}_${file.file_name}`,
      },
    ]);
  }

  bot.sendMessage(chatId, `${P_FIRE} <b>Your Hosted Bots:</b>\n${P_DOWN} Click on any bot below to control it.`, {
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard },
  });
}

function handleBotSpeed(chatId: number) {
  const start = Date.now();
  bot.sendMessage(chatId, `${P_BOLT} Testing ping response speed...`).then((msg) => {
    const end = Date.now();
    const diff = end - start;
    bot.editMessageText(`${P_LIGHTNING} <b>Response Speed:</b> <code>${diff} ms</code>`, {
      chat_id: chatId,
      message_id: msg.message_id,
      parse_mode: 'HTML',
    });
  });
}

function handleContactAdmin(chatId: number) {
  bot.sendMessage(chatId, `${P_COOL} Click below to chat directly with the developer and administrator for subscriptions or support:`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Contact Developer', url: `https://t.me/${USERNAME.replace('@', '')}`, icon_custom_emoji_id: ID_CONTACT, style: 'success' }],
      ],
    },
  });
}

// UPGRADED ADMIN PANEL - Strictly showing only Broadcast & Active Bots!
function handleAdminPanel(chatId: number, userId: number) {
  if (!db.isAdmin(userId)) return;

  const inline_keyboard: InlineKeyboardButton[][] = [
    [
      { text: 'Broadcast Message', callback_data: 'admin_broadcast', icon_custom_emoji_id: ID_BROADCAST, style: 'success' },
      { text: 'Active Bots List', callback_data: 'admin_active_bots', icon_custom_emoji_id: ID_ROBOT, style: 'primary' },
    ],
  ];

  bot.sendMessage(chatId, `${P_CROWN} <b>Upgraded Admin Control Room</b>\n\n${P_STAR} Manage global broadcasts and monitor/control all running scripts on this server.`, {
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard },
  });
}

// DOCUMENT / FILE UPLOAD LISTENER
bot.on('document', async (msg) => {
  const userId = msg.from?.id;
  const chatId = msg.chat.id;

  if (!userId || !msg.document) return;

  if (!isAuthorized(userId)) {
    bot.sendMessage(chatId, `${P_ERROR} You are not authorized to upload files. Please purchase a subscription.`, { parse_mode: 'HTML' });
    return;
  }

  const files = db.getUserFiles(userId);
  const limit = getLimitStr(userId);
  const maxLimit = limit === 'Unlimited' ? Infinity : parseInt(limit, 10);

  if (files.length >= maxLimit) {
    bot.sendMessage(chatId, `${P_ERROR} <b>Limit Reached!</b>\n${P_PIN} You have already reached your file limit of ${limit}.`, { parse_mode: 'HTML' });
    return;
  }

  const doc = msg.document;
  const fileName = doc.file_name;

  if (!fileName) {
    bot.sendMessage(chatId, `${P_ERROR} Invalid file upload.`, { parse_mode: 'HTML' });
    return;
  }

  const extension = path.extname(fileName).toLowerCase();

  if (extension !== '.py' && extension !== '.js' && extension !== '.zip') {
    bot.sendMessage(chatId, `${P_ERROR} Unsupported file type! Please upload only <code>.py</code>, <code>.js</code>, or <code>.zip</code> files.`, { parse_mode: 'HTML' });
    return;
  }

  bot.sendMessage(chatId, `${P_STAR} Downloading <code>${fileName}</code>...`, { parse_mode: 'HTML' });

  try {
    const fileLink = await bot.getFileLink(doc.file_id);
    const res = await fetch(fileLink);
    const buffer = Buffer.from(await res.arrayBuffer());

    const userFolder = getUserFolder(userId);
    const destinationPath = path.join(userFolder, fileName);

    fs.writeFileSync(destinationPath, buffer);

    if (extension === '.zip') {
      bot.sendMessage(chatId, `${P_FIRE} Extracting ZIP archive...`, { parse_mode: 'HTML' });
      const zip = new AdmZip(destinationPath);
      zip.extractAllTo(userFolder, true);

      // Search for entry point file
      const extractedFiles = fs.readdirSync(userFolder);
      const possibleMainFiles = ['main.py', 'bot.py', 'app.py', 'index.js', 'main.js', 'bot.js', 'app.js'];
      let entryPoint = extractedFiles.find(f => possibleMainFiles.includes(f.toLowerCase()));

      if (!entryPoint) {
        // Fallback: pick first .py or .js
        entryPoint = extractedFiles.find(f => f.endsWith('.py') || f.endsWith('.js'));
      }

      if (!entryPoint) {
        bot.sendMessage(chatId, `${P_ERROR} No executable script (like <code>main.py</code> or <code>index.js</code>) found in your ZIP file. Extraction failed.`, { parse_mode: 'HTML' });
        // Clean up zip
        fs.unlinkSync(destinationPath);
        return;
      }

      const isJs = entryPoint.endsWith('.js');
      const fType = isJs ? 'js' : 'py';

      // Save user file reference in db
      db.saveUserFile(userId, entryPoint, fType);

      // Clean up zip archive file
      fs.unlinkSync(destinationPath);

      bot.sendMessage(chatId, `${P_CHECK} ZIP project extracted successfully!\n${P_EYE} Detected main entry point: <code>${entryPoint}</code>\nStarting bot for lifetime hosting...`, { parse_mode: 'HTML' });

      // Start running
      await processManager.startBot(userId, entryPoint, fType);
      bot.sendMessage(chatId, `${P_LIGHTNING} <b>${entryPoint}</b> is now running successfully!`, { parse_mode: 'HTML' });

    } else {
      // Normal single script file
      const fType = extension === '.js' ? 'js' : 'py';
      db.saveUserFile(userId, fileName, fType);

      bot.sendMessage(chatId, `${P_SHINING_STAR} File saved successfully!\n${P_HERO} Launching bot for lifetime hosting...`, { parse_mode: 'HTML' });

      await processManager.startBot(userId, fileName, fType);
      bot.sendMessage(chatId, `${P_LIGHTNING} <b>${fileName}</b> is now running successfully!`, { parse_mode: 'HTML' });
    }

  } catch (error) {
    console.error('File upload error:', error);
    bot.sendMessage(chatId, `${P_ERROR} Error processing your file: ${(error as Error).message}`, { parse_mode: 'HTML' });
  }
});

// CALLBACK QUERY INTERACTION ROUTING
bot.on('callback_query', async (query) => {
  const data = query.data;
  const userId = query.from.id;
  const chatId = query.message?.chat.id;
  const messageId = query.message?.message_id;

  if (!data || !chatId || !messageId) return;

  // Check authorization
  if (!isAuthorized(userId) && data !== 'speed') {
    bot.answerCallbackQuery(query.id, { text: '${P_RICH} Subscription required.', show_alert: true });
    return;
  }

  try {
    if (data === 'upload') {
      bot.answerCallbackQuery(query.id);
      handleUploadPrompt(chatId, userId);
    } else if (data === 'check_files') {
      bot.answerCallbackQuery(query.id);
      const files = db.getUserFiles(userId);
      if (files.length === 0) {
        bot.sendMessage(chatId, `${P_ERROR} You don't have any uploaded bots yet. Use <b>Upload File</b> to upload one!`, { parse_mode: 'HTML' });
        return;
      }
      const inline_keyboard: InlineKeyboardButton[][] = [];
      for (const file of files) {
        const isRunning = processManager.isBotRunning(userId, file.file_name);
        const statusText = isRunning ? '🟢 Running' : '🔴 Stopped';
        inline_keyboard.push([
          {
            text: `${file.file_name} (${statusText})`, icon_custom_emoji_id: ID_ROBOT, style: 'primary',
            callback_data: `file_${userId}_${file.file_name}`,
          },
        ]);
      }
      inline_keyboard.push([{ text: 'Back to Menu', callback_data: 'back_to_main', icon_custom_emoji_id: ID_BACK, style: 'danger' }]);
      bot.editMessageText(`<b>Your Hosted Bots:</b>\nClick on any bot below to control it.`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard },
      });

    } else if (data === 'speed') {
      bot.answerCallbackQuery(query.id);
      handleBotSpeed(chatId);

    } else if (data === 'back_to_main') {
      bot.answerCallbackQuery(query.id);
      const firstName = query.from.first_name || 'User';
      const limitStr = getLimitStr(userId);
      const fileCount = db.getUserFiles(userId).length;
      let userStatus = 'Premium';
      if (userId === OWNER_ID) userStatus = 'Owner';
      else if (db.isAdmin(userId)) userStatus = 'Admin';

      const msgText = `${P_HEART_FIRE} Welcome, <b>${firstName}</b>!\n\n` +
        `${P_ID} Your User ID: <code>${userId}</code>\n` +
        `${P_STAR} Your Status: <b>${userStatus}</b>\n` +
        `${P_DIAMOND} Bot Hosting Limit: <b>${fileCount} / ${limitStr}</b>\n\n` +
        `${P_FIRE} You can host & run Python (<code>.py</code>) or JS (<code>.js</code>) scripts persistently.\n` +
        `${P_PIN} Use the buttons below to control your hosting.`;

      bot.editMessageText(msgText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
      });

    } else if (data.startsWith('file_')) {
      bot.answerCallbackQuery(query.id);
      const parts = data.split('_');
      const ownerId = parseInt(parts[1], 10);
      const fileName = parts.slice(2).join('_');

      // SECURITY RULE MANDATED BY THE USER:
      // "but user ra only oi user der bot e delete korte parbe ba off korte onno karo bot e kisu korte parbe na"
      // Check if clicking user is owner or an admin
      if (userId !== ownerId && !db.isAdmin(userId)) {
        bot.answerCallbackQuery(query.id, {
          text: 'You can only manage your own bots!',
          show_alert: true,
        });
        return;
      }

      const isRunning = processManager.isBotRunning(ownerId, fileName);
      const statusText = isRunning ? `Running` : `Stopped`;

      bot.editMessageText(`${P_GEAR} <b>Control Panel for:</b> <code>${fileName}</code>\n` +
        `Owner ID: <code>${ownerId}</code>\n` +
        `Status: ${statusText}`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: getFileControlButtons(ownerId, fileName, isRunning),
      });

    } else if (data.startsWith('start_')) {
      const parts = data.split('_');
      const ownerId = parseInt(parts[1], 10);
      const fileName = parts.slice(2).join('_');

      if (userId !== ownerId && !db.isAdmin(userId)) {
        bot.answerCallbackQuery(query.id, { text: 'You can only control your own bots!', show_alert: true });
        return;
      }

      bot.answerCallbackQuery(query.id, { text: 'Starting bot...' });
      const files = db.getUserFiles(ownerId);
      const currentFile = files.find(f => f.file_name === fileName);

      if (currentFile) {
        try {
          await processManager.startBot(ownerId, fileName, currentFile.file_type);
          bot.sendMessage(chatId, `Bot <code>${fileName}</code> has been started for lifetime hosting.`, { parse_mode: 'HTML' });
          
          // Refresh panel
          const isRunning = processManager.isBotRunning(ownerId, fileName);
          bot.editMessageText(`${P_GEAR} <b>Control Panel for:</b> <code>${fileName}</code>\nOwner ID: <code>${ownerId}</code>\nStatus: <b>Running</b>`, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            reply_markup: getFileControlButtons(ownerId, fileName, isRunning),
          });
        } catch (err) {
          bot.sendMessage(chatId, `${P_ERROR} Failed to start bot: ${(err as Error).message}`, { parse_mode: 'HTML' });
        }
      }

    } else if (data.startsWith('stop_')) {
      const parts = data.split('_');
      const ownerId = parseInt(parts[1], 10);
      const fileName = parts.slice(2).join('_');

      if (userId !== ownerId && !db.isAdmin(userId)) {
        bot.answerCallbackQuery(query.id, { text: 'You can only control your own bots!', show_alert: true });
        return;
      }

      bot.answerCallbackQuery(query.id, { text: 'Stopping bot...' });
      processManager.stopBot(ownerId, fileName);
      bot.sendMessage(chatId, `${P_ERROR} Bot <code>${fileName}</code> has been stopped.`, { parse_mode: 'HTML' });

      // Refresh panel
      const isRunning = processManager.isBotRunning(ownerId, fileName);
      bot.editMessageText(`${P_GEAR} <b>Control Panel for:</b> <code>${fileName}</code>\nOwner ID: <code>${ownerId}</code>\nStatus: <b>Stopped</b>`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: getFileControlButtons(ownerId, fileName, isRunning),
      });

    } else if (data.startsWith('restart_')) {
      const parts = data.split('_');
      const ownerId = parseInt(parts[1], 10);
      const fileName = parts.slice(2).join('_');

      if (userId !== ownerId && !db.isAdmin(userId)) {
        bot.answerCallbackQuery(query.id, { text: 'You can only control your own bots!', show_alert: true });
        return;
      }

      bot.answerCallbackQuery(query.id, { text: 'Restarting bot...' });
      processManager.stopBot(ownerId, fileName);
      
      const files = db.getUserFiles(ownerId);
      const currentFile = files.find(f => f.file_name === fileName);

      if (currentFile) {
        setTimeout(async () => {
          try {
            await processManager.startBot(ownerId, fileName, currentFile.file_type);
            bot.sendMessage(chatId, `${P_CHECK} Bot <code>${fileName}</code> has been restarted.`, { parse_mode: 'HTML' });
            
            // Refresh panel
            const isRunning = processManager.isBotRunning(ownerId, fileName);
            bot.editMessageText(`${P_GEAR} <b>Control Panel for:</b> <code>${fileName}</code>\nOwner ID: <code>${ownerId}</code>\nStatus: <b>Running</b>`, {
              chat_id: chatId,
              message_id: messageId,
              parse_mode: 'HTML',
              reply_markup: getFileControlButtons(ownerId, fileName, isRunning),
            });
          } catch (err) {
            bot.sendMessage(chatId, `${P_ERROR} Restart failed: ${(err as Error).message}`, { parse_mode: 'HTML' });
          }
        }, 1500);
      }

    } else if (data.startsWith('delete_')) {
      const parts = data.split('_');
      const ownerId = parseInt(parts[1], 10);
      const fileName = parts.slice(2).join('_');

      if (userId !== ownerId && !db.isAdmin(userId)) {
        bot.answerCallbackQuery(query.id, { text: 'You can only delete your own bots!', show_alert: true });
        return;
      }

      bot.answerCallbackQuery(query.id, { text: 'Deleting bot...' });
      
      // Stop running process
      processManager.stopBot(ownerId, fileName);

      // Delete file and logs
      try {
        const userFolder = getUserFolder(ownerId);
        const scriptPath = path.join(userFolder, fileName);
        const logPath = path.join(userFolder, `${path.parse(fileName).name}.log`);

        if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
        if (fs.existsSync(logPath)) fs.unlinkSync(logPath);

        // Delete from DB
        db.removeUserFile(ownerId, fileName);

        bot.editMessageText(`<b>Deleted successfully!</b>\nBot <code>${fileName}</code> has been completely removed from the host.`, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: 'Back to Files', callback_data: 'check_files', icon_custom_emoji_id: ID_BACK, style: 'primary' }]],
          },
        });
      } catch (err) {
        bot.sendMessage(chatId, `${P_ERROR} Deletion error: ${(err as Error).message}`, { parse_mode: 'HTML' });
      }

    } else if (data.startsWith('logs_')) {
      bot.answerCallbackQuery(query.id);
      const parts = data.split('_');
      const ownerId = parseInt(parts[1], 10);
      const fileName = parts.slice(2).join('_');

      if (userId !== ownerId && !db.isAdmin(userId)) {
        bot.answerCallbackQuery(query.id, { text: 'Access denied!', show_alert: true });
        return;
      }

      const logs = processManager.getBotLogs(ownerId, fileName, 60);
      bot.sendMessage(chatId, `${P_STAR} <b>Console Output (Last 60 lines) for <code>${fileName}</code>:</b>\n\n<pre>${logs}</pre>`, {
        parse_mode: 'HTML',
      });

    // ADMIN CALLBACK HANDLERS (Upgraded layout actions)
    } else if (data === 'admin_panel') {
      bot.answerCallbackQuery(query.id);
      if (!db.isAdmin(userId)) return;

      const inline_keyboard: InlineKeyboardButton[][] = [
        [
          { text: 'Broadcast Message', callback_data: 'admin_broadcast', icon_custom_emoji_id: ID_BROADCAST, style: 'success' },
          { text: 'Active Bots List', callback_data: 'admin_active_bots', icon_custom_emoji_id: ID_ROBOT, style: 'primary' },
        ],
        [{ text: 'Back to Main', callback_data: 'back_to_main', icon_custom_emoji_id: ID_BACK, style: 'danger' }],
      ];

      bot.editMessageText(`<b>Upgraded Admin Control Room</b>\n\nManage global broadcasts and monitor/control all running scripts on this server.`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard },
      });

    } else if (data === 'admin_broadcast') {
      bot.answerCallbackQuery(query.id);
      if (!db.isAdmin(userId)) return;

      bot.sendMessage(chatId, `${P_MEGAPHONE} Please type your broadcast message. It will be sent to all active users on the server.\n\nType <code>/cancel</code> to abort.`, { parse_mode: 'HTML' });
      
      registerNextStep(userId, (msg) => {
        if (msg.text === '/cancel') {
          bot.sendMessage(chatId, `${P_ERROR} Broadcast cancelled.`, { parse_mode: 'HTML' });
          return;
        }
        if (!msg.text) {
          bot.sendMessage(chatId, `${P_ERROR} Broadcast must be text.`, { parse_mode: 'HTML' });
          return;
        }

        const activeUsers = db.getActiveUsers();
        let successCount = 0;

        bot.sendMessage(chatId, `${P_FIREWORKS} Sending broadcast to ${activeUsers.length} users...`, { parse_mode: 'HTML' });

        for (const targetId of activeUsers) {
          try {
            bot.sendMessage(targetId, `<b>Server BroadCast:</b>\n\n${msg.text}`, { parse_mode: 'HTML' });
            successCount++;
          } catch (e) {
            console.error(`Failed to broadcast to ${targetId}:`, e);
          }
        }

        bot.sendMessage(chatId, `${P_THUMBSUP} Broadcast completed successfully!\nSent to <b>${successCount} / ${activeUsers.length}</b> active users.`, { parse_mode: 'HTML' });
      });

    } else if (data === 'admin_active_bots') {
      bot.answerCallbackQuery(query.id);
      if (!db.isAdmin(userId)) return;

      const runningBots = processManager.getRunningBots();
      if (runningBots.length === 0) {
        bot.editMessageText(`There are currently <b>no bots running</b> across any user accounts on the server.`, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: 'Back to Admin', callback_data: 'admin_panel', icon_custom_emoji_id: ID_BACK, style: 'danger' }]],
          },
        });
        return;
      }

      const inline_keyboard: InlineKeyboardButton[][] = [];
      for (const running of runningBots) {
        inline_keyboard.push([
          {
            text: `${running.userId} | ${running.fileName} (Stop)`, icon_custom_emoji_id: ID_USER, style: 'danger',
            callback_data: `file_${running.userId}_${running.fileName}`,
          },
        ]);
      }
      inline_keyboard.push([{ text: 'Back to Admin', callback_data: 'admin_panel', icon_custom_emoji_id: ID_BACK, style: 'danger' }]);

      bot.editMessageText(`<b>All Active Running Bots:</b>\nClick on any user bot below to terminate or inspect logs.`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard },
      });
    }

  } catch (error) {
    console.error('Callback error:', error);
    bot.answerCallbackQuery(query.id, { text: `Error: ${(error as Error).message}`, show_alert: true });
  }
});
