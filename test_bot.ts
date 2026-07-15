import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || '', { polling: true });
bot.onText(/\/test/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Test message', {
    reply_markup: {
      inline_keyboard: [[
        { text: '<tg-emoji emoji-id="5453958478454341679">☝️</tg-emoji> Test', callback_data: 'test' }
      ]]
    }
  });
});
console.log('Bot started');
