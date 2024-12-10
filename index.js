const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const User = require("./models/User");
require('dotenv').config();
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const channelId = process.env.CHANNEL_ID;
const channelNumericId = process.env.CHANNELNUMERICID;
const regions = [
  { name: "Toshkent", id: "Toshkent" },
  { name: "Andijon", id: "Andijon" },
  { name: "Buxoro", id: "Buxoro" },
  { name: "Jizzax", id: "Jizzax" },
  { name: "Qashqadaryo", id: "Qashqadaryo" },
  { name: "Namangan", id: "Namangan" },
  { name: "Navoiy", id: "Navoiy" },
  { name: "Nukus", id: "Nukus" },
  { name: "Samarqand", id: "Samarqand" },
  { name: "Surxondaryo", id: "Surxondaryo" },
  { name: "Sirdaryo", id: "Sirdaryo" },
  { name: "Xorazm", id: "Xorazm" },
];
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  let user = await User.findOne({ userId });

  if (user) {
    if (!user.phone) {
      bot.sendMessage(chatId, "Sizning telefon raqamingiz bazada mavjud emas. Iltimos, telefon raqamingizni yuboring.", {
        reply_markup: {
          keyboard: [[{ text: "Raqamni yuborish", request_contact: true }]],
          one_time_keyboard: true,
        },
      });
    } else {
      const res = await bot.getChatMember(channelNumericId, userId);
      const status = res.status;

      if (['member', 'administrator', 'creator'].includes(status)) {
        bot.sendMessage(chatId, "Siz botdan foydalanishingiz mumkin!", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Tempiltinga habar yuborish 👨🏻‍💻", url: "https://t.me/tempiltin" }],
              [{ text: "Tempiltin websaytini ochish🌐 ", url: "https://tempiltin.uz" }],
              [{ text: "Portfolio 💼", url: "https://telegra.ph/Portfolio-Tempiltin-12-07" }],
              [{ text: "Valuta kurslari 🏦", callback_data: 'currency_rates' }],
              [{ text: "Nomoz vaqtlari 🕒", callback_data: 'prayer_times' }]
            ]
          }
        });
      } else {
        bot.sendMessage(chatId, "Siz kanalni tark etdingiz. Botdan foydalanish uchun qayta obuna bo'ling.", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Obuna bo'lish", url: `https://t.me/${channelId}` }],
              [{ text: "Obunani tekshirish", callback_data: 'check_subscription' }],
            ],
          },
        });
      }
    }
  } else {
    bot.sendMessage(chatId, "Botdan foydalanish uchun kanalimizga obuna bo'ling:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Obuna bo'lish", url: `https://t.me/${channelId}` }],
          [{ text: "Obunani tekshirish", callback_data: 'check_subscription' }],
        ],
      },
    });
  }
});

