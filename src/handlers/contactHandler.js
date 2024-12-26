import { User } from '../models/User.js';

export const handleContact = async (bot, msg) => {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const contact = msg.contact;

    if (!contact || contact.user_id !== userId) {
      return bot.sendMessage(chatId, "Iltimos, o'z telefon raqamingizni yuboring!");
    }

    let user = await User.findOne({ userId: userId.toString() });
    
    if (!user) {
      user = new User({
        userId: userId.toString(),
        username: msg.from.username || "No username",
        phone: contact.phone_number
      });
    } else {
      user.phone = contact.phone_number;
    }

    await user.save();

    const mainMenu = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Tempiltinga habar yuborish 👨🏻‍💻", url: "https://t.me/tempiltin" }],
          [{ text: "Tempiltin websaytini ochish🌐", url: "https://tempiltin.uz" }],
          [{ text: "Portfolio 💼", url: "https://telegra.ph/Portfolio-Tempiltin-12-07" }],
          [{ text: "Valuta kurslari 🏦", callback_data: 'currency_rates' }],
          [{ text: "Nomoz vaqtlari 🕒", callback_data: 'prayer_times' }]
        ]
      }
    };

    await bot.sendMessage(chatId, "Telefon raqamingiz muvaffaqiyatli saqlandi!", mainMenu);
  } catch (error) {
    console.error('Contact handling error:', error);
    await bot.sendMessage(chatId, "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
  }
};