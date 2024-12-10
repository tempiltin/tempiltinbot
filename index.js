require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const User = require('./models/User');
const handleContact = require('./handlers/contactHandler');
const handleCurrencyQuery = require('./handlers/currencyHandler');
const handlePrayerQuery = require('./handlers/prayerHandler');
const { checkMembership } = require('./utils/channelUtils');
const { getMainMenu, getSubscriptionKeyboard, getPhoneKeyboard } = require('./utils/keyboards');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const channelId = process.env.CHANNEL_ID;
const channelNumericId = process.env.CHANNELNUMERICID;

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  autoIndex: true
}).then(() => {
  console.log("MongoDB muvofaqiyatli ulandi");
}).catch((err) => {
  console.error("MongoDB bilan bog'lanishda xatolik:", err);
});

bot.on('contact', msg => handleContact(bot, msg, channelNumericId));

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    let user = await User.findOne({ userId: userId.toString() });

    if (user) {
      if (!user.phone) {
        bot.sendMessage(chatId, "Sizning telefon raqamingiz bazada mavjud emas. Iltimos, telefon raqamingizni yuboring.", 
          getPhoneKeyboard());
      } else {
        const isMember = await checkMembership(bot, channelNumericId, userId);
        if (isMember) {
          bot.sendMessage(chatId, "Siz botdan foydalanishingiz mumkin!", getMainMenu());
        } else {
          bot.sendMessage(chatId, "Siz kanalni tark etdingiz. Botdan foydalanish uchun qayta obuna bo'ling.", 
            getSubscriptionKeyboard(channelId));
        }
      }
    } else {
      bot.sendMessage(chatId, "Botdan foydalanish uchun kanalimizga obuna bo'ling:", 
        getSubscriptionKeyboard(channelId));
    }
  } catch (error) {
    console.error("Start komandasi xatoligi:", error);
    bot.sendMessage(chatId, "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
  }
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  try {
    if (query.data === 'check_subscription') {
      const isMember = await checkMembership(bot, channelNumericId, userId);
      if (isMember) {
        bot.sendMessage(chatId, "Siz kanalga obuna bo'lgansiz. Iltimos, telefon raqamingizni yuboring.", 
          getPhoneKeyboard());
      } else {
        bot.sendMessage(chatId, "Siz hali kanalga obuna bo'lmadingiz. Iltimos, obuna bo'ling!", 
          getSubscriptionKeyboard(channelId));
      }
    } else if (query.data === 'currency_rates' || query.data.match(/^[A-Z]{3}$/)) {
      await handleCurrencyQuery(bot, query);
    } else if (query.data === 'prayer_times' || query.data.startsWith('region_')) {
      await handlePrayerQuery(bot, query);
    }
  } catch (error) {
    console.error("Callback query error:", error);
    bot.sendMessage(chatId, "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
  }
});