// Callback query handler for subscription check and currency rates
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  if (query.data === 'check_subscription') {
    try {
      const res = await bot.getChatMember(channelNumericId, userId);
      const status = res.status;
      if (['member', 'administrator', 'creator'].includes(status)) {
        bot.sendMessage(chatId, "Siz kanalga obuna bo'lgansiz. Iltimos, telefon raqamingizni yuboring.", {
          reply_markup: {
            keyboard: [[{ text: "Raqamni yuborish", request_contact: true }]],
            one_time_keyboard: true,
          },
        });
      } else {
        bot.sendMessage(chatId, "Siz hali kanalga obuna bo'lmadingiz. Iltimos, obuna bo'ling!", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Obuna bo'lish", url: `https://t.me/${channelId}` }],
              [{ text: "Obunani tekshirish", callback_data: 'check_subscription' }],
            ],
          },
        });
      }
    } catch (error) {
      console.error("Error checking subscription:", error.message);
      bot.sendMessage(chatId, "Obunani tekshirishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    }
  } else if (query.data === 'currency_rates') {
    // After clicking currency rates, show options for different currencies
    bot.sendMessage(chatId, "Iltimos, kerakli valyutani tanlang:", {
      reply_markup: {
        inline_keyboard:[
          [
            { "text": "Ukraina grivnasi (UAH)", "callback_data": "UAH" },
            { "text": "AQSh dollari (USD)", "callback_data": "USD" }
          ],
          [
            { "text": "BAA dirhami (AED)", "callback_data": "AED" },
            { "text": "Avstraliya dollari (AUD)", "callback_data": "AUD" }
          ],
          [
            { "text": "Kanada dollari (CAD)", "callback_data": "CAD" },
            { "text": "Shveytsariya franki (CHF)", "callback_data": "CHF" }
          ],
          [
            { "text": "Xitoy yuani (CNY)", "callback_data": "CNY" },
            { "text": "Daniya kronasi (DKK)", "callback_data": "DKK" }
          ],
          [
            { "text": "Misr funti (EGP)", "callback_data": "EGP" },
            { "text": "Yevro (EUR)", "callback_data": "EUR" }
          ],
          [
            { "text": "Angliya funt sterlingi (GBP)", "callback_data": "GBP" },
            { "text": "Islandiya kronasi (ISK)", "callback_data": "ISK" }
          ],
          [
            { "text": "Yaponiya iyenasi (JPY)", "callback_data": "JPY" },
            { "text": "Koreya respublikasi voni (KRW)", "callback_data": "KRW" }
          ],
          [
            { "text": "Quvayt dinori (KWD)", "callback_data": "KWD" },
            { "text": "Qozog‘iston tengesi (KZT)", "callback_data": "KZT" }
          ],
          [
            { "text": "Livan funti (LBP)", "callback_data": "LBP" },
            { "text": "Malayziya ringgiti (MYR)", "callback_data": "MYR" }
          ],
          [
            { "text": "Norvegiya kronasi (NOK)", "callback_data": "NOK" },
            { "text": "Polsha zlotiysi (PLN)", "callback_data": "PLN" }
          ],
          [
            { "text": "Rossiya rubli (RUB)", "callback_data": "RUB" },
            { "text": "Shvetsiya kronasi (SEK)", "callback_data": "SEK" }
          ],
          [
            { "text": "Singapur dollari (SGD)", "callback_data": "SGD" },
            { "text": "Turkiya lirasi (TRY)", "callback_data": "TRY" }
          ],
          
        ]
      }
    });
  } else if ( [
    "AED", "AUD", "CAD", "CHF", "CNY", "DKK", "EGP", "EUR", "GBP", "ISK", 
    "JPY", "KRW", "KWD", "KZT", "LBP", "MYR", "NOK", "PLN", "RUB", "SEK", 
    "SGD", "TRY", "UAH", "USD"
  ].includes(query.data)) {
    // Fetch the currency rate based on the selected currency
    try {
      const response = await fetch('https://www.nbu.uz/uz/exchange-rates/json/');
      const data = await response.json();

      let selectedCurrency = data.find(currency => currency.code === query.data);
      if (selectedCurrency) {
        let message = `💱 *${selectedCurrency.title} (${selectedCurrency.code}) kursi:*\n\n`;
        message += `- Markaziy bank kursi: ${selectedCurrency.cb_price} so'm\n`;
        if (selectedCurrency.nbu_buy_price) {
          message += `- NBU sotib olish: ${selectedCurrency.nbu_buy_price} so'm\n`;
        }
        if (selectedCurrency.nbu_cell_price) {
          message += `- NBU sotish: ${selectedCurrency.nbu_cell_price} so'm\n`;
        }

        bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      } else {
        bot.sendMessage(chatId, `Tanlangan valyuta haqida ma'lumot topilmadi.`);
      }
    } catch (error) {
      console.error("Error fetching currency rates:", error.message);
      bot.sendMessage(chatId, "Valyuta kurslarini olishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
    }
  }
  if (query.data === 'prayer_times') {
    const regionButtons = regions.map(region => [{
      text: region.name,
      callback_data: `region_${region.id}`,
    }]);

    bot.sendMessage(chatId, "Iltimos, viloyatni tanlang:", {
      reply_markup: {
        inline_keyboard: regionButtons,
      },
    });
  } else if (query.data.startsWith('region_')) {
    const regionId = query.data.split('_')[1];
    const selectedRegion = regions.find(r => r.id === regionId);

    if (selectedRegion) {
      try {
        const response = await fetch(`https://islomapi.uz/api/present/week?region=${regionId}`);
        const data = await response.json();

        const today = new Date().getDay(); // Bugungi kun (0: Yakshanba, 1: Dushanba, ...)
        const dayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
        const todayTimes = data[today];

        let message = `📍 *${selectedRegion.name} viloyati nomoz vaqtlari:*\n\n`;
        message += `📅 *${dayNames[today]}*\n`;
        message += `- Bomdod (Saharlik): ${todayTimes.times.tong_saharlik}\n`;
        message += `- Quyosh: ${todayTimes.times.quyosh}\n`;
        message += `- Peshin: ${todayTimes.times.peshin}\n`;
        message += `- Asr: ${todayTimes.times.asr}\n`;
        message += `- Shom (Iftorlik): ${todayTimes.times.shom_iftor}\n`;
        message += `- Xufton: ${todayTimes.times.hufton}\n`;

        bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      } catch (error) {
        console.error("Error fetching prayer times:", error.message);
        bot.sendMessage(chatId, "Nomoz vaqtlarini olishda xatolik yuz berdi. Keyinroq qayta urinib ko'ring.");
      }
    }
  }
});
