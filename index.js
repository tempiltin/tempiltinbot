require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const handleContact = require('./handlers/contactHandler');
const handleCurrencyQuery = require('./handlers/currencyHandler');
const handlePrayerQuery = require('./handlers/prayerHandler');
const handleStartCommand = require('./handlers/startHandler');

const token = process.env.BOT_TOKEN;
const channelId = process.env.CHANNEL_ID;
const channelNumericId = process.env.CHANNELNUMERICID;

// Initialize bot with polling having set webhook to false
const bot = new TelegramBot(token, {
  polling: {
    params: {
      timeout: 50,
      allowed_updates: ['message', 'callback_query']
    }
  },
  webhook: false
});

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  autoIndex: true
}).then(() => {
  console.log("MongoDB muvofaqiyatli ulandi");
}).catch((err) => {
  console.error("MongoDB bilan bog'lanishda xatolik:", err);
});

// Handle /start command
bot.onText(/\/start/, (msg) => handleStartCommand(bot, msg, channelId, channelNumericId));

// Handle contact sharing
bot.on('contact', (msg) => handleContact(bot, msg, channelNumericId));

// Handle callback queries
bot.on('callback_query', async (query) => {
  if (query.data === 'currency_rates' || query.data.match(/^[A-Z]{3}$/)) {
    await handleCurrencyQuery(bot, query);
  } else if (query.data === 'prayer_times' || query.data.startsWith('region_')) {
    await handlePrayerQuery(bot, query);
  }
});