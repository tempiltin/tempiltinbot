const User = require('../models/User');
const { checkMembership } = require('../utils/channelUtils');
const { getMainMenu, getPhoneKeyboard, getSubscriptionKeyboard } = require('../utils/keyboards');

async function handleStartCommand(bot, msg, channelId, channelNumericId) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    let user = await User.findOne({ userId: userId.toString() });

    if (user) {
      if (!user.phone) {
        await bot.sendMessage(
          chatId, 
          "Sizning telefon raqamingiz bazada mavjud emas. Iltimos, telefon raqamingizni yuboring.", 
          getPhoneKeyboard()
        );
      } else {
        const isMember = await checkMembership(bot, channelNumericId, userId);
        if (isMember) {
          await bot.sendMessage(
            chatId, 
            "Siz botdan foydalanishingiz mumkin!", 
            getMainMenu()
          );
        } else {
          await bot.sendMessage(
            chatId, 
            "Siz kanalni tark etdingiz. Botdan foydalanish uchun qayta obuna bo'ling.", 
            getSubscriptionKeyboard(channelId)
          );
        }
      }
    } else {
      await bot.sendMessage(
        chatId, 
        "Botdan foydalanish uchun kanalimizga obuna bo'ling:", 
        getSubscriptionKeyboard(channelId)
      );
    }
  } catch (error) {
    console.error("Start command error:", error);
    await bot.sendMessage(
      chatId, 
      "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
    );
  }
}

module.exports = handleStartCommand;