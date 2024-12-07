const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const User = require("./models/User");
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const channelId = process.env.CHANNEL_ID;
const channelNumericId = process.env.CHANNELNUMERICID;

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
      }).then(() => {
        setTimeout(() => {
          // Remove any messages after the phone number is requested
          bot.deleteMessage(chatId, msg.message_id);
        }, 5000);
      });
    } else {
      const res = await bot.getChatMember(channelNumericId, userId);
      const status = res.status;

      if (['member', 'administrator', 'creator'].includes(status)) {
        bot.sendMessage(chatId, "Siz botdan foydalanishingiz mumkin!", {
            reply_markup: {
              inline_keyboard: [
                [{ text: "Tempiltinga habar yuborish", url: "https://t.me/tempiltin" }],
                [{ text: "Portfolio", url: "https://telegra.ph/Portfolio-Tempiltin-12-07" }],
                [{ text: "Tempiltin websaytini ochish", url: "https://tempiltin.uz" }]
              ]
            }}).then(() => {
          // Remove message after sending the access confirmation
          bot.deleteMessage(chatId, msg.message_id);
        });
      } else {
        bot.sendMessage(chatId, "Siz kanalni tark etdingiz. Botdan foydalanish uchun qayta obuna bo'ling.", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Obuna bo'lish", url: `https://t.me/${channelId}` }],
              [{ text: "Obunani tekshirish", callback_data: 'check_subscription' }],
            ],
          },
        }).then(() => {
          setTimeout(() => {
            // Remove any messages after checking subscription
            bot.deleteMessage(chatId, msg.message_id);
          }, 5000);
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
    }).then(() => {
      setTimeout(() => {
        bot.deleteMessage(chatId, msg.message_id); // Remove message after subscribing
      }, 5000);
    });
  }
});

// Subscription check
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
        }).then(() => {
          setTimeout(() => {
            // Remove any messages after phone number request
            bot.deleteMessage(chatId, query.message.message_id);
          }, 5000);
        });
      } else {
        bot.sendMessage(chatId, "Siz hali kanalga obuna bo'lmadingiz. Iltimos, obuna bo'ling!", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Obuna bo'lish", url: `https://t.me/${channelId}` }],
              [{ text: "Obunani tekshirish", callback_data: 'check_subscription' }],
            ],
          },
        }).then(() => {
          setTimeout(() => {
            // Remove any messages after checking subscription
            bot.deleteMessage(chatId, query.message.message_id);
          }, 5000);
        });
      }
    } catch (error) {
      console.error("Error checking subscription:", error.message);
      bot.sendMessage(chatId, "Obunani tekshirishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    }
  }
});

// Handle successful phone number submission and channel subscription
bot.on('contact', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.contact.user_id;
    const phone = msg.contact.phone_number;
    const username = msg.chat.username || "No username";
  
    try {
      let user = await User.findOne({ userId });
  
      if (user) {
        user.phone = phone || null;
        await user.save();
        bot.sendMessage(chatId, "Telefon raqamingiz muvaffaqiyatli saqlandi. Endi botdan foydalanishingiz mumkin!", {
            reply_markup: {
              inline_keyboard: [
                [{ text: "Tempiltin teamga habar yuborish", url: "https://t.me/TempiltinTeam" }],
                [{ text: "Portfolio", url: "https://telegra.ph/Portfolio-12-07-12" }],
                [{ text: "Tempiltin websaytini ochish", url: "https://tempiltin.uz" }]
              ]
            }
          }).then(() => {
            setTimeout(() => {
              bot.deleteMessage(chatId, msg.message_id); // Remove the phone number submission message
            }, 5000);
          });
          
      } else {
        user = new User({ userId, username, phone: phone || null });
        await user.save();
        bot.sendMessage(chatId, "Telefon raqamingiz muvaffaqiyatli saqlandi. Endi botdan foydalanishingiz mumkin!", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Tempiltin teamga habar yuborish", url: "https://t.me/TempiltinTeam" }],
              [{ text: "Portfolio", url: "https://tempiltin.uz/portfolio" }],
              [{ text: "Tempiltin websaytini ochish", url: "https://tempiltin.uz" }]
            ]
          }
        }).then(() => {
          setTimeout(() => {
            bot.deleteMessage(chatId, msg.message_id); // Remove the phone number submission message
          }, 5000);
        });
      }
    } catch (error) {
      console.error("Error saving phone number:", error.message);
      bot.sendMessage(chatId, "Telefon raqamingizni saqlashda xatolik yuz berdi.");
    }
  });
  